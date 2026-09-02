import { pageStyle, body, lead, bigHead, sectionHead, eyebrow, micro, label } from "@/styles/page";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";
import ScrollDriftGallery from "@/components/effects/ScrollDriftGallery";

// Sessions — la page qui vend.
//
// Elle ne vendait pas. Le texte etait juste ; la mise en page l'enterrait.
// Une colonne de 720 px posee sur une carte translucide floutee, tout empile
// dans le meme ordre et la meme taille, des filets <hr> entre les salles, et
// UNE image pour quatre salles. Il fallait scroller quatre longues sections
// pour decouvrir qu'il y en avait quatre.
//
// Ce qui change, et pourquoi :
//
//   - un INDEX en haut. Un visiteur voit la forme de l'offre en un ecran :
//     quatre salles, leurs durees, leur promesse en une ligne. C'est le seul
//     changement qui, a lui seul, fait passer la page de « des citations qui
//     defilent » a « voila ce que je peux prendre » ;
//   - chaque salle devient une DOUBLE PAGE, image d'un cote, texte de l'autre,
//     et le cote alterne en descendant. La page respire au lieu d'empiler ;
//   - les quatre images existent maintenant et servent toutes les quatre ;
//   - la carte translucide disparait. Une boite floutee posee sur un fond, ce
//     n'est pas une mise en page, c'est un aveu : on ne fait pas confiance au
//     fond. Le marbre est clair (luminance 205), le brou s'y lit ;
//   - les filets <hr> laissent place a un NUMERO de salle. Un trait est une
//     separation gratuite ; un numero dit ou l'on en est.
//
// La copy n'est pas reecrite : elle est bonne, et elle est validee. Seules les
// lignes de l'index sont nouvelles, dans la meme voix.

export const metadata = {
  title: "Sessions · Maison du Calme",
  description: "The sessions of Maison du Calme. Silent, one to one, fully clothed, in Battersea. NERVANA begins with ANTARA. From £130 to £250.",
};

// L'index. Une ligne par salle, ecrite pour etre lue en diagonale.
//
// La meta porte le RANG, pas la duree. Avant, elle affichait « 60 minutes ·
// £180 » a cote de « 90 minutes · £250 » : quatre salles, quatre prix, cote a
// cote — un menu. Or la prose juste au-dessus dit « a suite, not a selection
// […] never from a list », et Kilian : « nervana est une suite, ca peut pas
// etre 180 ». Quelqu'un qui scanne lisait VAYU a £180 comme une porte
// d'entree moins chere que l'entree obligatoire a £250.
// Les durees n'ont pas disparu : chaque salle porte la sienne plus bas.
const INDEX = [
  { n: "01", name: "ANTARA", meta: "The entrance · £250", line: "The weight you have carried longest." },
  { n: "02", name: "VAYU", meta: "After ANTARA · £180", line: "When you cannot get a full breath." },
  { n: "03", name: "SOMA", meta: "After ANTARA · £180", line: "The tension you have stopped noticing." },
  { n: "04", name: "TRANSMISSION", meta: "By application", line: "The deepest room. Not for everyone." },
];

export default function SessionsPage() {
  return (
    <main style={pageStyle}>


      <div className="mdc-wrap">
        <p style={eyebrow}>Sessions</p>
        <h1 style={{ ...bigHead, marginTop: 36 }}>
          <SplitTextChars text="It begins with ANTARA." delay={22} duration={900} />
        </h1>
        <p style={{ ...lead, marginTop: 40 }}>
          Each begins the same way, in silence, fully clothed, with nothing required of you.
          Each leaves you somewhere different.
        </p>

        <div className="mdc-measure" style={{ marginTop: 44 }}>
          <p style={body}>
            The work practised here is called NERVANA. Kilian developed it, and it is
            practised nowhere else.
          </p>
          <p style={{ ...body, marginTop: 24 }}>
            It is a suite, not a selection. ANTARA is the entrance. Everyone passes
            through it, and what lies beyond opens in its own order, in conversation,
            never from a list. What they share: you are not touched with oil, not asked
            to speak, not asked to perform being well. What they change: the amount you
            are holding when you leave.
          </p>
        </div>

        {/* L'index. Sans lui, il fallait scroller quatre sections pour
            apprendre qu'il y en avait quatre. */}
        <nav className="mdc-index" aria-label="The four rooms">
          {INDEX.map((r) => (
            <a key={r.name} href={`#${r.name.toLowerCase()}`}>
              <span style={{ ...micro, fontStyle: "normal", opacity: 0.7 }}>{r.n}</span>
              <span style={{ ...label, fontSize: 19 }}>{r.name}</span>
              <span style={{ ...body, fontSize: 17, maxWidth: "none" }}>{r.line}</span>
              <span style={micro}>{r.meta}</span>
            </a>
          ))}
        </nav>
        {/* COPY NOUVELLE — a valider.
            Le site disait « in London », deux fois, et rien d'autre. Pour une
            maison privee ou l'on demande a quelqu'un d'ecrire avant de venir,
            ne pas dire ou l'on est se lit comme une reticence, pas comme de la
            discretion.
            Le QUARTIER, pas l'adresse : SW11 2UG est une adresse, et une
            adresse se donne dans la conversation, apres. */}
        <p style={{ ...micro, marginTop: 28 }}>
          Battersea, South West London · £130 to £250
        </p>

        {/* ---- 01 ANTARA ---- */}
        <section id="antara" className="mdc-room">
          <div className="mdc-room__art">
            <AssetFrame slot="SI-01" kind="image" src="/photos/si-01.jpg" aspect="4/5" effect="reveal"
              prompt="Carved onyx, the widest frame of the house stone." />
          </div>
          <div>
            <p className="mdc-num">01</p>
            <p style={label}>ANTARA</p>
            <p style={{ ...micro, marginTop: 14 }}>90 minutes · The threshold session</p>
            <h2 style={{ ...sectionHead, marginTop: 30 }}>
              For the weight you have carried longest.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 34 }}>
              <p style={body}>
                Ninety minutes for the thing underneath the other things. ANTARA is the
                entrance, and the session they return to. It is unhurried by
                design, long enough for the body to stop bracing, and then to let go of
                what the bracing was holding.
              </p>
              <p style={body}>
                You will not be asked what it is. The body knows where it is kept.
              </p>
              <p style={body}>
                Most leave quieter than they have been in years. Some leave having released
                something they could not have named on the way in.
              </p>
            </div>
            <p style={{ ...micro, marginTop: 36 }}>£250 · 90 minutes · The entrance to the suite</p>
          </div>
        </section>

        {/* ---- 02 VAYU ---- */}
        <section id="vayu" className="mdc-room mdc-room--flip">
          <div className="mdc-room__art">
            <AssetFrame slot="SI-02" kind="image" src="/photos/si-02.jpg" aspect="4/5" effect="reveal"
              prompt="Alabaster, air and a single pass of light." />
          </div>
          <div>
            <p className="mdc-num">02</p>
            <p style={label}>VAYU</p>
            <p style={{ ...micro, marginTop: 14 }}>60 minutes · For the tightness that lives high</p>
            <h2 style={{ ...sectionHead, marginTop: 30 }}>
              When you cannot get a full breath.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 34 }}>
              <p style={body}>
                Sixty minutes for the held chest, the shallow breath, the sense of running
                slightly ahead of yourself. VAYU works with what restricts, and returns the
                breath you have been taking in halves.
              </p>
              <p style={body}>
                You leave with more room. Not a metaphor. More room.
              </p>
            </div>
            <p style={{ ...micro, marginTop: 36 }}>£180 · 60 minutes · Opens after ANTARA, in conversation</p>
          </div>
        </section>

        {/* ---- 03 SOMA ---- */}
        <section id="soma" className="mdc-room">
          <div className="mdc-room__art">
            <AssetFrame slot="SI-03" kind="image" src="/photos/si-03.jpg" aspect="4/5" effect="reveal"
              prompt="Carved onyx, the closest and deepest frame." />
          </div>
          <div>
            <p className="mdc-num">03</p>
            <p style={label}>SOMA</p>
            <p style={{ ...micro, marginTop: 14 }}>60 minutes · For what the body has stored</p>
            <h2 style={{ ...sectionHead, marginTop: 30 }}>
              The tension you have stopped noticing.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 34 }}>
              <p style={body}>
                Sixty minutes for the held body: the shoulders that no longer come down,
                the jaw, the places that have been tight so long they feel like structure.
                SOMA meets the tissue where it has settled and lets it change its mind.
              </p>
              <p style={body}>
                You leave lower to the ground. Steadier. Returned to your own weight.
              </p>
            </div>
            <p style={{ ...micro, marginTop: 36 }}>£180 · 60 minutes · Opens after ANTARA, in conversation</p>
          </div>
        </section>

        {/* ---- 04 TRANSMISSION ---- */}
        <section id="transmission" className="mdc-room mdc-room--flip">
          <div className="mdc-room__art">
            <AssetFrame slot="SI-04" kind="image" src="/photos/si-04.jpg" aspect="4/5" effect="reveal"
              prompt="Carved onyx held back in shadow, one band of light." />
          </div>
          <div>
            <p className="mdc-num">04</p>
            <p style={label}>TRANSMISSION</p>
            <p style={{ ...micro, marginTop: 14 }}>By application · Rarely, and to few</p>
            <h2 style={{ ...sectionHead, marginTop: 30 }}>
              The deepest room. Not for everyone, and not often.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 34 }}>
              <p style={body}>
                TRANSMISSION is not booked. It is applied for, and it is granted rarely, and
                to very few people at all.
              </p>
              <p style={body}>
                It asks more of you and returns more. Those it is for tend to
                recognise it before it is described.
              </p>
              <p style={body}>
                If you feel it is yours, say so.
              </p>
            </div>
            <div style={{ marginTop: 44 }}>
              <QuietButton href="/begin">Apply</QuietButton>
            </div>
          </div>
        </section>

        {/* Les soins ayurvediques vivent APRES la suite et hors d'elle. NERVANA
            promet "not touched with oil" : Abhyanga est un soin a l'huile, il ne
            peut pas etre dans la meme promesse. Separer les deux protege la
            phrase et la verite. */}
        <section id="also" className="mdc-gap">
          <p style={eyebrow}>Also practised here</p>
          <h2 style={{ ...sectionHead, marginTop: 30, maxWidth: "24ch" }}>
            Older than the house.
          </h2>
          <p style={{ ...body, marginTop: 30 }}>
            Four practices are offered apart from the suite. They are not part of
            NERVANA, and they are not silent in the same way. Abhyanga and Marma are
            Ayurvedic, learned in India and practised in their old form.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 56, marginTop: 72,
          }}>
            <div>
              <p style={{ ...label, fontSize: 19 }}>ABHYANGA</p>
              <p style={{ ...micro, marginTop: 12, fontSize: 11.5 }}>Ayurvedic · 60 minutes · £160</p>
              <p style={{ ...body, marginTop: 18, fontSize: 17 }}>
                Warm oil, worked over the whole body in one unbroken rhythm. It is the
                oldest practice in this house, and the only one that uses oil.
              </p>
            </div>
            <div>
              <p style={{ ...label, fontSize: 19 }}>MARMA</p>
              <p style={{ ...micro, marginTop: 12, fontSize: 11.5 }}>Ayurvedic · 60 minutes · £160</p>
              <p style={{ ...body, marginTop: 18, fontSize: 17 }}>
                The junctions where the body gathers what it holds. Marma work is
                pressure and stillness at those points, slower than massage and more
                deliberate.
              </p>
            </div>
            <div>
              <p style={{ ...label, fontSize: 19 }}>REIKI</p>
              <p style={{ ...micro, marginTop: 12, fontSize: 11.5 }}>60 minutes · £130</p>
              <p style={{ ...body, marginTop: 18, fontSize: 17 }}>
                Hands resting on the body, or just above it, and held. Nothing is
                pressed and nothing is moved. Fully clothed, in silence.
              </p>
              {/* Kilian est maitre et peut enseigner tous les niveaux ; il
                  n'enseigne que le premier. Ecrire l'un sans l'autre deforme,
                  donc les deux tiennent dans la meme phrase. La page d'accueil
                  ne porte plus ce fait : c'est ici qu'on parle d'enseignement. */}
              <p style={{ ...micro, marginTop: 18, fontSize: 11.5 }}>
                Kilian is a Reiki master. He teaches level one.
              </p>
            </div>
            <div>
              <p style={{ ...label, fontSize: 19 }}>SOUND</p>
              <p style={{ ...micro, marginTop: 12, fontSize: 11.5 }}>60 minutes · £140</p>
              <p style={{ ...body, marginTop: 18, fontSize: 17 }}>
                Bowls set directly on the body and struck softly, so the tone arrives
                through the body before it reaches the ear. Fully clothed, face down,
                then turned. It is the only work here you will hear.
              </p>
            </div>
          </div>
        </section>

        <section className="mdc-gap">
          <p style={eyebrow}>The Arc</p>
          <h2 style={{ ...sectionHead, marginTop: 30 }}>
            The work is not a single visit.
          </h2>
          <p style={{ ...body, marginTop: 36 }}>
            What is set down once can be set down more completely across a series. The Arc
            is a sequence of sessions, taken over time, for those who would rather go all
            the way than go once. It is arranged privately, in conversation.
          </p>
          <p style={{ ...micro, marginTop: 36 }}>By arrangement</p>
        </section>
      </div>

      {/* Bandeau atmospherique — les quatre salles qui derivent au scroll. */}
      <div style={{ marginTop: 180, position: "relative", zIndex: 5 }}>
        <ScrollDriftGallery
          direction="left"
          amplitude={30}
          height={420}
          gap={32}
          fluid
          items={[
            { src: "/photos/si-01.jpg", width: 300, alt: "" },
            { src: "/photos/si-02.jpg", width: 340, alt: "" },
            { src: "/photos/si-03.jpg", width: 300, alt: "" },
            { src: "/photos/si-04.jpg", width: 340, alt: "" },
          ]}
        />
      </div>
    </main>
  );
}
