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
    <>
      <style>{`
        .mdc-nav-wordmark { display: inline; }
        .mdc-nav-links { gap: 28px; }
        .mdc-nav-links a { font-size: 12px; }
        @media (max-width: 720px) {
          .mdc-nav { padding: 16px 20px !important; }
          .mdc-nav-wordmark { display: none; }
          .mdc-nav-links { gap: 14px; flex-wrap: wrap; justify-content: flex-end; row-gap: 6px; }
          .mdc-nav-links a { font-size: 10.5px; letter-spacing: 0.10em !important; }
        }
      `}</style>
      <nav
        className="mdc-nav"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "22px 48px",
          background: "transparent",
          pointerEvents: "none",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", pointerEvents: "auto" }}>
          <img src="/logo.png" alt="" style={{ height: 30, width: "auto", display: "block" }} />
          <span className="mdc-nav-wordmark" style={{ fontFamily: FONTS.higuen, fontSize: 15, letterSpacing: "0.22em", color: COLORS.brouFonce }}>
            MAISON DU CALME
          </span>
        </a>
        <div className="mdc-nav-links" style={{ display: "flex", pointerEvents: "auto" }}>
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} style={{
              fontFamily: FONTS.prata, letterSpacing: "0.14em",
              textTransform: "uppercase", textDecoration: "none",
              color: l.label === "Begin" ? COLORS.rouille : COLORS.brou, opacity: 0.82,
            }}>
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
