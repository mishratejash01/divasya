"use client";

import { IconContext } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AppProvider, useApp, ScreenName } from "./app-context";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./side-nav";
import { CategoryScreen } from "./screens/category";
import { PushToast } from "./push-toast";
import { OfflineGate } from "./offline-screen";
import { Logomark, BrandWordmark, ScreenHeader } from "./ui";
import { Iconify } from "./iconify";
import { DamruLoader } from "./damru-loader";

import { HomeScreen } from "./screens/home";
import { MalaScreen } from "./screens/mala";
import { MandirScreen } from "./screens/mandir";
import { KundliScreen } from "./screens/kundli";
import { ShopScreen, ProductScreen, CartScreen } from "./screens/shop";
import { CheckoutScreen } from "./screens/checkout";
import { MenuScreen } from "./screens/menu";
import { ProfileScreen } from "./screens/profile";
import { OrdersScreen } from "./screens/orders";
import { WalletScreen } from "./screens/wallet";
import { JourneysScreen } from "./screens/journeys";
import { RemindersScreen } from "./screens/reminders";
import { JournalScreen } from "./screens/journal";
import { GitaScreen } from "./screens/gita";
import { PathsScreen } from "./screens/paths";
import { JyotishiScreen } from "./screens/jyotishi";
import { ConsultScreen, ConsultChatScreen } from "./screens/consult";
import { MoreScreen } from "./screens/more";
import { PanchangScreen, FestivalsScreen, LibraryScreen, SandeshScreen } from "./screens/content";
import { VastuScreen } from "./screens/vastu";
import { NaamkaranScreen } from "./screens/naamkaran";
import { PujaScreen, TempleScreen } from "./screens/devotion";
import { LoginScreen } from "./screens/login";
import { OnboardingScreen } from "./screens/onboarding";

// The tab bar persists everywhere except the two full-screen rituals, which
// take over the viewport and carry their own exit. Previously this was an
// allow-list, so most screens dropped the bar and stranded the user with only
// a back button.
const HIDE_NAV: ScreenName[] = ["mala", "mandir", "signin"];
const NAMASTE_IMAGE = "https://res.cloudinary.com/oqfanico/image/upload/f_auto,q_auto/v1787393254/divasya/app/namaste-greeting.webp";

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Screen() {
  const { screen, user } = useApp();
  // Guests may roam everywhere except the account itself. Gating in this one
  // place keeps every screen component unchanged and unable to drift.
  if (!user && AUTH_REQUIRED.includes(screen.name)) return <SignInWall screen={screen.name} />;
  switch (screen.name) {
    case "home": return <HomeScreen />;
    case "mala": return <MalaScreen />;
    case "mandir": return <MandirScreen />;
    case "kundli": return <KundliScreen />;
    case "shop": return <ShopScreen />;
    case "product": return <ProductScreen />;
    case "cart": return <CartScreen />;
    case "checkout": return <CheckoutScreen />;
    case "ai": return <JyotishiScreen />;
    case "consult": return <ConsultScreen />;
    case "consultChat": return <ConsultChatScreen />;
    case "menu": return <MenuScreen />;
    case "account": return <MoreScreen />;
    case "profile": return <ProfileScreen />;
    case "orders": return <OrdersScreen />;
    case "wallet": return <WalletScreen />;
    case "journeys": return <JourneysScreen />;
    case "reminders": return <RemindersScreen />;
    case "journal": return <JournalScreen />;
    case "gita": return <GitaScreen />;
    case "paths": return <PathsScreen />;
    case "category": return <CategoryScreen />;
    case "panchang": return <PanchangScreen />;
    case "festivals": return <FestivalsScreen />;
    case "library": return <LibraryScreen />;
    case "vastu": return <VastuScreen />;
    case "naamkaran": return <NaamkaranScreen />;
    case "puja": return <PujaScreen />;
    case "temple": return <TempleScreen />;
    case "sandesh": return <SandeshScreen />;
    case "signin": return <LoginScreen />;
    default: return <HomeScreen />;
  }
}

/**
 * The desktop top bar. Haldi yellow to match the rail, so the two together frame
 * the app like brand chrome. Carries the Divasya wordmark on the left and the
 * account in the corner. It lives inside the main column, so when the rail blooms
 * open the bar shifts right along with the page. Desktop only — the phone screens
 * carry their own headers.
 */
function DeskTopBar() {
  const { go } = useApp();
  return (
    <header
      className="hidden h-14 shrink-0 items-center justify-between px-5 lg:flex"
      style={{ background: "var(--bar-yellow)", borderBottom: "1px solid rgba(0,0,0,0.10)" }}
    >
      <button onClick={() => go("home")} className="text-left" aria-label="Divasya — Home">
        <BrandWordmark height={26} tone="ink" priority />
      </button>
      {/* Account lives here now — the user-circle mark, not an avatar. */}
      <button
        onClick={() => go("account")}
        title="Account"
        aria-label="Account"
        className="grid h-9 w-9 place-items-center rounded-full transition-opacity hover:opacity-80"
      >
        <Iconify icon="solar:user-circle-bold-duotone" width={27} height={27} className="text-[var(--icon-ink)]" />
      </button>
    </header>
  );
}

function DailyNamastePopup() {
  const { screen, haptic, lang } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (screen.name !== "home") {
      setVisible(false);
      return;
    }

    const today = localDateKey();
    try {
      if (localStorage.getItem("divasya:namaste-seen") === today) return;
    } catch {
      return;
    }

    const showTimer = window.setTimeout(() => {
      try { localStorage.setItem("divasya:namaste-seen", today); } catch {}
      setVisible(true);
      haptic(8);
    }, 1500);

    // Full-screen greeting: appears at 1.5s and holds until 6.8s. A tap dismisses
    // it early.
    const hideTimer = window.setTimeout(() => setVisible(false), 6800);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [screen.name, haptic]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="namaste-full"
          onClick={() => setVisible(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          aria-live="polite"
          role="dialog"
        >
          <motion.div
            className="namaste-full-imgwrap"
            initial={{ y: 26, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={NAMASTE_IMAGE} alt="" className="namaste-full-image" />
          </motion.div>
          <motion.div
            className="namaste-full-text"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {lang === "hi" ? (
              <div className="namaste-full-deva">नमस्ते</div>
            ) : (
              <div className="font-serif namaste-full-word">Namaste</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A quiet pill while the device has no internet. Saved content keeps
 *  working underneath it; this only names why live things are unavailable. */
function OfflineBanner() {
  const { lang } = useApp();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-40 flex justify-center px-4">
      <div
        className="rounded-full px-3.5 py-1.5 text-[11px] font-medium shadow-md"
        style={{ background: "#2A2118", color: "#FFF3DC", border: "1px solid #00000033" }}
      >
        {lang === "hi"
          ? "आप ऑफ़लाइन हैं। सहेजी गई सामग्री दिख रही है।"
          : "You are offline. Showing saved content."}
      </div>
    </div>
  );
}

function RoutedApp() {
  const { screen } = useApp();
  // A brief damru loading screen whenever a new screen opens.
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 720);
    return () => window.clearTimeout(t);
  }, [screen.name]);
  return (
    <div className="flex h-full w-full">
      <SideNav />
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* The yellow bar is home's header only. Every other screen carries its
            own ScreenHeader, so stacking this above them made two headers and
            pushed each screen's title down a row. */}
        {screen.name === "home" && <DeskTopBar />}
        {/* Fills the space beside the rail. Home spreads into a feed-plus-widget
            dashboard that uses the width without stretching any one card; the
            other screens carry their own gutter. The warm ground only shows on
            desktop, where the white cards lift off it. */}
        <div className="desk-ground relative w-full flex-1 overflow-hidden">
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
          {!HIDE_NAV.includes(screen.name) && <BottomNav />}
          <OfflineBanner />
          <DailyNamastePopup />
          <AnimatePresence>{loading && <DamruLoader />}</AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/** Center-stage wrapper for pre-app screens (splash / login / onboarding). */

/**
 * Shown when a guest opens something that needs an account. It names what
 * signing in unlocks rather than scolding, and it is the ONLY thing standing
 * between a guest and the rest of the app.
 */
const WALL_COPY: Partial<Record<ScreenName, { title: string; body: string }>> = {
  account:     { title: "Your account",     body: "Sign in to keep your chart, your japa streak and your orders in one place." },
  profile:     { title: "Your details",     body: "Sign in to save your birth details so your chart and panchang stay personal to you." },
  orders:      { title: "Your orders",      body: "Sign in to see the pujas you have booked and the items on their way to you." },
  wallet:      { title: "Divasya Wallet",   body: "Sign in to see your balance and use it towards pujas and store orders." },
  checkout:    { title: "Checkout",         body: "Sign in so your order can be placed and delivered to you." },
  consult:     { title: "Consultations",    body: "Sign in to talk to an astrologer and keep your conversation." },
  consultChat: { title: "Consultations",    body: "Sign in to talk to an astrologer and keep your conversation." },
  ai:          { title: "AI Jyotishi",      body: "Sign in so the Jyotishi can read your own chart and remember your questions." },
  journal:     { title: "Your journal",     body: "Sign in to keep your reflections safe and private to you." },
  reminders:   { title: "Your reminders",   body: "Sign in to save reminders for vrats, muhurats and festivals." },
};

function SignInWall({ screen }: { screen: ScreenName }) {
  const { back, go } = useApp();
  const copy = WALL_COPY[screen] ?? {
    title: "Sign in",
    body: "Sign in to use this part of Divasya.",
  };
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title={copy.title} onBack={back} />
      <div className="gutter flex flex-col items-center px-8 pt-16 text-center">
        <Logomark size={46} className="text-[var(--bhagwa)]" />
        <p className="mt-5 max-w-[16rem] text-[14px] leading-relaxed text-ink">{copy.body}</p>
        <button
          onClick={() => go("signin")}
          className="mt-6 w-full max-w-[16rem] rounded-2xl py-3.5 text-[13.5px] btn-saffron"
        >
          Sign in
        </button>
        <button onClick={back} className="mt-3 py-1 text-[11.5px] text-muted">
          Keep looking around
        </button>
      </div>
    </div>
  );
}

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
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: [0.55, 1, 0.55], scale: 1 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-[var(--bhagwa)]"
      >
        <Logomark size={65} />
      </motion.div>
    </div>
  );
}

/**
 * Screens that genuinely belong to an account. Everything not listed here —
 * panchang, darshan, the library, festivals, vastu, the mala, browsing the
 * store and the puja catalogue — is open to everyone, which is what App Store
 * guideline 5.1.1(v) requires: an app may not demand registration to reach
 * content that is not account based.
 */
const AUTH_REQUIRED: ScreenName[] = [
  "account", "profile", "orders", "wallet", "checkout",
  "consult", "consultChat", "ai", "journal", "reminders",
];

function Gate() {
  const { loading, user, profileLoaded, needsOnboarding } = useApp();
  if (loading) return <Splash />;
  // A signed-in user still finishes onboarding first; a guest goes straight in.
  if (user) {
    if (!profileLoaded) return <Splash />;
    if (needsOnboarding) return <Stage scroll><OnboardingScreen /></Stage>;
  }
  return <RoutedApp />;
}

function Inner() {
  return (
    <>
      <Gate />
      <PushToast />
      {/* Global offline takeover — sits above everything, dismisses on reconnect. */}
      <OfflineGate />
    </>
  );
}

export function AppShell() {
  return (
    // One weight for every Phosphor glyph in the app. The hand-drawn set in
    // components/icons.tsx is stroked at 1.4, and Phosphor's "light" is the
    // closest match — set once here so the two families read as one system.
    <IconContext.Provider value={{ weight: "light" }}>
      <AppProvider>
        <div className="relative h-[100dvh] w-full overflow-hidden">
          <Inner />
        </div>
      </AppProvider>
    </IconContext.Provider>
  );
}
