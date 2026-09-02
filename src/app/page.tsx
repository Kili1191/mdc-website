"use client";

import { useEffect, useRef } from "react";
import BreathReveal from "@/components/BreathReveal";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";
import { useIntroReady } from "@/lib/introReady";
import { COLORS, FONTS } from "@/styles/tokens";
import { body as pageBody, sectionHead, eyebrow, micro, label } from "@/styles/page";
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

// Le sommaire de la pratique. NERVANA est une SUITE et commence toujours par
// ANTARA — d'ou le lien direct vers cette salle. Les quatre autres pratiques
// ne font pas partie de la suite : elles vivent dans « Also practised here ».
// Le coaching est la seule chose qui ne se passe pas dans la maison.
const PRATIQUE = [
  { n: "01", name: "NERVANA",  href: "/sessions#antara", meta: "Begins at £250",
    line: "The suite Kilian built. It opens with ANTARA, always." },
  { n: "02", name: "ABHYANGA", href: "/sessions#also",   meta: "Ayurvedic · £160",
    line: "Warm oil, worked over the body in one unbroken rhythm." },
  { n: "03", name: "MARMA",    href: "/sessions#also",   meta: "Ayurvedic · £160",
    line: "The junctions where the body gathers what it holds." },
  { n: "04", name: "REIKI",    href: "/sessions#also",   meta: "£130",
    line: "Hands resting on the body, or just above it, and held." },
  { n: "05", name: "SOUND",    href: "/sessions#also",   meta: "£140",
    line: "Bowls set on the body. The only work here you will hear." },
  { n: "06", name: "COACHING", href: "/coaching",        meta: "On a call · from £150",
    line: "One conversation, or six, wherever you are." },
];


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
    let lastY = window.scrollY;
    let goingUp = false;
    const downEls = root.querySelectorAll<HTMLElement>('[data-dir="down"]');
    const upEls = root.querySelectorAll<HTMLElement>('[data-dir="up"]');

    const tick = () => {
      const vh = window.innerHeight;

      // Hysteresis : un tremblement de trackpad ne doit pas faire clignoter
      // la phrase. Il faut six pixels francs pour changer d'avis.
      const y = window.scrollY;
      if (y - lastY > 6) goingUp = false;
      else if (lastY - y > 6) goingUp = true;
      lastY = y;
      downEls.forEach((e) => { e.style.opacity = goingUp ? "0" : "1"; });
      upEls.forEach((e) => { e.style.opacity = goingUp ? "1" : "0"; });

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

        // La station MAISON publie son etat pour le shader du marbre. La
        // gravure n'existe donc que la ou cette section domine l'ecran.
        if (st.dataset.station === "maison") {
          // Avancee du burin. Elle doit s'achever QUAND la maison est la plus
          // visible, pas quand elle s'en va.
          //
          // La version precedente divisait par la hauteur entiere de la
          // station : le trait n'etait acheve qu'une fois le BAS de la station
          // au centre de l'ecran, or a ce moment la presence est deja retombee
          // a zero. La maison etait donc a moitie gravee a son apogee, et
          // entierement gravee au moment ou plus personne ne la voyait.
          //
          // On divise par la demi-hauteur : le trait se termine quand le CENTRE
          // de la station atteint le centre de l'ecran, c'est-a-dire au pic de
          // presence. Ensuite il reste acheve.
          const cut = Math.max(0, Math.min(1, (vh / 2 - r.top) / (r.height / 2)));
          houseFocus.set(focus, cut);
        }
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
          {/* C'est le <h1> du site. L'accueil n'en avait aucun — les sept
              autres pages en ont un — et cette phrase est deja le titre :
              elle etait simplement dans un div. */}
          <h1 style={{
            ...displayItalic, fontSize: "clamp(34px, 5.5vw, 62px)",
            maxWidth: 900, textAlign: "center", margin: 0, fontWeight: 400,
          }}>
            <SplitTextChars text="For those who carry everything inside." delay={22} duration={900} />
          </h1>
          {/* La maison ne dit pas la meme chose a l'aller et au retour.
              Les deux lignes sont superposees et se croisent selon le sens du
              scroll : on descend, elle vous accueille ; on remonte, elle vous
              dit ce que vous emportez. Rien ne se remonte en React, on ne
              touche que l'opacite. */}
          <div style={{ position: "relative", marginTop: 44, width: "100%", maxWidth: 620, minHeight: 92 }}>
            <div data-dir="down" style={{ position: "absolute", inset: 0, transition: "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <BreathReveal
                as="p"
                text="You have handled everything. This is the one room where you don't have to."
                style={{ ...bodyStyle, textAlign: "center" }}
                stagger={90}
              />
            </div>
            <div data-dir="up" style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <BreathReveal
                as="p"
                text="Whatever you set down here stays here. You take back only yourself."
                style={{ ...bodyStyle, textAlign: "center" }}
                stagger={90}
              />
            </div>
          </div>
        </section>

        {/* 2. PIERRE — PH-01 image derrière + titre */}
        <section className="mdc-station" style={stationStyle}>
          <BreathReveal
            as="p"
            text="There is a kind of tiredness that rest doesn't reach."
            style={{ ...displayItalic, fontSize: "clamp(30px, 4.6vw, 52px)", maxWidth: 900, textAlign: "center", position: "relative", zIndex: 1 }}
            stagger={90}
          />
        </section>

        {/* 3. LA MAISON — la station qui nomme ce que c'est. Elle precede
             immediatement la gravure : le burin marque donc l'instant ou le
             site dit ce qu'il est, au lieu de flotter au milieu du scroll.

             Elle disait « a private house in London » : une adresse. Kilian :
             « la house c'est le concept, pas un endroit physique », et « une
             maison comme les maisons de luxe, mais aussi un refuge ».

             DEUX VERBES, parce qu'il a nomme deux sens.

             « It asks nothing of you » — le refuge. Deux mots essayes avant :
             « takes you in », ecarte parce qu'en anglais britannique « taken
             in » veut aussi dire berne ; puis « shelters », ecarte par Kilian
             — « shelter makes me remember homeless ». C'est juste : en
             anglais, shelter appartient au vocabulaire du foyer d'accueil et
             du refuge pour animaux. Le registre welfare, pas celui d'une
             maison. Ce qui reste dit le refuge sans nommer l'abri, et vise
             exactement son client : celui a qui on demande tout, partout.

             « What it makes » — la maison de couture. Une maison est une
             institution qui FABRIQUE. Ce qu'elle fabrique aujourd'hui est du
             calme ; elle portera du vetement plus tard, et la phrase tiendra
             sans retouche.

             D'ou ce qu'elle ne dit jamais : ni cabinet, ni pratique, ni une
             heure. Chacun de ces mots enfermerait la marque dans son premier
             produit. */}
        <section className="mdc-station" style={{ ...stationStyle, flexDirection: "column" }}>
          <BreathReveal
            as="p"
            text="Maison du Calme is a house. It asks nothing of you, and what it makes is calm."
            style={{ ...displayItalic, fontSize: "clamp(26px, 3.4vw, 40px)", maxWidth: 860, textAlign: "center", lineHeight: 1.35 }}
            stagger={90}
          />
          <BreathReveal
            as="p"
            text="You arrive carrying. You leave lighter. What happens between is felt, not explained."
            style={{ ...bodyStyle, marginTop: 40, textAlign: "center" }}
            stagger={90}
          />
        </section>

        {/* 4. MAISON — pas de texte, la gravure parle. Un peu plus haute que
             les autres pour que le burin ait le temps de descendre, mais pas
             plus : depuis que chaque station se mesure elle-meme, un voisin
             est deja eteint des que la station depasse 0,22 hauteur d'ecran.
             Les 200dvh dataient du systeme precedent et rendaient la
             traversee interminable. */}
        <section
          className="mdc-station"
          data-station="maison"
          style={{ ...stationStyle, height: "130dvh", minHeight: "130vh" }}
          aria-hidden
        />

        {/* ── LE TRAVAIL ──────────────────────────────────────────────
             Cette station ne disait que « Up to ninety minutes / Clothed /
             In silence » et posait deux boutons. Reproche deja formule par
             Kilian sur cette page : « la page ce n'est que quelques
             citations, est-ce que ca vend et montre ce que je fais ? ».
             C'etait encore vrai : l'accueil ne nommait aucune des pratiques.

             Ce bloc n'est PAS une .mdc-station. Les stations s'effacent des
             qu'elles quittent le centre de l'ecran — parfait pour une phrase,
             illisible pour un sommaire. Il defile normalement, dans la
             grammaire editoriale des autres pages (.mdc-wrap, .mdc-index). */}
        <section className="mdc-wrap" style={{ position: "relative", zIndex: 5, paddingTop: 40, paddingBottom: 40 }}>
          <p style={eyebrow}>What is practised here</p>
          <h2 style={{ ...sectionHead, marginTop: 30, maxWidth: "20ch" }}>
            Six ways in. Five in the room, one on a call.
          </h2>

          {/* Le sommaire defile a l'horizontale. Demande de Kilian.
              data-lenis-prevent : Lenis lisse le scroll de la page et
              avalerait la molette au-dessus du rail. C'est l'echappatoire
              documentee — sans elle, le rail ne bouge pas au trackpad. */}
          <nav className="mdc-rail" aria-label="The practice" data-lenis-prevent>
            {PRATIQUE.map((r) => (
              <a key={r.name} href={r.href} className="mdc-rail__card">
                <span style={{ ...micro, opacity: 0.7 }}>{r.n}</span>
                <span style={{ ...label, fontSize: 21, display: "block", marginTop: 18 }}>{r.name}</span>
                <span style={{ ...pageBody, fontSize: 17, maxWidth: "none", display: "block", marginTop: 16 }}>{r.line}</span>
                <span style={{ ...micro, display: "block", marginTop: "auto", paddingTop: 28 }}>{r.meta}</span>
              </a>
            ))}
          </nav>

          <p style={{ ...micro, marginTop: 28 }}>
            Up to ninety minutes. Clothed, unless there is oil.
            <br />
            Battersea, South West London · In the room, £130 to £250 · Coaching, from £150
          </p>

          {/* La transmission. Kilian : « tu n'insistes pas sur le fait que je
              pratique une technique tres ancienne, non modifiee ». Elle
              n'apparaissait nulle part sur l'accueil. Elle se dit sobrement :
              c'est fort parce que c'est rare, pas parce qu'on appuie. */}
          <div className="mdc-gap">
            <p style={eyebrow}>Where this comes from</p>
            <h2 style={{ ...sectionHead, marginTop: 30, maxWidth: "22ch" }}>
              Learned where it was never packaged.
            </h2>
            <p style={{ ...pageBody, marginTop: 36 }}>
              Kilian still learns in India, from teachers who take students by word of mouth and no other way. You reach them by going. What they teach has never been shortened to fit a weekend.
            </p>
          </div>
        </section>

        {/* 5. KILIAN */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center", maxWidth: 900 }}>
            <div style={{ ...displayItalic, fontSize: "clamp(24px, 3.8vw, 40px)" }}>
              <SplitTextChars
                text="Chronic stress rarely looks like falling apart. It looks like being very good at your life."
                delay={22} duration={900}
              />
            </div>
            <div style={{ marginTop: 56 }}>
              <QuietButton href="/practitioner">Kilian</QuietButton>
            </div>
          </div>
        </section>

        {/* 6. BEGIN */}
        <section className="mdc-station" style={stationStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...displayItalic, fontSize: "clamp(32px, 5vw, 56px)" }}>
              <SplitTextChars text="Something in you already knows." delay={60} duration={900} />
            </div>
            <BreathReveal
              as="p"
              text="Entry is by conversation, not by calendar. Tell Kilian what you carry."
              style={{ ...bodyStyle, marginTop: 40, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}
              stagger={90}
            />
            <div style={{ marginTop: 52 }}>
              <QuietButton href="/begin">Begin</QuietButton>
            </div>
            <p style={{ ...bodyStyle, fontSize: 13, opacity: 0.68, marginTop: 28, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              One question, answered in your own time.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
