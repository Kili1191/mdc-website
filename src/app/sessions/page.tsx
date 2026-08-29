import { COLORS, FONTS } from "@/styles/tokens";
import SplitTextChars from "@/components/effects/SplitTextChars";
import MagneticButton from "@/components/effects/MagneticButton";
import AssetFrame from "@/components/effects/AssetFrame";
import ScrollDriftGallery from "@/components/effects/ScrollDriftGallery";

const pageStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 5,
  minHeight: "100vh",
  paddingTop: 160,
  paddingBottom: 200,
};
const containerStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px 8vw",
  background: "rgba(237,228,208,0.28)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
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
  description: "A sequence of private sessions at Maison du Calme, beginning with ANTARA. Silent, one-to-one, fully clothed. From the ninety-minute threshold session to work offered by application only. Fees on request.",
};

export default function SessionsPage() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <p style={eyebrowStyle}>Sessions</p>
        <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>
          <SplitTextChars text="It begins with ANTARA." delay={22} duration={900} />
        </h1>
        <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
          Each begins the same way, in silence, fully clothed, with nothing required of you.
          Each leaves you somewhere different.
        </p>
        <p style={{ ...bodyStyle, marginTop: 40 }}>
          The work practised here is called NERVANA. Kilian developed it, and it is
          practised nowhere else.
        </p>
        <p style={{ ...bodyStyle, marginTop: 24 }}>
          It is a suite, not a selection. ANTARA is the entrance. Everyone passes
          through it, and what lies beyond opens in its own order, in conversation,
          never from a list. What they share: you are not touched with oil, not asked
          to speak, not asked to perform being well. What they change: the amount you
          are holding when you leave.
        </p>
        <p style={{ ...bodyStyle, marginTop: 24 }}>Fees are shared on request.</p>

        <hr style={dividerStyle} />

        <div>
          <p style={roomLabelStyle}>ANTARA</p>
          <p style={{ ...microStyle, marginTop: 12 }}>90 minutes · The threshold session</p>
          <div style={{ margin: "32px auto", maxWidth: 460 }}>
            <AssetFrame slot="SI-01" kind="image" src="/photos/si-01.jpg" aspect="4/5" effect="reveal"
              prompt="Warm low platform bed in cream linen, sourceless warm ambient light, empty threshold room, Aube Encens." />
          </div>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            For the weight you have carried longest.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
            <p style={bodyStyle}>
              Ninety minutes for the thing underneath the other things. ANTARA is the
              entrance, and the session they return to. It is unhurried by
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
          <div style={{ marginTop: 48 }}>
            <MagneticButton href="/begin">Apply</MagneticButton>
          </div>
        </div>

        <hr style={dividerStyle} />

        {/* Les soins ayurvediques vivent APRES la suite et hors d'elle. NERVANA
            promet "not touched with oil" : Abhyanga est un soin a l'huile, il ne
            peut pas etre dans la meme promesse. Separer les deux protege la
            phrase et la verite. */}
        <div>
          <p style={eyebrowStyle}>Also practised here</p>
          <h2 style={{ ...sectionHeadStyle, marginTop: 32 }}>
            Older than the house.
          </h2>
          <p style={{ ...bodyStyle, marginTop: 32 }}>
            Three practices are offered apart from the suite. They are not part of
            NERVANA, and they are not silent in the same way.
          </p>

          <p style={{ ...roomLabelStyle, marginTop: 48 }}>ABHYANGA</p>
          <p style={{ ...bodyStyle, marginTop: 20 }}>
            Warm oil, worked over the whole body in one unbroken rhythm. It is the
            oldest practice in this house, and the only one that uses oil.
          </p>

          <p style={{ ...roomLabelStyle, marginTop: 40 }}>MARMA</p>
          <p style={{ ...bodyStyle, marginTop: 20 }}>
            The junctions where the body gathers what it holds. Marma work is
            pressure and stillness at those points, slower than massage and more
            deliberate.
          </p>

          <p style={{ ...roomLabelStyle, marginTop: 40 }}>SOUND</p>
          <p style={{ ...bodyStyle, marginTop: 20 }}>
            Bowls set directly on the body and struck softly, so the tone arrives
            through the body before it reaches the ear. Fully clothed, face down,
            then turned. It is the only work here you will hear.
          </p>
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

      {/* Bandeau atmosphérique — les 4 salles qui dérivent horizontalement
          au scroll, chaque image en distorsion fluide sous le curseur */}
      <div style={{ marginTop: 160, position: "relative", zIndex: 5 }}>
        <ScrollDriftGallery
          direction="left"
          amplitude={30}
          height={420}
          gap={32}
          fluid
          items={[
            { src: "/photos/si-01.jpg", width: 300, alt: "" },
            { src: "/photos/si-02.jpg", width: 340, alt: "" },
            { src: "/photos/si-03.jpg", width: 300, alt: "" },
            { src: "/photos/si-04.jpg", width: 340, alt: "" },
          ]}
        />
      </div>
    </main>
  );
}
