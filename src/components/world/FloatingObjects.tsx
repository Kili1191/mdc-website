"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { dissolveFactor } from "@/lib/scroll";
import { smartphonePos } from "@/lib/smartphonePos";

// Placement MANUEL calé sur la pièce (Background.jpg) :
// - couloir central (x proche 0) DÉGAGÉ → la porte lumineuse reste visible
// - côté GAUCHE (x négatif) = devant la bibliothèque
// - côté DROIT (x positif) = devant les meubles houssés
// - z étalé de -9 (proche) à -44 (près de la porte)
// - les "paquets" (lettres, cartes, billets) sont REJETÉS sur les côtés, jamais au centre
// - quelques objets légèrement vers le centre (onPath:true) pour être traversés/repoussés
const OBJECTS = [
  // ── proche, entrée (z -9 à -16) ──
  { src: "/Smartphone.png", scale: 4.6, pos: [8.5, -2.5, -9], onPath: false },
  { src: "/Reveil.png",     scale: 3.4, pos: [-0.7, 0.5, -12], onPath: true },
  { src: "/keys.png",       scale: 3.4, pos: [-9.5, -3.5, -11], onPath: false },
  { src: "/lettres.png",    scale: 4.0, pos: [-9.0, -0.5, -16], onPath: false },
  // ── médian (z -18 à -27) ──
  { src: "/tasses.png",     scale: 3.6, pos: [1.3, -0.6, -19], onPath: true },   // tasses plus décalées
  { src: "/lunettes.png",   scale: 3.8, pos: [6.5, -3.8, -18], onPath: false },
  { src: "/livre.png",      scale: 4.2, pos: [-8.5, 4.2, -21], onPath: false },  // remonté+gauche, hors I'M FINE
  { src: "/sablier.png",    scale: 3.4, pos: [3.5, 1.5, -23], onPath: false },   // → CENTRE-DROIT
  { src: "/vin.png",        scale: 4.8, pos: [-8.0, -1.0, -24], onPath: false }, // bouteille grossie
  { src: "/cartes.png",     scale: 3.2, pos: [-0.9, 0.7, -25], onPath: true },
  { src: "/wires.png",      scale: 4.0, pos: [7.5, -3.5, -27], onPath: false },
  // ── milieu-profond (z -28 à -37) ──
  { src: "/alliance.png",   scale: 2.6, pos: [1.2, -0.5, -28], onPath: true },  // CENTRE — percutable
  { src: "/postit.png",     scale: 3.0, pos: [0.8, -0.4, -30], onPath: true },
  { src: "/margarita.png",  scale: 3.8, pos: [-8.0, 3.5, -29], onPath: false },
  { src: "/photo.png",      scale: 4.2, pos: [7.5, 3.2, -32], onPath: false },
  { src: "/billets.png",    scale: 3.6, pos: [-0.6, 0.4, -34], onPath: true },
  { src: "/verrevin.png",   scale: 3.8, pos: [8.5, 1.0, -33], onPath: false },   // passé à DROITE, hors NO PEACE
  { src: "/smartwatch.png", scale: 3.8, pos: [8.0, -2.5, -36], onPath: false },
  { src: "/minuteur.png",   scale: 3.8, pos: [-9.0, -3.5, -31], onPath: false }, // bas-gauche, hors enseignes
  // ── loin, vers la porte (z -39 à -44) — AGRANDIS pour la profondeur ──
  { src: "/cachets.png",    scale: 4.4, pos: [4.5, -2.5, -39], onPath: false }, // dégagés hors enseigne
  { src: "/eau.png",        scale: 4.2, pos: [-7.5, -2.0, -40], onPath: false },
  { src: "/fleurs.png",     scale: 4.6, pos: [-6.5, 3.5, -42], onPath: false },
  { src: "/boulepapier.png",scale: 4.0, pos: [5.5, -1.5, -43], onPath: false },
  { src: "/Cadre.png",      scale: 4.8, pos: [-5.5, -3.0, -44], onPath: false },
];

// Layout PORTRAIT dédié : exploite la HAUTEUR (objets du sol à la charpente),
// largeur étroite assumée (les objets latéraux DÉBORDENT volontairement = on est cerné),
// objets parlants sur l'axe central (percutés), lointains agrandis.
const MOBILE_OBJECTS = [
  // axe central — percutés (décalés mais < 2u)
  { src: "/Reveil.png",  scale: 3.2, pos: [-0.7, 0.5, -12], onPath: true },
  { src: "/tasses.png",  scale: 3.2, pos: [1.3, -0.6, -19], onPath: true },
  { src: "/cartes.png",  scale: 2.8, pos: [-0.9, 0.7, -25], onPath: true },
  { src: "/postit.png",  scale: 2.6, pos: [0.8, -0.4, -30], onPath: true },
  { src: "/billets.png", scale: 3.4, pos: [-0.6, 0.4, -34], onPath: true },
  // côtés HAUTS (charpente) — débordent volontairement
  { src: "/lettres.png", scale: 3.4, pos: [-4.5, 5.0, -14], onPath: false },
  { src: "/livre.png",   scale: 3.4, pos: [-5.2, 4.2, -22], onPath: false },
  { src: "/fleurs.png",  scale: 3.6, pos: [-4.8, 5.2, -33], onPath: false },
  { src: "/vin.png",     scale: 3.2, pos: [5.0, 4.5, -20], onPath: false },
  { src: "/wires.png",   scale: 3.4, pos: [5.2, 3.8, -28], onPath: false },
  // côtés BAS (vers le sol) — débordent volontairement
  { src: "/Smartphone.png", scale: 3.6, pos: [4.0, -2.0, -11], onPath: false },
  { src: "/lunettes.png",   scale: 3.0, pos: [5.0, -3.5, -17], onPath: false },
  { src: "/keys.png",       scale: 3.2, pos: [-5.0, -4.5, -13], onPath: false },
  { src: "/sablier.png",    scale: 3.0, pos: [4.5, -2.0, -24], onPath: false },
  { src: "/cachets.png",    scale: 3.2, pos: [-5.0, -3.5, -31], onPath: false },
  // lointains AGRANDIS (profondeur)
  { src: "/eau.png",   scale: 3.8, pos: [3.5, 3.2, -38], onPath: false },
  { src: "/Cadre.png", scale: 4.2, pos: [-3.5, -3.2, -40], onPath: false },
];

type FloatingObjectProps = {
  src: string;
  scale: number;
  home: [number, number, number];
  onPath: boolean;
  seed: number;
};

function FloatingObject({ src, scale, home, onPath, seed }: FloatingObjectProps) {
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [src]);
  useEffect(() => () => texture.dispose(), [texture]);

  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const pushed = useRef(new THREE.Vector3());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const fwd = useMemo(() => new THREE.Vector3(), []);

  const bob = useMemo(
    () => ({
      ampX: 0.12 + (seed % 7) * 0.02,
      ampY: 0.16 + (seed % 5) * 0.03,
      speed: 0.25 + (seed % 11) * 0.02,
      phase: seed * 1.7,
      tiltX: ((seed % 9) - 4) * 0.06,
      tiltY: ((seed % 7) - 3) * 0.07,
      tiltZ: ((seed % 11) - 5) * 0.05,
    }),
    [seed],
  );

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    const mesh = meshRef.current;
    if (!mesh) return;

    const baseX = home[0] + Math.sin(t * bob.speed + bob.phase) * bob.ampX;
    const baseY = home[1] + Math.cos(t * bob.speed * 0.8 + bob.phase) * bob.ampY;
    const baseZ = home[2];

    // Répulsion "jungle" UNIQUEMENT pour les objets onPath (proches de l'axe).
    let desired = tmp.set(0, 0, 0);
    if (onPath) {
      camera.getWorldDirection(fwd);
      const toObj = new THREE.Vector3(baseX, baseY, baseZ).sub(camera.position);
      const dist = toObj.length();
      const along = toObj.clone().normalize().dot(fwd);
      const passed = toObj.dot(fwd) < 0;
      if (dist < 2.2 && along > 0.6 && !passed) {
        const lateral = toObj.clone().sub(fwd.clone().multiplyScalar(toObj.dot(fwd)));
        if (lateral.lengthSq() > 0.0001) {
          lateral.normalize();
          desired = lateral.multiplyScalar((1 - dist / 2.2) * 4);
        }
      }
    }
    pushed.current.lerp(desired, 0.12);

    mesh.position.set(baseX + pushed.current.x, baseY + pushed.current.y, baseZ + pushed.current.z);
    if (src === "/Smartphone.png") {
      smartphonePos.copy(mesh.position);
    }
    mesh.rotation.x = bob.tiltX + Math.sin(t * 0.22 + bob.phase) * 0.05;
    mesh.rotation.y = bob.tiltY + Math.cos(t * 0.18 + bob.phase) * 0.05;
    mesh.rotation.z = bob.tiltZ + Math.sin(t * 0.28 + bob.phase) * 0.04;

    if (matRef.current) matRef.current.opacity = 1 - dissolveFactor();
  });

  return (
    <mesh ref={meshRef} position={home} scale={[scale, scale, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={matRef} map={texture} transparent opacity={1} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export function FloatingObjects({ mobile }: { mobile: boolean }) {
  const list = useMemo(() => {
    const base = mobile ? MOBILE_OBJECTS : OBJECTS;
    return base.map((o, i) => ({ ...o, seed: 2000 + i * 91 }));
  }, [mobile]);

  return (
    <>
      {list.map((o, i) => (
        <FloatingObject key={i} src={o.src} scale={o.scale} home={o.pos as [number, number, number]} onPath={o.onPath} seed={o.seed} />
      ))}
    </>
  );
}
