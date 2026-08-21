"use client";

import type { CSSProperties } from "react";

// ImageMarquee — bande d'images qui défile en horizontal en boucle
// infinie. CSS pur (transform + keyframes), pause au hover.
// Utilise AssetFrame donc les slots manquants restent placeholder.
export type MarqueeItem = {
  src: string;
  slot?: string;
  aspect?: string;    // default "3/4"
  width?: number;     // largeur en px de la vignette (default 220)
};

export default function ImageMarquee({
  items, speed = 60, direction = "left", height = 320, gap = 24,
}: {
  items: MarqueeItem[];
  speed?: number;         // secondes pour un cycle complet
  direction?: "left" | "right";
  height?: number;        // hauteur de la bande en px
  gap?: number;
}) {
  const dur = `${speed}s`;
  return (
    <div style={{ overflow: "hidden", width: "100%", height }}>
      <style>{`
        @keyframes mdc-imq-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes mdc-imq-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .mdc-image-marquee { display: inline-flex; height: 100%; gap: ${gap}px; padding-right: ${gap}px;
          animation: mdc-imq-${direction === "left" ? "l" : "r"} ${dur} linear infinite;
          will-change: transform; }
        .mdc-image-marquee:hover { animation-play-state: paused; }
        .mdc-image-marquee-item { height: 100%; flex: none; overflow: hidden; }
        .mdc-image-marquee-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
      `}</style>
      <div className="mdc-image-marquee">
        {/* On duplique la liste pour un défilement continu sans coupure */}
        {[...items, ...items].map((it, i) => {
          const w = it.width ?? 220;
          const style: CSSProperties = { width: w };
          return (
            <div key={i} className="mdc-image-marquee-item" style={style}>
              <MarqueeAsset item={it} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarqueeAsset({ item }: { item: MarqueeItem }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.src} alt="" data-slot={item.slot} />;
}
