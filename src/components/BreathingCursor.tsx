"use client";

import { useEffect, useRef } from "react";

// Curseur custom : anneau Rouille qui suit la souris avec un lag doux
// et respire clairement au rythme du souffle (5.5s), plus un petit
// point central qui pulse au même rythme pour marquer la présence.
// Sur hover d'une cible interactive, l'anneau grossit.
// Masqué sur touch devices.

const BREATH_MS = 5500;
const LERP = 0.22;
const BASE = 12;         // rayon repos de l'anneau
const BREATH_AMP = 3.5;  // amplitude de respiration (visible)
const HOVER_AMP = 6;     // grossissement sur cible interactive
const DOT_BASE = 2.2;    // rayon du point central au repos
const DOT_AMP = 0.8;     // respiration du point

export default function BreathingCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const style = document.createElement("style");
    style.textContent = `html, body, a, button, input, textarea, select { cursor: none !important; }`;
    document.head.appendChild(style);

    const mouse = { x: -50, y: -50 };
    const pos = { x: -50, y: -50 };
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
    const onLeave = () => { mouse.x = -50; mouse.y = -50; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    const tick = () => {
      pos.x += (mouse.x - pos.x) * LERP;
      pos.y += (mouse.y - pos.y) * LERP;
      hover += (hoverTarget - hover) * 0.14;

      const t = (performance.now() - t0) / BREATH_MS;
      const breath = Math.sin(t * Math.PI * 2) * 0.5 + 0.5; // 0..1

      // Anneau
      const r = BASE + breath * BREATH_AMP + hover * HOVER_AMP;
      const ringAlpha = 0.75 + breath * 0.2;
      ring.style.transform = `translate3d(${pos.x - r}px, ${pos.y - r}px, 0)`;
      ring.style.width = ring.style.height = `${r * 2}px`;
      ring.style.opacity = String(ringAlpha);

      // Point central : pulse plus visible au fond du souffle
      const dr = DOT_BASE + breath * DOT_AMP;
      const dotAlpha = (0.55 + breath * 0.35) * (1 - hover * 0.6);
      dot.style.transform = `translate3d(${pos.x - dr}px, ${pos.y - dr}px, 0)`;
      dot.style.width = dot.style.height = `${dr * 2}px`;
      dot.style.opacity = String(dotAlpha);

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
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 9999,
          pointerEvents: "none",
          border: "1.5px solid rgba(165,90,62,0.9)",
          borderRadius: "50%",
          background: "transparent",
          willChange: "transform, width, height, opacity",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 9999,
          pointerEvents: "none",
          background: "#A55A3E",
          borderRadius: "50%",
          willChange: "transform, width, height, opacity",
        }}
      />
    </>
  );
}
