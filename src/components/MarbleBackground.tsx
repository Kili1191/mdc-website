"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// Marbre + motif révélé au curseur, en fond fixe.
// Version allégée d'AlbatreHero : pas de scroll panels, pas de CTA, un seul motif.
// `calme={true}` réduit l'intensité de la révélation pour les pages de contenu
// (VISION §1 : marbre calme/apaisé sur les pages internes, lisibilité du texte).
export default function MarbleBackground({
  motif = "/motif-compo.jpg",
  calme = false,
}: { motif?: string; calme?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    let rtA = new THREE.WebGLRenderTarget(W(), H(), rtOpts);
    let rtB = new THREE.WebGLRenderTarget(W(), H(), rtOpts);
    const trailScene = new THREE.Scene();
    const trailCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const trailMat = new THREE.ShaderMaterial({
      uniforms: {
        uPrev: { value: null }, uMouse: { value: new THREE.Vector2(-10, -10) },
        uVel: { value: 0 }, uAspect: { value: W() / H() },
        uDecay: { value: 0.93 }, uRadius: { value: 0.29 }, uActive: { value: 1 },
        uRes: { value: new THREE.Vector2(W(), H()) }, uSpread: { value: 1.0 },
        uTrailTime: { value: 0 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        uniform sampler2D uPrev; uniform vec2 uMouse, uRes;
        uniform float uVel,uAspect,uDecay,uRadius,uActive,uSpread,uTrailTime;
        varying vec2 vUv;

        // Brique 2 : bords organiques via domain warping (value noise).
        // Le rayon reste verrouillé (uRadius 0.29), seule la position samplée
        // est perturbée par un bruit basse fréquence — la révélation acquiert
        // des contours mous et vivants au lieu d'un cercle net.
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float vnoise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                     mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
        }

        void main(){
          vec2 px = 1.0 / uRes;
          float c  = texture2D(uPrev, vUv).r;
          float n  = texture2D(uPrev, vUv + vec2(0.0,  px.y)).r;
          float s  = texture2D(uPrev, vUv + vec2(0.0, -px.y)).r;
          float e  = texture2D(uPrev, vUv + vec2( px.x, 0.0)).r;
          float w  = texture2D(uPrev, vUv + vec2(-px.x, 0.0)).r;
          float diffused = (c + n + s + e + w) / 5.0;
          float prev = mix(c, diffused, uSpread) * uDecay;
          vec2 d = vUv - uMouse; d.x *= uAspect;

          // domain warp — deux samples décalés du même champ noise
          vec2 wp = d * 6.0 + uTrailTime * 0.12;
          vec2 warp = vec2(vnoise(wp), vnoise(wp + vec2(17.3, 41.7))) - 0.5;
          vec2 dOrg = d + warp * 0.055;

          float stamp = uActive * smoothstep(uRadius, 0.0, length(dOrg)) * (0.6 + uVel*2.5);
          gl_FragColor = vec4(vec3(clamp(max(prev,stamp),0.0,1.0)),1.0);
        }`,
    });
    trailScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailMat));

    const loader = new THREE.TextureLoader();
    const load = (p: string) => {
      const t = loader.load(p, () => onResize());
      t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
      return t;
    };
    const texMotif = load(motif);
    const texVeil = load("/albatre-lisse.jpg");

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const finalMat = new THREE.ShaderMaterial({
      uniforms: {
        uMotif: { value: texMotif }, uVeil: { value: texVeil }, uTrail: { value: null }, uTime: { value: 0 },
        uScreenRes: { value: new THREE.Vector2(W(), H()) },
        uRes: { value: new THREE.Vector2(2752, 1536) }, uZoom: { value: 1.0 },
        uReflet: { value: 0.05 }, uIrisation: { value: 0.09 },
        uHouseCenter: { value: new THREE.Vector2(0.5, 0.80) },
        uHouseInner: { value: 0.11 },
        uHouseOuter: { value: 0.24 },
        uEffectScale: { value: calme ? 0.35 : 1.0 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uMotif,uVeil,uTrail;
        uniform float uZoom,uTime,uReflet,uIrisation,uEffectScale;
        uniform vec2 uScreenRes,uRes;
        uniform vec2 uHouseCenter;
        uniform float uHouseInner,uHouseOuter;
        varying vec2 vUv;

        vec2 coverUV(vec2 uv){
          float sa=uScreenRes.x/uScreenRes.y, ia=uRes.x/uRes.y; vec2 o=uv;
          if(sa>ia){float s=ia/sa; o.y=(o.y-0.5)*s+0.5;} else {float s=sa/ia; o.x=(o.x-0.5)*s+0.5;}
          o=(o-0.5)/uZoom+0.5;
          return o;
        }

        void main(){
          vec2 uv = coverUV(vUv);
          float reveal = texture2D(uTrail, vUv).r;
          float r = smoothstep(0.0, 0.85, reveal);

          vec2 hd = uv - uHouseCenter;
          hd.x *= uRes.x / uRes.y;
          float houseMask = smoothstep(uHouseInner, uHouseOuter, length(hd));
          r *= uEffectScale;

          vec2 flow = vec2(sin(uv.y*16.0+uTime*1.3), cos(uv.x*16.0+uTime*1.1))*0.004*r*houseMask;
          vec2 uvMotif = uv + flow;

          vec3 veil  = texture2D(uVeil,  uv).rgb;
          vec3 motifCol = texture2D(uMotif, uvMotif).rgb;
          vec3 col = mix(veil, motifCol, r);

          vec3 warmLight = vec3(0.98, 0.92, 0.78);
          col += warmLight * r * uReflet;

          vec3 sheen = vec3(
            0.5 + 0.5*sin(uv.x*12.0 + uTime*1.5),
            0.5 + 0.5*sin(uv.y*12.0 + uTime*1.2 + 2.0),
            0.5 + 0.5*sin((uv.x+uv.y)*12.0 + uTime + 4.0)
          );
          col += sheen * r * uIrisation;

          float g = fract(sin(dot(vUv*900.0,vec2(12.9898,78.233)))*43758.5453)-0.5;
          col += g*0.010;
          gl_FragColor = vec4(col,1.0);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMat));

    // Brique 3 : grain + vignette cinématographique en post-processing plein écran.
    // Grain animé (film), vignette douce qui referme les bords sur le centre.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, cam));
    const filmPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(W(), H()) },
        uGrain: { value: 0.028 },
        uVignette: { value: 0.32 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime,uGrain,uVignette;
        uniform vec2 uRes;
        varying vec2 vUv;
        float grainHash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
        void main(){
          vec4 col = texture2D(tDiffuse, vUv);
          // grain animé — se renouvelle chaque frame
          float g = grainHash(vUv * uRes + uTime * 60.0) - 0.5;
          col.rgb += g * uGrain;
          // vignette douce, centrée
          vec2 uv = vUv - 0.5;
          float vig = smoothstep(0.90, 0.30, length(uv));
          col.rgb *= mix(1.0 - uVignette, 1.0, vig);
          gl_FragColor = col;
        }
      `,
    });
    composer.addPass(filmPass);

    const mouse = new THREE.Vector2(-10, -10), target = new THREE.Vector2(-10, -10), last = new THREE.Vector2(-10, -10);
    const onMove = (e: MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    window.addEventListener("mousemove", onMove);

    const clock = new THREE.Clock(); let raf = 0;
    const animate = () => {
      const t = clock.getElapsedTime();
      finalMat.uniforms.uTime.value = t;
      trailMat.uniforms.uTrailTime.value = t;
      filmPass.uniforms.uTime.value = t;
      mouse.lerp(target, 0.65);
      const vel = mouse.distanceTo(last); last.copy(mouse);
      trailMat.uniforms.uPrev.value = rtA.texture;
      trailMat.uniforms.uMouse.value.copy(mouse);
      trailMat.uniforms.uVel.value = Math.min(vel, 0.05);
      renderer.setRenderTarget(rtB); renderer.render(trailScene, trailCam); renderer.setRenderTarget(null);
      const tmp = rtA; rtA = rtB; rtB = tmp;
      finalMat.uniforms.uTrail.value = rtA.texture;
      composer.render();
      raf = requestAnimationFrame(animate);
    };
    animate();

    function onResize() {
      renderer.setSize(W(), H());
      composer.setSize(W(), H());
      finalMat.uniforms.uScreenRes.value.set(W(), H());
      filmPass.uniforms.uRes.value.set(W(), H());
      trailMat.uniforms.uAspect.value = W() / H();
      trailMat.uniforms.uRes.value.set(W(), H());
      rtA.setSize(W(), H()); rtB.setSize(W(), H());
      if (texMotif.image && texMotif.image.width) {
        finalMat.uniforms.uRes.value.set(texMotif.image.width, texMotif.image.height);
      }
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      rtA.dispose(); rtB.dispose(); texMotif.dispose(); texVeil.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
  }, [motif]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        overflow: "hidden", background: "#EDE4D0", zIndex: 0, pointerEvents: "none",
      }}
    />
  );
}
