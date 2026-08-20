"use client";

import { useEffect, useRef } from "react";

// Curseur custom minimal : un petit anneau Rouille qui suit la souris
// avec un lag doux et respire au rythme du souffle. Sur hover d'un lien,
// il grossit très légèrement. Rien de plus.
// Masqué sur touch devices.

const BREATH_MS = 5500;
const LERP = 0.22;
const BASE = 9;         // rayon repos (petit)
const BREATH_AMP = 1.2; // respiration très discrète
const HOVER_AMP = 4;    // grossissement subtil sur cible interactive

export default function BreathingCursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring = ringRef.current;
    if (!ring) return;

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
      const r = BASE + breath * BREATH_AMP + hover * HOVER_AMP;
      const alpha = 0.55 + breath * 0.15;

      ring.style.transform = `translate3d(${pos.x - r}px, ${pos.y - r}px, 0)`;
      ring.style.width = ring.style.height = `${r * 2}px`;
      ring.style.opacity = String(alpha);

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
    <div
      ref={ringRef}
      aria-hidden
      style={{
        position: "fixed", left: 0, top: 0, zIndex: 9999,
        pointerEvents: "none",
        border: "1px solid rgba(165,90,62,0.7)",
        borderRadius: "50%",
        background: "transparent",
        transition: "opacity 0.4s ease",
      }}
    />
  );
}
