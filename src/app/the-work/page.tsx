import { COLORS, FONTS } from "@/styles/tokens";
import SplitTextChars from "@/components/effects/SplitTextChars";
import MagneticButton from "@/components/effects/MagneticButton";

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
const pullQuoteStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(22px, 2.8vw, 28px)",
  lineHeight: 1.4, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
  fontStyle: "italic",
  borderLeft: `2px solid ${COLORS.rouille}`,
  paddingLeft: 32,
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: COLORS.taupe, opacity: 0.28, border: 0, margin: "96px 0",
};

export const metadata = {
  title: "The Work · Maison du Calme",
  description: "What actually happens at Maison du Calme. An honest account of the silent, fully-clothed session, told in what you feel, not how it is done. Sixty to ninety minutes. You leave lighter.",
};

export default function TheWorkPage() {
  return (
    <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>The Work</p>
          <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>
            <SplitTextChars text="What actually happens." delay={22} duration={900} />
          </h1>
          <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
            A fair question. Here is an honest answer that gives away nothing, because the
            giving-away is not the point.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 64 }}>
            <p style={bodyStyle}>
              You arrive. You are not asked how you are, because you would answer the way
              you always answer, and that answer is the thing we are here to get underneath.
            </p>
            <p style={bodyStyle}>
              You lie down, dressed. The room is quiet, and it stays quiet. Nothing is
              done <em>to</em> you in the way that word usually means. There is no oil, no
              conversation, no performance of relaxation. For a while, not much seems to
              be happening at all.
            </p>
            <p style={bodyStyle}>Then something does.</p>
            <p style={bodyStyle}>
              The body, given a room where nothing is required of it, does what it has not
              had permission to do. It stops holding. First the obvious places. Then
              places you did not know were holding. Somewhere in the sixty or ninety
              minutes, the bracing you have mistaken for yourself lets go, and underneath
              it is a quiet you may not have felt in years.
            </p>
            <p style={bodyStyle}>
              Sometimes what surfaces is only rest, very deep. Sometimes it is more than
              that: something long carried, finally set down, occasionally with tears you
              did not plan and will not be embarrassed about, because no one is watching
              and no one will ever know.
            </p>
            <p style={bodyStyle}>
              You leave lower, slower, and lighter. Most people are quiet for the rest of
              the day. The change is not dramatic and it is not marketing. It is the
              specific relief of putting down a weight you had stopped noticing you held.
            </p>
          </div>

          <hr style={dividerStyle} />

          <blockquote style={pullQuoteStyle}>
            <SplitTextChars
              text="We will tell you what you will feel. We will never tell you how. The how is years of training, and it is the reason the feeling is reliable."
              delay={22} duration={900}
            />
          </blockquote>

          <hr style={dividerStyle} />

          <h2 style={sectionHeadStyle}>What it is not.</h2>
          <p style={{ ...bodyStyle, marginTop: 40 }}>
            It is not massage. It is not therapy, and it is not a substitute for it. It is
            not religion, and it asks you to believe nothing. It is not a treatment for an
            illness, and it makes no medical claim. It is not for everyone, and we will
            tell you honestly if it is not for you.
          </p>

          <div style={{ marginTop: 56 }}>
            <MagneticButton href="/begin">Begin</MagneticButton>
          </div>
      </div>
    </main>
  );
}
