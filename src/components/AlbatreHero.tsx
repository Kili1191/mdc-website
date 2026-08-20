"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ===== Paliers : image du dessous + texte qui l'accompagne =====
const PANELS = [
  { img: "/motif-compo.jpg", line: "Enough." },
  { img: "/motif-bodhi.jpg", line: "You've optimised everything." },
  { img: "/motif-compo.jpg", line: "Except the part that holds it all." },
  { img: "/motif-bodhi.jpg", line: "For those who carry everything inside." },
];

export default function AlbatreHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;
    const N = PANELS.length;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    // ---- Trail map curseur ----
    const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    let rtA = new THREE.WebGLRenderTarget(W(), H(), rtOpts);
    let rtB = new THREE.WebGLRenderTarget(W(), H(), rtOpts);
    const trailScene = new THREE.Scene();
    const trailCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const trailMat = new THREE.ShaderMaterial({
      uniforms: {
        uPrev: { value: null }, uMouse: { value: new THREE.Vector2(-10,-10) },
        uVel: { value: 0 }, uAspect: { value: W()/H() },
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
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float vnoise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                     mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
        }

        void main(){
          // diffusion type encre : moyenne des 4 voisins + centre, dosée par uSpread
          vec2 px = 1.0 / uRes;
          float c  = texture2D(uPrev, vUv).r;
          float n  = texture2D(uPrev, vUv + vec2(0.0,  px.y)).r;
          float s  = texture2D(uPrev, vUv + vec2(0.0, -px.y)).r;
          float e  = texture2D(uPrev, vUv + vec2( px.x, 0.0)).r;
          float w  = texture2D(uPrev, vUv + vec2(-px.x, 0.0)).r;
          float diffused = (c + n + s + e + w) / 5.0;
          float prev = mix(c, diffused, uSpread) * uDecay;
          vec2 d = vUv - uMouse; d.x *= uAspect;

          vec2 wp = d * 6.0 + uTrailTime * 0.12;
          vec2 warp = vec2(vnoise(wp), vnoise(wp + vec2(17.3, 41.7))) - 0.5;
          vec2 dOrg = d + warp * 0.055;

          float stamp = uActive * smoothstep(uRadius, 0.0, length(dOrg)) * (0.6 + uVel*2.5);
          gl_FragColor = vec4(vec3(clamp(max(prev,stamp),0.0,1.0)),1.0);
        }`,
    });
    trailScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), trailMat));

    // ---- Textures ----
    const loader = new THREE.TextureLoader();
    const load = (p:string)=>{ const t=loader.load(p,()=>onResize()); t.wrapS=THREE.ClampToEdgeWrapping; t.wrapT=THREE.ClampToEdgeWrapping; return t; };
    const textures = PANELS.map(p=>load(p.img));
    const texVeil = load("/albatre-lisse.jpg");

    // ---- Scène finale ----
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const finalMat = new THREE.ShaderMaterial({
      uniforms: {
        uMotif:{value:textures[0]}, uVeil:{value:texVeil}, uTrail:{value:null}, uTime:{value:0},
        uVeilAmt:{value:0},
        uScreenRes:{value:new THREE.Vector2(W(),H())},
        uRes:{value:new THREE.Vector2(2752,1536)}, uZoom:{value:1.0},
        uReflet:{value:0.05}, uIrisation:{value:0.09},
        // Zone protégée : maison gravée en haut/centre du motif (UV image, y bottom-origin).
        // Le masque tombe à 0 sous uHouseInner et remonte à 1 au-dessus de uHouseOuter,
        // distances mesurées en unités "hauteur d'image" (x normalisé par aspect).
        uHouseCenter:{value:new THREE.Vector2(0.5, 0.80)},
        uHouseInner:{value:0.11},
        uHouseOuter:{value:0.24},
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uMotif,uVeil,uTrail;
        uniform float uVeilAmt,uZoom,uTime,uReflet,uIrisation;
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

          // masque doux : atténue seulement le warp (flow) près de la maison gravée.
          // Le reveal du motif reste intact — la maison apparaît normalement,
          // mais sans distorsion animée dessus.
          vec2 hd = uv - uHouseCenter;
          hd.x *= uRes.x / uRes.y;
          float houseMask = smoothstep(uHouseInner, uHouseOuter, length(hd));

          // gradient de la révélation = "pente" de la matière → sert au relief et aux reflets
          vec2 px = 1.0 / uScreenRes;
          float rx = smoothstep(0.0,0.85, texture2D(uTrail, vUv + vec2(px.x,0.0)).r)
                   - smoothstep(0.0,0.85, texture2D(uTrail, vUv - vec2(px.x,0.0)).r);
          float ry = smoothstep(0.0,0.85, texture2D(uTrail, vUv + vec2(0.0,px.y)).r)
                   - smoothstep(0.0,0.85, texture2D(uTrail, vUv - vec2(0.0,px.y)).r);
          vec2 grad = vec2(rx, ry);

          // formes animées sous le curseur — masquées sur la maison gravée
          vec2 flow = vec2(sin(uv.y*16.0+uTime*1.3), cos(uv.x*16.0+uTime*1.1))*0.004*r*houseMask;
          vec2 uvMotif = uv + flow;

          vec3 veil  = texture2D(uVeil,  uv).rgb;
          vec3 motif = texture2D(uMotif, uvMotif).rgb;
          vec3 col = mix(veil, motif, r);

          // REFLET : lueur chaude TRÈS subtile au coeur de la révélation
          vec3 warmLight = vec3(0.98, 0.92, 0.78);
          col += warmLight * r * uReflet;

          // IRISATION : reflets de couleur à peine perceptibles
          vec3 sheen = vec3(
            0.5 + 0.5*sin(uv.x*12.0 + uTime*1.5),
            0.5 + 0.5*sin(uv.y*12.0 + uTime*1.2 + 2.0),
            0.5 + 0.5*sin((uv.x+uv.y)*12.0 + uTime + 4.0)
          );
          col += sheen * r * uIrisation;

          // voile en fondu (inchangé)
          col = mix(col, veil, smoothstep(0.0, 1.0, uVeilAmt));

          float g = fract(sin(dot(vUv*900.0,vec2(12.9898,78.233)))*43758.5453)-0.5;
          col += g*0.010;
          gl_FragColor = vec4(col,1.0);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), finalMat));

    // ---- Souris ----
    const mouse=new THREE.Vector2(-10,-10), target=new THREE.Vector2(-10,-10), last=new THREE.Vector2(-10,-10);
    const onMove=(e:MouseEvent)=>{const r=renderer.domElement.getBoundingClientRect();
      target.set((e.clientX-r.left)/r.width, 1-(e.clientY-r.top)/r.height);};
    window.addEventListener("mousemove", onMove);

    // ---- Scroll par paliers ----
    let scrollProg = 0, scrollTarget = 0;
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const onScroll = () => { scrollTarget = window.scrollY / maxScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });

    let currentPanel = 0, veilAmt = 0, swapping = false, pendingPanel = 0;
    let activeAmt = 1;

    const clock=new THREE.Clock(); let raf=0;
    const animate=()=>{
      const t = clock.getElapsedTime();
      finalMat.uniforms.uTime.value = t;
      trailMat.uniforms.uTrailTime.value = t;

      scrollProg += (scrollTarget - scrollProg) * 0.1;
      const wantPanel = Math.min(N-1, Math.round(scrollProg * (N-1)));
      setAtEnd(scrollProg > 0.92);

      if (!swapping && wantPanel !== currentPanel) { swapping = true; pendingPanel = wantPanel; }
      if (swapping) {
        if (veilAmt < 1 && pendingPanel !== currentPanel) {
          veilAmt += 0.05;
          if (veilAmt >= 1) {
            veilAmt = 1; currentPanel = pendingPanel;
            finalMat.uniforms.uMotif.value = textures[currentPanel];
            setPanelIndex(currentPanel);
          }
        } else {
          veilAmt -= 0.05;
          if (veilAmt <= 0) { veilAmt = 0; swapping = false; }
        }
      }
      finalMat.uniforms.uVeilAmt.value = veilAmt;
      const wantActive = (!swapping && veilAmt < 0.01) ? 1 : 0;
      activeAmt += (wantActive - activeAmt) * 0.06;   // fondu doux
      trailMat.uniforms.uActive.value = activeAmt;

      mouse.lerp(target, 0.65);
      const vel=mouse.distanceTo(last); last.copy(mouse);
      trailMat.uniforms.uPrev.value=rtA.texture;
      trailMat.uniforms.uMouse.value.copy(mouse);
      trailMat.uniforms.uVel.value=Math.min(vel,0.05);
      renderer.setRenderTarget(rtB); renderer.render(trailScene,trailCam); renderer.setRenderTarget(null);
      const tmp=rtA; rtA=rtB; rtB=tmp;
      finalMat.uniforms.uTrail.value=rtA.texture;
      renderer.render(scene,cam);
      raf=requestAnimationFrame(animate);
    };
    animate();

    function onResize(){
      renderer.setSize(W(),H());
      finalMat.uniforms.uScreenRes.value.set(W(),H());
      trailMat.uniforms.uAspect.value=W()/H();
      trailMat.uniforms.uRes.value.set(W(),H());
      rtA.setSize(W(),H()); rtB.setSize(W(),H());
      const t0 = textures[0];
      if(t0.image&&t0.image.width) finalMat.uniforms.uRes.value.set(t0.image.width,t0.image.height);
    }
    window.addEventListener("resize", onResize);

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",onResize);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("scroll",onScroll);
      rtA.dispose(); rtB.dispose(); textures.forEach(t=>t.dispose()); texVeil.dispose(); renderer.dispose();
      if(renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
  }, []);

  const brou = "#2F2519";
  const rouille = "#A55A3E";

  return (
    <>
      {/* canvas plein écran fixe */}
      <div ref={mountRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",overflow:"hidden",background:"#EDE4D0",zIndex:0}} />

      {/* SEUIL Begin à la fin */}
      <div style={{
        position:"fixed", bottom:"12%", left:0, right:0, zIndex:8,
        display:"flex", justifyContent:"center", pointerEvents:"none",
        opacity: atEnd ? 1 : 0, transition:"opacity 1.2s ease",
      }}>
        <a href="#" style={{
          fontFamily:"'Prata', serif", fontSize:"18px", letterSpacing:"0.3em",
          color: rouille, textDecoration:"none", border:`1px solid ${rouille}`,
          padding:"16px 48px", borderRadius:"2px", pointerEvents: atEnd ? "auto" : "none",
          background:"rgba(237,228,208,0.4)", backdropFilter:"blur(2px)",
        }}>BEGIN</a>
      </div>

      {/* indice scroll */}
      <div style={{
        position:"fixed", bottom:"32px", left:0, right:0, zIndex:8,
        textAlign:"center", pointerEvents:"none",
        fontFamily:"'Prata', serif", fontSize:"11px", letterSpacing:"0.25em",
        color:brou, opacity: atEnd ? 0 : 0.5, transition:"opacity 0.6s ease",
      }}>SCROLL</div>

      {/* piste de scroll */}
      <div style={{height:`${PANELS.length*100}vh`}} />

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(18px); }
          to   { opacity:0.92; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
