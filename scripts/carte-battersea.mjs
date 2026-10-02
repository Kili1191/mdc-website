// Transforme la geographie reelle de Battersea en trace SVG.
//
// ENTREE  : geo.json, produit par scripts/carte-tuiles.mjs.
// SORTIE  : src/components/carteDonnees.ts — des chaines de path deja
//           projetees, simplifiees et arrondies.
//
// POURQUOI CE SCRIPT EXISTE. La premiere carte etait dessinee de memoire : un
// ruban approximatif pour la Tamise, un galet pour le parc, deux traits pour
// toute une ville, et un degrade radial au milieu qui se lit comme une
// salissure. Kilian : « la carte est pas du tout pro, les graphiques sont
// horribles ». La cause n'etait pas le style, c'etait que la geometrie etait
// FAUSSE. Un Londonien reconnait la courbe de la Tamise a Battersea au premier
// coup d'oeil, et une courbe inventee se voit aussi vite.
//
// ATTRIBUTION. Donnees OpenStreetMap, sous ODbL : la page qui affiche cette
// carte DOIT porter « © OpenStreetMap contributors ». Ce n'est pas une
// politesse, c'est la licence. Si la mention part de la page, la carte part
// avec elle.
//
//   node scripts/carte-battersea.mjs <dossier contenant geo.json>

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2];
if (!SRC) { console.error("usage: node scripts/carte-battersea.mjs <dossier>"); process.exit(1); }

const { vue: VUE, couches } = JSON.parse(readFileSync(join(SRC, "geo.json"), "utf8"));
const W = 1000;

// Projection equirectangulaire corrigee en longitude. A moins de 4 km, l'ecart
// avec une vraie Mercator est de l'ordre du pixel, et elle a l'avantage de ne
// rien deformer verticalement.
const lat0 = (VUE.sud + VUE.nord) / 2;
const kx = Math.cos((lat0 * Math.PI) / 180);
const echelle = W / ((VUE.est - VUE.ouest) * kx);
const H = Math.round((VUE.nord - VUE.sud) * echelle);

const proj = ([lat, lon]) => [
  (lon - VUE.ouest) * kx * echelle,
  (VUE.nord - lat) * echelle,
];

// Douglas-Peucker. Sans lui, 11 000 points partent dans le navigateur pour un
// dessin qui en demande dix fois moins.
function simplifie(pts, eps) {
  if (pts.length < 3) return pts;
  let max = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay;
  const norme = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / norme;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [...simplifie(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplifie(pts.slice(idx), eps)];
}

// DOUGLAS-PEUCKER SUR UN ANNEAU, et c'est un piege classique qui a mange tous
// les polygones de la carte : sur un contour ferme, le premier et le dernier
// point sont CONFONDUS. La base de la mesure de distance est donc de longueur
// nulle, chaque ecart calcule vaut zero, et l'algorithme conclut que le
// polygone entier tient en deux points. Resultat mesure : 16 parcs rendus en
// 32 points au total — deux par parc, c'est-a-dire rien.
//
// On coupe donc l'anneau en deux au point le plus eloigne du depart, on
// simplifie chaque moitie comme une ligne ordinaire, et on recolle.
function simplifieAnneau(pts, eps) {
  if (pts.length < 5) return pts;
  const [ax, ay] = pts[0];
  let idx = 0, max = -1;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const d = Math.hypot(pts[i][0] - ax, pts[i][1] - ay);
    if (d > max) { max = d; idx = i; }
  }
  const a = simplifie(pts.slice(0, idx + 1), eps);
  const b = simplifie(pts.slice(idx), eps);
  return [...a.slice(0, -1), ...b];
}

const r = (n) => Math.round(n * 10) / 10;
const aire = (pts) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1)
    a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  return Math.abs(a / 2);
};

function rend(liste, { eps, ferme = false, aireMin = 0 }) {
  const out = [];
  for (const w of liste) {
    const p = w.pts.map(proj);
    // Hors cadre, avec une marge : inutile de l'embarquer.
    if (!p.some(([x, y]) => x > -80 && x < W + 80 && y > -80 && y < H + 80)) continue;
    // LE FILTRE PAR AIRE. Les donnees contiennent 68 « parcs » dont des jardins
    // partages et des cimetieres d'eglise de quelques metres. Sur une carte de
    // quartier ce sont des miettes : elles salissent le dessin sans rien dire.
    if (aireMin && aire(p) < aireMin) continue;
    const s = ferme ? simplifieAnneau(p, eps) : simplifie(p, eps);
    if (s.length < 2) continue;
    let d = `M${r(s[0][0])} ${r(s[0][1])}`;
    for (const q of s.slice(1)) d += `L${r(q[0])} ${r(q[1])}`;
    out.push({ d: ferme ? `${d}Z` : d, nom: w.nom, aire: aire(p) });
  }
  return out;
}

// SEULEMENT LES TRACES FERMES, et c'est une correction d'un defaut qui se
// voyait a dix metres : sur 49 plans d'eau, 17 sont des morceaux de berge
// venant d'une relation multipolygone. Remplir un morceau de contour ouvert ne
// donne pas un plan d'eau, ca donne un enorme coin triangulaire en travers de
// la carte. C'est ce qui barrait la premiere version en diagonale.
const estFerme = (w) => {
  const a = w.pts[0], b = w.pts[w.pts.length - 1];
  return a && b && a[0] === b[0] && a[1] === b[1];
};
const eau = rend(couches.eau.filter(estFerme), { eps: 1.0, ferme: true, aireMin: 400 });
// L'axe du cours d'eau. Les berges de la Tamise sont une relation
// multipolygone et arrivent parfois incompletes au bord des tuiles ; l'axe,
// lui, est continu, et trace large il rend la courbe que tout le monde
// reconnait.
// LA TAMISE, ET ELLE SEULE. La couche brute contient aussi Chelsea Creek, un
// chemin pietonnier mal tage, et la Westbourne — une riviere ENTERREE depuis le
// XIXe siecle. Tracer une riviere qu'on ne voit pas depuis cent cinquante ans
// serait une erreur de carte, pas un detail.
const fleuve = rend((couches.fleuve || []).filter((w) => w.nom === "River Thames"), { eps: 1.2 });
// Meme filtre que pour l'eau : un parc venu d'une relation arrive en morceaux
// de contour, et remplir un morceau ouvert salit la carte au lieu de dessiner
// un parc.
const parc = rend(couches.parc.filter(estFerme), { eps: 1.2, ferme: true, aireMin: 900 });
const axes = rend(couches.axes, { eps: 1.4 });
const rues = rend(couches.rues, { eps: 1.4 });
const rail = rend(couches.rail, { eps: 2.0 });

const entete = `// GENERE PAR scripts/carte-battersea.mjs — NE PAS EDITER A LA MAIN.
//
// Geometrie REELLE de Battersea, projetee et simplifiee. Donnees
// OpenStreetMap, sous licence ODbL : la page qui affiche cette carte DOIT
// porter « © OpenStreetMap contributors ». Si la mention part, la carte part.
//
// Fenetre : ${VUE.sud} / ${VUE.ouest} / ${VUE.nord} / ${VUE.est}
// Genere le ${new Date().toISOString().slice(0, 10)}.

export const CADRE = { largeur: ${W}, hauteur: ${H} } as const;
`;

const bloc = (nom, v) => `\nexport const ${nom}: string[] = [\n${v.map((x) => `  "${x.d}",`).join("\n")}\n];`;

writeFileSync(
  "src/components/carteDonnees.ts",
  entete + bloc("EAU", eau) + bloc("FLEUVE", fleuve) + bloc("PARC", parc) +
  bloc("AXES", axes) + bloc("RUES", rues) + bloc("RAIL", rail) + "\n"
);

console.log(`cadre ${W}x${H}`);
for (const [k, v] of Object.entries({ eau, fleuve, parc, axes, rues, rail })) {
  const pts = v.reduce((a, x) => a + (x.d.match(/L/g) || []).length + 1, 0);
  console.log(`${k.padEnd(5)} ${String(v.length).padStart(4)} traces · ${String(pts).padStart(5)} points`);
}
console.log("parcs retenus :", parc.filter((p) => p.nom).sort((a, b) => b.aire - a.aire).slice(0, 8).map((p) => p.nom).join(" | "));
console.log("eaux retenues :", eau.sort((a, b) => b.aire - a.aire).slice(0, 5).map((p) => p.nom || "(sans nom)").join(" | "));
