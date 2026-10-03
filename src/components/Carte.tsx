import { COLORS, FONTS } from "@/styles/tokens";
import { CADRE, EAU, FLEUVE, PARC, AXES, RUES, RAIL } from "./carteDonnees";

// LA CARTE — le quartier, jamais la porte.
//
// Demande de Kilian : « add a Google map where it will point SW11 mais pas
// precis au building meme, pour que les gens me demandent l'adresse et qu'elle
// soit pas donnee sur le site, only given after contacting me ». Son agence lui
// interdit d'utiliser le logement comme adresse professionnelle.
//
// ─────────────────────────────────────────────────────────────────────────
// PREMIERE VERSION, ET POURQUOI ELLE ETAIT MAUVAISE
//
// Elle etait DESSINEE DE MEMOIRE : un ruban approximatif pour la Tamise, un
// galet arrondi pour le parc, deux traits pour toute une ville, et un degrade
// radial au milieu. Kilian : « la carte est pas du tout pro, les graphiques
// sont horribles ». Il avait raison, et la cause n'etait pas le style :
// **la geometrie etait fausse**. Un Londonien reconnait la courbe de la Tamise
// a Battersea au premier coup d'oeil, et une courbe inventee se voit aussi
// vite. Aucun reglage de couleur ne repare ca.
//
// Le trace vient desormais des donnees reelles d'OpenStreetMap, par
// `scripts/carte-tuiles.mjs` puis `scripts/carte-battersea.mjs`. Ce fichier
// ne fait plus que l'habiller.
//
// ─────────────────────────────────────────────────────────────────────────
// LES TROIS DECISIONS QUI TIENNENT LA CARTE
//
// 1. PAS D'EPINGLE, ET PAS DE CODE POSTAL COMPLET. Un code postal britannique
//    complet couvre une quinzaine de boites aux lettres et, sur une rue
//    residentielle, designe souvent UN SEUL IMMEUBLE. L'epingler serait publier
//    l'adresse — l'inverse exact de ce qui est demande.
//
//    La zone se dit donc par l'ENCRE, pas par une tache : les rues du quartier
//    sont un peu plus presentes que celles d'autour, sous un masque au bord
//    eteint de plus d'un kilometre de large. Aucun contour, aucun point, rien a
//    recopier dans une barre d'adresse. C'est ce que font les cartes serieuses
//    pour designer un secteur, et c'est aussi ce qui remplace le degrade rose
//    de la premiere version, qui se lisait comme une salissure.
//
// 2. PAS D'IFRAME GOOGLE. Il serait arrive avec ses routes bleues, ses epingles
//    rouges et son interface, sur une page en Aube Encens. Il depose des cookies
//    tiers, donc il impose un bandeau de consentement au Royaume-Uni. Et il
//    ajoute un gros script a un site qui porte deja une couche WebGL
//    permanente. Ici : zero requete externe, zero cookie, zero bandeau.
//
// 3. RIEN NE BOUGE. Pas de pulsation, pas de minuteur. La liste de controle du
//    skill `taste` l'interdit au point 15, et une tache qui respire sur une
//    carte se lit comme une alerte, pas comme un lieu.
//
// ─────────────────────────────────────────────────────────────────────────
// LICENCE
//
// Donnees OpenStreetMap, sous ODbL. La mention « © OpenStreetMap contributors »
// sous la carte n'est pas une politesse, c'est la condition d'usage.
// **Si elle part, la carte part avec elle.**

const T = {
  eau: COLORS.taupe,
  parc: COLORS.sauge,
  trait: COLORS.taupeTrait,
  encre: COLORS.brou,
};

// Le centre du quartier, en unites du dessin. Ce n'est pas une adresse : il
// tombe entre la gare et le parc, c'est-a-dire au milieu de Battersea. Le rayon
// vaut plus d'un kilometre au sol — 1 unite fait environ 3,8 m.
// Le centre du quartier, en unites du dessin. Ce n'est pas une adresse : il
// tombe entre la gare et le parc, c'est-a-dire au milieu de Battersea. Le rayon
// vaut environ 1,2 km au sol — apres l'elargissement du cadre, 1 unite fait
// 4,9 m et non plus 3,8, donc il descend de 300 a 250 pour couvrir la meme
// etendue reelle. Une zone qui grandit parce que la carte a dezoome serait un
// hasard, pas une decision.
const ICI = { x: 465, y: 611, r: 250 };

// Le nom se pose un peu au-dessus et a gauche du centre du masque : a l'aplomb
// exact, il tombait sur le faisceau ferroviaire. Cent unites valent 380 m au
// sol, et ce n'est de toute facon pas une epingle.
const NOM = { x: 438, y: 566 };

// LE HALO DES ETIQUETTES. C'est la solution de toutes les cartes du monde a un
// probleme reel : un nom pose sur une route devient illisible. Un liset de fond
// dilue, dessine SOUS le glyphe (`paintOrder`), le detache sans l'encadrer.
// Ce n'est pas une carte posee sur le contenu au sens du §5 de `taste` : c'est
// du texte qui respire.
const HALO = {
  paintOrder: "stroke" as const,
  stroke: COLORS.parchemin,
  strokeWidth: 7,
  strokeLinejoin: "round" as const,
  strokeOpacity: 0.62,
};

export default function Carte() {
  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${CADRE.largeur} ${CADRE.hauteur}`}
        width="100%"
        className="mdc-carte"
        role="img"
        aria-label="A map of Battersea in South West London. The Thames runs along the north, Battersea Park sits against the river, and the railway lines converge at Clapham Junction to the south west. The Maison du Calme mark sits over the neighbourhood, which is drawn a little more strongly than its surroundings across more than a kilometre. No exact address is marked."
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <defs>
          {/* Le masque du quartier. Un MASQUE, pas un aplat : il fait varier la
              force du trait, il n'ajoute aucune couleur. C'est la difference
              entre « cette partie est le sujet » et une tache sur le papier. */}
          <radialGradient id="mdc-carte-degrade">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="58%" stopColor="#fff" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="mdc-carte-ici">
            <circle cx={ICI.x} cy={ICI.y} r={ICI.r} fill="url(#mdc-carte-degrade)" />
          </mask>
          {/* LA CLAIRIERE SOUS LA MARQUE. Un chemin passait en plein milieu de
              la maison et lui traversait le toit : le trace se lisait a travers
              le dessin, et les deux se brouillaient.

              C'est le meme geste que le HALO des etiquettes plus bas — un liset
              de parchemin dessine SOUS le glyphe pour le detacher sans
              l'encadrer. Une image ne peut pas porter `paintOrder`, donc la
              clairiere se dessine a part, juste avant elle.

              EN FONDU ET SANS BORD, c'est la condition. Un disque plein ferait
              un medaillon pose sur la carte, et le §5 du skill `taste` le
              refuse. Le papier s'eclaircit vers le centre, et on ne doit pas
              pouvoir dire ou il s'arrete. */}
          <radialGradient id="mdc-carte-clairiere">
            <stop offset="0%" stopColor={COLORS.parchemin} stopOpacity="0.92" />
            <stop offset="34%" stopColor={COLORS.parchemin} stopOpacity="0.70" />
            <stop offset="100%" stopColor={COLORS.parchemin} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g aria-hidden="true">
          {/* L'eau d'abord : tout se pose dessus. */}
          <g fill={T.eau} opacity="0.26">
            {EAU.map((d, i) => <path key={`e${i}`} d={d} />)}
          </g>
          {/* L'axe du cours d'eau, trace large. Les berges de la Tamise sont une
              relation multipolygone et ne sont pas toujours completes sur les
              bords des tuiles ; l'axe, lui, est continu. */}
          <g stroke={T.eau} strokeWidth="62" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.26">
            {FLEUVE.map((d, i) => <path key={`f${i}`} d={d} />)}
          </g>

          <g fill={T.parc} opacity="0.42">
            {PARC.map((d, i) => <path key={`p${i}`} d={d} />)}
          </g>

          {/* La ville, deux fois : une passe faible partout, une passe forte
              sous le masque. C'est ce qui designe le quartier sans le cerner. */}
          {[false, true].map((fort) => (
            <g key={String(fort)} mask={fort ? "url(#mdc-carte-ici)" : undefined}
               fill="none" strokeLinecap="round" strokeLinejoin="round"
               stroke={T.trait} opacity={fort ? 0.78 : 0.24}>
              <g strokeWidth="0.9" opacity="0.5" strokeDasharray="6 6">
                {RAIL.map((d, i) => <path key={`r${i}`} d={d} />)}
              </g>
              <g strokeWidth="1.6">
                {RUES.map((d, i) => <path key={`s${i}`} d={d} />)}
              </g>
              <g strokeWidth="2.6">
                {AXES.map((d, i) => <path key={`a${i}`} d={d} />)}
              </g>
            </g>
          ))}
        </g>

        {/* Les noms. Du vrai texte : il se selectionne, il se lit a la voix de
            synthese, et il est indexable.

            LES TAILLES VIVENT DANS globals.css. Dans un SVG a viewBox, une
            taille de police est en unites utilisateur : elle suit l'echelle du
            dessin. La carte fait 760px sur un ecran de 1440 et 335px sur un
            telephone de 390 — les etiquettes arrivaient a 6,3px reels au
            telephone, c'est-a-dire illisibles la ou la moitie des gens
            regardent. */}
        {/* LES REPERES SONT PROJETES DEPUIS LEURS VRAIES COORDONNEES, pas
            poses a l'oeil. La premiere version les plaçait a la main : « Battersea
            Park » tombait sur le faisceau ferroviaire, a trois cents metres du
            parc. Une carte exacte avec des noms faux est pire qu'un schema.
            Calcul dans scripts/carte-battersea.mjs, meme projection que le trace. */}
        <g fill={T.encre} fontFamily={FONTS.prata} style={HALO}>
          <text className="mdc-carte__lieu" x="141" y="260" letterSpacing="0.22em" opacity="0.82">THE THAMES</text>
          <text className="mdc-carte__lieu mdc-carte__loin" x="408" y="163" letterSpacing="0.14em" textAnchor="middle" opacity="0.82">Chelsea</text>
          <text className="mdc-carte__lieu" x="583" y="405" letterSpacing="0.14em" textAnchor="middle">Battersea Park</text>
          <text className="mdc-carte__lieu mdc-carte__gare" x="330" y="705" letterSpacing="0.14em" textAnchor="middle">Clapham Junction</text>
          <text className="mdc-carte__lieu mdc-carte__loin" x="707" y="819" letterSpacing="0.14em" textAnchor="middle">Clapham Common</text>
        </g>

        {/* LA MARQUE, demandee par Kilian : « mettre un logo MDC ou le studio
            est ». Elle se pose a l'aplomb du nom du quartier, c'est-a-dire au
            meme endroit que lui — et ce n'est toujours PAS une adresse.

            POURQUOI CA NE CASSE PAS LA DECISION 1 PLUS HAUT. `NOM` n'est pas le
            logement : il est decale de cent unites du centre du masque, soit
            380 m, et ce centre est lui-meme le milieu de Battersea, entre la
            gare et le parc, dans une zone de 1,2 km. La marque dit « la maison
            est dans ce quartier ». Elle ne designe aucun immeuble, et il n'y a
            toujours rien a recopier dans une barre d'adresse.

            ELLE GARDE SON ROUILLE. La regle du depot dit que #B14E2D fait la
            marque et les traits, jamais l'encre d'un texte. Ici elle EST la
            marque : c'est son seul emploi legitime sur cette page.

            Et elle ne bouge pas — decision 3. Une marque qui pulse sur une
            carte se lit comme une alerte. */}
        {/* ELLE S'ARRETE AVANT LE PARC. Kilian : « don't let the background
            overtake on the park ». La premiere clairiere faisait 86 sur 74 et
            son lobe superieur droit delavait le coin de Battersea Park — un
            aplat qui perd sa couleur se lit comme une erreur d'impression, pas
            comme une mise en valeur.

            Elle est donc resserree a 58 sur 50, et son centre descend de six
            unites, a l'oppose du parc qui monte vers la droite. Le plateau
            central tombe aussi plus tot — 0,70 des 34 % du rayon au lieu de
            0,82 a 52 % — donc elle degage le trace juste sous la marque et
            s'eteint avant d'atteindre quoi que ce soit de colore. */}
        <ellipse
          cx={NOM.x - 3} cy={NOM.y - 61}
          rx={58} ry={50}
          fill="url(#mdc-carte-clairiere)"
        />
        <image
          href="/mdc-logo.svg"
          x={NOM.x - 34} y={NOM.y - 96}
          width={68} height={57}
          opacity={0.92}
        />

        {/* LE NOM DU QUARTIER, au centre de la zone. Il avait disparu en
            reecrivant le bloc des reperes — une carte de Battersea qui ne dit
            pas « Battersea ». */}
        <g fill={T.encre} style={HALO}>
          <text className="mdc-carte__ici" x={NOM.x} y={NOM.y} textAnchor="middle" fontFamily={FONTS.higuen}>
            Battersea
          </text>
          <text className="mdc-carte__code" x={NOM.x} y={NOM.y + 42} textAnchor="middle"
                letterSpacing="0.28em" fontFamily={FONTS.prata}>
            SW11
          </text>
        </g>
      </svg>

      {/* La licence. Elle n'est pas negociable : les donnees sont sous ODbL. */}
      <figcaption
        style={{
          fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.18em",
          textTransform: "uppercase", color: COLORS.brou, opacity: 0.82,
          marginTop: 18,
        }}
      >
        Map data © OpenStreetMap contributors
      </figcaption>
    </figure>
  );
}
