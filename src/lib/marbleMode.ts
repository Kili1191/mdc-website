"use client";

// Le regime du marbre, par page — sans jamais reconstruire la couche.
//
// Le motif est le meme partout, et il porte une maison gravee. Sur l'accueil
// c'est voulu : la pierre est le sujet. Sur une page de contenu, la meme
// gravure remonte DERRIERE le texte et on lit deux maisons a l'ecran, celle du
// site et celle de la pierre.
//
// La tentation etait de changer de motif selon la route. C'est exactement ce
// qui detruisait le renderer a chaque navigation et laissait l'ecran sans
// marbre pendant deux secondes (cf DIRECTION.md). La regle qui en sort tient
// toujours : **la couche ne se reconstruit pas**. Ce qui varie par page doit
// donc etre un UNIFORM lu a la frame, jamais une prop.
//
// Deux valeurs, lissees sur un demi-souffle pour qu'un changement de page ne
// se voie pas comme une bascule.

const K = 0.012;   // ~un demi-souffle pour rejoindre la cible

let scaleTarget = 1.0;
let quietTarget = 0.0;
let scale = 1.0;
let quiet = 0.0;

export const marbleMode = {
  /** `quiet` : page de contenu. La revelation s'attenue et evite la gravure. */
  set(isQuiet: boolean) {
    scaleTarget = isQuiet ? 0.35 : 1.0;
    quietTarget = isQuiet ? 1.0 : 0.0;
  },
  /** Se poser d'emblee, sans transition : premier rendu. */
  jump(isQuiet: boolean) {
    this.set(isQuiet);
    scale = scaleTarget;
    quiet = quietTarget;
  },
  step(): { scale: number; quiet: number } {
    scale += (scaleTarget - scale) * K;
    quiet += (quietTarget - quiet) * K;
    return { scale, quiet };
  },
};
