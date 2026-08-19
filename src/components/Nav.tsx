"use client";

import { COLORS, FONTS } from "@/styles/tokens";
import { useIntroReady } from "@/lib/introReady";

const LINKS = [
  { label: "Sessions", href: "/sessions" },
  { label: "Practitioner", href: "/practitioner" },
  { label: "Retreats", href: "/retreats" },
  { label: "The Work", href: "/the-work" },
  { label: "Notes", href: "/notes" },
  { label: "Begin", href: "/begin" },
];

export default function Nav() {
  const ready = useIntroReady();
  if (!ready) return null;
  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "26px 48px", background: "transparent", pointerEvents: "none",
      }}
    >
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", pointerEvents: "auto" }}>
        <img src="/logo.png" alt="" style={{ height: 34, width: "auto", display: "block" }} />
        <span style={{ fontFamily: FONTS.higuen, fontSize: 15, letterSpacing: "0.22em", color: COLORS.brouFonce }}>
          MAISON DU CALME
        </span>
      </a>
      <div style={{ display: "flex", gap: 28, pointerEvents: "auto" }}>
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} style={{
            fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.14em",
            textTransform: "uppercase", textDecoration: "none",
            color: l.label === "Begin" ? COLORS.rouille : COLORS.brou, opacity: 0.82,
          }}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
