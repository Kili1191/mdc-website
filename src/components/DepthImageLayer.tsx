"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// DepthImageLayer — spec HANDOFF_WEB07 / ASSETS_NANOBANANA.md
//
// Un des 5 états mentaux traversés au scroll. PlaneGeometry haute densité
// (256×256), vertex shader qui déplace les vertices selon la depth map.
// Si l'image + depth existent dans /public/states/, on les charge.
// Sinon, on retombe sur un placeholder shader entièrement procédural :
//   - couleur & composition par état (ASSETS.md § LES 5 PROMPTS)
//   - depth procédurale (value noise) pour garder l'effet parallax
//     tant que les vraies depth maps ne sont pas générées.
//
// Chaque instance monte son propre canvas plein-écran fixe (z-index 1),
// derrière le contenu (z-index 5). L'agencement 5-états-sur-Z + caméra qui
// traverse au scroll viendra dans un `DepthImageStack` (Home refonte).
export type StateNum = 1 | 2 | 3 | 4 | 5;

type Props = {
  state: StateNum;
  image?: string;      // ex "/states/state-1.jpg"
  depth?: string;      // ex "/states/state-1-depth.jpg"
  scrollProgress?: number;  // 0..1 — pilote parallaxe + intensité
  parallax?: number;   // amplitude du décalage (default 0.05)
  displacement?: number; // amplitude du déplacement Z (default 0.18)
};

// Palette hex → vec3 GLSL (0..1)
const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
};
const BROU_FONCE = hex("#2F2519");
const OCRE = hex("#B89968");
const PARCHEMIN = hex("#EDE4D0");
const ROUILLE = hex("#A55A3E");
const TAUPE = hex("#A89A85");

export default function DepthImageLayer({
  state,
  image,
  depth,
  scrollProgress = 0,
  parallax = 0.05,
  displacement = 0.18,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(scrollProgress);

  useEffect(() => { progressRef.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Ortho camera : plan couvre l'écran, on est en post-fx style
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    cam.position.z = 1;

    // Try loading real assets. On erreur, on garde les placeholders.
    let imageTex: THREE.Texture | null = null;
    let depthTex: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    let hasImage = 0.0, hasDepth = 0.0;
    if (image) {
      loader.load(
        image,
        (t) => {
          imageTex = t; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
          mat.uniforms.uImage.value = t;
          mat.uniforms.uHasImage.value = 1.0;
        },
        undefined,
        () => { /* 404 → placeholder mode */ },
      );
    }
    if (depth) {
      loader.load(
        depth,
        (t) => {
          depthTex = t; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
          mat.uniforms.uDepth.value = t;
          mat.uniforms.uHasDepth.value = 1.0;
        },
        undefined,
        () => { /* 404 → placeholder mode */ },
      );
    }

    // Plan haute densité pour permettre le displacement futur
    const geo = new THREE.PlaneGeometry(2, 2, 256, 256);

    // Couleurs primaire/secondaire par état — cf ASSETS_NANOBANANA § LES 5 PROMPTS
    const colByState: Record<StateNum, { a: readonly number[]; b: readonly number[] }> = {
      1: { a: BROU_FONCE, b: OCRE },       // La Charge Vue
      2: { a: BROU_FONCE, b: OCRE },       // Le Premier Lâcher
      3: { a: BROU_FONCE, b: OCRE },       // La Chaleur Qui Revient
      4: { a: TAUPE,      b: PARCHEMIN },  // L'Espace Intérieur
      5: { a: PARCHEMIN,  b: ROUILLE },    // La Présence à Soi
    };
    const col = colByState[state];

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uImage: { value: null },
        uDepth: { value: null },
        uHasImage: { value: hasImage },
        uHasDepth: { value: hasDepth },
        uState: { value: state },
        uColA: { value: new THREE.Vector3(...col.a) },
        uColB: { value: new THREE.Vector3(...col.b) },
        uTime: { value: 0 },
        uProgress: { value: scrollProgress },
        uParallax: { value: parallax },
        uDisplace: { value: displacement },
      },
      vertexShader: `
        uniform sampler2D uDepth;
        uniform float uHasDepth, uDisplace, uProgress;
        varying vec2 vUv;

        // Value noise fallback si pas de depth map
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float vnoise(vec2 p){
          vec2 i=floor(p), f=fract(p);
          vec2 u=f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                     mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
        }
        float fbm(vec2 p){
          float v=0.0, a=0.5;
          for(int i=0;i<4;i++){ v += a*vnoise(p); p*=2.0; a*=0.5; }
          return v;
        }

        void main(){
          vUv = uv;
          float d = mix(fbm(uv*4.0), texture2D(uDepth, uv).r, uHasDepth);
          vec3 p = position;
          // Le displacement s'atténue avec la distance de la caméra (progress).
          p.z += (d - 0.5) * uDisplace * (0.6 + 0.8 * (1.0 - abs(uProgress)));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uImage;
        uniform float uHasImage, uState, uTime, uProgress, uParallax;
        uniform vec3 uColA, uColB;
        varying vec2 vUv;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float vnoise(vec2 p){
          vec2 i=floor(p), f=fract(p);
          vec2 u=f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                     mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
        }
        float fbm(vec2 p){
          float v=0.0, a=0.5;
          for(int i=0;i<4;i++){ v += a*vnoise(p); p*=2.0; a*=0.5; }
          return v;
        }

        // Placeholder par état — les compositions décrites dans
        // ASSETS_NANOBANANA § LES 5 PROMPTS FINAUX, en attendant que les
        // vraies images Nano Banana existent.
        vec3 placeholder(vec2 uv) {
          float n = fbm(uv * 3.5 + uTime * 0.02);
          int s = int(uState + 0.5);

          if (s == 1) {
            // La Charge Vue : dense en haut, point chaud en bas-centre.
            float top = smoothstep(0.35, 1.0, uv.y);
            vec2 d = uv - vec2(0.5, 0.20);
            float pt = smoothstep(0.32, 0.02, length(d));
            vec3 base = mix(uColA * (0.55 + n * 0.35), uColA * 0.35, top);
            return base + uColB * pt * 0.55;
          }
          if (s == 2) {
            // Le Premier Lâcher : traits verticaux chaleureux qui percent.
            float threads = smoothstep(0.94, 1.0, sin(uv.x * 42.0 + fbm(uv*3.0)*3.0)*0.5+0.5);
            threads *= smoothstep(0.15, 0.85, 1.0 - uv.y);
            vec3 base = mix(uColA * 0.4, uColA * 0.75, n);
            return base + uColB * threads * 0.7;
          }
          if (s == 3) {
            // La Chaleur Qui Revient : dégradé du bas vers le haut.
            float rise = smoothstep(0.0, 1.0, uv.y + n * 0.15);
            return mix(uColB * 0.75, uColA * 0.7, rise);
          }
          if (s == 4) {
            // L'Espace Intérieur : matière aux bords, centre parchemin.
            vec2 c = uv - 0.5;
            float edge = smoothstep(0.25, 0.55, length(c));
            vec3 center = uColB * (0.85 + n * 0.15);
            return mix(center, uColA * 0.55, edge);
          }
          // s == 5 : La Présence à Soi — parchemin plein + petit détail rouille
          vec3 base = uColA * (0.92 + n * 0.08);
          vec2 h = uv - vec2(0.5, 0.42);
          float house = smoothstep(0.032, 0.028, length(h * vec2(1.2, 1.0)))
                       * step(abs(h.x), 0.028) * step(-0.02, h.y);
          return mix(base, uColB * 0.75, house * 0.5);
        }

        void main(){
          vec2 uv = vUv;
          // Parallax léger piloté par la progression scroll
          uv += vec2(uParallax * 0.0, uParallax * uProgress * 0.6);
          vec3 col = mix(placeholder(uv), texture2D(uImage, uv).rgb, uHasImage);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    scene.add(new THREE.Mesh(geo, mat));

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;
      mat.uniforms.uProgress.value = progressRef.current;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => renderer.setSize(W(), H());
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geo.dispose(); mat.dispose();
      imageTex?.dispose(); depthTex?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
    // Volontairement pas de dep sur scrollProgress — géré via ref pour éviter
    // le remount du WebGL context à chaque frame de scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, image, depth, parallax, displacement]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        overflow: "hidden", zIndex: 1, pointerEvents: "none",
      }}
    />
  );
}
