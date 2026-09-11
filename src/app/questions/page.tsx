import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import JsonLd from "@/components/JsonLd";
import { graphe, questions } from "@/lib/jsonld";

// LES QUESTIONS PRATIQUES — demandees par Kilian, le 11 septembre.
//
// `CLAUDE.md` interdit la page FAQ, et une page `/lineage` a deja ete
// supprimee pour cette raison exacte. Kilian a demande celle-ci quand meme, et
// sa parole prime (VISION.md, rang 1). Elle est donc construite, mais PAS
// comme une FAQ ordinaire, parce que la regle disait quelque chose de juste et
// que l'ignorer entierement abimerait le site.
//
// LA DISTINCTION QUI PERMET LES DEUX. La regle interdit a la maison de SE
// JUSTIFIER : pas de « pourquoi nous ne faisons pas X », pas de defense de la
// discretion, pas de plaidoyer. Elle n'interdit pas de RENSEIGNER. Recherche
// faite sur ce que les gens demandent reellement avant de reserver un premier
// soin au Royaume-Uni : quoi porter, combien de temps, est-ce qu'on me touche,
// est-ce que je dois parler, combien ca coute, comment on reserve. Ce sont des
// questions de service, pas des objections. Y repondre est un acte
// d'hospitalite, et une maison hospitaliere n'est pas une maison qui se
// defend.
//
// Chaque reponse ci-dessous vient d'un fait DEJA ECRIT ailleurs sur le site ou
// dans SERVICES.md. Aucune n'invente une pratique, un titre ou un effet.
//
// PAS DE BALISAGE FAQPage, ET C'EST MESURE, PAS UNE PREFERENCE.
// Google a restreint les resultats enrichis FAQ aux sites gouvernementaux et
// de sante en aout 2023, puis les a supprimes POUR TOUS LES SITES le 7 mai
// 2026. Le balisage n'affiche plus rien, pour personne. Ce qui reste utile est
// la page elle-meme : elle repond a des questions que les gens tapent, et elle
// se lit. Le graphe de la page porte donc `QAPage`, qui decrit honnetement ce
// qu'elle est, et rien qui promette un affichage qui n'existe plus.

export const metadata = {
  title: "What to expect, and what it costs",
  description:
    "What to wear, how long a session lasts, whether you have to talk, what it costs, and how to arrange one. Practical answers for a first visit to Maison du Calme in Battersea, South West London.",
};

// Les reponses sont groupees. Une liste plate de onze questions se lit comme
// un formulaire ; trois groupes se lisent comme quelqu'un qui vous explique.
const GROUPES = [
  {
    titre: "Before you come",
    items: [
      {
        q: "What do I wear?",
        r: "Your own clothes, and you keep them on. The only work here that uses oil is Abhyanga, and for that one you will be told what to expect beforehand. Wear something you can lie still in for an hour.",
      },
      {
        q: "How long does it last?",
        r: "Sixty to ninety minutes, depending on the room. ANTARA, which is where everyone begins, is ninety.",
      },
      {
        q: "Do I have to talk?",
        r: "No. The work is done in silence and nothing is required of you. If you want to say something first, you can. If you would rather not say anything at all, that is the more common choice and it costs you nothing.",
      },
      {
        q: "Do I need to know what I want?",
        r: "No. Most people arrive without a word for it. That is the ordinary way to arrive, and it is why the first question is only what you carry.",
      },
    ],
  },
  {
    titre: "The hour itself",
    items: [
      {
        q: "What actually happens?",
        r: "You arrive, you lie down dressed, and the room stays quiet. It stays quiet for the whole hour. The Work describes it at length if you want the longer answer before you decide.",
      },
      {
        q: "Where are you touched?",
        r: "Hands rest on the body, or just above it, and are held. Nothing is worked, pressed or manipulated, and no area is touched that you have not agreed to.",
      },
      {
        q: "What if I feel nothing?",
        r: "Some people feel warmth, some feel heaviness, some fall asleep, and some notice nothing at all until the next day. None of these is the correct one. You are not being tested, and there is nothing you can fail to do.",
      },
      {
        q: "Is this therapy, or medical treatment?",
        r: "Neither. It is not therapy and it is not a substitute for it, and it makes no medical claim. If what you are carrying belongs with a doctor or a therapist, you will be told so and pointed somewhere better.",
      },
    ],
  },
  {
    titre: "Arranging one",
    items: [
      {
        q: "How do I book?",
        r: "There is no booking calendar. You write what you carry, Kilian reads it himself, and he answers personally within two working days. If the work is right for you he proposes a time. If it is not, he says that too.",
      },
      {
        q: "What does it cost?",
        r: "Between £130 and £250 in the room, depending on the work and its length. Coaching is on a call, from £150, and the first call is free.",
      },
      {
        q: "Where is it?",
        r: "Battersea, in South West London. The address is given when a time is arranged.",
      },
      {
        q: "Which one should I choose?",
        r: "You do not have to. NERVANA is a suite and it opens with ANTARA, always. What lies beyond it opens in its own order, in conversation, never from a list.",
      },
    ],
  },
];

export default function QuestionsPage() {
  return (
    <main style={pageStyle}>
      <JsonLd data={graphe(questions)} />
      <div className="mdc-wrap">
        <p style={eyebrow}>Practical</p>
        <h1 style={{ ...bigHead, marginTop: 36, maxWidth: "18ch" }}>
          <SplitTextChars text="What to expect." delay={50} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40, maxWidth: "46ch" }}>
          The things people want to know before a first visit, answered plainly.
        </p>

        {GROUPES.map((g) => (
          <section key={g.titre} className="mdc-gap">
            <p style={eyebrow}>{g.titre}</p>
            <div style={{ marginTop: 34 }}>
              {g.items.map((it) => (
                <div key={it.q} className="mdc-two" style={{ marginTop: 40 }}>
                  <h2 style={{ ...sectionHead, maxWidth: "20ch" }}>{it.q}</h2>
                  <p style={{ ...body, maxWidth: "56ch" }}>{it.r}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mdc-gap">
          <p style={{ ...micro, marginBottom: 28 }}>
            Anything not answered here is answered by Kilian, not by a page.
          </p>
          <QuietButton href="/begin">Begin</QuietButton>
        </div>
      </div>
    </main>
  );
}
