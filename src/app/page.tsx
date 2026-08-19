"use client";
import dynamic from "next/dynamic";
import { useIntroReady } from "@/lib/introReady";
import { COLORS, FONTS } from "@/styles/tokens";
const AlbatreHero = dynamic(() => import("@/components/AlbatreHero"), { ssr: false });

const bodyStyle: React.CSSProperties = {
  fontFamily: FONTS.prata,
  fontSize: 18,
  lineHeight: 1.75,
  color: COLORS.brou,
  margin: 0,
};
const headlineStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen,
  fontSize: "clamp(28px, 4.2vw, 46px)",
  lineHeight: 1.25,
  color: COLORS.brouFonce,
  margin: 0,
  fontWeight: 400,
};
const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONTS.prata,
  fontSize: 11,
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: COLORS.taupe,
  margin: 0,
};
const stateNumStyle: React.CSSProperties = {
  fontFamily: FONTS.higuen,
  fontSize: 14,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: COLORS.rouille,
  margin: 0,
};
const sectionStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 5,
  background: COLORS.parchemin,
  padding: "160px 8vw",
  display: "flex",
  justifyContent: "center",
};
const containerStyle: React.CSSProperties = {
  maxWidth: 640,
  width: "100%",
};

export default function Home() {
  const ready = useIntroReady();
  if (!ready) return null;
  return (
    <>
      <AlbatreHero />

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Arrival</p>
          <h1 style={{ ...headlineStyle, marginTop: 40 }}>
            For those who carry everything inside.
          </h1>
          <p style={{ ...bodyStyle, marginTop: 40 }}>
            You have handled everything. This is the one room where you don&apos;t have to.
          </p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>The five inner states</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 96, marginTop: 80 }}>
            <div>
              <p style={stateNumStyle}>One.</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                You have optimised everything.<br />
                Except the part that holds it all.
              </p>
            </div>
            <div>
              <p style={stateNumStyle}>Two.</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                The weight has no name.<br />
                It doesn&apos;t need one to be set down.
              </p>
            </div>
            <div>
              <p style={stateNumStyle}>Three.</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                Silence, when it finally comes,<br />
                is not empty. It is full of what you stopped carrying.
              </p>
            </div>
            <div>
              <p style={stateNumStyle}>Four.</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                Nothing is asked of you here.<br />
                Not your story. Not your composure.
              </p>
            </div>
            <div>
              <p style={stateNumStyle}>Five.</p>
              <p style={{ ...bodyStyle, marginTop: 20 }}>
                What returns is not new.<br />
                It is you, before the weight.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>The house</p>
          <h2 style={{ ...headlineStyle, marginTop: 40 }}>
            One house. One practitioner. Five doors.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 40 }}>
            <p style={bodyStyle}>
              Maison du Calme is a private house in London for what cannot be said aloud.
            </p>
            <p style={bodyStyle}>
              The work is done in silence, one to one, fully clothed. Sixty to ninety minutes.
              No one is named, ever — not you, not those who came before you.
            </p>
            <p style={bodyStyle}>
              You arrive carrying. You leave lighter. What happens between is felt, not explained.
            </p>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Begin</p>
          <h2 style={{ ...headlineStyle, marginTop: 40 }}>
            Something in you already knows.
          </h2>
          <p style={{ ...bodyStyle, marginTop: 40 }}>
            Entry is by conversation, not by calendar. Tell us what you carry.
          </p>
          <a
            href="/begin"
            style={{
              display: "inline-block", marginTop: 56,
              fontFamily: FONTS.prata, fontSize: 14, letterSpacing: "0.32em",
              textTransform: "uppercase", textDecoration: "none",
              color: COLORS.rouille, border: `1px solid ${COLORS.rouille}`,
              padding: "18px 44px", borderRadius: 2,
            }}
          >
            Begin
          </a>
          <p style={{ ...bodyStyle, fontSize: 13, color: COLORS.taupe, marginTop: 32, fontStyle: "italic" }}>
            No forms you dread. One question, answered in your own time.
          </p>
        </div>
      </section>
    </>
  );
}
