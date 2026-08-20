// Pub-sub léger pour l'état de scroll deux axes (VISION §2).
// - Vertical : descente pilotée par Lenis, `y` en pixels, `progress` en 0..1.
// - Horizontal : accumulation `x` (px virtuels) capturée sur wheel/touch quand
//   |dx| > |dy|, sans lier au scroll natif — on regarde autour, on ne change
//   pas de niveau. Le consommateur (caméra 3D) lit `x` et rappelle.
//
// Volontairement pas dans un React Context : les scènes 3D lisent à 60fps,
// on n'a pas besoin de re-renders React.

export type ScrollMode = "vertical" | "horizontal";

export type ScrollState = {
  y: number;         // scroll vertical en px (Lenis)
  progress: number;  // 0..1 du scroll total
  x: number;         // exploration horizontale accumulée (virtuelle)
  mode: ScrollMode;  // dernière intention détectée
};

const state: ScrollState = { y: 0, progress: 0, x: 0, mode: "vertical" };
const listeners = new Set<(s: ScrollState) => void>();

export const scrollStore = {
  get(): ScrollState { return state; },
  set(patch: Partial<ScrollState>) {
    Object.assign(state, patch);
    for (const cb of listeners) cb(state);
  },
  subscribe(cb: (s: ScrollState) => void): () => void {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  },
};
