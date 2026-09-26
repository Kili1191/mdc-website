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
export const labelChamp: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.24em",
  textTransform: "uppercase", color: COLORS.brou, margin: 0,
  display: "block", marginBottom: 12,
};

export const champLigne: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 16, color: COLORS.brou,
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
  // Le champ herite de 16 ; la prose serree du site est a 17. Un menu qui
  // compose un demi-point sous tout le reste se remarque sans rien dire.
  fontSize: 17,
  appearance: "none",
  cursor: "pointer",
};
