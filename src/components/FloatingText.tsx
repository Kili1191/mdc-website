"use client";

import { useRef } from "react";
import { COLORS, FONTS } from "@/styles/tokens";

export default function FloatingText({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const lines = text.split(" / ");

  return (
    <h1
      ref={ref}
      style={{
        fontFamily: FONTS.higuen,
        fontSize: "clamp(24px, 3.5vw, 44px)",
        fontWeight: 400,
        lineHeight: 1.3,
        textAlign: "center",
        maxWidth: 900,
        margin: 0,
        userSelect: "text",
        // halo plus foncé/chaud qui détache le texte du marbre
        filter: "drop-shadow(0 2px 16px rgba(165,90,62,0.6)) drop-shadow(0 0 38px rgba(74,59,42,0.5))",
      }}
    >
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block" }}>
          {line.split(" ").map((w, i) => (
            <span
              key={i}
              className="mdc-word"
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                cursor: "default",
                // tache d'encre IRRÉGULIÈRE : plusieurs radial-gradients décalés se chevauchent → forme organique
                backgroundImage: `
                  radial-gradient(ellipse 60% 90% at 35% 40%, ${COLORS.rouille}, transparent 60%),
                  radial-gradient(ellipse 80% 50% at 65% 55%, ${COLORS.ocre}, transparent 55%),
                  radial-gradient(ellipse 50% 70% at 50% 70%, ${COLORS.rouille}, transparent 65%)
                `,
                backgroundColor: COLORS.brouFonce,
                backgroundSize: "0% 0%, 0% 0%, 0% 0%",
                backgroundPosition: "35% 40%, 65% 55%, 50% 70%",
                backgroundRepeat: "no-repeat",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                transition: "transform 1.1s cubic-bezier(0.16,1,0.3,1), background-size 1s cubic-bezier(0.33,0,0.2,1)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-10px)";
                el.style.backgroundSize = "180% 160%, 200% 140%, 170% 180%"; // les 3 taches s'étalent, irrégulières
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.backgroundSize = "0% 0%, 0% 0%, 0% 0%";
              }}
            >
              {w}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
