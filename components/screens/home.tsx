"use client";

import { useEffect, useRef } from "react";
import {
  Menu, Bell, Sparkles, Flame, Landmark, CircleDot, MessagesSquare,
  Flower2, CalendarDays, Compass, ChevronRight, Share2, Sun, Moon,
} from "lucide-react";
import { useApp } from "../app-context";
import { Avatar, SectionLabel, cx } from "../ui";
import {
  DEMO_USER, PANCHANG, currentChoghadiya, HOROSCOPE_TODAY, SHLOKA, LIBRARY, deityById,
} from "@/lib/demo";

let firedOnce = false;

const GRID = [
  { label: "AI Jyotishi", icon: Sparkles, to: "ai", params: { mode: "jyotishi" } },
  { label: "Talk to Devta", icon: Flame, to: "ai", params: { mode: "deity" } },
  { label: "My Mandir", icon: Landmark, to: "mandir" },
  { label: "Mala Jaap", icon: CircleDot, to: "mala" },
  { label: "Consult", icon: MessagesSquare, to: "consult" },
  { label: "Online Puja", icon: Flower2, to: "puja" },
  { label: "Panchang", icon: CalendarDays, to: "panchang" },
  { label: "Vastu", icon: Compass, to: "vastu" },
] as const;

export function HomeScreen() {
  const { go, sendPush, streak, japaToday, deityId } = useApp();
  const chog = currentChoghadiya();
  const deity = deityById(deityId);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (firedOnce) return;
    firedOnce = true;
    const id = setTimeout(() => {
      sendPush({
        title: `${chog.name} Choghadiya is now`,
        body: `An auspicious window to begin anything new. Aaj ${PANCHANG.vrat} hai 🪔`,
        tone: "auspicious",
      });
    }, 4200);
    return () => clearTimeout(id);
  }, [sendPush, chog.name]);

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-2">
        <button onClick={() => go("menu")} className="grid h-9 w-9 place-items-center rounded-full surface">
          <Menu size={18} className="text-ink" />
        </button>
        <span className="font-display text-lg tracking-[0.3em] text-ink">DIVASYA</span>
        <button
          ref={bellRef}
          onClick={() =>
            sendPush({
              title: `${chog.name} Choghadiya is now`,
              body: `Auspicious to begin. Aaj ${PANCHANG.vrat} — view the pooja vidhi 🪔`,
              tone: "auspicious",
            })
          }
          className="grid h-9 w-9 place-items-center rounded-full surface"
        >
          <Bell size={17} className="text-ink" />
        </button>
      </div>

      {/* greeting */}
      <div className="flex items-center gap-3 px-5 pt-6">
        <Avatar name={DEMO_USER.name} size={46} tint="#c8772e" />
        <div>
          <div className="text-[13px] text-muted">Namaste,</div>
          <div className="font-display text-xl text-ink">{DEMO_USER.name}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[12px] text-muted">{DEMO_USER.rashi.split(" ")[0]} · {DEMO_USER.nakshatra}</div>
          <div className="text-[12px] text-gold">{PANCHANG.tithi}</div>
        </div>
      </div>

      {/* panchang + choghadiya strip */}
      <button
        onClick={() => go("panchang")}
        className="mx-5 mt-5 flex w-[calc(100%-2.5rem)] items-stretch gap-3 rounded-2xl surface p-3 text-left"
      >
        <div className="flex flex-col justify-center gap-1.5 border-r pr-3" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-1.5 text-[12px] text-muted"><Sun size={13} /> {PANCHANG.sunrise}</div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted"><Moon size={13} /> {PANCHANG.sunset}</div>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="text-[11px] uppercase tracking-wider text-muted">Now · Choghadiya</div>
          <div className="flex items-center gap-2">
            <span className={cx("text-[15px] font-semibold", chog.good ? "text-[var(--good)]" : "text-[var(--avoid)]")}>
              {chog.name}
            </span>
            <span className="text-[12px] text-muted">{chog.good ? "Shubh" : "Avoid"}</span>
          </div>
          <div className="text-[11px] text-muted">Rahu Kaal {PANCHANG.rahuKaal}</div>
        </div>
        <ChevronRight size={18} className="self-center text-muted" />
      </button>

      {/* Aaj ka Sandesh card */}
      <div className="px-5 pt-6">
        <div className="overflow-hidden rounded-2xl card-temple p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Aaj ka Sandesh</span>
            <span className="text-[11px] text-muted">{PANCHANG.weekday}</span>
          </div>
          <p className="mt-3 font-deva text-[17px] leading-relaxed text-ink">{SHLOKA.deva}</p>
          <p className="mt-1 text-[12.5px] italic text-muted">{SHLOKA.meaning}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12.5px] text-muted">A blessing from {deity.name}</span>
            <button
              onClick={() => go("sandesh")}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] btn-ghost"
            >
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* japa streak widget */}
      <button
        onClick={() => go("mala")}
        className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] items-center gap-4 rounded-2xl surface p-4 text-left"
      >
        <div className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "rgba(200,119,46,0.14)", border: "1px solid var(--line)" }}>
          <Flame size={22} className="text-[var(--saffron)]" />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-medium text-ink">{streak}-day japa streak</div>
          <div className="text-[12px] text-muted">{japaToday} chants today · keep it alive</div>
        </div>
        <span className="rounded-full px-3 py-1.5 text-[12px] btn-saffron">Chant</span>
      </button>

      {/* quick grid */}
      <div className="px-5 pt-7">
        <SectionLabel>Explore</SectionLabel>
        <div className="grid grid-cols-4 gap-2.5">
          {GRID.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.label}
                onClick={() => go(g.to as never, ("params" in g ? g.params : undefined) as never)}
                className="flex flex-col items-center gap-2 rounded-2xl surface px-1 py-3.5"
              >
                <Icon size={21} className="text-[var(--saffron-soft)]" strokeWidth={1.8} />
                <span className="text-center text-[11px] leading-tight text-ink">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* festival / pooja */}
      <div className="px-5 pt-7">
        <button onClick={() => go("festivals")} className="flex w-full items-center gap-3 overflow-hidden rounded-2xl surface p-3 text-left">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl text-3xl" style={{ background: "rgba(124,92,255,0.10)", border: "1px solid var(--line)" }}>🧘</div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-muted">Today</div>
            <div className="font-display text-[17px] text-ink">{PANCHANG.vrat}</div>
            <div className="text-[12px] text-muted">Muhurat 06:49 AM — 06:17 PM · View pooja vidhi</div>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>

      {/* horoscope */}
      <div className="px-5 pt-4">
        <div className="rounded-2xl surface p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-[16px] text-ink">Today · {DEMO_USER.rashi.split(" ")[1]?.replace(/[()]/g, "") || "Leo"}</span>
            <span className="text-2xl">♌</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{HOROSCOPE_TODAY}</p>
          <button onClick={() => go("ai", { mode: "jyotishi" })} className="mt-3 text-[12.5px] text-[var(--saffron-soft)]">
            Ask the AI Jyotishi about your day →
          </button>
        </div>
      </div>

      {/* library */}
      <div className="px-5 pt-7">
        <SectionLabel action={<button onClick={() => go("library")} className="text-[12px] text-[var(--saffron-soft)]">Explore all</button>}>
          Spiritual Library
        </SectionLabel>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 no-scrollbar">
          {LIBRARY.map((l) => (
            <button key={l.id} onClick={() => go("library")} className="w-40 shrink-0 overflow-hidden rounded-2xl surface text-left">
              <div className="h-24 w-full" style={{ background: `linear-gradient(160deg, ${l.grad[0]}, ${l.grad[1]})`, opacity: 0.85 }} />
              <div className="p-3">
                <div className="text-[13px] font-medium leading-tight text-ink">{l.title}</div>
                <div className="mt-1 text-[11px] text-muted">{l.read} read</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-2 pt-8 text-center">
        <div className="text-[11px] tracking-widest text-muted">🕉 Divasya · Spiritual Journey</div>
      </div>
    </div>
  );
}
