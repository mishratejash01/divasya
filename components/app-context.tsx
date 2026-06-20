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
  | "puja" | "temple" | "sandesh" | "menu";

export type ScreenState = { name: ScreenName; params?: Record<string, unknown> };
export type PushPayload = { title: string; body: string; tone?: "auspicious" | "info" };

type Ctx = {
  // auth / profile
  user: User | null;
  loading: boolean;
  profileLoaded: boolean;
  profile: Profile | null;
  needsOnboarding: boolean;
  signIn: () => Promise<void>;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserState>(EMPTY_STATE);

  const [screen, setScreen] = useState<ScreenState>({ name: "home" });
  const [history, setHistory] = useState<ScreenState[]>([]);
  const [push, setPush] = useState<PushPayload | null>(null);

  const statsRef = useRef<UserState>(EMPTY_STATE);
  const userRef = useRef<User | null>(null);
  const flushT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUserData = useCallback(async (u: User) => {
    setProfileLoaded(false);
    try {
      let p = await db.getProfile(u.id);
      if (!p) p = await db.saveProfile(u.id, {});
      let st = await db.getState(u.id);
      if (st.last_japa !== todayStr()) st = { ...st, japa_today: 0 };
      statsRef.current = st;
      setProfile(p);
      setStats(st);
    } catch (e) {
      // Never strand the user on the splash: fall through to onboarding/app
      // with whatever we have. A failed load shouldn't be a dead end.
      console.error("loadUserData failed", e);
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let sb: ReturnType<typeof supabaseBrowser> | null = null;
    try {
      sb = supabaseBrowser();
    } catch (e) {
      // Misconfigured client (e.g. missing public env at build time):
      // don't hang on the splash — show the login screen.
      console.error("supabase init failed", e);
      setLoading(false);
      return;
    }

    // Hard safety net: the splash must never live longer than this.
    const failsafe = setTimeout(() => { if (active) setLoading(false); }, 8000);

    sb.auth.getSession()
      .then(async ({ data }) => {
        if (!active) return;
        const u = data.session?.user ?? null;
        userRef.current = u;
        setUser(u);
        if (u) await loadUserData(u);
      })
      .catch((e) => { console.error("getSession failed", e); })
      .finally(() => { if (active) { clearTimeout(failsafe); setLoading(false); } });

    const { data: sub } = sb.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      userRef.current = u;
      setUser(u);
      if (u) { await loadUserData(u); } else { setProfile(null); setProfileLoaded(false); }
    });
    return () => { active = false; clearTimeout(failsafe); sub.subscription.unsubscribe(); };
  }, [loadUserData]);

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

  const signIn = useCallback(async () => {
    const u = await db.signInAnon();
    if (u) { userRef.current = u; setUser(u); await loadUserData(u); }
    logEvent("login_anon");
  }, [loadUserData]);

  const completeOnboarding = useCallback(async (fields: Partial<Profile>) => {
    if (!userRef.current) return;
    const rashi = rashiLabel({ rashi: fields.rashi ?? null, dob: fields.dob ?? null });
    const merged = { ...fields, rashi, onboarded: true };
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
    setUser(null); userRef.current = null; setProfile(null); setProfileLoaded(false);
  }, []);

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
        signIn, completeOnboarding, logout,
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
