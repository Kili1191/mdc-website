"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { dissolveFactor } from "@/lib/scroll";

// =============================================================================
// HNWI life-noise — short stock-vernacular phrases that float through the
// chaos like email subject lines.
// =============================================================================
const PHRASES = [
  "I'm fine.",
  "I'll rest when this is done.",
  "When did I last sit still?",
  "I haven't called back.",
  "Everyone needs something.",
  "I'll sleep this weekend.",
  "Just one more thing.",
  "I can't switch off.",
  "Did I miss her birthday?",
  "I'll be there next time.",
  "No one sees how tired I am.",
  "I have everything. So why this?",
  "I keep moving so I don't feel it.",
  "There's never enough time.",
  "I'll deal with it later.",
  "My mind won't go quiet.",
  "Still awake.",
  "Who am I when I stop?",
  "I forgot to eat again.",
  "Later. Always later.",
  "I should call my mother.",
  "Everyone depends on me.",
  "I can't remember the last time I breathed.",
  "Almost there. Almost.",
  "What am I chasing?",
  "Reply by end of day.",
  "Three more meetings.",
  "I'll feel better once it's done.",
  "I don't even want this.",
  "Keep going. Don't stop.",
];

// Key phrases that flicker like a dying neon sign and glow amber instead
// of parchment. Hits the gut harder than the running monologue around them.
const NEON_PHRASES = new Set([
  "I'm fine.",
  "I have everything. So why this?",
  "Who am I when I stop?",
  "I keep moving so I don't feel it.",
  "I can't switch off.",
]);

// Aube Encens palette — one stable colour per text-fragment slot via
// `seed % MURMUR_COLORS.length`. NEON_PHRASES override to ocre.
const MURMUR_COLORS = ["#EDE4D0", "#B89968", "#8C8B6A", "#A55A3E"];

// =============================================================================
// Mobile detection (also consumed by Scene.tsx for dpr)
// =============================================================================
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// =============================================================================
// Shared mouse state — written once from the top-level Chaos pointermove
// listener, read by VolumetricFog (uMousePos uniform) and the text
// raycaster.
// =============================================================================
const mouseNorm = { x: 0, y: 0 };

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

// =============================================================================
// 1. Volumetric fog plane — simplex FBM, slow drift, soft pulse,
//    vignetted at the UV edges so the plane silhouette doesn't read.
// =============================================================================
const FOG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FOG_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMousePos;
  uniform float uDissolve;
  uniform float uDrift;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv * 2.0 + uTime * uDrift;
    p += uMousePos * 0.12;
    float n = fbm(p);

    vec3 cold = vec3(0.102, 0.059, 0.020); // #1A0F05
    vec3 warm = vec3(0.722, 0.600, 0.408); // #B89968
    vec3 col = mix(cold, warm, n * 0.4);

    float pulse = 0.3 + sin(uTime * 0.4) * 0.05;
    col *= pulse;

    // Soft vignette so the rectangular plane doesn't show as a hard edge.
    vec2 c = vUv - 0.5;
    float vignette = smoothstep(0.6, 0.2, length(c));

    float alpha = (0.45 + n * 0.4) * vignette * (1.0 - uDissolve);
    gl_FragColor = vec4(col, alpha);
  }
`;

function VolumetricFog({
  zPos = -50,
  driftSpeed = 0.05,
}: {
  zPos?: number;
  driftSpeed?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = clock.elapsedTime;
    m.uniforms.uMousePos.value.set(mouseNorm.x, mouseNorm.y);
    m.uniforms.uDissolve.value = dissolveFactor();
  });

  return (
    <mesh position={[0, 0, zPos]}>
      <planeGeometry args={[80, 50]} />
      <shaderMaterial
        ref={matRef}
        uniforms={{
          uTime: { value: 0 },
          uMousePos: { value: new THREE.Vector2() },
          uDissolve: { value: 0 },
          uDrift: { value: driftSpeed },
        }}
        vertexShader={FOG_VERT}
        fragmentShader={FOG_FRAG}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// =============================================================================
// 2. Film grain particles — 500 amber tetrahedra drifting upward.
// =============================================================================
function FilmGrainParticles({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const items = useMemo(() => {
    const rand = mulberry32(11);
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (rand() * 2 - 1) * 12,
        (rand() * 2 - 1) * 8,
        -5 - rand() * 45, // z: -5 to -50
      ),
      driftY: 0.02 + rand() * 0.06,
    }));
  }, [count]);

  const geometry = useMemo(() => new THREE.SphereGeometry(0.02, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#B89968",
        emissive: "#B89968",
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    material.opacity = 0.95 * (1 - dissolveFactor());

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      it.pos.y += it.driftY * delta;
      if (it.pos.y > 8) {
        it.pos.y = -8;
        it.pos.x = (Math.random() * 2 - 1) * 12;
      }
      dummy.position.copy(it.pos);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
}

// =============================================================================
// 3. Text fragment — one drei <Text> mesh with its own lifecycle. The
//    parent FloatingTextFragments writes each fragment's current world
//    position into a shared array and picks the closest one as the
//    mouse-highlighted index.
// =============================================================================
type Phase = "fadeIn" | "visible" | "fadeOut" | "wait";

type TextFragmentProps = {
  seed: number;
  index: number;
  sharedPositions: THREE.Vector3[];
  highlightedIndexRef: React.MutableRefObject<number>;
};

type TroikaText = THREE.Mesh & {
  text?: string;
  fillOpacity?: number;
  fontSize?: number;
  sync?: () => void;
};

function TextFragment({
  seed,
  index,
  sharedPositions,
  highlightedIndexRef,
}: TextFragmentProps) {
  const isMobile = isTouchDevice();
  const initialRand = useMemo(() => mulberry32(seed), [seed]);
  const initial = useMemo(() => {
    const r = initialRand;
    const home = new THREE.Vector3(
      (index % 2 === 0 ? -1 : 1) * (4 + r() * 4) * (isMobile ? 0.5 : 1),
      (r() * 2 - 1) * 6,
      -8 - r() * 40,
    );
    const depthN = (Math.abs(home.z) - 5) / 35; // 0 close, 1 far
    return {
      phrase: PHRASES[Math.floor(r() * PHRASES.length)],
      home,
      fontSize: (0.45 + (1 - depthN) * 0.5) * (isMobile ? 0.6 : 1),
      baseOpacity: 1.0,
      startOffset: -r() * 16, // intro étalée sans être rare
    };
  }, [initialRand, isMobile, index]);

  const [phrase, setPhrase] = useState(initial.phrase);
  const ref = useRef<TroikaText>(null);

  const state = useRef({
    pos: initial.home.clone(),
    home: initial.home.clone(),
    fontSize: initial.fontSize,
    baseOpacity: initial.baseOpacity,
    phase: "fadeIn" as Phase,
    phaseStart: initial.startOffset,
    phaseDuration: 2,
    hoverBoost: 0,
    rand: mulberry32(seed + 0xabc),
  });

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, camera }, delta) => {
    const s = state.current;
    const t = clock.elapsedTime;

    // Lifecycle state machine
    const elapsed = t - s.phaseStart;
    if (elapsed >= s.phaseDuration) {
      const r = s.rand;
      if (s.phase === "fadeIn") {
        s.phase = "visible";
        s.phaseDuration = 6;
      } else if (s.phase === "visible") {
        s.phase = "fadeOut";
        s.phaseDuration = 2;
      } else if (s.phase === "fadeOut") {
        s.phase = "wait";
        s.phaseDuration = 3 + r() * 6;
      } else {
        // wait → respawn with new position + new phrase
        s.phase = "fadeIn";
        s.phaseDuration = 2;
        s.home.set(
          (index % 2 === 0 ? -1 : 1) * (4 + r() * 4) * (isMobile ? 0.5 : 1),
          (r() * 2 - 1) * 6,
          -8 - r() * 40,
        );
        s.pos.copy(s.home);
        const depthN = (Math.abs(s.home.z) - 5) / 35;
        s.fontSize = (0.45 + (1 - depthN) * 0.5) * (isMobile ? 0.6 : 1);
        s.baseOpacity = 1.0;
        setPhrase(PHRASES[Math.floor(r() * PHRASES.length)]);
      }
      s.phaseStart = t;
    }

    // Phase → opacity factor
    let phaseOpacity = 0;
    if (s.phase === "fadeIn") {
      phaseOpacity = Math.max(0, Math.min(1, elapsed / s.phaseDuration));
    } else if (s.phase === "visible") {
      phaseOpacity = 1;
    } else if (s.phase === "fadeOut") {
      phaseOpacity = Math.max(0, 1 - elapsed / s.phaseDuration);
    }

    // Repulsion — when camera is close, push the fragment outward.
    const dist = s.pos.distanceTo(camera.position);
    if (dist < 4 && dist > 0.001) {
      tmp.copy(s.pos).sub(camera.position).normalize();
      tmp.multiplyScalar((1 - dist / 4) * 0.5 * delta);
      s.pos.add(tmp);
    }
    // Slow spring back to home.
    s.pos.x += (s.home.x - s.pos.x) * 0.05 * delta;
    s.pos.y += (s.home.y - s.pos.y) * 0.05 * delta;
    s.pos.z += (s.home.z - s.pos.z) * 0.05 * delta;

    // Mouse highlight — lerp hoverBoost toward 1 when this is the closest
    // text fragment to the cursor's 3D projection.
    const target = highlightedIndexRef.current === index ? 1 : 0;
    s.hoverBoost += (target - s.hoverBoost) * 0.1;

    // Neon flicker for key phrases — irregular like a dying sign.
    let neonFactor = 1;
    if (NEON_PHRASES.has(phrase)) {
      const f = t * 11 + seed;
      const flicker = Math.sin(f) * Math.sin(f * 2.3) * Math.sin(f * 0.7);
      neonFactor = flicker > -0.4 ? 1 : 0.25; // mostly on, sharp dropouts
    }

    const dissolve = dissolveFactor();
    // Proximité caméra : la phrase apparaît quand on s'approche (fenêtre ~14u),
    // pic de visibilité à ~8u, s'efface si trop loin OU déjà dépassée.
    const camDist = s.pos.distanceTo(camera.position);
    const proximityVis = THREE.MathUtils.clamp(
      (11 - Math.abs(camDist - 7)) / 8,
      0,
      1,
    );
    // Raréfaction par la profondeur : dense à l'entrée (z≈-8), beaucoup
    // plus rare près de la porte (z≈-48) — « l'air se dégage ».
    const depthDensity = THREE.MathUtils.clamp(
      1 - (Math.abs(s.pos.z) - 8) / 55,
      0.6,
      1,
    );
    // Les phrases NEON ressortent davantage : 50 % plus grosses, opacité
    // pleine. Les murmures restent en retrait (visibilité 0.7).
    const isNeon = NEON_PHRASES.has(phrase);
    const baseVis = 1.0;
    const fillOpacity =
      (baseVis + s.hoverBoost * 0.3) *
      phaseOpacity *
      proximityVis *
      depthDensity *
      (1 - dissolve) *
      neonFactor;
    const fontSize =
      s.fontSize * (1 + s.hoverBoost * 0.2) * (isNeon ? 1.5 : 1.0);

    if (index === 0)
      console.log({
        camDist: camDist.toFixed(1),
        proximityVis: proximityVis.toFixed(2),
        depthDensity: depthDensity.toFixed(2),
        phaseOpacity: phaseOpacity.toFixed(2),
        fillOpacity: fillOpacity.toFixed(2),
      });

    const mesh = ref.current;
    if (mesh) {
      mesh.position.copy(s.pos);
      mesh.fillOpacity = fillOpacity;
      mesh.fontSize = fontSize;
      // Ombre portée alignée EXACTEMENT sur le fill : même opacité, pas
      // de halo fantôme quand la phrase s'efface.
      (mesh as unknown as { outlineOpacity?: number }).outlineOpacity =
        Math.min(1, fillOpacity * 1.4);
    }

    // Publish our world position for the parent's raycaster.
    sharedPositions[index].copy(s.pos);
  });

  const neonColor = NEON_PHRASES.has(phrase)
    ? "#B89968"
    : MURMUR_COLORS[index % MURMUR_COLORS.length];

  return (
    <Text
      ref={ref}
      font="/fonts/inter-regular.woff"
      color={neonColor}
      anchorX="center"
      anchorY="middle"
      textAlign="center"
      maxWidth={isMobile ? 3.0 : 8}
      fontSize={initial.fontSize}
      fillOpacity={0}
      outlineWidth="9%"
      outlineColor="#1A1209"
      outlineOpacity={0}
      outlineBlur="20%"
    >
      {phrase}
    </Text>
  );
}

function FloatingTextFragments({ count }: { count: number }) {
  const sharedPositions = useMemo(
    () => Array.from({ length: count }, () => new THREE.Vector3()),
    [count],
  );
  const highlightedIndexRef = useRef(-1);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouseNDC = useMemo(() => new THREE.Vector2(), []);
  const mouse3D = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    // Project the mouse 15 units down the ray for distance comparison.
    mouseNDC.set(mouseNorm.x, mouseNorm.y);
    raycaster.setFromCamera(mouseNDC, camera);
    mouse3D.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, 15);

    let closest = -1;
    let minDist = Infinity;
    for (let i = 0; i < sharedPositions.length; i++) {
      const d = sharedPositions[i].distanceTo(mouse3D);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    }
    highlightedIndexRef.current = minDist < 4 ? closest : -1;
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TextFragment
          key={i}
          index={i}
          seed={1000 + i * 73}
          sharedPositions={sharedPositions}
          highlightedIndexRef={highlightedIndexRef}
        />
      ))}
    </>
  );
}

// =============================================================================
// Main — wires the three elements together and sets up the global
// pointermove listener that feeds the mouse-shared state.
// =============================================================================
export function Chaos() {
  const isMobile = isTouchDevice();
  const particleCount = isMobile ? 500 : 1600;
  const textCount = isMobile ? 6 : 11;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNorm.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      {/* VolumetricFog désactivé — SmokeHaze prend le relais en attendant
          un éventuel retour de la brume shader. Les 3 nappes ci-dessous
          peuvent être ré-activées si besoin :
          <VolumetricFog zPos={-50} driftSpeed={0.05} />
          <VolumetricFog zPos={-32} driftSpeed={0.08} />
          <VolumetricFog zPos={-18} driftSpeed={0.11} /> */}
      <FilmGrainParticles count={particleCount} />
      <FloatingTextFragments count={textCount} />
    </>
  );
}
