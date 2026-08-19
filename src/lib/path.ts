"use client";

import * as THREE from "three";

// Camera path through Act 1 (Chaos) — z = -3 to -50. On démarre juste
// devant les premiers objets (z=-9 et suivants) pour supprimer le couloir
// vide du début. cameraProgress() drive le scroll → t sur le path.
const POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, -3),
  new THREE.Vector3(0.05, 0.05, -12),
  new THREE.Vector3(-0.05, 0.1, -25),
  new THREE.Vector3(0.05, 0.4, -36),   // commence à monter
  new THREE.Vector3(0, 1.4, -43),      // monte vers ME TIME (au-dessus de la porte)
  new THREE.Vector3(0, 0.2, -48),      // redescend au centre pour entrer dans la porte
  new THREE.Vector3(0, 0, -50),
];

export const PATH = new THREE.CatmullRomCurve3(
  POINTS,
  false,
  "catmullrom",
  0.5,
);

// Level / scene boundaries (Z positions). Used by CameraRig to snap the
// horizontal exploration target back to 0 as the camera approaches them.
export const LEVEL_END_Z: readonly number[] = [-50];

export function cameraPositionAt(t: number): THREE.Vector3 {
  return PATH.getPointAt(THREE.MathUtils.clamp(t, 0, 1));
}

export function cameraTangentAt(t: number): THREE.Vector3 {
  return PATH.getTangentAt(THREE.MathUtils.clamp(t, 0, 1)).normalize();
}
