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
  tagline_hi?: string; // Hindi tagline for the language switch
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
  { id: "kashi", name: "Kashi Vishwanath", deity: "Lord Shiva", location: "Varanasi, UP", timing: "Mangala Aarti 3:00 AM", about: "One of the twelve Jyotirlingas, on the banks of the Ganga.", grad: ["#4A2472", "#241141"], youtubeChannel: "UCdMj2twWfMHXrWgX5oVdoyA" },
  { id: "mahakal", name: "Mahakaleshwar", deity: "Lord Shiva", location: "Ujjain, MP", timing: "Bhasma Aarti 4:00 AM", about: "The only south-facing Jyotirlinga; famous Bhasma Aarti.", grad: ["#7E1D2E", "#430D19"], youtubeChannel: "UC7hmH7rEu5HPA8iDT7zkEow" },
  { id: "tirupati", name: "Tirupati Balaji", deity: "Lord Venkateswara", location: "Tirumala, AP", timing: "Suprabhatam 3:00 AM", about: "The richest and most-visited temple in the world.", grad: ["#0F4F49", "#062B27"], youtubeChannel: "UCS2Y83GD-fc7qqgNW5uj41g" },
  { id: "siddhi", name: "Siddhivinayak", deity: "Lord Ganesha", location: "Mumbai, MH", timing: "Kakad Aarti 5:30 AM", about: "Mumbai's most beloved Ganpati temple.", grad: ["#8A3B08", "#4E1F03"], youtubeChannel: "UCNH47WOVuA2zkP2cP1sEynw" },
  { id: "vaishno", name: "Vaishno Devi", deity: "Maa Vaishnavi", location: "Katra, J&K", timing: "Aarti 6:00 AM & 7:00 PM", about: "The holy cave shrine of the Divine Mother.", grad: ["#153C6B", "#081F3B"], youtubeChannel: "UCO0xPUZXpIgTyQzRUzHfbSg" },
  { id: "somnath", name: "Somnath", deity: "Lord Shiva", location: "Prabhas Patan, GJ", timing: "Aarti 7:00 AM", about: "The first among the twelve Jyotirlingas.", grad: ["#5B2160", "#2E0F32"], youtubeChannel: "UCcwrTb0z-J3iJ4hH0LHFsCQ" },
];

export const templeById = (id: string) =>
  TEMPLES.find((t) => t.id === id) ?? TEMPLES[0];

// Kept separate from the booking catalogue. Retain the established Darshan
// sources as well as newly verified live channels: a temple's broadcast can
// pause between aartis, but devotees should not lose its video entry entirely.
export const LIVE_TEMPLES: Temple[] = [
  { id: "kashi", name: "Kashi Vishwanath", deity: "Lord Shiva", location: "Varanasi, UP", timing: "Mangala Aarti 3:00 AM", about: "One of the twelve Jyotirlingas, on the banks of the Ganga.", grad: ["#4A2472", "#241141"], youtubeChannel: "UCdMj2twWfMHXrWgX5oVdoyA" },
  { id: "mahakal", name: "Mahakaleshwar", deity: "Lord Shiva", location: "Ujjain, MP", timing: "Bhasma Aarti 4:00 AM", about: "The only south-facing Jyotirlinga; famous Bhasma Aarti.", grad: ["#7E1D2E", "#430D19"], youtubeChannel: "UC7hmH7rEu5HPA8iDT7zkEow" },
  { id: "tirupati", name: "Tirupati Balaji", deity: "Lord Venkateswara", location: "Tirumala, AP", timing: "Suprabhatam 3:00 AM", about: "The richest and most-visited temple in the world.", grad: ["#0F4F49", "#062B27"], youtubeChannel: "UCS2Y83GD-fc7qqgNW5uj41g" },
  { id: "shantikunj", name: "Gayatri Teerth Shantikunj", deity: "Maa Gayatri", location: "Haridwar, UK", timing: "24-hour live darshan", about: "Gayatri Teerth Shantikunj's official live darshan and spiritual programmes.", grad: ["#9D4C14", "#4E1E08"], youtubeChannel: "UCjzJrnsM3Ar0DMmJhpNMiaw" },
  { id: "iskcon-bangalore", name: "ISKCON Bangalore", deity: "Sri Sri Radha Krishnachandra", location: "Bengaluru, KA", timing: "Live darshan & kirtans", about: "Live darshan from ISKCON Bangalore's Vaikuntha Hill temple.", grad: ["#275E79", "#0D2A3C"], youtubeChannel: "UCPXnayBvF7ynbG_I3VOTgIg" },
];

// e-Chadhava (low-friction first purchase)
export const CHADHAVA = [
  { id: "c1", name: "Tulsi Patra", emoji: "🌿", icon: "leaf", price: 51 },
  { id: "c2", name: "Ghee Diya", emoji: "🪔", icon: "flame", price: 101 },
  { id: "c3", name: "Shrifal (Coconut)", emoji: "🥥", icon: "citrus", price: 151 },
  { id: "c4", name: "Pushp Mala", emoji: "🌺", icon: "flower", price: 251 },
  { id: "c5", name: "Chandan & Itr", emoji: "🪵", icon: "droplets", price: 351 },
  { id: "c6", name: "56 Bhog", emoji: "🍲", icon: "utensils", price: 501 },
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
export const NAKSHATRA_SYLLABLES: {
  name: string; deva: string; syl: string[]; syld: string[];
  deity: string; deityh: string; planet: string; planeth: string;
}[] = [
  { name: "Ashwini", deva: "अश्विनी", syl: ["Chu", "Che", "Cho", "La"], syld: ["चू", "चे", "चो", "ला"], deity: "Ashwini Kumaras", deityh: "अश्विनी कुमार", planet: "Ketu", planeth: "केतु" },
  { name: "Bharani", deva: "भरणी", syl: ["Li", "Lu", "Le", "Lo"], syld: ["ली", "लू", "ले", "लो"], deity: "Yama", deityh: "यम", planet: "Venus", planeth: "शुक्र" },
  { name: "Krittika", deva: "कृत्तिका", syl: ["A", "I", "U", "E"], syld: ["अ", "ई", "उ", "ए"], deity: "Agni", deityh: "अग्नि", planet: "Sun", planeth: "सूर्य" },
  { name: "Rohini", deva: "रोहिणी", syl: ["O", "Va", "Vi", "Vu"], syld: ["ओ", "वा", "वी", "वू"], deity: "Brahma", deityh: "ब्रह्मा", planet: "Moon", planeth: "चंद्र" },
  { name: "Mrigashira", deva: "मृगशिरा", syl: ["Ve", "Vo", "Ka", "Ki"], syld: ["वे", "वो", "का", "की"], deity: "Soma", deityh: "सोम", planet: "Mars", planeth: "मंगल" },
  { name: "Ardra", deva: "आर्द्रा", syl: ["Ku", "Gha", "Nga", "Chha"], syld: ["कू", "घ", "ङ", "छ"], deity: "Rudra", deityh: "रुद्र", planet: "Rahu", planeth: "राहु" },
  { name: "Punarvasu", deva: "पुनर्वसु", syl: ["Ke", "Ko", "Ha", "Hi"], syld: ["के", "को", "हा", "ही"], deity: "Aditi", deityh: "अदिति", planet: "Jupiter", planeth: "गुरु" },
  { name: "Pushya", deva: "पुष्य", syl: ["Hu", "He", "Ho", "Da"], syld: ["हू", "हे", "हो", "डा"], deity: "Brihaspati", deityh: "बृहस्पति", planet: "Saturn", planeth: "शनि" },
  { name: "Ashlesha", deva: "आश्लेषा", syl: ["Di", "Du", "De", "Do"], syld: ["डी", "डू", "डे", "डो"], deity: "Nagas", deityh: "नाग", planet: "Mercury", planeth: "बुध" },
  { name: "Magha", deva: "मघा", syl: ["Ma", "Mi", "Mu", "Me"], syld: ["मा", "मी", "मू", "मे"], deity: "Pitrs", deityh: "पितृ", planet: "Ketu", planeth: "केतु" },
  { name: "Purva Phalguni", deva: "पूर्व फाल्गुनी", syl: ["Mo", "Ta", "Ti", "Tu"], syld: ["मो", "टा", "टी", "टू"], deity: "Bhaga", deityh: "भग", planet: "Venus", planeth: "शुक्र" },
  { name: "Uttara Phalguni", deva: "उत्तर फाल्गुनी", syl: ["Te", "To", "Pa", "Pi"], syld: ["टे", "टो", "पा", "पी"], deity: "Aryaman", deityh: "अर्यमा", planet: "Sun", planeth: "सूर्य" },
  { name: "Hasta", deva: "हस्त", syl: ["Pu", "Sha", "Na", "Tha"], syld: ["पू", "ष", "ण", "ठ"], deity: "Savitr", deityh: "सविता", planet: "Moon", planeth: "चंद्र" },
  { name: "Chitra", deva: "चित्रा", syl: ["Pe", "Po", "Ra", "Ri"], syld: ["पे", "पो", "रा", "री"], deity: "Tvashtar", deityh: "त्वष्टा", planet: "Mars", planeth: "मंगल" },
  { name: "Swati", deva: "स्वाती", syl: ["Ru", "Re", "Ro", "Ta"], syld: ["रू", "रे", "रो", "ता"], deity: "Vayu", deityh: "वायु", planet: "Rahu", planeth: "राहु" },
  { name: "Vishakha", deva: "विशाखा", syl: ["Ti", "Tu", "Te", "To"], syld: ["ती", "तू", "ते", "तो"], deity: "Indra-Agni", deityh: "इन्द्राग्नि", planet: "Jupiter", planeth: "गुरु" },
  { name: "Anuradha", deva: "अनुराधा", syl: ["Na", "Ni", "Nu", "Ne"], syld: ["ना", "नी", "नू", "ने"], deity: "Mitra", deityh: "मित्र", planet: "Saturn", planeth: "शनि" },
  { name: "Jyeshtha", deva: "ज्येष्ठा", syl: ["No", "Ya", "Yi", "Yu"], syld: ["नो", "या", "यी", "यू"], deity: "Indra", deityh: "इन्द्र", planet: "Mercury", planeth: "बुध" },
  { name: "Mula", deva: "मूल", syl: ["Ye", "Yo", "Bha", "Bhi"], syld: ["ये", "यो", "भा", "भी"], deity: "Nirriti", deityh: "निर्ऋति", planet: "Ketu", planeth: "केतु" },
  // Pada 4 is ढा, not धा. Both are romanised "Dha" in most tables, which made
  // the retroflex pada silently inherit the dental one's names.
  { name: "Purva Ashadha", deva: "पूर्वाषाढा", syl: ["Bhu", "Dha", "Pha", "Ddha"], syld: ["भू", "धा", "फा", "ढा"], deity: "Apas", deityh: "आपः", planet: "Venus", planeth: "शुक्र" },
  { name: "Uttara Ashadha", deva: "उत्तराषाढा", syl: ["Bhe", "Bho", "Ja", "Ji"], syld: ["भे", "भो", "जा", "जी"], deity: "Vishvedevas", deityh: "विश्वेदेवा", planet: "Sun", planeth: "सूर्य" },
  { name: "Shravana", deva: "श्रवण", syl: ["Ju", "Je", "Jo", "Gha"], syld: ["जू", "जे", "जो", "घा"], deity: "Vishnu", deityh: "विष्णु", planet: "Moon", planeth: "चंद्र" },
  { name: "Dhanishta", deva: "धनिष्ठा", syl: ["Ga", "Gi", "Gu", "Ge"], syld: ["गा", "गी", "गू", "गे"], deity: "Vasus", deityh: "वसु", planet: "Mars", planeth: "मंगल" },
  { name: "Shatabhisha", deva: "शतभिषा", syl: ["Go", "Sa", "Si", "Su"], syld: ["गो", "सा", "सी", "सू"], deity: "Varuna", deityh: "वरुण", planet: "Rahu", planeth: "राहु" },
  { name: "Purva Bhadrapada", deva: "पूर्व भाद्रपदा", syl: ["Se", "So", "Da", "Di"], syld: ["से", "सो", "दा", "दी"], deity: "Aja Ekapada", deityh: "अज एकपाद", planet: "Jupiter", planeth: "गुरु" },
  { name: "Uttara Bhadrapada", deva: "उत्तर भाद्रपदा", syl: ["Du", "Tha", "Jha", "Nya"], syld: ["दू", "थ", "झ", "ञ"], deity: "Ahir Budhnya", deityh: "अहिर्बुध्न्य", planet: "Saturn", planeth: "शनि" },
  { name: "Revati", deva: "रेवती", syl: ["De", "Do", "Cha", "Chi"], syld: ["दे", "दो", "चा", "ची"], deity: "Pushan", deityh: "पूषा", planet: "Mercury", planeth: "बुध" },
];

/**
 * Names keyed to the pada syllable they begin with, so the nakshatra filter has
 * something to match. Meanings are the common, well-attested ones.
 *
 * Coverage is deliberately uneven, and the screen says so rather than padding.
 * Some padas — ङ, ञ, झ, वू, ये — have essentially no names in use; a pandit
 * substitutes a neighbouring sound. Inventing entries for them to make every
 * cell look full would be the one thing a naming list must not do.
 */
export const BABY_NAMES: { n: string; deva?: string; g: "m" | "f"; m: string; mh: string; syl: string }[] = [
  // अ इ उ ए ओ — Krittika, Rohini
  { n: "Aarav", deva: "आरव", g: "m", m: "Peaceful", mh: "शांत", syl: "A" },
  { n: "Aditya", deva: "आदित्य", g: "m", m: "The sun", mh: "सूर्य", syl: "A" },
  { n: "Arjun", deva: "अर्जुन", g: "m", m: "Bright, the Pandava", mh: "तेजस्वी; एक पांडव", syl: "A" },
  { n: "Amrit", deva: "अमृत", g: "m", m: "Nectar of immortality", mh: "अमृत", syl: "A" },
  { n: "Ananya", deva: "अनन्या", g: "f", m: "Unique", mh: "अद्वितीय", syl: "A" },
  { n: "Aditi", deva: "अदिति", g: "f", m: "Boundless, mother of the devas", mh: "अनंत; देवों की माता", syl: "A" },
  { n: "Ahana", deva: "अहाना", g: "f", m: "First light of dawn", mh: "भोर की पहली किरण", syl: "A" },
  { n: "Aarohi", deva: "आरोही", g: "f", m: "Ascending melody", mh: "आरोही स्वर", syl: "A" },
  { n: "Ishaan", deva: "ईशान", g: "m", m: "Lord of the north-east", mh: "ईशान दिशा के स्वामी", syl: "I" },
  { n: "Indra", deva: "इन्द्र", g: "m", m: "King of the devas", mh: "देवराज", syl: "I" },
  { n: "Ira", deva: "इरा", g: "f", m: "Earth, speech", mh: "पृथ्वी; वाणी", syl: "I" },
  { n: "Indira", deva: "इन्दिरा", g: "f", m: "Lakshmi", mh: "लक्ष्मी", syl: "I" },
  { n: "Ishita", deva: "ईशिता", g: "f", m: "Mastery", mh: "प्रभुत्व", syl: "I" },
  { n: "Udit", deva: "उदित", g: "m", m: "Risen", mh: "उदित", syl: "U" },
  { n: "Uday", deva: "उदय", g: "m", m: "Sunrise", mh: "सूर्योदय", syl: "U" },
  { n: "Utkarsh", deva: "उत्कर्ष", g: "m", m: "Excellence", mh: "उत्कर्ष", syl: "U" },
  { n: "Uma", deva: "उमा", g: "f", m: "Parvati", mh: "पार्वती", syl: "U" },
  { n: "Urvi", deva: "उर्वी", g: "f", m: "The earth", mh: "पृथ्वी", syl: "U" },
  { n: "Ekansh", deva: "एकांश", g: "m", m: "A whole part", mh: "पूर्ण अंश", syl: "E" },
  { n: "Ekagra", deva: "एकाग्र", g: "m", m: "Single-pointed", mh: "एकाग्र", syl: "E" },
  { n: "Ekta", deva: "एकता", g: "f", m: "Unity", mh: "एकता", syl: "E" },
  { n: "Esha", deva: "एषा", g: "f", m: "Desire", mh: "इच्छा", syl: "E" },
  { n: "Om", deva: "ओम्", g: "m", m: "The primordial sound", mh: "आदि नाद", syl: "O" },
  { n: "Omkar", deva: "ओंकार", g: "m", m: "The syllable Om", mh: "ॐ अक्षर", syl: "O" },
  { n: "Ojas", deva: "ओजस", g: "m", m: "Vital vigour", mh: "ओज", syl: "O" },
  { n: "Ojasvi", deva: "ओजस्वी", g: "f", m: "Lustrous", mh: "तेजस्वी", syl: "O" },

  // च — Revati, Ashwini, Ardra
  { n: "Chandra", deva: "चन्द्र", g: "m", m: "The moon", mh: "चंद्रमा", syl: "Cha" },
  { n: "Chaitanya", deva: "चैतन्य", g: "m", m: "Consciousness", mh: "चेतना", syl: "Cha" },
  { n: "Charvi", deva: "चार्वी", g: "f", m: "Beautiful", mh: "सुंदर", syl: "Cha" },
  { n: "Chandni", deva: "चाँदनी", g: "f", m: "Moonlight", mh: "चाँदनी", syl: "Cha" },
  { n: "Charu", deva: "चारु", g: "f", m: "Graceful", mh: "लालित्यपूर्ण", syl: "Cha" },
  { n: "Chinmay", deva: "चिन्मय", g: "m", m: "Full of consciousness", mh: "चैतन्यमय", syl: "Chi" },
  { n: "Chirag", deva: "चिराग", g: "m", m: "Lamp", mh: "दीपक", syl: "Chi" },
  { n: "Chintan", deva: "चिन्तन", g: "m", m: "Contemplation", mh: "चिंतन", syl: "Chi" },
  { n: "Chitra", deva: "चित्रा", g: "f", m: "Picture; a nakshatra", mh: "चित्र; एक नक्षत्र", syl: "Chi" },
  { n: "Chinmayi", deva: "चिन्मयी", g: "f", m: "Full of knowledge", mh: "ज्ञानमयी", syl: "Chi" },
  { n: "Chudamani", deva: "चूड़ामणि", g: "m", m: "Crest jewel", mh: "शिरोमणि", syl: "Chu" },
  { n: "Chetan", deva: "चेतन", g: "m", m: "Consciousness", mh: "चेतना", syl: "Che" },
  { n: "Chetas", deva: "चेतस्", g: "m", m: "Mind, awareness", mh: "मन; बोध", syl: "Che" },
  { n: "Chetana", deva: "चेतना", g: "f", m: "Awareness", mh: "बोध", syl: "Che" },
  { n: "Cheshta", deva: "चेष्टा", g: "f", m: "Endeavour", mh: "प्रयत्न", syl: "Che" },
  { n: "Chhavi", deva: "छवि", g: "f", m: "Image, radiance", mh: "छवि; आभा", syl: "Chha" },
  { n: "Chhaya", deva: "छाया", g: "f", m: "Shade; wife of the Sun", mh: "छाया; सूर्य की पत्नी", syl: "Chha" },

  // ल — Ashwini, Bharani
  { n: "Lakshya", deva: "लक्ष्य", g: "m", m: "Aim, goal", mh: "लक्ष्य", syl: "La" },
  { n: "Laksh", deva: "लक्ष", g: "m", m: "Target", mh: "निशाना", syl: "La" },
  { n: "Lalit", deva: "ललित", g: "m", m: "Graceful", mh: "लालित्यपूर्ण", syl: "La" },
  { n: "Lavanya", deva: "लावण्य", g: "f", m: "Grace", mh: "लावण्य", syl: "La" },
  { n: "Lakshmi", deva: "लक्ष्मी", g: "f", m: "Goddess of fortune", mh: "धन की देवी", syl: "La" },
  { n: "Latika", deva: "लतिका", g: "f", m: "A small vine", mh: "छोटी लता", syl: "La" },
  { n: "Lipika", deva: "लिपिका", g: "f", m: "Script, a letter", mh: "लिपि; अक्षर", syl: "Li" },
  { n: "Lipi", deva: "लिपि", g: "f", m: "Writing", mh: "लेखन", syl: "Li" },
  { n: "Lekha", deva: "लेखा", g: "f", m: "A written line", mh: "लिखी हुई रेखा", syl: "Le" },
  { n: "Lohit", deva: "लोहित", g: "m", m: "Red", mh: "लाल", syl: "Lo" },
  { n: "Lochan", deva: "लोचन", g: "m", m: "The eye", mh: "नेत्र", syl: "Lo" },
  { n: "Lokesh", deva: "लोकेश", g: "m", m: "Lord of the world", mh: "लोकों के स्वामी", syl: "Lo" },

  // व — Rohini, Mrigashira
  { n: "Vasu", deva: "वसु", g: "m", m: "Wealth; one of the eight Vasus", mh: "धन; अष्ट वसुओं में एक", syl: "Va" },
  { n: "Varun", deva: "वरुण", g: "m", m: "Lord of the waters", mh: "जल के देवता", syl: "Va" },
  { n: "Vansh", deva: "वंश", g: "m", m: "Lineage", mh: "वंश", syl: "Va" },
  { n: "Vandana", deva: "वन्दना", g: "f", m: "Praise, salutation", mh: "वंदना", syl: "Va" },
  { n: "Vaishnavi", deva: "वैष्णवी", g: "f", m: "Of Vishnu", mh: "विष्णु से संबंधित", syl: "Va" },
  { n: "Varsha", deva: "वर्षा", g: "f", m: "Rain", mh: "वर्षा", syl: "Va" },
  { n: "Vihaan", deva: "विहान", g: "m", m: "Dawn", mh: "प्रभात", syl: "Vi" },
  { n: "Vivaan", deva: "विवान", g: "m", m: "Rays of the morning sun", mh: "प्रातःकालीन किरणें", syl: "Vi" },
  { n: "Vikram", deva: "विक्रम", g: "m", m: "Valour", mh: "पराक्रम", syl: "Vi" },
  { n: "Vinay", deva: "विनय", g: "m", m: "Modesty", mh: "विनम्रता", syl: "Vi" },
  { n: "Vidya", deva: "विद्या", g: "f", m: "Knowledge", mh: "विद्या", syl: "Vi" },
  { n: "Vibha", deva: "विभा", g: "f", m: "Radiance", mh: "तेज", syl: "Vi" },
  { n: "Ved", deva: "वेद", g: "m", m: "Sacred knowledge", mh: "वेद", syl: "Ve" },
  { n: "Vedant", deva: "वेदान्त", g: "m", m: "End of the Vedas", mh: "वेदों का अंत", syl: "Ve" },
  { n: "Vedika", deva: "वेदिका", g: "f", m: "The altar", mh: "वेदी", syl: "Ve" },

  // क — Mrigashira, Ardra, Punarvasu
  { n: "Krishna", deva: "कृष्ण", g: "m", m: "The dark one", mh: "श्यामवर्ण", syl: "Ka" },
  { n: "Kartik", deva: "कार्तिक", g: "m", m: "A month; Skanda", mh: "एक मास; कार्तिकेय", syl: "Ka" },
  { n: "Kamal", deva: "कमल", g: "m", m: "Lotus", mh: "कमल", syl: "Ka" },
  { n: "Kavya", deva: "काव्या", g: "f", m: "Poetry", mh: "काव्य", syl: "Ka" },
  { n: "Kalpana", deva: "कल्पना", g: "f", m: "Imagination", mh: "कल्पना", syl: "Ka" },
  { n: "Kishore", deva: "किशोर", g: "m", m: "A youth", mh: "किशोर", syl: "Ki" },
  { n: "Kirti", deva: "कीर्ति", g: "f", m: "Fame", mh: "कीर्ति", syl: "Ki" },
  { n: "Kiara", deva: "कियारा", g: "f", m: "Light", mh: "प्रकाश", syl: "Ki" },
  { n: "Kunal", deva: "कुणाल", g: "m", m: "Lotus; son of Ashoka", mh: "कमल; अशोक का पुत्र", syl: "Ku" },
  { n: "Kumar", deva: "कुमार", g: "m", m: "Young prince", mh: "राजकुमार", syl: "Ku" },
  { n: "Kumud", deva: "कुमुद", g: "m", m: "Night lotus", mh: "कुमुदिनी", syl: "Ku" },
  { n: "Kusum", deva: "कुसुम", g: "f", m: "Flower", mh: "पुष्प", syl: "Ku" },
  { n: "Kunti", deva: "कुन्ती", g: "f", m: "Mother of the Pandavas", mh: "पांडवों की माता", syl: "Ku" },
  { n: "Kedar", deva: "केदार", g: "m", m: "A field; Shiva", mh: "क्षेत्र; शिव", syl: "Ke" },
  { n: "Keshav", deva: "केशव", g: "m", m: "Krishna", mh: "कृष्ण", syl: "Ke" },
  { n: "Ketan", deva: "केतन", g: "m", m: "Banner", mh: "ध्वज", syl: "Ke" },
  { n: "Keya", deva: "केया", g: "f", m: "A monsoon flower", mh: "केतकी का पुष्प", syl: "Ke" },
  { n: "Koushik", deva: "कौशिक", g: "m", m: "A sage; Vishvamitra", mh: "एक ऋषि; विश्वामित्र", syl: "Ko" },
  { n: "Komal", deva: "कोमल", g: "f", m: "Tender", mh: "कोमल", syl: "Ko" },
  { n: "Kokila", deva: "कोकिला", g: "f", m: "The cuckoo", mh: "कोयल", syl: "Ko" },

  // ग घ — Dhanishta, Shatabhisha, Shravana
  { n: "Ganesh", deva: "गणेश", g: "m", m: "Remover of obstacles", mh: "विघ्नहर्ता", syl: "Ga" },
  { n: "Gagan", deva: "गगन", g: "m", m: "The sky", mh: "गगन", syl: "Ga" },
  { n: "Gauri", deva: "गौरी", g: "f", m: "Parvati, the fair one", mh: "गौरवर्णा पार्वती", syl: "Ga" },
  { n: "Gayatri", deva: "गायत्री", g: "f", m: "A Vedic metre and mantra", mh: "एक वैदिक छंद और मंत्र", syl: "Ga" },
  { n: "Girish", deva: "गिरीश", g: "m", m: "Lord of the mountain", mh: "गिरि के स्वामी", syl: "Gi" },
  { n: "Giri", deva: "गिरि", g: "m", m: "Mountain", mh: "पर्वत", syl: "Gi" },
  { n: "Gita", deva: "गीता", g: "f", m: "Song; the Bhagavad Gita", mh: "गीत; भगवद्गीता", syl: "Gi" },
  { n: "Guru", deva: "गुरु", g: "m", m: "Teacher; Brihaspati", mh: "गुरु; बृहस्पति", syl: "Gu" },
  { n: "Gunjan", deva: "गुंजन", g: "f", m: "Humming of bees", mh: "भ्रमरों का गुंजन", syl: "Gu" },
  { n: "Gopal", deva: "गोपाल", g: "m", m: "Cowherd; Krishna", mh: "गोपालक; कृष्ण", syl: "Go" },
  { n: "Govind", deva: "गोविन्द", g: "m", m: "Krishna", mh: "कृष्ण", syl: "Go" },
  { n: "Gopika", deva: "गोपिका", g: "f", m: "A gopi of Vrindavan", mh: "वृंदावन की गोपी", syl: "Go" },
  { n: "Ghanshyam", deva: "घनश्याम", g: "m", m: "Dark as a raincloud; Krishna", mh: "मेघ सा श्याम; कृष्ण", syl: "Gha" },

  // ह — Punarvasu, Pushya
  { n: "Hari", deva: "हरि", g: "m", m: "Vishnu", mh: "विष्णु", syl: "Ha" },
  { n: "Harsh", deva: "हर्ष", g: "m", m: "Joy", mh: "हर्ष", syl: "Ha" },
  { n: "Hardik", deva: "हार्दिक", g: "m", m: "Heartfelt", mh: "हृदय से", syl: "Ha" },
  { n: "Hansika", deva: "हंसिका", g: "f", m: "Swan", mh: "हंसिनी", syl: "Ha" },
  { n: "Harshita", deva: "हर्षिता", g: "f", m: "Joyful", mh: "हर्षित", syl: "Ha" },
  { n: "Himanshu", deva: "हिमांशु", g: "m", m: "The moon", mh: "चंद्रमा", syl: "Hi" },
  { n: "Hitesh", deva: "हितेश", g: "m", m: "Well-wisher", mh: "हितैषी", syl: "Hi" },
  { n: "Hima", deva: "हिमा", g: "f", m: "Snow", mh: "हिम", syl: "Hi" },
  { n: "Hemant", deva: "हेमन्त", g: "m", m: "Early winter", mh: "हेमंत ऋतु", syl: "He" },
  { n: "Hemal", deva: "हेमल", g: "m", m: "Golden", mh: "स्वर्णिम", syl: "He" },
  { n: "Hema", deva: "हेमा", g: "f", m: "Gold", mh: "स्वर्ण", syl: "He" },

  // द ड — Ashlesha, Pushya, Bhadrapada, Revati
  { n: "Daksh", deva: "दक्ष", g: "m", m: "Able; a Prajapati", mh: "दक्ष; एक प्रजापति", syl: "Da" },
  { n: "Darshan", deva: "दर्शन", g: "m", m: "Sight of the divine", mh: "ईश्वर के दर्शन", syl: "Da" },
  { n: "Damini", deva: "दामिनी", g: "f", m: "Lightning", mh: "बिजली", syl: "Da" },
  { n: "Damayanti", deva: "दमयन्ती", g: "f", m: "The queen of Nala", mh: "नल की रानी", syl: "Da" },
  { n: "Dinesh", deva: "दिनेश", g: "m", m: "Lord of the day", mh: "दिन के स्वामी", syl: "Di" },
  { n: "Divit", deva: "दिवित", g: "m", m: "Immortal", mh: "अमर", syl: "Di" },
  { n: "Divya", deva: "दिव्या", g: "f", m: "Divine", mh: "दिव्य", syl: "Di" },
  { n: "Diya", deva: "दीया", g: "f", m: "Lamp", mh: "दीपक", syl: "Di" },
  { n: "Diksha", deva: "दीक्षा", g: "f", m: "Initiation", mh: "दीक्षा", syl: "Di" },
  { n: "Durgesh", deva: "दुर्गेश", g: "m", m: "Lord of forts", mh: "दुर्गों के स्वामी", syl: "Du" },
  { n: "Durga", deva: "दुर्गा", g: "f", m: "The unassailable goddess", mh: "दुर्गम देवी", syl: "Du" },
  { n: "Dulari", deva: "दुलारी", g: "f", m: "Beloved", mh: "प्रिय", syl: "Du" },
  { n: "Dev", deva: "देव", g: "m", m: "God", mh: "देव", syl: "De" },
  { n: "Devansh", deva: "देवांश", g: "m", m: "Part of the divine", mh: "ईश्वर का अंश", syl: "De" },
  { n: "Deepak", deva: "दीपक", g: "m", m: "Lamp", mh: "दीपक", syl: "De" },
  { n: "Devika", deva: "देविका", g: "f", m: "Little goddess", mh: "छोटी देवी", syl: "De" },
  { n: "Deepti", deva: "दीप्ति", g: "f", m: "Brilliance", mh: "दीप्ति", syl: "De" },

  // ध — Purva Ashadha
  { n: "Dhruv", deva: "ध्रुव", g: "m", m: "The pole star; steadfast", mh: "ध्रुव तारा; अटल", syl: "Dha" },
  { n: "Dhiraj", deva: "धीरज", g: "m", m: "Patience", mh: "धैर्य", syl: "Dha" },
  { n: "Dhara", deva: "धारा", g: "f", m: "A stream", mh: "धारा", syl: "Dha" },
  { n: "Dhanya", deva: "धन्या", g: "f", m: "Fortunate", mh: "भाग्यशाली", syl: "Dha" },

  // म — Magha, Purva Phalguni
  { n: "Manav", deva: "मानव", g: "m", m: "Human", mh: "मानव", syl: "Ma" },
  { n: "Madhav", deva: "माधव", g: "m", m: "Krishna", mh: "कृष्ण", syl: "Ma" },
  { n: "Mayank", deva: "मयंक", g: "m", m: "The moon", mh: "चंद्रमा", syl: "Ma" },
  { n: "Mahi", deva: "मही", g: "f", m: "The earth", mh: "पृथ्वी", syl: "Ma" },
  { n: "Mansi", deva: "मानसी", g: "f", m: "Of the mind", mh: "मन से संबंधित", syl: "Ma" },
  { n: "Mihir", deva: "मिहिर", g: "m", m: "The sun", mh: "सूर्य", syl: "Mi" },
  { n: "Mitra", deva: "मित्र", g: "m", m: "Friend; a Vedic deity", mh: "मित्र; एक वैदिक देवता", syl: "Mi" },
  { n: "Meera", deva: "मीरा", g: "f", m: "Devotee of Krishna", mh: "कृष्ण भक्त", syl: "Mi" },
  { n: "Mitali", deva: "मिताली", g: "f", m: "Friendship", mh: "मित्रता", syl: "Mi" },
  { n: "Mukul", deva: "मुकुल", g: "m", m: "Bud, blossom", mh: "कली", syl: "Mu" },
  { n: "Mukund", deva: "मुकुन्द", g: "m", m: "Krishna, giver of liberation", mh: "मुक्तिदाता कृष्ण", syl: "Mu" },
  { n: "Mudita", deva: "मुदिता", g: "f", m: "Joy in another's joy", mh: "दूसरों के सुख में सुख", syl: "Mu" },
  { n: "Muskan", deva: "मुस्कान", g: "f", m: "Smile", mh: "मुस्कान", syl: "Mu" },
  { n: "Mehul", deva: "मेहुल", g: "m", m: "Rain", mh: "वर्षा", syl: "Me" },
  { n: "Megha", deva: "मेघा", g: "f", m: "Cloud", mh: "मेघ", syl: "Me" },
  { n: "Medha", deva: "मेधा", g: "f", m: "Intellect", mh: "बुद्धि", syl: "Me" },
  { n: "Mohan", deva: "मोहन", g: "m", m: "Enchanting; Krishna", mh: "मोहित करने वाले; कृष्ण", syl: "Mo" },
  { n: "Mohit", deva: "मोहित", g: "m", m: "Entranced", mh: "मुग्ध", syl: "Mo" },
  { n: "Mohini", deva: "मोहिनी", g: "f", m: "The enchantress", mh: "मोहिनी", syl: "Mo" },

  // त ट थ — Purva Phalguni, Swati, Vishakha
  { n: "Tanmay", deva: "तन्मय", g: "m", m: "Absorbed", mh: "तल्लीन", syl: "Ta" },
  { n: "Tanish", deva: "तनिष", g: "m", m: "Ambition", mh: "महत्वाकांक्षा", syl: "Ta" },
  { n: "Tanvi", deva: "तन्वी", g: "f", m: "Slender", mh: "तन्वंगी", syl: "Ta" },
  { n: "Tara", deva: "तारा", g: "f", m: "Star", mh: "तारा", syl: "Ta" },
  { n: "Tanuja", deva: "तनुजा", g: "f", m: "Daughter", mh: "पुत्री", syl: "Ta" },
  { n: "Tithi", deva: "तिथि", g: "f", m: "A lunar day", mh: "तिथि", syl: "Ti" },
  { n: "Tushar", deva: "तुषार", g: "m", m: "Frost, snow", mh: "तुषार", syl: "Tu" },
  { n: "Tulsi", deva: "तुलसी", g: "f", m: "Holy basil", mh: "तुलसी", syl: "Tu" },
  { n: "Tushti", deva: "तुष्टि", g: "f", m: "Contentment", mh: "संतोष", syl: "Tu" },
  { n: "Tejas", deva: "तेजस", g: "m", m: "Radiance", mh: "तेज", syl: "Te" },
  { n: "Tejasvi", deva: "तेजस्वी", g: "f", m: "Lustrous", mh: "तेजस्वी", syl: "Te" },
  { n: "Tejal", deva: "तेजल", g: "f", m: "Radiant", mh: "तेजोमय", syl: "Te" },
  { n: "Toshan", deva: "तोषण", g: "m", m: "Satisfying", mh: "संतुष्ट करने वाला", syl: "To" },
  { n: "Toshi", deva: "तोषी", g: "f", m: "Content", mh: "संतुष्ट", syl: "To" },

  // प फ — Uttara Phalguni, Hasta, Chitra
  { n: "Pranav", deva: "प्रणव", g: "m", m: "The syllable Om", mh: "ॐ अक्षर", syl: "Pa" },
  { n: "Parth", deva: "पार्थ", g: "m", m: "Arjuna, son of Pritha", mh: "पृथा पुत्र अर्जुन", syl: "Pa" },
  { n: "Pavan", deva: "पवन", g: "m", m: "The wind", mh: "पवन", syl: "Pa" },
  { n: "Padma", deva: "पद्मा", g: "f", m: "Lotus; Lakshmi", mh: "कमल; लक्ष्मी", syl: "Pa" },
  { n: "Palak", deva: "पलक", g: "f", m: "Eyelash", mh: "पलक", syl: "Pa" },
  { n: "Piyush", deva: "पीयूष", g: "m", m: "Nectar", mh: "पीयूष", syl: "Pi" },
  { n: "Pinaki", deva: "पिनाकी", g: "m", m: "Shiva, bearer of the bow", mh: "पिनाकधारी शिव", syl: "Pi" },
  { n: "Priya", deva: "प्रिया", g: "f", m: "Beloved", mh: "प्रिय", syl: "Pi" },
  { n: "Purav", deva: "पुरव", g: "m", m: "Eastern", mh: "पूर्व दिशा का", syl: "Pu" },
  { n: "Pushkar", deva: "पुष्कर", g: "m", m: "Lotus; a sacred lake", mh: "कमल; एक पावन सरोवर", syl: "Pu" },
  { n: "Punya", deva: "पुण्य", g: "f", m: "Merit", mh: "पुण्य", syl: "Pu" },
  { n: "Purvi", deva: "पूर्वी", g: "f", m: "Eastern; a raga", mh: "पूर्वी; एक राग", syl: "Pu" },
  { n: "Phalgun", deva: "फाल्गुन", g: "m", m: "The last lunar month", mh: "अंतिम चंद्र मास", syl: "Pha" },

  // ष श स — Hasta, Shatabhisha
  { n: "Shaurya", deva: "शौर्य", g: "m", m: "Valour", mh: "पराक्रम", syl: "Sha" },
  { n: "Shantanu", deva: "शान्तनु", g: "m", m: "A king of Hastinapur", mh: "हस्तिनापुर के राजा", syl: "Sha" },
  { n: "Shakti", deva: "शक्ति", g: "f", m: "Power", mh: "शक्ति", syl: "Sha" },
  { n: "Sharvani", deva: "शर्वाणी", g: "f", m: "Parvati", mh: "पार्वती", syl: "Sha" },
  { n: "Sarthak", deva: "सार्थक", g: "m", m: "Meaningful", mh: "सार्थक", syl: "Sa" },
  { n: "Samarth", deva: "समर्थ", g: "m", m: "Capable", mh: "समर्थ", syl: "Sa" },
  { n: "Sagar", deva: "सागर", g: "m", m: "Ocean", mh: "सागर", syl: "Sa" },
  { n: "Sanvi", deva: "सान्वी", g: "f", m: "Lakshmi", mh: "लक्ष्मी", syl: "Sa" },
  { n: "Sadhana", deva: "साधना", g: "f", m: "Sustained practice", mh: "साधना", syl: "Sa" },
  { n: "Siddharth", deva: "सिद्धार्थ", g: "m", m: "One who attains the goal", mh: "सिद्धि प्राप्त करने वाला", syl: "Si" },
  { n: "Sita", deva: "सीता", g: "f", m: "Consort of Rama", mh: "राम की पत्नी", syl: "Si" },
  { n: "Siddhi", deva: "सिद्धि", g: "f", m: "Attainment", mh: "सिद्धि", syl: "Si" },
  { n: "Simran", deva: "सिमरन", g: "f", m: "Remembrance of the divine", mh: "प्रभु स्मरण", syl: "Si" },
  { n: "Surya", deva: "सूर्य", g: "m", m: "The sun", mh: "सूर्य", syl: "Su" },
  { n: "Sujay", deva: "सुजय", g: "m", m: "A good victory", mh: "शुभ विजय", syl: "Su" },
  { n: "Sundar", deva: "सुन्दर", g: "m", m: "Beautiful", mh: "सुंदर", syl: "Su" },
  { n: "Suman", deva: "सुमन", g: "f", m: "Flower; good-hearted", mh: "पुष्प; सुहृदय", syl: "Su" },
  { n: "Sudha", deva: "सुधा", g: "f", m: "Nectar", mh: "पीयूष", syl: "Su" },
  { n: "Sena", deva: "सेना", g: "f", m: "Army", mh: "सेना", syl: "Se" },
  { n: "Sevak", deva: "सेवक", g: "m", m: "One who serves", mh: "सेवक", syl: "Se" },
  { n: "Soham", deva: "सोहम्", g: "m", m: "I am that", mh: "वही मैं हूँ", syl: "So" },
  { n: "Sohan", deva: "सोहन", g: "m", m: "Handsome", mh: "मनोहर", syl: "So" },
  { n: "Sonal", deva: "सोनल", g: "f", m: "Golden", mh: "स्वर्णिम", syl: "So" },
  { n: "Soumya", deva: "सौम्य", g: "f", m: "Gentle; of the moon", mh: "सौम्य; चंद्र से संबंधित", syl: "So" },

  // न ण — Hasta, Anuradha, Jyeshtha
  { n: "Narayan", deva: "नारायण", g: "m", m: "Vishnu", mh: "विष्णु", syl: "Na" },
  { n: "Nakul", deva: "नकुल", g: "m", m: "A Pandava", mh: "एक पांडव", syl: "Na" },
  { n: "Naina", deva: "नैना", g: "f", m: "Eyes", mh: "नयन", syl: "Na" },
  { n: "Nandini", deva: "नन्दिनी", g: "f", m: "Delightful daughter", mh: "आनंद देने वाली पुत्री", syl: "Na" },
  { n: "Namrata", deva: "नम्रता", g: "f", m: "Humility", mh: "नम्रता", syl: "Na" },
  { n: "Nikhil", deva: "निखिल", g: "m", m: "Complete, entire", mh: "संपूर्ण", syl: "Ni" },
  { n: "Nishant", deva: "निशांत", g: "m", m: "End of night, dawn", mh: "रात्रि का अंत, भोर", syl: "Ni" },
  { n: "Nitya", deva: "नित्या", g: "f", m: "Eternal", mh: "नित्य", syl: "Ni" },
  { n: "Nidhi", deva: "निधि", g: "f", m: "Treasure", mh: "निधि", syl: "Ni" },
  { n: "Nutan", deva: "नूतन", g: "f", m: "New", mh: "नूतन", syl: "Nu" },
  { n: "Neel", deva: "नील", g: "m", m: "Blue", mh: "नील", syl: "Ne" },
  { n: "Neha", deva: "नेहा", g: "f", m: "Love", mh: "स्नेह", syl: "Ne" },
  { n: "Netra", deva: "नेत्र", g: "f", m: "The eye", mh: "नेत्र", syl: "Ne" },

  // र — Chitra, Swati
  { n: "Raghav", deva: "राघव", g: "m", m: "Of Raghu's line; Rama", mh: "रघुवंशी; राम", syl: "Ra" },
  { n: "Ram", deva: "राम", g: "m", m: "The seventh avatar", mh: "सातवें अवतार", syl: "Ra" },
  { n: "Rajat", deva: "रजत", g: "m", m: "Silver", mh: "रजत", syl: "Ra" },
  { n: "Radha", deva: "राधा", g: "f", m: "Beloved of Krishna", mh: "कृष्ण की प्रिया", syl: "Ra" },
  { n: "Rachana", deva: "रचना", g: "f", m: "Creation", mh: "रचना", syl: "Ra" },
  { n: "Rishabh", deva: "ऋषभ", g: "m", m: "Excellent; the second note", mh: "श्रेष्ठ; दूसरा स्वर", syl: "Ri" },
  { n: "Riya", deva: "रिया", g: "f", m: "Singer", mh: "गायिका", syl: "Ri" },
  { n: "Ridhi", deva: "ऋद्धि", g: "f", m: "Prosperity", mh: "समृद्धि", syl: "Ri" },
  { n: "Ritu", deva: "ऋतु", g: "f", m: "Season", mh: "ऋतु", syl: "Ri" },
  { n: "Rudra", deva: "रुद्र", g: "m", m: "A form of Shiva", mh: "शिव का एक रूप", syl: "Ru" },
  { n: "Ruchi", deva: "रुचि", g: "f", m: "Taste, interest", mh: "रुचि", syl: "Ru" },
  { n: "Rupa", deva: "रूपा", g: "f", m: "Form, beauty", mh: "रूप; सौंदर्य", syl: "Ru" },
  { n: "Reyansh", deva: "रेयांश", g: "m", m: "A ray of light", mh: "प्रकाश की किरण", syl: "Re" },
  { n: "Reva", deva: "रेवा", g: "f", m: "The Narmada", mh: "नर्मदा नदी", syl: "Re" },
  { n: "Renu", deva: "रेणु", g: "f", m: "Pollen, fine dust", mh: "पराग; सूक्ष्म रज", syl: "Re" },
  { n: "Rohan", deva: "रोहन", g: "m", m: "Ascending", mh: "आरोहण करने वाला", syl: "Ro" },
  { n: "Rohit", deva: "रोहित", g: "m", m: "Red", mh: "लाल", syl: "Ro" },
  { n: "Roshni", deva: "रोशनी", g: "f", m: "Light", mh: "प्रकाश", syl: "Ro" },

  // य — Jyeshtha, Mula
  { n: "Yash", deva: "यश", g: "m", m: "Glory", mh: "यश", syl: "Ya" },
  { n: "Yajna", deva: "यज्ञ", g: "m", m: "Sacrifice, offering", mh: "यज्ञ", syl: "Ya" },
  { n: "Yashoda", deva: "यशोदा", g: "f", m: "Krishna's foster mother", mh: "कृष्ण की माता यशोदा", syl: "Ya" },
  { n: "Yamini", deva: "यामिनी", g: "f", m: "Night", mh: "रात्रि", syl: "Ya" },
  { n: "Yug", deva: "युग", g: "m", m: "An age of the world", mh: "एक युग", syl: "Yu" },
  { n: "Yuvraj", deva: "युवराज", g: "m", m: "Crown prince", mh: "युवराज", syl: "Yu" },
  { n: "Yukti", deva: "युक्ति", g: "f", m: "Reason, stratagem", mh: "युक्ति", syl: "Yu" },
  { n: "Yogesh", deva: "योगेश", g: "m", m: "Lord of yoga", mh: "योग के स्वामी", syl: "Yo" },
  { n: "Yogi", deva: "योगी", g: "m", m: "One joined in yoga", mh: "योगी", syl: "Yo" },
  { n: "Yogita", deva: "योगिता", g: "f", m: "Absorbed in yoga", mh: "योग में लीन", syl: "Yo" },

  // भ — Mula, Purva Ashadha
  { n: "Bharat", deva: "भरत", g: "m", m: "A king; India", mh: "एक राजा; भारत", syl: "Bha" },
  { n: "Bhavesh", deva: "भावेश", g: "m", m: "Lord of feeling", mh: "भावों के स्वामी", syl: "Bha" },
  { n: "Bhavya", deva: "भव्या", g: "f", m: "Grand, splendid", mh: "भव्य", syl: "Bha" },
  { n: "Bhakti", deva: "भक्ति", g: "f", m: "Devotion", mh: "भक्ति", syl: "Bha" },
  { n: "Bhima", deva: "भीम", g: "m", m: "Mighty; a Pandava", mh: "बलशाली; एक पांडव", syl: "Bhi" },
  { n: "Bhuvan", deva: "भुवन", g: "m", m: "World", mh: "भुवन", syl: "Bhu" },
  { n: "Bhushan", deva: "भूषण", g: "m", m: "Ornament", mh: "आभूषण", syl: "Bhu" },
  { n: "Bhumi", deva: "भूमि", g: "f", m: "The earth", mh: "पृथ्वी", syl: "Bhu" },

  // ज — Uttara Ashadha, Shravana
  { n: "Jagat", deva: "जगत्", g: "m", m: "The world", mh: "जगत", syl: "Ja" },
  { n: "Jatin", deva: "जतिन", g: "m", m: "An ascetic", mh: "तपस्वी", syl: "Ja" },
  { n: "Jaya", deva: "जया", g: "f", m: "Victory", mh: "विजय", syl: "Ja" },
  { n: "Janhvi", deva: "जान्हवी", g: "f", m: "The Ganga", mh: "गंगा", syl: "Ja" },
  { n: "Jitendra", deva: "जितेन्द्र", g: "m", m: "Conqueror of the senses", mh: "इंद्रियों को जीतने वाला", syl: "Ji" },
  { n: "Jiya", deva: "जिया", g: "f", m: "Heart", mh: "हृदय", syl: "Ji" },
  { n: "Jivika", deva: "जीविका", g: "f", m: "Livelihood", mh: "जीविका", syl: "Ji" },
  { n: "Juhi", deva: "जूही", g: "f", m: "A jasmine", mh: "जूही का पुष्प", syl: "Ju" },
  { n: "Jeet", deva: "जीत", g: "m", m: "Victory", mh: "विजय", syl: "Je" },
  { n: "Jyoti", deva: "ज्योति", g: "f", m: "Light, flame", mh: "ज्योति", syl: "Jo" },
  { n: "Jyotsna", deva: "ज्योत्स्ना", g: "f", m: "Moonlight", mh: "चाँदनी", syl: "Jo" },
];

// Warm tints from the brand palette. These were dark hexes left over from an
// earlier theme, which rendered as grey slabs on the cream cards.
export const LIBRARY: { id: string; title: string; sub: string; read: string; grad: string[]; content?: string }[] = [
  {
    id: "l1", title: "What is Meditation?", sub: "Unlocking inner peace", read: "2 min", grad: ["#CEB976", "#9C8544"],
    content:
      "Dhyana, the seventh limb of Patanjali's ashtanga yoga, is not the emptying of the mind but the steady holding of it. Where dharana fixes attention on a single point, dhyana is the unbroken flow of that attention, oil poured from one vessel to another without a break.\n\nThe practice begins with the breath. Sit with the spine upright, the eyes soft, and follow the air as it comes and goes. Thoughts will rise; this is their nature. The work is not to fight them but to return, gently and without judgement, to the breath each time you notice you have wandered.\n\nOver weeks the returning grows easier, and the gaps between thoughts widen. In those gaps is the quiet the rishis spoke of — not an achievement to be seized, but a stillness that was always there, waiting under the noise.",
  },
  {
    id: "l2", title: "The 7 Chakras", sub: "Energy centres of the body", read: "4 min", grad: ["#C88131", "#A5661F"],
    content:
      "Along the sushumna, the central channel of the subtle body, sit seven wheels of energy. Each governs a region of the body and a register of the mind, and each turns freely when we are well and stiffens when we are not.\n\nMuladhara, at the base of the spine, is the root — earth, survival, the ground beneath us. Above it Svadhishthana holds water and desire; Manipura, at the navel, is fire and will. Anahata, the heart, is where the lower three meet the higher three, the seat of compassion.\n\nHigher still are Vishuddha at the throat, the centre of speech and truth; Ajna between the brows, the eye of insight; and Sahasrara at the crown, the thousand-petalled lotus where the individual self dissolves into the whole. To work with the chakras is to tend each in turn, so the energy may rise clean from root to crown.",
  },
  {
    id: "l3", title: "Power of Hanuman Chalisa", sub: "Daily protection", read: "3 min", grad: ["#B4564B", "#7A4A2C"],
    content:
      "Composed by Tulsidas in the sixteenth century, the Hanuman Chalisa is forty verses of praise to the son of the wind. It is among the most recited hymns in the Hindu world, spoken at dawn and dusk, in temples and on trains, by the devout and the merely hopeful alike.\n\nIts power is held to be protective. Hanuman is the remover of fear — the one who leapt the ocean, who carried a mountain, who set his own tail alight and walked unburnt. To recite his Chalisa is to call that fearlessness into oneself, to meet the day's troubles with a steadier heart.\n\nThe words need not be understood to be felt. Say them slowly, let the rhythm settle the breath, and the mind grows quiet in the saying. That quiet, the tradition holds, is Hanuman's blessing — the strength to carry what must be carried.",
  },
];
