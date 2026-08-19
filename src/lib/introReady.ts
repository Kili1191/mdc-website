'use client';

import { useEffect, useState } from 'react';

export const INTRO_PRELOAD_EVENT = 'mdc:intro-preload';
export const INTRO_EXIT_EVENT = 'mdc:intro-exit-start';
export const INTRO_DONE_EVENT = 'mdc:intro-done';

export function shouldBypassIntro(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const seen = localStorage.getItem('mdc_intro_seen');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return Boolean(seen) || params.get('from') === 'carry' || reduced;
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
