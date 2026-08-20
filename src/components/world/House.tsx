"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";

const TUBE_COLOR = "#A55A3E";

const HOUSE_TARGET_SIZE = 2.6; // longest world-unit dimension of the SVG
const TARGET_DEPTH = 0.02; // world-unit depth of extrusion

function HouseLogo({ material }: { material: THREE.MeshStandardMaterial }) {
  const svgData = useLoader(SVGLoader, "/mdc-logo.svg");

  const { geometries, center, scale } = useMemo(() => {
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
    const svgDepth = TARGET_DEPTH / scale;
    const geometries = shapes.map(
      (s) =>
        new THREE.ExtrudeGeometry(s, {
          depth: svgDepth,
          bevelEnabled: false,
          curveSegments: 16,
        }),
    );
    return { geometries, center, scale };
  }, [svgData]);

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
    };
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
  const tubeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: TUBE_COLOR,
        emissive: TUBE_COLOR,
        emissiveIntensity: 0.5,
        roughness: 0.7,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      tubeMaterial.dispose();
    };
  }, [tubeMaterial]);

  // Breathing — émissive discrète, pour que le logo se lise comme un
  // trait dessiné et pas comme une masse orange qui glow.
  useFrame(({ clock }) => {
    const phase = Math.sin(clock.elapsedTime * 0.5);
    tubeMaterial.emissiveIntensity = 0.25 + phase * 0.08;
  });

  return <HouseLogo material={tubeMaterial} />;
}
