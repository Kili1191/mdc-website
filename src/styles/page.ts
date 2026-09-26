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

// Le rythme vertical etait fixe : 160 en haut, 200 en bas, quel que soit
// l'ecran. Sur un iPhone 13 (844px de haut) ca fait 43% d'un ecran de vide
// avant le premier mot, et la meme page demandait quinze ecrans et demi de
// defilement sur Sessions. Sur un 27 pouces, a l'inverse, 160px est etroit.
// La meme valeur ne peut pas dire « genereux » aux deux endroits.
//
// Les bornes hautes sont exactement les anciennes valeurs, 160 et 200 : au
// dela de 940px de large rien ne change d'un pixel. Ce reglage ne descend que
// sur les petits ecrans, la ou il etait faux.
export const pageStyle: CSSProperties = {
  position: "relative", zIndex: 5, minHeight: "100svh",
  paddingTop: "clamp(104px, 17vw, 160px)",
  paddingBottom: "clamp(112px, 20vw, 200px)",
};

// ─────────────────────────────────────────────────────────────────────────
// LA MESURE, ET POURQUOI `ch` MENTAIT DE MOITIE.
//
// `ch` vaut la largeur du chiffre ZERO, pas celle d'un caractere moyen. Sur
// une fonte dont le zero est large, les deux n'ont rien a voir. Mesure faite
// au navigateur sur cinq paragraphes de prose reelle du site, a 17, 18 et
// 21px, avec un resultat identique aux trois tailles :
//
//   Prata   zero = 1,515 x l'avance moyenne de sa prose
//   Higuen  zero = 1,164 x l'avance moyenne de ses titres
//
// Consequence : `maxWidth: 62ch` ne donnait pas 62 caracteres par ligne, il
// en donnait QUATRE-VINGT-QUATORZE. Mesure sur /practitioner avant
// correction : 91 caracteres sur une ligne, 93 sur le chapo de /notes. La
// plage confortable en lecture est 45 a 75, l'optimum autour de 66.
//
// Toutes les mesures de PROSE sont donc divisees par ce facteur. 45ch donne
// 68 caracteres reels a 18px, soit 564px de colonne.
//
// LES TITRES NE BOUGENT PAS, et c'est la distinction qui compte : Higuen ne
// ment presque pas. Mesure a l'ecran, les titres tiennent deja 14 a 19
// caracteres par ligne, ce qui est exactement ce qu'un titre doit faire. Leur
// appliquer la meme correction les aurait casses sans raison.
//
// LA REGLE, pour la suite : une mesure de prose s'ecrit en ch DIVISE par
// 1,515, ou directement en pixels. Une mesure de titre s'ecrit en ch tel
// quel.
// ─────────────────────────────────────────────────────────────────────────

export const body: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 18, lineHeight: 1.75,
  color: COLORS.brou, margin: 0, maxWidth: "45ch",
};

export const lead: CSSProperties = {
  ...body, fontSize: 21, color: COLORS.brouFonce,
};

// Le relief grave, pose sur TOUS les grands titres du site.
//
// L'accueil a le geste — l'outil passe, voir SplitTextChars et l'option
// `grave` de BreathReveal. Les pages internes ont l'etat : la pierre est deja
// taillee quand on entre. C'est ce qui fait que c'est une identite et pas un
// effet d'accueil, et c'est la meme lumiere partout, celle du sillon de la
// marge.
//
// Valeurs identiques a l'image finale de @keyframes mdc-burin. Si l'une bouge,
// l'autre bouge le meme jour, sinon la maison a deux gravures.
const RELIEF =
  "0.017em 0.021em 0 rgba(255, 251, 241, 0.52), -0.008em -0.010em 0.012em rgba(47, 37, 25, 0.20)";

// Les planchers montent, de 34 a 40 et de 26 a 29. Un clamp dont le plancher
// a ete regle pour ne rien casser finit par donner une page de telephone plus
// timide que la meme page sur ecran — or c'est sur telephone qu'un titre doit
// porter seul, sans colonne voisine ni marge pour le mettre en valeur. 40px
// sur 390 de large tient en deux ou trois lignes courtes, mesure sur les huit
// titres du site.
export const bigHead: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(40px, 5.4vw, 62px)",
  lineHeight: 1.14, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
  textShadow: RELIEF,
};

export const sectionHead: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(29px, 3.6vw, 40px)",
  lineHeight: 1.22, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
  maxWidth: "18ch",
  textShadow: RELIEF,
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
  textTransform: "uppercase", color: COLORS.brou, opacity: 0.82, margin: 0,
};

export const micro: CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12.5, letterSpacing: "0.20em",
  textTransform: "uppercase", color: COLORS.brou, margin: 0,
};

export const label: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: 24, letterSpacing: "0.36em",
  color: COLORS.brou, margin: 0,
};

export const quote: CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(24px, 3.4vw, 38px)",
  lineHeight: 1.3, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
  fontStyle: "italic", maxWidth: "20ch",
};


// ─────────────────────────────────────────────────────────────────────────
// L'ECHELLE. Elle n'existait pas : un releve sur dix pages a 1440px a trouve
// VINGT tailles de police distinctes, dont huit paires separees de moins de
// 7 % — 18/17/16,8/16, 13/14, 12,5/12, 11,5/11, 40/38, 52/50. Un ecart de
// 1,05 ne se lit pas comme une hierarchie, il se lit comme une inattention.
//
// Les douze marches ci-dessous sont celles que le site utilise vraiment, les
// doublons fondus dans la marche la plus proche. Ce n'est pas une suite
// geometrique posee d'avance : c'est l'inventaire de l'existant, nettoye.
//
// A RESPECTER : une taille nouvelle se prend ICI. Si aucune ne convient, la
// bonne question est ce qu'elle doit dire de plus que ses voisines, pas
// quel nombre poser.
export const ECHELLE = {
  afficheXL: 92,   // le titre de l'accueil
  afficheL:  62,   // bigHead a son plafond
  afficheM:  52,   // les citations, le dernier rang de la lignee
  afficheS:  40,   // sectionHead a son plafond, les rangs de la lignee
  // 29 servait deja SANS etre nomme : c'est le plancher du clamp de
  // sectionHead, monte de 26 a 29 sur mesure, et la marche du milieu des
  // questions de /begin/before. Une marche qu'on utilise sans l'inscrire est
  // exactement ce que ce registre a ete ecrit pour finir.
  // Rapports : 40/29 = 1,379 · 29/24 = 1,208. Sains.
  afficheXS: 29,
  titre:     24,   // label
  chapo:     21,   // lead
  corps:     18,   // body
  corpsS:    17,   // les colonnes serrees, la signature du pied
  etiquetteL: 15,
  etiquetteM: 13,  // les boutons
  etiquetteS: 12.5,
  micro:     11,   // eyebrow
} as const;
