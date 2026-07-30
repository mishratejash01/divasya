"use client";

import { useState } from "react";
import { Check, EnvelopeSimple, PencilSimple, ShareNetwork, SignOut } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { Avatar, Logomark, ScreenHeader } from "../ui";
import { rashiLabel } from "@/lib/astro";

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

      {/* Who you are, and which login this is. The card now opens the editor —
          birth details are the input to every chart the app computes, so they
          have to be correctable. */}
      <div className="gutter pt-2">
        {/* Transparent — the profile block sits straight on the ground with no
            card fill or shadow behind it. */}
        <div className="overflow-hidden rounded-2xl">
          <button
            onClick={() => { haptic(6); go("profile"); }}
            className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[var(--surface-2)]"
          >
            <Avatar name={name} size={44} tint="#C88131" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-[15px] text-ink">{name}</div>
              <div className="truncate text-[11px] text-ink">{rashi}</div>
            </div>
            <PencilSimple size={15} weight="light" className="shrink-0 text-[var(--bhagwa)]" />
          </button>
          {signedInWith && (
            <div className="flex items-center gap-3 px-3 py-2.5" style={{ borderTop: "1px solid var(--line)" }}>
              <EnvelopeSimple size={15} weight="light" className="shrink-0 text-[var(--bhagwa)]" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] leading-none text-[var(--muted-2)]">
                  Signed in{providerLabel ? ` with ${providerLabel}` : ""}
                </div>
                <div className="mt-1 truncate text-[12px] leading-none text-ink">{signedInWith}</div>
              </div>
            </div>
          )}
          {profile?.dob && (
            <button
              onClick={() => { haptic(6); go("profile"); }}
              className="block w-full px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
              style={{ borderTop: "1px solid var(--line)" }}>
              <div className="text-[10px] leading-none text-[var(--muted-2)]">Birth details</div>
              {/* Read as a date, not as an ISO string. */}
              <div className="mt-1 truncate text-[12px] leading-none text-ink">
                {prettyDob(profile.dob)}{profile.tob ? `, ${profile.tob}` : ""}
                {profile.birthplace ? ` · ${profile.birthplace}` : ""}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="gutter pt-2">
        <div className="overflow-hidden rounded-2xl surface">
          <button
            onClick={() => { haptic(6); go("profile"); }}
            className="flex w-full items-center gap-3 px-3 py-3 text-left"
          >
            <PencilSimple size={16} weight="light" className="shrink-0 text-[var(--bhagwa)]" />
            <span className="flex-1 text-[12.5px] text-ink">Edit your details</span>
          </button>

          <button
            onClick={share}
            style={{ borderTop: "1px solid var(--line)" }}
            className="flex w-full items-center gap-3 px-3 py-3 text-left"
          >
            <ShareNetwork size={16} weight="light" className="shrink-0 text-[var(--bhagwa)]" />
            <span className="flex-1 text-[12.5px] text-ink">Share app</span>
            {shared && (
              <span className="flex items-center gap-1 text-[10.5px] text-[var(--good)]">
                <Check size={11} weight="bold" /> Link copied
              </span>
            )}
          </button>

          <button
            onClick={() => { haptic(8); logout(); }}
            className="flex w-full items-center gap-3 px-3 py-3 text-left"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <SignOut size={16} weight="light" className="shrink-0 text-[var(--avoid)]" />
            <span className="flex-1 text-[12.5px] text-[var(--avoid)]">Sign out</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 gutter pb-2 pt-5 text-[10px] text-[var(--muted-2)]">
        <Logomark size={13} className="text-[var(--bhagwa)]" /> Divasya · Spiritual Journey
      </div>
    </div>
  );
}
