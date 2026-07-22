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
export const NAKSHATRA_SYLLABLES: {
  name: string; deva: string; syl: string[]; syld: string[]; deity: string; planet: string;
}[] = [
  { name: "Ashwini", deva: "अश्विनी", syl: ["Chu", "Che", "Cho", "La"], syld: ["चू", "चे", "चो", "ला"], deity: "Ashwini Kumaras", planet: "Ketu" },
  { name: "Bharani", deva: "भरणी", syl: ["Li", "Lu", "Le", "Lo"], syld: ["ली", "लू", "ले", "लो"], deity: "Yama", planet: "Venus" },
  { name: "Krittika", deva: "कृत्तिका", syl: ["A", "I", "U", "E"], syld: ["अ", "ई", "उ", "ए"], deity: "Agni", planet: "Sun" },
  { name: "Rohini", deva: "रोहिणी", syl: ["O", "Va", "Vi", "Vu"], syld: ["ओ", "वा", "वी", "वू"], deity: "Brahma", planet: "Moon" },
  { name: "Mrigashira", deva: "मृगशिरा", syl: ["Ve", "Vo", "Ka", "Ki"], syld: ["वे", "वो", "का", "की"], deity: "Soma", planet: "Mars" },
  { name: "Ardra", deva: "आर्द्रा", syl: ["Ku", "Gha", "Nga", "Chha"], syld: ["कू", "घ", "ङ", "छ"], deity: "Rudra", planet: "Rahu" },
  { name: "Punarvasu", deva: "पुनर्वसु", syl: ["Ke", "Ko", "Ha", "Hi"], syld: ["के", "को", "हा", "ही"], deity: "Aditi", planet: "Jupiter" },
  { name: "Pushya", deva: "पुष्य", syl: ["Hu", "He", "Ho", "Da"], syld: ["हू", "हे", "हो", "डा"], deity: "Brihaspati", planet: "Saturn" },
  { name: "Ashlesha", deva: "आश्लेषा", syl: ["Di", "Du", "De", "Do"], syld: ["डी", "डू", "डे", "डो"], deity: "Nagas", planet: "Mercury" },
  { name: "Magha", deva: "मघा", syl: ["Ma", "Mi", "Mu", "Me"], syld: ["मा", "मी", "मू", "मे"], deity: "Pitrs", planet: "Ketu" },
  { name: "Purva Phalguni", deva: "पूर्व फाल्गुनी", syl: ["Mo", "Ta", "Ti", "Tu"], syld: ["मो", "टा", "टी", "टू"], deity: "Bhaga", planet: "Venus" },
  { name: "Uttara Phalguni", deva: "उत्तर फाल्गुनी", syl: ["Te", "To", "Pa", "Pi"], syld: ["टे", "टो", "पा", "पी"], deity: "Aryaman", planet: "Sun" },
  { name: "Hasta", deva: "हस्त", syl: ["Pu", "Sha", "Na", "Tha"], syld: ["पू", "ष", "ण", "ठ"], deity: "Savitr", planet: "Moon" },
  { name: "Chitra", deva: "चित्रा", syl: ["Pe", "Po", "Ra", "Ri"], syld: ["पे", "पो", "रा", "री"], deity: "Tvashtar", planet: "Mars" },
  { name: "Swati", deva: "स्वाती", syl: ["Ru", "Re", "Ro", "Ta"], syld: ["रू", "रे", "रो", "ता"], deity: "Vayu", planet: "Rahu" },
  { name: "Vishakha", deva: "विशाखा", syl: ["Ti", "Tu", "Te", "To"], syld: ["ती", "तू", "ते", "तो"], deity: "Indra-Agni", planet: "Jupiter" },
  { name: "Anuradha", deva: "अनुराधा", syl: ["Na", "Ni", "Nu", "Ne"], syld: ["ना", "नी", "नू", "ने"], deity: "Mitra", planet: "Saturn" },
  { name: "Jyeshtha", deva: "ज्येष्ठा", syl: ["No", "Ya", "Yi", "Yu"], syld: ["नो", "या", "यी", "यू"], deity: "Indra", planet: "Mercury" },
  { name: "Mula", deva: "मूल", syl: ["Ye", "Yo", "Bha", "Bhi"], syld: ["ये", "यो", "भा", "भी"], deity: "Nirriti", planet: "Ketu" },
  // Pada 4 is ढा, not धा. Both are romanised "Dha" in most tables, which made
  // the retroflex pada silently inherit the dental one's names.
  { name: "Purva Ashadha", deva: "पूर्वाषाढा", syl: ["Bhu", "Dha", "Pha", "Ddha"], syld: ["भू", "धा", "फा", "ढा"], deity: "Apas", planet: "Venus" },
  { name: "Uttara Ashadha", deva: "उत्तराषाढा", syl: ["Bhe", "Bho", "Ja", "Ji"], syld: ["भे", "भो", "जा", "जी"], deity: "Vishvedevas", planet: "Sun" },
  { name: "Shravana", deva: "श्रवण", syl: ["Ju", "Je", "Jo", "Gha"], syld: ["जू", "जे", "जो", "घा"], deity: "Vishnu", planet: "Moon" },
  { name: "Dhanishta", deva: "धनिष्ठा", syl: ["Ga", "Gi", "Gu", "Ge"], syld: ["गा", "गी", "गू", "गे"], deity: "Vasus", planet: "Mars" },
  { name: "Shatabhisha", deva: "शतभिषा", syl: ["Go", "Sa", "Si", "Su"], syld: ["गो", "सा", "सी", "सू"], deity: "Varuna", planet: "Rahu" },
  { name: "Purva Bhadrapada", deva: "पूर्व भाद्रपदा", syl: ["Se", "So", "Da", "Di"], syld: ["से", "सो", "दा", "दी"], deity: "Aja Ekapada", planet: "Jupiter" },
  { name: "Uttara Bhadrapada", deva: "उत्तर भाद्रपदा", syl: ["Du", "Tha", "Jha", "Nya"], syld: ["दू", "थ", "झ", "ञ"], deity: "Ahir Budhnya", planet: "Saturn" },
  { name: "Revati", deva: "रेवती", syl: ["De", "Do", "Cha", "Chi"], syld: ["दे", "दो", "चा", "ची"], deity: "Pushan", planet: "Mercury" },
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
export const BABY_NAMES: { n: string; deva?: string; g: "m" | "f"; m: string; syl: string }[] = [
  // अ इ उ ए ओ — Krittika, Rohini
  { n: "Aarav", deva: "आरव", g: "m", m: "Peaceful", syl: "A" },
  { n: "Aditya", deva: "आदित्य", g: "m", m: "The sun", syl: "A" },
  { n: "Arjun", deva: "अर्जुन", g: "m", m: "Bright, the Pandava", syl: "A" },
  { n: "Amrit", deva: "अमृत", g: "m", m: "Nectar of immortality", syl: "A" },
  { n: "Ananya", deva: "अनन्या", g: "f", m: "Unique", syl: "A" },
  { n: "Aditi", deva: "अदिति", g: "f", m: "Boundless, mother of the devas", syl: "A" },
  { n: "Ahana", deva: "अहाना", g: "f", m: "First light of dawn", syl: "A" },
  { n: "Aarohi", deva: "आरोही", g: "f", m: "Ascending melody", syl: "A" },
  { n: "Ishaan", deva: "ईशान", g: "m", m: "Lord of the north-east", syl: "I" },
  { n: "Indra", deva: "इन्द्र", g: "m", m: "King of the devas", syl: "I" },
  { n: "Ira", deva: "इरा", g: "f", m: "Earth, speech", syl: "I" },
  { n: "Indira", deva: "इन्दिरा", g: "f", m: "Lakshmi", syl: "I" },
  { n: "Ishita", deva: "ईशिता", g: "f", m: "Mastery", syl: "I" },
  { n: "Udit", deva: "उदित", g: "m", m: "Risen", syl: "U" },
  { n: "Uday", deva: "उदय", g: "m", m: "Sunrise", syl: "U" },
  { n: "Utkarsh", deva: "उत्कर्ष", g: "m", m: "Excellence", syl: "U" },
  { n: "Uma", deva: "उमा", g: "f", m: "Parvati", syl: "U" },
  { n: "Urvi", deva: "उर्वी", g: "f", m: "The earth", syl: "U" },
  { n: "Ekansh", deva: "एकांश", g: "m", m: "A whole part", syl: "E" },
  { n: "Ekagra", deva: "एकाग्र", g: "m", m: "Single-pointed", syl: "E" },
  { n: "Ekta", deva: "एकता", g: "f", m: "Unity", syl: "E" },
  { n: "Esha", deva: "एषा", g: "f", m: "Desire", syl: "E" },
  { n: "Om", deva: "ओम्", g: "m", m: "The primordial sound", syl: "O" },
  { n: "Omkar", deva: "ओंकार", g: "m", m: "The syllable Om", syl: "O" },
  { n: "Ojas", deva: "ओजस", g: "m", m: "Vital vigour", syl: "O" },
  { n: "Ojasvi", deva: "ओजस्वी", g: "f", m: "Lustrous", syl: "O" },

  // च — Revati, Ashwini, Ardra
  { n: "Chandra", deva: "चन्द्र", g: "m", m: "The moon", syl: "Cha" },
  { n: "Chaitanya", deva: "चैतन्य", g: "m", m: "Consciousness", syl: "Cha" },
  { n: "Charvi", deva: "चार्वी", g: "f", m: "Beautiful", syl: "Cha" },
  { n: "Chandni", deva: "चाँदनी", g: "f", m: "Moonlight", syl: "Cha" },
  { n: "Charu", deva: "चारु", g: "f", m: "Graceful", syl: "Cha" },
  { n: "Chinmay", deva: "चिन्मय", g: "m", m: "Full of consciousness", syl: "Chi" },
  { n: "Chirag", deva: "चिराग", g: "m", m: "Lamp", syl: "Chi" },
  { n: "Chintan", deva: "चिन्तन", g: "m", m: "Contemplation", syl: "Chi" },
  { n: "Chitra", deva: "चित्रा", g: "f", m: "Picture; a nakshatra", syl: "Chi" },
  { n: "Chinmayi", deva: "चिन्मयी", g: "f", m: "Full of knowledge", syl: "Chi" },
  { n: "Chudamani", deva: "चूड़ामणि", g: "m", m: "Crest jewel", syl: "Chu" },
  { n: "Chetan", deva: "चेतन", g: "m", m: "Consciousness", syl: "Che" },
  { n: "Chetas", deva: "चेतस्", g: "m", m: "Mind, awareness", syl: "Che" },
  { n: "Chetana", deva: "चेतना", g: "f", m: "Awareness", syl: "Che" },
  { n: "Cheshta", deva: "चेष्टा", g: "f", m: "Endeavour", syl: "Che" },
  { n: "Chhavi", deva: "छवि", g: "f", m: "Image, radiance", syl: "Chha" },
  { n: "Chhaya", deva: "छाया", g: "f", m: "Shade; wife of the Sun", syl: "Chha" },

  // ल — Ashwini, Bharani
  { n: "Lakshya", deva: "लक्ष्य", g: "m", m: "Aim, goal", syl: "La" },
  { n: "Laksh", deva: "लक्ष", g: "m", m: "Target", syl: "La" },
  { n: "Lalit", deva: "ललित", g: "m", m: "Graceful", syl: "La" },
  { n: "Lavanya", deva: "लावण्य", g: "f", m: "Grace", syl: "La" },
  { n: "Lakshmi", deva: "लक्ष्मी", g: "f", m: "Goddess of fortune", syl: "La" },
  { n: "Latika", deva: "लतिका", g: "f", m: "A small vine", syl: "La" },
  { n: "Lipika", deva: "लिपिका", g: "f", m: "Script, a letter", syl: "Li" },
  { n: "Lipi", deva: "लिपि", g: "f", m: "Writing", syl: "Li" },
  { n: "Lekha", deva: "लेखा", g: "f", m: "A written line", syl: "Le" },
  { n: "Lohit", deva: "लोहित", g: "m", m: "Red", syl: "Lo" },
  { n: "Lochan", deva: "लोचन", g: "m", m: "The eye", syl: "Lo" },
  { n: "Lokesh", deva: "लोकेश", g: "m", m: "Lord of the world", syl: "Lo" },

  // व — Rohini, Mrigashira
  { n: "Vasu", deva: "वसु", g: "m", m: "Wealth; one of the eight Vasus", syl: "Va" },
  { n: "Varun", deva: "वरुण", g: "m", m: "Lord of the waters", syl: "Va" },
  { n: "Vansh", deva: "वंश", g: "m", m: "Lineage", syl: "Va" },
  { n: "Vandana", deva: "वन्दना", g: "f", m: "Praise, salutation", syl: "Va" },
  { n: "Vaishnavi", deva: "वैष्णवी", g: "f", m: "Of Vishnu", syl: "Va" },
  { n: "Varsha", deva: "वर्षा", g: "f", m: "Rain", syl: "Va" },
  { n: "Vihaan", deva: "विहान", g: "m", m: "Dawn", syl: "Vi" },
  { n: "Vivaan", deva: "विवान", g: "m", m: "Rays of the morning sun", syl: "Vi" },
  { n: "Vikram", deva: "विक्रम", g: "m", m: "Valour", syl: "Vi" },
  { n: "Vinay", deva: "विनय", g: "m", m: "Modesty", syl: "Vi" },
  { n: "Vidya", deva: "विद्या", g: "f", m: "Knowledge", syl: "Vi" },
  { n: "Vibha", deva: "विभा", g: "f", m: "Radiance", syl: "Vi" },
  { n: "Ved", deva: "वेद", g: "m", m: "Sacred knowledge", syl: "Ve" },
  { n: "Vedant", deva: "वेदान्त", g: "m", m: "End of the Vedas", syl: "Ve" },
  { n: "Vedika", deva: "वेदिका", g: "f", m: "The altar", syl: "Ve" },

  // क — Mrigashira, Ardra, Punarvasu
  { n: "Krishna", deva: "कृष्ण", g: "m", m: "The dark one", syl: "Ka" },
  { n: "Kartik", deva: "कार्तिक", g: "m", m: "A month; Skanda", syl: "Ka" },
  { n: "Kamal", deva: "कमल", g: "m", m: "Lotus", syl: "Ka" },
  { n: "Kavya", deva: "काव्या", g: "f", m: "Poetry", syl: "Ka" },
  { n: "Kalpana", deva: "कल्पना", g: "f", m: "Imagination", syl: "Ka" },
  { n: "Kishore", deva: "किशोर", g: "m", m: "A youth", syl: "Ki" },
  { n: "Kirti", deva: "कीर्ति", g: "f", m: "Fame", syl: "Ki" },
  { n: "Kiara", deva: "कियारा", g: "f", m: "Light", syl: "Ki" },
  { n: "Kunal", deva: "कुणाल", g: "m", m: "Lotus; son of Ashoka", syl: "Ku" },
  { n: "Kumar", deva: "कुमार", g: "m", m: "Young prince", syl: "Ku" },
  { n: "Kumud", deva: "कुमुद", g: "m", m: "Night lotus", syl: "Ku" },
  { n: "Kusum", deva: "कुसुम", g: "f", m: "Flower", syl: "Ku" },
  { n: "Kunti", deva: "कुन्ती", g: "f", m: "Mother of the Pandavas", syl: "Ku" },
  { n: "Kedar", deva: "केदार", g: "m", m: "A field; Shiva", syl: "Ke" },
  { n: "Keshav", deva: "केशव", g: "m", m: "Krishna", syl: "Ke" },
  { n: "Ketan", deva: "केतन", g: "m", m: "Banner", syl: "Ke" },
  { n: "Keya", deva: "केया", g: "f", m: "A monsoon flower", syl: "Ke" },
  { n: "Koushik", deva: "कौशिक", g: "m", m: "A sage; Vishvamitra", syl: "Ko" },
  { n: "Komal", deva: "कोमल", g: "f", m: "Tender", syl: "Ko" },
  { n: "Kokila", deva: "कोकिला", g: "f", m: "The cuckoo", syl: "Ko" },

  // ग घ — Dhanishta, Shatabhisha, Shravana
  { n: "Ganesh", deva: "गणेश", g: "m", m: "Remover of obstacles", syl: "Ga" },
  { n: "Gagan", deva: "गगन", g: "m", m: "The sky", syl: "Ga" },
  { n: "Gauri", deva: "गौरी", g: "f", m: "Parvati, the fair one", syl: "Ga" },
  { n: "Gayatri", deva: "गायत्री", g: "f", m: "A Vedic metre and mantra", syl: "Ga" },
  { n: "Girish", deva: "गिरीश", g: "m", m: "Lord of the mountain", syl: "Gi" },
  { n: "Giri", deva: "गिरि", g: "m", m: "Mountain", syl: "Gi" },
  { n: "Gita", deva: "गीता", g: "f", m: "Song; the Bhagavad Gita", syl: "Gi" },
  { n: "Guru", deva: "गुरु", g: "m", m: "Teacher; Brihaspati", syl: "Gu" },
  { n: "Gunjan", deva: "गुंजन", g: "f", m: "Humming of bees", syl: "Gu" },
  { n: "Gopal", deva: "गोपाल", g: "m", m: "Cowherd; Krishna", syl: "Go" },
  { n: "Govind", deva: "गोविन्द", g: "m", m: "Krishna", syl: "Go" },
  { n: "Gopika", deva: "गोपिका", g: "f", m: "A gopi of Vrindavan", syl: "Go" },
  { n: "Ghanshyam", deva: "घनश्याम", g: "m", m: "Dark as a raincloud; Krishna", syl: "Gha" },

  // ह — Punarvasu, Pushya
  { n: "Hari", deva: "हरि", g: "m", m: "Vishnu", syl: "Ha" },
  { n: "Harsh", deva: "हर्ष", g: "m", m: "Joy", syl: "Ha" },
  { n: "Hardik", deva: "हार्दिक", g: "m", m: "Heartfelt", syl: "Ha" },
  { n: "Hansika", deva: "हंसिका", g: "f", m: "Swan", syl: "Ha" },
  { n: "Harshita", deva: "हर्षिता", g: "f", m: "Joyful", syl: "Ha" },
  { n: "Himanshu", deva: "हिमांशु", g: "m", m: "The moon", syl: "Hi" },
  { n: "Hitesh", deva: "हितेश", g: "m", m: "Well-wisher", syl: "Hi" },
  { n: "Hima", deva: "हिमा", g: "f", m: "Snow", syl: "Hi" },
  { n: "Hemant", deva: "हेमन्त", g: "m", m: "Early winter", syl: "He" },
  { n: "Hemal", deva: "हेमल", g: "m", m: "Golden", syl: "He" },
  { n: "Hema", deva: "हेमा", g: "f", m: "Gold", syl: "He" },

  // द ड — Ashlesha, Pushya, Bhadrapada, Revati
  { n: "Daksh", deva: "दक्ष", g: "m", m: "Able; a Prajapati", syl: "Da" },
  { n: "Darshan", deva: "दर्शन", g: "m", m: "Sight of the divine", syl: "Da" },
  { n: "Damini", deva: "दामिनी", g: "f", m: "Lightning", syl: "Da" },
  { n: "Damayanti", deva: "दमयन्ती", g: "f", m: "The queen of Nala", syl: "Da" },
  { n: "Dinesh", deva: "दिनेश", g: "m", m: "Lord of the day", syl: "Di" },
  { n: "Divit", deva: "दिवित", g: "m", m: "Immortal", syl: "Di" },
  { n: "Divya", deva: "दिव्या", g: "f", m: "Divine", syl: "Di" },
  { n: "Diya", deva: "दीया", g: "f", m: "Lamp", syl: "Di" },
  { n: "Diksha", deva: "दीक्षा", g: "f", m: "Initiation", syl: "Di" },
  { n: "Durgesh", deva: "दुर्गेश", g: "m", m: "Lord of forts", syl: "Du" },
  { n: "Durga", deva: "दुर्गा", g: "f", m: "The unassailable goddess", syl: "Du" },
  { n: "Dulari", deva: "दुलारी", g: "f", m: "Beloved", syl: "Du" },
  { n: "Dev", deva: "देव", g: "m", m: "God", syl: "De" },
  { n: "Devansh", deva: "देवांश", g: "m", m: "Part of the divine", syl: "De" },
  { n: "Deepak", deva: "दीपक", g: "m", m: "Lamp", syl: "De" },
  { n: "Devika", deva: "देविका", g: "f", m: "Little goddess", syl: "De" },
  { n: "Deepti", deva: "दीप्ति", g: "f", m: "Brilliance", syl: "De" },

  // ध — Purva Ashadha
  { n: "Dhruv", deva: "ध्रुव", g: "m", m: "The pole star; steadfast", syl: "Dha" },
  { n: "Dhiraj", deva: "धीरज", g: "m", m: "Patience", syl: "Dha" },
  { n: "Dhara", deva: "धारा", g: "f", m: "A stream", syl: "Dha" },
  { n: "Dhanya", deva: "धन्या", g: "f", m: "Fortunate", syl: "Dha" },

  // म — Magha, Purva Phalguni
  { n: "Manav", deva: "मानव", g: "m", m: "Human", syl: "Ma" },
  { n: "Madhav", deva: "माधव", g: "m", m: "Krishna", syl: "Ma" },
  { n: "Mayank", deva: "मयंक", g: "m", m: "The moon", syl: "Ma" },
  { n: "Mahi", deva: "मही", g: "f", m: "The earth", syl: "Ma" },
  { n: "Mansi", deva: "मानसी", g: "f", m: "Of the mind", syl: "Ma" },
  { n: "Mihir", deva: "मिहिर", g: "m", m: "The sun", syl: "Mi" },
  { n: "Mitra", deva: "मित्र", g: "m", m: "Friend; a Vedic deity", syl: "Mi" },
  { n: "Meera", deva: "मीरा", g: "f", m: "Devotee of Krishna", syl: "Mi" },
  { n: "Mitali", deva: "मिताली", g: "f", m: "Friendship", syl: "Mi" },
  { n: "Mukul", deva: "मुकुल", g: "m", m: "Bud, blossom", syl: "Mu" },
  { n: "Mukund", deva: "मुकुन्द", g: "m", m: "Krishna, giver of liberation", syl: "Mu" },
  { n: "Mudita", deva: "मुदिता", g: "f", m: "Joy in another's joy", syl: "Mu" },
  { n: "Muskan", deva: "मुस्कान", g: "f", m: "Smile", syl: "Mu" },
  { n: "Mehul", deva: "मेहुल", g: "m", m: "Rain", syl: "Me" },
  { n: "Megha", deva: "मेघा", g: "f", m: "Cloud", syl: "Me" },
  { n: "Medha", deva: "मेधा", g: "f", m: "Intellect", syl: "Me" },
  { n: "Mohan", deva: "मोहन", g: "m", m: "Enchanting; Krishna", syl: "Mo" },
  { n: "Mohit", deva: "मोहित", g: "m", m: "Entranced", syl: "Mo" },
  { n: "Mohini", deva: "मोहिनी", g: "f", m: "The enchantress", syl: "Mo" },

  // त ट थ — Purva Phalguni, Swati, Vishakha
  { n: "Tanmay", deva: "तन्मय", g: "m", m: "Absorbed", syl: "Ta" },
  { n: "Tanish", deva: "तनिष", g: "m", m: "Ambition", syl: "Ta" },
  { n: "Tanvi", deva: "तन्वी", g: "f", m: "Slender", syl: "Ta" },
  { n: "Tara", deva: "तारा", g: "f", m: "Star", syl: "Ta" },
  { n: "Tanuja", deva: "तनुजा", g: "f", m: "Daughter", syl: "Ta" },
  { n: "Tithi", deva: "तिथि", g: "f", m: "A lunar day", syl: "Ti" },
  { n: "Tushar", deva: "तुषार", g: "m", m: "Frost, snow", syl: "Tu" },
  { n: "Tulsi", deva: "तुलसी", g: "f", m: "Holy basil", syl: "Tu" },
  { n: "Tushti", deva: "तुष्टि", g: "f", m: "Contentment", syl: "Tu" },
  { n: "Tejas", deva: "तेजस", g: "m", m: "Radiance", syl: "Te" },
  { n: "Tejasvi", deva: "तेजस्वी", g: "f", m: "Lustrous", syl: "Te" },
  { n: "Tejal", deva: "तेजल", g: "f", m: "Radiant", syl: "Te" },
  { n: "Toshan", deva: "तोषण", g: "m", m: "Satisfying", syl: "To" },
  { n: "Toshi", deva: "तोषी", g: "f", m: "Content", syl: "To" },

  // प फ — Uttara Phalguni, Hasta, Chitra
  { n: "Pranav", deva: "प्रणव", g: "m", m: "The syllable Om", syl: "Pa" },
  { n: "Parth", deva: "पार्थ", g: "m", m: "Arjuna, son of Pritha", syl: "Pa" },
  { n: "Pavan", deva: "पवन", g: "m", m: "The wind", syl: "Pa" },
  { n: "Padma", deva: "पद्मा", g: "f", m: "Lotus; Lakshmi", syl: "Pa" },
  { n: "Palak", deva: "पलक", g: "f", m: "Eyelash", syl: "Pa" },
  { n: "Piyush", deva: "पीयूष", g: "m", m: "Nectar", syl: "Pi" },
  { n: "Pinaki", deva: "पिनाकी", g: "m", m: "Shiva, bearer of the bow", syl: "Pi" },
  { n: "Priya", deva: "प्रिया", g: "f", m: "Beloved", syl: "Pi" },
  { n: "Purav", deva: "पुरव", g: "m", m: "Eastern", syl: "Pu" },
  { n: "Pushkar", deva: "पुष्कर", g: "m", m: "Lotus; a sacred lake", syl: "Pu" },
  { n: "Punya", deva: "पुण्य", g: "f", m: "Merit", syl: "Pu" },
  { n: "Purvi", deva: "पूर्वी", g: "f", m: "Eastern; a raga", syl: "Pu" },
  { n: "Phalgun", deva: "फाल्गुन", g: "m", m: "The last lunar month", syl: "Pha" },

  // ष श स — Hasta, Shatabhisha
  { n: "Shaurya", deva: "शौर्य", g: "m", m: "Valour", syl: "Sha" },
  { n: "Shantanu", deva: "शान्तनु", g: "m", m: "A king of Hastinapur", syl: "Sha" },
  { n: "Shakti", deva: "शक्ति", g: "f", m: "Power", syl: "Sha" },
  { n: "Sharvani", deva: "शर्वाणी", g: "f", m: "Parvati", syl: "Sha" },
  { n: "Sarthak", deva: "सार्थक", g: "m", m: "Meaningful", syl: "Sa" },
  { n: "Samarth", deva: "समर्थ", g: "m", m: "Capable", syl: "Sa" },
  { n: "Sagar", deva: "सागर", g: "m", m: "Ocean", syl: "Sa" },
  { n: "Sanvi", deva: "सान्वी", g: "f", m: "Lakshmi", syl: "Sa" },
  { n: "Sadhana", deva: "साधना", g: "f", m: "Sustained practice", syl: "Sa" },
  { n: "Siddharth", deva: "सिद्धार्थ", g: "m", m: "One who attains the goal", syl: "Si" },
  { n: "Sita", deva: "सीता", g: "f", m: "Consort of Rama", syl: "Si" },
  { n: "Siddhi", deva: "सिद्धि", g: "f", m: "Attainment", syl: "Si" },
  { n: "Simran", deva: "सिमरन", g: "f", m: "Remembrance of the divine", syl: "Si" },
  { n: "Surya", deva: "सूर्य", g: "m", m: "The sun", syl: "Su" },
  { n: "Sujay", deva: "सुजय", g: "m", m: "A good victory", syl: "Su" },
  { n: "Sundar", deva: "सुन्दर", g: "m", m: "Beautiful", syl: "Su" },
  { n: "Suman", deva: "सुमन", g: "f", m: "Flower; good-hearted", syl: "Su" },
  { n: "Sudha", deva: "सुधा", g: "f", m: "Nectar", syl: "Su" },
  { n: "Sena", deva: "सेना", g: "f", m: "Army", syl: "Se" },
  { n: "Sevak", deva: "सेवक", g: "m", m: "One who serves", syl: "Se" },
  { n: "Soham", deva: "सोहम्", g: "m", m: "I am that", syl: "So" },
  { n: "Sohan", deva: "सोहन", g: "m", m: "Handsome", syl: "So" },
  { n: "Sonal", deva: "सोनल", g: "f", m: "Golden", syl: "So" },
  { n: "Soumya", deva: "सौम्य", g: "f", m: "Gentle; of the moon", syl: "So" },

  // न ण — Hasta, Anuradha, Jyeshtha
  { n: "Narayan", deva: "नारायण", g: "m", m: "Vishnu", syl: "Na" },
  { n: "Nakul", deva: "नकुल", g: "m", m: "A Pandava", syl: "Na" },
  { n: "Naina", deva: "नैना", g: "f", m: "Eyes", syl: "Na" },
  { n: "Nandini", deva: "नन्दिनी", g: "f", m: "Delightful daughter", syl: "Na" },
  { n: "Namrata", deva: "नम्रता", g: "f", m: "Humility", syl: "Na" },
  { n: "Nikhil", deva: "निखिल", g: "m", m: "Complete, entire", syl: "Ni" },
  { n: "Nishant", deva: "निशांत", g: "m", m: "End of night, dawn", syl: "Ni" },
  { n: "Nitya", deva: "नित्या", g: "f", m: "Eternal", syl: "Ni" },
  { n: "Nidhi", deva: "निधि", g: "f", m: "Treasure", syl: "Ni" },
  { n: "Nutan", deva: "नूतन", g: "f", m: "New", syl: "Nu" },
  { n: "Neel", deva: "नील", g: "m", m: "Blue", syl: "Ne" },
  { n: "Neha", deva: "नेहा", g: "f", m: "Love", syl: "Ne" },
  { n: "Netra", deva: "नेत्र", g: "f", m: "The eye", syl: "Ne" },

  // र — Chitra, Swati
  { n: "Raghav", deva: "राघव", g: "m", m: "Of Raghu's line; Rama", syl: "Ra" },
  { n: "Ram", deva: "राम", g: "m", m: "The seventh avatar", syl: "Ra" },
  { n: "Rajat", deva: "रजत", g: "m", m: "Silver", syl: "Ra" },
  { n: "Radha", deva: "राधा", g: "f", m: "Beloved of Krishna", syl: "Ra" },
  { n: "Rachana", deva: "रचना", g: "f", m: "Creation", syl: "Ra" },
  { n: "Rishabh", deva: "ऋषभ", g: "m", m: "Excellent; the second note", syl: "Ri" },
  { n: "Riya", deva: "रिया", g: "f", m: "Singer", syl: "Ri" },
  { n: "Ridhi", deva: "ऋद्धि", g: "f", m: "Prosperity", syl: "Ri" },
  { n: "Ritu", deva: "ऋतु", g: "f", m: "Season", syl: "Ri" },
  { n: "Rudra", deva: "रुद्र", g: "m", m: "A form of Shiva", syl: "Ru" },
  { n: "Ruchi", deva: "रुचि", g: "f", m: "Taste, interest", syl: "Ru" },
  { n: "Rupa", deva: "रूपा", g: "f", m: "Form, beauty", syl: "Ru" },
  { n: "Reyansh", deva: "रेयांश", g: "m", m: "A ray of light", syl: "Re" },
  { n: "Reva", deva: "रेवा", g: "f", m: "The Narmada", syl: "Re" },
  { n: "Renu", deva: "रेणु", g: "f", m: "Pollen, fine dust", syl: "Re" },
  { n: "Rohan", deva: "रोहन", g: "m", m: "Ascending", syl: "Ro" },
  { n: "Rohit", deva: "रोहित", g: "m", m: "Red", syl: "Ro" },
  { n: "Roshni", deva: "रोशनी", g: "f", m: "Light", syl: "Ro" },

  // य — Jyeshtha, Mula
  { n: "Yash", deva: "यश", g: "m", m: "Glory", syl: "Ya" },
  { n: "Yajna", deva: "यज्ञ", g: "m", m: "Sacrifice, offering", syl: "Ya" },
  { n: "Yashoda", deva: "यशोदा", g: "f", m: "Krishna's foster mother", syl: "Ya" },
  { n: "Yamini", deva: "यामिनी", g: "f", m: "Night", syl: "Ya" },
  { n: "Yug", deva: "युग", g: "m", m: "An age of the world", syl: "Yu" },
  { n: "Yuvraj", deva: "युवराज", g: "m", m: "Crown prince", syl: "Yu" },
  { n: "Yukti", deva: "युक्ति", g: "f", m: "Reason, stratagem", syl: "Yu" },
  { n: "Yogesh", deva: "योगेश", g: "m", m: "Lord of yoga", syl: "Yo" },
  { n: "Yogi", deva: "योगी", g: "m", m: "One joined in yoga", syl: "Yo" },
  { n: "Yogita", deva: "योगिता", g: "f", m: "Absorbed in yoga", syl: "Yo" },

  // भ — Mula, Purva Ashadha
  { n: "Bharat", deva: "भरत", g: "m", m: "A king; India", syl: "Bha" },
  { n: "Bhavesh", deva: "भावेश", g: "m", m: "Lord of feeling", syl: "Bha" },
  { n: "Bhavya", deva: "भव्या", g: "f", m: "Grand, splendid", syl: "Bha" },
  { n: "Bhakti", deva: "भक्ति", g: "f", m: "Devotion", syl: "Bha" },
  { n: "Bhima", deva: "भीम", g: "m", m: "Mighty; a Pandava", syl: "Bhi" },
  { n: "Bhuvan", deva: "भुवन", g: "m", m: "World", syl: "Bhu" },
  { n: "Bhushan", deva: "भूषण", g: "m", m: "Ornament", syl: "Bhu" },
  { n: "Bhumi", deva: "भूमि", g: "f", m: "The earth", syl: "Bhu" },

  // ज — Uttara Ashadha, Shravana
  { n: "Jagat", deva: "जगत्", g: "m", m: "The world", syl: "Ja" },
  { n: "Jatin", deva: "जतिन", g: "m", m: "An ascetic", syl: "Ja" },
  { n: "Jaya", deva: "जया", g: "f", m: "Victory", syl: "Ja" },
  { n: "Janhvi", deva: "जान्हवी", g: "f", m: "The Ganga", syl: "Ja" },
  { n: "Jitendra", deva: "जितेन्द्र", g: "m", m: "Conqueror of the senses", syl: "Ji" },
  { n: "Jiya", deva: "जिया", g: "f", m: "Heart", syl: "Ji" },
  { n: "Jivika", deva: "जीविका", g: "f", m: "Livelihood", syl: "Ji" },
  { n: "Juhi", deva: "जूही", g: "f", m: "A jasmine", syl: "Ju" },
  { n: "Jeet", deva: "जीत", g: "m", m: "Victory", syl: "Je" },
  { n: "Jyoti", deva: "ज्योति", g: "f", m: "Light, flame", syl: "Jo" },
  { n: "Jyotsna", deva: "ज्योत्स्ना", g: "f", m: "Moonlight", syl: "Jo" },
];

// Warm tints from the brand palette. These were dark hexes left over from an
// earlier theme, which rendered as grey slabs on the cream cards.
export const LIBRARY = [
  { id: "l1", title: "What is Meditation?", sub: "Unlocking inner peace", read: "2 min", grad: ["#CEB976", "#9C8544"] },
  { id: "l2", title: "The 7 Chakras", sub: "Energy centres of the body", read: "4 min", grad: ["#C88131", "#A5661F"] },
  { id: "l3", title: "Power of Hanuman Chalisa", sub: "Daily protection", read: "3 min", grad: ["#B4564B", "#7A4A2C"] },
];
