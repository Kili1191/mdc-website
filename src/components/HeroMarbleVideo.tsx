"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Hero « vidéo » du SEUIL — mais c'est un shader WebGL live, pas un
// fichier vidéo. Rend :
// - Pale onyx marbre procédural (FBM 4 octaves) avec veines chaudes
// - Lumière chaude sourceless qui dérive lentement (rythme souffle)
// - Poussière suspendue qui monte doucement dans la lumière
// - Palette Aube Encens : parchemin base, ocre highlights, rouille
//   veines très subtiles
// - Boucle 11s (cohérence cardiaque)
//
// Cet effet remplace ce qui aurait été un fichier vd-01.mp4 — plus
// moderne (live, 60fps, s'adapte au viewport), zéro asset à héberger,
// zéro bande passante. Pattern Awwwards 2024–2026 (Studio Freight,
// Lusion) : le contenu génératif remplace la vidéo pré-rendue.

const BREATH_MS = 11000;

export default function HeroMarbleVideo({
  aspect = "21/9",
  intensity = 1,
}: { aspect?: string; intensity?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uBreath: { value: 0 },
        uRes: { value: new THREE.Vector2(W(), H()) },
        uIntensity: { value: intensity },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform float uTime, uBreath, uIntensity;
        uniform vec2 uRes;
        varying vec2 vUv;

        // Palette Aube Encens
        const vec3 PARCHEMIN  = vec3(0.929, 0.894, 0.816);   // #EDE4D0
        const vec3 OCRE       = vec3(0.722, 0.600, 0.408);   // #B89968
        const vec3 ROUILLE    = vec3(0.647, 0.353, 0.243);   // #A55A3E
        const vec3 BROU       = vec3(0.290, 0.231, 0.165);   // #4A3B2A
        const vec3 TAUPE      = vec3(0.659, 0.604, 0.522);   // #A89A85

        // Value noise + FBM
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                     mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
        }
        float fbm(vec2 p){
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 5; i++) {
            v += a * vnoise(p);
            p *= 2.0; a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = vUv;
          // Aspect-correct pour éviter la déformation du bruit
          float ar = uRes.x / uRes.y;
          vec2 puv = vec2(uv.x * ar, uv.y);

          // Base marbre — deux couches FBM à échelles différentes,
          // légère dérive dans le temps (rythme du souffle)
          float slow = uTime * 0.015;
          float baseA = fbm(puv * 3.5 + vec2(slow, 0.0));
          float baseB = fbm(puv * 8.0 + vec2(-slow * 0.6, slow * 0.4));
          float marbleField = mix(baseA, baseB, 0.35);

          // Veines : bruit + fonction turbulente pour lignes fines
          float veinNoise = fbm(puv * 5.5 + vec2(slow * 0.5, -slow * 0.3));
          float veins = smoothstep(0.48, 0.52, veinNoise);
          veins *= smoothstep(0.65, 0.55, veinNoise); // fine bande
          veins *= 0.65 + 0.35 * uBreath;

          // Couleur de fond : parchemin qui s'échauffe vers l'ocre
          // au fond du champ FBM
          vec3 col = mix(PARCHEMIN, mix(PARCHEMIN, OCRE, 0.5), marbleField * 0.7);
          // Assombrissement local pour texture pierre polie
          col *= 0.85 + 0.25 * marbleField;

          // Veines très discrètes en Rouille dilué
          col = mix(col, mix(col, ROUILLE, 0.35), veins * 0.4);

          // Halo chaud sourceless qui dérive doucement en xy
          vec2 lightPos = vec2(0.5 + 0.15 * sin(uTime * 0.08), 0.55 + 0.10 * cos(uTime * 0.11));
          float d = distance(uv, lightPos);
          float halo = exp(-d * 3.5) * (0.35 + 0.25 * uBreath);
          col += OCRE * halo * 0.55;

          // Poussière : petits points de bruit qui montent lentement
          vec2 dustUV = uv * vec2(60.0, 40.0) + vec2(0.0, -uTime * 0.06);
          float dust = pow(hash(floor(dustUV)), 25.0);
          dust *= smoothstep(0.0, 0.5, halo);
          col += vec3(0.98, 0.92, 0.78) * dust * 0.9;

          // Vignette douce cinéma
          vec2 vc = uv - 0.5;
          float vig = smoothstep(0.85, 0.30, length(vc));
          col *= mix(0.75, 1.0, vig);

          // Grain film subtil (temporel)
          float grain = hash(uv * uRes + uTime * 60.0) - 0.5;
          col += grain * 0.020;

          gl_FragColor = vec4(col, uIntensity);
        }
      `,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;
      // Cycle souffle : 0..1..0 sur 11s (cohérence cardiaque)
      mat.uniforms.uBreath.value = Math.sin((t * 1000) / BREATH_MS * Math.PI * 2) * 0.5 + 0.5;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      renderer.setSize(W(), H());
      mat.uniforms.uRes.value.set(W(), H());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
  }, [intensity]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      style={{
        width: "100%",
        aspectRatio: aspect,
        overflow: "hidden",
      }}
    />
  );
}
