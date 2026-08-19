import { COLORS, FONTS } from "@/styles/tokens";

const pageStyle: React.CSSProperties = {
  background: COLORS.parchemin,
  minHeight: "100vh",
  paddingTop: 160,
  paddingBottom: 200,
};
const containerStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "0 8vw",
};
const bodyStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 18, lineHeight: 1.75, color: COLORS.brou, margin: 0,
};
const bigHeadStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(32px, 5vw, 56px)",
  lineHeight: 1.2, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
};
const sectionHeadStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: "clamp(24px, 3.4vw, 36px)",
  lineHeight: 1.25, color: COLORS.brouFonce, margin: 0, fontWeight: 400,
};
const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.28em",
  textTransform: "uppercase", color: COLORS.taupe, margin: 0,
};
const roomLabelStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen, fontSize: 22, letterSpacing: "0.36em",
  color: COLORS.rouille, margin: 0,
};
const microStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.22em",
  textTransform: "uppercase", color: COLORS.taupe, margin: 0, fontStyle: "italic",
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: COLORS.taupe, opacity: 0.28,
  border: 0, margin: "120px 0",
};

export const metadata = {
  title: "Sessions · Maison du Calme",
  description: "Four private sessions at Maison du Calme. Silent, one-to-one, fully clothed. From the ninety-minute threshold session to work offered by application only. Fees on request.",
};

export default function SessionsPage() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <p style={eyebrowStyle}>Sessions</p>
        <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>Four ways to set it down.</h1>
        <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
          Each begins the same way, in silence, fully clothed, with nothing required of you.
          Each leaves you somewhere different.
        </p>
        <p style={{ ...bodyStyle, marginTop: 40 }}>
          There is no menu here, in the way spas mean a menu. There are four rooms of work,
          chosen for you in conversation, not from a list. What they share: you are not
          touched with oil, not asked to speak, not asked to perform being well. What they
          change: the amount you are holding when you leave.
        </p>
        <p style={{ ...bodyStyle, marginTop: 24 }}>Fees are shared on request.</p>

        <hr style={dividerStyle} />

        <div>
          <p style={roomLabelStyle}>ANTARA</p>
          <p style={{ ...microStyle, marginTop: 12 }}>90 minutes · The threshold session</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            For the weight you have carried longest.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
            <p style={bodyStyle}>
              Ninety minutes for the thing underneath the other things. ANTARA is where
              most people begin, and the session they return to. It is unhurried by
              design, long enough for the body to stop bracing, and then to let go of
              what the bracing was holding.
            </p>
            <p style={bodyStyle}>
              You will not be asked what it is. The body knows where it is kept.
            </p>
            <p style={bodyStyle}>
              Most leave quieter than they have been in years. Some leave having released
              something they could not have named on the way in.
            </p>
          </div>
          <p style={{ ...microStyle, marginTop: 40 }}>Fee on request · By conversation</p>
        </div>

        <hr style={dividerStyle} />

        <div>
          <p style={roomLabelStyle}>VAYU</p>
          <p style={{ ...microStyle, marginTop: 12 }}>60 minutes · For the tightness that lives high</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            When you cannot get a full breath.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
            <p style={bodyStyle}>
              Sixty minutes for the held chest, the shallow breath, the sense of running
              slightly ahead of yourself. VAYU works with what restricts, and returns the
              breath you have been taking in halves.
            </p>
            <p style={bodyStyle}>
              You leave with more room. Not a metaphor. More room.
            </p>
          </div>
          <p style={{ ...microStyle, marginTop: 40 }}>Fee on request · By conversation</p>
        </div>

        <hr style={dividerStyle} />

        <div>
          <p style={roomLabelStyle}>SOMA</p>
          <p style={{ ...microStyle, marginTop: 12 }}>60 minutes · For what the body has stored</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            The tension you have stopped noticing.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
            <p style={bodyStyle}>
              Sixty minutes for the held body: the shoulders that no longer come down,
              the jaw, the places that have been tight so long they feel like structure.
              SOMA meets the tissue where it has settled and lets it change its mind.
            </p>
            <p style={bodyStyle}>
              You leave lower to the ground. Steadier. Returned to your own weight.
            </p>
          </div>
          <p style={{ ...microStyle, marginTop: 40 }}>Fee on request · By conversation</p>
        </div>

        <hr style={dividerStyle} />

        <div>
          <p style={roomLabelStyle}>TRANSMISSION</p>
          <p style={{ ...microStyle, marginTop: 12 }}>By application · Limited to six per client each year</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            The deepest room. Not for everyone, and not often.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
            <p style={bodyStyle}>
              TRANSMISSION is not booked. It is applied for, and it is granted rarely,
              no more than six times in a year to any one person, and to very few people
              at all.
            </p>
            <p style={bodyStyle}>
              It asks more of you and returns more. We say little about it in writing,
              and that is deliberate. Those it is for tend to recognise it before it is
              described.
            </p>
            <p style={bodyStyle}>
              If you feel it is yours, say so.
            </p>
          </div>
          <a
            href="/begin"
            style={{
              display: "inline-block", marginTop: 48,
              fontFamily: FONTS.prata, fontSize: 14, letterSpacing: "0.32em",
              textTransform: "uppercase", textDecoration: "none",
              color: COLORS.rouille, border: `1px solid ${COLORS.rouille}`,
              padding: "18px 44px", borderRadius: 2,
            }}
          >
            Apply
          </a>
        </div>

        <hr style={dividerStyle} />

        <div>
          <p style={eyebrowStyle}>The Arc</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            The work is not a single visit.
          </h2>
          <p style={{ ...bodyStyle, marginTop: 40 }}>
            What is set down once can be set down more completely across a series. The Arc
            is a sequence of sessions, taken over time, for those who would rather go all
            the way than go once. It is arranged privately, in conversation.
          </p>
          <p style={{ ...microStyle, marginTop: 40 }}>By arrangement</p>
        </div>
      </div>
    </main>
  );
}
