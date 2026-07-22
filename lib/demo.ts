// ============================================================================
//  DIVASYA — seeded demo data
//  ⚡ DEMO TIP: change DEMO_USER.name to the client's name before the meeting
//     so the AI Jyotishi + deity greet HIM by name. Maximum impact.
// ============================================================================

export type Deity = {
  id: string;
  name: string;
  deva: string;
  symbol: string;
  color: string; // accent used to theme the deity chat
  glow: string;
  tagline: string;
  persona: string; // fed to Claude
  suggestedMantraId: string;
  aarti: string; // label of aarti
};

export type Mantra = {
  id: string;
  name: string;
  deva: string;
  translit: string;
  deity: string;
  defaultTarget: number;
};

export type Astrologer = {
  id: string;
  name: string;
  specialty: string;
  tags: string[];
  exp: number;
  rating: number;
  orders: string;
  langs: string;
  rate: number; // ₹/min
  status: "online" | "busy";
  wait: string;
  grad: [string, string];
  // Headshot URL. Left unset in the seed data on purpose: these are placeholder
  // practitioners, and attaching a stock photo of a real person to a made-up
  // astrologer presents that person as someone they are not. Set photo_url on
  // the row once you have a picture the practitioner has agreed to.
  photo?: string;
};

export type Temple = {
  id: string;
  name: string;
  deity: string;
  location: string;
  timing: string;
  about: string;
  grad: [string, string];
  // A live darshan source. Prefer youtubeChannel: a live stream's video id
  // changes with every broadcast, so a hardcoded youtubeId goes dead the next
  // morning, while /embed/live_stream?channel= always resolves to whatever
  // that channel is streaming now.
  youtubeChannel?: string; // UC… channel id
  youtubeId?: string;      // a specific video, for a fixed recording
};

// ----------------------------------------------------------------------------
//  USER + BIRTH CHART  (the goldmine his app collects but never uses)
// ----------------------------------------------------------------------------
export const DEMO_USER = {
  name: "Mayur",
  phone: "+91 93708 40146",
  dob: "14 August 1996",
  tob: "07:42 AM",
  pob: "Nashik, Maharashtra",
  current: "Pune, Maharashtra",
  gender: "Male",
  deityId: "krishna",
  rashi: "Simha (Leo)",
  rashiDeva: "सिंह",
  nakshatra: "Rohini",
  lagna: "Simha (Leo)",
};

// A coherent (seeded) Vedic chart so Claude reasons consistently.
export const CHART = {
  lagna: "Simha (Leo)",
  moonSign: "Vrishabha (Taurus)",
  sunSign: "Simha (Leo)",
  nakshatra: "Rohini (pada 2)",
  planets: {
    Sun: "Leo (1st house, own sign — strong, leadership)",
    Moon: "Taurus (10th house, exalted in Rohini — career & public image)",
    Mars: "Aries (9th house, own sign — drive, fortune)",
    Mercury: "Virgo (2nd house, own + exalted — speech, wealth, intellect)",
    Jupiter: "Cancer (12th house, exalted — wisdom, foreign/spiritual gains)",
    Venus: "Libra (3rd house, own sign — relationships favourable)",
    Saturn: "Pisces (8th house — discipline through challenges)",
    Rahu: "Scorpio (4th house)",
    Ketu: "Taurus (10th house, with Moon)",
  },
  dasha: {
    maha: "Jupiter (Guru) Mahadasha",
    mahaUntil: "Apr 2028",
    antar: "Saturn (Shani) Antardasha",
    antarUntil: "Sep 2026",
  },
  flags: {
    manglik: "No (non-Manglik)",
    sadeSati: "Running — final (rising) phase, easing by late 2026",
    kaalSarp: "No",
  },
  yogas: ["Gajakesari Yoga (Jupiter–Moon) — wisdom & repute", "Budhaditya Yoga — intellect"],
};

export function chartSummary() {
  const p = CHART.planets;
  return `Lagna: ${CHART.lagna}. Moon sign (Rashi): ${CHART.moonSign}, Nakshatra: ${CHART.nakshatra}. Sun: ${CHART.sunSign}.
Planets — ${Object.entries(p).map(([k, v]) => `${k} in ${v}`).join("; ")}.
Current dasha: ${CHART.dasha.maha} (until ${CHART.dasha.mahaUntil}) / ${CHART.dasha.antar} (until ${CHART.dasha.antarUntil}).
Flags — Manglik: ${CHART.flags.manglik}; Sade Sati: ${CHART.flags.sadeSati}; Kaal Sarp: ${CHART.flags.kaalSarp}.
Notable yogas: ${CHART.yogas.join(", ")}.`;
}

// ----------------------------------------------------------------------------
//  PANCHANG (demo "today")
// ----------------------------------------------------------------------------
export const PANCHANG = {
  weekday: "Wednesday",
  masa: "Maagha",
  tithi: "Shukla Saptami",
  nakshatra: "Rohini",
  yoga: "Shobhana",
  karana: "Gara",
  sunrise: "6:12 AM",
  sunset: "6:34 PM",
  moonrise: "11:02 AM",
  moonset: "12:18 AM",
  rahuKaal: "12:24 PM – 1:48 PM",
  vrat: "Rohini Vrat",
};

// Day Choghadiya (sunrise→sunset, ~8 slots). good = shubh.
export const CHOGHADIYA = [
  { name: "Amrit", from: "6:12", to: "7:36", good: true },
  { name: "Kaal", from: "7:36", to: "9:00", good: false },
  { name: "Shubh", from: "9:00", to: "10:24", good: true },
  { name: "Rog", from: "10:24", to: "11:48", good: false },
  { name: "Udveg", from: "11:48", to: "13:12", good: false },
  { name: "Char", from: "13:12", to: "14:36", good: true },
  { name: "Labh", from: "14:36", to: "16:00", good: true },
  { name: "Amrit", from: "16:00", to: "17:24", good: true },
];

// pick "current" choghadiya by clock for realism
export function currentChoghadiya() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const c of CHOGHADIYA) {
    const [fh, fm] = c.from.split(":").map(Number);
    const [th, tm] = c.to.split(":").map(Number);
    if (mins >= fh * 60 + fm && mins < th * 60 + tm) return c;
  }
  return CHOGHADIYA[0];
}

// ----------------------------------------------------------------------------
//  DEITIES (Ishta Devta companion personas)
// ----------------------------------------------------------------------------
export const DEITIES: Deity[] = [
  {
    id: "krishna",
    name: "Shri Krishna",
    deva: "श्री कृष्ण",
    symbol: "🪈",
    color: "#5e7c93",
    glow: "rgba(94,124,147,0.30)",
    tagline: "The playful guide of the Gita",
    suggestedMantraId: "harekrishna",
    aarti: "Aarti Kunj Bihari Ki",
    persona:
      "You are Bhagwan Shri Krishna speaking warmly and playfully to your devotee, in the spirit of the Bhagavad Gita. You are wise, loving, a little mischievous (makhan-chor charm), and you reassure through the timeless teaching of nishkaam karma (act without attachment to results). You address the devotee affectionately (e.g. 'vatsa', 'mere priya'). Keep it tender and uplifting.",
  },
  {
    id: "shiva",
    name: "Mahadev",
    deva: "महादेव",
    symbol: "🔱",
    color: "#7d728f",
    glow: "rgba(125,114,143,0.30)",
    tagline: "The calm of the eternal",
    suggestedMantraId: "shiva",
    aarti: "Om Jai Shiv Omkara",
    persona:
      "You are Bhagwan Shiva — calm, profound, detached yet infinitely compassionate. You speak in few, deep words about stillness, acceptance, and dissolving the ego. You are the Mahayogi. Guidance feels like cool moonlight and the silence of Kailash.",
  },
  {
    id: "hanuman",
    name: "Hanuman Ji",
    deva: "हनुमान",
    symbol: "🪯",
    color: "#b07a4e",
    glow: "rgba(176,122,78,0.30)",
    tagline: "Courage, strength, devotion",
    suggestedMantraId: "hanuman",
    aarti: "Aarti Kije Hanuman Lala Ki",
    persona:
      "You are Hanuman Ji — the embodiment of courage, strength, selfless seva and unshakeable devotion to Ram. You speak with protective, energising, fearless warmth, banishing fear and doubt. You remind the devotee of their own hidden strength ('you are stronger than you know').",
  },
  {
    id: "durga",
    name: "Maa Durga",
    deva: "माँ दुर्गा",
    symbol: "🔆",
    color: "#a45e6b",
    glow: "rgba(164,94,107,0.30)",
    tagline: "The fierce protective mother",
    suggestedMantraId: "durga",
    aarti: "Jai Ambe Gauri",
    persona:
      "You are Maa Durga — the divine mother: fierce protector and infinitely tender. You speak with the strength of Shakti and the love of a mother, shielding your child from harm and empowering them.",
  },
  {
    id: "ganesha",
    name: "Ganpati Bappa",
    deva: "गणपति",
    symbol: "🐘",
    color: "#b8954f",
    glow: "rgba(184,149,79,0.30)",
    tagline: "Remover of obstacles",
    suggestedMantraId: "ganesha",
    aarti: "Sukhkarta Dukhharta",
    persona:
      "You are Ganpati Bappa — the beloved remover of obstacles (Vighnaharta), bringer of buddhi, riddhi and siddhi. You are jolly, affectionate, encouraging, and you clear the path before every new beginning. Morya!",
  },
  {
    id: "lakshmi",
    name: "Maa Lakshmi",
    deva: "माँ लक्ष्मी",
    symbol: "🪷",
    color: "#c2a868",
    glow: "rgba(194,168,104,0.32)",
    tagline: "Abundance & grace",
    suggestedMantraId: "lakshmi",
    aarti: "Om Jai Lakshmi Mata",
    persona:
      "You are Maa Lakshmi — goddess of abundance, prosperity, grace and auspiciousness. You speak gently of gratitude, cleanliness of heart and home, and the flow of true wealth (not just money, but dignity and contentment).",
  },
];

export const deityById = (id: string) =>
  DEITIES.find((d) => d.id === id) ?? DEITIES[0];

// ----------------------------------------------------------------------------
//  MANTRAS (Mala Counter)
// ----------------------------------------------------------------------------
export const MANTRAS: Mantra[] = [
  {
    id: "harekrishna",
    name: "Hare Krishna Maha Mantra",
    deva: "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे",
    translit: "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare",
    deity: "Krishna",
    defaultTarget: 108,
  },
  {
    id: "gayatri",
    name: "Gayatri Mantra",
    deva: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं",
    translit: "Om bhur bhuvah svah, tat savitur varenyam…",
    deity: "Surya",
    defaultTarget: 108,
  },
  {
    id: "shiva",
    name: "Shiv Mantra",
    deva: "ॐ नमः शिवाय",
    translit: "Om Namah Shivaya",
    deity: "Shiva",
    defaultTarget: 108,
  },
  {
    id: "mahamrityunjaya",
    name: "Mahamrityunjaya Mantra",
    deva: "ॐ त्र्यम्बकं यजामहे",
    translit: "Om Tryambakam Yajamahe…",
    deity: "Shiva",
    defaultTarget: 108,
  },
  {
    id: "hanuman",
    name: "Hanuman Mantra",
    deva: "ॐ हं हनुमते नमः",
    translit: "Om Han Hanumate Namah",
    deity: "Hanuman",
    defaultTarget: 108,
  },
  {
    id: "ganesha",
    name: "Ganesh Mantra",
    deva: "ॐ गं गणपतये नमः",
    translit: "Om Gan Ganpataye Namah",
    deity: "Ganesha",
    defaultTarget: 108,
  },
  {
    id: "durga",
    name: "Durga Mantra",
    deva: "ॐ दुं दुर्गायै नमः",
    translit: "Om Dum Durgayai Namah",
    deity: "Durga",
    defaultTarget: 108,
  },
  {
    id: "lakshmi",
    name: "Lakshmi Mantra",
    deva: "ॐ श्रीं महालक्ष्म्यै नमः",
    translit: "Om Shreem Mahalakshmyai Namah",
    deity: "Lakshmi",
    defaultTarget: 108,
  },
];

export const mantraById = (id: string) =>
  MANTRAS.find((m) => m.id === id) ?? MANTRAS[0];

export const TARGETS = [10, 27, 54, 100, 108];

// ----------------------------------------------------------------------------
//  ASTROLOGERS (Consult directory)
// ----------------------------------------------------------------------------
export const ASTROLOGERS: Astrologer[] = [
  { id: "a1", name: "Acharya Vinod Shastri", specialty: "Vedic • Marriage • Career", tags: ["Vedic", "Marriage"], exp: 18, rating: 4.9, orders: "94k", langs: "Hindi, English", rate: 22, status: "online", wait: "Free", grad: ["#bd7a37", "#8f5a26"] },
  { id: "a2", name: "Jyotishi Meera Joshi", specialty: "Love • Relationship • Tarot", tags: ["Tarot", "Love"], exp: 12, rating: 4.8, orders: "61k", langs: "Hindi, Marathi", rate: 18, status: "online", wait: "Free", grad: ["#a45e6b", "#6e3a48"] },
  { id: "a3", name: "Pandit Rajesh Tripathi", specialty: "Kundli • Remedies • Vastu", tags: ["Vastu", "Kundli"], exp: 25, rating: 4.9, orders: "1.2L", langs: "Hindi, English", rate: 35, status: "busy", wait: "~6 min", grad: ["#7d728f", "#4f4760"] },
  { id: "a4", name: "Dr. Ananya Iyer", specialty: "Numerology • Career", tags: ["Numerology"], exp: 9, rating: 4.7, orders: "33k", langs: "English, Tamil", rate: 15, status: "online", wait: "Free", grad: ["#7a9e7e", "#4a6b50"] },
  { id: "a5", name: "Acharya Suresh Nath", specialty: "Prashna • Muhurat • Vedic", tags: ["Prashna", "Vedic"], exp: 30, rating: 5.0, orders: "1.5L", langs: "Hindi, Sanskrit", rate: 45, status: "online", wait: "Free", grad: ["#c2a868", "#8f7740"] },
  { id: "a6", name: "Jyotishi Kavita Rao", specialty: "Love • Family • Tarot", tags: ["Tarot", "Family"], exp: 7, rating: 4.6, orders: "21k", langs: "Hindi, Kannada", rate: 12, status: "online", wait: "Free", grad: ["#5e7c93", "#3c5263"] },
  { id: "a7", name: "Pandit Devdutt Mishra", specialty: "KP System • Finance", tags: ["KP", "Finance"], exp: 16, rating: 4.8, orders: "72k", langs: "Hindi, English", rate: 28, status: "busy", wait: "~10 min", grad: ["#b07a4e", "#7a4a2c"] },
  { id: "a8", name: "Guru Maa Saraswati", specialty: "Spiritual • Remedies", tags: ["Spiritual"], exp: 22, rating: 4.9, orders: "88k", langs: "Hindi, Bengali", rate: 30, status: "online", wait: "Free", grad: ["#8f7e9e", "#5a4a68"] },
  { id: "a9", name: "Acharya Hari Om", specialty: "Vedic • Health • Career", tags: ["Vedic", "Health"], exp: 14, rating: 4.7, orders: "47k", langs: "Hindi, English", rate: 20, status: "online", wait: "Free", grad: ["#cf924a", "#8f5a26"] },
];

export const astrologerById = (id: string) =>
  ASTROLOGERS.find((a) => a.id === id) ?? ASTROLOGERS[0];

// ----------------------------------------------------------------------------
//  TEMPLES (Live Darshan directory)
// ----------------------------------------------------------------------------
export const TEMPLES: Temple[] = [
  // youtubeChannel is set only where the channel was confirmed to belong to the
  // temple's own trust — each id below was resolved from the handle and then
  // checked against the channel's title. Handles are not proof: the plausible
  // @mahakaleshwartempleujjain resolves to an unrelated creator account, so
  // Mahakaleshwar is deliberately left without a stream rather than pointing
  // devotees at someone else's video.
  { id: "kashi", name: "Kashi Vishwanath", deity: "Lord Shiva", location: "Varanasi, UP", timing: "Mangala Aarti 3:00 AM", about: "One of the twelve Jyotirlingas, on the banks of the Ganga.", grad: ["#2c2738", "#14121a"], youtubeChannel: "UCdMj2twWfMHXrWgX5oVdoyA" },
  { id: "mahakal", name: "Mahakaleshwar", deity: "Lord Shiva", location: "Ujjain, MP", timing: "Bhasma Aarti 4:00 AM", about: "The only south-facing Jyotirlinga; famous Bhasma Aarti.", grad: ["#33231b", "#1a1310"] },
  { id: "tirupati", name: "Tirupati Balaji", deity: "Lord Venkateswara", location: "Tirumala, AP", timing: "Suprabhatam 3:00 AM", about: "The richest and most-visited temple in the world.", grad: ["#322a1a", "#1a160f"], youtubeChannel: "UCS2Y83GD-fc7qqgNW5uj41g" },
  { id: "siddhi", name: "Siddhivinayak", deity: "Lord Ganesha", location: "Mumbai, MH", timing: "Kakad Aarti 5:30 AM", about: "Mumbai's most beloved Ganpati temple.", grad: ["#33271c", "#1a1410"] },
  { id: "vaishno", name: "Vaishno Devi", deity: "Maa Vaishnavi", location: "Katra, J&K", timing: "Aarti 6:00 AM & 7:00 PM", about: "The holy cave shrine of the Divine Mother.", grad: ["#332028", "#1a1014"] },
  { id: "somnath", name: "Somnath", deity: "Lord Shiva", location: "Prabhas Patan, GJ", timing: "Aarti 7:00 AM", about: "The first among the twelve Jyotirlingas.", grad: ["#1f2a33", "#10161a"], youtubeChannel: "UCcwrTb0z-J3iJ4hH0LHFsCQ" },
];

export const templeById = (id: string) =>
  TEMPLES.find((t) => t.id === id) ?? TEMPLES[0];

// e-Chadhava (low-friction first purchase)
export const CHADHAVA = [
  { id: "c1", name: "Tulsi Patra", emoji: "🌿", price: 51 },
  { id: "c2", name: "Ghee Diya", emoji: "🪔", price: 101 },
  { id: "c3", name: "Shrifal (Coconut)", emoji: "🥥", price: 151 },
  { id: "c4", name: "Pushp Mala", emoji: "🌺", price: 251 },
  { id: "c5", name: "Chandan & Itr", emoji: "🪵", price: 351 },
  { id: "c6", name: "56 Bhog", emoji: "🍲", price: 501 },
];

// Puja packages
export const PUJAS = [
  { id: "p1", name: "Maha Mrityunjaya Jaap", benefit: "Health & protection", price: 1100 },
  { id: "p2", name: "Navagraha Shanti Puja", benefit: "Remove planetary doshas", price: 2100 },
  { id: "p3", name: "Lakshmi Kuber Puja", benefit: "Wealth & prosperity", price: 1500 },
  { id: "p4", name: "Shani Sade Sati Puja", benefit: "Relief from Saturn", price: 1800 },
];

// ----------------------------------------------------------------------------
//  HOME — horoscope + library teaser
// ----------------------------------------------------------------------------
export const HOROSCOPE_TODAY =
  "Express yourself boldly today — your warm heart draws people in. An obstacle near midday clears with patience. Lucky colour: saffron. Lucky number: 5.";

export const SHLOKA = {
  deva: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
  translit: "Karmanye vadhikaraste, ma phaleshu kadachana",
  meaning: "You have the right to action alone, never to its fruits. — Bhagavad Gita 2.47",
};

/**
 * The 27 nakshatras with their four pada syllables, presiding deity and lord.
 *
 * Safe to hold locally, unlike festival dates: this mapping is canonical and
 * fixed — it is the same in every panchang and does not move with the year.
 * Without it the Naamkaran screen had nothing to pick from at all, since
 * getNakshatraSyllables falls back to an empty list.
 */
export const NAKSHATRA_SYLLABLES: { name: string; syl: string[]; deity: string; planet: string }[] = [
  { name: "Ashwini", syl: ["Chu", "Che", "Cho", "La"], deity: "Ashwini Kumaras", planet: "Ketu" },
  { name: "Bharani", syl: ["Li", "Lu", "Le", "Lo"], deity: "Yama", planet: "Venus" },
  { name: "Krittika", syl: ["A", "I", "U", "E"], deity: "Agni", planet: "Sun" },
  { name: "Rohini", syl: ["O", "Va", "Vi", "Vu"], deity: "Brahma", planet: "Moon" },
  { name: "Mrigashira", syl: ["Ve", "Vo", "Ka", "Ki"], deity: "Soma", planet: "Mars" },
  { name: "Ardra", syl: ["Ku", "Gha", "Nga", "Chha"], deity: "Rudra", planet: "Rahu" },
  { name: "Punarvasu", syl: ["Ke", "Ko", "Ha", "Hi"], deity: "Aditi", planet: "Jupiter" },
  { name: "Pushya", syl: ["Hu", "He", "Ho", "Da"], deity: "Brihaspati", planet: "Saturn" },
  { name: "Ashlesha", syl: ["Di", "Du", "De", "Do"], deity: "Nagas", planet: "Mercury" },
  { name: "Magha", syl: ["Ma", "Mi", "Mu", "Me"], deity: "Pitrs", planet: "Ketu" },
  { name: "Purva Phalguni", syl: ["Mo", "Ta", "Ti", "Tu"], deity: "Bhaga", planet: "Venus" },
  { name: "Uttara Phalguni", syl: ["Te", "To", "Pa", "Pi"], deity: "Aryaman", planet: "Sun" },
  { name: "Hasta", syl: ["Pu", "Sha", "Na", "Tha"], deity: "Savitr", planet: "Moon" },
  { name: "Chitra", syl: ["Pe", "Po", "Ra", "Ri"], deity: "Tvashtar", planet: "Mars" },
  { name: "Swati", syl: ["Ru", "Re", "Ro", "Ta"], deity: "Vayu", planet: "Rahu" },
  { name: "Vishakha", syl: ["Ti", "Tu", "Te", "To"], deity: "Indra-Agni", planet: "Jupiter" },
  { name: "Anuradha", syl: ["Na", "Ni", "Nu", "Ne"], deity: "Mitra", planet: "Saturn" },
  { name: "Jyeshtha", syl: ["No", "Ya", "Yi", "Yu"], deity: "Indra", planet: "Mercury" },
  { name: "Mula", syl: ["Ye", "Yo", "Bha", "Bhi"], deity: "Nirriti", planet: "Ketu" },
  { name: "Purva Ashadha", syl: ["Bhu", "Dha", "Pha", "Dha"], deity: "Apas", planet: "Venus" },
  { name: "Uttara Ashadha", syl: ["Bhe", "Bho", "Ja", "Ji"], deity: "Vishvedevas", planet: "Sun" },
  { name: "Shravana", syl: ["Ju", "Je", "Jo", "Gha"], deity: "Vishnu", planet: "Moon" },
  { name: "Dhanishta", syl: ["Ga", "Gi", "Gu", "Ge"], deity: "Vasus", planet: "Mars" },
  { name: "Shatabhisha", syl: ["Go", "Sa", "Si", "Su"], deity: "Varuna", planet: "Rahu" },
  { name: "Purva Bhadrapada", syl: ["Se", "So", "Da", "Di"], deity: "Aja Ekapada", planet: "Jupiter" },
  { name: "Uttara Bhadrapada", syl: ["Du", "Tha", "Jha", "Da"], deity: "Ahir Budhnya", planet: "Saturn" },
  { name: "Revati", syl: ["De", "Do", "Cha", "Chi"], deity: "Pushan", planet: "Mercury" },
];

/**
 * Seed names, keyed to the pada syllable they begin with so the nakshatra
 * filter has something to match. Meanings are the common, well-attested ones;
 * the real catalogue lives in the baby_names table.
 */
export const BABY_NAMES: { n: string; deva?: string; g: "m" | "f"; m: string; syl: string }[] = [
  { n: "Chetan", deva: "चेतन", g: "m", m: "Consciousness", syl: "Che" },
  { n: "Lakshya", deva: "लक्ष्य", g: "m", m: "Aim, goal", syl: "La" },
  { n: "Lavanya", deva: "लावण्य", g: "f", m: "Grace", syl: "La" },
  { n: "Aarav", deva: "आरव", g: "m", m: "Peaceful", syl: "A" },
  { n: "Aditya", deva: "आदित्य", g: "m", m: "The sun", syl: "A" },
  { n: "Ananya", deva: "अनन्या", g: "f", m: "Unique", syl: "A" },
  { n: "Ishaan", deva: "ईशान", g: "m", m: "Lord of the north-east", syl: "I" },
  { n: "Ira", deva: "इरा", g: "f", m: "Earth, speech", syl: "I" },
  { n: "Uma", deva: "उमा", g: "f", m: "Parvati", syl: "U" },
  { n: "Om", deva: "ओम्", g: "m", m: "The primordial sound", syl: "O" },
  { n: "Vihaan", deva: "विहान", g: "m", m: "Dawn", syl: "Vi" },
  { n: "Vedant", deva: "वेदान्त", g: "m", m: "End of the Vedas", syl: "Ve" },
  { n: "Kavya", deva: "काव्या", g: "f", m: "Poetry", syl: "Ka" },
  { n: "Krishna", deva: "कृष्ण", g: "m", m: "The dark one", syl: "Ka" },
  { n: "Kiara", g: "f", m: "Light", syl: "Ki" },
  { n: "Hansika", deva: "हंसिका", g: "f", m: "Swan", syl: "Ha" },
  { n: "Hemant", deva: "हेमन्त", g: "m", m: "Early winter", syl: "He" },
  { n: "Divya", deva: "दिव्या", g: "f", m: "Divine", syl: "Di" },
  { n: "Diya", deva: "दीया", g: "f", m: "Lamp", syl: "Di" },
  { n: "Dev", deva: "देव", g: "m", m: "God", syl: "De" },
  { n: "Manav", deva: "मानव", g: "m", m: "Human", syl: "Ma" },
  { n: "Meera", deva: "मीरा", g: "f", m: "Devotee of Krishna", syl: "Mi" },
  { n: "Mukul", deva: "मुकुल", g: "m", m: "Bud, blossom", syl: "Mu" },
  { n: "Tanvi", deva: "तन्वी", g: "f", m: "Slender, beautiful", syl: "Ta" },
  { n: "Tejas", deva: "तेजस", g: "m", m: "Radiance", syl: "Te" },
  { n: "Pranav", deva: "प्रणव", g: "m", m: "The syllable Om", syl: "Pa" },
  { n: "Priya", deva: "प्रिया", g: "f", m: "Beloved", syl: "Pi" },
  { n: "Naina", deva: "नैना", g: "f", m: "Eyes", syl: "Na" },
  { n: "Nitya", deva: "नित्या", g: "f", m: "Eternal", syl: "Ni" },
  { n: "Rudra", deva: "रुद्र", g: "m", m: "A form of Shiva", syl: "Ru" },
  { n: "Riya", deva: "रिया", g: "f", m: "Singer", syl: "Ri" },
  { n: "Rohan", deva: "रोहन", g: "m", m: "Ascending", syl: "Ro" },
  { n: "Yash", deva: "यश", g: "m", m: "Glory", syl: "Ya" },
  { n: "Yug", deva: "युग", g: "m", m: "An age", syl: "Yu" },
  { n: "Bhavya", deva: "भव्या", g: "f", m: "Grand, splendid", syl: "Bha" },
  { n: "Gauri", deva: "गौरी", g: "f", m: "Parvati, fair one", syl: "Ga" },
  { n: "Girish", deva: "गिरीश", g: "m", m: "Lord of the mountain", syl: "Gi" },
  { n: "Sanvi", deva: "सान्वी", g: "f", m: "Lakshmi", syl: "Sa" },
  { n: "Siddharth", deva: "सिद्धार्थ", g: "m", m: "One who attains", syl: "Si" },
  { n: "Surya", deva: "सूर्य", g: "m", m: "The sun", syl: "Su" },
  { n: "Charvi", deva: "चार्वी", g: "f", m: "Beautiful", syl: "Cha" },
  { n: "Chinmay", deva: "चिन्मय", g: "m", m: "Full of consciousness", syl: "Chi" },
  { n: "Jaya", deva: "जया", g: "f", m: "Victory", syl: "Ja" },
  { n: "Janhvi", deva: "जान्हवी", g: "f", m: "The Ganga", syl: "Ja" },
  { n: "Tara", deva: "तारा", g: "f", m: "Star", syl: "Ta" },
  { n: "Vasu", deva: "वसु", g: "m", m: "Wealth, a Vasu", syl: "Va" },
];

// Warm tints from the brand palette. These were dark hexes left over from an
// earlier theme, which rendered as grey slabs on the cream cards.
export const LIBRARY = [
  { id: "l1", title: "What is Meditation?", sub: "Unlocking inner peace", read: "2 min", grad: ["#CEB976", "#9C8544"] },
  { id: "l2", title: "The 7 Chakras", sub: "Energy centres of the body", read: "4 min", grad: ["#C88131", "#A5661F"] },
  { id: "l3", title: "Power of Hanuman Chalisa", sub: "Daily protection", read: "3 min", grad: ["#B4564B", "#7A4A2C"] },
];
