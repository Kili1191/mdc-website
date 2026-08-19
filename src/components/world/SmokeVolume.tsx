"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { dissolveFactor } from "@/lib/scroll";

// Texture de fumée = dégradé radial doux, dessiné une fois au canvas.
// Un cercle flou ne peut JAMAIS faire de ligne ni d'angle carré.
function makeSoftCircle(): THREE.Texture {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(s/2, s/2, s/2, 0, Math.PI*2);
  ctx.fill();
  return new THREE.CanvasTexture(c);
}

function Puff({ tex, seed }: { tex: THREE.Texture; seed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const p = useMemo(() => ({
    x: Math.sin(seed*1.7)*11,
    y: Math.cos(seed*2.3)*6,
    z: -10 - (seed*4.1 % 38),
    scale: 10 + (seed*3.3 % 12),
    driftX: (Math.sin(seed)*0.5),
    speed: 0.06 + (seed % 5)*0.01,
    phase: seed*1.3,
    baseOp: 0.10 + (seed % 4)*0.02,
  }), [seed]);
  useFrame(({ clock }) => {
    const m = ref.current; if (!m) return;
    const t = clock.elapsedTime;
    m.position.x = p.x + Math.sin(t*p.speed + p.phase)*2.5 + p.driftX*Math.sin(t*0.05)*3.0;
    m.position.y = p.y + Math.cos(t*p.speed*0.8 + p.phase)*1.8;
    m.position.z = p.z;
    m.rotation.z = t*0.02 + p.phase;
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = p.baseOp * (1 - dissolveFactor());
  });
  return (
    <mesh ref={ref} position={[p.x,p.y,p.z]} scale={[p.scale,p.scale,1]}>
      <planeGeometry args={[1,1]} />
      <meshBasicMaterial map={tex} transparent opacity={0.1} depthWrite={false} toneMapped={false} color="#C9A876" />
    </mesh>
  );
}

export function SmokeVolume({ count = 16 }: { count?: number }) {
  const tex = useMemo(() => makeSoftCircle(), []);
  return <>{Array.from({length:count}).map((_,i)=><Puff key={i} tex={tex} seed={i*7.3+2.1} />)}</>;
}
