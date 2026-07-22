"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CircleNotch, GenderFemale, GenderMale } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { cx } from "../ui";
import { useCatalog, getNakshatraSyllables, getBabyNames } from "@/lib/catalog";
import { NAKSHATRA_SYLLABLES, BABY_NAMES } from "@/lib/demo";

type G = "m" | "f";
type Script = "en" | "hi";
type Found = { nak: string; pada: number; when: string; place: string };

// The numerology digit that used to sit beside every meaning is gone. It read
// as "no. 6" with nothing to say what the number was, and a figure a reader
// cannot interpret is worse than no figure — it makes them stop on every row.

function prettyWhen(dob: string, tob: string) {
  const d = new Date(`${dob}T${tob || "12:00"}`);
  if (Number.isNaN(d.getTime())) return dob;
  const day = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (!tob) return day;
  return `${day}, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`;
}

export function NaamkaranScreen() {
  const { back, haptic, profile } = useApp();
  const nakshatras = useCatalog(getNakshatraSyllables, NAKSHATRA_SYLLABLES);
  const names = useCatalog(getBabyNames, BABY_NAMES);
  const [nakName, setNakName] = useState<string | null>(null);
  const [gender, setGender] = useState<G | "all">("all");
  const [pada, setPada] = useState<number | null>(null);   // null = all four
  const [script, setScript] = useState<Script>("en");

  // Birth details. Nobody naming a baby knows its nakshatra; they know when and
  // where the baby was born. The chart engine already turns one into the other,
  // so the screen asks for what the parent has and works the rest out.
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [place, setPlace] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [found, setFound] = useState<Found | null>(null);
  const [manual, setManual] = useState(false);

  const hi = script === "hi";
  const t = (en: string, h: string) => (hi ? h : en);

  const mine = profile?.nakshatra?.split(" (")[0] ?? null;
  const nak =
    nakshatras.find((n) => n.name === nakName) ??
    nakshatras.find((n) => n.name === mine) ??
    nakshatras[0];
  const syl = nak?.syl ?? [];
  const syld = nak?.syld ?? [];

  const byGender = names.filter((x) => gender === "all" || x.g === gender);
  // Grouped by the sound each name answers to. Four sounds are prescribed and
  // names are found for each, so the page is built the way the practice runs.
  const groups = syl
    .map((s, i) => ({ i, s, d: syld[i] ?? s, items: byGender.filter((x) => x.syl === s) }))
    .filter((g, i, all) => all.findIndex((o) => o.d === g.d) === i); // identity is the akshara
  const shown = pada === null ? groups : groups.filter((g) => g.i === pada);
  const total = shown.reduce((a, g) => a + g.items.length, 0);

  // Magha is tenth in the strip. Without this, computing it from birth details
  // left the bar showing Ashwini…Punarvasu with nothing underlined, which reads
  // as "nothing happened".
  const tab = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    tab.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [nak?.name]);

  function pick(name: string) {
    setNakName(name);
    setPada(null);
    setFound(null);
    haptic(8);
  }

  async function findNakshatra() {
    if (!dob || busy) return;
    setBusy(true); setErr(null);
    try {
      const q = new URLSearchParams({ dob, ...(tob && { tob }), ...(place && { place }) });
      const res = await fetch(`/api/kundli?${q}`);
      if (!res.ok) throw new Error();
      const k = await res.json();
      if (!k?.moon?.nakshatra) throw new Error();
      setFound({ nak: k.moon.nakshatra, pada: k.moon.pada, when: prettyWhen(dob, tob), place: k.place || place });
      setNakName(k.moon.nakshatra);
      setPada(null);
      setManual(false);
      haptic(12);
    } catch {
      setErr(t("Could not work that out. Check the date and place.", "गणना नहीं हो सकी। तिथि और स्थान जाँचें।"));
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-[5px] px-2.5 py-2 text-[12.5px] text-ink outline-none";
  const fieldStyle = { background: "var(--surface)", border: "1px solid var(--line-strong)" };

  return (
    <div className="flex h-full flex-col">
      {/* Header and nakshatra strip are one yellow block. The strip is how you
          move around this screen, so it belongs to the bar. */}
      <div className="shrink-0" style={{ background: "var(--bar-yellow)" }}>
        <div
          className="flex items-center gap-2.5 gutter"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 11px)", paddingBottom: 10 }}
        >
          <button onClick={back} aria-label="Back" className="shrink-0">
            <CaretLeft size={20} weight="regular" className="text-ink" />
          </button>
          <div className={cx("min-w-0 flex-1 truncate font-display text-[17px] leading-tight text-ink", hi && "font-deva")}>
            {t("Naamkaran", "नामकरण")}
          </div>
          {/* One script at a time. Roman and Devanagari side by side doubled
              every line and read as clutter; this picks which one you read. */}
          <div className="flex shrink-0 items-center overflow-hidden rounded-[5px]"
            style={{ border: "1px solid rgba(0,0,0,0.28)" }}>
            {([["en", "A"], ["hi", "अ"]] as const).map(([s, l]) => (
              <button
                key={s}
                onClick={() => { setScript(s); haptic(6); }}
                aria-label={s === "en" ? "Roman" : "Devanagari"}
                className={cx("px-2 py-0.5 text-[13px] leading-[1.35]", s === "hi" && "font-deva")}
                style={script === s
                  ? { background: "var(--ink)", color: "var(--bar-yellow)" }
                  : { color: "var(--ink)" }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="-mx-1 flex gap-4 overflow-x-auto gutter no-scrollbar">
          {nakshatras.map((n) => {
            const on = n.name === nak?.name;
            return (
              <button
                key={n.name}
                ref={on ? tab : undefined}
                onClick={() => pick(n.name)}
                className={cx(
                  "shrink-0 whitespace-nowrap pb-2 pt-0.5 text-[12px] text-ink",
                  hi && "font-deva",
                  on ? "font-medium" : "opacity-60",
                )}
                style={{ borderBottom: on ? "2px solid var(--ink)" : "2px solid transparent" }}
              >
                {hi ? n.deva : n.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
        {nak && (
          <>
            <div className="gutter pb-4 pt-3.5" style={{ background: "var(--surface-2)" }}>
              {/* Everything about the nakshatra reads down the left. The deity
                  and lord used to float in the top-right corner as two bare
                  words, competing with the name and telling the reader nothing
                  about what they were; they are labelled and in the stack. */}
              <h2 className={cx(
                "leading-none tracking-[-0.028em] text-ink",
                hi ? "font-deva text-[24px]" : "font-display text-[26px]",
              )}>
                {hi ? nak.deva : nak.name}
              </h2>

              {(found || nak.name === mine) && (
                <div className={cx("mt-2 text-[10.5px] leading-relaxed text-ink", hi && "font-deva")}>
                  {found
                    ? <>{t("Born", "जन्म")} {found.when}{found.place && ` · ${found.place}`} · {t("pada", "पाद")} {found.pada}</>
                    : t("Your janma nakshatra", "आपका जन्म नक्षत्र")}
                </div>
              )}

              {/* Written out as a sentence. As a label-and-value pair it read
                  like a spec sheet; the phrasing below stays grammatical whether
                  the deity is one (Yama) or many (the Ashwini Kumaras). */}
              <p className={cx("mt-1.5 text-[10.5px] leading-relaxed text-ink", hi && "font-deva")}>
                {hi
                  ? <>इस नक्षत्र के देवता <span className="font-medium">{nak.deityh}</span> हैं, और इसका स्वामी ग्रह <span className="font-medium">{nak.planeth}</span> है।</>
                  : <>Presided over by <span className="font-medium">{nak.deity}</span>, with <span className="font-medium">{nak.planet}</span> as its ruling planet.</>}
              </p>

              {/* Say what the four letters are before showing them. The sentence
                  used to sit underneath, which is one beat too late. */}
              <div className={cx("mt-4 text-[11px] text-ink", hi && "font-deva")}>
                {t("The name should begin with one of these sounds",
                   "नाम इन्हीं में से किसी एक ध्वनि से आरंभ होना चाहिए")}
              </div>

              <div className="mt-2 flex"
                style={{ borderTop: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)" }}>
                {syl.map((s, i) => {
                  const n = groups.find((g) => g.s === s)?.items.length ?? 0;
                  const on = pada === i;
                  return (
                    <button
                      key={`${s}-${i}`}
                      onClick={() => { setPada(on ? null : i); haptic(6); }}
                      disabled={!n}
                      className="flex-1 py-3 text-center disabled:opacity-100"
                      style={{ borderLeft: i ? "1px solid var(--line)" : undefined }}
                    >
                      <div
                        className={cx("leading-[1.05]", hi ? "font-deva text-[38px]" : "font-display text-[30px] tracking-[-0.03em]", !n && "opacity-25")}
                        style={{ color: on ? "var(--bhagwa-deep)" : "var(--ink)" }}
                      >
                        {hi ? (syld[i] ?? s) : s}
                      </div>
                      <div className={cx("mt-1.5 text-[10px] leading-none", hi && "font-deva", !n && "opacity-45")}
                        style={{ color: on ? "var(--bhagwa-deep)" : "var(--ink)" }}>
                        {n ? `${n} ${t(n === 1 ? "name" : "names", "नाम")}` : t("none yet", "अभी नहीं")}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className={cx("mt-2 text-[10px] text-[var(--muted-2)]", hi && "font-deva")}>
                {pada === null
                  ? t("Tap a sound to see only its names.", "किसी ध्वनि पर दबाएँ, केवल उसी के नाम दिखेंगे।")
                  : t(`Showing ${syl[pada]} only. Tap it again for all four.`, `केवल ${syld[pada] ?? syl[pada]} दिखाया जा रहा है। चारों के लिए दोबारा दबाएँ।`)}
              </p>
            </div>

            {/* Don't-know path. A parent has the birth certificate, not the
                nakshatra, so the screen offers to work it out from what they
                do have rather than leaving them to guess at the strip above. */}
            <div className="gutter py-3" style={{ borderBottom: "1px solid var(--line)" }}>
              {!manual && !found && (
                <button
                  onClick={() => { setManual(true); haptic(6); }}
                  className={cx("text-[12px] text-[var(--bhagwa-deep)] underline underline-offset-2", hi && "font-deva")}
                >
                  {t("Don't know the nakshatra? Enter the birth details",
                     "नक्षत्र नहीं पता? जन्म विवरण भरें")}
                </button>
              )}

              {found && (
                <button
                  onClick={() => { setManual(true); haptic(6); }}
                  className={cx("text-[12px] text-[var(--bhagwa-deep)] underline underline-offset-2", hi && "font-deva")}
                >
                  {t("Change the birth details", "जन्म विवरण बदलें")}
                </button>
              )}

              {manual && (
                <div>
                  <div className={cx("text-[12px] font-medium text-ink", hi && "font-deva")}>
                    {t("Baby's birth details", "शिशु का जन्म विवरण")}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className={cx("text-[10.5px] text-ink", hi && "font-deva")}>{t("Date of birth", "जन्म तिथि")}</span>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                        className={cx(field, "mt-1")} style={fieldStyle} />
                    </label>
                    <label className="block">
                      <span className={cx("text-[10.5px] text-ink", hi && "font-deva")}>{t("Time of birth", "जन्म समय")}</span>
                      <input type="time" value={tob} onChange={(e) => setTob(e.target.value)}
                        className={cx(field, "mt-1")} style={fieldStyle} />
                    </label>
                  </div>
                  <label className="mt-2 block">
                    <span className={cx("text-[10.5px] text-ink", hi && "font-deva")}>{t("Place of birth", "जन्म स्थान")}</span>
                    <input value={place} onChange={(e) => setPlace(e.target.value)}
                      placeholder={t("City or town", "शहर या कस्बा")}
                      className={cx(field, "mt-1 placeholder:text-[var(--muted-2)]")} style={fieldStyle} />
                  </label>

                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={findNakshatra}
                      disabled={!dob || busy}
                      className="flex items-center gap-1.5 rounded-[5px] btn-saffron px-3 py-2 text-[12px] disabled:opacity-45"
                    >
                      {busy && <CircleNotch size={13} weight="bold" className="animate-spin" />}
                      {busy ? t("Working it out…", "गणना हो रही है…") : t("Find the sounds", "ध्वनियाँ ढूँढें")}
                    </button>
                    <button
                      onClick={() => { setManual(false); setErr(null); }}
                      className={cx("text-[12px] text-ink opacity-70", hi && "font-deva")}
                    >
                      {t("Cancel", "रद्द करें")}
                    </button>
                  </div>

                  <p className={cx("mt-2 text-[10px] leading-relaxed text-[var(--muted-2)]", hi && "font-deva")}>
                    {t("The nakshatra depends on the exact time and place, so give both if you have them.",
                       "नक्षत्र सही समय और स्थान पर निर्भर करता है, दोनों उपलब्ध हों तो अवश्य भरें।")}
                  </p>
                  {err && <p className={cx("mt-1.5 text-[11px] text-[var(--bhagwa-dark)]", hi && "font-deva")}>{err}</p>}
                </div>
              )}
            </div>

            {/* Filter and count share the line the list starts on. */}
            <div className="flex items-center gap-1.5 gutter py-2" style={{ borderBottom: "1px solid var(--line)" }}>
              {([["all", t("All", "सभी"), null], ["m", t("Boy", "बालक"), "m"], ["f", t("Girl", "बालिका"), "f"]] as const).map(([g, l, mark]) => {
                const on = gender === g;
                return (
                  <button
                    key={g}
                    onClick={() => { setGender(g); haptic(6); }}
                    className={cx("flex items-center gap-1 rounded-[5px] px-2.5 py-1 text-[12px]", hi && "font-deva")}
                    style={on
                      ? { background: "var(--ink)", color: "#FFFFFF" }
                      : { color: "var(--ink)", border: "1px solid var(--line-strong)" }}
                  >
                    {mark === "m" && <GenderMale size={13} weight="bold" />}
                    {mark === "f" && <GenderFemale size={13} weight="bold" />}
                    {l}
                  </button>
                );
              })}
              <span className={cx("ml-auto text-[11px] tnum text-ink", hi && "font-deva")}>
                {total} {t(total === 1 ? "name" : "names", "नाम")}
              </span>
            </div>

            {/* The index. The akshara hangs in its own column with a rule beside
                it, so the sound stays visible the whole way down its run. */}
            <div className="gutter">
              {shown.filter((g) => g.items.length).map((g) => (
                <div key={`${g.s}-${g.i}`} className="flex gap-3 pt-4">
                  <div className="w-9 shrink-0 pt-0.5 text-right">
                    <div className={cx("leading-none text-[var(--bhagwa-deep)]", hi ? "font-deva text-[19px]" : "font-display text-[15px]")}>
                      {hi ? g.d : g.s}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pl-3" style={{ borderLeft: "1px solid var(--line)" }}>
                    {g.items.map((x, i) => (
                      <div key={x.n} className={cx("flex items-start gap-3", i > 0 && "mt-3.5")}>
                        <div className="min-w-0 flex-1">
                          <div className={cx("truncate leading-tight text-ink", hi ? "font-deva text-[18px]" : "font-display text-[16.5px]")}>
                            {hi ? (x.deva ?? x.n) : x.n}
                          </div>
                          <div className={cx("mt-1 truncate text-[11px] text-ink", hi && "font-deva")}>
                            {hi ? x.mh : x.m}
                          </div>
                        </div>
                        {/* Spelt out. A bare Mars or Venus glyph at 12px asks the
                            reader to decode an astronomical symbol before they
                            can tell whose name it is; the word does not. The
                            girl tag carries a warm fill so the two are also
                            separable at a glance while scrolling. */}
                        <span
                          className={cx("flex shrink-0 items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10.5px] text-ink", hi && "font-deva")}
                          style={{
                            border: "1px solid var(--line-strong)",
                            background: x.g === "f" ? "var(--surface-2)" : "transparent",
                          }}
                        >
                          {x.g === "m"
                            ? <><GenderMale size={11} weight="bold" />{t("Boy", "बालक")}</>
                            : <><GenderFemale size={11} weight="bold" />{t("Girl", "बालिका")}</>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Said plainly rather than padded with invented names. */}
              {shown.some((g) => !g.items.length) && (
                <p className={cx("mt-5 border-t pt-3 text-[10.5px] leading-relaxed text-ink", hi && "font-deva")}
                  style={{ borderColor: "var(--line)" }}>
                  {hi
                    ? <>{shown.filter((g) => !g.items.length).map((g) => g.d).join(", ")} के लिए अभी कोई नाम दर्ज नहीं है। कुछ पदों के नाम प्रचलन में नहीं हैं, ऐसे में पंडित जी निकटतम ध्वनि सुझाते हैं।</>
                    : <>Nothing recorded yet for {shown.filter((g) => !g.items.length).map((g) => g.s).join(", ")}. A few padas have almost no names in use, and a pandit will offer a neighbouring sound.</>}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
