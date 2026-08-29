"use client";

// Stillness — l'immobilite comme entree.
//
// Tout le web recompense l'input : scroller plus, survoler plus, cliquer plus.
// Ce site recompense l'arret, parce que c'est litteralement ce qu'il propose.
//
// Quand le scroll ET le pointeur se taisent, `value` monte de 0 a 1 sur la
// duree d'un souffle. La matiere s'ouvre, se rechauffe, la gravure descend
// d'elle-meme. Au premier mouvement, tout se retire vite.
//
// Deux regles tenues ici :
//   - la montee dure exactement un demi-cycle de coherence cardiaque, donc la
//     recompense arrive au rythme du souffle et pas d'un minuteur ;
//   - la descente est bien plus rapide que la montee. On perd le calme plus
//     vite qu'on ne le gagne, ce qui est aussi vrai hors du navigateur.
//
// Aucun texte nouveau n'apparait jamais : l'immobilite revele de la matiere,
// pas des mots. La copy reste celle du corpus valide.

export const BREATH_MS = 5500;          // coherence cardiaque, 5,5 resp/min

// Temps mort avant que l'arret compte.
//
// Sur telephone, un visiteur est immobile presque tout le temps : il tape,
// puis il lit. Avec le meme delai que sur desktop, l'immobilite devenait
// l'etat par defaut et la pierre restait ouverte en permanence. Pire, elle se
// rouvrait deux secondes apres chaque tap, plus fort que le tap lui-meme :
// on ne voyait donc jamais le marbre se refermer.
//
// Mesure du conflit, apres un tap, en restant immobile : detail local 6,06 a
// une seconde, 3,12 a deux secondes (la pierre s'est bien refermee), puis
// 10,56 a sept secondes. L'immobilite ecrasait la recuperation.
//
// Au doigt, l'arret doit donc etre choisi, pas subi. Il faut poser le
// telephone, pas simplement cesser de scroller.
const GRACE_MS_POINTER = 900;
const GRACE_MS_TOUCH = 3800;
const RISE_MS = BREATH_MS;              // pleine recompense apres un souffle
const RISE_K = 0.020;                   // lissage a la montee
const FALL_K = 0.140;                   // lissage a la descente, 7x plus vif

let lastInput = 0;
let value = 0;
let started = false;
let reduced = false;
let grace = GRACE_MS_POINTER;

function markInput() { lastInput = performance.now(); }

function loop() {
  const now = performance.now();
  const idle = now - lastInput - grace;
  const target = reduced ? 0 : Math.max(0, Math.min(1, idle / RISE_MS));
  value += (target - value) * (target > value ? RISE_K : FALL_K);
  requestAnimationFrame(loop);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastInput = performance.now();
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Un pointeur grossier, c'est un doigt : l'arret y est la norme, pas un geste.
  if (window.matchMedia("(pointer: coarse)").matches) grace = GRACE_MS_TOUCH;

  const opts = { passive: true } as const;
  window.addEventListener("scroll", markInput, opts);
  window.addEventListener("wheel", markInput, opts);
  window.addEventListener("pointermove", markInput, opts);
  window.addEventListener("pointerdown", markInput, opts);
  window.addEventListener("touchstart", markInput, opts);
  window.addEventListener("keydown", markInput);
  // Onglet en arriere-plan : ce n'est pas de l'immobilite choisie.
  document.addEventListener("visibilitychange", markInput);

  requestAnimationFrame(loop);
}

export const stillness = {
  get(): number {
    start();
    return value;
  },
};

// Phase de souffle partagee, 0 -> 1 -> 0 sur un cycle. Une seule horloge pour
// tout ce qui respire sur le site, sinon chaque element derive dans son coin.
export function breath(now = performance.now()): number {
  const p = (now % BREATH_MS) / BREATH_MS;
  return 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
}
