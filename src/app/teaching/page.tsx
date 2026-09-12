import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import JsonLd from "@/components/JsonLd";
import { graphe, enseignement } from "@/lib/jsonld";

// L'ENSEIGNEMENT — demande de Kilian, le 12 septembre.
//
// « add an onglet of reiki teaching explain what is the first level what they
// gonna learn and the price and explain i'm the 8th in usui lineage explain
// why is good and how it is uncommon ».
//
// C'etait la decision en attente numero 4 de SERVICES.md : « L'enseignement
// Reiki niveau 1 : page, ou une ligne ? ». Reponse : page. Une ligne de metier
// entiere vivait en deux paragraphes au milieu de Practitioner, sans entree de
// nav et sans rien dans le sitemap — exactement la situation qui avait valu au
// coaching sa propre page.
//
// COPY ECRITE PAR L'AGENT COPYWRITER, sur mandat de CLAUDE.md. A valider par
// Kilian. Les corrections que j'ai portees sur son rendu sont marquees plus
// bas, chacune avec sa raison.
//
// CE QUI EST LE SUJET, ET CE QUI NE L'EST PAS.
//
// SERVICES.md est explicite : « Maitre Reiki, habilite a enseigner tous les
// niveaux, choisit de n'enseigner que le niveau 1. LE REFUS EST LE SUJET, PAS
// LE TITRE. » La page mene donc par le refus. Un titre se collectionne ; un
// refus se paie, et c'est lui qui dit quelque chose sur la personne.
//
// LA LIGNE DE CRETE DE CETTE PAGE.
//
// « La maison ne se justifie jamais » a deja coute une page entiere : Lineage
// a ete supprimee parce qu'expliquer ce qu'on ne dira pas attire l'attention
// sur le fait qu'on cache. Kilian demande ici d'expliquer « why is good and
// how it is uncommon », ce qui est a un mot du plaidoyer.
//
// La distinction qui tient, la meme qui a permis /questions : RENSEIGNER est
// de l'hospitalite, SE DEFENDRE est une faute. Dans le Reiki, la lignee est le
// seul titre verifiable qui existe — la liste des noms depuis Usui jusqu'a
// votre professeur. La donner n'est pas un argument, c'est un fait, et c'est
// la chose qu'un eleve serieux demande de toute facon. Elle est donc ecrite
// comme une suite de dates, pas comme une plaidoirie.
//
// ET ON NE CONTREDIT PAS PRACTITIONER. Cette page-la dit : « Where he trained,
// and with whom, he will tell you himself. In conversation, not on a website. »
// La ligne Usui / Hayashi / Takata est de l'histoire publique et datee ; les
// noms de SES professeurs a lui ne le sont pas. La page tient cette frontiere
// explicitement, plutot que de laisser le lecteur buter dessus.
//
// CE QU'ON N'ECRIRA JAMAIS ICI, et c'est le piege exact du sujet : qu'une
// lignee courte rendrait le soin plus puissant. Invalidable, donc invendable a
// un sceptique, et sanctionnable par le code CAP. Le dernier paragraphe de la
// section « The line » REFUSE cette affirmation explicitement, ce qui persuade
// davantage que de la faire. Ne pas le couper.
//
// UNE CORRECTION SUR LE RENDU DU COPYWRITER, ET C'EST LA PLUS IMPORTANTE.
//
// Il avait ecrit « Four names stand between Takata and Kilian », et il l'a
// signale lui-meme comme la phrase la plus verifiable de la page. Elle depend
// d'une convention de comptage : huitieme EN COMPTANT Usui donne quatre noms
// apres Takata, huitieme APRES Usui en donne cinq. Une page batie sur la
// verifiabilite d'une lignee ne peut pas porter un decompte dont je ne connais
// pas la convention — c'est exactement la phrase qu'un sceptique irait
// recompter. Le nombre est retire ; la structure, elle, reste vraie dans les
// deux cas.
//
// LES DATES SONT SOURCEES, avec leurs liens. Regle de copy levee par Kilian le
// 11 septembre : « tu peux reprendre des articles avec liens sur la source
// pour rassurer les sceptic ». Les trois liens portent exactement les dates
// citees et rien d'autre : un nom propre, un nom propre, une annee.
//
// CE QUI MANQUE ENCORE, ET QUI EST DANS COPY_OUVERT.md : la DUREE. Une
// journee, deux ? Le fait n'existe nulle part et ne s'invente pas sur une page
// qui vend une formation a £450. C'est la derniere phrase de « Format » qui
// l'accueillera.

export const metadata = {
  title: "Reiki Level One, Taught in Battersea",
  description:
    "Reiki level one, taught one to one in Battersea, South West London. The attunements, the hand positions, and the practice of laying them on your own body. £450 for one person, £350 each for two. Kilian is a Reiki master and the eighth name in the line from Usui.",
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
        <h1 style={{ ...bigHead, marginTop: 36, maxWidth: "16ch" }}>
          <SplitTextChars text="The first level." delay={48} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40, maxWidth: "44ch" }}>
          Reiki, level one, taught in person in Battersea. Kilian is a Reiki master,
          qualified to teach every level, and this is the only one he teaches.
        </p>

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
              able to do it for themselves, at eleven at night, without arranging
              anything. No previous training is needed and none is assumed.
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
            {/* Ce paragraphe fait le travail commercial de la page. A £450, le
                premier soupcon du lecteur est l'escalier d'options. Il le ferme
                sans jamais rien defendre. */}
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
          <p style={eyebrow}>The line</p>
          <h2 style={{ ...bigHead, marginTop: 30, maxWidth: "16ch" }}>
            <SplitTextChars text="Eighth from Usui." delay={44} duration={900} />
          </h2>
          <div
            className="mdc-measure"
            style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 22 }}
          >
            <p style={body}>
              Reiki has one credential that can actually be checked, and it is not a
              certificate. It is a list of names: every teacher between Mikao Usui and the
              person teaching you. Kilian is the eighth name on his.
            </p>
            <p style={body}>
              Usui opened his clinic and his school in Tokyo in{" "}
              <a style={source} href="https://en.wikipedia.org/wiki/Mikao_Usui">1922</a>. He
              initiated{" "}
              <a style={source} href="https://en.wikipedia.org/wiki/Chujiro_Hayashi">Chujiro Hayashi</a>{" "}
              as a master in 1925, and it was Hayashi who ordered the hand positions and
              refined the attunement into the form still taught today. Hayashi made{" "}
              <a style={source} href="https://en.wikipedia.org/wiki/Hawayo_Takata">Hawayo Takata</a>{" "}
              a master in 1938, which is how Reiki left Japan. Between 1970 and her death
              in 1980 she made twenty two masters, and every Western line runs back
              through one of them.
            </p>
            {/* Le decompte des noms apres Takata a ete retire : il depend d'une
                convention que je n'ai pas confirmee. Voir l'en-tete du
                fichier. La structure tient sans lui. */}
            <p style={body}>
              The first three names are public and you can read them anywhere. The ones
              after them are his own teachers, and he gives them by name to the people he
              teaches. Each pass was one teacher to one student, in person.
            </p>
            <p style={body}>
              A line gains a name every time a master makes a master. Eight of them cover
              the hundred years since Tokyo, and since the master level began to be taught
              in weekends, lines have grown faster than that.
            </p>
            <p style={body}>
              A shorter line is not a stronger one. It is a shorter list, and every name on
              it can be said out loud.
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
            </p>
            <p style={body}>
              £450 for one. £350 each for two.
            </p>
            <p style={body}>
              In person, in Battersea, South West London. It is taught rarely and not to a
              timetable, so the date is arranged between you and him.
            </p>
          </div>
          <p className="mdc-micro--phrase" style={{ ...micro, marginTop: 34 }}>
            In person · One or two people · £450
          </p>
          <div style={{ marginTop: 44 }}>
            <QuietButton href="/begin?brings=teaching">Ask about level one</QuietButton>
          </div>
        </section>
      </div>
    </main>
  );
}
