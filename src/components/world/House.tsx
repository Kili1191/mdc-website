"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";

// Le logo MDC exactement comme dans l'IntroOverlay : silhouette pleine
// remplie en Rouille (le <path fill="#A55A3E"/>), pas des lignes de
// contour. Rendu ici en ShapeGeometry (2D plate) + MeshBasicMaterial
// pour que la couleur reste stable indépendamment de l'éclairage 3D,
// exactement comme un SVG.

const FILL_COLOR = "#A55A3E";
const HOUSE_TARGET_SIZE = 2.6;

function HouseFill({ material }: { material: THREE.MeshBasicMaterial }) {
  const svgData = useLoader(SVGLoader, "/mdc-logo.svg");

  const { shapes, center, scale } = useMemo(() => {
    const allShapes: THREE.Shape[] = [];
    const bbox2D = new THREE.Box2();
    for (const path of svgData.paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        for (const pt of shape.getPoints()) bbox2D.expandByPoint(pt);
        allShapes.push(shape);
      }
    }
    const size2D = bbox2D.getSize(new THREE.Vector2());
    const scale = HOUSE_TARGET_SIZE / Math.max(size2D.x, size2D.y);
    const center = bbox2D.getCenter(new THREE.Vector2());
    return { shapes: allShapes, center, scale };
  }, [svgData]);

  const geometries = useMemo(
    () => shapes.map((s) => new THREE.ShapeGeometry(s, 24)),
    [shapes],
  );

  useEffect(() => {
    return () => geometries.forEach((g) => g.dispose());
  }, [geometries]);

  return (
    <group
      position={[-center.x * scale, center.y * scale, 0]}
      scale={[scale, -scale, scale]}
    >
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} material={material} />
      ))}
    </group>
  );
}

export function House() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FILL_COLOR,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );
  const ref = useRef(material);
  ref.current = material;

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  // Souffle doux sur l'opacité + fade in/out géré par HomeStage via
  // le userData.alpha du parent (pour respecter la choréographie zoom).
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const phase = Math.sin(clock.elapsedTime * 0.5);
    const breath = 0.92 + phase * 0.06;
    // Récupère l'alpha choréo depuis le parent (userData défini par HomeStage)
    const parent = groupRef.current?.parent as THREE.Object3D | undefined;
    const alpha = (parent?.userData as { alpha?: number } | undefined)?.alpha ?? 1;
    material.opacity = breath * alpha;
  });

  return (
    <group ref={groupRef}>
      <HouseFill material={material} />
    </group>
  );
}
