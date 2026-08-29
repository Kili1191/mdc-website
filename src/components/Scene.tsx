"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

import { CameraRig } from "@/components/CameraRig";
import { Chaos, isTouchDevice } from "@/components/world/Chaos";
import { Fireflies } from "@/components/world/Fireflies";
import { FloatingObjects } from "@/components/world/FloatingObjects";
import { House } from "@/components/world/House";
import { NeonSigns } from "@/components/world/NeonSigns";
import { NotificationBubbles } from "@/components/world/NotificationBubbles";
import { SmokeVolume } from "@/components/world/SmokeVolume";
import { hasWebGL } from "@/lib/webgl";

const BG = "#000000";

// Client-only background — useLoader fires during the React Server pass
// and calls `document` indirectly; useMemo + TextureLoader defers it to
// the client mount, which is fine because this whole module is "use client".
function GrenierBackground() {
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load("/Background.jpg");
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  // En portrait, le plan large/court (120×67) laisse des bandes noires en
  // haut/bas. On l'agrandit en HAUTEUR (et garde une largeur > l'écran)
  // pour un effet « cover » : la largeur déborde hors champ, c'est voulu.
  const isMobile = isTouchDevice();
  const planeW = isMobile ? 150 : 120;
  const planeH = isMobile ? 150 : 67;
  return (
    <mesh position={[0, 0, -52]}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export function Scene() {
  const dpr: [number, number] = isTouchDevice() ? [1, 1.5] : [1, 2];

  if (!hasWebGL()) {
    return <div className="fixed inset-0" style={{ backgroundColor: BG }} />;
  }

  return (
    <div className="fixed inset-0" style={{ backgroundColor: BG }}>
      <Canvas
        camera={{ position: [0, 0, -3], fov: isTouchDevice() ? 82 : 60, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={dpr}
        onCreated={({ gl }) => gl.setClearColor(BG, 1)}
      >
        <Suspense fallback={null}>
          <GrenierBackground />
          <SmokeVolume count={16} />
          <Chaos />
          <FloatingObjects mobile={isTouchDevice()} />
          <NotificationBubbles />
          <NeonSigns />
          <Fireflies count={60} />

          {/* Soft warm point light just in front of the house so it
              reads as a glowing destination rather than a flat silhouette. */}
          <pointLight
            color="#EDE4D0"
            position={[0, 0, -49]}
            intensity={3}
            distance={30}
          />
          <group position={[0, 0, -50]} scale={2}>
            <House />
          </group>

          <CameraRig />

          <EffectComposer multisampling={0}>
            {/* Subtle warm glow on the emissive particles only. */}
            <Bloom intensity={0.6} luminanceThreshold={0.2} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
