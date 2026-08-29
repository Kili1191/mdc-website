"use client";

// Focus de la station MAISON, ecrit par la Home, lu par HomeStage.
//
// HomeStage vit en portal sur <body>, hors de l'arbre de la page : il ne peut
// pas mesurer la section lui-meme. Il deduisait donc sa presence d'un progres
// global et de constantes calees a la main. Resultat, la maison restait pleine
// opacite alors que le texte de la station suivante etait deja a 65% : les deux
// se superposaient au centre de l'ecran sur un cinquieme du scroll.
//
// La section se mesure elle-meme et publie son focus ici. Une seule source de
// verite, et plus aucune constante a re-caler si les hauteurs changent.

let focus = 0;

export const houseFocus = {
  set(v: number) { focus = v; },
  get() { return focus; },
};
