import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";

// Coaching — l'autre porte.
//
// C'etait trois lignes au milieu de la page Practitioner, sous « The other
// door ». Une ligne de metier entiere, invisible : pas de page, pas d'entree
// de nav, rien dans le sitemap. Personne ne peut acheter ce qu'il ne voit pas.
//
// La tension etait reelle et elle est resolue ici, pas ignoree. La maison vend
// le silence — « not asked to speak ». Le coaching est exactement l'inverse.
// Les poser au meme etage aurait dilue la promesse silencieuse. Les separer
// franchement, en nommant la difference au lieu de la masquer, fait des deux
// une offre coherente : une maison, deux portes, et on vous dit laquelle est
// la votre.
//
// L'ECOLE EST NOMMEE, SUR DECISION DE KILIAN.
//
// J'avais recommande de ne pas la nommer : le site repose sur « il n'est pas
// arrive a ce travail par un week-end ou un certificat » et sur des enseignants
// indiens qui n'ont pas de site et ne peuvent pas etre reserves. Nommer une
// ecole moderne et commercialisee a deux clics de la, c'est fournir soi-meme le
// contre-exemple de son propre argument. Kilian tranche : c'est bon pour le
// marketing. C'est sa decision.
//
// LE TITRE EST CELUI DU CERTIFICAT, ET RIEN DE PLUS.
//
// J'avais ecrit « regulated by Ofqual, the UK qualifications regulator ». Le
// certificat de Kilian dit : « International Postgraduate Diploma in Coaching
// and Leadership Development (Level 7) », reference JSS210301, centre d'etudes
// Jay Shetty Certification School.
//
// Deux signaux disent que ce n'est PAS une qualification reguleee Ofqual : le
// mot « International » dans le titre, et une reference JSS210301 qui n'a pas
// la forme d'un numero RQF (603/1234/5). OTHM delivre les deux familles.
//
// OTHM en tant qu'organisme est reconnu par l'Ofqual ; ce diplome-la, on n'en
// sait rien. Presenter une qualification comme reguleee quand elle ne l'est pas
// est une fausse declaration, et sur une page qui vend de la confiance c'est le
// pire endroit possible pour se tromper. On ecrit donc exactement ce que dit le
// certificat : le titre, le niveau, l'organisme, le centre. Ne pas rajouter
// « Ofqual » sans le numero RQF sous les yeux.
//
// La contradiction se resout en la disant au lieu de la masquer. « Le travail
// silencieux n'a pas ete appris dans un certificat. Celui-ci, si. » Les deux
// affirmations deviennent alors plus credibles, pas moins : un praticien qui
// distingue lui-meme ce qui vient d'une transmission et ce qui vient d'une
// formation est un praticien qu'on croit sur les deux.

export const metadata = {
  title: "Coaching · Maison du Calme",
  description: "The other door at Maison du Calme. For people who arrive needing to speak. One to one, in conversation, arranged separately from the silent work.",
};

export default function CoachingPage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Coaching</p>
        <h1 style={{ ...bigHead, marginTop: 36, maxWidth: "15ch" }}>
          <SplitTextChars text="The other door." delay={22} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          Some people arrive needing to speak. This is where that is the work, and not the
          thing we get underneath.
        </p>

        <div className="mdc-measure" style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 22 }}>
          <p style={body}>
            Everything else in this house is silent. You are not asked how you are, and
            you are not asked to explain yourself, because the body says it more
            accurately than you would. That is the whole design of it.
          </p>
          <p style={body}>
            This is the exception, and it is deliberate. Some things do need to be said
            out loud, to one person, without it becoming a story you have to keep telling.
            Coaching here is conversation with a direction: what you are carrying, what it
            is costing, and what you intend to do differently.
          </p>
          <p style={body}>
            Same practitioner. Same discretion. Nothing you say is written down, repeated,
            or referred to again unless you raise it yourself.
          </p>
          {/* COPY NOUVELLE — a valider.
              Dire la difference au lieu de la laisser se decouvrir. */}
          <p style={body}>
            The silent work was not learned from a certificate. This was, and deliberately
            so. Kilian holds the International Postgraduate Diploma in Coaching and
            Leadership Development (Level 7), awarded by OTHM, completed at the Jay Shetty
            Certification School. Two different kinds of knowing, and it is worth being
            clear about which is which.
          </p>
        </div>

        <section className="mdc-gap mdc-two">
          <div>
            <p style={eyebrow}>Who it is for</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              People who are good at being fine.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              It is for the ones who run things, hold things together, and have nobody to
              say the unedited version to. Not because they lack people, but because too
              many people depend on the edited one.
            </p>
          </div>
          <div>
            <p style={eyebrow}>What it is not</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              It is not therapy.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              It does not treat illness, it does not replace clinical care, and it does not
              go looking through your childhood for a cause. It works forward. If what you
              need is therapy, you will be told so plainly and pointed somewhere better.
            </p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>How it works</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            This one does not need the house.
          </h2>
          {/* COPY NOUVELLE — a valider.
              Le coaching se fait UNIQUEMENT a distance. La page laissait croire
              qu'on venait a Battersea comme pour le reste : « this is the room
              where ». Sur une page qui vend la confiance, laisser quelqu'un
              croire qu'il va se deplacer est le genre de malentendu qu'on
              decouvre au pire moment.
              Et c'est un avantage, pas un aveu : c'est la seule chose ici qui
              ne depend pas d'une adresse. */}
          <p style={{ ...body, marginTop: 30 }}>
            It happens on a call, and only on a call. Everything else in this house needs
            the room you are lying in. This does not, which means it is the one thing here
            you can do from another city, another country, or a hotel between two
            meetings.
          </p>
          <p style={{ ...body, marginTop: 22 }}>
            It is not added on to the silent work, and the silent work is not turned into
            a conversation. They are two different things, and you choose the one you came
            for. Many people only ever use one.
          </p>
          <p style={{ ...body, marginTop: 30 }}>
            An hour is the usual shape. It runs shorter or longer when it needs to. The
            clock is not what you came for.
          </p>
          <p style={{ ...micro, marginTop: 34 }}>
            One to one · By call · Around an hour · Fee on request
          </p>
          <div style={{ marginTop: 44 }}>
            <QuietButton href="/begin">Ask about this door</QuietButton>
          </div>
        </section>
      </div>
    </main>
  );
}
