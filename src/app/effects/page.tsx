"use client";

import { COLORS, FONTS } from "@/styles/tokens";
import MagneticButton from "@/components/effects/MagneticButton";
import TextScramble from "@/components/effects/TextScramble";
import Marquee from "@/components/effects/Marquee";
import ImageReveal from "@/components/effects/ImageReveal";
import ParallaxStack from "@/components/effects/ParallaxStack";
import FluidImage from "@/components/effects/FluidImage";
import SplitTextChars from "@/components/effects/SplitTextChars";
import ImageMarquee from "@/components/effects/ImageMarquee";
import ScrollDriftGallery from "@/components/effects/ScrollDriftGallery";

// Page démo — échantillon des 8 effets d'animation qui peuvent être
// posés partout sur le site. Chaque section montre l'effet + son nom
// + une note courte. Rien de "production" ici, purement pour valider
// visuellement chaque effet séparément.

const pageStyle: React.CSSProperties = {
  position: "relative", zIndex: 5,
  paddingTop: 140, paddingBottom: 200,
  background: "rgba(237,228,208,0.2)",
};
const container: React.CSSProperties = {
  maxWidth: 940, margin: "0 auto", padding: "0 6vw",
};
const section: React.CSSProperties = {
  padding: "120px 0", borderTop: `1px solid ${COLORS.taupe}22`,
};
const eyebrow: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.32em",
  textTransform: "uppercase", color: COLORS.taupe, margin: 0, marginBottom: 12,
};
const label: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(28px, 4vw, 44px)",
  color: COLORS.brouFonce, margin: 0, marginBottom: 36, fontWeight: 400,
};
const note: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 15, lineHeight: 1.7,
  color: COLORS.brou, margin: 0, marginBottom: 40, opacity: 0.7,
};

export default function EffectsDemo() {
  return (
    <main style={pageStyle}>
      <div style={container}>
        <p style={eyebrow}>Effects sample</p>
        <h1 style={{ ...label, fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 24 }}>
          Motion échantillons.
        </h1>
        <p style={note}>
          Chaque section = un effet isolé. Prêt à être posé partout sur
          le site quand tu valides.
        </p>

        {/* 1. Magnetic button */}
        <section style={section}>
          <p style={eyebrow}>01 · Magnetic</p>
          <h2 style={label}>Le bouton s&apos;attire vers le curseur.</h2>
          <p style={note}>
            Approche le curseur du CTA — il vient à toi, le label suit avec
            un léger décalage. Idéal pour les CTA finaux.
          </p>
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <MagneticButton href="#">Begin</MagneticButton>
          </div>
        </section>

        {/* 2. Text scramble */}
        <section style={section}>
          <p style={eyebrow}>02 · Text scramble</p>
          <h2 style={label}>
            <TextScramble text="Something is being decoded." duration={1400} />
          </h2>
          <p style={note}>
            Les caractères se stabilisent lettre par lettre. Bon pour les
            eyebrows / labels courts. Trop long = illisible.
          </p>
        </section>

        {/* 3. Split text char-by-char */}
        <section style={section}>
          <p style={eyebrow}>03 · Split text</p>
          <h2 style={{ ...label, fontStyle: "italic" }}>
            <SplitTextChars text="Each letter arrives on its own beat." />
          </h2>
          <p style={note}>
            Version plus riche que BreathReveal (mot par mot). Idéal pour
            les headlines signature.
          </p>
        </section>

        {/* 4. Marquee */}
        <section style={section}>
          <p style={eyebrow}>04 · Marquee</p>
          <h2 style={label}>Bande infinie.</h2>
          <p style={note}>Défile en boucle. Pause au hover. Bon pour footer / accroches secondaires.</p>
          <div style={{
            padding: "40px 0", borderTop: `1px solid ${COLORS.rouille}55`,
            borderBottom: `1px solid ${COLORS.rouille}55`,
            fontFamily: FONTS.higuen, fontSize: 44, color: COLORS.rouille, fontStyle: "italic",
          }}>
            <Marquee text="MAISON DU CALME · SILENCE · UP TO NINETY MINUTES · " speed={45} />
          </div>
        </section>

        {/* 5. Image reveal */}
        <section style={section}>
          <p style={eyebrow}>05 · Image reveal</p>
          <h2 style={label}>Rideau qui s&apos;ouvre + zoom-out.</h2>
          <p style={note}>
            Clip-path animé + image légèrement scale-in. Effet cinéma discret,
            marche pour toutes les images éditoriales.
          </p>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <ImageReveal src="/motif-compo.jpg" alt="" aspect="4/5" />
          </div>
        </section>

        {/* 6. Parallax stack */}
        <section style={section}>
          <p style={eyebrow}>06 · Parallax</p>
          <h2 style={label}>Plans à vitesses différentes.</h2>
          <p style={note}>
            Trois mots empilés qui glissent chacun à leur rythme au scroll.
            Sous-utilisé mais très signature quand bien réglé.
          </p>
          <ParallaxStack layers={[
            { label: "silence", speed: 1.4, color: COLORS.brou, size: 80 },
            { label: "matière", speed: -0.6, color: COLORS.rouille, size: 60 },
            { label: "souffle", speed: 0.4, color: COLORS.taupe, size: 100 },
          ]} />
        </section>

        {/* 7. Fluid distortion (WebGL) */}
        <section style={section}>
          <p style={eyebrow}>07 · Fluid distortion</p>
          <h2 style={label}>Ripple sous le curseur.</h2>
          <p style={note}>
            L&apos;image se distord doucement là où passe la souris (WebGL,
            GPU pur). Signature Studio Freight — hover sur l&apos;image.
          </p>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <FluidImage src="/motif-bodhi.jpg" aspect="4/5" />
          </div>
        </section>

        {/* 8. Image marquee — bande d'images qui défile */}
        <section style={section}>
          <p style={eyebrow}>08 · Image marquee</p>
          <h2 style={label}>Bande d&apos;images infinie.</h2>
          <p style={note}>
            Défile en horizontal en boucle. Pause au hover. Signature
            Aesop / Studio Freight — bandeau de références visuelles
            sans jamais s&apos;arrêter.
          </p>
          <ImageMarquee
            speed={55}
            height={300}
            items={[
              { src: "/motif-compo.jpg", width: 240 },
              { src: "/motif-bodhi.jpg", width: 260 },
              { src: "/albatre-lisse.jpg", width: 320 },
              { src: "/motif-compo.jpg", width: 220 },
              { src: "/albatre-lisse-full.jpg", width: 300 },
              { src: "/motif-bodhi.jpg", width: 240 },
            ]}
          />
        </section>

        {/* 9. Scroll drift gallery — parallax horizontal au scroll */}
        <section style={section}>
          <p style={eyebrow}>09 · Scroll drift</p>
          <h2 style={label}>Les visuels dérivent quand tu descends.</h2>
          <p style={note}>
            Rangée d&apos;images qui glisse latéralement au fil du scroll
            vertical. L&apos;amplitude et la direction sont réglables. Test :
            scrolle lentement à travers cette section.
          </p>
          <ScrollDriftGallery
            direction="left"
            amplitude={35}
            height={340}
            items={[
              { src: "/motif-compo.jpg", width: 280 },
              { src: "/motif-bodhi.jpg", width: 300 },
              { src: "/albatre-lisse.jpg", width: 260 },
              { src: "/motif-compo.jpg", width: 320 },
              { src: "/albatre-lisse-full.jpg", width: 280 },
            ]}
          />
        </section>

        {/* 10. Cursor morph on link — indication */}
        <section style={section}>
          <p style={eyebrow}>10 · Cursor morph</p>
          <h2 style={label}>Curseur qui change de forme sur les cibles.</h2>
          <p style={note}>
            Déjà en place globalement : approche le curseur d&apos;un lien
            (comme celui-ci) — il grossit. On peut aller plus loin : morph
            en pilule, texte inversé dedans, retour au point sur mouseleave.
            <br />
            Test : <a href="#" style={{ color: COLORS.rouille }}>survole moi</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
