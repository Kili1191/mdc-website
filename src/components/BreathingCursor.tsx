"use client";

import { useEffect, useRef } from "react";

// Curseur custom :
// - Dot : point Rouille, position mise à jour SYNCHRONE dans mousemove
//   (aucun lag rAF). Taille animée via transform:scale() — GPU pur, pas
//   de reflow, jamais saccadé.
// - Halo : anneau flou plus grand, position lerpée en rAF (sillage
//   élégant), taille aussi via scale().
// - Détection hover en rAF (throttlée) : elementFromPoint est coûteux,
//   pas dans le pipeline mousemove.

const BREATH_MS = 5500;
const HALO_LERP = 0.14;

const DOT_BASE = 15;
const DOT_BREATH = 2;
const DOT_MAX = DOT_BASE + DOT_BREATH; // rayon fixe DOM, scale animé

const HALO_BASE = 28;
const HALO_BREATH = 4;
const HALO_HOVER = 16;
const HALO_MAX = HALO_BASE + HALO_BREATH + HALO_HOVER; // rayon fixe DOM

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

    const mouse = { x: -1000, y: -1000 };
    const haloPos = { x: -1000, y: -1000 };
    let hover = 0;
    let hoverTarget = 0;
    let raf = 0;
    const t0 = performance.now();

    dot.style.setProperty("--mx", "-1000px");
    dot.style.setProperty("--my", "-1000px");
    dot.style.setProperty("--sc", "1");
    halo.style.setProperty("--sc", "1");
    halo.style.transform = "translate3d(-1000px, -1000px, 0) translate(-50%, -50%) scale(1)";

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Position dot : synchrone, écrit dans les CSS vars — transform
      // pur, aucun reflow, aucun lag rAF.
      dot.style.setProperty("--mx", `${e.clientX}px`);
      dot.style.setProperty("--my", `${e.clientY}px`);
    };
    const onLeave = () => {
      mouse.x = -1000; mouse.y = -1000;
      dot.style.setProperty("--mx", "-1000px");
      dot.style.setProperty("--my", "-1000px");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    let hoverCheckAt = 0;
    const HOVER_CHECK_INTERVAL = 80;

    const tick = (now: number) => {
      if (now - hoverCheckAt > HOVER_CHECK_INTERVAL && mouse.x >= 0) {
        hoverCheckAt = now;
        const el = document.elementFromPoint(mouse.x, mouse.y);
        hoverTarget = el && el.closest("a, button, input, textarea, select, [role=button]") ? 1 : 0;
      }
      hover += (hoverTarget - hover) * 0.12;

      const t = (now - t0) / BREATH_MS;
      const breath = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;

      // Dot : SCALE au lieu de width/height — GPU only.
      const dr = DOT_BASE + breath * DOT_BREATH;
      const dotScale = dr / DOT_MAX;
      const dotAlpha = (0.75 + breath * 0.15) * (1 - hover * 0.5);
      dot.style.setProperty("--sc", String(dotScale));
      dot.style.opacity = String(dotAlpha);

      // Halo : lerp position + scale
      haloPos.x += (mouse.x - haloPos.x) * HALO_LERP;
      haloPos.y += (mouse.y - haloPos.y) * HALO_LERP;
      const hr = HALO_BASE + breath * HALO_BREATH + hover * HALO_HOVER;
      const haloScale = hr / HALO_MAX;
      const haloAlpha = 0.55 + breath * 0.15;
      halo.style.transform =
        `translate3d(${haloPos.x}px, ${haloPos.y}px, 0) translate(-50%, -50%) scale(${haloScale})`;
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
      {/* Halo : taille DOM fixée = 2 * HALO_MAX, transformée en scale */}
      <div
        ref={haloRef}
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 9998,
          pointerEvents: "none",
          width: `${HALO_MAX * 2}px`,
          height: `${HALO_MAX * 2}px`,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(165,90,62,0.22) 0%, rgba(165,90,62,0.06) 55%, rgba(165,90,62,0) 80%)",
          transform: "translate3d(-1000px, -1000px, 0) translate(-50%, -50%) scale(1)",
          willChange: "transform, opacity",
        }}
      />
      {/* Dot : taille DOM fixée = 2 * DOT_MAX, transformée en scale */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 9999,
          pointerEvents: "none",
          width: `${DOT_MAX * 2}px`,
          height: `${DOT_MAX * 2}px`,
          background: "#A55A3E",
          borderRadius: "50%",
          boxShadow: "0 0 6px rgba(165,90,62,0.45)",
          transform:
            "translate3d(var(--mx, -1000px), var(--my, -1000px), 0) translate(-50%, -50%) scale(var(--sc, 1))",
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
