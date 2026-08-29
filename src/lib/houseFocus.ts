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

let progress = 0;
let presence = 0;

export const houseFocus = {
  set(nextPresence: number, nextProgress: number) {
    presence = nextPresence;
    progress = nextProgress;
  },
  presence() { return presence; },
  progress() { return progress; },
};
