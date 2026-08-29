"use client";

// Traverser la pierre — la navigation comme deplacement, pas comme fondu.
//
// Jusqu'ici un changement de route etait un fondu : le contenu disparaissait,
// un voile passait, le contenu suivant montait. Le marbre, lui, ne bougeait
// pas d'un pixel. Il etait donc du papier peint : on pouvait le retirer sans
// que la navigation change de sens.
//
// Ici la dalle est une seule et meme pierre, et chaque page occupe un endroit
// PRECIS dessus. Naviguer, c'est faire glisser la camera de l'endroit ou l'on
// est vers l'endroit ou l'on va. Les coordonnees sont fixes : aller de
// l'accueil aux seances deplace toujours la pierre de la meme facon, et
// revenir refait le chemin en sens inverse. Au bout de trois pages on a une
// carte de la maison en tete sans que personne ne l'ait dessinee.
//
// C'est la seule difference entre un effet et une structure : un effet se
// remarque une fois, une geographie s'apprend.

import { DURATION } from "@/lib/motion";

// Amplitude d'un deplacement unitaire, en fraction de la texture de marbre.
// Assez pour que le veinage change franchement d'une piece a l'autre, assez
// peu pour qu'on ne quitte jamais la meme dalle.
const AMP = 0.085;

// Le plan de la maison. L'accueil est le seuil, a l'origine.
//
//                    notes
//        practitioner  |
//              .   [ ACCUEIL ]  .  sessions
//         lineage      |
//                   the-work
//                      |
//                  retreats
//
// begin est en retrait derriere le seuil : on ressort par ou l'on est entre.
const SLAB: Record<string, [number, number]> = {
  "/":             [ 0.00,  0.00],
  "/sessions":     [ 1.00,  0.14],
  "/practitioner": [-0.92,  0.24],
  "/lineage":      [-1.00,  0.96],
  "/the-work":     [ 0.06,  0.78],
  "/retreats":     [ 0.52,  1.30],
  "/notes":        [ 1.20, -0.62],
  "/begin":        [-0.24, -0.90],
};

function place(path: string): [number, number] {
  const p = SLAB[path];
  if (p) return [p[0] * AMP, p[1] * AMP];
  // Une route inconnue n'invente pas un lieu : elle reste au seuil.
  return [0, 0];
}

// Un quart de souffle. La camera part au clic et se pose apres l'arrivee du
// contenu : le deplacement enjambe la sortie ET l'entree, sinon la pierre
// s'arreterait avant la page et on verrait deux gestes au lieu d'un.
const TRAVEL_MS = DURATION.traverse;

let fromX = 0, fromY = 0;
let toX = 0, toY = 0;
let curX = 0, curY = 0;
let smX = 0, smY = 0;
let start = -1;
let last = -1;
let reduced = false;
let checked = false;

// smootherstep : depart et arret sans a-coup. Une camera qui glisse sur de la
// pierre n'a ni impulsion ni freinage brusque.
function ease(p: number): number {
  return p * p * p * (p * (p * 6 - 15) + 10);
}

function checkReduced() {
  if (checked || typeof window === "undefined") return;
  checked = true;
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Une seule mesure par frame. Le file se lit d'un echantillon a l'autre :
// si deux appels tombaient dans la meme frame, le second verrait un ecart nul
// et effacerait le file du premier.
function sample() {
  if (start < 0) return;
  const now = performance.now();
  if (now - last < 4) return;
  last = now;
  const p = Math.min(1, (now - start) / TRAVEL_MS);
  const e = ease(p);
  const nx = fromX + (toX - fromX) * e;
  const ny = fromY + (toY - fromY) * e;
  // Le file s'obtient de la vitesse reelle de la camera, pas d'une courbe
  // separee : il naît et meurt exactement avec le mouvement.
  smX = nx - curX; smY = ny - curY;
  curX = nx; curY = ny;
  if (p >= 1) start = -1;
}

export const traverse = {
  /** Se poser d'emblee sur une page, sans traversee. Premier rendu, retour navigateur. */
  jump(path: string) {
    checkReduced();
    const [x, y] = place(path);
    fromX = toX = curX = x;
    fromY = toY = curY = y;
    smX = smY = 0;
    start = -1;
  },

  /** Lancer la traversee vers une page. */
  to(path: string) {
    checkReduced();
    const [x, y] = place(path);
    if (x === toX && y === toY) return;
    if (reduced) { this.jump(path); return; }
    fromX = curX; fromY = curY;
    toX = x; toY = y;
    start = performance.now();
  },

  /** Position de la camera sur la dalle, en fraction de texture. */
  pan(out: { x: number; y: number }) {
    sample();
    out.x = curX; out.y = curY;
  },

  /** Vitesse de la camera : sert au file du veinage pendant le trajet. */
  smear(out: { x: number; y: number }) {
    out.x = smX; out.y = smY;
  },

  /**
   * Direction du trajet vers une page, normalisee. Le contenu doit partir a
   * CONTRE-SENS de la camera : si la pierre glisse vers la droite, la page
   * qu'on quitte sort par la gauche et celle qu'on rejoint entre par la
   * droite. Sans ca les deux couches partent du meme cote et le deplacement
   * se lit comme un fondu de plus.
   */
  heading(path: string, out: { x: number; y: number }) {
    const [x, y] = place(path);
    const dx = x - curX, dy = y - curY;
    const len = Math.hypot(dx, dy);
    if (len < 1e-5) { out.x = 0; out.y = 1; return; }
    out.x = dx / len; out.y = dy / len;
  },

  /** 1 pendant une traversee, 0 au repos. */
  moving(): boolean {
    return start >= 0;
  },
};
