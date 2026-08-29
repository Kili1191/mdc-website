"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { House } from "@/components/world/House";
import { scrollStore } from "@/lib/scrollStore";
import { houseFocus } from "@/lib/houseFocus";
import { hasWebGL } from "@/lib/webgl";

// Scène 3D unique et permanente sur la Home.
// La caméra descend le long d'un axe pendant que tu scrolles — pas de
// stop, pas de pin. La maison n'apparaît qu'autour de sa station et
// dégage quand on la dépasse. Modèle scroll-scrub continu (Awwwards
// 2024–2026 : Igloo Inc, Studio Freight, Active Theory).

function HouseChoreo() {
  const groupRef = useRef<THREE.Group>(null);
  const cameraFocus = useRef({ x: 0, y: 0 });

  useFrame(({ camera }, dt) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    // Presence pilotee par la section MAISON elle-meme, pas par un progres
    // global : la maison ne peut plus etre pleine opacite pendant que le texte
    // de la station voisine est lisible.
    const f = houseFocus.get();

    // Logo visible en entier tout au long de la station, PETIT.
    // Zoom très subtil : 0.35 (entrée) → 0.48 (sortie), croissance
    // douce de ~37% — on sent une approche cinétique sans que la
    // maison ne remplisse jamais l'écran.
    // Le zoom suit la meme courbe que la presence : la maison approche en
    // apparaissant et s'eloigne en s'effacant.
    const s = 0.35 + f * 0.13; // 0.35 → 0.48
    g.scale.setScalar(s);

    const alpha = f;
    (g.userData as { alpha?: number }).alpha = alpha;
    g.visible = alpha > 0.02;

    // Rotation très douce — vibration organique, pas de vue 3/4 forcée
    g.rotation.y = Math.sin(performance.now() * 0.0003) * 0.04;
    g.rotation.x = 0;
    g.position.set(0, 0, 0);

    // Caméra : drift latéral piloté par l'exploration horizontale
    const s2 = scrollStore.get();
    cameraFocus.current.x += (s2.x / 800 - cameraFocus.current.x) * (dt * 3);
    camera.position.x = cameraFocus.current.x;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <House />
    </group>
  );
}

export default function HomeStage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // La maison est un moment 3D : sans WebGL elle ne se degrade pas, elle
  // s'absente. Le reste de la traversee (texte, marbre statique) tient seul.
  if (!mounted || !hasWebGL()) return null;

  // Monte en portal sur <body>, hors de PageTransition.
  //
  // PageTransition enveloppe children dans un div qui porte en permanence
  // `transform` et `will-change: transform`. Les deux creent un bloc
  // conteneur pour les descendants `position: fixed` : ce layer ne se
  // dimensionnait donc pas au viewport mais a la hauteur du document,
  // 5400px au lieu de 900. Le canvas R3F suivait, et la maison sortait
  // six fois trop grande, rognee sur les quatre bords.
  //
  // Les constantes de zoom (0.35 -> 0.48) etaient justes depuis le debut :
  // le calcul donnait bien 23% de la hauteur ecran. C'est le canvas qui
  // mentait. Le portal rend `fixed` a nouveau relatif au viewport.
  return createPortal(
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
    </div>,
    document.body,
  );
}
