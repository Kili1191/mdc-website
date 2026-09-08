"use client";

import { useEffect, useRef } from "react";
import BreathReveal from "@/components/BreathReveal";
import RailEpingle from "@/components/RailEpingle";
import SplitTextChars from "@/components/effects/SplitTextChars";
import QuietButton from "@/components/effects/QuietButton";
import AssetFrame from "@/components/effects/AssetFrame";
import { useIntroReady } from "@/lib/introReady";
import { COLORS, FONTS } from "@/styles/tokens";
import { body as pageBody, sectionHead, eyebrow, micro, label } from "@/styles/page";
import { scrollStore } from "@/lib/scrollStore";
import { houseFocus } from "@/lib/houseFocus";


// Home = "la traversée de la maison" — 6 stations scroll-scrub.
// Pas de pin. Le scroll est libre (Lenis). Chaque station fait un ecran
// stable (100svh, voir .mdc-station dans globals.css).
// Sa visibilité est calculée en continu à partir du progrès de scroll
// (0..1) via une courbe gaussienne centrée sur son propre pas. Aucun
// re-render React par frame : on mute le DOM directement via refs.
// Modèle Awwwards 2024–2026 (Studio Freight, Igloo Inc, Active Theory).

const displayItalic: React.CSSProperties = {
  fontFamily: FONTS.higuen,
  fontStyle: "italic",
  fontWeight: 400,
  color: COLORS.brouFonce,
  margin: 0,
  lineHeight: 1.2,
  letterSpacing: "-0.005em",
};
// LES PLAFONDS DE CES CLAMP ETAIENT TOUS ATTEINTS VERS 1180px DE LARGE.
//
// 3,8vw plafonne a 40px des 1053px ; 5,5vw a 62px des 1127. Au-dela, plus
// rien ne grandit : un portable de 1200 et un moniteur de 3000 recevaient
// exactement la meme typographie. Sur un grand ecran la phrase devenait un
// ilot de 310px dans un champ vide, et c'est ce que Kilian a vu — « the
// website is already empty ».
//
// Les coefficients vw, eux, avaient ete choisis. Ce sont les plafonds qui
// etaient arbitraires. Ils laissent maintenant courir le meme rapport
// jusqu'a environ 1700px de large, puis s'arretent — au-dela, une ligne
// d'affichage cesse de se lire d'un seul regard.
//
// Le corps de texte ne bouge pas : 20px est une mesure de lecture, pas une
// mesure d'echelle, et le grossir se paierait en lisibilite.
const displayCaps: React.CSSProperties = {
  fontFamily: FONTS.higuen,
  fontSize: "clamp(26px, 3.6vw, 60px)",
  lineHeight: 1.55,
  color: COLORS.brouFonce,
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 400,
};
const linkStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.28em",
  textTransform: "uppercase", color: COLORS.brou,
  textDecoration: "none",
  borderBottom: `1px solid ${COLORS.rouille}`, paddingBottom: 4,
};
const bodyStyle: React.CSSProperties = {
  fontFamily: FONTS.prata,
  fontSize: "clamp(17px, 1.5vw, 20px)",
  lineHeight: 1.75,
  color: COLORS.brou,
  margin: 0,
  maxWidth: 640,
};
const stationStyle: React.CSSProperties = {
  position: "relative", zIndex: 5,
  // La hauteur vit dans .mdc-station (globals.css), pas ici : une regle inline
  // ne peut pas porter le repli `height:100vh; height:100svh;`.
  width: "100%",
  display: "flex", alignItems: "center", justifyContent: "center",
  // La marge laterale vit dans .mdc-station (globals.css), pas ici. Inline,
  // elle battait la voie reservee a la regle gravee — une regle de feuille de
  // style ne peut pas gagner contre un style en ligne, et le texte cale a
  // gauche repassait sous les noms de stations.
  willChange: "opacity, transform",
};

// LE RYTHME DE LA DESCENTE.
//
// Les six stations etaient composees a l'identique : tout centre, tout
// symetrique. Six ecrans qui se ressemblent donnent l'impression de ne pas
// avancer — c'est ce qui fait qu'une page tres soignee peut quand meme
// paraitre plate. Le centre n'est pas neutre, il est simplement le reglage
// par defaut, et l'utiliser six fois de suite est un choix par omission.
//
// L'alternance suit le SENS, pas un motif decoratif :
//   centre  — le seuil : on entre par le milieu.
//   gauche  — le poids. La phrase arrive de cote, en desequilibre, comme
//             ce qu'elle decrit.
//   centre  — la maison. C'est la these, elle se tient droite.
//   [gravure] — pas de texte. Le souffle entre les deux moities.
//   droite  — Kilian. Le second diagnostic, en miroir du premier.
//   centre  — Begin. On ressort par ou l'on est entre.
//
// La page est donc symetrique autour de la gravure, et les deux seules
// phrases qui nomment la fatigue sont les deux seules poussees aux marges.
type Cote = "centre" | "gauche" | "droite";
const RANGEE: Record<Cote, React.CSSProperties["justifyContent"]> = {
  centre: "center", gauche: "flex-start", droite: "flex-end",
};
const station = (cote: Cote, extra?: React.CSSProperties): React.CSSProperties => ({
  ...stationStyle, justifyContent: RANGEE[cote], ...extra,
});
const texteDe = (cote: Cote): React.CSSProperties["textAlign"] =>
  cote === "centre" ? "center" : cote === "gauche" ? "left" : "right";

// Courbe de presence d'une station. `t` va de 0 (absente) a 1 (posee).
//
// smoothstep plutot que gaussienne : une gaussienne n'atteint jamais zero, il
// fallait donc la couper a 0,35 et remettre a l'echelle — et ce seuil coupait
// la presence net, ce qui creait les trous. Celle-ci vaut exactement 0 au bout
// de sa portee et exactement 1 au centre, avec des depart et arrivee plats.
function douceur(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

// Le sommaire de la pratique. NERVANA est une SUITE et commence toujours par
// ANTARA — d'ou le lien direct vers cette salle. Les quatre autres pratiques
// ne font pas partie de la suite : elles vivent dans « Also practised here ».
// Le coaching est la seule chose qui ne se passe pas dans la maison.
const PRATIQUE = [
  { n: "01", name: "NERVANA",  href: "/sessions#antara", meta: "ANTARA · £250",
    line: "The suite Kilian built. It opens with ANTARA, always." },
  { n: "02", name: "ABHYANGA", href: "/sessions#also",   meta: "Ayurvedic · £160",
    line: "Warm oil, worked over the body in one unbroken rhythm." },
  { n: "03", name: "MARMA",    href: "/sessions#also",   meta: "Ayurvedic · £160",
    line: "The junctions where the body gathers what it holds." },
  { n: "04", name: "REIKI",    href: "/sessions#also",   meta: "£130",
    line: "Hands resting on the body, or just above it, and held." },
  { n: "05", name: "SOUND",    href: "/sessions#also",   meta: "£140",
    line: "Bowls set on the body. The only work here you will hear." },
  { n: "06", name: "COACHING", href: "/coaching",        meta: "On a call · from £150",
    line: "One conversation, or six, wherever you are." },
];


export default function Home() {
  const ready = useIntroReady();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    const stations = Array.from(root.querySelectorAll<HTMLElement>(".mdc-station"));

    // Boucle rAF qui lit le scrollStore et met à jour l'opacité + le Y
    // de chaque station en continu. Zéro re-render React.
    let raf = 0;
    // Chaque station se mesure elle-meme : son focus depend de la distance
    // entre son centre et celui du viewport, pas d'un progres global decoupe
    // en parts egales. Une station peut donc etre plus haute qu'une autre
    // sans casser la choregraphie, et aucune constante n'est a re-caler.
    // AMPLITUDE DE LA TRAVERSEE — virage du 8 septembre.
    //
    // La choregraphie d'avant tenait en une opacite et QUATORZE pixels de
    // deplacement. A l'echelle d'une station plein ecran, quatorze pixels ne
    // se percoivent pas : les six ecrans se succedaient en fondu, sans poids,
    // et c'est une des raisons pour lesquelles la page paraissait plate.
    // L'ancienne regle §3 du skill plafonnait le reveal a 0,6em — elle est
    // renversee, voir VISION.md.
    //
    // Une station arrive maintenant de 96px plus bas et legerement plus
    // petite, puis se pose. Celle qui part fait l'inverse. Le mouvement suit
    // le sens de lecture : on DESCEND dans la maison, donc ce qui vient monte
    // vers vous et ce qui s'en va s'enfonce.
    //
    // transform et opacity uniquement — rien qui declenche une mise en page,
    // tout sur le GPU. C'est la seule contrainte du 10 qui ne bouge pas.
    // LE CHEVAUCHEMENT — ET POURQUOI C'EST UNE TRAINE, PAS UNE COURSE.
    //
    // Kilian : « chevauchement ok mais l'autre doit disparaitre en meme temps
    // par magic ca peut pas etre brouillon ».
    //
    // Le trou est STRUCTUREL, et c'est la mesure qui l'a montre : les centres
    // de deux stations consecutives sont a 1200px l'un de l'autre pour un
    // ecran de 900. A mi-chemin, l'une est a 600px au-dessus du centre et
    // l'autre a 600 en dessous — la demi-hauteur d'ecran vaut 450, donc LES
    // DEUX SONT DEHORS. Aucun reglage d'opacite ne peut remplir ca : il n'y a
    // rien a l'ecran a montrer.
    //
    // Ma premiere version poussait chaque station de 300px dans le sens de sa
    // sortie. Elle aggravait exactement le probleme : elle eloignait encore les
    // deux textes du centre et elargissait le trou de 600px.
    //
    // Donc l'inverse. Le bloc TRAINE : il se deplace a 70 % de la vitesse du
    // scroll, retenu vers le centre. A mi-chemin, la sortante est retenue de
    // 180px et se tient a -420 — dans l'ecran, en haut, fantome. L'entrante
    // est a +420 — dans l'ecran, en bas, fantome. Elles sont separees de 840px
    // pour des blocs de 240 : elles ne se touchent jamais.
    //
    // C'est ca, la magie demandee : au moment ou l'une s'efface l'autre est
    // deja la, a l'autre bout de l'ecran, et a aucun instant deux textes ne se
    // superposent.
    const TRAINE = 0.30;    // fraction du scroll que le bloc ne suit pas
    const PLAFOND = 460;    // px, au-dela l'opacite est nulle de toute facon
    const ECHELLE_MIN = 0.94; // jamais > 1 : agrandir deborderait l'ecran
    // Portee, en ESPACEMENTS ENTRE STATIONS — pas en hauteurs d'ecran, et la
    // distinction m'a coute une passe.
    //
    // J'avais suppose que deux stations consecutives etaient espacees d'un
    // ecran, puisqu'elles font chacune 100svh. Mesure : leurs centres sont a
    // 1200px l'un de l'autre pour un ecran de 900. Il y a 327px de vide entre
    // le bas de « seuil » et le haut de « poids », et les hauteurs elles-memes
    // varient (900 pour la premiere, 846 pour les suivantes). Normaliser par
    // la hauteur de l'ecran donnait donc une distance 1,33 fois trop grande au
    // croisement, et les deux stations y tombaient a 0,12 d'opacite : le noir
    // que je cherchais justement a supprimer.
    //
    // L'espacement est donc MESURE, et la portee s'exprime par rapport a lui.
    // 0,85 veut dire : une station s'eteint aux 85 % du chemin vers sa
    // voisine. Elles se recouvrent, sans jamais etre trois.
    const PORTEE = 0.85;

    // Mediane des ecarts entre centres consecutifs. Mediane et non moyenne :
    // l'ecart entre la gravure et « Kilian » vaut 3486px parce que le rail
    // epingle vit entre les deux, et une moyenne se ferait emporter par lui.
    // Dernier decalage applique a chaque station. Il sert a RETRANCHER le
    // transform de la mesure : `getBoundingClientRect()` renvoie la boite
    // APRES transformation, donc le deplacement qu'on applique se reinjecte
    // dans le calcul de la distance qui l'a produit. Une boucle de
    // retroaction. A 14px elle etait invisible ; a 300 elle ecrase la courbe —
    // mesure : une station encore a un tiers de son espacement du centre
    // tombait a 0,03 d'opacite au lieu de 0,57, et rouvrait le trou que tout
    // ce chantier cherche a fermer.
    const decalages = new Array<number>(stations.length).fill(0);

    const espacement = (() => {
      // Mesure prise AVANT que la boucle ne pose le moindre transform, donc
      // sur la mise en page nue.
      const centres = stations.map((st) => {
        const r = st.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
      const ecarts = centres.slice(1).map((c, i) => c - centres[i]).sort((a, b) => a - b);
      return ecarts.length ? ecarts[Math.floor(ecarts.length / 2)] : window.innerHeight;
    })();

    // Mouvement reduit : l'opacite seule. La station arrive et repart, elle
    // ne voyage plus. Ce n'est pas de la retenue, c'est une preference
    // systeme, et elle passe avant le virage.
    const sobre = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lastY = window.scrollY;
    let goingUp = false;
    const downEls = root.querySelectorAll<HTMLElement>('[data-dir="down"]');
    const upEls = root.querySelectorAll<HTMLElement>('[data-dir="up"]');

    const tick = () => {
      const vh = window.innerHeight;

      // Hysteresis : un tremblement de trackpad ne doit pas faire clignoter
      // la phrase. Il faut six pixels francs pour changer d'avis.
      const y = window.scrollY;
      if (y - lastY > 6) goingUp = false;
      else if (lastY - y > 6) goingUp = true;
      lastY = y;
      downEls.forEach((e) => { e.style.opacity = goingUp ? "0" : "1"; });
      upEls.forEach((e) => { e.style.opacity = goingUp ? "1" : "0"; });

      const last = stations.length - 1;
      stations.forEach((st, i) => {
        const r = st.getBoundingClientRect();
        // Position REELLE, transform retranche. L'echelle, elle, n'entre pas
        // dans le compte : elle se joue autour du centre, qui ne bouge donc
        // pas.
        const stCenter = r.top + r.height / 2 - decalages[i];
        // Distance normalisee : 0 quand la station est au centre de l'ecran,
        // 1 quand elle est a un espacement de station de ce centre.
        const d = (stCenter - vh / 2) / espacement;
        let focus = douceur(1 - Math.abs(d) / PORTEE);
        // Premiere station nette a l'arrivee, derniere nette en sortie.
        if (i === 0 && d >= 0) focus = 1;
        else if (i === last && d <= 0) focus = 1;
        st.style.opacity = String(focus);
        if (sobre.matches) {
          decalages[i] = 0;
          st.style.transform = "";
        } else {
          // Ecart au centre, en pixels. Positif : la station est sous le
          // centre, elle arrive. La traine s'y oppose, d'ou le signe moins.
          const ecart = stCenter - vh / 2;
          const y = Math.max(-PLAFOND, Math.min(PLAFOND, -ecart * TRAINE));
          const e = ECHELLE_MIN + (1 - ECHELLE_MIN) * focus;
          decalages[i] = y;
          st.style.transform = `translate3d(0, ${y}px, 0) scale(${e})`;
        }
        st.style.pointerEvents = focus > 0.15 ? "auto" : "none";

        // La station MAISON publie son etat pour le shader du marbre. La
        // gravure n'existe donc que la ou cette section domine l'ecran.
        // L'ancrage se fait sur l'ID, pas sur `data-station`. Ce dernier est
        // devenu un LIBELLE lisible (« The house », « Threshold »…) : la
        // condition d'avant, qui y cherchait « maison », n'etait plus jamais
        // vraie, et le burin de cette station ne s'enfoncait plus du tout.
        if (st.id === "maison") {
          // Avancee du burin. Elle doit s'achever QUAND la maison est la plus
          // visible, pas quand elle s'en va.
          //
          // La version precedente divisait par la hauteur entiere de la
          // station : le trait n'etait acheve qu'une fois le BAS de la station
          // au centre de l'ecran, or a ce moment la presence est deja retombee
          // a zero. La maison etait donc a moitie gravee a son apogee, et
          // entierement gravee au moment ou plus personne ne la voyait.
          //
          // On divise par la demi-hauteur : le trait se termine quand le CENTRE
          // de la station atteint le centre de l'ecran, c'est-a-dire au pic de
          // presence. Ensuite il reste acheve.
          const cut = Math.max(0, Math.min(1, (vh / 2 - r.top) / (r.height / 2)));
          houseFocus.set(focus, cut);
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // premier tick immédiat aussi
    tick();
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  if (!ready) return null;

  return (
    <>

      <div ref={rootRef}>
        {/* 1. SEUIL — pas de rectangle média, le marbre ambient (SiteMarble)
            suffit. Le titre au centre. */}
        <section id="seuil" data-station="Threshold" className="mdc-station"
                 style={station("centre", { flexDirection: "column" })}>
          {/* C'est le <h1> du site. L'accueil n'en avait aucun — les sept
              autres pages en ont un — et cette phrase est deja le titre :
              elle etait simplement dans un div. */}
          <h1 style={{
            ...displayItalic, fontSize: "clamp(34px, 5.5vw, 92px)",
            maxWidth: 900, textAlign: "center", margin: 0, fontWeight: 400,
          }}>
            <SplitTextChars text="For those who carry everything inside." delay={22} duration={900} />
          </h1>
          {/* La maison ne dit pas la meme chose a l'aller et au retour.
              Les deux lignes sont superposees et se croisent selon le sens du
              scroll : on descend, elle vous accueille ; on remonte, elle vous
              dit ce que vous emportez. Rien ne se remonte en React, on ne
              touche que l'opacite. */}
          <div style={{ position: "relative", marginTop: 44, width: "100%", maxWidth: 620, minHeight: 92 }}>
            <div data-dir="down" style={{ position: "absolute", inset: 0, transition: "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <BreathReveal
                as="p"
                text="You have handled everything. This is the one room where you don't have to."
                style={{ ...bodyStyle, textAlign: "center" }}
                stagger={90}
              />
            </div>
            <div data-dir="up" style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <BreathReveal
                as="p"
                text="Whatever you set down here stays here. You take back only yourself."
                style={{ ...bodyStyle, textAlign: "center" }}
                stagger={90}
              />
            </div>
          </div>
        </section>

        {/* 2. PIERRE — PH-01 image derrière + titre. Poussee a GAUCHE : la
             phrase parle d'un desequilibre, elle se tient en desequilibre.
             Voir RANGEE plus haut. */}
        <section id="poids" data-station="The weight" className="mdc-station mdc-station--gauche" style={station("gauche")}>
          <BreathReveal
            grave
            as="p"
            text="There is a kind of tiredness that rest doesn't reach."
            style={{ ...displayItalic, fontSize: "clamp(30px, 4.6vw, 78px)", maxWidth: "17ch", textAlign: texteDe("gauche"), position: "relative", zIndex: 1 }}
            stagger={90}
          />
        </section>

        {/* 3. LA MAISON — la station qui nomme ce que c'est. Elle precede
             immediatement la gravure : le burin marque donc l'instant ou le
             site dit ce qu'il est, au lieu de flotter au milieu du scroll.

             Elle disait « a private house in London » : une adresse. Kilian :
             « la house c'est le concept, pas un endroit physique », et « une
             maison comme les maisons de luxe, mais aussi un refuge ».

             DEUX VERBES, parce qu'il a nomme deux sens.

             « It asks nothing of you » — le refuge. Deux mots essayes avant :
             « takes you in », ecarte parce qu'en anglais britannique « taken
             in » veut aussi dire berne ; puis « shelters », ecarte par Kilian
             — « shelter makes me remember homeless ». C'est juste : en
             anglais, shelter appartient au vocabulaire du foyer d'accueil et
             du refuge pour animaux. Le registre welfare, pas celui d'une
             maison. Ce qui reste dit le refuge sans nommer l'abri, et vise
             exactement son client : celui a qui on demande tout, partout.

             « What it makes » — la maison de couture. Une maison est une
             institution qui FABRIQUE. Ce qu'elle fabrique aujourd'hui est du
             calme ; elle portera du vetement plus tard, et la phrase tiendra
             sans retouche.

             D'ou ce qu'elle ne dit jamais : ni cabinet, ni pratique, ni une
             heure. Chacun de ces mots enfermerait la marque dans son premier
             produit. */}
        <section id="maison" data-station="The house" className="mdc-station"
                 style={station("centre", { flexDirection: "column" })}>
          <BreathReveal
            grave
            as="p"
            text="Maison du Calme asks nothing of you, and what it makes is calm."
            style={{ ...displayItalic, fontSize: "clamp(26px, 3.4vw, 58px)", maxWidth: 860, textAlign: "center", lineHeight: 1.35 }}
            stagger={90}
          />
          <BreathReveal
            as="p"
            text="You arrive carrying. You leave lighter. What happens between is felt, not explained."
            style={{ ...bodyStyle, marginTop: 40, textAlign: "center" }}
            stagger={90}
          />
        </section>

        {/* 4. MAISON — pas de texte, la gravure parle. Un peu plus haute que
             les autres pour que le burin ait le temps de descendre, mais pas
             plus : depuis que chaque station se mesure elle-meme, un voisin
             est deja eteint des que la station depasse 0,22 hauteur d'ecran.
             Les 200dvh dataient du systeme precedent et rendaient la
             traversee interminable. Sa hauteur vit dans .mdc-station--haute
             (globals.css), en svh comme les autres. */}
        <section
          className="mdc-station mdc-station--haute"
          style={stationStyle}
          aria-hidden
        />

        {/* ── LE TRAVAIL ──────────────────────────────────────────────
             Cette station ne disait que « Up to ninety minutes / Clothed /
             In silence » et posait deux boutons. Reproche deja formule par
             Kilian sur cette page : « la page ce n'est que quelques
             citations, est-ce que ca vend et montre ce que je fais ? ».
             C'etait encore vrai : l'accueil ne nommait aucune des pratiques.

             Ce bloc n'est PAS une .mdc-station. Les stations s'effacent des
             qu'elles quittent le centre de l'ecran — parfait pour une phrase,
             illisible pour un sommaire. Il defile normalement, dans la
             grammaire editoriale des autres pages (.mdc-wrap, .mdc-index). */}
        <section id="pratique" data-station="The practice" className="mdc-wrap"
                 style={{ position: "relative", zIndex: 5, paddingTop: 40, paddingBottom: 40 }}>

          {/* Le sommaire defile a l'horizontale, et il est EPINGLE : la
              section se cale a l'ecran et le scroll vertical fait courir les
              cartes jusqu'a la derniere avant que la page reparte vers le bas.
              Demande de Kilian, « the horizontal scroll must done till the end
              to be able to scroll down again ».
              Tout le raisonnement, les trois sorties de secours et la raison
              pour laquelle rien n'est intercepte sont dans RailEpingle.tsx. */}
          <RailEpingle
            label="The practice"
            entete={
              <>
                <p style={eyebrow}>What is practised here</p>
                <h2 style={{ ...sectionHead, marginTop: 30, maxWidth: "20ch" }}>
                  Five in the room. One on a call.
                </h2>
              </>
            }
          >
            {PRATIQUE.map((r) => (
              <a key={r.name} href={r.href} className="mdc-rail__card">
                <span style={{ ...micro, opacity: 0.7 }}>{r.n}</span>
                <span style={{ ...label, fontSize: 21, display: "block", marginTop: 18 }}>{r.name}</span>
                <span style={{ ...pageBody, fontSize: 17, maxWidth: "none", display: "block", marginTop: 16 }}>{r.line}</span>
                <span style={{ ...micro, display: "block", marginTop: "auto", paddingTop: 28 }}>{r.meta}</span>
              </a>
            ))}
          </RailEpingle>

          <p style={{ ...micro, marginTop: 28 }}>
            Up to ninety minutes. Clothed, unless there is oil.
            <br />
            Battersea, South West London · In the room, £130 to £250 · Coaching, from £150
          </p>

          {/* La transmission. Kilian : « tu n'insistes pas sur le fait que je
              pratique une technique tres ancienne, non modifiee ». Elle
              n'apparaissait nulle part sur l'accueil. Elle se dit sobrement :
              c'est fort parce que c'est rare, pas parce qu'on appuie. */}
          <div className="mdc-gap">
            <p style={eyebrow}>Where this comes from</p>
            <h2 style={{ ...sectionHead, marginTop: 30, maxWidth: "22ch" }}>
              Learned where it was never packaged.
            </h2>
            <p style={{ ...pageBody, marginTop: 36 }}>
              Kilian still learns in India, from teachers who take students by word of mouth and no other way. You reach them by going. What they teach has never been shortened to fit a weekend.
            </p>
          </div>
        </section>

        {/* 5. KILIAN — a DROITE, en miroir exact de la station « poids ». Les
             deux seules phrases qui nomment la fatigue sont les deux seules
             poussees aux marges, de part et d'autre de la gravure. */}
        <section id="kilian" data-station="Kilian" className="mdc-station" style={station("droite")}>
          {/* LA MESURE ETAIT POSEE SUR LE MAUVAIS ELEMENT.

              `30ch` vivait sur CE div, dont la taille de police est celle,
              heritee, de 16px — pas celle du titre qui est dedans. `ch` se
              resout donc contre 16px et donnait 334px, quelle que soit la
              taille reelle du titre et quelle que soit la largeur de l'ecran.
              Un titre de 64px enferme dans une colonne de 334 : c'est l'ilot
              que Kilian a vu au milieu du vide.

              La mesure descend sur le titre lui-meme, ou `ch` veut enfin dire
              trente caracteres de la fonte affichee. Le commentaire d'origine
              parlait de quatre lignes ; il les compte a nouveau, cette fois
              pour de vrai. */}
          <div style={{ textAlign: texteDe("droite") }}>
            <div style={{ ...displayItalic, fontSize: "clamp(24px, 3.8vw, 64px)", maxWidth: "24ch" }}>
              <SplitTextChars
                text="Chronic stress rarely looks like falling apart. It looks like being very good at your life."
                delay={22} duration={900}
              />
            </div>
            <div style={{ marginTop: 56 }}>
              <QuietButton href="/practitioner">Kilian</QuietButton>
            </div>
          </div>
        </section>

        {/* 6. BEGIN — retour au centre : on ressort par ou l'on est entre. */}
        <section id="begin" data-station="Begin" className="mdc-station" style={station("centre")}>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...displayItalic, fontSize: "clamp(32px, 5vw, 84px)" }}>
              <SplitTextChars text="Something in you already knows." delay={60} duration={900} />
            </div>
            <BreathReveal
              as="p"
              text="Entry is by conversation, not by calendar. Tell Kilian what you carry."
              style={{ ...bodyStyle, marginTop: 40, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}
              stagger={90}
            />
            <div style={{ marginTop: 52 }}>
              <QuietButton href="/begin">Begin</QuietButton>
            </div>
            <p style={{ ...bodyStyle, fontSize: 13, opacity: 0.82, marginTop: 28, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              One question, answered in your own time.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
