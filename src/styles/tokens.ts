// src/styles/tokens.ts
// Palette Aube Encens — couleur dans la MATIÈRE, jamais l'UI. Jamais dark/froid.
//
// LES POURCENTAGES SONT UNE PROPORTION, PAS UN BUDGET DE PIXELS. « brou 15 % »
// ne veut pas dire que 15 % de l'ecran est brun — du texte ne couvre jamais
// 15 % d'une page. C'est une regle de hierarchie : le fond domine, l'encre
// suit, l'accent est rare.
//
// Mesure sur trois pages, 555 429 pixels echantillonnes :
//
//   pierre (hors palette)  59,7 %   la photographie de marbre
//   parchemin              37,1 %
//   ocre                    1,6 %
//   taupe                   0,7 %
//   sauge                   0,7 %
//   brou + brouFonce        0,3 %
//   rouille                 0,02 %
//
// CE QUE CA DIT, et c'est la palette qui a raison : sauge et ocre n'ont
// AUCUNE occurrence dans src/, et pourtant ils sont a l'ecran. Ils sont dans
// la pierre. C'est exactement la premiere ligne de ce fichier — la couleur
// vit dans la matiere, pas dans l'interface. Les ecrire en CSS serait les
// sortir de leur place.
//
// La seule couleur qui touche l'interface est le rouille, et c'est assume :
// c'est le logo, et le seul accent du site. A 0,02 % de l'ecran, « rare » est
// tenu.

// Contrastes MESURES sur le parchemin #EDE4D0. Le seuil est 4,5:1 pour du
// texte, 3,0:1 pour un trait ou une bordure.
export const COLORS = {
  parchemin:  "#EDE4D0", // fond — 55%
  brou:       "#4A3B2A", // texte courant — 8,52:1
  brouFonce:  "#2F2519", // titres forts — 11,87:1

  // LE ROUGE DE LA MAISON, mesure sur public/logo.png : #B14E2D domine
  // (510 px), moyenne ponderee #B14E2C. Le jeton disait « logo » et valait
  // #A55A3E : 24 de distance RGB, l'oeil separe les deux teintes.
  //
  // Il en faut DEUX, et c'est le contraste qui l'impose. Le rouge du logo
  // donne 4,16:1 — assez pour une marque ou un trait, pas pour du texte.
  // Or `rouille` servait de couleur de texte sur TOUS les boutons, le lien
  // BEGIN et le mailto de /begin.
  rouille:      "#B14E2D", // LA MARQUE — la maison dessinee, le logo. 4,16:1
  rouilleEncre: "#A84A2B", // LE TEXTE — meme teinte, 5 % plus sombre. 4,51:1

  // Traits et bordures uniquement. #A89A85 donne 2,18:1 : invisible en
  // bordure de champ, ou l'on a besoin de 3,0. Assombri de 18 %.
  taupe:      "#908067", // 3,04:1

  // DECLARES ET JAMAIS UTILISES — zero occurrence dans src/. Conserves parce
  // qu'ils appartiennent a la marque, pas au code. Ni l'un ni l'autre ne
  // passe le contraste du texte : sauge 2,76:1, ocre 2,13:1. S'ils servent
  // un jour, ce sera dans la matiere, jamais pour un mot.
  sauge:      "#8C8B6A",
  ocre:       "#B89968",
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
