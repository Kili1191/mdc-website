'use client';

import { useEffect, useState } from 'react';

export const INTRO_PRELOAD_EVENT = 'mdc:intro-preload';
export const INTRO_EXIT_EVENT = 'mdc:intro-exit-start';
// Le marbre a compile ses shaders, envoye ses textures et rendu sa premiere
// image. C'est le seul moment ou l'on sait que son cout est PAYE — une duree
// devinee ne le dira jamais, elle depend de la machine.
export const MARBLE_READY_EVENT = 'mdc:marbre-pret';
export const INTRO_DONE_EVENT = 'mdc:intro-done';

// Rouvrir le souffle a la demande, depuis n'importe quelle page. L'intro
// n'est plus seulement une porte : c'est un exercice qu'on peut refaire.
export const BREATH_OPEN_EVENT = 'mdc:breathe';

export function ouvrirLeSouffle() {
  window.dispatchEvent(new CustomEvent(BREATH_OPEN_EVENT));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// `prefers-reduced-motion` NE FIGURE PLUS ICI, et c'est le correctif.
//
// Kilian a envoye le lien a quelqu'un qui n'a jamais vu l'intro. La cause :
// cette fonction renvoyait vrai des que le systeme demandait moins
// d'animation — sur iPhone, « Reduire les animations » est tres souvent
// active sans qu'on s'en souvienne — et l'intro etait alors sautee en
// entier. Ces visiteurs arrivaient directement sur le site sans jamais voir
// la maison, c'est-a-dire sans jamais voir la marque.
//
// La preference demande MOINS DE MOUVEMENT, pas moins de contenu. La reponse
// juste est de montrer le meme moment sans l'animer : la maison deja tracee,
// les yeux ouverts, le nom en place, et rien qui bouge. C'est ce que fait
// IntroOverlay via prefersReducedMotion().
//
// L'INTRO JOUE A CHAQUE ARRIVEE. Demande de Kilian : « mets a chaque fois
// l'intro ». Le drapeau localStorage `mdc_intro_seen` qui la limitait a une
// fois par navigateur n'existe plus.
//
// MAIS « a chaque arrivee » n'est pas « a chaque chargement de page », et la
// nuance n'est pas un detail : toute la navigation du site passe par des
// <a href> classiques, jamais par next/link. Chaque clic sur Sessions, sur
// Coaching, sur Begin est donc un rechargement COMPLET. Sans distinction, on
// se prendrait treize secondes de souffle entre chaque page — ce que le
// localStorage empechait, et personne ne demande ca.
//
// On regarde donc D'OU l'on vient, avec deux sources qui se completent :
//
//   performance navigation type — 'reload' quand on rafraichit. On rejoue :
//     rafraichir est un geste volontaire, et c'est exactement ce qu'on fait
//     quand on veut revoir l'ouverture.
//
//   document.referrer — s'il pointe vers le site lui-meme, on arrive d'une
//     autre page de la maison : on est deja entre, on ne refait pas le seuil.
//
// Tout le reste — lien externe, signet, adresse tapee, onglet neuf — est une
// arrivee, et l'intro joue.
export function shouldBypassIntro(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);

  // Les deux commandes explicites priment sur tout le reste.
  if (params.get('intro') === '1') return false;      // force
  if (params.get('from') === 'carry') return true;    // saute

  const nav = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  if (nav?.type === 'reload') return false;           // il a rafraichi : on rejoue

  // Arrive-t-on d'une autre page du meme site ?
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin) {
      return true;
    }
  } catch {
    // referrer illisible : on considere que c'est une arrivee, et on joue.
  }

  return false;
}

export function useIntroReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (shouldBypassIntro()) {
      setReady(true);
      return;
    }
    const onReady = () => setReady(true);
    window.addEventListener(INTRO_PRELOAD_EVENT, onReady);
    window.addEventListener(INTRO_EXIT_EVENT, onReady);
    return () => {
      window.removeEventListener(INTRO_PRELOAD_EVENT, onReady);
      window.removeEventListener(INTRO_EXIT_EVENT, onReady);
    };
  }, []);
  return ready;
}
