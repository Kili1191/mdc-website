// LA MARQUE — le trace, le nom, la devise, et le rapport entre les trois.
//
// Kilian : « A house for what you carry this must be under the logo study to
// make it beautiful and all logo proportional ». Deux demandes : poser la
// devise sous la marque, et que tout se tienne par des proportions plutot que
// par des valeurs posees a l'oeil.
//
// ─────────────────────────────────────────────────────────────────────────
// CE QUE LE TRACE MESURE VRAIMENT. Releve sur public/logo.png en decodant le
// PNG, pas estime :
//
//   boite d'encre          573 x 478 px
//   rapport                1,1987            soit 6:5 a 0,1 % pres
//   ligne de gouttiere     a 0,343 H         soit H/3 a 2,8 % pres
//   debord d'avant-toit    51 px             soit H/9 a 4 % pres
//   largeur du corps       470 px = 0,983 H  le corps est aussi large que la
//                                            marque est haute
//   faite                  x = 289 pour une boite centree a 287 : centre a
//                          0,35 % pres, ce qui est la main, pas un defaut
//
// L'UNITE DU SYSTEME EST DONC u = H/9, le debord. Tout espacement ci-dessous
// est un multiple de u, et rien n'est choisi a l'oeil.
//
// ─────────────────────────────────────────────────────────────────────────
// LE RAPPORT QUI DECIDE DE TOUT, ET QUE J'AI RATE A LA PREMIERE PASSE.
//
// Premiere etude, six verrouillages empiles : tous faux, du meme defaut. Le
// nom compose a la taille de la barre du haut mesure 667 px pour une maison de
// 130 — un rapport de 1 a 5. Cote a cote dans une barre ca se lit ; EMPILE, le
// trace devient un bijou pose sur une enseigne.
//
// La largeur du nom vaut 12,35 fois sa taille de police (mesure). La largeur
// de la marque vaut 1,2 fois sa hauteur. Pour que le nom fasse k fois la
// largeur de la marque :
//
//     F = 1,2 x H x k / 12,35 = 0,0972 x H x k
//
// Deuxieme etude, k = 1 / 1,5 / 2. A k = 1 la maison ecrase le nom et
// l'ensemble se lit comme un dessin legende. A k = 2 le nom reprend le dessus
// et la maison redevient un ornement. A k = 1,5 les deux se tiennent : la
// maison a de la presence, le nom a de l'autorite. C'est k = 1,5.
//
// ─────────────────────────────────────────────────────────────────────────
// POURQUOI LA DEVISE N'EST PAS DANS LA BARRE DU HAUT. Mesure : a 30 px de
// marque, la forme en ligne donne une devise de 7,5 px. En dessous de 40 px de
// marque elle cesse d'etre lisible, et une devise illisible n'est pas une
// devise, c'est du bruit. La barre garde donc le trace et le nom ; la devise
// vit la ou elle a la place — le pied de page, le seuil, et tout format large.
// C'est `devise={false}` qui le dit, et non un reglage cache.

import { COLORS, FONTS } from "@/styles/tokens";

const NOM = "MAISON DU CALME";
const DEVISE = "A house for what you carry";

/** Largeur du nom rapportee a sa taille de police. Mesure au navigateur. */
const CHASSE_NOM = 12.35;
/** Largeur de la marque rapportee a sa hauteur. Mesure sur le PNG. */
const RAPPORT = 1.1987;
/** Le nom vaut une fois et demie la largeur de la marque. Voir l'etude. */
const K = 1.5;
/** Part de la largeur du trace occupee par le debord d'avant-toit, a gauche.
 *  Mesure sur le PNG : le mur commence a 52 sur 573px d'encre. */
const DEBORD = 0.089;
/** Position du MUR dans la boite de l'image, en fraction de sa hauteur.
 *
 *  Le fichier fait 574 x 480 et le mur commence a x = 52 : 52/480 = 0,108333.
 *  C'est cette fraction-la qu'il faut, et non RAPPORT x DEBORD = 0,106695, qui
 *  rapporte le debord a la boite d'ENCRE (51 sur 573) alors que la marge
 *  deplace la boite de l'ELEMENT, bord transparent compris. L'ecart vaut
 *  0,082px a 50px de trace ; la mesure au navigateur relevait le mur a 39,885
 *  pour une garde a 39,8, soit 0,085px. Les deux tombent ensemble. */
const MUR = 52 / 480;

type Props = {
  /** Hauteur du trace, en pixels. Toute la composition en decoule. */
  hauteur: number;
  /** Empilee pour une signature, en ligne pour une barre. */
  forme?: "empilee" | "ligne";
  /** La devise s'ecrit-elle ? Fausse sous 40px de trace, ou elle ne se lit plus. */
  devise?: boolean;
  /** Centree, ou calee a gauche comme le reste d'une colonne. */
  centre?: boolean;
  /** Le nom est le seul contenu annonce : le trace est decoratif, la devise
   *  aussi — elle est deja dans la page qui la porte. */
  titre?: string;
  /** Vraie quand un parent nomme deja l'ensemble — le lien de la barre du
   *  haut porte son propre aria-label. Deux noms imbriques pour la meme
   *  chose font lire la maison deux fois a un lecteur d'ecran. */
  decoratif?: boolean;
};

export default function Marque({
  hauteur, forme = "empilee", devise = true, centre = false,
  titre = "Maison du Calme", decoratif = false,
}: Props) {
  const u = hauteur / 9;
  const empilee = forme === "empilee";

  // Empilee : le nom se regle sur la largeur de la marque (k = 1,5).
  // En ligne : la marque est a cote et non au-dessus, le nom n'a plus a se
  // caler sur elle ; il se regle sur sa hauteur, comme la barre le fait deja.
  // 0,425 et non 0,42, et le quart de point a une raison. A 40px de trace —
  // la signature du pied de page — 0,42 donnait 16,8 px, pose juste au-dessus
  // d'une ligne de prose a 17. Deux tailles separees de 1,2 %, c'est-a-dire
  // rien, sauf l'impression que quelque chose ne tombe pas juste. A 0,425 les
  // hauteurs employees atterrissent sur des marches de l'echelle : 40 donne
  // 17, 58 donne 24,7, 96 donne 40,8.
  const tailleNom = empilee ? (RAPPORT * hauteur * K) / CHASSE_NOM : hauteur * 0.425;
  const tailleDevise = tailleNom * (empilee ? 0.62 : 0.60);

  // ALIGNEMENT OPTIQUE, PAS GEOMETRIQUE.
  //
  // Le trace deborde de ses avant-toits : sur les 573px d'encre du PNG, le MUR
  // ne commence qu'a 52, soit 8,9 % de la largeur. Caler la boite de l'image
  // sur une colonne revient donc a rentrer la maison de 8,9 % pendant que ses
  // toits depassent — et c'est le mur que l'oeil aligne, comme il aligne un
  // jambage et non le crochet d'un guillemet.
  //
  // On tire donc l'image de la valeur du debord, calculee ICI parce que c'est
  // le seul endroit qui connait la largeur du trace. Premiere tentative :
  // `margin-left:-0.089em` en CSS — faux, `em` sur une image se resout contre
  // sa taille de police heritee, soit 1,4px au lieu des 5,3 voulus.
  //
  // Seulement en forme EN LIGNE : empilee, le trace est centre sur le nom et
  // c'est le faite qui fait le centre, pas le mur.
  // ELLE DOIT SUIVRE LA HAUTEUR RENDUE, ET ELLE NE LA SUIVAIT PAS.
  //
  // Mesure de l'agent proportions : sous 561px, la barre force le trace a 38px
  // (`.mdc-seuil__marque img`) pendant que la marge restait calculee sur la
  // PROP, soit 50. Resultat, le mur pendait a 16,789 pour une garde a 18 :
  // 1,211px dehors, sur le seul format ou l'ecran est trop etroit pour que
  // l'oeil pardonne. Au-dessus de 561px l'erreur n'etait que de 0,085px.
  //
  // La hauteur passe donc par une variable CSS, et la marge la lit. Une
  // surcharge de la hauteur deplace automatiquement la marge avec elle : il
  // n'y a plus deux endroits a tenir d'accord. La valeur par defaut dans le
  // `var()` est la prop, donc rien a declarer quand personne ne surcharge.
  //
  // Ecarte : `transform: translateX(-9%)`. Un translate ne consomme pas de
  // place — le mot-marque ne suivrait pas et le trou entre les deux
  // grandirait de 5,3px. C'est une MARGE qu'il faut.
  const h = `var(--mdc-trace-h, ${hauteur}px)`;

  const trace = (
    <img
      src="/logo.png"
      alt=""
      style={{
        height: h, width: "auto", display: "block", flex: "none",
        marginLeft: empilee ? 0 : `calc(${h} * -${MUR})`,
      }}
    />
  );

  const nom = (
    <span style={{
      fontFamily: FONTS.higuen, fontSize: tailleNom,
      letterSpacing: "0.22em",
      // LE BLANC DE FIN SE REPREND A DROITE, ET PAS EN RETRAIT A GAUCHE.
      //
      // Kilian : « pourquoi le texte du logo est pas aligne ? ». Mesure de
      // l'agent proportions sur le build de prod, bords d'encre rasterises a
      // 10x : « MAISON DU CALME » commence 5,075px a DROITE de « A house for
      // what you carry », identique a 561, 768, 1024, 1440 et 1990px.
      //
      // La cause etait ici. L'interlettre pousse un blanc APRES la derniere
      // lettre, et il fallait bien le reprendre — mais `text-indent` le
      // reprend en poussant le PREMIER glyphe vers la droite. Sous le faite,
      // dans une signature empilee et centree, ca recentre le bloc et c'est
      // juste. Dans la barre du haut, les deux lignes sont une colonne calee a
      // gauche : le M part a droite pendant que le A reste au bord.
      //
      // La decomposition des 5,075 le dit : 4,675 viennent du retrait
      // (0,22em x 21,25px) et 0,400 de l'apex du A de Prata, qui deborde a
      // gauche de sa boite. Ce dernier reste, et c'est voulu — une pointe
      // doit deborder, comme une bas-de-casse ronde, sinon elle parait
      // rentree.
      //
      // `margin-right` negatif retire le meme blanc par l'autre bout : la
      // boite se referme a droite, le premier glyphe ne bouge pas. Le
      // centrage de la forme empilee est preserve, l'alignement a gauche de
      // la forme en ligne est obtenu. Un seul correctif pour les deux formes.
      marginRight: "-0.22em",
      textTransform: "uppercase", color: COLORS.brouFonce, lineHeight: 1,
      whiteSpace: "nowrap",
    }}>{NOM}</span>
  );

  const dit = devise ? (
    <span style={{
      fontFamily: FONTS.prata, fontSize: tailleDevise, letterSpacing: "0.02em",
      color: COLORS.brou, lineHeight: 1.25, whiteSpace: "nowrap",
    }}>{DEVISE}</span>
  ) : null;

  if (empilee) {
    return (
      <span
        {...(decoratif ? { "aria-hidden": true } : { role: "img", "aria-label": titre })}
        style={{
          display: "inline-flex", flexDirection: "column",
          alignItems: centre ? "center" : "flex-start",
        }}
      >
        {trace}
        <span style={{ marginTop: 2 * u, display: "block" }}>{nom}</span>
        {dit && <span style={{ marginTop: 1.25 * u, display: "block" }}>{dit}</span>}
      </span>
    );
  }

  return (
    <span
      {...(decoratif ? { "aria-hidden": true } : { role: "img", "aria-label": titre })}
      // 2,5u ET NON 1,6u, ET C'EST LE RETRAIT QUI PAYAIT LA DIFFERENCE.
      //
      // Le trou declare valait 1,6u = 8,889px. Mesure a l'ecran : 13,540px,
      // soit 52,3 % de plus. Les 4,651 de surplus etaient les 4,675 du
      // `text-indent` corrige plus haut, qui poussait le M vers la droite et
      // elargissait donc le trou par accident.
      //
      // Retirer le retrait sans toucher au gap aurait resserre le lockup de
      // 34 % — un changement que Kilian n'a pas demande, en reponse a une
      // question d'alignement. 2,5u rend 13,889px, soit 0,35px de ce qui est
      // a l'ecran aujourd'hui : l'alignement se corrige, le dessin ne bouge
      // pas. Et 2,5 reste un multiple de u, donc le systeme tient.
      //
      // Si le trou de 8,889 est prefere un jour, c'est ici, et c'est une
      // decision de direction — la mesure ne la tranche pas.
      style={{ display: "inline-flex", alignItems: "center", gap: 2.5 * u }}
    >
      {trace}
      <span style={{
        display: "inline-flex", flexDirection: "column",
        alignItems: "flex-start", gap: 0.55 * u,
      }}>
        {nom}
        {dit}
      </span>
    </span>
  );
}
