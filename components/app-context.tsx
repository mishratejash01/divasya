"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase";
import * as db from "@/lib/db";
import { Profile, UserState, EMPTY_STATE } from "@/lib/types";
import { rashiLabel } from "@/lib/astro";
import { logEvent } from "@/lib/chat";

export type ScreenName =
  | "home" | "mala" | "mandir" | "ai" | "consult" | "consultChat"
  | "panchang" | "festivals" | "library" | "vastu" | "naamkaran"
  | "puja" | "temple" | "sandesh" | "kundli" | "menu";

export type ScreenState = { name: ScreenName; params?: Record<string, unknown> };
export type PushPayload = { title: string; body: string; tone?: "auspicious" | "info" };

type Ctx = {
  // auth / profile
  user: User | null;
  loading: boolean;
  profileLoaded: boolean;
  profile: Profile | null;
  needsOnboarding: boolean;
  denied: boolean;
  signInGoogle: () => Promise<void>;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserState>(EMPTY_STATE);
  const [denied, setDenied] = useState(false);

  const [screen, setScreen] = useState<ScreenState>({ name: "home" });
  const [history, setHistory] = useState<ScreenState[]>([]);
  const [push, setPush] = useState<PushPayload | null>(null);

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
      if (!p) p = await withTimeout(db.saveProfile(u.id, {}), 6000, null);
      let st = await withTimeout(db.getState(u.id), 6000, { ...EMPTY_STATE });
      if (st.last_japa !== todayStr()) st = { ...st, japa_today: 0 };
      statsRef.current = st;
      setProfile(p);
      setStats(st);
    } catch (e) {
      // Never strand the user on the splash — fall through with what we have.
      console.error("loadUserData failed", e);
    } finally {
      markProfileLoaded(true);
    }
  }, [markProfileLoaded]);

  // Is the signed-in user's email on the backend allow-list? Fail CLOSED.
  const checkAllowed = useCallback(async (): Promise<boolean> => {
    try {
      const result = await withTimeout<boolean | null>(
        supabaseBrowser()
          .rpc("is_email_allowed")
          .then((r) => (r.error ? (console.error("allow-check error", r.error), null) : (r.data as boolean))),
        6000,
        null
      );
      return result === true;
    } catch (e) {
      console.error("allow-check failed", e);
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;
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

      // Hard gate: only allow-listed Google emails get in.
      const allowed = await checkAllowed();
      if (!active) return;
      if (!allowed) {
        setDenied(true);
        userRef.current = null; setUser(null);
        setProfile(null); markProfileLoaded(false);
        setLoading(false);
        db.signOut().catch(() => {});
        logEvent("login_denied");
        return;
      }

      setDenied(false);
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
  }, [loadUserData, checkAllowed, markProfileLoaded]);

  const scheduleFlush = useCallback(() => {
    if (!userRef.current) return;
    if (flushT.current) clearTimeout(flushT.current);
    flushT.current = setTimeout(() => {
      if (userRef.current) db.patchState(userRef.current.id, statsRef.current);
    }, 1200);
  }, []);

  // flush on tab hide / unload so nothing is lost
  useEffect(() => {
    const flush = () => { if (userRef.current) db.patchState(userRef.current.id, statsRef.current); };
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  const apply = useCallback((updater: (s: UserState) => UserState) => {
    setStats((prev) => { const next = updater(prev); statsRef.current = next; return next; });
    scheduleFlush();
  }, [scheduleFlush]);

  const go = useCallback((name: ScreenName, params?: Record<string, unknown>) => {
    setHistory((h) => [...h, screen]);
    setScreen({ name, params });
    logEvent("navigate", { to: name });
  }, [screen]);

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) { setScreen({ name: "home" }); return h; }
      setScreen(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  const haptic = useCallback((pattern: number | number[] = 14) => {
    try { navigator.vibrate?.(pattern); } catch {}
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
    setDenied(false);
    await db.signInGoogle();   // full-page redirect to Google; SIGNED_IN handled on return
    logEvent("login_google_start");
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
        const r = await fetch(`/api/kundli?dob=${fields.dob}${fields.tob ? `&tob=${fields.tob}` : ""}`);
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
    setUser(null); userRef.current = null; setProfile(null); markProfileLoaded(false); setDenied(false);
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
        user, loading, profileLoaded, profile, needsOnboarding, denied,
        signInGoogle, completeOnboarding, logout,
        screen, go, back,
        deityId, setDeity,
        japaToday: stats.japa_today, japaLifetime: stats.japa_lifetime, streak: stats.streak,
        punya: stats.punya, wallet: stats.wallet,
        addJapa, addPunya, addWallet, spendWallet,
        push, sendPush, clearPush: () => setPush(null), haptic,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
