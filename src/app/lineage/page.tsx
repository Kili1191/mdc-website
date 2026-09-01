import { pageStyle, body, lead, bigHead, eyebrow, micro, label } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import AssetFrame from "@/components/effects/AssetFrame";

// Lineage — la page qui remplace les certificats.
//
// Son argument le plus fort est un refus : « nous vous dirons ou, et comment
// cela s'est transmis ; nous ne vous dirons pas de qui ». La page mettait cet
// argument dans un paragraphe au milieu d'un bloc de texte, puis alignait les
// deux lieux l'un sous l'autre, images centrees a 360 px.
//
// Deux lieux, deux doubles pages qui alternent. Et le refus devient une ligne
// mise en avant : c'est la seule preuve que cette maison accepte de donner.

export const metadata = {
  title: "Lineage · Maison du Calme",
  description: "Where the work of Maison du Calme comes from. Learned in person, at the source, in North India and the Himalaya. We will tell you where and how it was passed. We will not tell you from whom.",
};

export default function LineagePage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Lineage</p>
        <h1 style={{ ...bigHead, marginTop: 36 }}>
          <SplitTextChars text="Where the work comes from." delay={22} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          Learned at the source. Named to no one, for the same reason you are named to no one.
        </p>

        <div className="mdc-measure" style={{ marginTop: 44 }}>
          <p style={body}>
            The traditions behind this work were learned in person, in the places where
            they are still passed from one person to the next, slowly, selectively, the
            way they have always been passed.
          </p>
        </div>

        {/* Le refus, sorti du paragraphe. C'est la seule preuve que cette
            maison accepte de donner, et elle etait noyee au milieu du bloc. */}
        <p style={{
          ...bigHead, marginTop: 72, maxWidth: "20ch",
          fontSize: "clamp(26px, 3.4vw, 40px)", lineHeight: 1.25,
        }}>
          We will tell you where it happened and how it was passed. We will not tell you
          from whom.
        </p>

        <div className="mdc-measure" style={{ marginTop: 48 }}>
          <p style={body}>
            The people who taught Kilian did not teach him so their names could be traded
            on a website, and what protects them is the same thing that protects you:
            here, nothing that matters is ever named.
          </p>
        </div>

        <p style={{ ...eyebrow, marginTop: 140 }}>The line</p>

        <section className="mdc-room" style={{ marginTop: 56 }}>
          <div className="mdc-room__art">
            <AssetFrame slot="LP-01" kind="image" src="/photos/lp-01.jpg" aspect="3/4" effect="reveal"
              prompt="Carved onyx, a vertical frame, light falling from above." />
          </div>
          <div>
            <p className="mdc-num">01</p>
            <p style={{ ...label, fontSize: 20, letterSpacing: "0.26em" }}>NORTH INDIA</p>
            <p style={{ ...micro, marginTop: 14 }}>Rishikesh</p>
            <p style={{ ...body, marginTop: 30 }}>
              Learned at the source, in person, one student at a time, in a town the
              world visits for a week and Kilian did not.
            </p>
          </div>
        </section>

        <section className="mdc-room mdc-room--flip">
          <div className="mdc-room__art">
            <AssetFrame slot="LP-02" kind="image" src="/photos/lp-02.jpg" aspect="3/4" effect="reveal"
              prompt="Carved onyx, a single form held against an empty field." />
          </div>
          <div>
            <p className="mdc-num">02</p>
            <p style={{ ...label, fontSize: 20, letterSpacing: "0.26em" }}>THE HIMALAYA</p>
            <p style={{ ...micro, marginTop: 14 }}>Dharamshala</p>
            <p style={{ ...body, marginTop: 30 }}>
              Where the deeper part of the transmission was entrusted. Among what he
              carries from there: a line unbroken for eight generations, passed teacher
              to student, never in a classroom.
            </p>
            <p style={{ ...micro, marginTop: 30 }}>Eight generations · Never in a classroom</p>
          </div>
        </section>
      </div>
    </main>
  );
}
