"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";

// La maison = la silhouette du logo MDC, extrudée en volume.
// Pas une architecture custom (Kilian ne veut PAS un modèle générique) :
// c'est SON logo, qui devient une maison-objet 3D. On extrude
// suffisamment pour qu'elle ait un vrai volume (murs latéraux visibles),
// et on la rend en matière chaleureuse Aube Encens plutôt qu'en rouge
// orangé émissif.

const HOUSE_TARGET_SIZE = 2.4;   // taille max en largeur/hauteur
const EXTRUDE_DEPTH_RATIO = 0.42; // profondeur ≈ 42% de la taille

const WALL_COLOR = "#D9C9A8";     // parchemin chaud, tirant sur l'ocre pâle
const RIM_COLOR = "#A55A3E";      // rouille (émissive discrète sur le contour)

function HouseVolume({ material, wireMaterial }: {
  material: THREE.MeshStandardMaterial;
  wireMaterial: THREE.LineBasicMaterial;
}) {
  const svgData = useLoader(SVGLoader, "/mdc-logo.svg");

  const { geometries, edges, center, scale, depth } = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    const bbox2D = new THREE.Box2();
    for (const path of svgData.paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        for (const pt of shape.getPoints()) bbox2D.expandByPoint(pt);
        shapes.push(shape);
      }
    }
    const size2D = bbox2D.getSize(new THREE.Vector2());
    const scale = HOUSE_TARGET_SIZE / Math.max(size2D.x, size2D.y);
    const center = bbox2D.getCenter(new THREE.Vector2());
    const depth = (HOUSE_TARGET_SIZE * EXTRUDE_DEPTH_RATIO) / scale;

    const geometries = shapes.map(
      (s) =>
        new THREE.ExtrudeGeometry(s, {
          depth,
          bevelEnabled: true,
          bevelThickness: 0.02 / scale,
          bevelSize: 0.015 / scale,
          bevelSegments: 2,
          curveSegments: 20,
        }),
    );

    // Lignes de contour pour rappeler le trait du logo
    const edges = geometries.map((g) => new THREE.EdgesGeometry(g, 25));

    return { geometries, edges, center, scale, depth };
  }, [svgData]);

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      edges.forEach((e) => e.dispose());
    };
  }, [geometries, edges]);

  return (
    // centrage 3D : x/y depuis bbox SVG, z ramené au centre de la profondeur
    <group
      position={[-center.x * scale, center.y * scale, -depth * scale * 0.5]}
      scale={[scale, -scale, scale]}
    >
      {geometries.map((g, i) => (
        <mesh key={`m-${i}`} geometry={g} material={material} castShadow receiveShadow />
      ))}
      {edges.map((e, i) => (
        <lineSegments key={`e-${i}`} geometry={e} material={wireMaterial} />
      ))}
    </group>
  );
}

export function House() {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WALL_COLOR,
        roughness: 0.85,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const wireMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: RIM_COLOR,
        transparent: true,
        opacity: 0.7,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      material.dispose();
      wireMaterial.dispose();
    };
  }, [material, wireMaterial]);

  // Souffle très discret sur l'opacité du contour
  useFrame(({ clock }) => {
    const phase = Math.sin(clock.elapsedTime * 0.5);
    wireMaterial.opacity = 0.6 + phase * 0.15;
  });

  return <HouseVolume material={material} wireMaterial={wireMaterial} />;
}
