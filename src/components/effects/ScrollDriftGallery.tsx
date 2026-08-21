"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scrollStore";

// ScrollDriftGallery — rangée d'images qui glisse latéralement au fil
// du scroll vertical de la page. Effet "les visuels dérivent quand tu
// descends" (Studio Freight, Active Theory). Direction et amplitude
// configurables.
export type DriftItem = { src: string; alt?: string; width?: number };

export default function ScrollDriftGallery({
  items, direction = "left", amplitude = 40, height = 360, gap = 24,
}: {
  items: DriftItem[];
  direction?: "left" | "right";
  amplitude?: number;     // px de drift entre l'entrée et la sortie de viewport
  height?: number;
  gap?: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    let raf = 0;
    const sign = direction === "left" ? -1 : 1;
    const tick = () => {
      const rect = outer.getBoundingClientRect();
      // 0 quand la section entre dans le bas du viewport, 1 quand elle
      // sort par le haut. Linéaire, sans easing.
      const p = 1 - Math.max(0, Math.min(1, (rect.top + rect.height * 0.5) / window.innerHeight));
      inner.style.transform = `translate3d(${sign * (p - 0.5) * amplitude * 2}vw, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    // read from scrollStore to sync (les deux marchent mais scrollStore
    // évite un ticker isolé)
    const unsubscribe = scrollStore.subscribe(() => {}); // keep store warm
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
    };
  }, [direction, amplitude]);

  return (
    <div ref={outerRef} style={{ overflow: "hidden", width: "100%", height }}>
      <div
        ref={innerRef}
        style={{
          display: "inline-flex", height: "100%", gap,
          padding: `0 ${gap}px`,
          willChange: "transform",
        }}
      >
        {items.map((it, i) => {
          const w = it.width ?? 260;
          return (
            <div key={i} style={{ height: "100%", width: w, flex: "none", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt={it.alt ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
