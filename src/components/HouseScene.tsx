"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { House } from "@/components/world/House";
import * as THREE from "three";
import { scrollStore } from "@/lib/scrollStore";

// Scène 3D "MAISON" — station 3 de la traversée.
// La maison flotte au centre, la caméra dérive latéralement en fonction
// du scroll (exploration horizontale) et le pinning ScrollTrigger
// contrôle sa proximité (via progress lu depuis le store).

function DriftGroup() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const t = performance.now() * 0.0004;
    // Léger drift permanent (breath)
    groupRef.current.rotation.y = Math.sin(t) * 0.08;
    groupRef.current.position.y = Math.sin(t * 1.3) * 0.05;

    // Rotation subtile pilotée par l'exploration horizontale
    const s = scrollStore.get();
    const targetRotX = (s.x / 400) * 0.15;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * (dt * 4);
  });

  return (
    <group ref={groupRef}>
      <House />
    </group>
  );
}

export default function HouseScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} color="#EDE4D0" />
      <directionalLight position={[-2, -1, 3]} intensity={0.35} color="#B89968" />
      <Suspense fallback={null}>
        <DriftGroup />
      </Suspense>
    </Canvas>
  );
}
