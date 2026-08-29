import { COLORS, FONTS } from "@/styles/tokens";
import SplitTextChars from "@/components/effects/SplitTextChars";
import MagneticButton from "@/components/effects/MagneticButton";
import AssetFrame from "@/components/effects/AssetFrame";
import ScrollDriftGallery from "@/components/effects/ScrollDriftGallery";

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
const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.28em",
  textTransform: "uppercase", color: COLORS.taupe, margin: 0,
};
const refusalStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 15, lineHeight: 1.7,
  color: COLORS.taupe, margin: 0, fontStyle: "italic",
};
const dividerStyle: React.CSSProperties = {
  height: 1, background: COLORS.taupe, opacity: 0.28, border: 0, margin: "96px 0",
};

export const metadata = {
  title: "Retreats · Maison du Calme",
  description: "One private retreat from Maison du Calme. Small, rare, by application. The work given days instead of minutes. No fixed dates. Register interest.",
};

export default function RetreatsPage() {
  return (
    <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Retreats</p>
          <h1 style={{ ...bigHeadStyle, marginTop: 40 }}>
            <SplitTextChars text="Once a year. Very few people. Somewhere quiet." delay={22} duration={900} />
          </h1>
          <div style={{ maxWidth: 640, margin: "48px auto 0" }}>
            <AssetFrame slot="RT-01" kind="image" src="/photos/rt-01.jpg" aspect="21/9" effect="reveal"
              prompt="Vast quiet interior of old stone house, sourceless warm light pooling on floor, faded parchemin walls, one low bench, Sugimoto Theaters meets Turrell." />
          </div>
          <p style={{ ...bodyStyle, marginTop: 40, fontSize: 20, color: COLORS.brouFonce }}>
            The work, given room and time it cannot have in a single afternoon in London.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 64 }}>
            <p style={bodyStyle}>
              There is one retreat. It is small, small enough that it is arranged around
              the people in it, not the other way round. It happens rarely, in a place
              chosen for its silence, and it is offered by application only.
            </p>
            <p style={bodyStyle}>
              We are not ready to say where, or when, and we will not promise a date we
              might have to move. What we will say is this: it is the same work,
              uninterrupted, over days instead of minutes. And for the few who have gone
              all the way in a single session, it is the natural next thing.
            </p>
            <p style={bodyStyle}>
              If you would like to be told when it opens, tell us. Nothing more is asked
              of you now.
            </p>
          </div>

          <div style={{ marginTop: 56, display: "flex", justifyContent: "center" }}>
            <MagneticButton href="/begin">Register interest</MagneticButton>
          </div>

          <hr style={dividerStyle} />

          <p style={refusalStyle}>
            This is not a wellness holiday. There is no programme, no schedule of
            activities, no group of strangers. If that is what you are looking for, this
            is not it, and we would rather say so.
          </p>
      </div>

      {/* Bandeau atmosphérique retreat, drift + fluid distortion */}
      <div style={{ marginTop: 160, position: "relative", zIndex: 5 }}>
        <ScrollDriftGallery
          direction="right"
          amplitude={28}
          height={420}
          gap={28}
          fluid
          items={[
            { src: "/photos/rt-01.jpg", width: 380, alt: "" },
            { src: "/photos/lp-02.jpg", width: 300, alt: "" },
            { src: "/photos/rt-01.jpg", width: 340, alt: "" },
          ]}
        />
      </div>
    </main>
  );
}
