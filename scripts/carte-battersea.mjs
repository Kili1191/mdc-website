// Fabrique le trace de la carte de /questions a partir des donnees reelles.
//
// POURQUOI CE SCRIPT EXISTE. La premiere carte etait dessinee de memoire : un
// ruban approximatif pour la Tamise, un galet pour le parc, deux traits pour
// toute une ville. Kilian : « la carte est pas du tout pro, les graphiques sont
// horribles ». Il avait raison, et la cause n'etait pas le style — c'etait que
// la geometrie etait fausse. Un Londonien reconnait la courbe de la Tamise a
// Battersea au premier coup d'oeil ; une courbe inventee se voit aussi vite.
//
// ENTREE : les fichiers g-*.json tires d'OpenStreetMap (Overpass, `out geom`).
// SORTIE : src/components/carteDonnees.ts, des chaines de path SVG deja
// projetees, simplifiees et arrondies.
//
// ATTRIBUTION. Les donnees viennent d'OpenStreetMap et sont sous ODbL : la
// carte publiee DOIT porter « © OpenStreetMap contributors ». Ce n'est pas une
// politesse, c'est la licence. Si la mention disparait de la page, cette carte
// doit disparaitre avec elle.
//
//   node scripts/carte-battersea.mjs <dossier des g-*.json>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2];
if (!SRC) { console.error("usage: node scripts/carte-battersea.mjs <dossier>"); process.exit(1); }

// La fenetre. Elle vaut pour la projection ET pour le cadrage : tout ce qui
// sort est coupe par le viewBox.
const VUE = { sud: 51.4560, ouest: -0.1900, nord: 51.4870, est: -0.1350 };
const W = 1000;

// Projection equirectangulaire corrigee en longitude. A cette echelle (moins de
// 4 km) l'erreur par rapport a une vraie Mercator est de l'ordre du pixel, et
// elle a l'avantage de ne rien deformer verticalement.
const lat0 = (VUE.sud + VUE.nord) / 2;
const kx = Math.cos((lat0 * Math.PI) / 180);
const spanX = (VUE.est - VUE.ouest) * kx;
const spanY = VUE.nord - VUE.sud;
const echelle = W / spanX;
const H = Math.round(spanY * echelle);

const proj = ([lat, lon]) => [
  (lon - VUE.ouest) * kx * echelle,
  (VUE.nord - lat) * echelle,
];

// Douglas-Peucker. Sans lui, une seule rue de Londres pese plusieurs centaines
// de points et le fichier livre au navigateur devient absurde.
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
  return [
    ...simplifie(pts.slice(0, idx + 1), eps).slice(0, -1),
    ...simplifie(pts.slice(idx), eps),
  ];
}

const r = (n) => Math.round(n * 10) / 10;

function chemin(coords, eps, ferme) {
  const pts = simplifie(coords.map(proj), eps);
  if (pts.length < 2) return null;
  // Tout hors cadre, avec une marge : inutile de l'embarquer.
  const dedans = pts.some(([x, y]) => x > -60 && x < W + 60 && y > -60 && y < H + 60);
  if (!dedans) return null;
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (const p of pts.slice(1)) d += `L${r(p[0])} ${r(p[1])}`;
  return ferme ? `${d}Z` : d;
}

function lis(nom) {
  const f = join(SRC, `g-${nom}.json`);
  if (!existsSync(f)) return [];
  try {
    const d = JSON.parse(readFileSync(f, "utf8"));
    return Array.isArray(d.elements) ? d.elements : [];
  } catch { return []; }
}

// `out geom` rend `geometry` sur une way et `members[].geometry` sur une
// relation. Les deux se lisent de la meme facon une fois aplatis.
function traces(elements, eps, ferme) {
  const out = [];
  for (const e of elements) {
    const brins = e.type === "relation"
      ? (e.members || []).filter((m) => m.geometry).map((m) => m.geometry)
      : e.geometry ? [e.geometry] : [];
    for (const b of brins) {
      const c = chemin(b.map((p) => [p.lat, p.lon]), eps, ferme);
      if (c) out.push(c);
    }
  }
  return out;
}

// Les epsilons sont en unites du dessin. 1,2 sur une eau ou un parc garde la
// silhouette et jette le detail de bordure ; 1,6 sur une rue garde la courbe.
const couches = {
  eau: traces(lis("eau"), 1.2, true),
  parc: traces(lis("parc"), 1.2, true),
  axes: traces(lis("axes"), 1.6, false),
  rues: traces(lis("rues"), 1.6, false),
  rail: traces(lis("rail"), 2.0, false),
};

const entete = `// GENERE PAR scripts/carte-battersea.mjs — NE PAS EDITER A LA MAIN.
//
// Geometrie reelle de Battersea, projetee et simplifiee. Donnees
// OpenStreetMap, sous ODbL : la page qui affiche cette carte DOIT porter
// « © OpenStreetMap contributors ». Si la mention part, la carte part.
//
// Fenetre : ${VUE.sud} / ${VUE.ouest} / ${VUE.nord} / ${VUE.est}
// Genere le ${new Date().toISOString().slice(0, 10)}.

export const CADRE = { largeur: ${W}, hauteur: ${H} } as const;
`;

const corps = Object.entries(couches)
  .map(([k, v]) => `\nexport const ${k.toUpperCase()}: string[] = [\n${v.map((d) => `  "${d}",`).join("\n")}\n];`)
  .join("\n");

writeFileSync("src/components/carteDonnees.ts", entete + corps + "\n");

console.log(`cadre ${W}x${H}`);
for (const [k, v] of Object.entries(couches)) console.log(`${k.padEnd(6)} ${String(v.length).padStart(4)} traces`);
console.log(`fichier ${(entete + corps).length} octets`);
