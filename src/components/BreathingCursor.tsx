"use client";

import { useEffect, useRef } from "react";

// Curseur custom : deux couches à deux vitesses.
// - Dot : petit point Rouille net, suit la souris presque instantanément
//   (LERP haut) → précision.
// - Halo : anneau flou plus grand, traîne avec beaucoup de retard
//   (LERP bas) → élégance, sillage.
// Les deux respirent à 5.5s : légère variation d'opacité + halo qui
// pulse sur son rayon. Aucun bord dur — le halo est un box-shadow flou,
// pas un border strict, pour une lecture douce sur le marbre.

const BREATH_MS = 5500;
const DOT_LERP = 0.32;
const HALO_LERP = 0.11;

const DOT_BASE = 5.5;         // rayon point net (visible, suivable à l'œil)
const DOT_BREATH = 1;         // respiration fine

const HALO_BASE = 22;         // rayon halo
const HALO_BREATH = 3.5;      // respiration visible
const HALO_HOVER = 14;        // grossissement sur cible

export default function BreathingCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const halo = haloRef.current;
    if (!dot || !halo) return;

    const style = document.createElement("style");
    style.textContent = `html, body, a, button, input, textarea, select { cursor: none !important; }`;
    document.head.appendChild(style);

    const mouse = { x: -100, y: -100 };
    const dotPos = { x: -100, y: -100 };
    const haloPos = { x: -100, y: -100 };
    let hover = 0;
    let hoverTarget = 0;
    let raf = 0;
    const t0 = performance.now();

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      hoverTarget = el && el.closest("a, button, input, textarea, select, [role=button]") ? 1 : 0;
    };
    const onLeave = () => { mouse.x = -100; mouse.y = -100; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    const tick = () => {
      dotPos.x += (mouse.x - dotPos.x) * DOT_LERP;
      dotPos.y += (mouse.y - dotPos.y) * DOT_LERP;
      haloPos.x += (mouse.x - haloPos.x) * HALO_LERP;
      haloPos.y += (mouse.y - haloPos.y) * HALO_LERP;
      hover += (hoverTarget - hover) * 0.10;

      const t = (performance.now() - t0) / BREATH_MS;
      const breath = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;

      // Point net
      const dr = DOT_BASE + breath * DOT_BREATH;
      const dotAlpha = (0.75 + breath * 0.15) * (1 - hover * 0.5);
      dot.style.transform = `translate3d(${dotPos.x - dr}px, ${dotPos.y - dr}px, 0)`;
      dot.style.width = dot.style.height = `${dr * 2}px`;
      dot.style.opacity = String(dotAlpha);

      // Halo flou
      const hr = HALO_BASE + breath * HALO_BREATH + hover * HALO_HOVER;
      const haloAlpha = 0.45 + breath * 0.18;
      halo.style.transform = `translate3d(${haloPos.x - hr}px, ${haloPos.y - hr}px, 0)`;
      halo.style.width = halo.style.height = `${hr * 2}px`;
      halo.style.opacity = String(haloAlpha);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      style.remove();
    };
  }, []);

  return (
    <>
      {/* Halo flou, arrière-plan, traîne */}
      <div
        ref={haloRef}
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 9998,
          pointerEvents: "none",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(165,90,62,0.22) 0%, rgba(165,90,62,0.06) 55%, rgba(165,90,62,0) 78%)",
          willChange: "transform, width, height, opacity",
        }}
      />
      {/* Point net, premier plan */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 9999,
          pointerEvents: "none",
          background: "#A55A3E",
          borderRadius: "50%",
          boxShadow: "0 0 6px rgba(165,90,62,0.45)",
          willChange: "transform, width, height, opacity",
        }}
      />
    </>
  );
}
