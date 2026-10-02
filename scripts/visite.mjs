// LA TRAVERSEE — le site vu par quelqu'un qui arrive pour la premiere fois.
//
// Ce n'est pas une simulation d'opinion. Aucun modele ne « joue » le visiteur
// ici : on pilote le VRAI site dans un VRAI navigateur, et on releve ce qui est
// reellement a l'ecran, a quel instant, et ou le chemin se casse. Ce qu'on rend
// est un constat, pas un avis — l'avis vient apres, et il appartient aux agents
// `designer` et `offre`.
//
// DEUX PIEGES PAYES, et ils annulent la mesure s'ils sont oublies :
//
//   1. **Chromium headless annonce `prefers-reduced-motion: reduce` par
//      defaut.** On mesure alors le chemin mouvement reduit en croyant mesurer
//      une arrivee normale — et ce chemin-la SAUTE l'intro. Une passe avait
//      conclu « l'intro dure 5 s » quand elle en dure 26.
//   2. **L'intro ne se saute que si le referrer est de meme origine**, et ce
//      referrer-la est `document.referrer`, PAS l'en-tete HTTP. Les poser avec
//      `setExtraHTTPHeaders` ne sert a rien — pire, Chromium refuse la
//      navigation avec `ERR_BLOCKED_BY_CLIENT`. Pour qu'un site croie qu'on
//      vient d'ailleurs, il faut VENIR d'ailleurs : on sert donc une page d'un
//      seul lien sur un AUTRE port, et on clique. Un port different suffit a
//      faire une autre origine.
//
//   npm run build && npx next start -p 3400
//   node scripts/visite.mjs http://localhost:3400 <google|bouche|bureau>
//
// Les captures sortent dans $S, sinon /tmp.

import puppeteer from "puppeteer";
import { createServer } from "node:http";

const BASE = process.argv[2] ?? "http://localhost:3000";
const PROFIL = process.argv[3] ?? "google";
const SORTIE = process.env.S ?? "/tmp";

// Trois arrivees, parce qu'elles ne vivent pas la meme chose.
const PROFILS = {
  // Elle a tape un symptome, elle est pressee, elle est au telephone.
  google: { large: 390, haut: 844, dpr: 3, tactile: true,
            dehors: true, depart: "/sessions" },
  // On lui a donne le nom. Elle tape l'adresse, donc aucun referrer.
  bouche: { large: 390, haut: 844, dpr: 3, tactile: true,
            dehors: false, depart: "/" },
  // Il regarde au travail, sur un portable court.
  bureau: { large: 1440, haut: 900, dpr: 1,
            dehors: true, depart: "/" },
};

const p = PROFILS[PROFIL];
if (!p) { console.error("profil inconnu :", PROFIL); process.exit(1); }

// Le serveur sert-il bien CE build ? Un `next start` demarre avant un rebuild
// sert l'ancienne carte d'assets, son CSS repond 404, et tout ce qui suit est
// mesure sur une page sans aucun style.
const html = await (await fetch(BASE + p.depart)).text();
const css = html.match(/\/_next\/static\/chunks\/[^"]+\.css/)?.[0];
const code = css ? (await fetch(BASE + css)).status : 0;
if (code !== 200) { console.error(`CSS -> ${code}. La page mesuree n'aurait pas de styles.`); process.exit(1); }

const nav = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await nav.newPage();
await page.setViewport({ width: p.large, height: p.haut, deviceScaleFactor: p.dpr, hasTouch: !!p.tactile });
// LE PIEGE N°1. Sans cette ligne, on mesure un visiteur qui n'existe pas.
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
// L'ailleurs d'ou l'on vient. Un port different est une autre origine, donc
// `document.referrer` sera externe — exactement comme un clic depuis Google.
const PORT_DEHORS = 3999;
let dehors = null;
if (p.dehors) {
  dehors = createServer((_, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(`<!doctype html><meta charset="utf-8"><a id="y" href="${BASE}${p.depart}">y</a>`);
  }).listen(PORT_DEHORS);
}

const attends = (ms) => new Promise((r) => setTimeout(r, ms));
const etat = () => page.evaluate(() => {
  // VOIR, C'EST NE PAS ETRE RECOUVERT. Une premiere version testait la boite et
  // l'opacite : elle annoncait le titre « visible a 1013 ms » alors que le voile
  // de l'intro le couvrait jusqu'a 26 s. Un element peut etre dans l'ecran,
  // opaque, et parfaitement invisible.
  //
  // `elementFromPoint` sur le centre de la boite repond a la vraie question :
  // qu'est-ce que le doigt toucherait si on appuyait la ?
  const vu = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (r.bottom <= 0 || r.top >= window.innerHeight) return false;
    if (parseFloat(getComputedStyle(el).opacity) <= 0.05) return false;
    const x = Math.min(window.innerWidth - 2, Math.max(2, r.left + r.width / 2));
    const y = Math.min(window.innerHeight - 2, Math.max(2, r.top + r.height / 2));
    const dessus = document.elementFromPoint(x, y);
    return !!dessus && (dessus === el || el.contains(dessus) || dessus.contains(el));
  };
  const h1 = document.querySelector("h1");
  const voile = document.querySelector(".mdc-stage, .mdc-intro");
  const h1r = h1 ? h1.getBoundingClientRect() : null;
  const dessus = h1r
    ? document.elementFromPoint(
        Math.min(innerWidth - 2, Math.max(2, h1r.left + h1r.width / 2)),
        Math.min(innerHeight - 2, Math.max(2, h1r.top + h1r.height / 2)))
    : null;
  return {
    titreVisible: vu(h1),
    couvertPar: dessus && h1 && !h1.contains(dessus) && dessus !== h1
      ? (dessus.className && String(dessus.className).slice(0, 24)) || dessus.tagName : null,
    titre: h1 ? h1.textContent.trim().slice(0, 48) : null,
    voile: voile ? Math.round(parseFloat(getComputedStyle(voile).opacity) * 100) / 100 : null,
    hauteur: document.documentElement.scrollHeight,
    ecrans: Math.round((document.documentElement.scrollHeight / window.innerHeight) * 10) / 10,
    y: Math.round(window.scrollY),
  };
});

console.log(`\n=== ${PROFIL} · ${p.large}x${p.haut} · venu ${p.dehors ? "d'ailleurs" : "en direct"} · depart ${p.depart} ===\n`);

const t0 = Date.now();
if (p.dehors) {
  await page.goto(`http://localhost:${PORT_DEHORS}/`, { waitUntil: "domcontentloaded" });
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.click("#y"),
  ]);
} else {
  await page.goto(BASE + p.depart, { waitUntil: "domcontentloaded" });
}
console.log("document.referrer vu par le site :", JSON.stringify(await page.evaluate(() => document.referrer)));

// CE QU'ON VOIT, ET QUAND. C'est la mesure qui compte le plus : personne
// n'attend devant une page vide, quelle que soit sa beaute.
let titreA = null;
for (const t of [1000, 3000, 6000, 12000, 20000, 26000, 30000]) {
  await attends(Math.max(0, t - (Date.now() - t0)));
  const e = await etat();
  if (!titreA && e.titreVisible) titreA = Date.now() - t0;
  console.log(`t=${String(t).padStart(5)} ms · titre ${e.titreVisible ? "VISIBLE" : "couvert"}` +
    `${e.couvertPar ? ` par ${e.couvertPar}` : ""} · voile ${e.voile ?? "-"} · ${e.hauteur} px`);
  if (t === 3000) await page.screenshot({ path: `${SORTIE}/visite-${PROFIL}-3s.png` });
}
console.log(`\nTITRE VISIBLE AU BOUT DE : ${titreA ? `${titreA} ms` : "JAMAIS dans 30 s"}`);

const fin = await etat();
console.log(`La page fait ${fin.hauteur} px, soit ${fin.ecrans} ecrans.`);

// LE CHEMIN VERS BEGIN. C'est la seule chose que ce site doit produire.
const chemin = await page.evaluate(() => {
  const liens = [...document.querySelectorAll('a[href*="/begin"]')];
  const doc = document.documentElement.scrollHeight;
  return {
    nombre: liens.length,
    premier: liens.length ? Math.round(liens[0].getBoundingClientRect().top + window.scrollY) : null,
    partDeLaPage: liens.length
      ? Math.round(((liens[0].getBoundingClientRect().top + window.scrollY) / doc) * 100) : null,
    libelles: liens.slice(0, 5).map((a) => a.textContent.trim().slice(0, 30)),
  };
});
console.log(`\nLiens vers Begin : ${chemin.nombre}`);
if (chemin.nombre) {
  console.log(`  le premier est a ${chemin.premier} px, soit ${chemin.partDeLaPage} % de la page`);
  console.log(`  libelles : ${chemin.libelles.join(" | ")}`);
}

// LA DESCENTE, ecran par ecran : qu'est-ce qui est lisible a chaque palier ?
console.log(`\nLa descente :`);
const pas = Math.round(p.haut * 0.9);
for (let i = 1; i <= Math.min(10, Math.ceil(fin.hauteur / pas)); i += 1) {
  await page.evaluate((y) => window.scrollTo(0, y), i * pas);
  await attends(700);
  const bloc = await page.evaluate(() => {
    const dedans = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.08 &&
             parseFloat(getComputedStyle(el).opacity) > 0.12;
    };
    const t = [...document.querySelectorAll("h1,h2,p,span,a")]
      .filter((e) => e.textContent.trim().length > 12 && dedans(e))
      .map((e) => e.textContent.trim().replace(/\s+/g, " ").slice(0, 64));
    return [...new Set(t)].slice(0, 3);
  });
  console.log(`  ecran ${i} · ${bloc.length ? bloc.join(" / ") : "RIEN DE LISIBLE"}`);
}
await page.screenshot({ path: `${SORTIE}/visite-${PROFIL}-bas.png` });

// LE GESTE FINAL. Est-ce qu'on peut vraiment ecrire ?
await page.goto(`${BASE}/begin`, { waitUntil: "networkidle2" });
await attends(2500);
const formulaire = await page.evaluate(() => {
  const champ = document.querySelector("#carry");
  const bouton = [...document.querySelectorAll("button")].find((b) => /send/i.test(b.textContent));
  return {
    champ: !!champ,
    champVisibleSansDefiler: champ ? champ.getBoundingClientRect().top < window.innerHeight : null,
    champY: champ ? Math.round(champ.getBoundingClientRect().top) : null,
    bouton: !!bouton,
    debordement: document.documentElement.scrollWidth > window.innerWidth,
  };
});
console.log(`\nSur /begin : champ ${formulaire.champ ? "present" : "ABSENT"}` +
  (formulaire.champ ? ` · a ${formulaire.champY} px du haut de l'ecran` : "") +
  ` · bouton ${formulaire.bouton ? "present" : "ABSENT"}` +
  ` · debordement ${formulaire.debordement ? "OUI" : "non"}`);
await page.screenshot({ path: `${SORTIE}/visite-${PROFIL}-begin.png` });

await nav.close();
if (dehors) dehors.close();
