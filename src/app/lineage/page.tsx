import MarbleBackground from "@/components/MarbleBackground";
import { COLORS, FONTS } from "@/styles/tokens";

const pageStyle: React.CSSProperties = {
  position: "relative", zIndex: 5, minHeight: "100vh",
  paddingTop: 160, paddingBottom: 200,
};
const containerStyle: React.CSSProperties = {
  maxWidth: 720, margin: "0 auto", padding: "48px 8vw",
  background: "rgba(237,228,208,0.82)",
  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
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
const placeLabelStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: 15, letterSpacing: "0.3em",
  color: COLORS.rouille, margin: 0, textTransform: "uppercase",
};
const microStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 13, color: COLORS.taupe,
  margin: 0, fontStyle: "italic",
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: COLORS.taupe, opacity: 0.28, border: 0, margin: "96px 0",
};

export const metadata = {
  title: "Lineage · Maison du Calme",
  description: "Where the work of Maison du Calme comes from. Transmission at the source, in North India and the Himalaya, held in the same confidence as everything else here.",
};

export default function LineagePage() {
  return (
    <>
      <MarbleBackground motif="/motif-bodhi.jpg" />
      <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Lineage</p>
          <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>Where the work comes from.</h1>
          <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
            Learned at the source. Named to no one, for the same reason you are named to no one.
          </p>
          <p style={{ ...bodyStyle, marginTop: 40 }}>
            The traditions behind this work were learned in person, in the places where
            they are still passed from one person to the next, slowly, selectively, the
            way they have always been passed. We will tell you where it happened and how
            it was passed. We will not tell you from whom. The people who taught Kilian
            did not teach him so their names could be traded on a website, and what
            protects them is the same thing that protects you: here, nothing that matters
            is ever named.
          </p>

          <hr style={dividerStyle} />

          <p style={eyebrowStyle}>The line</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 72, marginTop: 64 }}>
            <div>
              <p style={placeLabelStyle}>North India · Rishikesh</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                Learned at the source, in person, one student at a time, in a town the
                world visits for a week and Kilian did not.
              </p>
            </div>
            <div>
              <p style={placeLabelStyle}>The Himalaya · Dharamshala</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                Where the deeper part of the transmission was entrusted. Among what he
                carries from there: a line unbroken for eight generations, passed teacher
                to student, never in a classroom.
              </p>
            </div>
            <div>
              <p style={placeLabelStyle}>London</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                Private practice, built the way the work itself is built, one person at a
                time, by introduction.
              </p>
            </div>
          </div>

          <hr style={dividerStyle} />

          <h2 style={sectionHeadStyle}>Why no names, no dates.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
            <p style={bodyStyle}>
              Because a lineage is not a marketing asset, and the people in it are not
              references to be called. Because what was entrusted in confidence should
              not be searchable. And because you would not want to be listed on
              someone&apos;s website either.
            </p>
            <p style={bodyStyle}>
              What can be verified is this: the places are real, the transmission is real,
              and the formal attestations exist. Held privately, shown where it is
              genuinely warranted, never published. What cannot be copied is also the
              point: a weekend produces a certificate. An unbroken line, passed one
              student at a time across eight generations, produces something else, and
              you will feel the difference before you can explain it.
            </p>
          </div>

          <p style={{ ...microStyle, marginTop: 48 }}>
            If it matters to you, ask in person. <a href="/begin" style={{ color: COLORS.rouille, textDecoration: "none", borderBottom: `1px solid ${COLORS.rouille}`, paddingBottom: 2 }}>Contact</a>
          </p>
        </div>
      </main>
    </>
  );
}
