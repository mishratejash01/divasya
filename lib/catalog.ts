// ============================================================================
//  DIVASYA — backend catalog layer
//  All app content is served from Supabase (see migration 002). Each loader
//  caches in-memory for the session and degrades gracefully to local seed
//  data only if the network fails — the database is the source of truth.
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "./supabase";
import {
  DEITIES, MANTRAS, ASTROLOGERS, TEMPLES, PUJAS, CHADHAVA, LIBRARY,
  NAKSHATRA_SYLLABLES, BABY_NAMES,
  Deity, Mantra, Astrologer, Temple,
} from "./demo";

export type Puja = { id: string; name: string; benefit: string; price: number };
export type ChadhavaItem = { id: string; name: string; price: number; icon: string };
export type Festival = {
  id: string; name: string; date: string; deva: string | null; about: string | null;
  muhurat: string | null; samagri: string[]; vidhi: string[]; icon: string;
  name_hi: string | null; about_hi: string | null; muhurat_hi: string | null;
  samagri_hi: string[]; vidhi_hi: string[];
};
export type Article = {
  id: string; title: string; sub: string; read: string; kind: string;
  content: string; tint: string; grad: [string, string];
  title_hi: string; sub_hi: string; content_hi: string; category: string;
  image?: string;
};
export type Shloka = { id: number; deva: string; translit: string; meaning: string; meaning_hi: string | null; source: string; deity: string };
export type VastuZone = { dir: string; zone: string; use: string; tip: string; zone_hi: string; use_hi: string; tip_hi: string };
export type NakshatraSyl = {
  name: string; deva: string; syl: string[]; syld: string[];
  deity: string; deityh: string; planet: string; planeth: string;
};
export type BabyName = { n: string; deva?: string; g: "m" | "f"; m: string; mh: string; syl: string };

// darken a hex tint for legacy grad pairs
export function shade(hex: string, f = 0.72): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = (v: number) => Math.max(0, Math.round(v * f)).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

const cache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, load: () => Promise<T>, fallback: T): Promise<T> {
  if (!cache.has(key)) {
    cache.set(
      key,
      load().catch(() => { cache.delete(key); return fallback; })
    );
  }
  return cache.get(key) as Promise<T>;
}

async function rows<T>(table: string, order = "sort"): Promise<T[]> {
  const { data, error } = await supabaseBrowser().from(table).select("*").order(order, { ascending: true });
  if (error || !data || data.length === 0) throw error ?? new Error("empty");
  return data as T[];
}

// ---------------------------------------------------------------- loaders
export const getDeities = () =>
  cached<Deity[]>("deities", async () => {
    const r = await rows<Record<string, string>>("deities");
    return r.map((d) => ({
      id: d.id, name: d.name, deva: d.deva, symbol: "", color: d.color,
      glow: `${d.color}4d`, tagline: d.tagline, tagline_hi: d.tagline_hi ?? d.tagline, persona: d.persona,
      suggestedMantraId: d.suggested_mantra_id, aarti: d.aarti,
    }));
  }, DEITIES);

export const getMantras = () =>
  cached<Mantra[]>("mantras", async () => {
    const r = await rows<Record<string, never>>("mantras");
    return r.map((m) => ({
      id: m["id"], name: m["name"], deva: m["deva"], translit: m["translit"],
      deity: m["deity"], defaultTarget: m["default_target"] ?? 108,
    }));
  }, MANTRAS);

export const getAstrologers = () =>
  cached<Astrologer[]>("astrologers", async () => {
    const r = await rows<Record<string, never>>("astrologers");
    return r.map((a) => ({
      id: a["id"], name: a["name"], specialty: a["specialty"], tags: a["tags"] ?? [],
      exp: a["exp"], rating: Number(a["rating"]), orders: a["orders_label"], langs: a["langs"],
      rate: a["rate"], status: a["status"] as "online" | "busy", wait: a["wait_label"],
      grad: [a["tint"], shade(a["tint"])] as [string, string],
      photo: a["photo_url"] ?? undefined,
    }));
  }, ASTROLOGERS);

export const getTemples = () =>
  cached<Temple[]>("temples", async () => {
    const r = await rows<Record<string, never>>("temples");
    return r.map((t) => ({
      id: t["id"], name: t["name"], deity: t["deity"], location: t["location"],
      timing: t["timing"], about: t["about"],
      youtubeId: t["youtube_id"] ?? undefined,
      youtubeChannel: t["youtube_channel"] ?? undefined,
      grad: [t["tint"], shade(t["tint"], 0.55)] as [string, string],
    }));
  }, TEMPLES);

export const getPujas = () =>
  cached<Puja[]>("pujas", () => rows<Puja>("pujas"), PUJAS as Puja[]);

export const getChadhava = () =>
  cached<ChadhavaItem[]>("chadhava", () => rows<ChadhavaItem>("chadhava_items"),
    CHADHAVA.map((c) => ({ id: c.id, name: c.name, price: c.price, icon: c.icon })));

export const getFestivals = () =>
  cached<Festival[]>("festivals", async () => {
    const { data, error } = await supabaseBrowser().from("festivals").select("*").order("date");
    if (error || !data?.length) throw error ?? new Error("empty");
    return data as Festival[];
  }, []);

/** Festivals on/after today (fallback: last entries). */
export async function getUpcomingFestivals(limit = 6): Promise<Festival[]> {
  const all = await getFestivals();
  const today = new Date().toISOString().slice(0, 10);
  const up = all.filter((f) => f.date >= today);
  return (up.length ? up : all).slice(0, limit);
}

// Article artwork keyed by id. The database's image column is the source of
// truth (migration 020); this map only backs the offline demo fallback, and
// every id ships with a real photograph under public/library.
const LIBRARY_IMAGES: Record<string, string> = Object.fromEntries(
  [
    "l1", "l2", "l3", "l4", "l5", "l6",
    "prc-puja", "prc-japa", "prc-surya",
    "dei-krishna", "dei-shiva", "dei-durga", "dei-ganesha",
    "dei-lakshmi", "dei-ram", "dei-hanuman", "dei-saraswati",
    "wis-dharma", "wis-yugas", "wis-moksha", "wis-gunas", "wis-yoga-paths",
    "fes-diwali", "fes-holi", "fes-navratri", "fes-janmashtami", "fes-shivratri", "fes-ganesh",
    "jyo-kundli", "jyo-grahas", "jyo-houses", "jyo-nakshatras", "jyo-dasha", "jyo-rashi",
  ].map((id) => [id, `/library/${id}.jpg`]),
);

export const getLibrary = () =>
  cached<Article[]>("library", async () => {
    const r = await rows<Record<string, never>>("library_articles");
    return r.map((l) => ({
      id: l["id"], title: l["title"], sub: l["sub"], read: l["read_time"], kind: l["kind"],
      content: l["content"], tint: l["tint"], grad: [l["tint"], shade(l["tint"])] as [string, string],
      title_hi: l["title_hi"] ?? l["title"], sub_hi: l["sub_hi"] ?? l["sub"],
      content_hi: l["content_hi"] ?? l["content"], category: l["category"] ?? "wisdom",
      image: l["image"] ?? LIBRARY_IMAGES[l["id"]],
    }));
  }, LIBRARY.map((l) => ({
    id: l.id, title: l.title, sub: l.sub, read: l.read, kind: "read",
    content: l.content ?? "", tint: l.grad[0], grad: l.grad as [string, string],
    title_hi: l.title, sub_hi: l.sub, content_hi: l.content ?? "", category: "wisdom",
    image: l.image ?? LIBRARY_IMAGES[l.id],
  })));

export const getShlokas = () =>
  cached<Shloka[]>("shlokas", () => rows<Shloka>("shlokas", "id"), [{
    id: 1, deva: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    translit: "Karmanye vadhikaraste, ma phaleshu kadachana",
    meaning: "You have the right to action alone, never to its fruits.",
    meaning_hi: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फल में कभी नहीं।",
    source: "Bhagavad Gita 2.47", deity: "krishna",
  }]);

/** Deterministic daily rotation through the shloka bank. */
export async function getShlokaOfDay(date = new Date()): Promise<Shloka> {
  const all = await getShlokas();
  const start = new Date(date.getFullYear(), 0, 0);
  const doy = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return all[doy % all.length];
}

export const getVastuZones = () =>
  cached<VastuZone[]>("vastu", async () => {
    const r = await rows<Record<string, never>>("vastu_zones");
    return r.map((z) => ({
      dir: z["dir"], zone: z["zone"], use: z["use_for"], tip: z["tip"],
      zone_hi: z["zone_hi"] ?? z["zone"], use_hi: z["use_for_hi"] ?? z["use_for"], tip_hi: z["tip_hi"] ?? z["tip"],
    }));
  }, []);

export const getNakshatraSyllables = () =>
  cached<NakshatraSyl[]>("naksyl", async () => {
    const r = await rows<Record<string, never>>("nakshatra_syllables");
    return r.map((n) => ({
      name: n["name"], deva: n["deva"] ?? "", syl: n["syllables"] ?? [],
      syld: n["syllables_deva"] ?? [],
      deity: n["deity"], deityh: n["deity_hi"] ?? n["deity"],
      planet: n["planet"], planeth: n["planet_hi"] ?? n["planet"],
    }));
  }, NAKSHATRA_SYLLABLES);

export const getBabyNames = () =>
  cached<BabyName[]>("names", async () => {
    const { data, error } = await supabaseBrowser().from("baby_names").select("*");
    if (error || !data?.length) throw error ?? new Error("empty");
    return data.map((b) => ({
      n: b.name, deva: b.deva ?? undefined, g: b.gender as "m" | "f",
      m: b.meaning, mh: b.meaning_hi ?? b.meaning, syl: b.syllable,
    }));
  }, BABY_NAMES);

/** Daily horoscope for a rashi — served by /api/horoscope (Supabase-cached, AI-generated once per day). */
export async function getDailyHoroscope(rashi: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/horoscope?rashi=${encodeURIComponent(rashi)}`);
    if (!res.ok) return null;
    const j = await res.json();
    return j.text ?? null;
  } catch { return null; }
}

/** Pick the field for the active language, falling back to English when the Hindi is missing. */
export function tr(lang: "en" | "hi", en: string | null | undefined, hi: string | null | undefined): string {
  return ((lang === "hi" ? (hi || en) : en) ?? "");
}

// ---------------------------------------------------------------- hook
/** Load any catalog resource with a synchronous fallback — uniform pattern for screens. */
export function useCatalog<T>(loader: () => Promise<T>, initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    let on = true;
    loader().then((v) => { if (on && v) setValue(v); }).catch(() => {});
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
