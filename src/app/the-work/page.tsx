import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";

// The Work — le recit de ce qui se passe dans la salle.
//
// C'est le seul texte du site qui avance dans le TEMPS : on arrive, on
// s'allonge, il ne se passe pas grand-chose, puis quelque chose se passe, puis
// on repart. La page l'aplatissait en six paragraphes de meme poids dans une
// colonne, si bien que le basculement — « Then something does. » — passait
// inapercu au milieu du bloc.
//
// Il devient donc le pivot de la page : une ligne seule, grande, avec une
// image en face. Aucun mot n'est ajoute ni retire ; c'est le rythme qui change.

export const metadata = {
  title: "The Work · Maison du Calme",
  description: "What actually happens in a session at Maison du Calme. You arrive, you lie down dressed, the room stays quiet. An honest answer that gives away nothing.",
};

export default function TheWorkPage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>The Work</p>
        <h1 style={{ ...bigHead, marginTop: 36 }}>
          <SplitTextChars text="What actually happens." delay={22} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          A fair question. Here is an honest answer that gives away nothing, because the
          giving-away is not the point.
        </p>

        <div className="mdc-measure" style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 88 }}>
          <p style={body}>
            You arrive. You are not asked how you are, because you would answer the way
            you always answer, and that answer is the thing we are here to get underneath.
          </p>
          <p style={body}>
            You lie down, dressed. The room is quiet, and it stays quiet. Nothing is
            done <em>to</em> you in the way that word usually means. There is no oil, no
            conversation, no performance of relaxation. For a while, not much seems to
            be happening at all.
          </p>
        </div>

        {/* Le basculement du recit. Il etait une phrase de quatre mots noyee
            entre deux paragraphes ; c'est le moment ou la page bascule. */}
        <section className="mdc-room" style={{ marginTop: 128 }}>
          <div className="mdc-room__art">
            <AssetFrame slot="SI-02" kind="image" src="/photos/si-02.jpg" aspect="4/5" effect="reveal"
              prompt="Alabaster, air and a single pass of light." />
          </div>
          <div>
            <p style={{ ...bigHead, fontSize: "clamp(30px, 4.4vw, 50px)" }}>
              Then something does.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 40 }}>
              <p style={body}>
                The body, given a room where nothing is required of it, does what it has not
                had permission to do. It stops holding. First the obvious places. Then
                places you did not know were holding. Somewhere in the sixty or ninety
                minutes, the bracing you have mistaken for yourself lets go, and underneath
                it is a quiet you may not have felt in years.
              </p>
              <p style={body}>
                Sometimes what surfaces is only rest, very deep. Sometimes it is more than
                that: something long carried, finally set down, occasionally with tears you
                did not plan and will not be embarrassed about, because no one is watching
                and no one will ever know.
              </p>
            </div>
          </div>
        </section>

        <div className="mdc-measure mdc-gap--sm">
          <p style={body}>
            You leave lower, slower, and lighter. Most people are quiet for the rest of
            the day. The change is not dramatic and it is not marketing. It is the
            specific relief of putting down a weight you had stopped noticing you held.
          </p>
        </div>

        <blockquote className="mdc-gap" style={{
          ...bigHead, margin: 0, maxWidth: "24ch",
          fontSize: "clamp(26px, 3.6vw, 44px)", lineHeight: 1.26,
        }}>
          <SplitTextChars
            text="We will tell you what you will feel. We will never tell you how. The how is years of training, and it is the reason the feeling is reliable."
            delay={22} duration={900}
          />
        </blockquote>

        <section className="mdc-gap mdc-two">
          <div>
            <p style={eyebrow}>What it is not</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              And we would rather say so.
            </h2>
          </div>
          <div>
            <p style={body}>
              It is not massage. It is not therapy, and it is not a substitute for it. It is
              not religion, and it asks you to believe nothing. It is not a treatment for an
              illness, and it makes no medical claim. It is not for everyone, and we will
              tell you honestly if it is not for you.
            </p>
            <p style={{ ...micro, marginTop: 32 }}>Fully clothed · In silence · One to one</p>
            <div style={{ marginTop: 44 }}>
              <QuietButton href="/begin">Begin</QuietButton>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
