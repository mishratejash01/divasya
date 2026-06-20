"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppProvider, useApp, ScreenName } from "./app-context";
import { PhoneFrame, StatusBar } from "./phone";
import { BottomNav } from "./bottom-nav";
import { PushToast } from "./push-toast";

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
import { OnboardingScreen } from "./screens/onboarding";

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

function Splash() {
  return (
    <div className="grid h-full place-items-center" style={{ background: "linear-gradient(180deg,#140e0a,#0b0807)" }}>
      <div className="animate-pulse text-4xl">🕉</div>
    </div>
  );
}

function Gate() {
  const { loading, user, profileLoaded, needsOnboarding } = useApp();
  if (loading) return <Splash />;
  if (!user) return <LoginScreen />;
  if (!profileLoaded) return <Splash />;
  if (needsOnboarding) return <OnboardingScreen />;
  return <RoutedApp />;
}

function Inner() {
  return (
    <>
      <StatusBar />
      <Gate />
      <PushToast />
    </>
  );
}

export function AppShell() {
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

  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 py-4">
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
          <PhoneFrame>
            <Inner />
          </PhoneFrame>
        </div>
        <div className="text-[11px] tracking-widest text-muted">DIVASYA · Live</div>
      </div>
    </AppProvider>
  );
}
