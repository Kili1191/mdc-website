// Fabrique public/og.jpg — la carte que WhatsApp, iMessage et LinkedIn
// affichent quand quelqu'un partage l'adresse du site.
//
//   npm i --no-save playwright@1.62.1   (voir .claude/skills/playwright-cli)
//   node scripts/generate_og.mjs
//
// Aucun serveur n'est necessaire : la page est composee en local et rendue en
// file://. Le format 1200x630 est celui que les plateformes attendent, et il
// est declare tel quel dans les metadonnees de src/app/layout.tsx.
//
// TROIS CHOSES APPRISES EN LA RATANT DEUX FOIS, a ne pas refaire :
//
//   1. NE PAS CAPTURER LA PAGE D'ACCUEIL. Une capture du site donne une belle
//      image, mais Kilian voulait une carte de visite : le logo en grand et le
//      nom. Une phrase d'accroche a la place du nom ne se reconnait pas dans
//      une liste de conversations.
//   2. NE PAS UTILISER photos/rt-01.jpg NI motif-compo.jpg COMME FOND. Ces
//      pierres portent DEJA une maison gravee et des lotus sculptes. Le logo
//      pose dessus fait deux maisons a l'ecran, dont une coupee, et les lotus
//      mangent le nom. DIRECTION.md l'interdit explicitement : « deux maisons
//      a l'ecran, celle du site et celle de la pierre, ne s'expliquent pas ».
//      `albatre-lisse.jpg` est la seule pierre du depot qui ne contient rien.
//   3. NE PAS CAPTURER LE CANVAS DU MARBRE en masquant le contenu. SiteMarble
//      est imbrique dans le wrapper de page : masquer les enfants du body
//      masque son parent, et on obtient un aplat parchemin avec du texte
//      fantome. Mesure : 6 Ko de JPEG au lieu de 100.

import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RACINE = new URL("..", import.meta.url).pathname;
const b64 = (chemin, mime) =>
  `data:${mime};base64,` + readFileSync(join(RACINE, chemin)).toString("base64");

// Le logo est un SVG de traits : on retire toute couleur imposee pour le
// peindre en Rouille, comme le veut le skill taste (aplat, jamais de filaire).
const logo = readFileSync(join(RACINE, "public/mdc-logo.svg"), "utf8")
  .replace(/\sfill="(?!none)[^"]*"/g, "")
  .replace("<svg ", '<svg class="maison" ');

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family:"Higuen"; src:url("${b64("public/fonts/Higuen.otf", "font/otf")}") format("opentype"); }
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1200px; height:630px; overflow:hidden; }
body {
  background:#EDE4D0 url("${b64("public/albatre-lisse.jpg", "image/jpeg")}") center/cover no-repeat;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:56px;
}
.maison { width:auto; height:296px; }
.maison path { fill:#A55A3E; }            /* Rouille */
.nom {
  /* La signature de l'intro, a l'identique. Elle existe deja : IntroOverlay
     pose « Maison du Calme » en Higuen, casse de titre, letter-spacing .14em,
     brou fonce. Une premiere version de cette carte l'avait reecrite en
     CAPITALES espacees a .26em — c'est-a-dire une SECONDE signature pour la
     meme maison. On ne fabrique pas deux logotypes. */
  font-family:"Higuen", serif;
  font-size:46px; letter-spacing:0.14em; text-indent:0.14em;
  color:#2F2519;                          /* Brou fonce */
  line-height:1;
}
</style></head><body>${logo}<p class="nom">Maison du Calme</p></body></html>`;

const fichier = join(tmpdir(), "mdc-og.html");
writeFileSync(fichier, page);

const navigateur = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const onglet = await navigateur.newPage({ viewport: { width: 1200, height: 630 } });
await onglet.goto("file://" + fichier);
await onglet.waitForTimeout(1500);        // laisser la police se poser
await onglet.screenshot({ path: join(RACINE, "public/og.jpg"), type: "jpeg", quality: 92 });
await navigateur.close();

console.log("public/og.jpg — 1200x630");
