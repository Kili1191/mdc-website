"use client";

// Etat de la station MAISON, ecrit par la Home, lu par le shader du marbre.
//
// Deux valeurs, et pas une seule, parce qu'elles ne racontent pas la meme
// chose :
//
//   progress — l'avancee du burin, 0 en haut de la station, 1 en bas.
//              Monotone. Le sillon se creuse une fois et reste creuse.
//   presence — la visibilite de la gravure, qui monte puis redescend.
//
// La premiere version pilotait le burin avec la presence. La gravure se
// creusait donc jusqu'au centre de la station puis se REFERMAIT quand on
// continuait a descendre, ce qui n'arrive a aucune pierre et donnait
// l'impression d'un passage interminable pour un geste jamais acheve.

// TROISIEME VALEUR : la traversee.
//
// Une fois la maison gravee, on la TRAVERSE. La station suivante — celle sans
// texte, `aria-hidden`, qui existait deja pour donner sa course au burin —
// fait grandir la gravure jusqu'a ce qu'elle depasse l'ecran : on entre par la
// porte et on ressort de l'autre cote.
//
// Elle vit ici et pas dans la station MAISON parce que cette derniere PORTE UN
// TEXTE (« Maison du Calme asks nothing of you »). Faire enfler la gravure
// derriere lui le rendrait illisible et mettrait deux choses fortes au meme
// endroit. La station de la gravure est vide : c'est sa raison d'etre.
//
// 0 avant, 1 apres, et elle ne redescend pas — passe la porte, la maison est
// derriere vous. Le shader la sort de l'ecran, le garde de `chisel()` fait le
// reste.

let progress = 0;
let presence = 0;
let traversee = 0;

export const houseFocus = {
  set(nextPresence: number, nextProgress: number) {
    presence = nextPresence;
    progress = nextProgress;
  },
  setTraversee(v: number) { traversee = v; },
  presence() { return presence; },
  progress() { return progress; },
  traversee() { return traversee; },
};
