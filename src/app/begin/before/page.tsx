import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro, ECHELLE } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import Entretien from "./Entretien";

// BEFORE THE ROOM — l'entretien avant la seance.
//
// Demande par Kilian : un questionnaire interactif, mene par une IA qui agit
// pour la maison, qui demande tout ce qu'il doit savoir avant la seance, qui
// juge la fragilite de la personne en face et choisit sa question suivante, et
// qui lui envoie a la fin une fiche remplie.
//
// POURQUOI CETTE PAGE N'EST PAS /begin, ET NE LE REMPLACE PAS. /begin pose UNE
// question — « What do you carry? » — et laisse quelqu'un ecrire une phrase ou
// une page. C'est la porte, et elle reste la porte : on ne remplace pas une
// question ouverte par treize questions fermees sur la page qui decide si
// quelqu'un ose approcher. Ici, la personne a deja decide. Ce qu'on lui demande
// n'est plus de se presenter, c'est ce qu'il faut savoir avant de poser les
// mains sur elle.
//
// LA PROMESSE DE /begin RESTE VRAIE, et c'est la contrainte qui a dessine tout
// le reste : « He reads it himself. Not a system, not an assistant. » Elle
// tient parce que l'assistant NE REPOND JAMAIS. Il pose, il n'explique pas, il
// ne rassure pas, il ne juge pas un cas et il n'accepte personne. Ce qui lit et
// ce qui repond est Kilian. La colonne de droite le dit au visiteur avant la
// premiere question, en clair, parce qu'un site qui vend la confiance ne peut
// pas avoir un assistant discret.

export const metadata = {
  title: "Before the room",
  description:
    "The questions Maison du Calme asks before a first session, put one at a time. What you carry, how long it has been, and what your body needs him to know. Read by Kilian alone.",
};

export default function BeforePage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Begin</p>
        <h1 style={{ ...bigHead, marginTop: 36 }}>
          <SplitTextChars text="Before the room." delay={60} duration={900} />
        </h1>
        {/* Le chapo se retire au telephone une fois l'entretien ouvert. Il a
            fait son travail — decider — et il occupait 224px d'un ecran de 844
            pendant qu'on cherchait ou repondre. Voir `.mdc-seuil-chapo` dans
            globals.css et l'attribut pose par `Entretien`. */}
        <p className="mdc-seuil-chapo" style={{ ...lead, marginTop: 40 }}>
          A first session starts with what Kilian needs to know. These are the
          questions he would put sitting across from you, one at a time.
        </p>

        <section className="mdc-room" style={{ marginTop: 88, alignItems: "start" }}>
          <div>
            <Entretien />
          </div>

          {/* Ce que c'est, et qui le lit. A COTE de la premiere question et pas
              en bas de page : c'est ce qui decide quelqu'un a repondre, comme
              la promesse de discretion sur /begin. */}
          <div>
            <p style={eyebrow}>How this works</p>
            {/* 24px, une marche SOUS la question, et c'est une mesure.
                A `sectionHead` ce titre composait a 40px — exactement la taille
                de la question en cours, boites 530..628 contre 530..628, ratio
                1,000, cote a cote sur la meme ligne. L'explication de ce qu'est
                la page ne peut pas peser autant que la question qu'on est en
                train de poser a quelqu'un. */}
            <h2 style={{ ...sectionHead, fontSize: ECHELLE.titre, marginTop: 26 }}>
              An assistant asks. Kilian reads.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              The questions are put by an assistant, one at a time, and they
              change with what you answer. It answers nothing back. What you
              write goes to Kilian. He reads every word himself, and he is the
              one who replies.
            </p>
            <p style={{ ...body, marginTop: 28 }}>
              Some of it is about your body. It is asked because he rests his
              hands on people, and he will not do that without knowing. You can
              refuse any question, and a refusal reaches him as a refusal, not as
              a blank.
            </p>
            <p className="mdc-micro--phrase" style={{ ...micro, marginTop: 32 }}>
              Read by Kilian alone · Never shared
            </p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>If you would rather not be asked</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            Write it in your own order.
          </h2>
          <p style={{ ...body, marginTop: 28 }}>
            One question, and as much or as little as you like. It reaches him
            the same way.
          </p>
          <div style={{ marginTop: 40 }}>
            <QuietButton href="/begin">Write to him instead</QuietButton>
          </div>
        </section>
      </div>
    </main>
  );
}
