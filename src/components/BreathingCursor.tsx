"use client";

import { useEffect, useRef } from "react";

// Curseur custom : point Rouille (#A55A3E) qui suit la souris avec un
// petit lag et respire au rythme du souffle (5.5s comme l'intro).
// Se masque sur touch devices (fine pointer detection).
// Interaction : sur hover d'un élément cliquable, le point s'agrandit
// et s'assouplit.

const BREATH_MS = 5500;
const LERP = 0.18;
const BASE = 8;     // rayon repos
const BREATH_AMP = 3;
const HOVER_SCALE = 2.2;

export default function BreathingCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip sur écrans tactiles / pointeurs non-fins
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // hide native cursor site-wide when custom cursor is on
    const style = document.createElement("style");
    style.textContent = `html, body, a, button { cursor: none !important; }`;
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
      // hover detection via elementFromPoint
      const el = document.elementFromPoint(e.clientX, e.clientY);
      hoverTarget = el && (el.closest("a, button, input, textarea, select, [role=button]")) ? 1 : 0;
    };
    const onDown = () => { hoverTarget = 1.6; };
    const onUp = () => { /* natural release */ };
    const onLeave = () => { mouse.x = -50; mouse.y = -50; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    const tick = () => {
      pos.x += (mouse.x - pos.x) * LERP;
      pos.y += (mouse.y - pos.y) * LERP;
      hover += (hoverTarget - hover) * 0.12;

      const t = (performance.now() - t0) / BREATH_MS;
      const breath = Math.sin(t * Math.PI * 2) * 0.5 + 0.5; // 0..1
      const r = BASE + breath * BREATH_AMP + hover * (HOVER_SCALE - 1) * BASE;
      const alpha = 0.55 + breath * 0.25;

      dot.style.transform = `translate3d(${pos.x - r}px, ${pos.y - r}px, 0)`;
      dot.style.width = dot.style.height = `${r * 2}px`;
      dot.style.opacity = String(alpha);

      // Ring plus large qui suit avec un lag plus grand
      const rr = r * (1.9 + hover * 0.6);
      ring.style.transform = `translate3d(${pos.x - rr}px, ${pos.y - rr}px, 0)`;
      ring.style.width = ring.style.height = `${rr * 2}px`;
      ring.style.opacity = String((0.22 + breath * 0.1) * (1 - hover * 0.4));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
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
          position: "fixed", left: 0, top: 0, zIndex: 9998,
          pointerEvents: "none",
          border: "1px solid #A55A3E",
          borderRadius: "50%",
          mixBlendMode: "multiply",
          transition: "opacity 0.4s ease",
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
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
}
