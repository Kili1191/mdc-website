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
const essayTitleStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(22px, 3vw, 32px)",
  lineHeight: 1.3, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
};
const essayNumStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.32em",
  textTransform: "uppercase", color: COLORS.rouille, margin: 0,
};
const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.28em",
  textTransform: "uppercase", color: COLORS.taupe, margin: 0,
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: COLORS.taupe, opacity: 0.28, border: 0, margin: "112px 0",
};

export const metadata = {
  title: "Notes · Maison du Calme",
  description: "Notes from Maison du Calme. One long essay a month by Kilian, on weight, silence, and what the body keeps. Written to be read slowly. Nothing is being sold.",
};

export default function NotesPage() {
  return (
    <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Notes</p>
          <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>Notes.</h1>
          <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
            A long piece, once a month. Nothing to scroll past. Written to be read slowly,
            or not at all.
          </p>

          <p style={{ ...bodyStyle, marginTop: 40 }}>
            There is no feed here, and no schedule of small posts. Once a month there is a
            single essay, on the things this work sits closest to: weight, silence, what
            the body keeps, and the particular tiredness of people who hold everything
            together. They are written by Kilian, in the quiet between sessions. You can
            read them or leave them. Nothing is being sold in them.
          </p>

          <hr style={dividerStyle} />

          <p style={essayNumStyle}>Essay 01</p>
          <h2 style={{ ...essayTitleStyle, marginTop: 20 }}>On carrying.</h2>
          <p style={{ ...bodyStyle, marginTop: 32 }}>
            Everyone you know is carrying something they have decided not to mention. The
            most capable people carry the most, and mention it least, it is often the
            reason they became capable. This first Note is about the weight that has no
            name and files under nothing: not grief exactly, not stress exactly, just the
            accumulated load of being the one who copes. What it costs to hold it. What
            it costs more to keep pretending you aren&apos;t. And what happens, physically,
            in the hour you finally stop.
          </p>

          <hr style={dividerStyle} />

          <p style={essayNumStyle}>Essay 02</p>
          <h2 style={{ ...essayTitleStyle, marginTop: 20 }}>
            The difference between quiet and silence.
          </h2>
          <p style={{ ...bodyStyle, marginTop: 32 }}>
            Quiet is the absence of noise. Silence is something else, a fuller thing,
            harder to reach, and increasingly rare. This Note is about why the people
            with the most sophisticated lives have the least access to real silence, why
            the mind resists it at first, and why the body, given enough of it, will do
            on its own what no amount of effort can force. A piece about doing less, and
            the strange difficulty of it.
          </p>

          <hr style={dividerStyle} />

          <p style={essayNumStyle}>Essay 03</p>
          <h2 style={{ ...essayTitleStyle, marginTop: 20 }}>What the body keeps.</h2>
          <p style={{ ...bodyStyle, marginTop: 32 }}>
            You forget on purpose; the body does not. It keeps a record: in the shoulders
            that never come down, the breath taken in halves, the jaw held through a
            decade of composure. This Note is about that record: how it is written, why
            it does not respond to being reasoned with, and how it is finally released,
            not by understanding it, but by being somewhere safe enough to stop guarding
            it. Written for people who have tried thinking their way out and found the
            thinking was part of the problem.
          </p>
      </div>
    </main>
  );
}
