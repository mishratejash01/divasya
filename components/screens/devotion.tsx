"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Flower2, Check, ShieldCheck, Video, Radio, Play, MapPin,
  Leaf, Flame, Citrus, Droplets, Utensils, Landmark, Eye, Shell,
} from "lucide-react";
import { useApp } from "../app-context";
import { cx } from "../ui";
import { PUJAS, CHADHAVA, TEMPLES, templeById } from "@/lib/demo";
import { logEvent } from "@/lib/chat";
import * as db from "@/lib/db";
import { bell, conch } from "@/lib/sound";

type Item = { kind: "puja" | "chadhava"; id?: string; name: string; price: number; benefit?: string };

const CHADHAVA_ICON: Record<string, typeof Leaf> = {
  c1: Leaf, c2: Flame, c3: Citrus, c4: Flower2, c5: Droplets, c6: Utensils,
};

function ItemMark({ item, size = 48 }: { item: Item; size?: number }) {
  const Icon = item.id ? CHADHAVA_ICON[item.id] : undefined;
  return (
    <div className="grid shrink-0 place-items-center rounded-xl font-display text-[var(--gold-soft)]"
      style={{ width: size, height: size, background: "rgba(196,168,104,0.07)", border: "1px solid var(--line-gold)", fontSize: Math.round(size * 0.44) }}>
      {Icon ? <Icon size={Math.round(size * 0.42)} className="text-[var(--saffron-soft)]" strokeWidth={1.6} /> : "ॐ"}
    </div>
  );
}

/* ---------------- Puja + Chadhava ---------------- */
export function PujaScreen() {
  const { back, haptic, profile, user } = useApp();
  const [tab, setTab] = useState<"puja" | "chadhava">("puja");
  const [sel, setSel] = useState<Item | null>(null);
  const [step, setStep] = useState<"form" | "paying" | "done">("form");
  const [templeId, setTempleId] = useState(TEMPLES[0].id);
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
      if (user && sel) db.saveBooking(user.id, { kind: sel.kind, item: sel.name, price: sel.price, temple: templeById(templeId).name, sankalp_name: name, gotra, wish, booking_ref: id });
    }, 1600);
  }

  return (
    <div className="flex h-full flex-col pt-12">
      <div className="flex items-center gap-3 px-5 py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
        <span className="font-display text-lg text-ink">Online Puja & Chadhava</span>
      </div>

      <div className="mx-5 grid grid-cols-2 gap-1 rounded-full p-1 surface">
        {(["puja", "chadhava"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("rounded-full py-2 text-[12.5px]", tab === t ? "btn-saffron" : "text-muted")}>
            {t === "puja" ? "Pujas" : "e-Chadhava"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        {tab === "puja" ? (
          <div className="space-y-2.5">
            {PUJAS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl surface p-3.5">
                <ItemMark item={{ kind: "puja", name: p.name, price: p.price }} />
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-ink">{p.name}</div>
                  <div className="text-[11.5px] text-muted">{p.benefit}</div>
                </div>
                <button onClick={() => open({ kind: "puja", id: p.id, name: p.name, price: p.price, benefit: p.benefit })}
                  className="rounded-full px-3.5 py-2 text-[12px] btn-saffron">₹{p.price}</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {CHADHAVA.map((c) => (
              <button key={c.id} onClick={() => open({ kind: "chadhava", id: c.id, name: c.name, price: c.price })}
                className="flex flex-col items-center gap-2 rounded-2xl surface px-1 py-4">
                <ItemMark item={{ kind: "chadhava", id: c.id, name: c.name, price: c.price }} size={42} />
                <span className="text-center text-[11px] leading-tight text-ink">{c.name}</span>
                <span className="text-[12px] text-gold">₹{c.price}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted"><ShieldCheck size={13} className="text-[var(--good)]" /> Performed by verified pandits · video proof on WhatsApp</div>
      </div>

      {/* booking sheet */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-end" style={{ background: "rgba(8,6,4,0.6)", backdropFilter: "blur(3px)" }}
            onClick={() => step !== "paying" && setSel(null)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()}
              className="max-h-[88%] w-full overflow-y-auto rounded-t-3xl p-5 pb-7 no-scrollbar" style={{ background: "var(--surface)", borderTop: "1px solid var(--line-strong)" }}>
              <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />

              {step === "form" && (
                <>
                  <div className="flex items-center gap-3">
                    <ItemMark item={sel} />
                    <div className="flex-1"><div className="text-[15px] font-medium text-ink">{sel.name}</div>{sel.benefit && <div className="text-[11.5px] text-muted">{sel.benefit}</div>}</div>
                    <div className="font-display text-xl text-gold">₹{sel.price}</div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <Field label="Temple">
                      <select value={templeId} onChange={(e) => setTempleId(e.target.value)}
                        className="w-full bg-transparent text-[14px] text-ink outline-none">
                        {TEMPLES.map((t) => <option key={t.id} value={t.id} className="bg-[#1a1714]">{t.name} · {t.location}</option>)}
                      </select>
                    </Field>
                    <Field label="Your name (Sankalp)"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-[14px] text-ink outline-none" /></Field>
                    <Field label="Gotra"><input value={gotra} onChange={(e) => setGotra(e.target.value)} className="w-full bg-transparent text-[14px] text-ink outline-none" /></Field>
                    <Field label="Manokamna (your wish)"><input value={wish} onChange={(e) => setWish(e.target.value)} placeholder="e.g. health & success of family" className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-muted" /></Field>
                  </div>

                  <button onClick={pay} className="mt-4 w-full rounded-2xl py-3.5 text-[14px] btn-saffron">Proceed to Pay ₹{sel.price}</button>
                  <div className="mt-2 text-center text-[11px] text-muted">UPI · Cards · Netbanking · 100% secure</div>
                </>
              )}

              {step === "paying" && (
                <div className="flex flex-col items-center py-10">
                  <div className="h-10 w-10 animate-spin rounded-full" style={{ border: "3px solid var(--line)", borderTopColor: "var(--saffron)" }} />
                  <div className="mt-4 text-[14px] text-ink">Confirming your sankalp…</div>
                  <div className="text-[12px] text-muted">Securing payment of ₹{sel.price}</div>
                </div>
              )}

              {step === "done" && (
                <div className="flex flex-col items-center py-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-16 w-16 place-items-center rounded-full" style={{ background: "rgba(110,158,118,0.16)" }}>
                    <Check size={34} className="text-[var(--good)]" />
                  </motion.div>
                  <div className="mt-3 font-display text-xl text-ink">Booking Confirmed</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-muted">
                    {sel.name} will be performed in the name of <span className="text-ink">{name}</span> ({gotra} gotra) at {templeById(templeId).name}.
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-full surface px-3 py-2 text-[12px] text-ink"><Video size={14} className="text-[var(--good)]" /> HD ritual video on WhatsApp within 48h</div>
                  <div className="mt-2 text-[12px] text-muted">Booking ID · {bookingId}</div>
                  <button onClick={() => setSel(null)} className="mt-4 w-full rounded-2xl py-3 text-[14px] btn-ghost">Done</button>
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
    <div className="rounded-xl px-3.5 py-2.5" style={{ border: "1px solid var(--line-strong)" }}>
      <div className="text-[10.5px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

/* ---------------- Temple directory + Live Darshan ---------------- */
export function TempleScreen() {
  const { back, go, haptic } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [aarti, setAarti] = useState(false);

  if (open) {
    const t = templeById(open);
    return (
      <div className="flex h-full flex-col pt-12">
        <div className="flex items-center gap-3 px-5 py-3">
          <button onClick={() => { setOpen(null); setAarti(false); }} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
          <span className="font-display text-lg text-ink">{t.name}</span>
        </div>

        {/* live player */}
        <div className="relative mx-5 overflow-hidden rounded-2xl" style={{ aspectRatio: "16/10", background: `linear-gradient(160deg, ${t.grad[0]}, ${t.grad[1]})` }}>
          {t.youtubeId ? (
            <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${t.youtubeId}?autoplay=1&mute=1`} allow="autoplay; encrypted-media" />
          ) : (
            <div className="relative grid h-full w-full place-items-center">
              <Landmark size={62} strokeWidth={1.1} className="animate-pulseGlow text-[var(--gold-soft)]" />
              <div className="absolute inset-0 shimmer opacity-30" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Radio size={12} className="animate-pulse text-[#c2706a]" /> LIVE
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white"><Eye size={12} /> {(12480).toLocaleString("en-IN")} watching</div>
          <button onClick={() => { setAarti((v) => !v); if (!aarti) { bell(540, 1.6, 0.18); } }}
            className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[12px] text-white">
            <Play size={13} /> {aarti ? "Aarti playing" : "Play Aarti"}
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-1.5 text-[12px] text-muted"><MapPin size={13} /> {t.location} · {t.deity}</div>
          <div className="mt-1 text-[12px] text-gold">{t.timing}</div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{t.about}</p>
          <button onClick={() => go("puja")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] btn-saffron">
            <Flower2 size={16} /> Book Puja / Chadhava here
          </button>
          <button onClick={() => { conch(); haptic([14, 40, 14]); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] btn-ghost"><Shell size={15} /> Offer a virtual Shankhnaad</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      <div className="flex items-center gap-3 px-5 py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
        <span className="font-display text-lg text-ink">Live Temple Darshan</span>
      </div>
      <div className="space-y-2.5 px-5">
        {TEMPLES.map((t) => (
          <button key={t.id} onClick={() => { setOpen(t.id); haptic(8); }} className="flex w-full items-center gap-3 overflow-hidden rounded-2xl surface p-3 text-left">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-xl" style={{ background: `linear-gradient(160deg, ${t.grad[0]}, ${t.grad[1]})`, border: "1px solid var(--line)" }}>
              <Landmark size={26} strokeWidth={1.4} className="text-[var(--gold-soft)]" />
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-bold text-white"><Radio size={8} className="text-[#c2706a]" />LIVE</span>
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-medium text-ink">{t.name}</div>
              <div className="text-[11.5px] text-muted">{t.location} · {t.deity}</div>
              <div className="text-[11px] text-gold">{t.timing}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
