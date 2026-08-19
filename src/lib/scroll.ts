"use client";

// Vertical scroll progress — 0 at the top of the page, 1 at scrollMax.
// Driven by Lenis (via window.scrollY).
export function verticalProgress(): number {
  if (typeof window === "undefined") return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0
    ? Math.max(0, Math.min(1, window.scrollY / max))
    : 0;
}

// Camera path progress — scroll 0 → 0.5 maps to path 0 → 1 (Act 1 raccourci),
// puis ease-in (lent au début, accélère vers la porte). Les 50 % restants
// laissent du temps pour le dissolve.
export function cameraProgress(): number {
  const raw = Math.max(0, Math.min(1, verticalProgress() / 0.5));
  return Math.pow(raw, 1.6);
}

// Dissolve factor — démarre à 60 % (juste après l'arrivée de la Maison)
// et monte à 1 sur les 40 % restants.
export function dissolveFactor(): number {
  const t = verticalProgress();
  return Math.max(0, Math.min(1, (t - 0.6) / 0.4));
}

// Horizontal exploration — a small Lenis-shaped smoother for the X axis.
// Wheel/touch deltaX feeds nudgeHorizontal(); stepHorizontal() is called
// each render to advance the lerp toward the target.
const MAX_HORIZONTAL = 8;
const HORIZONTAL_LERP = 0.06;

let hTarget = 0;
let hCurrent = 0;

export function nudgeHorizontal(delta: number) {
  hTarget = Math.max(-MAX_HORIZONTAL, Math.min(MAX_HORIZONTAL, hTarget + delta));
}

export function snapHorizontalToZero() {
  hTarget = 0;
}

// Advance the lerp by HORIZONTAL_LERP and return the smoothed value.
export function stepHorizontal(): number {
  hCurrent += (hTarget - hCurrent) * HORIZONTAL_LERP;
  return hCurrent;
}
