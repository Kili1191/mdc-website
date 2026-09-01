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
              the people in it, not the other way round. It happens rarely, and it is
              offered by application only.
            </p>
            {/* COPY NOUVELLE — a valider.
                L'ancien texte disait « nous ne sommes pas prets a dire ou ni
                quand » : ca se lit comme un projet mal ficele, pas comme de la
                rigueur. Kilian a donne le vrai critere — l'Asie, chaud et loin,
                mais rejete des que ca klaxonne — et ce critere est bien plus
                fort que n'importe quelle destination. Toutes les retraites
                choisissent la villa photogenique ; celle-ci choisit le silence,
                et n'a pas encore trouve. L'absence de lieu devient la preuve du
                serieux au lieu d'en etre le contraire.
                Ce qui reste INTERNE et n'a rien a faire ici : « cheap to
                operate ». C'est de l'economie, pas une promesse. */}
            <p style={body}>
              It will be far, and warm — the kind of distance that makes the return
              flight feel like a decision rather than a commute. Asia, most likely.
            </p>
            <p style={body}>
              The place is not chosen for how it photographs. It is chosen for what you
              cannot hear from the room. Most of the beautiful ones fail that test: an
              ocean in front and a road behind it is not silence, and one horn at six in
              the morning undoes a week. We have not named a place yet because we have
              not found one quiet enough.
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

        {/* COPY NOUVELLE — a valider.
            Le point que Kilian voulait et que la page ne disait pas : ce n'est
            pas un sejour, c'est une COUPURE. Le meme travail sur des jours au
            lieu de minutes, et surtout une vie quotidienne mise a distance
            assez longtemps pour cesser de decider a votre place. */}
        <section className="mdc-gap--sm mdc-two">
          <div>
            <p style={eyebrow}>What it is for</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              Long enough to stop being reachable.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <p style={body}>
              A session gives the body an hour where nothing is required of it. Days give
              it something else. The first day is spent putting down the phone. The second
              is spent noticing how much of you was running the phone. What happens after
              that is the reason to go.
            </p>
            <p style={body}>
              It is the same work, uninterrupted, over days instead of minutes — and for
              the few who have gone all the way in a single session, it is the natural next
              thing. Not a break from your life. A distance from it, long enough to hear
              yourself over it.
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
