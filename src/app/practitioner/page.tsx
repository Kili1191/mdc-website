import { COLORS, FONTS } from "@/styles/tokens";
import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";

// Practitioner — la page ou l'on decide de faire confiance a quelqu'un.
//
// Elle etait une colonne : le portrait en petit au milieu du texte, puis cinq
// paragraphes, puis quatre filets <hr> separant quatre sections de meme poids.
// Rien ne disait ce qui compte.
//
// Ce qui compte ici est un REFUS : maitre Reiki habilite a enseigner tous les
// niveaux, il n'enseigne que le premier. Une maison batie sur des refus n'a pas
// besoin de certificats — mais encore faut-il que le refus se voie. Il a
// maintenant sa propre colonne, a cote de l'autre porte, plutot que d'etre le
// troisieme bloc apres un filet.
//
// L'image passe de `fluid` a `reveal` : FluidImage ouvre son propre contexte
// WebGL, ce qui faisait deux contextes sur la page en comptant le marbre. Un
// seul portrait ne vaut pas un second GPU sur telephone.

export const metadata = {
  title: "Practitioner · Maison du Calme",
  description: "Kilian, the sole practitioner of Maison du Calme. Years of study at the source, in India, teacher to student. Every session is his. No client is ever named.",
};

export default function PractitionerPage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Practitioner</p>
        <h1 style={{ ...bigHead, marginTop: 36 }}>
          <SplitTextChars text="Kilian." delay={22} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          One practitioner. Every session, his. Nothing here is delivered by staff.
        </p>

        <section className="mdc-room">
          <div className="mdc-room__art">
            <AssetFrame slot="PT-01" kind="image" src="/photos/pt-01.jpg" aspect="4/5" effect="reveal"
              prompt="The house engraved in the stone — the practitioner's mark." />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <p style={body}>
              There is no team behind a curtain. The person you meet is the person who
              spent years training to meet you, and the only person who will.
            </p>
            <p style={body}>
              Kilian did not arrive at this work through a weekend or a certificate. He
              went to the sources, to the places where these traditions are still passed
              from one person to the next, in person, over years, the way they have always
              been passed. He learned them where they are lived, not where they are
              marketed. Some of what he carries came from teachers who accepted very few
              students. Some of it took years before he was permitted to practise it at all.
            </p>
            <p style={body}>
              He does not talk about any of this while he works. He does not talk at all.
              That is the point of it.
            </p>
          </div>
        </section>

        <section className="mdc-gap--sm" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <p style={body}>
            What he brings to the room is not a method you could read about. It is the
            accumulation of a life spent learning to be present with what other people
            cannot hold, and the restraint to do less, more precisely, than someone with
            half the training would.
          </p>
          <p style={body}>
            The shape of it is on the next page: the places, the line, the way it was
            passed. Read it if you need to. Most people, once they have sat with the
            work, do not.
          </p>
          <div style={{ marginTop: 22 }}>
            <QuietButton href="/lineage">See the lineage</QuietButton>
          </div>
        </section>

        <p className="mdc-gap" style={{
          fontFamily: FONTS.greatVibes,
          fontSize: "clamp(38px, 6.4vw, 68px)",
          lineHeight: 1.2,
          color: COLORS.brouFonce,
          margin: "0 auto",
          maxWidth: "16ch",
          textAlign: "center",
        }}>
          I don&apos;t fix anyone. Nothing is broken.
        </p>

        {/* Le refus et l'autre porte tiennent cote a cote : ce sont les deux
            choses qu'on n'attend pas d'un praticien, et elles se repondent. */}
        <section className="mdc-gap mdc-two">
          <div>
            <p style={eyebrow}>What he teaches</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              He teaches the first level only.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              He is a Reiki master, qualified to teach every level. He teaches the
              first, and stops there.
            </p>
            <p style={{ ...body, marginTop: 22 }}>
              The first level is the one you keep for yourself: the hand positions,
              the attunements, and the practice of laying them on your own body
              before anyone else&apos;s. It is taught in person, and rarely.
            </p>
            <p style={{ ...micro, marginTop: 30 }}>In person · Rarely</p>
          </div>
          <div>
            <p style={eyebrow}>The other door</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              Some people arrive needing to speak.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              That work happens in conversation, and it is arranged separately. It
              is not the house, and it is not silent. Ask, and you will be told
              whether it is the right door.
            </p>
            <p style={{ ...micro, marginTop: 30 }}>Arranged separately</p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>Discretion</p>
          <h2 style={{ ...bigHead, marginTop: 30, maxWidth: "22ch" }}>
            <SplitTextChars text="No one is named. This is not a policy. It is the product." delay={22} duration={900} />
          </h2>
          <p style={{ ...body, marginTop: 44 }}>
            No client is ever named, referenced, or implied. Not on this site, not in
            conversation, not to another client, not ever. Discretion at this level is not
            a promise we make. It is a condition we work inside. If you are the kind of
            person for whom that matters, you already understand why it is the first thing
            we say and the last.
          </p>
        </section>
      </div>
    </main>
  );
}
