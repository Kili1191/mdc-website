"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import BreathReveal from "@/components/BreathReveal";
import { useIntroReady } from "@/lib/introReady";
import { COLORS, FONTS } from "@/styles/tokens";
import { scrollStore } from "@/lib/scrollStore";

const HomeStage = dynamic(() => import("@/components/HomeStage"), { ssr: false });

// Home = "la traversée de la maison" — 6 stations scroll-scrub.
// Pas de pin. Le scroll est libre (Lenis). Chaque station est 100vh.
// Sa visibilité est calculée en continu à partir du progrès de scroll
// (0..1) via une courbe gaussienne centrée sur son propre pas. Aucun
// re-render React par frame : on mute le DOM directement via refs.
// Modèle Awwwards 2024–2026 (Studio Freight, Igloo Inc, Active Theory).

const displayItalic: React.CSSProperties = {
  fontFamily: FONTS.higuen,
  fontStyle: "italic",
  fontWeight: 400,
  color: COLORS.brouFonce,
  margin: 0,
  lineHeight: 1.2,
  letterSpacing: "-0.005em",
};
const displayCaps: React.CSSProperties = {
  fontFamily: FONTS.higuen,
  fontSize: "clamp(26px, 3.6vw, 40px)",
  lineHeight: 1.55,
  color: COLORS.brouFonce,
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 400,
};
const linkStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.28em",
  textTransform: "uppercase", color: COLORS.rouille,
  textDecoration: "none",
  borderBottom: `1px solid ${COLORS.rouille}`, paddingBottom: 4,
};
const stationStyle: React.CSSProperties = {
  position: "relative", zIndex: 5,
  height: "100vh", width: "100%",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "0 8vw",
  willChange: "opacity, transform",
};

function gaussian(x: number, mu: number, sigma: number) {
  const d = (x - mu) / sigma;
  return Math.exp(-0.5 * d * d);
}

const N_STATIONS = 6;

export default function Home() {
  const ready = useIntroReady();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    const stations = Array.from(root.querySelectorAll<HTMLElement>(".mdc-station"));

    // Boucle rAF qui lit le scrollStore et met à jour l'opacité + le Y
    // de chaque station en continu. Zéro re-render React.
    let raf = 0;
    const tick = () => {
      const p = scrollStore.get().progress;
      stations.forEach((st, i) => {
        const center = (i + 0.5) / N_STATIONS;
        const sigma = 0.7 / N_STATIONS;
        // Visibilité gaussienne
        const vis = gaussian(p, center, sigma);
        // "Focus" : reste très visible entre 0.4 et 1, atténue vite en dessous
        const focus = Math.max(0, (vis - 0.35) / 0.65);
        st.style.opacity = String(focus);
        // Léger translateY inversement lié au focus, borné à ±14px
        const dy = (1 - focus) * (p < center ? 14 : -14);
        st.style.transform = `translateY(${dy}px)`;
        // Quand quasi-invisible, on retire du hit-test pour libérer le curseur
        st.style.pointerEvents = focus > 0.15 ? "auto" : "none";
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // premier tick immédiat aussi
    tick();
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <HomeStage />

      <div ref={rootRef}>
        {/* 1. SEUIL */}
        <section className="mdc-station" style={stationStyle}>
          <BreathReveal
            as="p"
            text="For those who carry everything inside."
            style={{ ...displayItalic, fontSize: "clamp(34px, 5.5vw, 62px)", maxWidth: 900, textAlign: "center" }}
            stagger={110}
          />
        </section>

        {/* 2. PIERRE */}
        <section className="mdc-station" style={stationStyle}>
          <BreathReveal
            as="p"
            text="There is a kind of tiredness that rest doesn't reach…"
            style={{ ...displayItalic, fontSize: "clamp(30px, 4.6vw, 52px)", maxWidth: 900, textAlign: "center" }}
            stagger={100}
          />
        </section>

        {/* 3. MAISON — pas de texte, la 3D parle. Station vide qui laisse
             respirer la maison qu'HomeStage anime au même progrès. */}
        <section className="mdc-station" style={stationStyle} aria-hidden />

        {/* 4. TRAVAIL */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center" }}>
            <BreathReveal
              as="p"
              text="Ninety minutes. / Warm oil. / In silence."
              style={displayCaps}
              stagger={140}
            />
            <div style={{ marginTop: 48 }}>
              <a href="/the-work" style={linkStyle}>The Work</a>
            </div>
          </div>
        </section>

        {/* 5. KILIAN */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center", maxWidth: 900 }}>
            <BreathReveal
              as="p"
              text="Chronic stress rarely looks like falling apart. It looks like being very good at your life."
              style={{ ...displayItalic, fontSize: "clamp(24px, 3.8vw, 40px)" }}
              stagger={70}
            />
            <div style={{ marginTop: 56 }}>
              <a href="/practitioner" style={linkStyle}>Kilian</a>
            </div>
          </div>
        </section>

        {/* 6. BEGIN */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center" }}>
            <BreathReveal
              as="p"
              text="Arriving is enough."
              style={{ ...displayItalic, fontSize: "clamp(32px, 5vw, 56px)" }}
              stagger={110}
            />
            <a
              href="/begin"
              style={{
                display: "inline-block", marginTop: 56,
                fontFamily: FONTS.prata, fontSize: 14, letterSpacing: "0.32em",
                textTransform: "uppercase", textDecoration: "none",
                color: COLORS.rouille, border: `1px solid ${COLORS.rouille}`,
                padding: "18px 44px", borderRadius: 2,
              }}
            >
              Begin
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
