"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bag, Check, PencilSimple, ShareNetwork, SignOut, Star, Trash } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { Iconify } from "../iconify";
import { Logomark, ScreenHeader } from "../ui";
import { rashiLabel } from "@/lib/astro";
import { supabaseBrowser } from "@/lib/supabase";

/**
 * The menu used to carry fourteen entries across three sections — Astrology,
 * Devotion, Guides — every single one of which is already a titled section on
 * the home screen. That made this a second copy of the homepage: two places to
 * maintain and no answer to which one you were meant to use.
 *
 * What is left is the handful of things that have nowhere else to live: who you
 * are signed in as, sharing the app, and the way out.
 */
function prettyDob(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function MoreScreen() {
  const { back, go, haptic, profile, user, logout } = useApp();
  const [shared, setShared] = useState(false);
  // The real balance, from the wallet ledger — never the old client-side field.
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await supabaseBrowser().auth.getSession();
        const token = s.session?.access_token;
        if (!token) return;
        const r = await fetch("/api/wallet/summary", { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) setBalance(((await r.json()) as { balance: number }).balance);
      } catch { /* tile shows the wallet link without a number */ }
    })();
  }, []);

  // Permanent deletion, two taps: the first arms the button for a few
  // seconds, the second calls the server wipe, then everything local goes too.
  const [armDelete, setArmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteAccount = async () => {
    if (deleting) return;
    if (!armDelete) {
      haptic(8);
      setArmDelete(true);
      setTimeout(() => setArmDelete(false), 6000);
      return;
    }
    setDeleting(true);
    try {
      const { data: s } = await supabaseBrowser().auth.getSession();
      const token = s.session?.access_token;
      if (!token) throw new Error("no session");
      const r = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("delete failed");
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("divasya"))
          .forEach((k) => localStorage.removeItem(k));
      } catch { /* storage blocked: server data is gone regardless */ }
      await supabaseBrowser().auth.signOut().catch(() => {});
      await logout().catch(() => {});
    } catch {
      setDeleting(false);
      setArmDelete(false);
    }
  };

  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });

  // How this account actually got in — the email for Google, the number for
  // phone. Shown rather than implied, because "manage account" screens that
  // don't say which login you used are the reason people get locked out.
  const provider = user?.app_metadata?.provider;
  const signedInWith = user?.email ?? user?.phone ?? null;
  const providerLabel =
    provider === "google" ? "Google" : provider === "phone" ? "Phone" : provider ? provider : null;

  async function share() {
    haptic(8);
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const text = "Divasya — panchang, kundli and daily darshan in one place.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Divasya", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    } catch {
      /* dismissed the share sheet, or clipboard refused — nothing to report */
    }
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Account" onBack={back} />

      <div className="gutter pt-3">
        <div className="lg:flex lg:items-start lg:gap-5">

          {/* account — one common block: image + details + actions together */}
          <div className="flex-1 overflow-hidden rounded-2xl surface p-4">
            <div className="flex items-center gap-4 text-left lg:gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/user-rishi.png" alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover lg:h-36 lg:w-36"
                style={{ border: "1px solid var(--line-gold)" }} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[19px] text-ink lg:text-[22px]">{name}</div>
                <div className="truncate text-[12px] text-muted">{rashi}</div>
                {signedInWith && (
                  <div className="mt-2 flex items-center gap-2">
                    <Iconify icon="logos:google-gmail" width={16} height={13} />
                    <span className="truncate text-[12.5px] text-ink">{signedInWith}</span>
                  </div>
                )}
                {profile?.dob && (
                  <div className="mt-1 truncate text-[11.5px] text-muted">
                    {prettyDob(profile.dob)}{profile.tob ? `, ${profile.tob}` : ""}{profile.birthplace ? ` · ${profile.birthplace}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* wallet */}
            <button onClick={() => { haptic(6); go("wallet"); }} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left" style={{ background: "rgba(206,185,118,0.18)", border: "1px solid var(--line-gold)" }}>
              <Iconify icon="solar:wallet-bold-duotone" width={24} height={24} className="shrink-0 text-[var(--icon-ink)]" />
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] leading-none text-muted">Divasya Wallet</div>
                <div className="mt-1 text-[17px] font-medium leading-none text-ink tnum">
                  {balance === null ? "Open wallet" : `₹${balance.toLocaleString("en-IN")}`}
                </div>
              </div>
              <span className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium btn-saffron">Add money</span>
            </button>

            {/* actions — tiles, no divider lines between them */}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { label: "Edit profile", Icon: PencilSimple, run: () => { haptic(6); go("profile"); } },
                { label: "My Kundli", Icon: Star, run: () => { haptic(6); go("kundli"); } },
                { label: "My Orders", Icon: Bag, run: () => { haptic(6); go("orders"); } },
                { label: "Share app", Icon: ShareNetwork, run: share },
                { label: "Sign out", Icon: SignOut, run: () => { haptic(8); logout(); } },
              ].map(({ label, Icon, run }) => (
                <button key={label} onClick={run} className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--surface-2)]">
                  <Icon size={16} weight="regular" className="shrink-0 text-ink" />
                  <span className="flex-1 truncate text-[12.5px] font-medium text-ink">{label}</span>
                </button>
              ))}
            </div>
            {shared && <div className="mt-1 flex items-center gap-1 px-1 text-[10.5px] text-[var(--good)]"><Check size={11} weight="bold" /> Link copied</div>}

            {/* danger zone: Play policy requires in-app account deletion */}
            <button
              onClick={deleteAccount}
              className="mt-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left"
              style={{
                border: "1px solid rgba(168,50,38,0.35)",
                background: armDelete ? "rgba(168,50,38,0.10)" : "transparent",
              }}
            >
              <Trash size={16} weight="regular" className="shrink-0 text-[#A83226]" />
              <span className="flex-1 text-[12.5px] font-medium text-[#A83226]">
                {deleting
                  ? "Deleting your account…"
                  : armDelete
                    ? "Tap again to permanently delete everything"
                    : "Delete account"}
              </span>
            </button>
          </div>

          {/* what Divasya gives you — desktop promo */}
          <FeaturesPromo />
        </div>

        <div className="flex items-center justify-center gap-1.5 pb-2 pt-5 text-[10px] text-[var(--muted-2)]">
          <Logomark size={13} className="text-[var(--bhagwa)]" /> Divasya · Spiritual Journey
        </div>
      </div>
    </div>
  );
}

// What Divasya gives you — a warm, user-facing promo carousel shown beside the
// account on desktop. Copy stays inviting and plain, never technical.
function FeaturesPromo() {
  const slides = [
    { t: "Your day, perfectly timed", d: "Panchang, tithi and the day's shubh muhurat every morning, so you always begin at the right moment." },
    { t: "Guidance whenever you seek it", d: "Sit with your own Jyotishi at any hour and find calm, clear answers to what's on your mind." },
    { t: "Darshan, wherever you are", d: "Live aarti from India's most loved temples, brought gently to your screen each day." },
    { t: "A mandir of your own", d: "Light a diya, ring the bell and offer flowers to your beloved deity, right at home." },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 3800);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return (
    <aside
      className="relative mt-4 hidden shrink-0 self-start overflow-hidden rounded-2xl lg:mt-0 lg:flex lg:w-[300px] lg:flex-col"
      style={{ background: "linear-gradient(165deg, #E0902E 0%, #B23A1E 100%)", color: "#fff" }}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div className="relative p-5">
        <div className="text-[11px] font-medium tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.85)" }}>DIVASYA</div>
        <div className="mt-1 font-display text-[19px] leading-tight">Everything for your devotion, in one place</div>

        <div className="relative mt-4 h-[128px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[14.5px] font-medium">{slides[i].t}</div>
              <p className="mt-1.5 text-[12.5px] font-normal leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>{slides[i].d}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-1 flex gap-1.5">
          {slides.map((_, k) => (
            <span key={k} className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: k === i ? 18 : 6, background: k === i ? "#fff" : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>
      </div>
    </aside>
  );
}
