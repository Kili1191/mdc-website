// OU TOMBENT LES COUPURES DE LIGNE, ET DANS QUOI.
//
// Kilian : « make sure to cut sentences a la ligne quand cest vraiment
// necessaire autrement mets toute la phrases a la ligne ». Autrement dit : une
// coupure doit tomber ENTRE deux phrases ; dans une phrase, seulement si elle
// ne tient pas sur une ligne.
//
// Ce banc classe chaque coupure d'un bloc d'affichage :
//   · « entre » — la ligne finit sur une fin de phrase. C'est la bonne.
//   · « dans »  — la ligne coupe au milieu d'une phrase. Fautive SI la phrase
//                 tenait sur une ligne entiere de ce bloc.
//
// La largeur d'une phrase est mesuree sur l'encre, pas estimee aux caracteres :
// `ch` ment d'un facteur 1,515 en Prata et 1,164 en Higuen sur ce depot.
//
//   node scripts/mesure-phrases.mjs 3440

import puppeteer from "puppeteer";

const PORT = process.argv[2] ?? "3000";
const LARGEURS = [1990, 1440, 390];
const PAGES = ["/", "/begin", "/the-work"];

const nav = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});

let fautes = 0;
for (const w of LARGEURS) {
  console.log(`\n═══ ${w}px ═══`);
  for (const route of PAGES) {
    const p = await nav.newPage();
    await p.setViewport({ width: w, height: 900 });
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
    await p.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle0", timeout: 90000 });
    const skip = await p.$("#mdc-skip"); if (skip) await skip.click();
    await new Promise((r) => setTimeout(r, 1500));
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
      // Figer la revelation : un mot en mouvement fausse le compte des lignes.
      const st = document.createElement("style");
      st.textContent = ".mdc-breath-word,.mdc-char{transform:none !important;"
        + "opacity:1 !important;animation:none !important;transition:none !important}";
      document.head.appendChild(st);
    });
    await new Promise((r) => setTimeout(r, 600));

    const res = await p.evaluate(() => {
      const out = [];
      // UN BANC QUI N'A RIEN REGARDE REND « vert ». Celui-ci a deja rendu vert
      // apres avoir pris 210 caracteres pour autant de blocs. Il compte donc
      // ce qu'il examine, et le compte s'affiche a chaque passe.
      const vu = { blocs: 0, multi: 0, coupures: 0, entre: 0, dans: 0 };
      // Les blocs d'affichage : ceux que ces deux composants rendent.
      // ON REMONTE JUSQU'AU VRAI BLOC, ET LA PREMIERE VERSION N'Y ARRIVAIT PAS.
      //
      // Elle testait `display.indexOf("block") !== -1`, qui est VRAI pour
      // `inline-block`. La remontee s'arretait donc sur le mot lui-meme, voire
      // sur le caractere : 210 « blocs » d'une lettre, aucun de deux lignes,
      // et un rapport vert sans avoir rien regarde. C'est le harnais qui
      // echantillonne zero et rend « aucun probleme », deja paye ici.
      const EST_BLOC = /^(block|flow-root|list-item|flex|grid)$/;
      const blocs = new Set();
      for (const n of document.querySelectorAll(".mdc-breath-word, .mdc-char")) {
        let b = n.parentElement;
        while (b && !EST_BLOC.test(getComputedStyle(b).display)) b = b.parentElement;
        if (b) blocs.add(b);
      }
      for (const el of blocs) {
        vu.blocs++;
        const t = (el.textContent || "").trim();
        if (!t || t.split(/\s+/).length < 5) continue;
        const r = el.getBoundingClientRect();
        if (!r.width) continue;

        // Les mots, avec leur rectangle et leur rang de ligne.
        const mots = [];
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let n; const rg = document.createRange();
        while ((n = tw.nextNode())) {
          const re = /\S+/g; let m;
          while ((m = re.exec(n.textContent))) {
            rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
            const b = rg.getBoundingClientRect();
            if (b.width) mots.push({ t: m[0], top: Math.round(b.top), l: b.left, r: b.right, n: n.parentElement });
          }
        }
        // RECONSTRUIRE LES MOTS, PARCE QUE SplitTextChars RENTRE UN
        // CARACTERE PAR SPAN. Sans ca, chaque lettre compte pour un mot : le
        // banc signalait « H e w i l l n e v e r… » comme une phrase coupee,
        // ce qui ne veut rien dire. Deux fragments voisins sur la meme ligne
        // separes de moins de 3px appartiennent au meme mot — un vrai blanc
        // de mot fait au moins 4px a la plus petite taille du site.
        const fusion = [];
        for (const m of mots) {
          const d = fusion[fusion.length - 1];
          if (d && d.top === m.top && m.l - d.r < 3) { d.t += m.t; d.r = m.r; }
          else fusion.push({ ...m });
        }
        mots.length = 0; mots.push(...fusion);
        if (!mots.length) continue;
        const lignes = [...new Set(mots.map((m) => m.top))].sort((a, b) => a - b);
        if (lignes.length < 2) continue;
        vu.multi++;
        vu.coupures += lignes.length - 1;

        // Fin de phrase = mot terminant par . ! ? (hors abreviation evidente).
        const finDePhrase = (s) => /[.!?]["»”’]?$/.test(s);

        for (let i = 0; i < lignes.length - 1; i++) {
          const surLigne = mots.filter((m) => m.top === lignes[i]);
          const dernier = surLigne[surLigne.length - 1];
          if (finDePhrase(dernier.t)) { vu.entre++; continue; }   // coupure ENTRE : correcte
          vu.dans++;

          // COUPURE DANS UNE PHRASE. TENAIT-ELLE ? ON NE L'ESTIME PLUS.
          //
          // Premiere version : somme des encres plus les blancs observes,
          // comparee a la largeur du bloc. Elle sous-estimait de la marge du
          // dernier mot et du padding de ligne, et signalait donc comme
          // fautives deux phrases a 1 et 2 % de la largeur disponible — du
          // bruit presente comme un defaut.
          //
          // Depuis que chaque phrase est une boite inline-block, la reponse
          // est dans la mise en page elle-meme : une boite en retrecissement
          // prend sa largeur naturelle, SAUF si celle-ci depasse la colonne,
          // auquel cas elle est ramenee a la colonne. Donc une phrase dont la
          // boite est MOINS large que la colonne tenait, et n'avait aucune
          // raison d'etre coupee. Aucune arithmetique, aucune tolerance.
          const boite = (() => {
            let e = dernier.n;
            while (e && e !== el && getComputedStyle(e).display !== "inline-block") e = e.parentElement;
            // On remonte jusqu'a la boite de PHRASE, pas celle du mot.
            while (e && e !== el) {
              const p = e.parentElement;
              if (!p || p === el) break;
              if (getComputedStyle(p).display === "inline-block") e = p; else break;
            }
            return e && e !== el ? e.getBoundingClientRect() : null;
          })();
          if (!boite || boite.width >= r.width - 0.5) continue;  // ne tenait pas : coupure legitime
          out.push({
            ligne: i + 1, mot: dernier.t,
            phrase: mots.slice(a, z + 1).map((m) => m.t).join(" ").slice(0, 58),
            propre: Math.round(boite.width), dispo: Math.round(r.width),
          });
        }
      }
      return { out, vu };
    });
    await p.close();

    const { out: mauvaises, vu } = res;
    console.log(`  ${route.padEnd(12)} ${vu.blocs} blocs, ${vu.multi} sur plusieurs lignes,`
      + ` ${vu.coupures} coupures : ${vu.entre} entre phrases, ${vu.dans} dans une phrase`);
    if (mauvaises.length) {
      fautes += mauvaises.length;
      console.log(`  ${route}`);
      for (const o of mauvaises) {
        console.log(`      coupure DANS une phrase apres « ${o.mot} » — sa boite fait ${o.propre} px dans ${o.dispo} : elle tenait`);
        console.log(`        « ${o.phrase}… »`);
      }
    }
  }
}
await nav.close();
console.log(fautes === 0 ? "\n  vert : aucune phrase coupee alors qu'elle tenait\n" : `\n  ${fautes} coupure(s) evitable(s)\n`);
process.exit(fautes === 0 ? 0 : 1);
