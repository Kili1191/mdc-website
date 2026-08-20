"use client";

import { useEffect, useRef } from "react";

// Curseur custom :
// - Dot : point Rouille net, position mise à jour SYNCHRONE dans le
//   handler mousemove (aucun lag rAF) → suit la souris pixel-pixel.
//   Sa taille (respiration) est animée en rAF via CSS variable, mais
//   la position ne dépend pas de rAF.
// - Halo : anneau flou plus grand, position lerpée en rAF → sillage
//   élégant qui traîne derrière.
// - Détection hover déplacée en rAF (elementFromPoint est coûteux —
//   l'appeler à chaque mousemove polluait la fluidité).

const BREATH_MS = 5500;
const HALO_LERP = 0.14;

const DOT_BASE = 15;          // rayon point net (30px de diamètre)
const DOT_BREATH = 2;         // respiration nette

const HALO_BASE = 48;         // rayon halo
const HALO_BREATH = 8;
const HALO_HOVER = 24;

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
    const haloPos = { x: -100, y: -100 };
    let hover = 0;
    let hoverTarget = 0;
    let raf = 0;
    const t0 = performance.now();

    // Init CSS variables
    dot.style.setProperty("--mx", "-100px");
    dot.style.setProperty("--my", "-100px");

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Position dot : synchrone, aucun lag rAF
      dot.style.setProperty("--mx", `${e.clientX}px`);
      dot.style.setProperty("--my", `${e.clientY}px`);
    };
    const onLeave = () => {
      mouse.x = -100; mouse.y = -100;
      dot.style.setProperty("--mx", "-100px");
      dot.style.setProperty("--my", "-100px");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    // Hover check : à un rythme plus lent que rAF pour ne pas
    // forcer de reflow trop souvent (elementFromPoint = coûteux).
    let hoverCheckAt = 0;
    const HOVER_CHECK_INTERVAL = 80; // ms

    const tick = (now: number) => {
      // Détection hover — throttlée
      if (now - hoverCheckAt > HOVER_CHECK_INTERVAL && mouse.x >= 0) {
        hoverCheckAt = now;
        const el = document.elementFromPoint(mouse.x, mouse.y);
        hoverTarget = el && el.closest("a, button, input, textarea, select, [role=button]") ? 1 : 0;
      }
      hover += (hoverTarget - hover) * 0.12;

      const t = (now - t0) / BREATH_MS;
      const breath = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;

      // Dot : respiration via CSS variables (taille + opacité)
      const dr = DOT_BASE + breath * DOT_BREATH;
      const dotAlpha = (0.75 + breath * 0.15) * (1 - hover * 0.5);
      dot.style.setProperty("--r", `${dr}px`);
      dot.style.opacity = String(dotAlpha);

      // Halo : lerp position + respiration
      haloPos.x += (mouse.x - haloPos.x) * HALO_LERP;
      haloPos.y += (mouse.y - haloPos.y) * HALO_LERP;
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
          background: "radial-gradient(circle, rgba(165,90,62,0.45) 0%, rgba(165,90,62,0.15) 55%, rgba(165,90,62,0) 82%)",
          willChange: "transform, width, height, opacity",
        }}
      />
      {/* Point net — position via CSS variables --mx/--my, taille via --r */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed", left: 0, top: 0, zIndex: 9999,
          pointerEvents: "none",
          background: "#A55A3E",
          borderRadius: "50%",
          boxShadow: "0 0 6px rgba(165,90,62,0.45)",
          width: "var(--r, 15px)", height: "var(--r, 15px)",
          transform:
            "translate3d(var(--mx, -100px), var(--my, -100px), 0) translate(-50%, -50%)",
          willChange: "transform, width, height, opacity",
        }}
      />
    </>
  );
}
