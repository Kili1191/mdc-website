"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { isTouchDevice } from "@/components/world/Chaos";
import { dissolveFactor } from "@/lib/scroll";

// Les 4 enseignes. flickerAmount : 0 = stable, 1 = mourante/grésille fort.
// tilt : inclinaison (rad). aspect : ratio largeur/hauteur de l'image.
// wall : true = posée "au mur" (ne fait pas face caméra, garde son angle).
const SIGNS = [
  { src: "/imfine.png",     pos: [-6.5, 3.2, -15] as [number, number, number], scale: 4.0, aspect: 2.4, tilt: 0.08, flickerAmount: 0.25, wall: false, seed: 3 },
  { src: "/outoforder.png", pos: [6.0, 1.0, -17] as [number, number, number], scale: 4.2, aspect: 1.0, tilt: -0.22, flickerAmount: 0.85, wall: false, seed: 11 },
  { src: "/metime.png",     pos: [0.5, 5.5, -46] as [number, number, number], scale: 3.2, aspect: 2.0, tilt: 0, flickerAmount: 0.3, wall: false, seed: 19 },
  { src: "/nopeace.png",    pos: [-5.0, -2.5, -37] as [number, number, number], scale: 4.0, aspect: 1.78, tilt: -0.14, flickerAmount: 0.9, wall: false, seed: 31 },
];

type SignProps = (typeof SIGNS)[number];

function NeonSign({ src, pos, scale, aspect, tilt, flickerAmount, wall, seed }: SignProps) {
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [src]);
  useEffect(() => () => texture.dispose(), [texture]);

  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const litRef = useRef(1); // état allumé lissé

  useFrame(({ clock, camera }, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    const t = clock.elapsedTime;

    // Toutes les enseignes sont flottantes et tournées vers la caméra,
    // puis on applique leur tilt au-dessus du billboard.
    mesh.lookAt(camera.position);
    mesh.rotation.z = tilt;

    // Proximité caméra : 0 loin (>16u), 1 proche (<6u).
    const dist = mesh.position.distanceTo(camera.position);
    const proximity = THREE.MathUtils.clamp((16 - dist) / 10, 0, 1);

    // Flicker cinématique : produit de sinus irréguliers + coupures sèches.
    const f = t * 13 + seed;
    const wave = Math.sin(f) * Math.sin(f * 2.3) * Math.sin(f * 0.7);
    // micro-buzz haute fréquence
    const buzz = 0.92 + Math.sin(t * 47 + seed) * 0.08;
    // seuil de coupure : plus flickerAmount haut, plus ça coupe souvent
    const threshold = -0.55 + flickerAmount * 0.45;

    let targetLit;
    if (src === "/metime.png") {
      // ratés irréguliers, plus marqués : bruit pseudo-aléatoire multi-fréquences
      const n =
        Math.sin(t * 7.3 + seed) *
        Math.sin(t * 2.1 + seed * 1.7) *
        Math.sin(t * 13.9 + seed * 0.3);
      // seuils irréguliers → coupures imprévisibles et franches
      if (n < -0.3) {
        targetLit = 0.1; // coupure franche (plus sombre qu'avant)
      } else if (n < -0.1) {
        targetLit = 0.55; // demi-allumage
      } else {
        targetLit = 1.0; // allumée
      }
      targetLit *= buzz;
    } else {
      targetLit = wave < threshold ? 1 - flickerAmount * 0.8 : 1;
      targetLit *= buzz;
    }

    // Le flicker ne s'active vraiment qu'à l'approche : loin = stable et calme.
    // mix(stable, flicker, proximity)
    const stable = 0.85; // luminosité de repos quand on est loin
    const lit = THREE.MathUtils.lerp(stable, targetLit, proximity);

    // lissage léger pour éviter le strobe trop dur
    litRef.current += (lit - litRef.current) * 0.5;

    // Flicker = variation de LUMINOSITÉ (couleur), l'enseigne reste OPAQUE.
    const litColor = THREE.MathUtils.clamp(litRef.current, 0.15, 1);
    mat.color.setScalar(litColor); // blanc plein → gris foncé (néon qui baisse)
    mat.opacity = 1 - dissolveFactor(); // opacité pleine sauf dissolve final
  });

  return (
    <mesh ref={meshRef} position={pos} scale={[scale * aspect, scale, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={1}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function NeonSigns() {
  const m = isTouchDevice();
  const signs = SIGNS.map((s) => ({
    ...s,
    scale: s.scale * (m && s.src === "/imfine.png" ? 0.7 : 1), // seule I'M FINE réduite sur mobile (tient entière sur le côté)
    pos: [
      s.pos[0] * (m ? 0.5 : 1),
      s.pos[1],
      s.pos[2],
    ] as [number, number, number],
  }));
  return (
    <>
      {signs.map((s) => (
        <NeonSign key={s.src} {...s} />
      ))}
    </>
  );
}
