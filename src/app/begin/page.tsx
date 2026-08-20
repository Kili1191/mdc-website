import BeginForm from "./BeginForm";
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
const questionStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(36px, 6vw, 64px)",
  lineHeight: 1.15, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
  textAlign: "center",
};
const microStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 13, lineHeight: 1.7,
  color: COLORS.taupe, margin: 0, fontStyle: "italic",
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: COLORS.taupe, opacity: 0.28, border: 0, margin: "96px 0",
};

export const metadata = {
  title: "Begin · Maison du Calme",
  description: "Begin with Maison du Calme. Not a booking, a conversation. Tell us what you carry. Read by Kilian alone, held in confidence, never shared.",
};

export default function BeginPage() {
  return (
    <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Begin</p>
          <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>Begin.</h1>
          <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
            There is no booking calendar. There is a conversation. It starts with one
            question.
          </p>

          <div style={{ marginTop: 96, marginBottom: 56 }}>
            <p style={questionStyle}>What do you carry?</p>
          </div>

          <p style={{ ...bodyStyle }}>
            Answer in a sentence or in a page, however it comes. There is no right way to
            say it, and no one but Kilian will read it. This is not a form to be
            processed. It is the beginning of the only kind of conversation this work
            starts with.
          </p>

          <BeginForm />

          <p style={{ ...microStyle, marginTop: 40 }}>
            Read by Kilian alone. Answered personally, within two working days. Held in
            confidence. Never shared, never named.
          </p>

          <hr style={dividerStyle} />

          <h2 style={sectionHeadStyle}>What happens next.</h2>
          <p style={{ ...bodyStyle, marginTop: 40 }}>
            Kilian reads it himself. If the work is right for you, he will say so and
            propose a time. If it is not, he will say that too, plainly, and point you
            somewhere better. Either way, you will hear from a person, not a system.
          </p>

          <hr style={dividerStyle} />

          <p style={{ ...bodyStyle, color: COLORS.taupe, fontStyle: "italic" }}>
            What you write here is read by Kilian alone and held privately. It is never
            shared, never shown, and no client is ever named. What you carry stays yours.
          </p>
      </div>
    </main>
  );
}
