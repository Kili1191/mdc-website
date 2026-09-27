// Recupere la geographie de Battersea par TUILES, depuis l'API principale
// d'OpenStreetMap.
//
// POURQUOI PAS OVERPASS. C'est l'outil normal pour ce travail, et il n'a pas
// tenu : depuis ce conteneur, l'instance principale repond « server too busy »
// en boucle, deux miroirs expirent, un troisieme sert une base VIDE (il rend
// zero element avec un timestamp bidon, ce qui ressemble a « il n'y a rien la-bas »
// et n'est pas ca), un quatrieme a un certificat expire, et Nominatim rend 429 :
// l'adresse de sortie est partagee et son quota est deja consomme ailleurs.
//
// L'API `/api/0.6/map` d'openstreetmap.org, elle, repond. Elle ne sait pas
// filtrer — elle rend TOUT ce qui est dans une boite, batiments compris — donc
// on la decoupe en petites tuiles, on ne garde que les quatre couches utiles, et
// on jette chaque tuile aussitot lue. Le disque de la session est une allocation
// fixe : garder cinquante megaoctets de XML pour en extraire trois cents
// kilo-octets serait une facon idiote de tomber en panne.
//
// LE PARSEUR EST FAIT A LA MAIN, et c'est deliberе : le XML d'OSM est
// parfaitement regulier, une machine a etats ligne par ligne le lit sans
// dependance, et ajouter une bibliotheque pour ca serait payer une dette pour
// un script qui tourne trois fois dans une vie.
//
//   node scripts/carte-tuiles.mjs <dossier de sortie>

import { writeFileSync, readFileSync, unlinkSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const OUT = process.argv[2];
if (!OUT) { console.error("usage: node scripts/carte-tuiles.mjs <dossier>"); process.exit(1); }

const VUE = { sud: 51.4560, ouest: -0.1900, nord: 51.4870, est: -0.1350 };
const PAS_LAT = 0.0075;
const PAS_LON = 0.011;

// Ce qu'on garde, et rien d'autre.
const GARDE = (t) => {
  if (t.waterway === "riverbank") return "eau";
  if (t.natural === "water") return "eau";
  // LA TAMISE N'EST PAS UNE WAY. Elle est stockee comme une RELATION
  // multipolygone dont les tronçons de berge ne portent aucun tag : un
  // extracteur qui ne lit que les ways tagees la rate entierement, et c'est
  // exactement ce qui est arrive au premier passage. Trois plans d'eau
  // recuperes — un bassin de port et un etang — et pas de fleuve.
  // On garde donc AUSSI l'axe du cours d'eau, qui lui est une way, et on lit
  // les relations plus bas.
  if (t.waterway === "river") return "fleuve";
  if (t.leisure === "park" || t.leisure === "common" || t.leisure === "nature_reserve") return "parc";
  if (t.highway === "motorway" || t.highway === "trunk" || t.highway === "primary") return "axes";
  if (t.highway === "secondary") return "rues";
  if (t.railway === "rail") return "rail";
  return null;
};

const couches = { eau: [], fleuve: [], parc: [], axes: [], rues: [], rail: [] };
const vus = new Set();

// Une machine a etats sur le XML d'OSM. Les noeuds d'abord, puis les ways,
// puis les relations — c'est l'ordre que l'API garantit, et c'est ce qui permet
// de lire le fichier en une seule passe.
//
// DEUX PASSES SUR LES WAYS, et c'est necessaire : on garde TOUTES les
// geometries en memoire le temps d'une tuile, parce qu'une relation peut
// reclamer une way qui ne porte aucun tag. Une tuile pese quelques megaoctets,
// elle tient en memoire, et elle est jetee juste apres.
function avale(xml) {
  const noeuds = new Map();
  const geoms = new Map();   // id de way -> points, taguee ou non
  const lignes = xml.split("\n");
  let dansWay = false, dansRel = false;
  let refs = [], membres = [], tags = {}, id = null;

  const pose = (couche, wid, pts, nom) => {
    if (!couche || vus.has(wid) || pts.length < 2) return;
    vus.add(wid);
    couches[couche].push({ id: wid, pts, nom: nom || "" });
  };

  for (const l of lignes) {
    if (dansWay) {
      const nd = l.match(/<nd ref="(\d+)"/);
      if (nd) { refs.push(nd[1]); continue; }
      const tg = l.match(/<tag k="([^"]+)" v="([^"]*)"/);
      if (tg) { tags[tg[1]] = tg[2]; continue; }
      if (l.includes("</way>")) {
        dansWay = false;
        const pts = refs.map((x) => noeuds.get(x)).filter(Boolean);
        geoms.set(id, pts);
        pose(GARDE(tags), id, pts, tags.name);
      }
      continue;
    }
    if (dansRel) {
      const m = l.match(/<member type="way" ref="(\d+)"(?: role="([^"]*)")?/);
      if (m) { membres.push({ ref: m[1], role: m[2] || "" }); continue; }
      const tg = l.match(/<tag k="([^"]+)" v="([^"]*)"/);
      if (tg) { tags[tg[1]] = tg[2]; continue; }
      if (l.includes("</relation>")) {
        dansRel = false;
        const couche = GARDE(tags);
        if (couche) {
          for (const mb of membres) {
            if (mb.role === "inner") continue;   // les iles, on s'en passe
            const pts = geoms.get(mb.ref);
            if (pts) pose(couche, `r${mb.ref}`, pts, tags.name);
          }
        }
      }
      continue;
    }

    const n = l.match(/<node id="(\d+)"[^>]*? lat="(-?[\d.]+)" lon="(-?[\d.]+)"/);
    if (n) { noeuds.set(n[1], [parseFloat(n[2]), parseFloat(n[3])]); continue; }
    const w = l.match(/<way id="(\d+)"/);
    if (w) { id = w[1]; refs = []; tags = {}; if (!l.includes("/>")) dansWay = true; continue; }
    const rl = l.match(/<relation id="(\d+)"/);
    if (rl) { id = rl[1]; membres = []; tags = {}; if (!l.includes("/>")) dansRel = true; continue; }
  }
}

const cols = Math.ceil((VUE.est - VUE.ouest) / PAS_LON);
const rows = Math.ceil((VUE.nord - VUE.sud) / PAS_LAT);
console.log(`${cols} x ${rows} = ${cols * rows} tuiles`);

const tmp = join(OUT, "tuile.xml");
let ok = 0, rate = 0;

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < cols; c += 1) {
    const s = VUE.sud + r * PAS_LAT;
    const w = VUE.ouest + c * PAS_LON;
    const n = Math.min(VUE.nord, s + PAS_LAT);
    const e = Math.min(VUE.est, w + PAS_LON);
    const bbox = `${w.toFixed(4)},${s.toFixed(4)},${e.toFixed(4)},${n.toFixed(4)}`;
    let recu = false;
    for (let essai = 1; essai <= 3 && !recu; essai += 1) {
      try {
        execFileSync("curl", ["-sS", "-m", "150", "-o", tmp, "-H", "User-Agent: mdc-site-map/1.0",
          `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`], { stdio: "pipe" });
        const xml = readFileSync(tmp, "utf8");
        if (xml.startsWith("<?xml") && xml.includes("<osm")) { avale(xml); recu = true; }
      } catch { /* on reessaie */ }
      if (!recu) execFileSync("sleep", ["8"]);
    }
    if (recu) { ok += 1; } else { rate += 1; console.log(`  tuile ${bbox} : abandon`); }
    if (existsSync(tmp)) unlinkSync(tmp);
    execFileSync("sleep", ["2"]);
  }
  console.log(`ligne ${r + 1}/${rows} — ${ok} tuiles lues, ${rate} manquees, ` +
    Object.entries(couches).map(([k, v]) => `${k} ${v.length}`).join(" · "));
}

writeFileSync(join(OUT, "geo.json"), JSON.stringify({ vue: VUE, couches }));
console.log("ecrit geo.json —", Object.entries(couches).map(([k, v]) => `${k} ${v.length}`).join(" · "));
