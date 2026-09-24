import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import JsonLd from "@/components/JsonLd";
import Lignee from "@/components/Lignee";
import { graphe, enseignement } from "@/lib/jsonld";

// L'ENSEIGNEMENT DU NIVEAU UN.
//
// Demandee par Kilian le 12 septembre, puis REECRITE POUR VENDRE le 13, sur
// deux reproches de sa part :
//
//   « You didn't explain that's rare only 8 master »
//   « You need to be more marketing to attract ppl to pass their level 1 »
//
// Les deux etaient justes, et le second etait en partie ma faute. La premiere
// version fermait la section de la lignee sur « A shorter line is not a
// stronger one » — une phrase qui protege la page et desamorce la vente dans
// le meme souffle, en dernier, donc en position de conclusion. Et la rarete,
// qui est le seul argument que personne d'autre a Londres ne peut copier
// d'ici mardi, arrivait en troisieme section apres deux sections de programme.
//
// L'ORDRE A CHANGE, ET C'EST LE PRINCIPAL. La ligne d'abord, parce qu'elle est
// la raison de le choisir LUI et pas de choisir le Reiki. Le contenu ensuite,
// parce que le desir doit se poser sur quelque chose de concret. Le refus en
// troisieme, ou il repond a une objection que le lecteur a deja formee — a
// £450 elle s'appelle « c'est la premiere de trois factures » — et une reponse
// n'est crue que la. Le format en dernier, parce que c'est la cloture.
//
// LA RARETE NE S'AFFIRME PLUS, ELLE SE COMPTE. Voir Lignee.tsx. « Kilian is
// the eighth name on his » se lit en une seconde et ne se compte pas. Huit
// rangs numerotes, si.
//
// DEUX FAITS NOUVEAUX FONT TOUT LE TRAVAIL, et ils sont verifiables :
//   Takata a enseigne a plus de dix mille eleves et n'a fait que vingt-deux
//   maitres. Le rapport est l'argument.
//   Une lignee londonienne PUBLIEE PAR SON PROPRE PROFESSEUR compte dix noms.
//   Elle est liee, jamais nommee : on cite un fait, on ne prend personne a
//   partie.
//
// CE QU'ON N'ECRIRA JAMAIS ICI, et la page le dit maintenant elle-meme au lieu
// de s'en abstenir : qu'une lignee courte rendrait le soin plus puissant. Le
// paragraphe « None of this makes a treatment stronger » REFUSE l'affirmation
// que le lecteur attend, ce qui est exactement ce qui rend les huit noms
// croyables. Il n'est plus le dernier — la section se ferme desormais sur ce
// que l'eleve recoit — mais il reste, et il ne se coupe pas.
//
// UNE CORRECTION QUE J'AI PORTEE SUR LE RENDU DU COPYWRITER. Il fermait sur
// « you are given those names AND THEIR DATES, and you can say them out loud
// to anyone who asks ». C'est une promesse de livrable. Il avait lui-meme
// signale la veille n'avoir aucun fait sur ce que l'eleve repart avec. Ce que
// /practitioner publie deja est « he will tell you himself » ; la page ne
// promet donc que ca, et la question reste ouverte dans COPY_OUVERT.md.
//
// LA FRONTIERE AVEC /practitioner TIENT, et elle est devenue un argument : les
// trois premiers noms sont de l'histoire publique, les suivants se donnent en
// personne. Ce qui etait une retenue devient une raison de s'inscrire.
//
// CE QUI MANQUE ENCORE : la duree. Le fait n'existe nulle part. La derniere
// phrase du format convertit le trou en question — « he will tell you how much
// of the day to keep free » — mais l'entree reste ouverte dans COPY_OUVERT.md
// tant que Kilian n'a pas repondu.

export const metadata = {
  title: "Reiki Level One, Taught One to One in Battersea",
  description:
    "Eight names from Mikao Usui to this room. Reiki level one, taught in person in Battersea, South West London, to one person or two. The attunements, the hand positions, and the practice of laying them on your own body. £450 for one, £350 each for two.",
};

// Le lien de source. Couleur heritee, comme le lien interne de Practitioner :
// jamais le bleu par defaut, jamais une couleur hors palette.
const source: React.CSSProperties = { color: "inherit" };

export default function TeachingPage() {
  return (
    <main style={pageStyle}>
      <JsonLd data={graphe(enseignement)} />
      <div className="mdc-wrap">
        <p style={eyebrow}>Teaching</p>
        <h1 style={{ ...bigHead, marginTop: 36, maxWidth: "17ch" }}>
          <SplitTextChars text="Eight names from Usui to this room." delay={20} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40, maxWidth: "33ch" }}>
          Reiki, level one, taught in person in Battersea. Kilian is a Reiki master,
          qualified to teach every level, and this is the only one he teaches. One person,
          or two. £450.
        </p>

        <section className="mdc-gap">
          <p style={eyebrow}>The line</p>
          <h2 style={{ ...bigHead, marginTop: 30, maxWidth: "14ch" }}>
            <SplitTextChars text="Ask for the list." delay={44} duration={900} />
          </h2>
          <div className="mdc-measure" style={{ marginTop: 40 }}>
            <p style={body}>
              Reiki has one credential that can actually be checked, and it is not a
              certificate. It is the list of teachers between Mikao Usui and the person
              putting their hands on you. Ask any teacher for their lineage. It is the one
              question they should be able to answer.
            </p>
          </div>

          {/* LA LIGNE SE COMPTE. Elle est posee ICI, juste apres le defi, pour
              que la page y reponde par la sienne avant de raconter quoi que ce
              soit. Le lecteur compte huit rangs, et voit que quatre noms sont
              tenus expres plutot qu'oublies. Voir Lignee.tsx. */}
          <Lignee />

          <div
            className="mdc-measure"
            style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 22 }}
          >
            <p style={body}>
              Usui opened his clinic and his school in Tokyo in{" "}
              <a style={source} href="https://en.wikipedia.org/wiki/Mikao_Usui">1922</a>. He
              made{" "}
              <a style={source} href="https://en.wikipedia.org/wiki/Chujiro_Hayashi">Chujiro Hayashi</a>{" "}
              a master in 1925, and it was Hayashi who ordered the hand positions and
              refined the attunement into the form still taught today. Hayashi made{" "}
              <a style={source} href="https://en.wikipedia.org/wiki/Hawayo_Takata">Hawayo Takata</a>{" "}
              a master in 1938, which is how Reiki left Japan.
            </p>
            <p style={body}>
              Takata taught more than ten thousand students. She made twenty two masters,
              all of them between 1976 and 1980. Every Western line runs back through one
              of those twenty two. Since the master level began to be taught over weekends,
              lines have grown faster than that.
            </p>
            <p style={body}>
              Kilian&apos;s has eight names. A hundred years from Tokyo to this room, in
              eight passes. A London lineage{" "}
              <a style={source} href="https://www.eastlondonreiki.com/reiki-lineages-training">published online</a>{" "}
              runs to ten.
            </p>
            <p style={body}>
              The first three names are history and you can read them anywhere. The ones
              after them are his own teachers, and he gives them by name to the people he
              teaches. Every pass was one teacher and one student, in the same room.
            </p>
            {/* Le paragraphe qui refuse l'affirmation attendue. C'est lui qui
                rend les huit noms croyables, et c'est aussi lui qui tient la
                page du bon cote du code CAP. Il ne se coupe pas. */}
            <p style={body}>
              None of this makes a treatment stronger, and anyone who tells you it does is
              selling you something. What it makes is a short list: few hands between the
              first one and yours, and a name for each of them.
            </p>
            <p style={body}>
              When he teaches you, he tells you them.
            </p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>What is taught</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            The level you keep for yourself.
          </h2>
          <div
            className="mdc-measure"
            style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}
          >
            <p style={body}>
              Level one is where every Reiki practitioner begins, and it is the one you
              learn for yourself. Three things are given in it. The attunements. The hand
              positions, in their order, and where they sit on the body. And the practice
              of laying them on your own body, before anyone else&apos;s.
            </p>
            <p style={body}>
              That last part is the whole of the first level, and it is the part people do
              not expect. The first body you learn to put your hands on is your own.
            </p>
            <p style={body}>
              It is for people who have had this work done to them and would rather be
              able to do it for themselves, at eleven at night, without booking anything
              and without explaining themselves to anyone. No previous training is needed
              and none is assumed.
            </p>
            <p style={body}>
              It is not a medical training and it treats nothing. What you are taught is a
              practice to keep, not a qualification to sell.
            </p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>What he does not teach</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            He stops at the first level.
          </h2>
          <div
            className="mdc-measure"
            style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}
          >
            <p style={body}>
              He is a Reiki master, qualified to teach the second level and to make other
              masters. He does neither, and that is a choice, not a stage he has not
              reached.
            </p>
            {/* A £450, l'objection formee est « c'est la premiere de trois
                factures ». Ce paragraphe la ferme, et il est place ici parce
                qu'une reponse n'est crue qu'apres la question. */}
            <p style={body}>
              So the first level is not step one of three here. It is the whole of what is
              taught, complete in itself, with nothing kept back to be sold to you later.
            </p>
            <p style={body}>
              The second level and the master level are taught by a great many people in
              London. If that is what you are after, he will say so plainly, and you can go
              and find it.
            </p>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>Format</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            One person, or two.
          </h2>
          <div
            className="mdc-measure"
            style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}
          >
            <p style={body}>
              It is taught to one person, or to two who come together. Never a group.
              Nothing in it is done over a screen.
            </p>
            <p style={body}>
              £450 for one. £350 each for two.
            </p>
            <p style={body}>
              In person, in Battersea, South West London. He teaches it rarely and not to a
              timetable, so the date is set between you and him, and he will tell you how
              much of the day to keep free.
            </p>
          </div>
          <p className="mdc-micro--phrase" style={{ ...micro, marginTop: 34 }}>
            In person · One or two people · £450
          </p>
          <div style={{ marginTop: 44 }}>
            <QuietButton href="/begin?brings=teaching">Ask for a date</QuietButton>
          </div>
        </section>
      </div>
    </main>
  );
}
