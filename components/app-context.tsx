"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase";
import * as db from "@/lib/db";
import { Profile, UserState, EMPTY_STATE } from "@/lib/types";
import { rashiLabel } from "@/lib/astro";
import { logEvent } from "@/lib/chat";

// ---------------------------------------------------------------------------
// Offline copies. Japa done in a tunnel must never vanish, and an offline
// cold start must never dump a signed-in user back into onboarding. So the
// state row and the profile each keep a local mirror: state carries a dirty
// flag meaning "the server has not seen this yet", and every write path
// clears it only after Supabase confirms. All storage access is best-effort;
// with storage blocked the app behaves exactly as it did before.
const stateKey = (uid: string) => `divasya:state:${uid}`;
const profileKey = (uid: string) => `divasya:profile:${uid}`;
function saveLocalState(uid: string, st: UserState, dirty: boolean) {
  try { localStorage.setItem(stateKey(uid), JSON.stringify({ st, dirty, at: Date.now() })); } catch {}
}
function readLocalState(uid: string): { st: UserState; dirty: boolean } | null {
  try {
    const raw = localStorage.getItem(stateKey(uid));
    const v = raw ? JSON.parse(raw) : null;
    return v && v.st ? v : null;
  } catch { return null; }
}
function saveLocalProfile(uid: string, p: Profile) {
  try { localStorage.setItem(profileKey(uid), JSON.stringify(p)); } catch {}
}
function readLocalProfile(uid: string): Profile | null {
  try {
    const raw = localStorage.getItem(profileKey(uid));
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch { return null; }
}

export type ScreenName =
  | "home" | "mala" | "mandir" | "ai" | "consult" | "consultChat"
  | "panchang" | "festivals" | "library" | "vastu" | "naamkaran"
  | "puja" | "temple" | "sandesh" | "kundli" | "menu" | "category"
  | "shop" | "product" | "cart" | "checkout"
  | "account" | "profile" | "orders" | "wallet"
  | "journeys" | "reminders" | "journal" | "gita" | "paths";

export type ScreenState = { name: ScreenName; params?: Record<string, unknown> };
export type PushPayload = { title: string; body: string; tone?: "auspicious" | "info" };
export type Lang = "en" | "hi";

type Ctx = {
  // auth / profile
  user: User | null;
  loading: boolean;
  profileLoaded: boolean;
  profile: Profile | null;
  needsOnboarding: boolean;
  signInGoogle: () => Promise<void>;
  signInApple: () => Promise<void>;
  completeOnboarding: (fields: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
  // nav
  screen: ScreenState;
  go: (name: ScreenName, params?: Record<string, unknown>) => void;
  back: () => void;
  // deity
  deityId: string;
  setDeity: (id: string) => void;
  // stats (live, persisted)
  japaToday: number;
  japaLifetime: number;
  streak: number;
  punya: number;
  wallet: number;
  addJapa: (n?: number) => void;
  addPunya: (n: number, reason?: string) => void;
  addWallet: (n: number) => void;
  spendWallet: (n: number) => void;
  // push / haptic
  push: PushPayload | null;
  sendPush: (p: PushPayload) => void;
  clearPush: () => void;
  haptic: (pattern?: number | number[]) => void;
  // language
  lang: Lang;
  setLang: (l: Lang) => void;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

// Resolve to a fallback if a promise hangs — nothing may block the boot forever.
function withTimeout<T>(p: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ---------------------------------------------------------------- preview mode
// Local design-review only: set NEXT_PUBLIC_PREVIEW=1 in .env.local to skip the
// Google/allow-list gate and render every screen against lib/demo seed data.
// Never set this in production — .env* is gitignored, and the flag is read at
// build time so it compiles out entirely when unset.
const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

const PREVIEW_USER = {
  id: "preview-user",
  email: "preview@divasya.local",
  user_metadata: { full_name: "Preview" },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00.000Z",
} as unknown as User;

const PREVIEW_PROFILE: Profile = {
  id: "preview-user",
  name: "Preview",
  dob: "1995-08-14",
  tob: "06:45",
  birthplace: "Varanasi, Uttar Pradesh, India",
  current_location: "Varanasi, Uttar Pradesh, India",
  gender: "m",
  deity_id: "shiva",
  rashi: null,
  nakshatra: null,
  onboarded: true,
};

const PREVIEW_STATE: UserState = {
  japa_lifetime: 10800,
  japa_today: 108,
  last_japa: null,
  streak: 12,
  punya: 2450,
  wallet: 500,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserState>(EMPTY_STATE);

  const [screen, setScreen] = useState<ScreenState>({ name: "home" });
  const [history, setHistory] = useState<ScreenState[]>([]);
  const [push, setPush] = useState<PushPayload | null>(null);
  const [lang, setLangState] = useState<Lang>("en");

  // Keep the current screen across a refresh. The first render stays on home to
  // match the server HTML (no hydration mismatch); the screen you were on is
  // restored right after mount, and re-saved as you navigate. sessionStorage —
  // it survives a reload but doesn't hijack a fresh visit.
  const navRestored = useRef(false);
  // How many history entries WE pushed. The app navigates with React state,
  // so the WebView's history never grew and Android's hardware back exited
  // the app immediately. Every go() now mirrors a browser history entry,
  // popstate performs the app-level back, and in-app back buttons route
  // through history.back() so the two stacks can never drift apart.
  const pushedRef = useRef(0);
  useEffect(() => {
    if (navRestored.current) return;
    navRestored.current = true;
    try {
      const raw = sessionStorage.getItem("divasya:nav");
      if (raw) {
        const saved = JSON.parse(raw) as { screen?: ScreenState; history?: ScreenState[] };
        if (saved?.screen?.name) {
          setScreen(saved.screen);
          if (Array.isArray(saved.history)) setHistory(saved.history);
          // rebuild the browser stack to match, so hardware back walks the
          // restored screens home instead of exiting from a deep screen
          const backs = saved.history?.length
            ? saved.history.length
            : saved.screen.name !== "home" ? 1 : 0;
          for (let i = 0; i < backs; i++) window.history.pushState({ divasya: true }, "");
          pushedRef.current = backs;
        }
      }
    } catch { /* private mode / bad JSON — start on home */ }
  }, []);
  useEffect(() => {
    if (!navRestored.current) return;
    try {
      sessionStorage.setItem("divasya:nav", JSON.stringify({ screen, history }));
    } catch { /* storage full or blocked — navigation still works */ }
  }, [screen, history]);

  const statsRef = useRef<UserState>(EMPTY_STATE);
  const userRef = useRef<User | null>(null);
  const profileLoadedRef = useRef(false);
  const flushT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markProfileLoaded = useCallback((v: boolean) => {
    profileLoadedRef.current = v;
    setProfileLoaded(v);
  }, []);

  const loadUserData = useCallback(async (u: User) => {
    markProfileLoaded(false);
    try {
      let p = await withTimeout(db.getProfile(u.id), 6000, null);
      // Offline (or a Supabase blip): the last known profile, NOT a fresh
      // one — a null here would route a signed-in user back into onboarding.
      if (!p) p = readLocalProfile(u.id);
      if (!p) p = await withTimeout(db.saveProfile(u.id, {}), 6000, null);
      let st = await withTimeout(db.getState(u.id), 6000, { ...EMPTY_STATE });
      // This device may hold progress the server never received: japa tapped
      // offline (dirty flag), or the state fetch itself just failed and came
      // back as zeros while the mirror holds a real lifetime count.
      const local = readLocalState(u.id);
      const useLocal =
        !!local && (local.dirty || (st.japa_lifetime ?? 0) < (local.st.japa_lifetime ?? 0));
      if (useLocal) st = local!.st;
      if (st.last_japa !== todayStr()) st = { ...st, japa_today: 0 };
      statsRef.current = st;
      setProfile(p);
      setStats(st);
      saveLocalState(u.id, st, useLocal);
      if (useLocal) {
        // push the recovered progress up; the mirror stays dirty until it lands
        db.patchState(u.id, st).then((ok) => { if (ok) saveLocalState(u.id, statsRef.current, false); });
      }
    } catch (e) {
      // Never strand the user on the splash — fall through with what we have.
      console.error("loadUserData failed", e);
    } finally {
      markProfileLoaded(true);
    }
  }, [markProfileLoaded]);

  useEffect(() => {
    let active = true;

    // Preview mode: seed a signed-in, onboarded user and skip auth entirely.
    if (PREVIEW) {
      const st = { ...PREVIEW_STATE, last_japa: todayStr() };
      statsRef.current = st;
      setStats(st);
      userRef.current = PREVIEW_USER;
      setUser(PREVIEW_USER);
      setProfile(PREVIEW_PROFILE);
      markProfileLoaded(true);
      setLoading(false);
      return;
    }

    let sb: ReturnType<typeof supabaseBrowser> | null = null;
    try {
      sb = supabaseBrowser();
    } catch (e) {
      console.error("supabase init failed", e);
      setLoading(false);
      return;
    }

    // The splash must NEVER outlive this, no matter what hangs.
    const watchdog = setTimeout(() => {
      if (active) { setLoading(false); markProfileLoaded(true); }
    }, 9000);

    const enter = async (u: User | null) => {
      if (!active) return;
      if (!u) {
        userRef.current = null; setUser(null);
        setProfile(null); markProfileLoaded(false);
        setLoading(false);
        return;
      }
      // already fully in for this user — don't reload on token refresh etc.
      if (userRef.current?.id === u.id && profileLoadedRef.current) { setLoading(false); return; }

      // The app is open for all: a session enters, full stop. No allow-check
      // runs on the client at all — the earlier background variant ejected
      // real users whenever it ran with a stale token (an anon RPC looks
      // exactly like "not allowed"). The access_mode switch and allowed_users
      // stay in the backend; if invite mode ever returns, enforce it there.
      userRef.current = u; setUser(u);
      await loadUserData(u);
      if (active) setLoading(false);
    };

    withTimeout(
      sb.auth.getSession(),
      6000,
      { data: { session: null }, error: null } as Awaited<ReturnType<typeof sb.auth.getSession>>
    )
      .then(({ data }) => enter(data.session?.user ?? null))
      .catch((e) => { console.error("getSession failed", e); if (active) setLoading(false); })
      .finally(() => { if (active) clearTimeout(watchdog); });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;            // handled by getSession above
      if (event === "SIGNED_IN") { setLoading(true); enter(session?.user ?? null); }
      else if (event === "SIGNED_OUT") { enter(null); }
      // TOKEN_REFRESHED / USER_UPDATED: ignore — don't re-check or reload.
    });

    return () => { active = false; clearTimeout(watchdog); sub.subscription.unsubscribe(); };
  }, [loadUserData, markProfileLoaded]);

  // The one server write for state. Local mirror is marked dirty before the
  // attempt and clean only on confirmed success, so offline progress survives
  // an app kill and is retried later instead of silently dropped.
  const flushState = useCallback(() => {
    if (PREVIEW || !userRef.current) return;
    const uid = userRef.current.id;
    saveLocalState(uid, statsRef.current, true);
    db.patchState(uid, statsRef.current).then((ok) => {
      if (ok) saveLocalState(uid, statsRef.current, false);
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (PREVIEW) return;              // no backend to persist to in preview mode
    if (!userRef.current) return;
    if (flushT.current) clearTimeout(flushT.current);
    flushT.current = setTimeout(flushState, 1200);
  }, [flushState]);

  // flush on tab hide / unload so nothing is lost
  useEffect(() => {
    const flush = flushState;
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [flushState]);

  // back online: if the mirror still carries unsent progress, send it now
  useEffect(() => {
    const onOnline = () => {
      if (PREVIEW || !userRef.current) return;
      const local = readLocalState(userRef.current.id);
      if (local?.dirty) flushState();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushState]);

  // Mirror the profile locally whenever it changes — one effect covers every
  // mutation path (onboarding, deity choice, edits), and an offline cold
  // start reads this instead of treating the user as brand new.
  useEffect(() => {
    if (!PREVIEW && user && profile) saveLocalProfile(user.id, profile);
  }, [user, profile]);

  const apply = useCallback((updater: (s: UserState) => UserState) => {
    // statsRef is the source of truth (every flush reads it), so compute from
    // it directly — that lets the local mirror capture the tap immediately,
    // not 1.2s later when the debounce fires; an app killed mid-japa keeps
    // its count.
    const next = updater(statsRef.current);
    statsRef.current = next;
    setStats(next);
    if (!PREVIEW && userRef.current) saveLocalState(userRef.current.id, next, true);
    scheduleFlush();
  }, [scheduleFlush]);

  const go = useCallback((name: ScreenName, params?: Record<string, unknown>) => {
    setHistory((h) => [...h, screen]);
    setScreen({ name, params });
    if (typeof window !== "undefined") {
      window.history.pushState({ divasya: true }, "");
      pushedRef.current += 1;
    }
    logEvent("navigate", { to: name });
  }, [screen]);

  /** The app-level pop — shared by popstate and the no-history fallback. */
  const popApp = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) { setScreen({ name: "home" }); return h; }
      setScreen(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  const back = useCallback(() => {
    // Route through the browser stack when we own entries there, so the
    // hardware button and on-screen back arrows stay perfectly in step.
    if (typeof window !== "undefined" && pushedRef.current > 0) {
      window.history.back(); // popstate performs the pop
      return;
    }
    popApp();
  }, [popApp]);

  // Hardware/browser back: pop the app exactly once per entry we pushed.
  // At the stack's bottom (home) the event isn't ours — Android exits the
  // app, which is the platform's own convention.
  useEffect(() => {
    const onPop = () => {
      if (pushedRef.current > 0) {
        pushedRef.current -= 1;
        popApp();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [popApp]);

  // Inside the native shell the hardware back is a NATIVE event: once the
  // App plugin is installed, Capacitor hands it to this listener and does
  // nothing else — so the behaviour is fully ours: pop one screen per press,
  // and at home let Android put the app in the background.
  useEffect(() => {
    type AppPlugin = {
      addListener: (ev: string, cb: () => void) => Promise<{ remove: () => void }> | { remove: () => void };
      minimizeApp?: () => void;
      exitApp?: () => void;
    };
    const cap = (window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean; Plugins?: { App?: AppPlugin } };
    }).Capacitor;
    const app = cap?.isNativePlatform?.() ? cap.Plugins?.App : undefined;
    if (!app) return;
    let removed = false;
    let handle: { remove: () => void } | null = null;
    Promise.resolve(
      app.addListener("backButton", () => {
        if (pushedRef.current > 0) {
          // one path only: rewind history, and the popstate listener above
          // performs the single app-level pop — never pop here as well
          window.history.back();
        } else {
          (app.minimizeApp ?? app.exitApp)?.();
        }
      })
    ).then((h) => { if (removed) h.remove(); else handle = h; });
    return () => { removed = true; handle?.remove(); };
  }, [popApp]);

  const haptic = useCallback((pattern: number | number[] = 14) => {
    try { navigator.vibrate?.(pattern); } catch {}
  }, []);

  // Language preference (EN / हिं) — remembered across sessions. Read after mount
  // so server and first client render agree; localStorage is not available on SSR.
  useEffect(() => {
    try { const v = localStorage.getItem("divasya-lang"); if (v === "hi" || v === "en") setLangState(v); } catch {}
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("divasya-lang", l); } catch {}
  }, []);

  const addJapa = useCallback((n = 1) => {
    apply((s) => {
      const today = todayStr();
      let { japa_today, japa_lifetime, streak, last_japa } = s;
      if (last_japa !== today) {
        streak = last_japa === yesterdayStr() ? streak + 1 : 1;
        japa_today = 0;
        last_japa = today;
      }
      return { ...s, japa_today: japa_today + n, japa_lifetime: japa_lifetime + n, streak, last_japa };
    });
  }, [apply]);

  const addPunya = useCallback((n: number, reason?: string) => {
    apply((s) => ({ ...s, punya: s.punya + n }));
    if (reason) logEvent("punya", { n, reason });
  }, [apply]);

  const addWallet = useCallback((n: number) => apply((s) => ({ ...s, wallet: s.wallet + n })), [apply]);
  const spendWallet = useCallback((n: number) => apply((s) => ({ ...s, wallet: Math.max(0, s.wallet - n) })), [apply]);

  const setDeity = useCallback((id: string) => {
    setProfile((p) => (p ? { ...p, deity_id: id } : p));
    if (userRef.current) db.saveProfile(userRef.current.id, { deity_id: id });
  }, []);

  const signInGoogle = useCallback(async () => {
    await db.signInGoogle();   // full-page redirect to Google; SIGNED_IN handled on return
    logEvent("login_google_start");
  }, []);

  const signInApple = useCallback(async () => {
    await db.signInApple();    // native sheet; SIGNED_IN fires in-page
    logEvent("login_apple_start");
  }, []);

  const completeOnboarding = useCallback(async (fields: Partial<Profile>) => {
    if (!userRef.current) return;
    // Real Vedic identity: sidereal moon rashi + janma nakshatra from the
    // jyotish-grade engine (/api/kundli, Swiss Ephemeris). Falls back to the
    // sun-sign label if the birth date is unusable or the call fails.
    let rashi = rashiLabel({ rashi: fields.rashi ?? null, dob: fields.dob ?? null });
    let nakshatra: string | null = null;
    if (fields.dob) {
      try {
        const place = fields.birthplace ? `&place=${encodeURIComponent(fields.birthplace)}` : "";
        const r = await fetch(`/api/kundli?dob=${fields.dob}${fields.tob ? `&tob=${fields.tob}` : ""}${place}`);
        const k = await r.json();
        if (k?.moon?.sign) {
          rashi = k.moon.sign;
          nakshatra = `${k.moon.nakshatra} (pada ${k.moon.pada})`;
        }
      } catch { /* keep sun-sign fallback */ }
    }
    const merged = { ...fields, rashi, nakshatra, onboarded: true };
    // Optimistic: enter the app immediately so a slow/failed write can never
    // pin the user on the "Building your chart" spinner.
    setProfile((p) => ({ ...(p ?? ({} as Profile)), ...merged }));
    try {
      const saved = await db.saveProfile(userRef.current.id, merged);
      if (saved) setProfile(saved);
    } catch (e) {
      console.error("saveProfile failed", e);
    }
    logEvent("onboarded");
  }, []);

  const logout = useCallback(async () => {
    await db.signOut();
    setUser(null); userRef.current = null; setProfile(null); markProfileLoaded(false);
  }, [markProfileLoaded]);

  const sendPush = useCallback((p: PushPayload) => {
    setPush(p);
    try { navigator.vibrate?.([10, 40, 10]); } catch {}
  }, []);

  const deityId = profile?.deity_id || "krishna";
  const needsOnboarding = !!user && profileLoaded && !(profile?.onboarded);

  return (
    <AppCtx.Provider
      value={{
        user, loading, profileLoaded, profile, needsOnboarding,
        signInGoogle, signInApple, completeOnboarding, logout,
        screen, go, back,
        deityId, setDeity,
        japaToday: stats.japa_today, japaLifetime: stats.japa_lifetime, streak: stats.streak,
        punya: stats.punya, wallet: stats.wallet,
        addJapa, addPunya, addWallet, spendWallet,
        push, sendPush, clearPush: () => setPush(null), haptic,
        lang, setLang,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
