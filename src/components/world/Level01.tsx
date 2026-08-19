"use client";

import { SpotLight, Text, useDepthBuffer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PALETTE = {
  monolith: "#2F2519",
  monolithEmissive: "#4A3B2A",
  godRay: "#B89968",
  text: "#EDE4D0",
} as const;

// Mulberry32 — deterministic PRNG so monolith/debris placement is stable
// across reloads.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type MonolithSpec = {
  position: [number, number, number];
  rotation: [number, number, number];
  rotSpeed: [number, number];
  size: number;
};

// 8 organic floating rocks near the house — IcosahedronGeometry with
// detail level 1 so each face is a flat shard (gives them a faceted,
// rocky read rather than a smooth ball).
function Monoliths() {
  const items = useMemo<MonolithSpec[]>(() => {
    const rand = mulberry32(42);
    return Array.from({ length: 8 }).map(() => ({
      position: [
        (rand() * 2 - 1) * 5,
        (rand() * 2 - 1) * 2.2,
        -2 - rand() * 6, // z in [-2, -8]
      ],
      rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      rotSpeed: [(rand() - 0.5) * 0.15, (rand() - 0.5) * 0.2],
      size: 0.35 + rand() * 0.55, // r in [0.35, 0.9]
    }));
  }, []);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    for (let i = 0; i < items.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const it = items[i];
      mesh.rotation.x += it.rotSpeed[0] * delta;
      mesh.rotation.y += it.rotSpeed[1] * delta;
    }
  });

  return (
    <group>
      {items.map((it, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={it.position}
          rotation={it.rotation}
        >
          <icosahedronGeometry args={[it.size, 1]} />
          <meshStandardMaterial
            color={PALETTE.monolith}
            emissive={PALETTE.monolithEmissive}
            emissiveIntensity={0.4}
            roughness={0.9}
            metalness={0.0}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

type DebrisItem = {
  position: [number, number, number];
  size: number;
  speed: number;
  rotSpeed: number;
};

function Debris() {
  const items = useMemo<DebrisItem[]>(() => {
    const rand = mulberry32(99);
    return Array.from({ length: 30 }).map(() => ({
      position: [
        (rand() * 2 - 1) * 15,
        (rand() * 2 - 1) * 5,
        -2 - rand() * 43,
      ],
      size: 0.06 + rand() * 0.18,
      speed: 0.05 + rand() * 0.1,
      rotSpeed: (rand() - 0.5) * 0.5,
    }));
  }, []);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    for (let i = 0; i < items.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const it = items[i];
      mesh.position.y += it.speed * delta;
      if (mesh.position.y > 6) mesh.position.y = -6;
      mesh.rotation.x += it.rotSpeed * delta;
      mesh.rotation.y += it.rotSpeed * 0.7 * delta;
    }
  });

  return (
    <group>
      {items.map((item, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={item.position}
        >
          <icosahedronGeometry args={[item.size, 0]} />
          <meshStandardMaterial
            color={PALETTE.monolith}
            emissive={PALETTE.monolithEmissive}
            emissiveIntensity={0.25}
            roughness={0.85}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
}

function GodRay() {
  const depthBuffer = useDepthBuffer({ size: 256, frames: 1 });

  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-3, -1, -20);
    return o;
  }, []);

  return (
    <>
      <primitive object={target} />
      <SpotLight
        depthBuffer={depthBuffer}
        position={[6, 8, -42]}
        target={target}
        color={PALETTE.godRay}
        intensity={12}
        angle={0.55}
        penumbra={0.7}
        distance={70}
        attenuation={6}
        anglePower={4}
        opacity={0.95}
      />
    </>
  );
}

type TroikaText = THREE.Mesh & {
  fillOpacity?: number;
  sync?: () => void;
};

function EnoughText() {
  const ref = useRef<TroikaText>(null);
  const camera = useThree((s) => s.camera);

  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    m.position.y = 0.5 + Math.sin(clock.elapsedTime * 0.6) * 0.1;
    const camZ = camera.position.z;
    const fade = Math.max(0, Math.min(1, (-2 - camZ) / 2));
    m.fillOpacity = fade;
  });

  return (
    <Text
      ref={ref}
      font="/fonts/prata-regular.woff"
      position={[0, 0.5, -8]}
      fontSize={1.2}
      color={PALETTE.text}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.05}
      fillOpacity={0}
    >
      Enough.
    </Text>
  );
}

export function Level01() {
  return (
    <>
      <Monoliths />
      <Debris />
      <GodRay />
      <EnoughText />
    </>
  );
}
