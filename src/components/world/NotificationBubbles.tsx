"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { dissolveFactor } from "@/lib/scroll";
import { smartphonePos } from "@/lib/smartphonePos";

const COUNT = 14;

export function NotificationBubbles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => ({
      delay: (i / COUNT) * 4,           // étalées dans le temps
      speed: 0.5 + Math.random() * 0.4, // vitesse de montée
      driftX: (Math.random() - 0.5) * 0.6,
      scale: 0.12 + Math.random() * 0.1,
    })),
    [],
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const ORIGIN = smartphonePos; // suit le téléphone à chaque frame
    seeds.forEach((s, i) => {
      const life = ((t * s.speed + s.delay) % 4) / 4; // 0→1 en boucle
      const y = ORIGIN.y + life * 4;                   // monte de 4 unités
      const x = ORIGIN.x + s.driftX * life;
      const fade = Math.sin(life * Math.PI);           // apparaît puis s'efface
      dummy.position.set(x, y, ORIGIN.z + 0.3);
      dummy.scale.setScalar(s.scale * fade);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.75 * (1 - dissolveFactor());
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <circleGeometry args={[1, 24]} />
      <meshBasicMaterial color="#B89968" transparent opacity={0.75} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
}
