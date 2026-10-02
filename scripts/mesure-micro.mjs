// L'INTERLIGNE DE LA PHRASE DE META, MESURE SUR L'ENCRE.
//
// Kilian : « some are not enough space between next paragraphe ». Le bloc
// vise est la paire de phrases sous le rail de l'accueil. Le defaut etait
// invisible a l'inspection : `micro` ne declare aucun `line-height`, donc le
// bloc heritait du 1,5 de Tailwind sans que la valeur apparaisse nulle part.
//
// ON MESURE L'ENCRE, PAS LA BOITE. Une boite de ligne inclut le demi-blanc
// au-dessus et au-dessous ; ce que l'oeil voit est la distance entre le bas
// d'une capitale et le haut de la suivante. On la reconstruit par les
// metriques de la fonte sur le texte REELLEMENT rendu, transformation de
// casse appliquee.
//
//   node scripts/mesure-micro.mjs 3440

import puppeteer from "puppeteer";

const PORT = process.argv[2] ?? "3000";
const nav = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});

console.log("\n  largeur  interligne  haut.cap  base→cap  rapport  blocs  reflux");
console.log("  ──────────────────────────────────────────────────────────────");
let fautes = 0;

for (const w of [1990, 1440, 900, 800, 760, 390]) {
  const p = await nav.newPage();
  await p.setViewport({ width: w, height: 900 });
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await p.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle0", timeout: 90000 });
  const skip = await p.$("#mdc-skip"); if (skip) await skip.click();
  await new Promise((r) => setTimeout(r, 1600));

  const d = await p.evaluate(() => {
    const blocs = [...document.querySelectorAll("p.mdc-micro--phrase")]
      .filter((e) => /Up to ninety minutes|Battersea, South West/.test(e.textContent || ""));
    if (!blocs.length) return null;
    const cs = getComputedStyle(blocs[0]);
    const taille = parseFloat(cs.fontSize);
    const inter = parseFloat(cs.lineHeight);

    // Hauteur de capitale sur le texte rendu, casse comprise.
    const cv = document.createElement("canvas").getContext("2d");
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = cv.measureText(cs.textTransform === "uppercase" ? "B" : "b");
    const cap = m.actualBoundingBoxAscent;

    // Blanc entre le dernier bloc et le precedent, de boite a boite : les deux
    // phrases sont deux <p>, donc c'est leur marge qui porte la couture.
    const r0 = blocs[0].getBoundingClientRect();
    const r1 = blocs[1]?.getBoundingClientRect();
    const couture = r1 ? r1.top - r0.bottom : null;

    // Une phrase reflue-t-elle sur plus d'une ligne ?
    const lignesDe = (el) => {
      const s = new Set();
      const t = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n; const rg = document.createRange();
      while ((n = t.nextNode())) {
        const re = /\S+/g; let x;
        while ((x = re.exec(n.textContent))) {
          rg.setStart(n, x.index); rg.setEnd(n, x.index + x[0].length);
          const b = rg.getBoundingClientRect();
          if (b.width) s.add(Math.round(b.top));
        }
      }
      return s.size;
    };
    return {
      taille, inter, cap, couture, nb: blocs.length,
      reflux: blocs.map(lignesDe),
      baseCap: inter - cap,
    };
  });
  await p.close();

  if (!d) { console.log(`  ${String(w).padStart(5)}px  bloc introuvable`); fautes++; continue; }
  // Plancher : le blanc au-dessus d'une capitale doit valoir au moins
  // 0,85 fois cette capitale. En dessous, deux lignes se lisent comme une
  // seule texture — c'est ce que la mesure a releve a 0,70.
  const rapport = d.baseCap / d.cap;
  const mal = rapport < 0.85;
  if (mal) fautes++;
  console.log(
    `  ${String(w).padStart(5)}px  ${d.inter.toFixed(2).padStart(9)}  ${d.cap.toFixed(2).padStart(8)}`
    + `  ${d.baseCap.toFixed(2).padStart(8)}  ${rapport.toFixed(2).padStart(7)}`
    + `  ${String(d.nb).padStart(5)}  ${d.reflux.join("+").padStart(6)}  ${mal ? "FAUTE" : "ok"}`
    + (d.couture !== null ? `   couture ${d.couture.toFixed(2)}px` : ""),
  );
}
await nav.close();
console.log(fautes === 0 ? "\n  vert\n" : `\n  ROUGE : ${fautes}\n`);
process.exit(fautes === 0 ? 0 : 1);
