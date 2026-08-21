"use client";
import React from "react";

// Marquee — bande de texte qui défile en boucle horizontale.
// CSS pur (transform + keyframes), pause au hover.
export default function Marquee({
  text, speed = 40, direction = "left",
}: { text: string; speed?: number; direction?: "left" | "right" }) {
  const dur = `${speed}s`;
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <style>{`
        @keyframes mdc-mq-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes mdc-mq-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .mdc-marquee { display: inline-flex; gap: 3rem; padding-right: 3rem;
          animation: mdc-mq-${direction === "left" ? "l" : "r"} ${dur} linear infinite;
          will-change: transform; }
        .mdc-marquee:hover { animation-play-state: paused; }
      `}</style>
      <div className="mdc-marquee">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} style={{ whiteSpace: "nowrap", flex: "none" }}>{text}</span>
        ))}
      </div>
    </div>
  );
}
