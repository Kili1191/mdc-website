import { COLORS, FONTS } from "@/styles/tokens";
import SplitTextChars from "@/components/effects/SplitTextChars";
import MagneticButton from "@/components/effects/MagneticButton";
import AssetFrame from "@/components/effects/AssetFrame";

const pageStyle: React.CSSProperties = {
  position: "relative", zIndex: 5, minHeight: "100vh",
  paddingTop: 160, paddingBottom: 200,
};
const containerStyle: React.CSSProperties = {
  maxWidth: 720, margin: "0 auto", padding: "48px 8vw",
  background: "rgba(237,228,208,0.28)",
  backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
  borderRadius: 2,
};
const bodyStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 18, lineHeight: 1.75, color: COLORS.brou, margin: 0,
};
const bigHeadStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(32px, 5vw, 56px)",
  lineHeight: 1.2, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
};
const sectionHeadStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(22px, 3vw, 32px)",
  lineHeight: 1.3, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
};
const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.28em",
  textTransform: "uppercase", color: COLORS.taupe, margin: 0,
};
const linkStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 13, letterSpacing: "0.24em",
  textTransform: "uppercase", color: COLORS.rouille, textDecoration: "none",
  borderBottom: `1px solid ${COLORS.rouille}`, paddingBottom: 4,
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: COLORS.taupe, opacity: 0.28, border: 0, margin: "96px 0",
};

export const metadata = {
  title: "Practitioner · Maison du Calme",
  description: "Kilian, the sole practitioner of Maison du Calme. Years of study at the source, in India, teacher to student. Every session is his. No client is ever named.",
};

export default function PractitionerPage() {
  return (
    <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Practitioner</p>
          <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>
            <SplitTextChars text="Kilian." delay={22} duration={900} />
          </h1>
          <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
            One practitioner. Every session, his. Nothing here is delivered by staff.
          </p>

          <div style={{ maxWidth: 380, margin: "56px auto 8px" }}>
            <AssetFrame slot="PT-01" kind="image" src="/photos/pt-01.jpg" aspect="4/5" effect="fluid"
              prompt="Silhouette or hands of Kilian, warm ambient light, Aube Encens palette, discreet fine art." />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 64 }}>
            <p style={bodyStyle}>
              There is no team behind a curtain. The person you meet is the person who
              spent years training to meet you, and the only person who will.
            </p>
            <p style={bodyStyle}>
              Kilian did not arrive at this work through a weekend or a certificate. He
              went to the sources, to the places where these traditions are still passed
              from one person to the next, in person, over years, the way they have always
              been passed. He learned them where they are lived, not where they are
              marketed. Some of what he carries came from teachers who accepted very few
              students. Some of it took years before he was permitted to practise it at all.
            </p>
            <p style={bodyStyle}>
              He does not talk about any of this while he works. He does not talk at all.
              That is the point of it.
            </p>
            <p style={bodyStyle}>
              What he brings to the room is not a method you could read about. It is the
              accumulation of a life spent learning to be present with what other people
              cannot hold, and the restraint to do less, more precisely, than someone with
              half the training would.
            </p>
            <p style={bodyStyle}>
              The shape of it is on the next page: the places, the line, the way it was
              passed. Read it if you need to. Most people, once they have sat with the
              work, do not.
            </p>
          </div>

          <div style={{ marginTop: 56, display: "flex", justifyContent: "center" }}>
            <MagneticButton href="/lineage">See the lineage</MagneticButton>
          </div>

          <hr style={dividerStyle} />

          <p style={{
            fontFamily: "var(--font-great-vibes), cursive",
            fontSize: "clamp(38px, 6vw, 62px)",
            lineHeight: 1.2,
            color: COLORS.brouFonce,
            margin: 0,
            textAlign: "center",
          }}>
            I don&apos;t fix anyone. Nothing is broken.
          </p>

          <hr style={dividerStyle} />

          {/* Ce que Kilian enseigne. Le fait marquant n'est pas la maitrise,
              c'est le refus : habilite a enseigner tous les niveaux, il n'en
              enseigne qu'un. Cette maison est batie sur des refus, la forme de
              preuve qu'elle sait deja porter. */}
          <p style={eyebrowStyle}>What he teaches</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            He teaches the first level only.
          </h2>
          <p style={{ ...bodyStyle, marginTop: 32 }}>
            He is a Reiki master, qualified to teach every level. He teaches the
            first, and stops there.
          </p>
          <p style={{ ...bodyStyle, marginTop: 24 }}>
            The first level is the one you keep for yourself: the hand positions,
            the attunements, and the practice of laying them on your own body
            before anyone else&apos;s. It is taught in person, and rarely.
          </p>

          <hr style={dividerStyle} />

          {/* Le coaching n'a pas la promesse de la maison. Il est nomme sans
              etre installe au meme etage : la maison reste silencieuse. */}
          <p style={eyebrowStyle}>The other door</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            Some people arrive needing to speak.
          </h2>
          <p style={{ ...bodyStyle, marginTop: 32 }}>
            That work happens in conversation, and it is arranged separately. It
            is not the house, and it is not silent. Ask, and you will be told
            whether it is the right door.
          </p>

          <hr style={dividerStyle} />

          <p style={eyebrowStyle}>Discretion</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            <SplitTextChars text="No one is named. This is not a policy. It is the product." delay={22} duration={900} />
          </h2>
          <p style={{ ...bodyStyle, marginTop: 40 }}>
            No client is ever named, referenced, or implied. Not on this site, not in
            conversation, not to another client, not ever. Discretion at this level is not
            a promise we make. It is a condition we work inside. If you are the kind of
            person for whom that matters, you already understand why it is the first thing
            we say and the last.
          </p>
      </div>
    </main>
  );
}
