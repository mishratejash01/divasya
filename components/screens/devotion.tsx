"use client";

import { useState } from "react";
import { IconShankh } from "../icons";
import { motion, AnimatePresence } from "framer-motion";
import { Bank, CaretLeft, Check, Drop, Eye, Fire, FlowerLotus, ForkKnife, Leaf, MapPin, Orange, Play, VideoCamera } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, FilterChips, cx } from "../ui";
import { PUJAS, CHADHAVA, TEMPLES } from "@/lib/demo";
import { useCatalog, getPujas, getChadhava, getTemples } from "@/lib/catalog";
import { logEvent } from "@/lib/chat";
import * as db from "@/lib/db";
import { bell, conch } from "@/lib/sound";

type Item = { kind: "puja" | "chadhava"; id?: string; name: string; price: number; benefit?: string; icon?: string };

const CHADHAVA_ICON: Record<string, typeof Leaf> = {
  leaf: Leaf, flame: Fire, citrus: Orange, flower: FlowerLotus, droplets: Drop, utensils: ForkKnife,
};

function ItemMark({ item, size = 48 }: { item: Item; size?: number }) {
  const Icon = item.icon ? (CHADHAVA_ICON[item.icon] ?? FlowerLotus) : undefined;
  return (
    <div className="grid shrink-0 place-items-center rounded-xl font-display"
      style={{ width: size, height: size, background: "var(--surface-2)", border: "1px solid var(--line-gold)", color: "var(--bhagwa-deep)", fontSize: Math.round(size * 0.44) }}>
      {Icon ? <Icon size={Math.round(size * 0.42)} className="text-[var(--bhagwa)]" strokeWidth={1.6} /> : "ॐ"}
    </div>
  );
}

/**
 * The darshan stream URL for a temple, or null if none is configured.
 *
 * Always muted: a temple stream that starts talking the moment someone opens
 * the screen is the wrong first impression, and browsers refuse to autoplay
 * unmuted anyway. playsinline keeps iOS from throwing it fullscreen.
 *
 * To switch a temple on, set youtube_channel (a UC… id) on its row — that
 * follows the channel's current broadcast, so it survives each new stream.
 * youtube_id is only for a fixed recording. Neither is seeded locally: a wrong
 * id renders "Video unavailable", which is worse than the honest placeholder.
 */
function darshanEmbed(t: { youtubeChannel?: string; youtubeId?: string }): string | null {
  const p = "autoplay=1&mute=1&playsinline=1&rel=0";
  if (t.youtubeChannel) return `https://www.youtube.com/embed/live_stream?channel=${t.youtubeChannel}&${p}`;
  if (t.youtubeId) return `https://www.youtube.com/embed/${t.youtubeId}?${p}`;
  return null;
}

/* ---------------- Puja + Chadhava ---------------- */
export function PujaScreen() {
  const { back, haptic, profile, user, screen } = useApp();
  const pujas = useCatalog(getPujas, PUJAS);
  const chadhava = useCatalog(getChadhava, CHADHAVA.map((c) => ({ id: c.id, name: c.name, price: c.price, icon: "flower" })));
  const temples = useCatalog(getTemples, TEMPLES);
  // Home links straight to a tab, so honour the incoming param.
  const [tab, setTab] = useState<"puja" | "chadhava">(
    screen.params?.tab === "chadhava" ? "chadhava" : "puja"
  );
  const [sel, setSel] = useState<Item | null>(null);
  const [step, setStep] = useState<"form" | "paying" | "done">("form");
  const [templeId, setTempleId] = useState(TEMPLES[0].id);
  const selTemple = temples.find((t) => t.id === templeId) ?? temples[0];
  const [name, setName] = useState(profile?.name || "");
  const [gotra, setGotra] = useState("Kashyap");
  const [wish, setWish] = useState("");
  const [bookingId, setBookingId] = useState("");

  function open(it: Item) { setSel(it); setStep("form"); setWish(""); haptic(10); }
  function pay() {
    setStep("paying");
    setTimeout(() => {
      const id = "DV" + Math.floor(100000 + (Date.now() % 900000));
      setBookingId(id);
      setStep("done");
      bell(540, 1.8, 0.2);
      haptic([15, 40, 15]);
      logEvent("puja_booking", { item: sel?.name, price: sel?.price, temple: templeId });
      if (user && sel) db.saveBooking(user.id, { kind: sel.kind, item: sel.name, price: sel.price, temple: selTemple.name, sankalp_name: name, gotra, wish, booking_ref: id });
    }, 1600);
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Online Puja & Chadhava" onBack={back} />

      <FilterChips
        chips={[{ id: "puja", label: "Pujas" }, { id: "chadhava", label: "e-Chadhava" }]}
        active={tab}
        onSelect={(id) => setTab(id as "puja" | "chadhava")}
      />

      <div className="flex-1 overflow-y-auto gutter pt-1 screen-bottom no-scrollbar">
        {tab === "puja" ? (
          // A flat list of rows on a phone; a grid of cards on desktop so the
          // price sits with its puja rather than stranded across a wide row.
          <div className="pt-2 lg:grid lg:grid-cols-3 lg:gap-3 xl:grid-cols-4">
            {pujas.map((p) => (
              <button
                key={p.id}
                onClick={() => open({ kind: "puja", id: p.id, name: p.name, price: p.price, benefit: p.benefit })}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors lg:flex-col lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-[var(--tile-line)] lg:p-4 lg:hover:bg-[var(--surface-2)]"
              >
                <ItemMark item={{ kind: "puja", name: p.name, price: p.price }} />
                <div className="min-w-0 flex-1 lg:w-full lg:flex-none">
                  <div className="text-[12.5px] font-medium text-ink lg:text-[14px]">{p.name}</div>
                  <div className="text-[10.5px] text-muted lg:mt-0.5 lg:text-[12px]">{p.benefit}</div>
                </div>
                <span className="shrink-0 rounded-[6px] px-3.5 py-2 text-[11px] btn-saffron lg:mt-1 lg:w-full lg:py-2.5 lg:text-center lg:text-[13px]">₹{p.price}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="pt-2 lg:grid lg:grid-cols-3 lg:gap-3 xl:grid-cols-4">
            {chadhava.map((c) => (
              <button
                key={c.id}
                onClick={() => open({ kind: "chadhava", id: c.id, name: c.name, price: c.price, icon: c.icon })}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors lg:flex-col lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-[var(--tile-line)] lg:p-4 lg:hover:bg-[var(--surface-2)]"
              >
                <ItemMark item={{ kind: "chadhava", id: c.id, name: c.name, price: c.price, icon: c.icon }} />
                <div className="min-w-0 flex-1 lg:w-full lg:flex-none">
                  <div className="text-[12.5px] font-medium text-ink lg:text-[14px]">{c.name}</div>
                </div>
                <span className="shrink-0 rounded-[6px] px-3.5 py-2 text-[11px] btn-saffron lg:mt-1 lg:w-full lg:py-2.5 lg:text-center lg:text-[13px]">₹{c.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* booking sheet */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-end" style={{ background: "rgba(0,0,0,0.34)", backdropFilter: "blur(3px)" }}
            onClick={() => step !== "paying" && setSel(null)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()}
              className="max-h-[88%] w-full overflow-y-auto rounded-t-3xl p-4 pb-6 no-scrollbar" style={{ background: "var(--surface)", borderTop: "1px solid var(--line-gold)" }}>
              <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />

              {step === "form" && (
                <>
                  <div className="flex items-center gap-3">
                    <ItemMark item={sel} />
                    <div className="flex-1"><div className="text-[13.5px] font-medium text-ink">{sel.name}</div>{sel.benefit && <div className="text-[10.5px] text-muted">{sel.benefit}</div>}</div>
                    <div className="font-display text-xl text-gold">₹{sel.price}</div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <Field label="Temple">
                      <select value={templeId} onChange={(e) => setTempleId(e.target.value)}
                        className="w-full bg-transparent text-[12.5px] text-ink outline-none">
                        {temples.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.location}</option>)}
                      </select>
                    </Field>
                    <Field label="Your name (Sankalp)"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-[12.5px] text-ink outline-none" /></Field>
                    <Field label="Gotra"><input value={gotra} onChange={(e) => setGotra(e.target.value)} className="w-full bg-transparent text-[12.5px] text-ink outline-none" /></Field>
                    <Field label="Manokamna (your wish)"><input value={wish} onChange={(e) => setWish(e.target.value)} placeholder="e.g. health & success of family" className="w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted" /></Field>
                  </div>

                  <button onClick={pay} className="mt-4 w-full rounded-2xl py-3.5 text-[12.5px] btn-saffron">Proceed to Pay ₹{sel.price}</button>
                  <div className="mt-2 text-center text-[10px] text-muted">UPI · Cards · Netbanking · 100% secure</div>
                </>
              )}

              {step === "paying" && (
                <div className="flex flex-col items-center py-10">
                  <div className="h-10 w-10 animate-spin rounded-full" style={{ border: "3px solid var(--line)", borderTopColor: "var(--bhagwa)" }} />
                  <div className="mt-4 text-[12.5px] text-ink">Confirming your sankalp…</div>
                  <div className="text-[11px] text-muted">Securing payment of ₹{sel.price}</div>
                </div>
              )}

              {step === "done" && (
                <div className="flex flex-col items-center py-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-16 w-16 place-items-center rounded-full" style={{ background: "rgba(95,134,87,0.16)" }}>
                    <Check size={31} className="text-[var(--good)]" />
                  </motion.div>
                  <div className="mt-3 font-display text-xl text-ink">Booking Confirmed</div>
                  <div className="mt-1 text-[11.5px] leading-relaxed text-muted">
                    {sel.name} will be performed in the name of <span className="text-ink">{name}</span> ({gotra} gotra) at {selTemple.name}.
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-full surface px-3 py-2 text-[11px] text-ink"><VideoCamera size={13} className="text-[var(--good)]" /> HD ritual video on WhatsApp within 48h</div>
                  <div className="mt-2 text-[11px] text-muted">Booking ID · {bookingId}</div>
                  <button onClick={() => setSel(null)} className="mt-4 w-full rounded-2xl py-3 text-[12.5px] btn-ghost">Done</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-3.5 py-2.5" style={{ border: "1px solid var(--line-strong)", background: "var(--surface)" }}>
      <div className="eyebrow text-muted">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

/* ---------------- Temple directory + Live Darshan ---------------- */
export function TempleScreen() {
  const { back, go, haptic } = useApp();
  const temples = useCatalog(getTemples, TEMPLES);
  const [open, setOpen] = useState<string | null>(null);
  const [aarti, setAarti] = useState(false);

  if (open) {
    const t = temples.find((x) => x.id === open) ?? temples[0];
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader
          title={t.name}
          sub={`${t.deity} · ${t.location}`}
          onBack={() => { setOpen(null); setAarti(false); }}
        />

        {/* On desktop the player sits on the left and everything else — place,
            timing, about and the actions — stacks in a column on the right. */}
        <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom lg:flex lg:items-start lg:gap-6 lg:px-4 lg:pt-5">
          {/* live player */}
          <div className="relative mt-3 gutter-m overflow-hidden rounded-2xl lg:mx-0 lg:mt-0 lg:min-w-0 lg:flex-1" style={{ aspectRatio: "16/9", background: "var(--surface-2)" }}>
            {darshanEmbed(t) ? (
              <iframe
                className="h-full w-full"
                src={darshanEmbed(t)!}
                title={`${t.name} live darshan`}
                // mute=1 in the URL *and* autoplay in allow — browsers block
                // autoplay outright unless the player is muted.
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              // No stream yet — say so, rather than pulsing a decorative glyph.
              <div className="relative grid h-full w-full place-items-center">
                <span className="text-[11.5px] text-muted">Darshan begins at {t.timing}</span>
                <div className="absolute inset-0 shimmer opacity-25" />
              </div>
            )}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[10px] font-medium text-white" style={{ background: "#E11900" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] text-white"><Eye size={12} /> {(12480).toLocaleString("en-IN")} watching</div>
            <button onClick={() => { setAarti((v) => !v); if (!aarti) { bell(540, 1.6, 0.18); } }}
              className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] text-white">
              <Play size={12} /> {aarti ? "Aarti playing" : "Play Aarti"}
            </button>
          </div>

          <div className="gutter pt-4 lg:mx-0 lg:w-[340px] lg:shrink-0 lg:px-0 lg:pt-0">
            {/* Title + live status — the phone shows the name in its header, so
                this repeats only on desktop. */}
            <div className="hidden lg:block">
              <h1 className="font-display text-[19px] leading-snug text-ink">{t.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-[11.5px]">
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-white" style={{ background: "#E11900" }}>
                  <span className="h-1 w-1 rounded-full bg-white" /> LIVE
                </span>
                <span className="tnum text-muted">{(12480).toLocaleString("en-IN")} watching now</span>
              </div>
            </div>

            {/* Deity and place. */}
            <div className="mt-3 lg:mt-4">
              <div className="text-[12.5px] font-medium text-ink">{t.deity}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><MapPin size={11} /> {t.location}</div>
            </div>

            {/* Description panel — schedule then the note, the way a video page
                keeps its details in one box. */}
            <div className="mt-3 rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
              <div className="text-[11px] font-medium text-gold">Aarti · {t.timing}</div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-dim">{t.about}</p>
            </div>

            <button onClick={() => go("puja")} className="mt-4 w-full rounded-2xl py-3.5 text-center text-[12.5px] btn-saffron">Book Puja / Chadhava here</button>
            <button onClick={() => { conch(); haptic([14, 40, 14]); }} className="mt-2 w-full rounded-2xl py-3 text-center text-[11.5px] btn-ghost">Offer a virtual Shankhnaad</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Live Temple Darshan" onBack={back} />
      {/* On a phone, a 16:9 thumbnail with the name beside it, like a video
          list. On desktop it opens up into a gallery of large stream cards —
          full-width frames with a play badge — that fill the page. */}
      <div className="gutter pt-1 lg:pt-3">
        <div>
          {temples.map((t) => {
            const embed = darshanEmbed(t);
            return (
            <button
              key={t.id}
              onClick={() => { setOpen(t.id); haptic(8); }}
              className="flex w-full items-center gap-3 py-2.5 text-left transition-opacity hover:opacity-80 lg:gap-6 lg:py-4"
            >
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg lg:w-[360px]" style={{ background: `linear-gradient(160deg, ${t.grad[0]}33, ${t.grad[0]}14)` }}>
                {embed ? (
                  // The live stream plays right in the card; the click still opens
                  // the full player, so the iframe itself ignores the pointer.
                  <iframe
                    className="pointer-events-none h-full w-full"
                    src={embed}
                    title={`${t.name} live darshan`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                  />
                ) : (
                  <>
                    <div className="grid h-full w-full place-items-center" style={{ color: "var(--bhagwa-deep)" }}>
                      <Bank size={22} className="lg:hidden" />
                      <Bank size={46} className="hidden lg:block" />
                    </div>
                    {/* play badge on the placeholder, desktop only */}
                    <div className="absolute inset-0 hidden place-items-center lg:grid">
                      <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "rgba(0,0,0,0.34)" }}>
                        <Play size={18} weight="fill" className="ml-0.5 text-white" />
                      </span>
                    </div>
                  </>
                )}
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 text-[9px] font-medium text-white lg:left-2.5 lg:top-2.5 lg:text-[10.5px]" style={{ background: "#E11900" }}>
                  <span className="h-1 w-1 rounded-full bg-white" />Live
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-ink lg:text-[17px]">{t.name}</div>
                <div className="truncate text-[10.5px] text-muted lg:mt-1 lg:text-[12.5px]">{t.location} · {t.deity}</div>
                <div className="text-[10px] text-gold lg:mt-1 lg:text-[12px]">{t.timing}</div>
              </div>
            </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
