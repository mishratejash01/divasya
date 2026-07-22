"use client";

import { useState } from "react";
import { IconShankh } from "../icons";
import { motion, AnimatePresence } from "framer-motion";
import { Bank, Broadcast, CaretLeft, Check, Drop, Eye, Fire, FlowerLotus, ForkKnife, Leaf, MapPin, Orange, Play, ShieldCheck, VideoCamera } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
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

      <div className="gutter-m grid grid-cols-2 gap-1 rounded-full p-1 surface">
        {(["puja", "chadhava"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("rounded-full py-2 text-[11px]", tab === t ? "btn-saffron" : "text-muted")}>
            {t === "puja" ? "Pujas" : "e-Chadhava"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto gutter pt-4 screen-bottom no-scrollbar">
        {tab === "puja" ? (
          <div className="space-y-2.5">
            {pujas.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl surface p-3">
                <ItemMark item={{ kind: "puja", name: p.name, price: p.price }} />
                <div className="flex-1">
                  <div className="text-[12.5px] font-medium text-ink">{p.name}</div>
                  <div className="text-[10.5px] text-muted">{p.benefit}</div>
                </div>
                <button onClick={() => open({ kind: "puja", id: p.id, name: p.name, price: p.price, benefit: p.benefit })}
                  className="rounded-full px-3.5 py-2 text-[11px] btn-saffron">₹{p.price}</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {chadhava.map((c) => (
              <button key={c.id} onClick={() => open({ kind: "chadhava", id: c.id, name: c.name, price: c.price, icon: c.icon })}
                className="flex flex-col items-center gap-2 rounded-2xl surface px-1 py-4">
                <ItemMark item={{ kind: "chadhava", id: c.id, name: c.name, price: c.price, icon: c.icon }} size={38} />
                <span className="text-center text-[10px] leading-tight text-ink">{c.name}</span>
                <span className="text-[11px] text-gold">₹{c.price}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted"><ShieldCheck size={12} className="text-[var(--good)]" /> Performed by verified pandits · video proof on WhatsApp</div>
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

        {/* live player */}
        <div className="relative gutter-m overflow-hidden rounded-2xl" style={{ aspectRatio: "16/10", background: "var(--surface-2)" }}>
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
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white">
            <Broadcast size={12} className="animate-pulse text-[var(--good)]" /> Live
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] text-white"><Eye size={12} /> {(12480).toLocaleString("en-IN")} watching</div>
          <button onClick={() => { setAarti((v) => !v); if (!aarti) { bell(540, 1.6, 0.18); } }}
            className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] text-white">
            <Play size={12} /> {aarti ? "Aarti playing" : "Play Aarti"}
          </button>
        </div>

        <div className="gutter pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted"><MapPin size={12} /> {t.location} · {t.deity}</div>
          <div className="mt-1 text-[11px] text-gold">{t.timing}</div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">{t.about}</p>
          <button onClick={() => go("puja")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[12.5px] btn-saffron">
            <FlowerLotus size={14} /> Book Puja / Chadhava here
          </button>
          <button onClick={() => { conch(); haptic([14, 40, 14]); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[11.5px] btn-ghost"><IconShankh size={14} /> Offer a virtual Shankhnaad</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Live Temple Darshan" onBack={back} />
      <div className="space-y-2.5 gutter">
        {temples.map((t) => (
          <button key={t.id} onClick={() => { setOpen(t.id); haptic(8); }} className="flex w-full items-center gap-3 overflow-hidden rounded-2xl surface p-3 text-left">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-xl" style={{ background: `linear-gradient(160deg, ${t.grad[0]}33, ${t.grad[0]}14)`, border: "1px solid var(--line)" }}>
              <Bank size={23} className="text-[var(--bhagwa-deep)]" />
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium" style={{ background: "rgba(95,134,87,0.14)", color: "var(--good)" }}><Broadcast size={8} className="text-[var(--good)]" />Live</span>
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-medium text-ink">{t.name}</div>
              <div className="text-[10.5px] text-muted">{t.location} · {t.deity}</div>
              <div className="text-[10px] text-gold">{t.timing}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
