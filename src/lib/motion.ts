// La loi de mouvement du site. Une seule.
//
// Avant ce fichier, l'audit donnait : trois durees pour le meme geste (900,
// 800, 950), cinq valeurs de stagger, dix valeurs de delai, six courbes
// d'easing dont la bonne ecrite de trois facons differentes, et six usages
// des defauts du navigateur. Chaque valeur avait ete jugee correctement dans
// son coin ; ensemble elles ne formaient rien.
//
// Tout descend maintenant du souffle. Le site respire a 5500 ms, coherence
// cardiaque, et les durees sont des fractions de ce cycle plutot que des
// nombres choisis un par un. C'est ce qui fait qu'un site parait tenu sans
// qu'on sache dire pourquoi.

import { BREATH_MS } from "@/lib/stillness";

export const DURATION = {
  /** Une revelation. BREATH/6, arrondi. Mots, titres, images. */
  reveal: 900,
  /** Une sortie. Moitie d'une revelation : on quitte plus vite qu'on arrive. */
  exit: 450,
  /** Un croisement lent, deux etats qui se relaient sans qu'on les surprenne. */
  cross: 900,
} as const;

export const STAGGER = {
  /** Lettre a lettre, corps de texte. */
  char: 22,
  /** Lettre a lettre, grands titres : plus lent, plus tenu. */
  charDisplay: 60,
  /** Mot a mot. */
  word: 90,
  /** Ligne a ligne, pour les blocs en capitales. */
  line: 140,
} as const;

export const EASE = {
  /** Arrivees. Sortie franche puis longue decroissance, comme une inspiration. */
  reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Departs. Symetrique et sans rebond. */
  exit: "cubic-bezier(0.4, 0, 0.6, 1)",
} as const;

/** Raccourcis prets a coller dans une propriete CSS `transition`. */
export const T = {
  reveal: (prop: string, ms: number = DURATION.reveal) =>
    `${prop} ${ms}ms ${EASE.reveal}`,
  exit: (prop: string, ms: number = DURATION.exit) =>
    `${prop} ${ms}ms ${EASE.exit}`,
};

export { BREATH_MS };
