"use client";
import { useEffect, useRef } from "react";

// Magnetic hover : le bouton s'attire vers le curseur quand il est
// proche. Texte reste indépendamment centré, translaté un peu moins
// que le fond pour l'effet de profondeur.
export default function MagneticButton({
  children, href, radius = 90, pull = 0.35,
}: { children: React.ReactNode; href?: string; radius?: number; pull?: number }) {
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    const label = labelRef.current;
    if (!el || !label) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        target.x = dx * pull;
        target.y = dy * pull;
      } else {
        target.x = 0;
        target.y = 0;
      }
    };
    const onLeave = () => { target.x = 0; target.y = 0; };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.18;
      cur.y += (target.y - cur.y) * 0.18;
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      label.style.transform = `translate3d(${cur.x * 0.35}px, ${cur.y * 0.35}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [radius, pull]);

  return (
    <a
      ref={wrapRef}
      href={href ?? "#"}
      style={{
        display: "inline-block", padding: "22px 52px",
        border: "1px solid #A55A3E", borderRadius: 2,
        color: "#A55A3E", textDecoration: "none",
        fontFamily: "var(--font-prata), Georgia, serif",
        fontSize: 13, letterSpacing: "0.32em", textTransform: "uppercase",
        willChange: "transform",
      }}
    >
      <span ref={labelRef} style={{ display: "inline-block", willChange: "transform" }}>
        {children}
      </span>
    </a>
  );
}
