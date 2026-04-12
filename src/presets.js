/**
 * Euclidean rhythm presets, organized into mutation families.
 *
 * Each group starts sparse and grows denser, or shares a common step-count
 * so you can hear rhythms "morph" into each other by stepping through presets.
 *
 * References:
 *   Godfried Toussaint, "The Euclidean Algorithm Generates Traditional Musical Rhythms" (2005)
 *   Toussaint, "The Geometry of Musical Rhythm" (2013)
 */

export const PRESET_GROUPS = [
  {
    name: "8-Step Family",
    description: "Common time — from sparse to dense",
    presets: [
      { name: "Duple",           pulses: 2, steps: 8, rotation: 0, origin: "Basic backbeat skeleton" },
      { name: "Tresillo",        pulses: 3, steps: 8, rotation: 0, origin: "Cuban, Latin America" },
      { name: "Habanera",        pulses: 3, steps: 8, rotation: 1, origin: "Cuban habanera (tresillo rotated)" },
      { name: "Calypso",         pulses: 4, steps: 8, rotation: 0, origin: "Trinidad calypso" },
      { name: "Son Clave",       pulses: 5, steps: 8, rotation: 0, origin: "Cuban son, salsa" },
      { name: "Cinquillo",       pulses: 5, steps: 8, rotation: 2, origin: "Cuban cinquillo" },
      { name: "Baqueteo",        pulses: 6, steps: 8, rotation: 0, origin: "Cuban baqueteo" },
    ],
  },
  {
    name: "12-Step Family",
    description: "Compound meter — triplet-based grooves",
    presets: [
      { name: "Sparse 12",      pulses: 2, steps: 12, rotation: 0, origin: "Minimal compound pulse" },
      { name: "Bembe 3",        pulses: 3, steps: 12, rotation: 0, origin: "Basic 12/8 skeleton" },
      { name: "Fume-fume",      pulses: 5, steps: 12, rotation: 0, origin: "Ashanti, Ghana" },
      { name: "Bembe",          pulses: 7, steps: 12, rotation: 0, origin: "West African bembe bell" },
      { name: "Itòtele",        pulses: 7, steps: 12, rotation: 2, origin: "Afro-Cuban batá drum" },
      { name: "Adowa",          pulses: 7, steps: 12, rotation: 4, origin: "Ashanti adowa bell" },
    ],
  },
  {
    name: "16-Step Family",
    description: "Half-time & double-time — hip-hop to dancehall",
    presets: [
      { name: "Four on Floor",  pulses: 4, steps: 16, rotation: 0, origin: "House, techno, disco" },
      { name: "Rumba Clave",    pulses: 5, steps: 16, rotation: 0, origin: "Cuban rumba" },
      { name: "Bossa Nova",     pulses: 5, steps: 16, rotation: 3, origin: "Brazilian bossa nova" },
      { name: "Samba",          pulses: 7, steps: 16, rotation: 0, origin: "Brazilian samba" },
      { name: "Afro 9/16",      pulses: 9, steps: 16, rotation: 0, origin: "West African bell pattern" },
      { name: "Soukous",        pulses: 11, steps: 16, rotation: 0, origin: "Congolese soukous guitar" },
    ],
  },
  {
    name: "Odd Meters — 5 & 7",
    description: "Aksak & asymmetric — Balkan, Turkish, Carnatic",
    presets: [
      { name: "Khafif-e-ramal", pulses: 2, steps: 5, rotation: 0, origin: "Persian, Arabic" },
      { name: "Ruchenitza",     pulses: 3, steps: 7, rotation: 0, origin: "Bulgarian folk dance" },
      { name: "Nawakhat",       pulses: 3, steps: 7, rotation: 1, origin: "Turkish rhythm" },
      { name: "Laz",            pulses: 4, steps: 7, rotation: 0, origin: "Turkish Black Sea region" },
      { name: "Tisra Nadai",    pulses: 2, steps: 5, rotation: 1, origin: "South Indian Carnatic" },
    ],
  },
  {
    name: "Odd Meters — 9 & 11",
    description: "Extended aksak — from simple to complex",
    presets: [
      { name: "Aksak 9",        pulses: 4, steps: 9, rotation: 0, origin: "Turkish aksak" },
      { name: "Take Five",      pulses: 5, steps: 9, rotation: 0, origin: "Jazz 9/8 (Dave Brubeck)" },
      { name: "Agsak (dense)",  pulses: 6, steps: 9, rotation: 0, origin: "Dense aksak variant" },
      { name: "Aqsaq 11",       pulses: 4, steps: 11, rotation: 0, origin: "Turkish 11/8" },
      { name: "York-Samai",     pulses: 5, steps: 11, rotation: 0, origin: "Arabic samai rhythm" },
      { name: "Complex 11",     pulses: 7, steps: 11, rotation: 0, origin: "Dense 11-step pattern" },
    ],
  },
  {
    name: "Sparse Pulses",
    description: "Minimalist — 1–2 hits across growing step counts",
    presets: [
      { name: "Pulse 3",        pulses: 1, steps: 3, rotation: 0, origin: "Waltz downbeat" },
      { name: "Pulse 4",        pulses: 1, steps: 4, rotation: 0, origin: "Common time downbeat" },
      { name: "Pulse 5",        pulses: 1, steps: 5, rotation: 0, origin: "Quintuple downbeat" },
      { name: "Split 6",        pulses: 2, steps: 6, rotation: 0, origin: "Half-bar accent" },
      { name: "Split 8",        pulses: 2, steps: 8, rotation: 0, origin: "Half-bar accent (common)" },
      { name: "Split 16",       pulses: 2, steps: 16, rotation: 0, origin: "Widely spaced hits" },
    ],
  },
  {
    name: "Dense / Maximalist",
    description: "Almost-full patterns — the gaps define the groove",
    presets: [
      { name: "Dense 5/7",      pulses: 5, steps: 7, rotation: 0, origin: "Near-saturated 7" },
      { name: "Dense 7/9",      pulses: 7, steps: 9, rotation: 0, origin: "Near-saturated 9" },
      { name: "Dense 7/8",      pulses: 7, steps: 8, rotation: 0, origin: "Only 1 rest in 8" },
      { name: "Dense 11/12",    pulses: 11, steps: 12, rotation: 0, origin: "Only 1 rest in 12" },
      { name: "Dense 13/16",    pulses: 13, steps: 16, rotation: 0, origin: "3 rests in 16" },
      { name: "Dense 15/16",    pulses: 15, steps: 16, rotation: 0, origin: "Only 1 rest in 16" },
    ],
  },
];

/**
 * Flat list of all presets (for search / dropdown usage)
 */
export const ALL_PRESETS = PRESET_GROUPS.flatMap((g) =>
  g.presets.map((p) => ({ ...p, group: g.name }))
);
