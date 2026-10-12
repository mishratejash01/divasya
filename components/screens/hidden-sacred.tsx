"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CaretRight } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { PageHeader } from "../page-header";
import { SACRED_STATES, loadSacredState, type SacredState, type SacredStateRef } from "@/lib/hidden-sacred";

/**
 * The Hidden Sacred — lesser-known temples, state by state.
 *
 * One screen, three depths, chosen by params:
 *   (none)               every state, as a shelf of jewel-toned cards
 *   { state }            that state's introduction and its numbered temples
 *   { state, temple }    one temple's story, read like a short essay
 * The index (names, places, essences) ships with the app; the essays load per
 * state on demand.
 */
const OUT = [0.16, 1, 0.3, 1] as const;

export function HiddenSacredScreen() {
  const { screen } = useApp();
  const stateId = screen.params?.state as string | undefined;
  const templeId = screen.params?.temple as string | undefined;
  const ref = SACRED_STATES.find((s) => s.id === stateId);
  if (ref && templeId) return <TempleStory stateRef={ref} templeId={templeId} />;
  if (ref) return <StateTemples stateRef={ref} />;
  return <AllStates />;
}

const grad = (t: [string, string]) => `linear-gradient(140deg, ${t[0]} 0%, ${t[1]} 100%)`;

function useSacredState(id: string) {
  const [data, setData] = useState<SacredState | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let on = true;
    setFailed(false);
    loadSacredState(id).then((d) => on && setData(d)).catch(() => on && setFailed(true));
    return () => { on = false; };
  }, [id]);
  return { data, failed };
}

/* ---------- every state ---------- */

function AllStates() {
  const { back, go, lang } = useApp();
  const total = SACRED_STATES.reduce((n, s) => n + s.temples.length, 0);
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <PageHeader
        title={lang === "hi" ? "छिपे हुए तीर्थ" : "The Hidden Sacred"}
        subtitle={lang === "hi" ? "कम जाने गए मंदिर, राज्य दर राज्य" : "Lesser-known temples, state by state"}
        onBack={back}
        gradient="linear-gradient(135deg, #3A1F4E 0%, #170B22 100%)"
        shadow="rgba(23,11,34,0.30)"
      />
      <div className="gutter pt-4">
        <div className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hidden-sacred/hero.webp" alt="" className="block w-full" />
          <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3 pt-10" style={{ background: "linear-gradient(180deg, rgba(10,6,20,0) 0%, rgba(10,6,20,0.82) 100%)" }}>
            <p className="text-[12px] leading-snug text-[#FDEFD6]">
              {lang === "hi"
                ? `${SACRED_STATES.length} राज्यों के ${total} मंदिर — वे जहाँ पीढ़ियों ने अपनी प्रार्थनाएँ छोड़ी हैं।`
                : `${total} temples across ${SACRED_STATES.length} states — places where generations have left their prayers.`}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 gutter pt-5 pb-6">
        {SACRED_STATES.map((s, i) => (
          <StateCard key={s.id} s={s} i={i} onOpen={() => go("sacred", { state: s.id })} />
        ))}
      </div>
    </div>
  );
}

export function StateCard({ s, i, onOpen, wide }: { s: SacredStateRef; i: number; onOpen: () => void; wide?: boolean }) {
  return (
    <motion.button
      onClick={onOpen}
      className={`flex flex-col items-center text-center ${wide ? "w-[142px] shrink-0" : ""}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04, ease: OUT }}
      whileTap={{ scale: 0.96 }}
    >
      {/* the state's map artifact, floating gently */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/hidden-sacred/map-${s.id}.webp`}
        alt=""
        className="sacred-float aspect-square w-full object-contain"
        style={{ animationDelay: `${(i % 4) * 0.6}s`, filter: "drop-shadow(0 8px 14px rgba(60,20,10,0.18))" }}
      />
      <span className="mt-1 font-display text-[15px] leading-tight text-ink">{s.name}</span>
    </motion.button>
  );
}

/* ---------- one state ---------- */

function StateTemples({ stateRef }: { stateRef: SacredStateRef }) {
  const { back, go, lang } = useApp();
  const { data } = useSacredState(stateRef.id);
  const [more, setMore] = useState(false);
  const intro = data?.intro ?? [];
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <PageHeader
        title={stateRef.name}
        subtitle={lang === "hi" ? "छिपे हुए तीर्थ" : "The Hidden Sacred"}
        onBack={back}
        gradient={grad(stateRef.tint)}
        shadow="rgba(0,0,0,0.22)"
      />

      <div className="gutter pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={`/hidden-sacred/map-${stateRef.id}.webp`}
          alt=""
          className="sacred-float mx-auto block aspect-square w-[64%] max-w-[280px] object-contain"
          style={{ filter: "drop-shadow(0 12px 22px rgba(60,20,10,0.22))" }}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: OUT }}
        />
        <p className="mt-2 text-center font-display text-[17px] italic leading-snug text-ink">{stateRef.tagline}</p>
        {intro.length > 0 && (
          <div className="mt-2.5 text-[12.5px] leading-relaxed text-ink-dim">
            {(more ? intro : intro.slice(0, 1)).map((p, i) => <p key={i} className={i ? "mt-2" : ""}>{p}</p>)}
            {intro.length > 1 && (
              <button onClick={() => setMore((m) => !m)} className="mt-1.5 text-[11.5px] font-medium" style={{ color: "var(--bhagwa-deep)" }}>
                {more ? (lang === "hi" ? "कम पढ़ें" : "Read less") : (lang === "hi" ? "और पढ़ें" : "Read more")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gutter pt-3">
        {stateRef.temples.map((t, i) => (
          <motion.button
            key={t.id}
            onClick={() => go("sacred", { state: stateRef.id, temple: t.id })}
            className="flex items-start gap-3 py-3 text-left"
            style={{ borderTop: i ? "1px solid var(--line)" : "none" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.035, ease: OUT }}
          >
            {/* the temple's own artifact */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/hidden-sacred/t/${t.id}.webp`}
              alt=""
              loading="lazy"
              className="h-[72px] w-[72px] shrink-0 object-contain"
              style={{ filter: "drop-shadow(0 4px 8px rgba(60,20,10,0.16))" }}
            />
            <span className="min-w-0 flex-1 pt-0.5">
              <span className="block text-[10.5px] font-medium tracking-[0.08em]" style={{ color: stateRef.tint[0] }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="block text-[14px] font-medium leading-snug text-ink">{t.name}</span>
              {t.place && <span className="mt-0.5 block text-[11px] text-muted">{t.place}</span>}
              <span className="mt-1 line-clamp-2 block text-[12px] italic leading-snug text-ink-dim">{t.essence}</span>
            </span>
            <CaretRight size={14} className="mt-1 shrink-0 text-muted" />
          </motion.button>
        ))}
      </div>

      {data && data.thread.length > 0 && (
        <div className="gutter pb-6 pt-4">
          <div className="rounded-2xl p-4" style={{ background: grad(stateRef.tint) }}>
            <div className="text-[10.5px] tracking-[0.12em] text-[#F3D6B0]">{lang === "hi" ? "साझा सूत्र" : "THE COMMON THREAD"}</div>
            {data.thread.map((p, i) => (
              <p key={i} className="mt-2 text-[12.5px] leading-relaxed text-[#FDEFD6]/90">{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- one temple ---------- */

function TempleStory({ stateRef, templeId }: { stateRef: SacredStateRef; templeId: string }) {
  const { back, go, lang } = useApp();
  const { data, failed } = useSacredState(stateRef.id);
  const idx = stateRef.temples.findIndex((t) => t.id === templeId);
  const ref = stateRef.temples[idx];
  const temple = data?.temples.find((t) => t.id === templeId);
  const next = stateRef.temples[idx + 1];
  if (!ref) return null;
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <PageHeader
        title={ref.name}
        subtitle={[ref.place, stateRef.name].filter(Boolean).join(" · ")}
        onBack={back}
        gradient={grad(stateRef.tint)}
        shadow="rgba(0,0,0,0.22)"
      />
      <article className="gutter pb-6 pt-4">
        {/* the temple, large, rising in */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={ref.id}
          src={`/hidden-sacred/t/${ref.id}.webp`}
          alt=""
          className="sacred-float mx-auto block aspect-square w-[62%] max-w-[260px] object-contain"
          style={{ filter: "drop-shadow(0 12px 22px rgba(60,20,10,0.22))" }}
          initial={{ opacity: 0, scale: 0.86, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: OUT }}
        />
        <div className="mt-3 font-display text-[13px] tracking-[0.1em]" style={{ color: stateRef.tint[0] }}>
          {String(idx + 1).padStart(2, "0")} / {String(stateRef.temples.length).padStart(2, "0")}
        </div>
        <h2 className="mt-1.5 font-display text-[22px] leading-tight text-ink">{ref.essence}</h2>

        <div className="mt-4 text-[13.5px] leading-[1.75] text-ink">
          {temple ? (
            temple.body.map((b, i) =>
              b.h ? (
                <h3 key={i} className="mb-1.5 mt-5 font-display text-[16px] text-ink">{b.h}</h3>
              ) : (
                <p key={i} className={i ? "mt-3" : ""}>{b.p}</p>
              )
            )
          ) : failed ? (
            <p className="text-muted">{lang === "hi" ? "कहानी अभी लोड नहीं हो सकी। कृपया फिर से कोशिश करें।" : "The story couldn't load just now. Please try again."}</p>
          ) : (
            // reading skeleton while the state's essays arrive
            <div className="flex flex-col gap-2.5">
              {[92, 100, 84, 96, 70].map((w, i) => (
                <div key={i} className="h-3 rounded-full" style={{ width: `${w}%`, background: "var(--surface-2)" }} />
              ))}
            </div>
          )}
        </div>

        {next && (
          <button
            onClick={() => go("sacred", { state: stateRef.id, temple: next.id })}
            className="mt-7 flex w-full items-center justify-between rounded-2xl p-3.5 text-left"
            style={{ background: grad(stateRef.tint) }}
          >
            <span className="min-w-0">
              <span className="block text-[10px] tracking-[0.1em] text-[#F3D6B0]">{lang === "hi" ? "अगला मंदिर" : "NEXT TEMPLE"}</span>
              <span className="mt-0.5 block truncate text-[14px] font-medium text-[#FDEFD6]">{next.name}</span>
            </span>
            <CaretRight size={16} className="shrink-0 text-[#FDEFD6]" />
          </button>
        )}
      </article>
    </div>
  );
}
