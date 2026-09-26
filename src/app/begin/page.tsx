import { COLORS, FONTS } from "@/styles/tokens";
import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import BeginForm from "./BeginForm";

// Begin — la seule page ou le visiteur donne quelque chose.
//
// Ce qui decide quelqu'un a ecrire ici n'est pas la question, c'est la
// PROMESSE DE DISCRETION. Elle etait en bas de page, apres deux filets, en
// taupe italique — soit un contraste de 1,77:1 sur le marbre, c'est-a-dire
// invisible, a l'endroit exact ou personne ne lit.
//
// Elle est maintenant a cote du formulaire, lisible, la ou la main hesite.
// Et « ce qui se passe ensuite » devient trois temps nommes plutot qu'un
// paragraphe : quelqu'un qui hesite veut savoir ce qu'il declenche.

export const metadata = {
  title: "Begin",
  description: "Begin with Maison du Calme. Not a booking, a conversation. Tell Kilian what you carry. Read by Kilian alone, held in confidence, never shared.",
};

const SUITE = [
  // « Not a system, not an assistant. » etait ici, et cette ligne etait bonne.
  // Elle a du bouger le jour ou /begin/before a existe : cette page-la fait
  // POSER les questions par un assistant, et un visiteur qui lit les deux a
  // trois lignes d'ecart lit une contradiction, pas une nuance.
  //
  // Ce que la ligne promettait reste vrai mot pour mot, et c'est le seul point
  // qui compte : ce qui LIT et ce qui REPOND est une personne. Aucune machine
  // ne lit ce que vous ecrivez, aucune ne vous repond, aucune ne decide de
  // vous. La nouvelle formulation dit exactement cela et ne peut pas se
  // retourner contre la page voisine.
  { n: "01", quoi: "He reads it himself", detail: "Every word of it, before he answers." },
  { n: "02", quoi: "He answers personally", detail: "Within two working days." },
  { n: "03", quoi: "He says yes, or he says no", detail: "And if no, he points you somewhere better." },
];

export default function BeginPage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Begin</p>
        <h1 style={{ ...bigHead, marginTop: 36 }}>
          <SplitTextChars text="Begin." delay={60} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          There is no booking calendar. There is a conversation. It starts with one
          question.
        </p>

        <p style={{
          fontFamily: FONTS.higuen, fontSize: "clamp(40px, 7.4vw, 82px)",
          lineHeight: 1.1, color: COLORS.brouFonce, margin: "120px 0 0", fontWeight: 400,
          maxWidth: "12ch",
        }}>
          <SplitTextChars text="What do you carry?" delay={22} duration={900} />
        </p>

        <section className="mdc-room" style={{ marginTop: 88, alignItems: "start" }}>
          <div>
            <p style={body}>
              Answer in a sentence or in a page, however it comes. There is no right way to
              say it, and no one but Kilian will read it. This is not a form to be processed.
            </p>
            <div style={{ marginTop: 40 }}>
              <BeginForm />
            </div>
          </div>

          {/* La promesse de discretion, remontee a cote du formulaire.
              C'est elle qui decide quelqu'un a ecrire, pas la question. */}
          <div>
            <p style={eyebrow}>What you write here</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              Read by Kilian alone.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              What you write here is read by Kilian alone and held privately. It is never
              shared, never shown, and no client is ever named. What you carry stays yours.
            </p>
            <p className="mdc-micro--phrase" style={{ ...micro, marginTop: 32 }}>Answered personally · Within two working days</p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>What happens next</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            You will hear from a person, not a system.
          </h2>
          <nav className="mdc-index" aria-label="What happens next">
            {SUITE.map((e) => (
              <div className="mdc-index__row" key={e.n}>
                <span style={{ ...micro, opacity: 0.82 }}>{e.n}</span>
                <span style={{ ...body, fontSize: 17, maxWidth: "none" }}>{e.quoi}</span>
                <span style={{ ...body, fontSize: 15, maxWidth: "none", opacity: 0.82 }}>{e.detail}</span>
                <span />
              </div>
            ))}
          </nav>
        </section>

        {/* L'AUTRE PORTE. Elle est ici, apres les trois temps, et pas a cote du
            formulaire : une page qui ouvre sur deux chemins en meme temps
            demande un choix avant d'avoir donne de quoi choisir. Celui qui
            savait deja quoi ecrire a ecrit ; celui qui est arrive jusqu'ici
            sans rien taper est exactement celui a qui la page vide ne convient
            pas. */}
        <section className="mdc-gap--sm">
          <p style={eyebrow}>If the blank page is the wrong shape</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            Let the questions come one at a time.
          </h2>
          <p style={{ ...body, marginTop: 28 }}>
            The same things he needs to know, asked one by one instead of all at
            once. An assistant puts the questions. Kilian reads every answer
            himself, and he is the one who replies.
          </p>
          <div style={{ marginTop: 40 }}>
            <QuietButton href="/begin/before">Be asked instead</QuietButton>
          </div>
        </section>
      </div>
    </main>
  );
}
