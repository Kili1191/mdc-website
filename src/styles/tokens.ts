// src/styles/tokens.ts
// Palette Aube Encens — couleur dans la MATIÈRE, jamais l'UI. Jamais dark/froid.

export const COLORS = {
  parchemin:  "#EDE4D0", // fond — 55%
  brou:       "#4A3B2A", // texte courant — 15%
  brouFonce:  "#2F2519", // titres forts
  sauge:      "#8C8B6A", // accent végétal — usage MESURÉ (refroidit, jamais en masse)
  taupe:      "#A89A85", // pause / neutre — 10%
  ocre:       "#B89968", // accent chaud — 5%
  rouille:    "#A55A3E", // logo + highlights rares — 3%
} as const;

export const FONTS = {
  // Prata = corps + sous-titres · Higuen = gros titres uniquement · Great Vibes = exceptionnel
  prata:      "var(--font-prata), Georgia, serif",
  higuen:     "var(--font-higuen), Georgia, serif",
  greatVibes: "var(--font-great-vibes), cursive",
} as const;

// Échelle d'espacement (pour des marges cohérentes partout)
export const SPACE = {
  xs: "8px", sm: "16px", md: "32px", lg: "64px", xl: "120px", xxl: "200px",
} as const;
