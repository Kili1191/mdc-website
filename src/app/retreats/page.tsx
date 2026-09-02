import { COLORS } from "@/styles/tokens";
import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";
import ScrollDriftGallery from "@/components/effects/ScrollDriftGallery";

// Retreats — une seule offre, et beaucoup de choses qu'elle n'est pas.
//
// La page tient sur un refus : « ce n'est pas un sejour bien-etre ». Il etait
// en bas, apres un filet, en petit et en italique — c'est-a-dire a l'endroit
// exact ou personne ne lit. Or c'est precisement ce refus qui qualifie le
// visiteur : celui qui cherche un programme s'en va, celui qui cherche autre
// chose reconnait la maison.
//
// Il passe donc au meme rang que la promesse, en vis-a-vis, et il n'est plus
// ecrit en taupe italique.

export const metadata = {
  title: "Retreats · Maison du Calme",
  // La meta description est ce que Google affiche : c'est souvent la premiere
  // phrase de vente qu'un visiteur lit, avant meme la page. Elle disait
  // « No fixed dates. Register interest. » — soit l'absence, puis la langue des
  // salons professionnels. Elle porte maintenant la rarete et l'urgence vraie.
  description: "One retreat a year from Maison du Calme, very few places, by application. Somewhere far enough to stop being reachable. Places go to the list first.",
};

export default function RetreatsPage() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>Retreats</p>
        <h1 style={{ ...bigHead, marginTop: 36, maxWidth: "16ch" }}>
          <SplitTextChars text="Once a year. Very few people. Somewhere quiet." delay={22} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          The work, given room and time it cannot have in a single afternoon in London.
        </p>

        <div style={{ marginTop: 72 }}>
          <AssetFrame slot="RT-01" kind="image" src="/photos/rt-01.jpg" aspect="21/9" effect="reveal"
            prompt="Carved onyx, a wide panorama, light settling at the centre." />
        </div>

        <section className="mdc-gap--sm mdc-two">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <p style={body}>
              There is one retreat. It is small, small enough that it is arranged around
              the people in it, not the other way round. It happens rarely, and it is
              offered by application only.
            </p>
            {/* COPY NOUVELLE — a valider.
                L'ancien texte disait « nous ne sommes pas prets a dire ou ni
                quand » : ca se lit comme un projet mal ficele, pas comme de la
                rigueur. Kilian a donne le vrai critere — l'Asie, chaud et loin,
                mais rejete des que ca klaxonne — et ce critere est bien plus
                fort que n'importe quelle destination. Toutes les retraites
                choisissent la villa photogenique ; celle-ci choisit le silence,
                et n'a pas encore trouve. L'absence de lieu devient la preuve du
                serieux au lieu d'en etre le contraire.
                Ce qui reste INTERNE et n'a rien a faire ici : « cheap to
                operate ». C'est de l'economie, pas une promesse. */}
            <p style={body}>
              It will be far, and warm — the kind of distance that makes the return
              flight feel like a decision rather than a commute. Asia, most likely.
            </p>
            <p style={body}>
              The place is not chosen for how it photographs. It is chosen for what you
              cannot hear from the room. Most of the beautiful ones fail that test: an
              ocean in front and a road behind it is not silence, and one horn at six in
              the morning undoes a week. We have not named a place yet because we have
              not found one quiet enough.
            </p>
            <p style={micro}>By application · No fixed dates</p>
          </div>

          {/* Le refus, remonte au rang de la promesse. En bas de page et en
              taupe italique, il ne qualifiait personne. */}
          <div>
            <p style={eyebrow}>What it is not</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              This is not a wellness holiday.
            </h2>
            <p style={{ ...body, marginTop: 28 }}>
              There is no programme, no schedule of activities, no group of strangers.
              If that is what you are looking for, this is not it, and we would rather
              say so.
            </p>
          </div>
        </section>

        {/* COPY NOUVELLE — a valider.
            Le point que Kilian voulait et que la page ne disait pas : ce n'est
            pas un sejour, c'est une COUPURE. Le meme travail sur des jours au
            lieu de minutes, et surtout une vie quotidienne mise a distance
            assez longtemps pour cesser de decider a votre place. */}
        <section className="mdc-gap--sm mdc-two">
          <div>
            <p style={eyebrow}>What it is for</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              Long enough to stop being reachable.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <p style={body}>
              A session gives the body an hour where nothing is required of it. Days give
              it something else. The first day is spent putting down the phone. The second
              is spent noticing how much of you was running the phone. What happens after
              that is the reason to go.
            </p>
            <p style={body}>
              It is the same work, uninterrupted, over days instead of minutes — and for
              the few who have gone all the way in a single session, it is the natural next
              thing. Not a break from your life. A distance from it, long enough to hear
              yourself over it.
            </p>
          </div>
        </section>

        {/* COPY NOUVELLE — a valider.
            Kilian veut un recit qui cree de la communaute. C'est en tension
            frontale avec le reste de la maison : un a un, silencieux, personne
            n'est nomme. La retraite est le seul endroit ou plusieurs personnes
            sont ensemble, donc le seul endroit ou la communaute a sa place.
            Le piege serait le cercle de parole et les presentations : ces
            gens-la fuient exactement ca. Ce qu'ils n'ont jamais, en revanche,
            c'est une piece ou ils ne sont pas le plus solide. La communaute
            se joue donc dans la RECONNAISSANCE, pas dans l'echange — et elle
            reste compatible avec le silence que le site vend partout ailleurs. */}
        <section className="mdc-gap mdc-two">
          <div>
            <p style={eyebrow}>Who else is there</p>
            <h2 style={{ ...sectionHead, marginTop: 26 }}>
              Everyone in the room is carrying something.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <p style={body}>
              You will not have to explain yourself. Not because nobody asks — nobody
              will — but because the people beside you came for the same reason, and they
              already know what it costs to be the one everybody leans on.
            </p>
            <p style={body}>
              Most people this work is for have never been in a room where that was true.
              They are the capable one, at work and at home, and they are the capable one
              on holiday too. Here, for a few days, nobody needs anything from you.
            </p>
            <p style={body}>
              Nothing is required of you socially either. There is no circle, no sharing
              round, no introductions where you say what you do for a living. Some people
              are talking by the third day. Some never do, and leave with the same thing.
            </p>
          </div>
        </section>

        {/* Faits donnes par Kilian : repas et logement compris, vol non. */}
        <section className="mdc-gap--sm">
          <p style={eyebrow}>What is included</p>
          <h2 style={{ ...sectionHead, marginTop: 26 }}>
            Everything once you land.
          </h2>
          <p style={{ ...body, marginTop: 28 }}>
            Accommodation and every meal are included, and so is the work itself. Flights
            are not — you book your own, and you come from wherever you are.
          </p>
          <p style={{ ...micro, marginTop: 30 }}>
            Accommodation and meals included · Flights not included
          </p>
        </section>

        {/* La confiance se lit dans ce qu'on NE dit pas.
            Premiere version, ecartee par Kilian : « si je lisais ca sur un
            site je ne m'inscrirais jamais, ca fait tres amateur ». Il a
            raison, et l'erreur est instructive — elle faisait trois choses
            qu'une marque premium ne fait jamais.

            Elle ENUMERAIT CE QU'ELLE N'AVAIT PAS : « ni le pays, ni les dates,
            ni la duree ». Trois aveux dans une seule respiration.

            Elle SE FELICITAIT D'ETRE HONNETE — « that is the honest position ».
            Personne ne dit ca en ayant autre chose a offrir.

            Et elle DEMANDAIT AU CLIENT DE CONCEVOIR LE PRODUIT : « si dix jours
            c'est impossible et cinq non, dites-le-nous ». On transformait
            l'acheteur en chef de projet.

            L'incertitude est deja traitee plus haut, et bien : le lieu n'est
            pas nomme parce qu'aucun n'etait assez silencieux. C'est un
            CRITERE, pas une excuse. Le repeter ici en langue d'excuse annulait
            la force de la premiere.

            Il reste trois phrases, et rien sur ce qui n'est pas decide.
            L'envie de faire participer les inscrits n'est pas mauvaise — mais
            sa place est dans la reponse privee de Kilian, pas dans la vitrine.
            Une vitrine affirme ; on negocie a l'interieur. */}
        <section className="mdc-gap">
          <p style={eyebrow}>If you want to be there</p>
          <h2 style={{ ...sectionHead, marginTop: 26, maxWidth: "22ch" }}>
            The first people asked will be the people on this list.
          </h2>
          <div className="mdc-measure" style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}>
            <p style={body}>
              Very few places, and they are offered to the people on this list before they
              are offered anywhere else.
            </p>
            <p style={body}>
              You will hear from Kilian once, when it opens. Not before, not about anything
              else, and never from anyone but Kilian.
            </p>
          </div>
          <p style={{ ...micro, marginTop: 34 }}>One line is enough · No newsletter</p>
          <div style={{ marginTop: 44 }}>
            <QuietButton href="/begin">Put your name down</QuietButton>
          </div>
        </section>
      </div>

      <div style={{ marginTop: 180, position: "relative", zIndex: 5 }}>
        <ScrollDriftGallery
          direction="right"
          amplitude={28}
          height={420}
          gap={28}
          fluid
          items={[
            { src: "/photos/rt-01.jpg", width: 380, alt: "" },
            { src: "/photos/lp-02.jpg", width: 300, alt: "" },
            { src: "/photos/si-02.jpg", width: 340, alt: "" },
          ]}
        />
      </div>
    </main>
  );
}
