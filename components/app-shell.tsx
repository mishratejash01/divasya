"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppProvider, useApp, ScreenName } from "./app-context";
import { PhoneFrame, StatusBar } from "./phone";
import { BottomNav } from "./bottom-nav";
import { PushToast } from "./push-toast";
import { supabaseBrowser } from "@/lib/supabase";

import { HomeScreen } from "./screens/home";
import { MalaScreen } from "./screens/mala";
import { MandirScreen } from "./screens/mandir";
import { JyotishiScreen } from "./screens/jyotishi";
import { ConsultScreen, ConsultChatScreen } from "./screens/consult";
import { MoreScreen } from "./screens/more";
import { PanchangScreen, FestivalsScreen, LibraryScreen, SandeshScreen } from "./screens/content";
import { VastuScreen } from "./screens/vastu";
import { NaamkaranScreen } from "./screens/naamkaran";
import { PujaScreen, TempleScreen } from "./screens/devotion";
import { LoginScreen } from "./screens/login";

const SHOW_NAV: ScreenName[] = ["home", "consult", "menu", "panchang", "festivals", "library", "temple", "naamkaran"];

function Screen() {
  const { screen } = useApp();
  switch (screen.name) {
    case "home": return <HomeScreen />;
    case "mala": return <MalaScreen />;
    case "mandir": return <MandirScreen />;
    case "ai": return <JyotishiScreen />;
    case "consult": return <ConsultScreen />;
    case "consultChat": return <ConsultChatScreen />;
    case "menu": return <MoreScreen />;
    case "panchang": return <PanchangScreen />;
    case "festivals": return <FestivalsScreen />;
    case "library": return <LibraryScreen />;
    case "vastu": return <VastuScreen />;
    case "naamkaran": return <NaamkaranScreen />;
    case "puja": return <PujaScreen />;
    case "temple": return <TempleScreen />;
    case "sandesh": return <SandeshScreen />;
    default: return <HomeScreen />;
  }
}

function RoutedApp() {
  const { screen } = useApp();
  return (
    <>
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen.name + JSON.stringify(screen.params || {})}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </div>
      {SHOW_NAV.includes(screen.name) && <BottomNav />}
    </>
  );
}

function Inner({ authed, onGuest }: { authed: boolean; onGuest: () => void }) {
  return (
    <>
      <StatusBar />
      {authed ? <RoutedApp /> : <LoginScreen onGuest={onGuest} />}
      <PushToast />
    </>
  );
}

export function AppShell() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [guest, setGuest] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const m = 24;
      setScale(Math.min(1, (window.innerWidth - m) / 392, (window.innerHeight - m) / 852));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    let active = true;
    try {
      const sb = supabaseBrowser();
      sb.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSignedIn(!!data.session);
        setReady(true);
      });
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
        setSignedIn(!!session);
      });
      return () => { active = false; sub.subscription.unsubscribe(); };
    } catch {
      setReady(true);
    }
  }, []);

  const authed = signedIn || guest;

  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 py-4">
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
          <PhoneFrame>
            {!ready ? (
              <div className="grid h-full place-items-center">
                <div className="animate-pulse text-4xl">🕉</div>
              </div>
            ) : (
              <Inner authed={authed} onGuest={() => setGuest(true)} />
            )}
          </PhoneFrame>
        </div>
        <div className="text-[11px] tracking-widest text-muted">DIVASYA · Live Proof of Concept</div>
      </div>
    </AppProvider>
  );
}
