"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AppProvider, useApp, ScreenName } from "./app-context";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./side-nav";
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
    <div className="flex h-full w-full">
      <SideNav />
      <main className="relative h-full min-w-0 flex-1 overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-[680px] overflow-hidden border-[var(--line)] lg:border-x">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.name + JSON.stringify(screen.params || {})}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
          {SHOW_NAV.includes(screen.name) && <BottomNav />}
        </div>
      </main>
    </div>
  );
}

/** Center-stage wrapper for pre-app screens (splash / login / onboarding). */
function Stage({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <div className={`mx-auto h-full w-full max-w-[460px] ${scroll ? "overflow-y-auto no-scrollbar" : "overflow-hidden"}`}>
      {children}
    </div>
  );
}

function Splash() {
  return (
    <div className="grid h-full place-items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="font-display text-5xl text-[var(--gold-soft)]"
      >
        ॐ
      </motion.div>
    </div>
  );
}

function Gate() {
  const { loading, user, profileLoaded, needsOnboarding } = useApp();
  if (loading) return <Splash />;
  if (!user) return <Stage><LoginScreen /></Stage>;
  if (!profileLoaded) return <Splash />;
  if (needsOnboarding) return <Stage scroll><OnboardingScreen /></Stage>;
  return <RoutedApp />;
}

function Inner() {
  return (
    <>
      <Gate />
      <PushToast />
    </>
  );
}

export function AppShell() {
  return (
    <AppProvider>
      <div className="relative h-[100dvh] w-full overflow-hidden">
        <Inner />
      </div>
    </AppProvider>
  );
}
