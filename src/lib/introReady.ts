'use client';

import { useEffect, useState } from 'react';

export const INTRO_PRELOAD_EVENT = 'mdc:intro-preload';
export const INTRO_EXIT_EVENT = 'mdc:intro-exit-start';
export const INTRO_DONE_EVENT = 'mdc:intro-done';

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
// Ne restent ici que les deux raisons de vraiment sauter l'intro : l'avoir
// deja vue, ou arriver par un lien interne.
export function shouldBypassIntro(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const seen = localStorage.getItem('mdc_intro_seen');
  return Boolean(seen) || params.get('from') === 'carry';
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
