// CHASSE AUX LIGNES ORPHELINES.
//
// Kilian : « the sentence with only one word a la ligne stupid ». Un defaut
// qui ne se voit qu'a l'oeil, sur une largeur donnee, et qui revient des qu'un
// mot change. Ce banc le rend mesurable.
//
// COMMENT ON COMPTE LES LIGNES SANS LES DEVINER. On pose un Range sur chaque
// mot et on lit le haut de son rectangle : deux mots qui partagent le meme
// haut sont sur la meme ligne. Pas d'estimation par l'interligne, qui tombe
// faux des qu'une police change de taille dans le bloc.
//
//   node scripts/mesure-orphelines.mjs 3431

import puppeteer from "puppeteer";

const PORT = process.argv[2] ?? "3000";
const PAGES = ["/", "/sessions", "/begin", "/practitioner", "/the-work", "/retreats", "/coaching", "/teaching", "/questions"];
const LARGEURS = [1990, 1440, 390];

const nav = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});

let total = 0;
for (const w of LARGEURS) {
  console.log(`\n═══ ${w}px ═══`);
  for (const route of PAGES) {
    const p = await nav.newPage();
    await p.setViewport({ width: w, height: 900 });
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
    try {
      await p.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      const skip = await p.$("#mdc-skip"); if (skip) await skip.click();
      await new Promise((r) => setTimeout(r, 1500));
      // Tout faire apparaitre : les blocs reveles au defilement ne sont pas
      // composes tant qu'ils n'ont pas ete vus, et un bloc non compose n'a pas
      // de lignes a compter.
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 800));

      // ON FIGE LA REVELATION AVANT DE MESURER, ET CE BANC A DEJA MENTI SANS CA.
      //
      // Les mots de BreathReveal et les caracteres de SplitTextChars montent
      // de 0,4em en arrivant. Un Range pose pendant ce mouvement rend des
      // hauteurs differentes pour des mots de la MEME ligne, et le compte de
      // lignes explose : la meme phrase de deux lignes a ete relevee a six.
      // On remet donc chaque fragment a sa place avant de lire quoi que ce
      // soit. C'est le pendant du piege deja paye sur ce depot — le rectangle
      // rendu APRES transformation.
      await p.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = ".mdc-breath-word,.mdc-char{transform:none !important;"
          + "opacity:1 !important;animation:none !important;transition:none !important}";
        document.head.appendChild(st);
      });
      await new Promise((r) => setTimeout(r, 400));

      const orph = await p.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("p, h1, h2, h3, li, figcaption")) {
          const t = (el.textContent || "").trim();
          if (!t || t.split(/\s+/).length < 6) continue;      // trop court pour avoir une derniere ligne
          if (getComputedStyle(el).display === "none") continue;
          if (!el.getClientRects().length) continue;
          // Un Range par mot : le haut du rectangle identifie la ligne.
          const lignes = new Map();
          const marche = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = marche.nextNode())) {
            const s = n.textContent;
            const re = /\S+/g; let m;
            while ((m = re.exec(s))) {
              const r = document.createRange();
              r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
              const b = r.getBoundingClientRect();
              if (!b.width) continue;
              const cle = Math.round(b.top);
              if (!lignes.has(cle)) lignes.set(cle, []);
              lignes.get(cle).push({ t: m[0], r: b });
            }
          }
          // LE CRITERE EST CELUI DE KILIAN, MOT POUR MOT : « the sentence
          // with only one word a la ligne ». Une derniere ligne qui ne porte
          // qu'un mot, quelle que soit sa longueur.
          //
          // J'ai essaye un seuil de largeur a la place — 22 % de la plus
          // longue ligne — en me disant que « reachable. », dix caracteres,
          // ne se lisait pas comme une orpheline. C'etait substituer mon
          // jugement au sien sur une chose qu'il a formulee precisement. La
          // largeur reste affichee, comme contexte, jamais comme critere.
          const rangs = [...lignes.entries()].sort((a, b) => a[0] - b[0]);
          if (rangs.length < 2) continue;
          const der = rangs[rangs.length - 1][1];
          if (der.length !== 1) continue;
          const larg = (m) => m.reduce((a, x) => a + x.r.width, 0);
          const part = Math.round((larg(der) / Math.max(...rangs.map((e) => larg(e[1])))) * 100);
          out.push({
            mot: der[0].t, part, lignes: rangs.length, debut: t.slice(0, 54),
            tag: el.tagName, compose: el.querySelector(".mdc-breath-word,.mdc-char") ? "anime" : "simple",
          });
        }
        return out;
      });

      if (orph.length) {
        total += orph.length;
        console.log(`  ${route}`);
        for (const o of orph) console.log(`      « ${o.mot} » seul · ${o.tag} ${o.compose} · ${o.lignes} lignes, la derniere a ${o.part} %   —   ${o.debut}…`);
      }
    } catch (e) {
      console.log(`  ${route}  ERREUR ${String(e).split("\n")[0]}`);
      total++;
    }
    await p.close();
  }
}
await nav.close();
console.log(total === 0 ? "\n  vert : aucune ligne a un seul mot\n" : `\n  ${total} ligne(s) orpheline(s)\n`);
process.exit(total === 0 ? 0 : 1);
