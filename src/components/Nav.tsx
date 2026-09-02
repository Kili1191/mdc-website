"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { COLORS, FONTS } from "@/styles/tokens";
import { useIntroReady } from "@/lib/introReady";
import { DURATION, EASE } from "@/lib/motion";

const LINKS = [
  { label: "Sessions", href: "/sessions" },
  { label: "Practitioner", href: "/practitioner" },
  { label: "Retreats", href: "/retreats" },
  { label: "Coaching", href: "/coaching" },
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
  const pathname = usePathname();
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
    // En haut de page la nav reste : c'est le seul point d'entree vers le
    // reste de la maison. Elle ne s'efface qu'une fois la lecture commencee.
    if (window.scrollY >= EDGE_PX) scheduleHide(AUTO_HIDE_MS);
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
          pointerEvents: "none",
          transform: visible ? "translateY(0)" : "translateY(-110%)",
          opacity: visible ? 1 : 0,
          transition: `transform ${DURATION.reveal}ms ${EASE.reveal}, opacity ${DURATION.exit}ms ${EASE.exit}`,
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", pointerEvents: visible ? "auto" : "none" }}>
          <img src="/logo.png" alt="" style={{ height: 30, width: "auto", display: "block" }} />
          <span className="mdc-nav-wordmark" style={{ fontFamily: FONTS.higuen, fontSize: 15, letterSpacing: "0.22em", color: COLORS.brouFonce }}>
            MAISON DU CALME
          </span>
        </a>
        <div className="mdc-nav-links" style={{ display: "flex", pointerEvents: visible ? "auto" : "none" }}>
          {LINKS.map((l) => (
            // La page ou l'on est se grave. La classe change de lien a chaque
            // route, donc l'animation repart seule sur le nouveau.
            <a key={l.label} href={l.href}
              className={pathname === l.href ? "mdc-here" : undefined}
              data-label={l.label}
              aria-current={pathname === l.href ? "page" : undefined}
              style={{
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
