"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { LEVEL_END_Z, cameraPositionAt } from "@/lib/path";
import {
  cameraProgress,
  snapHorizontalToZero,
  stepHorizontal,
} from "@/lib/scroll";

const CAMERA_LERP = 0.08;
const TRANSITION_SNAP_RANGE = 4;

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const lookAt = useRef(new THREE.Vector3());
  // Lerped "calm" path position, kept separate so we can add the drift
  // on top each frame as a pure offset (assignment, no feedback loop).
  const baseLerp = useRef(new THREE.Vector3(0, 0, -3));

  useFrame(({ clock }) => {
    // Vertical descent — scroll progress drives position along the path.
    const t = cameraProgress();
    const basePos = cameraPositionAt(t);

    // Snap horizontal exploration to centre near level boundaries.
    if (
      LEVEL_END_Z.some((z) => Math.abs(basePos.z - z) < TRANSITION_SNAP_RANGE)
    ) {
      snapHorizontalToZero();
    }
    const xOffset = stepHorizontal();

    // Cinematic drift — autonomous "breath", two-frequency mix, calms to
    // 0 by t = 1. Independent of any mouse input.
    const calm = 1 - t;
    const driftX =
      (Math.sin(clock.elapsedTime * 0.3) * 0.18 +
        Math.sin(clock.elapsedTime * 0.13) * 0.1) *
      calm;
    const driftY =
      (Math.cos(clock.elapsedTime * 0.23) * 0.13 +
        Math.cos(clock.elapsedTime * 0.17) * 0.07) *
      calm;

    // Path target — no drift here, so the lerp tracks only the calm path.
    const targetX = basePos.x + xOffset;
    const targetY = basePos.y;
    const targetZ = basePos.z;

    baseLerp.current.x += (targetX - baseLerp.current.x) * CAMERA_LERP;
    baseLerp.current.y += (targetY - baseLerp.current.y) * CAMERA_LERP;
    baseLerp.current.z += (targetZ - baseLerp.current.z) * CAMERA_LERP;
    camera.position.x = baseLerp.current.x + driftX;
    camera.position.y = baseLerp.current.y + driftY;
    camera.position.z = baseLerp.current.z;

    // Regard : suit la hauteur de la caméra (donc on RESSENT la montée),
    // et se lève vers ME TIME (au-dessus de la porte) en fin de parcours.
    const lookUpEnd = THREE.MathUtils.smoothstep(t, 0.6, 0.85);
    lookAt.current.set(
      xOffset,
      camera.position.y + lookUpEnd * 1.2,
      camera.position.z - 12,
    );
    camera.lookAt(lookAt.current);
    camera.rotation.z += Math.sin(clock.elapsedTime * 0.15) * 0.012 * calm;
  });

  return null;
}
