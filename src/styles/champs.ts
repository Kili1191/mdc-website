import type { CSSProperties } from "react";
import { COLORS, FONTS } from "@/styles/tokens";

// Les champs de saisie du site, ecrits UNE fois.
//
// Ils vivaient dans `begin/BeginForm.tsx`. L'entretien de `/begin/before` pose
// les memes questions sous une autre forme, et recopier ces quatre objets
// aurait recree exactement le defaut que `src/styles/page.ts` decrit en tete de
// fichier : deux endroits ou corriger la meme faute, donc une correction qui
// n'arrive jamais aux deux.
//
// LE LIBELLE EST EN BROU, ET C'EST UNE CORRECTION MESUREE. Il etait ecrit en
// taupe : 1,77:1 sur le marbre du site, quand un petit texte en demande 4,5.
// « Your name », « How to reach you », « What brings you » etaient donc
// illisibles en pratique, sur la seule page qui transforme un visiteur en
// client. C'est la faute exacte que le §11 du skill taste decrit : le taupe est
// une couleur de PAUSE, une regle ou un filet, jamais une couleur de texte.
// Le brou donne 6,93:1. Le taupe reste juste au-dessous, en bordure de champ :
// c'est son emploi.
// 12,5 et non 12 : `micro` vaut 12,5 et les deux se croisent a l'ecran sur
// /begin/before (le libelle du champ et le numero de la transcription), a 1,042
// l'un de l'autre. Deux etiquettes capitales interlettrees separees de 4 % ne
// disent pas deux choses, elles disent qu'on n'a pas regarde. 12,5 est la
// marche `etiquetteS` d'ECHELLE ; 12 n'en etait pas une.
export const labelChamp: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12.5, letterSpacing: "0.24em",
  textTransform: "uppercase", color: COLORS.brou, margin: 0,
  display: "block", marginBottom: 12,
};

// 17 ET NON 16, et l'argument etait deja ecrit trois objets plus bas.
//
// `champMenu` porte depuis longtemps : « Le champ herite de 16 ; la prose
// serree du site est a 17. Un menu qui compose un demi-point sous tout le reste
// se remarque sans rien dire. » Il avait ete monte a 17, les deux autres non.
//
// Mesure sur /begin/before : ce que le visiteur TAPE (16) et l'echo de ce qu'il
// vient de taper dans « what you have said » (17) sont a l'ecran ensemble,
// separes de 1,063 — sous le seuil de 1,07 en dessous duquel deux tailles ne se
// lisent plus comme une hierarchie mais comme une inattention. 503px entre les
// deux a 1440, 614px a 390 : on les voit dans la meme page, toujours.
//
// 17 reste >= 16, donc pas de zoom au focus sur iOS. C'est descendre qui aurait
// ete dangereux.
export const champLigne: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 17, color: COLORS.brou,
  background: "transparent",
  border: 0, borderBottom: `1px solid ${COLORS.taupeTrait}`,
  padding: "12px 0", width: "100%", outline: "none",
};

export const champTexte: CSSProperties = {
  ...champLigne,
  minHeight: 140, resize: "vertical", lineHeight: 1.6,
  paddingTop: 12, paddingBottom: 12,
};

export const champMenu: CSSProperties = {
  ...champLigne,
  // Il portait `fontSize: 17` a lui seul, et l'argument qui l'y avait mis. Cet
  // argument vaut pour TOUS les champs, donc il est remonte sur `champLigne` et
  // le menu n'a plus rien de particulier a declarer.
  appearance: "none",
  cursor: "pointer",
};
