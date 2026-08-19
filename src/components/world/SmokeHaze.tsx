"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { dissolveFactor } from "@/lib/scroll";

// Génère une texture de volute de fumée douce au canvas (radial noise).
function makeSmokeTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  // fond transparent
  ctx.clearRect(0, 0, size, size);
  // plusieurs blobs radiaux pour une forme de fumée irrégulière
  for (let i = 0; i < 12; i++) {
    const x = size * (0.3 + Math.random() * 0.4);
    const y = size * (0.3 + Math.random() * 0.4);
    const r = size * (0.15 + Math.random() * 0.25);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,235,200,0.10)");
    g.addColorStop(1, "rgba(255,235,200,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function SmokePuff({ tex, seed }: { tex: THREE.Texture; seed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const p = useMemo(() => ({
    x: (Math.sin(seed) ) * 9,
    y: (Math.cos(seed * 1.3)) * 5,
    z: -8 - (seed % 40),
    rot: Math.random() * Math.PI,
    rotSpeed: (Math.random() * 2 - 1) * 0.05,
    driftX: (Math.random() * 2 - 1) * 0.3,
    driftY: 0.1 + Math.random() * 0.2,
    scale: 8 + Math.random() * 10,
    phase: Math.random() * Math.PI * 2,
  }), [seed]);

  useFrame(({ clock }, delta) => {
    const m = ref.current; if (!m) return;
    const t = clock.elapsedTime;
    m.position.x = p.x + Math.sin(t * 0.15 + p.phase) * 1.5 + p.driftX * t * 0.2;
    m.position.y = p.y + Math.cos(t * 0.12 + p.phase) * 1.0;
    m.position.z = p.z;
    m.rotation.z += p.rotSpeed * delta;
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = (0.5 + Math.sin(t * 0.3 + p.phase) * 0.2) * (1 - dissolveFactor());
  });

  return (
    <mesh ref={ref} position={[p.x, p.y, p.z]} scale={[p.scale, p.scale, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={0.5} depthWrite={false} toneMapped={false} blending={THREE.NormalBlending} />
    </mesh>
  );
}

export function SmokeHaze({ count = 10 }: { count?: number }) {
  const tex = useMemo(() => makeSmokeTexture(), []);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SmokePuff key={i} tex={tex} seed={i * 12.7 + 1} />
      ))}
    </>
  );
}
