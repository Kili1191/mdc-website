"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { House } from "@/components/world/House";
import { scrollStore } from "@/lib/scrollStore";

// Scène 3D unique et permanente sur la Home.
// La caméra descend le long d'un axe pendant que tu scrolles — pas de
// stop, pas de pin. La maison n'apparaît qu'autour de sa station et
// dégage quand on la dépasse. Modèle scroll-scrub continu (Awwwards
// 2024–2026 : Igloo Inc, Studio Freight, Active Theory).

const N_STATIONS = 6;
const HOUSE_STATION = 2; // 0-indexed → MAISON = 3e station
const HOUSE_CENTER = (HOUSE_STATION + 0.5) / N_STATIONS;
const HOUSE_WIDTH = 1 / N_STATIONS;

function easeInOutQuad(x: number) { return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2; }
function gaussian(x: number, mu: number, sigma: number) {
  const d = (x - mu) / sigma;
  return Math.exp(-0.5 * d * d);
}

function HouseChoreo() {
  const groupRef = useRef<THREE.Group>(null);
  const cameraFocus = useRef({ x: 0, y: 0 });

  useFrame(({ camera }, dt) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const p = scrollStore.get().progress;

    // Visibilité : gauss centrée sur la station MAISON
    const vis = gaussian(p, HOUSE_CENTER, HOUSE_WIDTH * 0.6);

    // Approche progressive : la maison vient de loin, on la longe et
    // on la dépasse (Z de +5 = loin à -3 = dépassée)
    const t = (p - HOUSE_CENTER) / HOUSE_WIDTH; // -0.5..0.5..+
    const clampedT = Math.max(-1.3, Math.min(1.3, t));
    g.position.z = -clampedT * 4;
    g.position.y = -0.15 - clampedT * 0.25;

    // Scale : contenue mais visible — pas de zoom violent
    const s = 0.55 + easeInOutQuad(vis) * 0.4;
    g.scale.setScalar(s);

    // Vue 3/4 en approche, on tourne autour de la maison au dépassement
    const baseRotY = -Math.PI / 6;
    g.rotation.y = baseRotY + clampedT * 0.9 + Math.sin(performance.now() * 0.0003) * 0.04;
    g.rotation.x = 0.08 - clampedT * 0.06;

    // Fade in/out
    g.visible = vis > 0.015;

    // Caméra : léger drift latéral piloté par l'exploration horizontale
    const s2 = scrollStore.get();
    cameraFocus.current.x += (s2.x / 800 - cameraFocus.current.x) * (dt * 3);
    camera.position.x = cameraFocus.current.x;
    camera.lookAt(0, -0.15, 0);
  });

  return (
    <group ref={groupRef}>
      <House />
    </group>
  );
}

export default function HomeStage() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.55} color="#EDE4D0" />
        <directionalLight position={[3, 4, 5]} intensity={0.7} color="#EDE4D0" />
        <directionalLight position={[-2, -1, 3]} intensity={0.25} color="#B89968" />
        <Suspense fallback={null}>
          <HouseChoreo />
        </Suspense>
      </Canvas>
    </div>
  );
}
