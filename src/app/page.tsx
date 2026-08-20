"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BreathReveal from "@/components/BreathReveal";
import { useIntroReady } from "@/lib/introReady";
import { COLORS, FONTS } from "@/styles/tokens";

const HouseScene = dynamic(() => import("@/components/HouseScene"), { ssr: false });

// Home = "la traversée de la maison" — 6 stations pinned.
// Copy validée uniquement (WARROOM_Site_Decision_Finale) : pas de numéros,
// pas de "5 états". Chaque station tient 100vh d'écran + pin pendant 100vh
// de scroll, transition douce entre elles.

const displayItalic: React.CSSProperties = {
  fontFamily: FONTS.higuen,
  fontStyle: "italic",
  fontWeight: 400,
  color: COLORS.brouFonce,
  margin: 0,
  lineHeight: 1.2,
  letterSpacing: "-0.005em",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 18, lineHeight: 1.75, color: COLORS.brou, margin: 0,
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
};

const contentBox: React.CSSProperties = {
  maxWidth: 780, width: "100%", textAlign: "center",
  padding: "48px 40px",
  background: "rgba(237,228,208,0.28)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  borderRadius: 2,
};

export default function Home() {
  const ready = useIntroReady();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    // Pin chaque station pendant +100vh — cinematic descent.
    // Le contenu fade in au tiers d'entrée et fade out au tiers de sortie.
    const stations = gsap.utils.toArray<HTMLElement>(".mdc-station");
    const triggers: ScrollTrigger[] = [];

    stations.forEach((station) => {
      const inner = station.querySelector<HTMLElement>(".mdc-station-inner");
      if (!inner) return;
      const st = ScrollTrigger.create({
        trigger: station,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const p = self.progress;
          // fade in 0..0.15, hold 0.15..0.85, fade out 0.85..1
          let opacity = 1;
          let ty = 0;
          if (p < 0.15) {
            const k = p / 0.15;
            opacity = k;
            ty = (1 - k) * 24;
          } else if (p > 0.85) {
            const k = (p - 0.85) / 0.15;
            opacity = 1 - k;
            ty = -k * 24;
          }
          inner.style.opacity = String(opacity);
          inner.style.transform = `translateY(${ty}px)`;
        },
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <div ref={rootRef}>
      {/* 1. SEUIL — hero */}
      <section className="mdc-station" style={stationStyle}>
        <div className="mdc-station-inner" style={contentBox}>
          <BreathReveal
            as="p"
            text="For those who carry everything inside."
            style={{ ...displayItalic, fontSize: "clamp(34px, 5.5vw, 62px)" }}
            stagger={110}
          />
          {/* Hero video slot — à remplir plus tard */}
          <div
            aria-hidden
            data-slot="hero-video"
            style={{ display: "none" }}
          />
        </div>
      </section>

      {/* 2. PIERRE */}
      <section className="mdc-station" style={stationStyle}>
        <div className="mdc-station-inner" style={contentBox}>
          <BreathReveal
            as="p"
            text="There is a kind of tiredness that rest doesn't reach…"
            style={{ ...displayItalic, fontSize: "clamp(30px, 4.6vw, 52px)" }}
            stagger={100}
          />
        </div>
      </section>

      {/* 3. MAISON — signature 3D house */}
      <section className="mdc-station" style={{ ...stationStyle, padding: 0 }}>
        <div className="mdc-station-inner" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
        }}>
          <HouseScene />
        </div>
      </section>

      {/* 4. TRAVAIL */}
      <section className="mdc-station" style={stationStyle}>
        <div className="mdc-station-inner" style={contentBox}>
          <BreathReveal
            as="p"
            text="Ninety minutes. / Clothed. / In silence."
            style={{
              fontFamily: FONTS.higuen,
              fontSize: "clamp(26px, 3.6vw, 40px)",
              lineHeight: 1.55,
              color: COLORS.brouFonce,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontWeight: 400,
            }}
            stagger={140}
          />
          <div style={{ marginTop: 48 }}>
            <a href="/the-work" style={linkStyle}>The Work</a>
          </div>
        </div>
      </section>

      {/* 5. KILIAN */}
      <section className="mdc-station" style={stationStyle}>
        <div className="mdc-station-inner" style={contentBox}>
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
        <div className="mdc-station-inner" style={contentBox}>
          <BreathReveal
            as="p"
            text="You only have to arrive."
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

      {/* padding pour libérer le dernier pin */}
      <div style={{ height: "10vh" }} aria-hidden />
    </div>
  );
}

// Body inutilisé — silencier le linter unused import.
void bodyStyle;
