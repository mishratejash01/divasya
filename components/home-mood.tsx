"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { portalRoot } from "./portal-root";
import { motion, AnimatePresence } from "framer-motion";
import { CaretRight } from "@phosphor-icons/react";
import { useApp, type ScreenName } from "./app-context";
import { RevealText } from "./reveal-text";

/**
 * "How is your mind today?" — a mood check-in on home that turns the app
 * towards how the person actually feels. Pick a mood (button → bottom sheet)
 * and the section answers with a line of guidance and the practices that fit
 * it: a mantra on the mala, a devta to talk to, a reading, an aarti. The
 * choice holds for the day and asks again tomorrow.
 */
type Lang = "en" | "hi";
type Action = { label: Record<Lang, string>; to: ScreenName; params?: Record<string, string>; deity?: string };
type Mood = {
  id: string;
  name: Record<Lang, string>;
  line: Record<Lang, string>;
  tint: [string, string];
  actions: Action[];
};

const MOODS: Mood[] = [
  {
    id: "peaceful",
    name: { en: "Peaceful", hi: "शांत" },
    line: {
      en: "Hold on to this stillness. A few rounds of Om Namah Shivaya keep the mind anchored through the day.",
      hi: "इस शांति को थामे रखिए। ॐ नमः शिवाय की कुछ मालाएँ पूरे दिन मन को स्थिर रखेंगी।",
    },
    tint: ["#2E4A7A", "#14284A"],
    actions: [
      { label: { en: "Chant Om Namah Shivaya", hi: "ॐ नमः शिवाय जपें" }, to: "mala", params: { mantraId: "shiva" } },
      { label: { en: "Offer aarti in My Mandir", hi: "मेरा मंदिर में आरती करें" }, to: "mandir" },
    ],
  },
  {
    id: "anxious",
    name: { en: "Anxious", hi: "बेचैन" },
    line: {
      en: "Fear loosens when the breath slows. Sit with Hanuman ji, chant slowly, and let each bead carry a worry away.",
      hi: "साँस धीमी हो तो भय ढीला पड़ता है। हनुमान जी के साथ बैठिए, धीरे जपिए, हर मनका एक चिंता ले जाए।",
    },
    tint: ["#B4461C", "#6E1F0C"],
    actions: [
      { label: { en: "Chant the Hanuman mantra", hi: "हनुमान मंत्र जपें" }, to: "mala", params: { mantraId: "hanuman" } },
      { label: { en: "Talk to Hanuman ji", hi: "हनुमान जी से बात करें" }, to: "ai", params: { mode: "deity" }, deity: "hanuman" },
    ],
  },
  {
    id: "sad",
    name: { en: "Low", hi: "उदास" },
    line: {
      en: "Joy and sorrow come and go like winter and summer, says Krishna (Gita 2.14). This too will pass. You are not alone in it.",
      hi: "सुख और दुःख सर्दी-गर्मी की तरह आते-जाते हैं, कहते हैं कृष्ण (गीता 2.14)। यह भी बीत जाएगा। आप अकेले नहीं हैं।",
    },
    tint: ["#3B4C8C", "#1C2556"],
    actions: [
      { label: { en: "Talk to Krishna", hi: "कृष्ण से बात करें" }, to: "ai", params: { mode: "deity" }, deity: "krishna" },
      { label: { en: "Read today's Gita verse", hi: "आज का गीता श्लोक पढ़ें" }, to: "gita" },
    ],
  },
  {
    id: "grateful",
    name: { en: "Grateful", hi: "कृतज्ञ" },
    line: {
      en: "Gratitude is the first offering. Light a diya, say thank you, and let Maa Lakshmi's grace stay in your home.",
      hi: "कृतज्ञता ही पहला अर्पण है। एक दीया जलाइए, धन्यवाद कहिए, माँ लक्ष्मी की कृपा घर में बनी रहे।",
    },
    tint: ["#A87A1E", "#5E3F08"],
    actions: [
      { label: { en: "Light a diya in My Mandir", hi: "मेरा मंदिर में दीया जलाएँ" }, to: "mandir" },
      { label: { en: "Chant the Lakshmi mantra", hi: "लक्ष्मी मंत्र जपें" }, to: "mala", params: { mantraId: "lakshmi" } },
    ],
  },
  {
    id: "confused",
    name: { en: "Unsure", hi: "उलझन में" },
    line: {
      en: "Every clear path begins with Ganesha. Ask your question; clarity follows the one who asks.",
      hi: "हर स्पष्ट मार्ग गणेश जी से शुरू होता है। अपना प्रश्न पूछिए, पूछने वाले को स्पष्टता मिलती है।",
    },
    tint: ["#5B2160", "#2E0F32"],
    actions: [
      { label: { en: "Ask the AI Jyotishi", hi: "AI ज्योतिषी से पूछें" }, to: "ai" },
      { label: { en: "Chant the Ganesha mantra", hi: "गणेश मंत्र जपें" }, to: "mala", params: { mantraId: "ganesha" } },
    ],
  },
  {
    id: "energetic",
    name: { en: "Energetic", hi: "उत्साहित" },
    line: {
      en: "Put this fire to good use. Begin with the Gayatri mantra and carry its light into everything you do today.",
      hi: "इस ऊर्जा को सही दिशा दीजिए। गायत्री मंत्र से शुरुआत कीजिए और उसका प्रकाश आज के हर काम में ले जाइए।",
    },
    tint: ["#0F4F49", "#062B27"],
    actions: [
      { label: { en: "Chant the Gayatri mantra", hi: "गायत्री मंत्र जपें" }, to: "mala", params: { mantraId: "gayatri" } },
      { label: { en: "Continue your journey", hi: "अपनी यात्रा जारी रखें" }, to: "journeys" },
    ],
  },
];

const KEY = "divasya:mood";
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function HomeMood() {
  const { lang, go, haptic, setDeity } = useApp();
  const [moodId, setMoodId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v?.date === today()) setMoodId(v.id);
    } catch {}
  }, []);

  function pick(id: string) {
    haptic(8);
    setMoodId(id);
    setOpen(false);
    try { localStorage.setItem(KEY, JSON.stringify({ id, date: today() })); } catch {}
  }

  const mood = MOODS.find((m) => m.id === moodId);
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <div className="reveal gutter pt-4">
      <section
        className="relative overflow-hidden rounded-2xl p-4 text-[#FDEFD6]"
        style={{ background: `linear-gradient(140deg, ${(mood?.tint ?? ["#153C6B", "#0A1F3B"])[0]} 0%, ${(mood?.tint ?? ["#153C6B", "#0A1F3B"])[1]} 100%)`, transition: "background 0.6s" }}
      >
        {/* a quiet moon in the corner, waxing with the card */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cosmic/phase-0.webp" alt="" className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 opacity-25" />

        <AnimatePresence mode="wait">
          {mood ? (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <RevealText
                as="h3"
                text={mood.name[lang]}
                className={lang === "hi" ? "font-deva text-[24px] leading-tight" : "font-display text-[24px] leading-tight"}
              />
              <p className={lang === "hi" ? "mt-2 font-deva text-[13.5px] leading-relaxed text-[#FDEFD6]/90" : "mt-2 text-[12.5px] leading-relaxed text-[#FDEFD6]/90"}>
                {mood.line[lang]}
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {mood.actions.map((a) => (
                  <button
                    key={a.label.en}
                    onClick={() => { haptic(6); if (a.deity) setDeity(a.deity); go(a.to, a.params); }}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px]"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <span>{a.label[lang]}</span>
                    <CaretRight size={14} weight="bold" />
                  </button>
                ))}
              </div>
              <button onClick={() => setOpen(true)} className="mt-3 text-[11px] text-[#F3D6B0] underline underline-offset-4">
                {t("Change mood", "मन बदलें")}
              </button>
            </motion.div>
          ) : (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className={lang === "hi" ? "font-deva text-[22px] leading-tight" : "font-display text-[22px] leading-tight"}>
                {t("How is your mind today?", "आज आपका मन कैसा है?")}
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#FDEFD6]/85">
                {t("Tell us how you feel and Divasya will shape today's practice around it.", "बताइए आप कैसा महसूस कर रहे हैं, दिव्यस्य आज की साधना उसी के अनुसार सजाएगा।")}
              </p>
              <button
                onClick={() => { haptic(6); setOpen(true); }}
                className="mt-3.5 rounded-full px-4 py-2 text-[12.5px] font-medium"
                style={{ background: "#FDEFD6", color: "#0A1F3B" }}
              >
                {t("Set my mood", "मेरा मन चुनें")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* the picker — a bottom sheet over everything */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[150] flex items-end"
                style={{ background: "rgba(10,10,20,0.45)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              >
                <motion.div
                  className="w-full rounded-t-3xl px-4 pt-3"
                  style={{ background: "var(--surface)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />
                  <div className={lang === "hi" ? "font-deva text-[18px] text-ink" : "font-display text-[18px] text-ink"}>
                    {t("How is your mind today?", "आज आपका मन कैसा है?")}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {MOODS.map((m, i) => (
                      <motion.button
                        key={m.id}
                        onClick={() => pick(m.id)}
                        className="flex h-[52px] items-center rounded-2xl px-3.5 text-left"
                        style={{
                          background: `linear-gradient(140deg, ${m.tint[0]}, ${m.tint[1]})`,
                          outline: m.id === moodId ? "2px solid var(--bhagwa)" : "none",
                          outlineOffset: 2,
                        }}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.35 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <span className={lang === "hi" ? "font-deva text-[15px] text-[#FDEFD6]" : "text-[13.5px] font-medium text-[#FDEFD6]"}>{m.name[lang]}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot()
        )}
    </div>
  );
}
