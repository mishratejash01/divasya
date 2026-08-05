// ============================================================================
//  DIVASYA · Vastu shastra reference (canonical constants)
//  The rulebook the engine computes WITH — like the nakshatra tables in the
//  jyotish engine. Nothing here is a verdict: verdicts, scores and remedies
//  are all derived in index.ts from these classical mappings.
//
//  Sources of record: Vastu Purusha Mandala border devtas (the 32 entrance
//  padas), pancha-tattva zone elements, the five-element bridge cycle used in
//  contemporary MahaVastu-style remediation, and the dikpala planet
//  directions of classical jyotish (rashi lord → favourable disha).
// ============================================================================

// ---------------------------------------------------------------- elements

export type Tattva = "water" | "air" | "fire" | "earth" | "space" | "wood" | "metal";

/**
 * The remedial cycle (water → wood → fire → earth → metal → water) used in
 * MahaVastu-style no-demolition remedies. When two element energies clash,
 * the BRIDGE element between them digests the conflict — e.g. fire activity
 * in a water zone is bridged by wood (greenery), never by breaking a wall.
 */
export const CYCLE: Tattva[] = ["water", "wood", "fire", "earth", "metal"];

/** The classical clash pairs — energies that damage each other directly. */
export const CLASHES: [Tattva, Tattva][] = [
  ["fire", "water"],
  ["earth", "air"],
  ["metal", "wood"],
];

/** Physical expression of each element, for remedy language. */
export const ELEMENT_EXPRESSION: Record<string, { hindi: string; objects: string; colors: string }> = {
  water: { hindi: "जल", objects: "water bowl, fountain, wavy art", colors: "blue, black" },
  wood: { hindi: "काष्ठ", objects: "green plants, wooden objects, vertical stripes", colors: "green" },
  fire: { hindi: "अग्नि", objects: "lamp, triangle motifs, electrical items", colors: "red, orange" },
  earth: { hindi: "पृथ्वी", objects: "crystals, ceramics, square motifs, salt", colors: "yellow, beige, golden" },
  metal: { hindi: "धातु", objects: "bells, metal bowls, round shapes", colors: "white, grey, silver" },
  air: { hindi: "वायु", objects: "wind chimes, open windows, light fabrics", colors: "green, grey" },
  space: { hindi: "आकाश", objects: "openness, light, emptiness kept clean", colors: "white, cream" },
};

// ---------------------------------------------------------------- activities

/**
 * What each activity IS, elementally — cooking is fire wherever the stove
 * stands; water storage is water; sleep is earth (rest, heaviness). The
 * engine judges a placement by how the activity's element behaves inside the
 * zone's element, alongside the zone's classical prescriptions.
 */
export type RoomType =
  | "entrance" | "pooja" | "kitchen" | "master_bedroom" | "bedroom" | "kids_bedroom"
  | "living" | "dining" | "study" | "toilet" | "bathroom" | "store" | "staircase"
  | "water_tank" | "borewell" | "septic_tank" | "safe" | "balcony" | "garage" | "washing";

export const ROOM_INFO: Record<RoomType, { label: string; element: Tattva; weight: number }> = {
  entrance: { label: "Main entrance", element: "space", weight: 10 },
  pooja: { label: "Pooja room", element: "space", weight: 9 },
  kitchen: { label: "Kitchen", element: "fire", weight: 9 },
  master_bedroom: { label: "Master bedroom", element: "earth", weight: 9 },
  bedroom: { label: "Bedroom", element: "earth", weight: 6 },
  kids_bedroom: { label: "Children's room", element: "earth", weight: 6 },
  living: { label: "Living room", element: "air", weight: 5 },
  dining: { label: "Dining", element: "fire", weight: 4 },
  study: { label: "Study", element: "wood", weight: 6 },
  toilet: { label: "Toilet", element: "water", weight: 9 },
  bathroom: { label: "Bathroom", element: "water", weight: 5 },
  store: { label: "Store room", element: "earth", weight: 3 },
  staircase: { label: "Staircase", element: "earth", weight: 5 },
  water_tank: { label: "Overhead tank", element: "water", weight: 5 },
  borewell: { label: "Borewell / underground water", element: "water", weight: 7 },
  septic_tank: { label: "Septic tank", element: "water", weight: 7 },
  safe: { label: "Cash locker / safe", element: "metal", weight: 6 },
  balcony: { label: "Balcony / open", element: "space", weight: 3 },
  garage: { label: "Garage / parking", element: "metal", weight: 3 },
  washing: { label: "Washing / utility", element: "water", weight: 3 },
};

// ---------------------------------------------------------------- 32 padas

/**
 * The 32 border devtas of the Vastu Purusha Mandala, clockwise. Pada N1 sits
 * beside the NW corner and the numbering runs toward NE; E1 from the NE
 * corner toward SE; S1 from SE toward SW; W1 from SW toward NW. quality is
 * the classical entrance verdict; effect is what the texts associate with a
 * door in that pada.
 */
export type PadaQuality = "auspicious" | "neutral" | "inauspicious";
export interface Pada {
  side: "N" | "E" | "S" | "W"; num: number; devta: string;
  quality: PadaQuality; effect: string;
}

export const PADAS32: Pada[] = [
  { side: "N", num: 1, devta: "Roga", quality: "inauspicious", effect: "Illness and drained vitality enter with this door" },
  { side: "N", num: 2, devta: "Naga", quality: "inauspicious", effect: "Fear, jealousy and hidden enemies" },
  { side: "N", num: 3, devta: "Mukhya", quality: "auspicious", effect: "Prosperity and standing; a door of the chief architect" },
  { side: "N", num: 4, devta: "Bhallata", quality: "auspicious", effect: "Abundance and inflow of wealth" },
  { side: "N", num: 5, devta: "Soma", quality: "auspicious", effect: "Peace, blessings and spiritual merit" },
  { side: "N", num: 6, devta: "Bhujaga", quality: "inauspicious", effect: "Enmity of the serpent — instability, ill health" },
  { side: "N", num: 7, devta: "Aditi", quality: "neutral", effect: "Mixed results; guarded wellbeing" },
  { side: "N", num: 8, devta: "Diti", quality: "inauspicious", effect: "Poverty and strife with authority" },
  { side: "E", num: 1, devta: "Shikhi", quality: "inauspicious", effect: "Fire risk and accidents" },
  { side: "E", num: 2, devta: "Parjanya", quality: "neutral", effect: "Expenditure; daughters in the family" },
  { side: "E", num: 3, devta: "Jayanta", quality: "auspicious", effect: "Victory, wealth and success" },
  { side: "E", num: 4, devta: "Indra", quality: "auspicious", effect: "Authority, royal favour and rise" },
  { side: "E", num: 5, devta: "Surya", quality: "neutral", effect: "Government attention; heat and temper rise" },
  { side: "E", num: 6, devta: "Satya", quality: "inauspicious", effect: "Untruthfulness; loss of credibility" },
  { side: "E", num: 7, devta: "Bhrisha", quality: "inauspicious", effect: "Cruelty and harshness in the household" },
  { side: "E", num: 8, devta: "Antariksha", quality: "inauspicious", effect: "Theft and insecurity" },
  { side: "S", num: 1, devta: "Anila", quality: "inauspicious", effect: "Ailments of vata; restlessness" },
  { side: "S", num: 2, devta: "Pusha", quality: "inauspicious", effect: "Servitude; loss of standing" },
  { side: "S", num: 3, devta: "Vitatha", quality: "auspicious", effect: "Acceptable south door; gains with some pretence" },
  { side: "S", num: 4, devta: "Grihakshata", quality: "auspicious", effect: "Acceptable south door; material gains" },
  { side: "S", num: 5, devta: "Yama", quality: "inauspicious", effect: "The lord of death's pada — fear and loss" },
  { side: "S", num: 6, devta: "Gandharva", quality: "inauspicious", effect: "Scandal; wandering wealth" },
  { side: "S", num: 7, devta: "Bhringaraja", quality: "inauspicious", effect: "Enmity and quarrels" },
  { side: "S", num: 8, devta: "Mriga", quality: "inauspicious", effect: "Anxiety; children's health suffers" },
  { side: "W", num: 1, devta: "Pitru", quality: "inauspicious", effect: "The ancestors' pada — debts and decline" },
  { side: "W", num: 2, devta: "Dauvarika", quality: "neutral", effect: "Guarded gains; heavy responsibility" },
  { side: "W", num: 3, devta: "Sugriva", quality: "auspicious", effect: "Strength of allies; recovery of what was lost" },
  { side: "W", num: 4, devta: "Pushpadanta", quality: "auspicious", effect: "Fortune, fame and abundance" },
  { side: "W", num: 5, devta: "Varuna", quality: "auspicious", effect: "Flow of prosperity; blessings of water" },
  { side: "W", num: 6, devta: "Asura", quality: "inauspicious", effect: "Deceit and bad company" },
  { side: "W", num: 7, devta: "Shosha", quality: "inauspicious", effect: "Depletion — wealth and health leak away" },
  { side: "W", num: 8, devta: "Papayakshma", quality: "inauspicious", effect: "Chronic disease; the most avoided pada" },
];

// ---------------------------------------------------------------- jyotish

/**
 * Dikpala planet directions of classical jyotish. A person's favourable
 * disha is computed: rashi → rashi lord → that planet's direction. Only the
 * seven classical planets rule rashis, so the chain never needs Rahu/Ketu.
 */
export const PLANET_DIK: Record<string, { dir: string; code: string }> = {
  Sun: { dir: "East", code: "E" },
  Moon: { dir: "Northwest", code: "NW" },
  Mars: { dir: "South", code: "S" },
  Mercury: { dir: "North", code: "N" },
  Jupiter: { dir: "Northeast", code: "NE" },
  Venus: { dir: "Southeast", code: "SE" },
  Saturn: { dir: "West", code: "W" },
};

export const RASHI_LORD: Record<string, string> = {
  Mesha: "Mars", Vrishabha: "Venus", Mithuna: "Mercury", Karka: "Moon",
  Simha: "Sun", Kanya: "Mercury", Tula: "Venus", Vrishchika: "Mars",
  Dhanu: "Jupiter", Makara: "Saturn", Kumbha: "Saturn", Meena: "Jupiter",
};
