import { pageStyle, body, lead, bigHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";

// Notes — trois essais, separes par des filets, tous du meme poids.
//
// C'etait une liste sans sommaire : il fallait traverser les trois pour savoir
// qu'il y en avait trois, et rien ne disait lequel lire. Une revue se lit par
// son sommaire.
//
// Les trois titres passent donc en index en haut de page, et chaque essai
// devient une double page de texte : titre a gauche, resume a droite. C'est la
// forme d'une revue, ce que cette page essaie d'etre.

export const metadata = {
  title: "Notes",
  description: "A long piece, once a month, from Maison du Calme. On weight, silence, what the body keeps, and the tiredness of people who hold everything together.",
};

const ESSAIS = [
  { n: "01", titre: "On carrying.", sur: "The weight that files under nothing" },
  { n: "02", titre: "The difference between quiet and silence.", sur: "Why silence is harder to reach" },
  { n: "03", titre: "What the body keeps.", sur: "The record you did not choose to write" },
];

export default function NotesPage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Notes</p>
        <h1 style={{ ...bigHead, marginTop: 36 }}>
          <SplitTextChars text="Notes." delay={60} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          A long piece, once a month. Nothing to scroll past. Written to be read slowly,
          or not at all.
        </p>

        <div className="mdc-measure" style={{ marginTop: 44 }}>
          <p style={body}>
            There is no feed here, and no schedule of small posts. Once a month there is a
            single essay, on the things this work sits closest to: weight, silence, what
            the body keeps, and the particular tiredness of people who hold everything
            together. They are written by Kilian, in the quiet between sessions. You can
            read them or leave them. Nothing is being sold in them.
          </p>
        </div>

        {/* Le sommaire. Une revue se lit par la, pas en traversant tout. */}
        <nav className="mdc-index mdc-index--wide" aria-label="The essays">
          {ESSAIS.map((e) => (
            <a key={e.n} href={`#essay-${e.n}`}>
              <span style={{ ...micro, opacity: 0.82 }}>{e.n}</span>
              <span style={{ ...body, fontSize: 17, maxWidth: "none" }}>{e.titre}</span>
              <span style={{ ...body, fontSize: 16, maxWidth: "none", opacity: 0.82 }}>{e.sur}</span>
              <span style={micro}>Essay</span>
            </a>
          ))}
        </nav>

        <section id="essay-01" className="mdc-gap mdc-two">
          <div>
            <p className="mdc-num" aria-hidden="true">01</p>
            <h2 style={{ ...bigHead, fontSize: "clamp(26px, 3.4vw, 40px)", maxWidth: "14ch" }}>
              On carrying.
            </h2>
          </div>
          <p style={body}>
            Everyone you know is carrying something they have decided not to mention. The
            most capable people carry the most, and mention it least. It is often the reason they became capable. This first Note is about the weight that has no
            name and files under nothing: not grief exactly, not stress exactly, just the
            accumulated load of being the one who copes. What it costs to hold it. What
            it costs more to keep pretending you aren&apos;t. And what happens, physically,
            in the hour you finally stop.
          </p>
        </section>

        <section id="essay-02" className="mdc-gap--sm mdc-two">
          <div>
            <p className="mdc-num" aria-hidden="true">02</p>
            <h2 style={{ ...bigHead, fontSize: "clamp(26px, 3.4vw, 40px)", maxWidth: "14ch" }}>
              The difference between quiet and silence.
            </h2>
          </div>
          <p style={body}>
            Quiet is the absence of noise. Silence is something else, a fuller thing,
            harder to reach, and increasingly rare. This Note is about why the people
            with the most sophisticated lives have the least access to real silence, why
            the mind resists it at first, and why the body, given enough of it, will do
            on its own what no amount of effort can force. A piece about doing less, and
            the strange difficulty of it.
          </p>
        </section>

        <section id="essay-03" className="mdc-gap--sm mdc-two">
          <div>
            <p className="mdc-num" aria-hidden="true">03</p>
            <h2 style={{ ...bigHead, fontSize: "clamp(26px, 3.4vw, 40px)", maxWidth: "14ch" }}>
              What the body keeps.
            </h2>
          </div>
          <p style={body}>
            You forget on purpose; the body does not. It keeps a record: in the shoulders
            that never come down, the breath taken in halves, the jaw held through a
            decade of composure. This Note is about that record: how it is written, why
            it does not respond to being reasoned with, and how it is finally released,
            not by understanding it, but by being somewhere safe enough to stop guarding
            it. Written for people who have tried thinking their way out and found the
            thinking was part of the problem.
          </p>
        </section>
      </div>
    </main>
  );
}
