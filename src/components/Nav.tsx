"use client";

import { useEffect, useRef, useState } from "react";
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

// VISION §4 : pas de header fixe permanent — la nav apparaît quand on en a
// besoin (curseur haut, scroll-up, Escape) et s'efface sinon.
const EDGE_PX = 80;         // zone haute qui révèle la nav au survol
const AUTO_HIDE_MS = 2500;  // délai d'auto-masquage après inactivité
const SCROLL_HYSTERESIS = 6;

export default function Nav() {
  const ready = useIntroReady();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!ready) return;

    const scheduleHide = (ms: number) => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), ms);
    };
    const cancelHide = () => {
      if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null; }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastScrollY.current;
      lastScrollY.current = y;
      if (y < EDGE_PX) { cancelHide(); setVisible(true); return; }
      if (dy < -SCROLL_HYSTERESIS) { setVisible(true); scheduleHide(AUTO_HIDE_MS); }
      else if (dy > SCROLL_HYSTERESIS) { cancelHide(); setVisible(false); }
    };
    const onMove = (e: MouseEvent) => {
      if (e.clientY < EDGE_PX) { setVisible(true); scheduleHide(AUTO_HIDE_MS); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible((v) => !v);
    };

    lastScrollY.current = window.scrollY;
    scheduleHide(AUTO_HIDE_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [ready]);

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
        aria-hidden={!visible}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "22px 48px",
          background: "transparent",
          pointerEvents: visible ? "none" : "none",
          transform: visible ? "translateY(0)" : "translateY(-110%)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
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
