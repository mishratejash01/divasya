"use client";

import { createPortal } from "react-dom";
import { IconContext } from "@phosphor-icons/react";
import { motion, AnimatePresence, useReducedMotion, MotionConfig } from "framer-motion";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { AppProvider, useApp, ScreenName, ScreenOverride, navIntent } from "./app-context";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./side-nav";
import { CategoryScreen } from "./screens/category";
import { IOS_HIDDEN } from "./nav-map";
import { isIosApp } from "@/lib/platform";
import { PushToast } from "./push-toast";
import { OfflineGate } from "./offline-screen";
import { Logomark, BrandWordmark, ScreenHeader } from "./ui";
import { Iconify } from "./iconify";
import { InstantEntry } from "./reveal-text";
import { MoonLoader, COSMIC_INTRO_MS, COSMIC_ASSETS } from "./moon-loader";
import { ConstellationLoader, PAGE_SWAP_MS, PAGE_HOLD_MS, nextFigure } from "./constellation-loader";

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
import { HiddenSacredScreen } from "./screens/hidden-sacred";
import { VastuScreen } from "./screens/vastu";
import { NaamkaranScreen } from "./screens/naamkaran";
import { PujaScreen, TempleScreen } from "./screens/devotion";
import { LoginScreen } from "./screens/login";
import { OnboardingScreen } from "./screens/onboarding";

// The tab bar persists everywhere except the two full-screen rituals, which
// take over the viewport and carry their own exit. Previously this was an
// allow-list, so most screens dropped the bar and stranded the user with only
// a back button.
// chats are full-screen: the composer sits on the bottom edge, so the keyboard
// meets it directly instead of leaving the tab bar's gap behind
const HIDE_NAV: ScreenName[] = ["mala", "mandir", "signin", "consultChat"];
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
  // isIosApp() is read straight through rather than via useIsIosApp(), whose
  // first paint reports false to stay hydration-safe. That one render was
  // enough to mount TempleScreen and let it call /api/darshan before the hook
  // corrected itself. It is safe here because Gate() renders <Splash/> until
  // auth resolves, so this component only ever renders on the client, long
  // after hydration.
  const ios = isIosApp();
  // Guests may roam everywhere except the account itself. Gating in this one
  // place keeps every screen component unchanged and unable to drift.
  if (!user && AUTH_REQUIRED.includes(screen.name)) return <SignInWall screen={screen.name} />;
  // The backstop for IOS_HIDDEN. Every link into Live Darshan is already gone
  // on iOS, but a session restored from before the change, or a route added
  // later without remembering this rule, would still land here. Refusing to
  // mount the screen means no entry point can reintroduce the feature.
  if (ios && IOS_HIDDEN.has(screen.name)) return <HomeScreen />;
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
    case "sacred": return <HiddenSacredScreen />;
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
    }, COSMIC_INTRO_MS + 900);

    // Full-screen greeting: appears just after the opening curtain lifts and
    // holds for about five seconds. A tap dismisses it early.
    const hideTimer = window.setTimeout(() => setVisible(false), COSMIC_INTRO_MS + 6200);

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

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Resolves when every picture currently on screen inside `root` has loaded
 *  (or failed), or after `capMs` — whichever comes first. */
function imagesReady(root: HTMLElement | null, capMs: number): Promise<void> {
  if (!root) return Promise.resolve();
  const vh = window.innerHeight;
  const pending = Array.from(root.querySelectorAll("img")).filter((img) => {
    if (img.complete) return false;
    const r = img.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh && r.width > 0;
  });
  if (pending.length === 0) return Promise.resolve();
  const all = Promise.all(
    pending.map((img) => new Promise<void>((res) => {
      img.addEventListener("load", () => res(), { once: true });
      img.addEventListener("error", () => res(), { once: true });
    }))
  ).then(() => undefined);
  return Promise.race([all, wait(capMs)]);
}

function RoutedApp() {
  const { screen } = useApp();
  // The cosmic curtain. On every screen change the curtain sweeps up over the
  // OLD screen (it stays rendered until covered, so nothing flashes), the new
  // screen is swapped in underneath, and as the curtain lifts the new screen
  // rises into place with its sections staggering in.
  const reduce = useReducedMotion();
  const key = screen.name + JSON.stringify(screen.params || {});
  const [shown, setShown] = useState(screen);
  const [shownKey, setShownKey] = useState(key);
  const [loading, setLoading] = useState(false);
  // the first curtain is the app opening — it starts closed and holds longer
  // The opening plays once per session — not again if the app remounts or the
  // page reloads on a back navigation.
  const [intro, setIntro] = useState(() => {
    try { return sessionStorage.getItem("divasya:intro-played") !== "1"; } catch { return true; }
  });
  const [mounted, setMounted] = useState(false);
  // which constellation the next screen change shows — never the same twice running
  const [figure, setFigure] = useState(0);
  const [animateIn, setAnimateIn] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  // only the returning screen's first moment is settled; motion resumes after
  const [settling, setSettling] = useState(false);
  useEffect(() => {
    if (!settling) return;
    const id = window.setTimeout(() => setSettling(false), 400);
    return () => window.clearTimeout(id);
  }, [settling]);
  useEffect(() => {
    setMounted(true);
    COSMIC_ASSETS.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);
  useLayoutEffect(() => {
    if (reduce) { setShown(screen); setShownKey(key); setIntro(false); return; }
    const viaTab = navIntent.viaTab;
    const isBack = navIntent.back;
    navIntent.viaTab = false;
    navIntent.back = false;
    // Going back returns to a screen that was just on display — show it as it
    // was, instantly, rather than replaying an entrance (that read as a glitch).
    setAnimateIn(!isBack);
    setSettling(isBack);
    // Screens opened from inside a page (not the tab bar) simply rise in.
    if (!intro && !viaTab) { setShown(screen); setShownKey(key); return; }
    setLoading(true);
    // The opening plays the full cosmic curtain over the first screen.
    let cancelled = false;
    if (intro) {
      setShown(screen); setShownKey(key);
      // lift only once the opening has fully played AND the first screen's
      // visible pictures are in (capped, so a slow network can't trap us)
      Promise.all([wait(COSMIC_INTRO_MS), wait(400).then(() => imagesReady(stageRef.current, 4000))]).then(() => {
        if (cancelled) return;
        setLoading(false); setIntro(false);
        try { sessionStorage.setItem("divasya:intro-played", "1"); } catch {}
      });
      return () => { cancelled = true; };
    }
    // A tab switch: the constellation sky fades over the old screen,
    // the new one is swapped in behind it, and the sky lifts once the
    // constellation has formed.
    setFigure((f) => nextFigure(f));
    const swap = window.setTimeout(() => { setShown(screen); setShownKey(key); }, PAGE_SWAP_MS);
    // lift once the constellation has fully formed AND the new screen's
    // visible pictures have loaded (capped)
    Promise.all([wait(PAGE_HOLD_MS), wait(PAGE_SWAP_MS + 120).then(() => imagesReady(stageRef.current, 2500))]).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; window.clearTimeout(swap); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.name, key, reduce]);
  return (
    <div className="flex h-full w-full">
      <SideNav />
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* The yellow bar is home's header only. Every other screen carries its
            own ScreenHeader, so stacking this above them made two headers and
            pushed each screen's title down a row. */}
        {screen.name === "home" && <DeskTopBar />}
        <div className="desk-ground relative w-full flex-1 overflow-hidden">
          <motion.div
            ref={stageRef}
            key={shownKey}
            initial={reduce || !animateIn ? false : { y: 24 }}
            animate={reduce || !loading ? { y: 0 } : { y: 24 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={reduce ? "absolute inset-0" : animateIn ? "screen-stage absolute inset-0" : "screen-instant absolute inset-0"}
          >
            <InstantEntry.Provider value={settling}>
              <MotionConfig reducedMotion={settling ? "always" : "never"}>
                <ScreenOverride screen={shown}>
                  <Screen />
                </ScreenOverride>
              </MotionConfig>
            </InstantEntry.Provider>
          </motion.div>
          {!HIDE_NAV.includes(screen.name) && <BottomNav />}
          <OfflineBanner />
          {/* The daily Namaste greeting is switched off — render <DailyNamastePopup /> here to bring it back. */}
          {/* over everything — tab bar included — so it lives on the body */}
          {mounted && createPortal(<AnimatePresence>{loading && (intro ? <MoonLoader key="intro" intro /> : <ConstellationLoader key="page" figure={figure} />)}</AnimatePresence>, document.body)}
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

// While the session loads, show the same night sky the opening curtain starts
// on — no white page, no logo — so the app opens straight into the cosmic
// intro without a flash in between.
function Splash() {
  return (
    <div className="h-full w-full" style={{ background: "#070A1C" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cosmic/sky-min.webp" alt="" className="h-full w-full object-cover object-bottom" />
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
      {/* In-app notification toasts are hidden for now — turn back on by
          rendering <PushToast /> here. */}
      {/* Global offline takeover — sits above everything, dismisses on reconnect. */}
      <OfflineGate />
    </>
  );
}

/**
 * Pins the app to the part of the screen you can actually see. When a phone
 * keyboard opens, the visible area shrinks but the page keeps its full height,
 * so the browser lets the whole page slide — white space and old messages
 * showing under the chat input. Here the app's frame follows the visual
 * viewport exactly (height and offset), and the page itself never scrolls.
 */
function useVisualViewportFrame() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const sync = () => {
      root.style.setProperty("--app-h", `${vv.height}px`);
      root.style.setProperty("--app-top", `${vv.offsetTop}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);
}

export function AppShell() {
  useVisualViewportFrame();
  return (
    // One weight for every Phosphor glyph in the app. The hand-drawn set in
    // components/icons.tsx is stroked at 1.4, and Phosphor's "light" is the
    // closest match — set once here so the two families read as one system.
    <IconContext.Provider value={{ weight: "light" }}>
      <AppProvider>
        <div className="app-frame w-full overflow-hidden">
          <Inner />
        </div>
      </AppProvider>
    </IconContext.Provider>
  );
}
