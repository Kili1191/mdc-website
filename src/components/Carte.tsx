import { COLORS, FONTS } from "@/styles/tokens";

// LA CARTE — le quartier, jamais la porte.
//
// Demande de Kilian : « add a Google map where it will point SW11 mais pas
// precis au building meme, pour que les gens me demandent l'adresse et qu'elle
// soit pas donnee sur le site, only given after contacting me ».
//
// DEUX DECISIONS ONT ETE PRISES AVANT DE DESSINER, et elles sont la raison
// d'etre de ce fichier.
//
// 1. PAS D'EPINGLE, ET PAS DE CODE POSTAL COMPLET. Un code postal britannique
//    complet couvre une quinzaine de boites aux lettres, et sur une rue
//    residentielle il designe souvent UN SEUL IMMEUBLE. L'ecrire ou l'epingler,
//    c'est publier l'adresse — exactement ce que Kilian ne veut pas, et ce que
//    son bail lui interdit. La carte montre donc une ZONE, floue sur ses bords,
//    large de plusieurs centaines de metres. On lit « c'est ce coin-la », jamais
//    « c'est ce batiment ».
//
// 2. PAS D'IFRAME GOOGLE. Il serait arrive avec ses routes bleues, ses epingles
//    rouges et son interface : l'element le plus discordant du site, sur une
//    page en Aube Encens. Il depose des cookies tiers, donc il impose un
//    bandeau de consentement au Royaume-Uni. Et il ajoute un gros script a un
//    site qui porte deja une couche WebGL permanente. Ici : zero requete
//    externe, zero cookie, zero bandeau, et ca ressemble a la maison.
//
// CE QUE CETTE CARTE EST, ET CE QU'ELLE N'EST PAS. C'est un SCHEMA de quartier,
// pas un releve. Les formes sont justes en topologie — le fleuve au nord, le
// parc contre la rive a l'est, la gare au sud-ouest — et fausses en distances.
// C'est volontaire et c'est meme le sujet : une carte exacte serait une adresse.
// Ne la corrige pas « pour qu'elle tombe juste », et ne t'en sers jamais pour
// naviguer.
//
// LES COULEURS SONT CELLES DE LA PALETTE ET ELLES DISENT QUELQUE CHOSE. La
// sauge pour le parc, qui est son seul emploi legitime — un accent vegetal sur
// du vegetal. Le taupe pour l'eau, qui est une couleur de matiere. Le
// taupeTrait pour les voies, qui est son emploi. Le rouille pour la zone, en
// aplat tres dilue : c'est l'accent de la marque, et il ne porte ici aucun
// texte. Seul le brou ecrit.
//
// RIEN NE BOUGE. Pas de pulsation sur la zone, pas de minuteur. La liste de
// controle du skill `taste` l'interdit au point 15, et une tache qui respire
// toute seule sur une carte se lit comme une alerte, pas comme un lieu.

const T = {
  eau: COLORS.taupe,
  parc: COLORS.sauge,
  voie: COLORS.taupeTrait,
  encre: COLORS.brou,
  zone: COLORS.rouille,
};

export default function Carte() {
  return (
    <svg
      viewBox="0 0 800 520"
      width="100%"
      className="mdc-carte"
      role="img"
      aria-label="A drawing of Battersea in South West London. The Thames runs along the north, Battersea Park sits against the river to the east, and Clapham Junction is to the south west. A soft area marks the neighbourhood, several streets wide. It is not a precise location."
      style={{ display: "block", maxWidth: 760, height: "auto", overflow: "visible" }}
    >
      <defs>
        {/* La zone : un bord qui s'eteint, jamais un cercle net. Un contour
            ferme se lit comme une limite, et une limite invite a chercher son
            centre. */}
        <radialGradient id="mdc-carte-zone">
          <stop offset="0%" stopColor={T.zone} stopOpacity="0.26" />
          <stop offset="55%" stopColor={T.zone} stopOpacity="0.15" />
          <stop offset="100%" stopColor={T.zone} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g aria-hidden="true">
        {/* La Tamise. Une bande, pas un trait : c'est un fleuve large a cet
            endroit, et une ligne fine se lirait comme une route. */}
        <path
          d="M -20 88 C 130 66, 258 96, 380 120 C 496 142, 612 140, 820 104
             L 820 156 C 612 192, 494 194, 376 172 C 256 148, 130 122, -20 144 Z"
          fill={T.eau}
          opacity="0.30"
        />

        {/* Les trois ponts, du couchant au levant. Ils disent de quel cote de
            l'eau on se trouve, ce qu'aucun texte ne fait aussi vite. Ils
            traversent la bande et s'arretent : un pont qui continue sur la
            berge devient une route. */}
        <path d="M 386 104 L 392 172" stroke={T.voie} strokeWidth="2.5" opacity="0.7" />
        <path d="M 508 122 L 512 188" stroke={T.voie} strokeWidth="2.5" opacity="0.7" />
        <path d="M 630 116 L 632 178" stroke={T.voie} strokeWidth="2.5" opacity="0.7" />

        {/* Battersea Park, contre la rive.
            ORGANIQUE, ET SOUS LE FLEUVE. Il etait un rectangle arrondi pose a
            cheval sur la bande : il se lisait comme une carte d'interface, ce
            que le §5 du skill `taste` interdit sur du contenu, et il chevauchait
            l'eau, ce qu'aucun parc ne fait. */}
        <path
          d="M 494 212 C 500 194, 524 188, 556 190 C 606 192, 654 196, 672 208
             C 688 220, 686 246, 674 262 C 660 280, 606 288, 556 286
             C 514 284, 492 272, 488 250 C 486 234, 490 222, 494 212 Z"
          fill={T.parc}
          opacity="0.34"
        />

        {/* DEUX VOIES, ET ELLES ENCADRENT LE CENTRE SANS LE TRAVERSER. La
            premiere version en posait une qui passait a travers le mot
            « Battersea » : un trait qui coupe un nom ne dit pas « il y a une
            rue », il dit que le dessin n'a pas ete regarde. Le milieu reste
            vide, parce que c'est la que vit la zone. */}
        <path d="M 150 432 C 300 420, 470 418, 706 404" stroke={T.voie} strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 664 268 C 676 310, 684 356, 690 402" stroke={T.voie} strokeWidth="2" fill="none" opacity="0.5" />

        {/* LA ZONE. Son centre n'est pas une adresse : il est pose entre la
            gare et le parc, c'est-a-dire au milieu du quartier. */}
        <circle cx="380" cy="318" r="196" fill="url(#mdc-carte-zone)" />

        {/* La gare, en repere et non en destination : un anneau ouvert, pas un
            point plein. */}
        <circle cx="196" cy="428" r="7" fill="none" stroke={T.voie} strokeWidth="2" opacity="0.8" />
      </g>

      {/* Les noms. Du vrai texte, pas des traces : il se selectionne, il se lit
          a la voix de synthese, et il est indexable.

          LES TAILLES VIVENT DANS globals.css, ET C'EST UNE MESURE. Dans un SVG
          a viewBox, une taille de police est en unites utilisateur : elle suit
          l'echelle du dessin. A 390px de large la carte fait 335, soit un
          facteur 0,419 — les etiquettes a 15 unites arrivaient donc a 6,3px
          reels, c'est-a-dire illisibles la ou la moitie des gens regardent.
          Elles grossissent sous 720px, et « Chelsea » disparait : quatre reperes
          dans une carte de 335px se marchent dessus. */}
      <g fill={T.encre} fontFamily={FONTS.prata}>
        <text className="mdc-carte__lieu" x="86" y="122" letterSpacing="0.22em" opacity="0.82">THE THAMES</text>
        <text className="mdc-carte__lieu" x="580" y="244" letterSpacing="0.14em" textAnchor="middle">Battersea Park</text>
        <text className="mdc-carte__lieu mdc-carte__gare" x="214" y="416" letterSpacing="0.14em">Clapham Junction</text>
        <text className="mdc-carte__lieu mdc-carte__loin" x="648" y="62" letterSpacing="0.14em" opacity="0.82">Chelsea</text>
      </g>

      <g fill={T.encre}>
        <text className="mdc-carte__ici" x="380" y="312" textAnchor="middle" fontFamily={FONTS.higuen}>Battersea</text>
        <text className="mdc-carte__code" x="380" y="348" textAnchor="middle" letterSpacing="0.28em" fontFamily={FONTS.prata}>
          SW11
        </text>
      </g>
    </svg>
  );
}
