"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Vraie maison 3D volumétrique — plus le logo extrudé.
// - Base : BoxGeometry (murs + sol)
// - Toit : ExtrudeGeometry d'un triangle sur la largeur (deux pentes)
// - Porte : plane sombre insérée sur la façade (comme une ouverture)
// - Fenêtres : deux plans chauds émissifs sur les murs latéraux
// - Un plancher plus large en-dessous, comme une pierre
//
// Palette Aube Encens : murs parchemin, toit rouille, ouvertures brou.
// Éclairage vient de HomeStage (ambient + 2 directionnelles).

const WALL_COLOR = "#EDE4D0";       // parchemin
const ROOF_COLOR = "#A55A3E";       // rouille
const OPENING_COLOR = "#2F2519";    // brou foncé (portes)
const WINDOW_GLOW = "#B89968";      // ocre chaud (fenêtres)
const GROUND_COLOR = "#A89A85";     // taupe (dalle)

const W = 2.0;   // largeur murs
const H = 1.4;   // hauteur murs
const D = 1.6;   // profondeur murs
const ROOF_H = 0.9;

export function House() {
  const groupRef = useRef<THREE.Group>(null);

  // Toit : triangle extrudé sur la largeur (profondeur = D)
  const roofGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2 - 0.05, 0);
    shape.lineTo(W / 2 + 0.05, 0);
    shape.lineTo(0, ROOF_H);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: D + 0.1,
      bevelEnabled: false,
    });
    g.translate(0, 0, -(D + 0.1) / 2);
    return g;
  }, []);

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: WALL_COLOR, roughness: 0.9, metalness: 0,
  }), []);
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: ROOF_COLOR, roughness: 0.7, metalness: 0,
  }), []);
  const openingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: OPENING_COLOR, roughness: 1, metalness: 0,
  }), []);
  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: WINDOW_GLOW,
    emissive: WINDOW_GLOW,
    emissiveIntensity: 0.6,
    roughness: 0.4, metalness: 0,
  }), []);
  const groundMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: GROUND_COLOR, roughness: 1, metalness: 0,
  }), []);

  // Léger souffle : la fenêtre inspire/expire de chaleur
  useFrame(({ clock }) => {
    const phase = Math.sin(clock.elapsedTime * 0.5);
    windowMat.emissiveIntensity = 0.5 + phase * 0.18;
  });

  return (
    <group ref={groupRef}>
      {/* Dalle */}
      <mesh position={[0, -H / 2 - 0.02, 0]}>
        <boxGeometry args={[W + 0.6, 0.04, D + 0.6]} />
        <primitive object={groundMat} attach="material" />
      </mesh>

      {/* Murs (box plein) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Toit à deux pentes */}
      <mesh position={[0, H / 2, 0]} geometry={roofGeom}>
        <primitive object={roofMat} attach="material" />
      </mesh>

      {/* Porte façade (côté +Z) */}
      <mesh position={[0, -H / 2 + 0.42, D / 2 + 0.001]}>
        <planeGeometry args={[0.42, 0.82]} />
        <primitive object={openingMat} attach="material" />
      </mesh>

      {/* Fenêtres latérales gauche/droite (±X) */}
      <mesh position={[W / 2 + 0.001, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.42, 0.34]} />
        <primitive object={windowMat} attach="material" />
      </mesh>
      <mesh position={[-W / 2 - 0.001, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.42, 0.34]} />
        <primitive object={windowMat} attach="material" />
      </mesh>

      {/* Fenêtre haute pignon arrière (petit oeil, côté -Z) */}
      <mesh position={[0, H / 2 + 0.28, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <primitive object={windowMat} attach="material" />
      </mesh>
    </group>
  );
}
