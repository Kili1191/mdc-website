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
};

export default function Marque({
  hauteur, forme = "empilee", devise = true, centre = false, titre = "Maison du Calme",
}: Props) {
  const u = hauteur / 9;
  const empilee = forme === "empilee";

  // Empilee : le nom se regle sur la largeur de la marque (k = 1,5).
  // En ligne : la marque est a cote et non au-dessus, le nom n'a plus a se
  // caler sur elle ; il se regle sur sa hauteur, comme la barre le fait deja.
  const tailleNom = empilee ? (RAPPORT * hauteur * K) / CHASSE_NOM : hauteur * 0.42;
  const tailleDevise = tailleNom * (empilee ? 0.62 : 0.60);

  const trace = (
    <img
      src="/logo.png"
      alt=""
      style={{ height: hauteur, width: "auto", display: "block", flex: "none" }}
    />
  );

  const nom = (
    <span style={{
      fontFamily: FONTS.higuen, fontSize: tailleNom,
      letterSpacing: "0.22em",
      // L'interlettre pousse un blanc APRES la derniere lettre. Sans le
      // reprendre en retrait, le bloc est optiquement decale d'un quart de
      // cadratin vers la gauche sous le faite.
      textIndent: "0.22em",
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
        role="img"
        aria-label={titre}
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
      role="img"
      aria-label={titre}
      style={{ display: "inline-flex", alignItems: "center", gap: 1.6 * u }}
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
