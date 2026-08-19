"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { dissolveFactor } from "@/lib/scroll";

// Lucioles — petits points lumineux qui dérivent VERS la caméra (z monte),
// guidant l'œil à travers le chaos. Respawn à z = +5 → -50 quand passées.
// AdditiveBlending pour qu'elles glow par addition de lumière sur le fond.
export function Fireflies({ count = 60 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() * 2 - 1) * 10,
      y: (Math.random() * 2 - 1) * 6,
      z: -5 - Math.random() * 42,
      speed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      amp: 0.5 + Math.random() * 1.2,
      driftZ: 0.4 + Math.random() * 0.6, // unités/seconde vers la caméra
    }));
  }, [count]);
  const geo = useMemo(() => new THREE.SphereGeometry(0.06, 8, 8), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#E8B468",
        transparent: true,
        opacity: 1.0,
        toneMapped: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    const m = meshRef.current;
    if (!m) return;
    const t = clock.elapsedTime;
    mat.opacity = 1.0 * (1 - dissolveFactor());

    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      // Drift AWAY from camera, toward the house at z = -52 — leading the
      // eye through the chaos into the lit doorway.
      it.z -= it.driftZ * delta;
      if (it.z < -52) {
        it.z = 5;
        it.x = (Math.random() * 2 - 1) * 10;
        it.y = (Math.random() * 2 - 1) * 6;
      }

      // Funnel: x/y pulled toward (0, 0) as the firefly nears the house.
      // towardCenter = 1 when far from house, 0 right at the doorway.
      const towardCenter = THREE.MathUtils.clamp((it.z + 52) / 57, 0, 1);
      dummy.position.set(
        (it.x + Math.sin(t * it.speed + it.phase) * it.amp) *
          (0.3 + towardCenter * 0.7),
        (it.y + Math.cos(t * it.speed * 0.7 + it.phase) * it.amp * 0.8) *
          (0.3 + towardCenter * 0.7),
        it.z,
      );
      const s = 0.8 + Math.sin(t * 3 + it.phase * 5) * 0.5; // twinkle
      dummy.scale.setScalar(s * 1.5);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} />;
}
