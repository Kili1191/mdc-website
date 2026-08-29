"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { hasWebGL } from "@/lib/webgl";

// Fluid distortion : image texturée sur un plan, ses UV sont
// distordus par un ripple animé qui suit le curseur (WebGL, GPU).
// Style Studio Freight / Awwwards.
export default function FluidImage({ src, aspect = "4/5" }: { src: string; aspect?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;

    // Pas de WebGL : on retombe sur une <img> nette plutot que de
    // laisser THREE lever et faire disparaitre la photo.
    if (!hasWebGL()) { setWebgl(false); return; }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const tex = new THREE.TextureLoader().load(src, (t) => {
      mat.uniforms.uAspect.value = new THREE.Vector2(t.image.width, t.image.height);
    });
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: tex },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVel: { value: 0 },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(W(), H()) },
        uAspect: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uTex;
        uniform vec2 uMouse, uRes, uAspect;
        uniform float uTime, uMouseVel;
        varying vec2 vUv;
        vec2 cover(vec2 uv){
          float sa = uRes.x/uRes.y, ia = uAspect.x/uAspect.y;
          vec2 o = uv;
          if(sa > ia){ float s = ia/sa; o.y = (o.y-0.5)*s + 0.5; }
          else       { float s = sa/ia; o.x = (o.x-0.5)*s + 0.5; }
          return o;
        }
        void main(){
          vec2 uv = cover(vUv);
          vec2 d = vUv - uMouse;
          float dist = length(d);
          float ripple = sin(dist * 40.0 - uTime * 3.0) * exp(-dist * 6.0);
          vec2 offset = normalize(d + 0.0001) * ripple * 0.02 * (0.6 + uMouseVel * 20.0);
          vec3 col = texture2D(uTex, uv + offset).rgb;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const mouse = new THREE.Vector2(0.5, 0.5);
    const target = new THREE.Vector2(0.5, 0.5);
    const last = new THREE.Vector2(0.5, 0.5);
    const onMove = (e: MouseEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      mouse.lerp(target, 0.15);
      const vel = mouse.distanceTo(last); last.copy(mouse);
      mat.uniforms.uMouse.value.copy(mouse);
      mat.uniforms.uMouseVel.value = Math.min(vel, 0.04);
      mat.uniforms.uTime.value = clock.getElapsedTime();
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
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      tex.dispose(); mat.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
  }, [src]);

  if (!webgl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block" }} />;
  }

  return (
    <div ref={mountRef} style={{ width: "100%", aspectRatio: aspect, overflow: "hidden" }} />
  );
}
