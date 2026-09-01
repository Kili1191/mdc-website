import { COLORS } from "@/styles/tokens";
import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";
import ScrollDriftGallery from "@/components/effects/ScrollDriftGallery";

// Retreats — une seule offre, et beaucoup de choses qu'elle n'est pas.
//
// La page tient sur un refus : « ce n'est pas un sejour bien-etre ». Il etait
// en bas, apres un filet, en petit et en italique — c'est-a-dire a l'endroit
// exact ou personne ne lit. Or c'est precisement ce refus qui qualifie le
// visiteur : celui qui cherche un programme s'en va, celui qui cherche autre
// chose reconnait la maison.
//
// Il passe donc au meme rang que la promesse, en vis-a-vis, et il n'est plus
// ecrit en taupe italique.

export const metadata = {
  title: "Retreats · Maison du Calme",
  description: "One private retreat from Maison du Calme. Small, rare, by application. The work given days instead of minutes. No fixed dates. Register interest.",
};

export default function RetreatsPage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Retreats</p>
        <h1 style={{ ...bigHead, marginTop: 36, maxWidth: "16ch" }}>
          <SplitTextChars text="Once a year. Very few people. Somewhere quiet." delay={22} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          The work, given room and time it cannot have in a single afternoon in London.
        </p>

        <div style={{ marginTop: 72 }}>
          <AssetFrame slot="RT-01" kind="image" src="/photos/rt-01.jpg" aspect="21/9" effect="reveal"
            prompt="Carved onyx, a wide panorama, light settling at the centre." />
        </div>

        <section className="mdc-gap--sm mdc-two">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <p style={body}>
              There is one retreat. It is small, small enough that it is arranged around
              the people in it, not the other way round. It happens rarely, in a place
              chosen for its silence, and it is offered by application only.
            </p>
            <p style={body}>
              We are not ready to say where, or when, and we will not promise a date we
              might have to move. What we will say is this: it is the same work,
              uninterrupted, over days instead of minutes. And for the few who have gone
              all the way in a single session, it is the natural next thing.
            </p>
            <p style={micro}>By application · No fixed dates</p>
          </div>

          {/* Le refus, remonte au rang de la promesse. En bas de page et en
              taupe italique, il ne qualifiait personne. */}
          <div>
            <p style={eyebrow}>What it is not</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              This is not a wellness holiday.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              There is no programme, no schedule of activities, no group of strangers.
              If that is what you are looking for, this is not it, and we would rather
              say so.
            </p>
          </div>
        </section>

        <section className="mdc-gap--sm">
          <p style={{ ...body, color: COLORS.brouFonce }}>
            If you would like to be told when it opens, tell us. Nothing more is asked
            of you now.
          </p>
          <div style={{ marginTop: 40 }}>
            <QuietButton href="/begin">Register interest</QuietButton>
          </div>
        </section>
      </div>

      <div style={{ marginTop: 180, position: "relative", zIndex: 5 }}>
        <ScrollDriftGallery
          direction="right"
          amplitude={28}
          height={420}
          gap={28}
          fluid
          items={[
            { src: "/photos/rt-01.jpg", width: 380, alt: "" },
            { src: "/photos/lp-02.jpg", width: 300, alt: "" },
            { src: "/photos/si-02.jpg", width: 340, alt: "" },
          ]}
        />
      </div>
    </main>
  );
}
