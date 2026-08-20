"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";

const STROKE_COLOR = "#A55A3E";
const HOUSE_TARGET_SIZE = 2.6;

// Rendu du logo maison en **traits** (edges/outlines Rouille), pas en
// bloc extrudé plein. Effet dessin architectural, cohérent avec le
// dessin d'origine du logo. L'épaisseur du trait respire doucement.
function HouseLogo({ material }: { material: THREE.LineBasicMaterial }) {
  const svgData = useLoader(SVGLoader, "/mdc-logo.svg");

  const { edges, center, scale } = useMemo(() => {
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
    // On construit les contours à partir des shapes. ShapeGeometry produit
    // le fill triangulé ; on en extrait les EdgesGeometry (bords) pour
    // avoir uniquement le pourtour dessiné.
    const edges = shapes.map((s) => {
      const shapeGeom = new THREE.ShapeGeometry(s, 32);
      const eg = new THREE.EdgesGeometry(shapeGeom, 15);
      shapeGeom.dispose();
      return eg;
    });
    return { edges, center, scale };
  }, [svgData]);

  useEffect(() => {
    return () => {
      edges.forEach((g) => g.dispose());
    };
  }, [edges]);

  return (
    <group
      position={[-center.x * scale, center.y * scale, 0]}
      scale={[scale, -scale, scale]}
    >
      {edges.map((g, i) => (
        <lineSegments key={i} geometry={g} material={material} />
      ))}
    </group>
  );
}

export function House() {
  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: STROKE_COLOR,
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );
  const ref = useRef(lineMat);
  ref.current = lineMat;

  useEffect(() => {
    return () => {
      lineMat.dispose();
    };
  }, [lineMat]);

  // Opacité qui respire — souffle discret, pas de glow.
  useFrame(({ clock }) => {
    const phase = Math.sin(clock.elapsedTime * 0.5);
    lineMat.opacity = 0.85 + phase * 0.1;
  });

  return <HouseLogo material={lineMat} />;
}
