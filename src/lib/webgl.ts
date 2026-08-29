"use client";

// Sonde de capacité WebGL, évaluée une fois par page.
//
// Sans elle, chaque `new THREE.WebGLRenderer()` et chaque <Canvas> R3F lève
// "Error creating WebGL context." quand le navigateur refuse WebGL
// (accélération matérielle coupée, GPU blacklisté, contextes épuisés,
// machine d'entreprise verrouillée). L'erreur remonte hors de useEffect,
// React démonte l'arbre entier, et le visiteur reçoit une page blanche —
// sur TOUTES les routes, puisque SiteMarble vit dans le layout racine.
//
// La matière est un luxe, jamais une condition d'accès au texte.

let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    cached = Boolean(gl);
    // Libère immédiatement le contexte de la sonde : les navigateurs
    // plafonnent le nombre de contextes vivants (~16), et le site en
    // ouvre déjà plusieurs (marbre, maison, images fluides).
    if (gl && "getExtension" in gl) {
      (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    cached = false;
  }
  return cached;
}
