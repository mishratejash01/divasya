"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DEMO_USER } from "@/lib/demo";
import { logEvent } from "@/lib/chat";

export type ScreenName =
  | "home"
  | "mala"
  | "mandir"
  | "ai"
  | "consult"
  | "consultChat"
  | "panchang"
  | "festivals"
  | "library"
  | "vastu"
  | "naamkaran"
  | "puja"
  | "temple"
  | "sandesh"
  | "menu";

export type ScreenState = { name: ScreenName; params?: Record<string, unknown> };

export type PushPayload = { title: string; body: string; tone?: "auspicious" | "info" };

type Ctx = {
  screen: ScreenState;
  history: ScreenState[];
  go: (name: ScreenName, params?: Record<string, unknown>) => void;
  back: () => void;
  deityId: string;
  setDeity: (id: string) => void;
  wallet: number;
  addWallet: (n: number) => void;
  spendWallet: (n: number) => void;
  japaToday: number;
  japaLifetime: number;
  streak: number;
  addJapa: (n?: number) => void;
  punya: number;
  addPunya: (n: number, reason?: string) => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenState>({ name: "home" });
  const [history, setHistory] = useState<ScreenState[]>([]);
  const [deityId, setDeityId] = useState(DEMO_USER.deityId);
  const [wallet, setWallet] = useState(0);
  const [japaToday, setJapaToday] = useState(0);
  const [japaLifetime, setJapaLifetime] = useState(10548); // seeded "lifetime"
  const [streak, setStreak] = useState(12); // seeded streak
  const [punya, setPunya] = useState(840); // seeded
  const [push, setPush] = useState<PushPayload | null>(null);

  const go = useCallback((name: ScreenName, params?: Record<string, unknown>) => {
    setHistory((h) => [...h, screen]);
    setScreen({ name, params });
    logEvent("navigate", { to: name, ...(params || {}) });
  }, [screen]);

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) { setScreen({ name: "home" }); return h; }
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  }, []);

  const haptic = useCallback((pattern: number | number[] = 14) => {
    try { navigator.vibrate?.(pattern); } catch {}
  }, []);

  const addJapa = useCallback((n = 1) => {
    setJapaToday((c) => c + n);
    setJapaLifetime((c) => c + n);
  }, []);

  const addPunya = useCallback((n: number, reason?: string) => {
    setPunya((p) => p + n);
    if (reason) logEvent("punya", { n, reason });
  }, []);

  const sendPush = useCallback((p: PushPayload) => {
    setPush(p);
    try { navigator.vibrate?.([10, 40, 10]); } catch {}
  }, []);

  return (
    <AppCtx.Provider
      value={{
        screen, history, go, back,
        deityId, setDeity: setDeityId,
        wallet, addWallet: (n) => setWallet((w) => w + n), spendWallet: (n) => setWallet((w) => Math.max(0, w - n)),
        japaToday, japaLifetime, streak, addJapa,
        punya, addPunya,
        push, sendPush, clearPush: () => setPush(null),
        haptic,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
