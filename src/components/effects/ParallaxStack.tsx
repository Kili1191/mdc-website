"use client";
import { useEffect, useRef } from "react";

// Parallax stack : plusieurs couches se translatent à des vitesses
// différentes selon le scroll, dans les limites du conteneur. Effet
// "plans qui glissent" à l'Aesop / Studio Freight.
export default function ParallaxStack({ layers }: {
  layers: { label: string; speed: number; color: string; size?: number }[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const refs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const tick = () => {
      const r = wrap.getBoundingClientRect();
      // 0..1 relatif au viewport
      const p = 1 - Math.max(0, Math.min(1, (r.top + r.height * 0.5) / window.innerHeight));
      refs.current.forEach((el, i) => {
        if (!el) return;
        const sp = layers[i]?.speed ?? 0;
        el.style.transform = `translate3d(0, ${(p - 0.5) * sp * -160}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [layers]);

  return (
    <div ref={wrapRef} style={{ position: "relative", height: 380, width: "100%" }}>
      {layers.map((l, i) => (
        <div
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            willChange: "transform",
          }}
        >
          <span style={{
            fontFamily: "var(--font-higuen), Georgia, serif",
            fontSize: l.size ?? 60,
            color: l.color, opacity: 0.72,
            letterSpacing: "0.02em",
          }}>{l.label}</span>
        </div>
      ))}
    </div>
  );
}
