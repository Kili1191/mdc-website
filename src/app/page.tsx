"use client";

import { useEffect, useRef } from "react";
import BreathReveal from "@/components/BreathReveal";
import SplitTextChars from "@/components/effects/SplitTextChars";
import MagneticButton from "@/components/effects/MagneticButton";
import AssetFrame from "@/components/effects/AssetFrame";
import { useIntroReady } from "@/lib/introReady";
import { COLORS, FONTS } from "@/styles/tokens";
import { scrollStore } from "@/lib/scrollStore";
import { houseFocus } from "@/lib/houseFocus";


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
const bodyStyle: React.CSSProperties = {
  fontFamily: FONTS.prata,
  fontSize: "clamp(17px, 1.5vw, 20px)",
  lineHeight: 1.75,
  color: COLORS.brou,
  margin: 0,
  maxWidth: 640,
};
const stationStyle: React.CSSProperties = {
  position: "relative", zIndex: 5,
  // dvh gère la barre d'adresse mobile Safari, fallback vh sur old browsers
  height: "100dvh",
  minHeight: "100vh",
  width: "100%",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "0 6vw",
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
    // Chaque station se mesure elle-meme : son focus depend de la distance
    // entre son centre et celui du viewport, pas d'un progres global decoupe
    // en parts egales. Une station peut donc etre plus haute qu'une autre
    // sans casser la choregraphie, et aucune constante n'est a re-caler.
    const tick = () => {
      const vh = window.innerHeight;
      const last = stations.length - 1;
      stations.forEach((st, i) => {
        const r = st.getBoundingClientRect();
        const stCenter = r.top + r.height / 2;
        // distance normalisee : 0 au centre de l'ecran, 1 a une hauteur d'ecran
        const d = (stCenter - vh / 2) / vh;
        let vis = gaussian(d, 0, 0.42);
        // Premiere station nette a l'arrivee, derniere nette en sortie.
        if (i === 0 && d >= 0) vis = 1;
        else if (i === last && d <= 0) vis = 1;
        const focus = Math.max(0, (vis - 0.35) / 0.65);
        st.style.opacity = String(focus);
        st.style.transform = `translateY(${(1 - focus) * (d > 0 ? 14 : -14)}px)`;
        st.style.pointerEvents = focus > 0.15 ? "auto" : "none";

        // La station MAISON publie son focus pour HomeStage. La maison n'est
        // donc presente que la ou cette section domine reellement l'ecran.
        if (st.dataset.station === "maison") houseFocus.set(focus);
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

      <div ref={rootRef}>
        {/* 1. SEUIL — pas de rectangle média, le marbre ambient (SiteMarble)
            suffit. Le titre au centre. */}
        <section className="mdc-station" style={{ ...stationStyle, flexDirection: "column" }}>
          <div style={{
            ...displayItalic, fontSize: "clamp(34px, 5.5vw, 62px)",
            maxWidth: 900, textAlign: "center",
          }}>
            <SplitTextChars text="For those who carry everything inside." delay={22} duration={950} />
          </div>
          <BreathReveal
            as="p"
            text="You have handled everything. This is the one room where you don't have to."
            style={{ ...bodyStyle, marginTop: 44, textAlign: "center", maxWidth: 620 }}
            stagger={90}
          />
        </section>

        {/* 2. PIERRE — PH-01 image derrière + titre */}
        <section className="mdc-station" style={stationStyle}>
          <BreathReveal
            as="p"
            text="There is a kind of tiredness that rest doesn't reach…"
            style={{ ...displayItalic, fontSize: "clamp(30px, 4.6vw, 52px)", maxWidth: 900, textAlign: "center", position: "relative", zIndex: 1 }}
            stagger={100}
          />
        </section>

        {/* 3. LA MAISON — la station qui nomme ce que c'est. Elle precede
             immediatement la gravure : le burin marque donc l'instant ou le
             site dit ce qu'il est, au lieu de flotter au milieu du scroll.
             Copy COPY_V13 §Home/The house, validee. */}
        <section className="mdc-station" style={{ ...stationStyle, flexDirection: "column" }}>
          <BreathReveal
            as="p"
            text="Maison du Calme is a private house in London for what cannot be said aloud."
            style={{ ...displayItalic, fontSize: "clamp(26px, 3.4vw, 40px)", maxWidth: 860, textAlign: "center", lineHeight: 1.35 }}
            stagger={90}
          />
          <BreathReveal
            as="p"
            text="You arrive carrying. You leave lighter. What happens between is felt, not explained."
            style={{ ...bodyStyle, marginTop: 40, textAlign: "center" }}
            stagger={70}
          />
        </section>

        {/* 4. MAISON — pas de texte, la 3D parle. Station deux fois plus
             haute : le moment signature a besoin d'un moment ou il est seul
             a l'ecran. A hauteur egale, la fenetre ou aucune autre station
             n'etait lisible ne durait que 2% du scroll. */}
        <section
          className="mdc-station"
          data-station="maison"
          style={{ ...stationStyle, height: "200dvh", minHeight: "200vh" }}
          aria-hidden
        />

        {/* 4. TRAVAIL */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center" }}>
            <BreathReveal
              as="p"
              text="Up to ninety minutes. / Clothed. / In silence."
              style={displayCaps}
              stagger={140}
            />
            <div style={{ marginTop: 48, display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
              <MagneticButton href="/sessions">Sessions</MagneticButton>
              <MagneticButton href="/the-work">The Work</MagneticButton>
            </div>
          </div>
        </section>

        {/* 5. KILIAN */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center", maxWidth: 900 }}>
            <div style={{ ...displayItalic, fontSize: "clamp(24px, 3.8vw, 40px)" }}>
              <SplitTextChars
                text="Chronic stress rarely looks like falling apart. It looks like being very good at your life."
                delay={18} duration={800}
              />
            </div>
            <div style={{ marginTop: 56 }}>
              <MagneticButton href="/practitioner">Kilian</MagneticButton>
            </div>
          </div>
        </section>

        {/* 6. BEGIN */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...displayItalic, fontSize: "clamp(32px, 5vw, 56px)" }}>
              <SplitTextChars text="Something in you already knows." delay={38} duration={950} />
            </div>
            <BreathReveal
              as="p"
              text="Entry is by conversation, not by calendar. Tell us what you carry."
              style={{ ...bodyStyle, marginTop: 40, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}
              stagger={80}
            />
            <div style={{ marginTop: 52 }}>
              <MagneticButton href="/begin">Begin</MagneticButton>
            </div>
            <p style={{ ...bodyStyle, fontSize: 13, opacity: 0.68, marginTop: 28, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              No forms you dread. One question, answered in your own time.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
