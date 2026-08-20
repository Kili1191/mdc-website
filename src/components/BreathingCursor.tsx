"use client";

import { useEffect, useRef } from "react";

// Deux couches, deux vitesses :
// - Dot : outer div positionné en synchrone dans mousemove (translate3d
//   pur, aucun lag). Inner div appliqué le scale du souffle en GPU.
// - Halo : outer positionné avec lerp en rAF, inner scale du souffle.
// Séparer position et scale sur deux éléments évite tout conflit de
// composition de transform (Safari est chiant sur var() imbriqués
// dans un même transform).

const BREATH_MS = 5500;
const HALO_LERP = 0.14;

// Contrainte : au pic du souffle, le dot ne doit PAS dépasser la
// taille d'un curseur natif (~18-20px de diamètre). MAX = 9 → 18px.
const DOT_MIN = 5;    // rayon dot au fond du souffle (10px diamètre)
const DOT_MAX = 9;    // rayon dot au pic du souffle (18px ≈ curseur natif)

const HALO_MIN = 18;
const HALO_MAX = 26;
const HALO_HOVER = 14;

export default function BreathingCursor() {
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const dotInnerRef = useRef<HTMLDivElement>(null);
  const haloWrapRef = useRef<HTMLDivElement>(null);
  const haloInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dotWrap = dotWrapRef.current;
    const dotInner = dotInnerRef.current;
    const haloWrap = haloWrapRef.current;
    const haloInner = haloInnerRef.current;
    if (!dotWrap || !dotInner || !haloWrap || !haloInner) return;

    const style = document.createElement("style");
    style.textContent = `html, body, a, button, input, textarea, select { cursor: none !important; }`;
    document.head.appendChild(style);

    const mouse = { x: -1000, y: -1000 };
    const haloPos = { x: -1000, y: -1000 };
    let hover = 0;
    let hoverTarget = 0;
    let raf = 0;
    const t0 = performance.now();
    // "activity" : 1 quand la souris bouge, décroît quand elle s'arrête.
    // Sert à faire fondre le halo sous la souris quand on est immobile.
    let activity = 0;

    // La taille DOM est fixée au max — on n'anime QUE la scale, jamais
    // width/height (pas de layout par frame).
    dotInner.style.width = `${DOT_MAX * 2}px`;
    dotInner.style.height = `${DOT_MAX * 2}px`;
    haloInner.style.width = `${(HALO_MAX + HALO_HOVER) * 2}px`;
    haloInner.style.height = `${(HALO_MAX + HALO_HOVER) * 2}px`;

    dotWrap.style.transform = "translate3d(-1000px, -1000px, 0)";
    haloWrap.style.transform = "translate3d(-1000px, -1000px, 0)";

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Position synchrone du dot — aucun rAF de latence
      dotWrap.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      // Signal d'activité : le halo est visible quand ça bouge
      activity = 1;
    };
    const onLeave = () => {
      mouse.x = -1000; mouse.y = -1000;
      dotWrap.style.transform = "translate3d(-1000px, -1000px, 0)";
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

      // Dot inner scale : respiration DOT_MIN → DOT_MAX
      const dr = DOT_MIN + breath * (DOT_MAX - DOT_MIN);
      const dotScale = dr / DOT_MAX;
      const dotAlpha = (0.75 + breath * 0.15) * (1 - hover * 0.5);
      dotInner.style.transform = `scale(${dotScale})`;
      dotInner.style.opacity = String(dotAlpha);

      // Décroissance de l'activité — quand la souris ne bouge plus,
      // le halo se glisse sous elle (lerp continue) puis fond à zéro.
      // Décay 0.93/frame → demie-vie ~180ms, quasi 0 après ~700ms.
      activity *= 0.93;

      // Halo : position lerp en rAF + inner scale
      haloPos.x += (mouse.x - haloPos.x) * HALO_LERP;
      haloPos.y += (mouse.y - haloPos.y) * HALO_LERP;
      haloWrap.style.transform = `translate3d(${haloPos.x}px, ${haloPos.y}px, 0)`;

      const hr = HALO_MIN + breath * (HALO_MAX - HALO_MIN) + hover * HALO_HOVER;
      const haloScale = hr / (HALO_MAX + HALO_HOVER);
      // Alpha final multiplié par l'activité : le halo devient invisible
      // à l'arrêt (mais reste visible sous le hover pour marquer la cible).
      const haloAlpha = (0.55 + breath * 0.15) * Math.max(activity, hover * 0.6);
      haloInner.style.transform = `scale(${haloScale})`;
      haloInner.style.opacity = String(haloAlpha);

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

  const wrapBase: React.CSSProperties = {
    position: "fixed", left: 0, top: 0,
    pointerEvents: "none",
    willChange: "transform",
  };
  const innerBase: React.CSSProperties = {
    position: "absolute", left: "50%", top: "50%",
    marginLeft: "-50%", marginTop: "-50%",
    borderRadius: "50%",
    willChange: "transform, opacity",
    transformOrigin: "center",
  };

  return (
    <>
      <div ref={haloWrapRef} aria-hidden style={{ ...wrapBase, zIndex: 9998 }}>
        <div
          ref={haloInnerRef}
          style={{
            ...innerBase,
            background:
              "radial-gradient(circle, rgba(165,90,62,0.22) 0%, rgba(165,90,62,0.06) 55%, rgba(165,90,62,0) 80%)",
          }}
        />
      </div>
      <div ref={dotWrapRef} aria-hidden style={{ ...wrapBase, zIndex: 9999 }}>
        <div
          ref={dotInnerRef}
          style={{
            ...innerBase,
            background: "#A55A3E",
            boxShadow: "0 0 6px rgba(165,90,62,0.45)",
          }}
        />
      </div>
    </>
  );
}
