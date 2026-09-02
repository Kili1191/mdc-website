import { COLORS, FONTS } from "@/styles/tokens";
import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";
import localFont from "next/font/local";

// Declaree ICI et pas dans le layout : c'est la seule page qui s'en sert —
// une signature, une fois. Dans le layout, ses 435 Ko partaient sur les huit
// pages du site.
const greatVibes = localFont({
  src: "../../../public/fonts/GreatVibes-Regular.woff2",
  variable: "--font-great-vibes",
  display: "swap",
});

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
            {/* COPY NOUVELLE — a valider.
                Le site ne disait rien de ce qui est la vraie rarete de cette
                pratique. L'ancien texte disait « aux sources », « la ou elles
                sont vecues, pas la ou elles sont vendues » : c'est abstrait, et
                tout le monde ecrit ca.
                Les faits de Kilian sont concrets et invendables : ses
                enseignants ne font pas commerce avec les Occidentaux, n'ont pas
                de site, ne peuvent pas etre reserves, et il y RETOURNE encore.
                Le present compte autant que le fait.
                On l'ecrit comme un fait sur le monde, jamais comme une chose
                qu'on refuse de dire — c'est cette difference qui avait coule la
                page Lineage. Personne n'a besoin qu'on lui explique un secret :
                il suffit de dire ce qui est. */}
            <p style={body}>
              Kilian did not arrive at this work through a weekend or a certificate, and
              he has not finished arriving. He still goes back to India, to the same
              teachers. They do not run courses for Westerners. They have no website and
              no dates, and there is nothing to book. They are found in person, on the
              ground, by word of mouth, or they are not found at all.
            </p>
            <p style={body}>
              What he practises has not been adapted. Most of what is sold as this work in
              the West has been shortened, softened and fitted around a timetable. What he
              was taught is the old form, unchanged, because the people who taught it had
              no reason to change it and nothing to sell.
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
          {/* Deux lignes nouvelles, en remplacement de la page Lineage.
              Elles disent la meme chose que l'ancienne page — ou il a appris
              reste prive — mais dans l'autre sens : ce n'est pas une chose
              qu'on refuse de dire, c'est une chose qu'il dit lui-meme. */}
          <p style={body}>
            Where he trained, and with whom, he will tell you himself. In conversation,
            not on a website.
          </p>
          <div style={{ marginTop: 22 }}>
            <QuietButton href="/begin">Ask him</QuietButton>
          </div>
        </section>

        <p className="mdc-gap" style={{
          fontFamily: `${greatVibes.style.fontFamily}, cursive`,
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
              is not the silent work, and it does not happen in the room. Ask, and you will be told
              whether it is the right door.
            </p>
            <p style={{ ...micro, marginTop: 30 }}>
              <a href="/coaching" style={{ color: "inherit" }}>Coaching &rarr;</a>
            </p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>Discretion</p>
          <h2 style={{ ...bigHead, marginTop: 30, maxWidth: "22ch" }}>
            <SplitTextChars text="No one is named. This is not a policy. It is the product." delay={22} duration={900} />
          </h2>
          {/* COPY MODIFIEE — a valider.
              La phrase disait « not ever ». Des que Kilian publie un temoignage
              client, meme avec accord, elle devient fausse — et c'est la phrase
              sur laquelle repose la confiance de tout le site.
              La reparer la rend plus forte, pas plus faible : la discretion
              cesse d'etre une regle de la maison pour devenir la propriete du
              client. Une maison qui garde un secret est prudente ; une maison
              qui dit « ce secret est le votre, pas le mien » est d'un autre
              niveau. Et c'est vrai, ce que « not ever » n'etait plus. */}
          <p style={{ ...body, marginTop: 44 }}>
            No client is named, referenced, or implied. Not on this site, not in
            conversation, not to another client. The only exception is someone who asks to
            speak for themselves, and that is theirs to give — never ours to take, and
            never ours to ask for. Discretion at this level is not a promise we make. It is
            a condition we work inside. If you are the kind of person for whom that
            matters, you already understand why it is the first thing we say and the last.
          </p>
        </section>
      </div>
    </main>
  );
}
