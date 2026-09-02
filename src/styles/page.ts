import type { CSSProperties } from "react";
import { COLORS, FONTS } from "@/styles/tokens";

// Les styles de page, ecrits UNE fois.
//
// Ils etaient copies dans chaque page : sept fois pageStyle, containerStyle,
// bodyStyle, eyebrowStyle, microStyle, dividerStyle. Sept copies, c'est sept
// endroits ou corriger la meme erreur, donc en pratique une correction qui
// n'arrive jamais partout — le contraste du taupe avait ete corrige sur
// Sessions et restait faux sur les six autres.
//
// Deux choses ne reviennent pas ici, volontairement :
//
//   containerStyle — la carte translucide floutee posee sur le marbre. Une
//   boite floutee sur un fond n'est pas une mise en page, c'est un aveu : on
//   ne fait pas confiance au fond. Le marbre est clair, le brou s'y lit.
//
//   dividerStyle — le filet <hr> entre les sections. Un trait est une
//   separation gratuite. L'espace et un numero disent la meme chose mieux.

export const pageStyle: CSSProperties = {
  position: "relative", zIndex: 5, minHeight: "100svh",
  paddingTop: 160, paddingBottom: 200,
};

export const body: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 18, lineHeight: 1.75,
  color: COLORS.brou, margin: 0, maxWidth: "62ch",
};

export const lead: CSSProperties = {
  ...body, fontSize: 21, color: COLORS.brouFonce,
};

export const bigHead: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(34px, 5.4vw, 62px)",
  lineHeight: 1.14, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
};

export const sectionHead: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(26px, 3.6vw, 40px)",
  lineHeight: 1.22, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
  maxWidth: "18ch",
};

// Le taupe ne sert plus a ecrire.
//
// Mesure sur le marbre du site (~rgb(221,205,185)) : le taupe #A89A85 donne un
// contraste de 1,77:1. Il en faut 4,5 pour du petit texte. Le brou donne
// 6,93:1. Les durees, les tarifs, les mentions « sur candidature » —
// l'information qui vend — etaient ecrits en taupe italique a 11 ou 12 px.
// Le taupe reste bon pour un filet ou une bordure. Il n'ecrit plus.
export const eyebrow: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.28em",
  textTransform: "uppercase", color: COLORS.brou, opacity: 0.78, margin: 0,
};

export const micro: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12.5, letterSpacing: "0.20em",
  textTransform: "uppercase", color: COLORS.brou, margin: 0,
};

export const label: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: 24, letterSpacing: "0.36em",
  color: COLORS.rouille, margin: 0,
};

export const quote: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(24px, 3.4vw, 38px)",
  lineHeight: 1.3, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
  fontStyle: "italic", maxWidth: "20ch",
};
