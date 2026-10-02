// LE BANC DU LOCKUP DE MARQUE.
//
// Il existe parce qu'un defaut de 5 px a vecu des semaines dans la barre du
// haut sans que personne le voie : « pourquoi le texte du logo est pas
// aligne ? ». Trois valeurs decidaient de tout et aucune n'etait verifiee.
//
// CE QU'IL MESURE, ET POURQUOI PAS LA BOITE. Une boite CSS ne dit pas ou est
// l'encre : l'interlettre pousse un blanc apres la derniere lettre, un padding
// s'ajoute au bord, et l'apex d'un A deborde a gauche de sa propre boite. Les
// trois defauts corriges ici etaient tous invisibles a getBoundingClientRect
// seul. On passe donc par un Range pour ignorer padding et marge, et on retire
// l'interlettre a la main.
//
// LE MUR, LUI, NE SE MESURE PAS A L'ECRAN. Le trace deborde de ses avant-toits
// et c'est le MUR que l'oeil aligne, pas le toit. Sa position est une donnee du
// fichier : x = 52 sur une image de 574 x 480, soit 52/480 de la hauteur
// rendue. La meme constante vit dans Marque.tsx ; si l'image change, les deux
// bougent ensemble ou ce banc ment.
//
//   node scripts/mesure-marque.mjs 3421
//
// A lancer contre un serveur de PRODUCTION a jour. Un `next start` sur un
// .next perime sert l'ancien build en repondant 200 : ce depot s'est deja fait
// avoir, et la barre n'apparait meme pas dans le HTML servi — elle est rendue
// au client. Verifier d'abord que la page affiche quelque chose.

import puppeteer from "puppeteer";

const PORT = process.argv[2] ?? "3000";
const MUR = 52 / 480;
const LARGEURS = [1990, 1440, 768, 560, 390];

const nav = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});

let fautes = 0;
console.log("\n  largeur   trace   mur/garde     nom/devise    trou    bouts de barre");
console.log("  ───────────────────────────────────────────────────────────────────");

for (const w of LARGEURS) {
  const p = await nav.newPage();
  await p.setViewport({ width: w, height: 900 });
  // Chromium headless annonce prefers-reduced-motion: reduce par defaut.
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await p.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle0", timeout: 90000 });
  const skip = await p.$("#mdc-skip");
  if (skip) await skip.click();
  await new Promise((r) => setTimeout(r, 1800));

  const d = await p.evaluate((MUR) => {
    const img = document.querySelector(".mdc-seuil__marque img");
    if (!img) return null;
    const ib = img.getBoundingClientRect();
    const mur = ib.left + ib.height * MUR;
    const garde = parseFloat(getComputedStyle(document.querySelector(".mdc-seuil")).paddingLeft);

    const spans = [...document.querySelectorAll(".mdc-seuil__marque span span")];
    const vu = (e) => e && getComputedStyle(e).display !== "none";
    const nom = spans.find((s) => (s.textContent || "").includes("MAISON"));
    const dev = spans.find((s) => (s.textContent || "").includes("house"));

    const a = document.querySelector(".mdc-seuil__begin");
    const r = document.createRange();
    r.selectNodeContents(a);
    const encreN = window.innerWidth
      - (r.getBoundingClientRect().right - parseFloat(getComputedStyle(a).letterSpacing));

    return {
      h: ib.height,
      murGarde: mur - garde,
      lignes: vu(nom) && vu(dev)
        ? { ecart: nom.getBoundingClientRect().left - dev.getBoundingClientRect().left,
            trou: nom.getBoundingClientRect().left - ib.right }
        : null,
      bouts: encreN - mur,
    };
  }, MUR);
  await p.close();

  if (!d) { console.log(`  ${String(w).padStart(5)}px   barre introuvable — serveur perime ?`); fautes++; continue; }

  // Planchers : le demi-pixel ne se voit pas, le pixel se voit.
  const mal = Math.abs(d.murGarde) > 0.5 || Math.abs(d.bouts) > 0.5
    || (d.lignes && Math.abs(d.lignes.ecart) > 0.5);
  if (mal) fautes++;
  const n = (v, u = "") => (v >= 0 ? " " : "") + v.toFixed(3) + u;
  console.log(
    `  ${String(w).padStart(5)}px  ${d.h.toFixed(0).padStart(4)}   ${n(d.murGarde).padStart(8)}   `
    + (d.lignes ? `${n(d.lignes.ecart).padStart(9)}   ${d.lignes.trou.toFixed(2).padStart(6)}` : `${"masquees".padStart(9)}   ${"—".padStart(6)}`)
    + `   ${n(d.bouts).padStart(8)}   ${mal ? "FAUTE" : "ok"}`,
  );
}

await nav.close();
console.log(fautes === 0 ? "\n  vert\n" : `\n  ROUGE : ${fautes} largeur(s) hors plancher\n`);
process.exit(fautes === 0 ? 0 : 1);
