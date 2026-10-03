// TRAVERSEE DE /begin — constat horodate, pas un avis.
// node scripts/visite-begin.mjs <phone-cold|phone-warm|laptop-cold|laptop-warm> [base]
import puppeteer from "puppeteer";
import { createServer } from "node:http";

const PROFIL = process.argv[2] ?? "phone-cold";
const BASE = process.argv[3] ?? "https://www.maisonducalme.com";
const SORTIE = process.env.S ?? "/tmp";
const PROXY = process.env.HTTPS_PROXY;

const P = {
  "phone-cold":  { w: 390,  h: 844, dpr: 3, tactile: true,  venu: "dehors" },
  "phone-warm":  { w: 390,  h: 844, dpr: 3, tactile: true,  venu: "dedans" },
  "laptop-cold": { w: 1440, h: 900, dpr: 1, tactile: false, venu: "dehors" },
  "laptop-warm": { w: 1440, h: 900, dpr: 1, tactile: false, venu: "dedans" },
}[PROFIL];
if (!P) { console.error("profil inconnu"); process.exit(1); }

// Le serveur sert-il bien un build avec ses styles ?
const html = await (await fetch(BASE + "/begin")).text();
const css = html.match(/\/_next\/static\/chunks\/[^"]+\.css/)?.[0];
const code = css ? (await fetch(BASE + css)).status : 0;
if (code !== 200) { console.error(`CSS -> ${code}. Page sans styles.`); process.exit(1); }

const args = ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
if (PROXY && BASE.startsWith("https")) args.push(`--proxy-server=${PROXY}`);
const nav = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args });
const page = await nav.newPage();
await page.setViewport({ width: P.w, height: P.h, deviceScaleFactor: P.dpr, hasTouch: P.tactile });
// PIEGE 1 : headless annonce `reduce` par defaut, et ce chemin SAUTE l'intro.
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);

// PIEGE 2 : le referrer qui compte est document.referrer. Pour venir d'ailleurs,
// il faut VENIR d'ailleurs.
const PORT = 3999;
let dehors = null;
if (P.venu === "dehors") {
  dehors = createServer((_, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(`<!doctype html><meta charset="utf-8"><a id="y" href="${BASE}/begin">y</a>`);
  }).listen(PORT);
}

const attends = (ms) => new Promise((r) => setTimeout(r, ms));

// CIBLES. Reperees par un texte, parce que le markup n'a pas d'id.
const CIBLES = `[
  ["h1 Begin.",             () => document.querySelector("h1")],
  ["chapo no booking",      () => [...document.querySelectorAll("p")].find(e=>/There is no booking calendar/.test(e.textContent))],
  ["Q What do you carry?",  () => [...document.querySelectorAll("p")].find(e=>/^What do you carry\\?$/.test(e.textContent.trim()))],
  ["champ #carry",          () => document.querySelector("#carry")],
  ["bouton Send",           () => [...document.querySelectorAll("button")].find(e=>/send/i.test(e.textContent))],
  ["h2 Read by Kilian alone", () => [...document.querySelectorAll("h2")].find(e=>/Read by Kilian alone/.test(e.textContent))],
  ["h2 questions one at a time", () => [...document.querySelectorAll("h2")].find(e=>/Let the questions come one at a time/.test(e.textContent))],
  ["lien Be asked instead", () => [...document.querySelectorAll("a")].find(e=>/Be asked instead/.test(e.textContent))]
]`;

const etat = () => page.evaluate(`(() => {
  const vu = (el) => {
    if (!el) return "absent";
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return "boite nulle";
    if (parseFloat(getComputedStyle(el).opacity) <= 0.05) return "transparent";
    if (r.bottom <= 0 || r.top >= innerHeight) return "hors ecran";
    const x = Math.min(innerWidth - 2, Math.max(2, r.left + r.width / 2));
    const y = Math.min(innerHeight - 2, Math.max(2, r.top + r.height / 2));
    const d = document.elementFromPoint(x, y);
    if (!d) return "rien au point";
    if (d === el || el.contains(d) || d.contains(el)) return "VU";
    return "couvert:" + ((d.className && String(d.className).slice(0,28)) || d.tagName);
  };
  const cibles = ${CIBLES};
  const o = {};
  for (const [nom, f] of cibles) { let el=null; try{el=f();}catch(e){} o[nom] = vu(el); }
  const voile = document.querySelector(".mdc-intro, .mdc-stage");
  return { cibles: o,
    voile: voile ? Math.round(parseFloat(getComputedStyle(voile).opacity)*100)/100 : null,
    voileClasse: voile ? String(voile.className).slice(0,40) : null,
    hauteur: document.documentElement.scrollHeight, y: Math.round(scrollY) };
})()`);

console.log(`\n=== /begin · ${PROFIL} · ${P.w}x${P.h} · venu ${P.venu} · ${BASE} ===\n`);

const t0 = Date.now();
if (P.venu === "dehors") {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click("#y")]);
} else {
  // On entre par l'accueil, puis on clique le lien Begin de la nav : referrer
  // de meme origine, donc l'intro est sautee — exactement comme un visiteur
  // qui est deja dans la maison.
  await page.goto(`${BASE}/?from=carry`, { waitUntil: "domcontentloaded" });
  await attends(1500);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.evaluate(() => [...document.querySelectorAll('a[href="/begin"],a[href*="/begin"]')][0].click()),
  ]);
}
const tNav = Date.now();
console.log("document.referrer :", JSON.stringify(await page.evaluate(() => document.referrer)));
console.log("prefers-reduced-motion:reduce ?", await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));

const PALIERS = P.venu === "dehors"
  ? [500, 1000, 2000, 4000, 8000, 12000, 16000, 20000, 24000, 26000, 26500, 27000, 28000, 31000]
  : [200, 500, 1000, 1500, 2500, 4000, 6000, 9000];
const premiere = {};
for (const t of PALIERS) {
  await attends(Math.max(0, t - (Date.now() - tNav)));
  const e = await etat();
  for (const [k, v] of Object.entries(e.cibles)) if (v === "VU" && !premiere[k]) premiere[k] = Date.now() - tNav;
  const court = Object.entries(e.cibles).map(([k, v]) => `${k.split(" ")[0]}=${v === "VU" ? "VU" : v.slice(0,18)}`).join(" ");
  console.log(`t=${String(t).padStart(5)} · voile ${e.voile ?? "-"} · ${e.hauteur}px · ${court}`);
  if (t === 2000 || t === 1000) await page.screenshot({ path: `${SORTIE}/begin-${PROFIL}-${t}.png` });
}
console.log(`\nPREMIER INSTANT REELLEMENT VU (ms apres le clic) :`);
for (const [k] of JSON.parse(await page.evaluate(`JSON.stringify(${CIBLES}.map(c=>[c[0]]))`)))
  console.log(`  ${k.padEnd(30)} ${premiere[k] ? premiere[k] + " ms" : "pas dans le premier ecran / jamais sur la fenetre de mesure"}`);

// LA PAGE, ET OU SONT LES CHOSES
const geo = await page.evaluate(`(() => {
  const cibles = ${CIBLES};
  const doc = document.documentElement.scrollHeight;
  const o = { hauteur: doc, ecran: innerHeight, ecrans: Math.round(doc/innerHeight*10)/10, elements: {} };
  for (const [nom, f] of cibles) {
    let el=null; try{el=f();}catch(e){}
    if (!el) { o.elements[nom] = null; continue; }
    const r = el.getBoundingClientRect();
    const top = Math.round(r.top + scrollY);
    o.elements[nom] = { top, bas: Math.round(r.bottom + scrollY),
      pourcent: Math.round(top / doc * 1000)/10,
      // defilement necessaire pour que le HAUT de l'element entre dans l'ecran
      defilePourVoir: Math.max(0, Math.round(top - innerHeight + 60)),
      // defilement pour le centrer
      defilePourCentrer: Math.max(0, Math.round(top - innerHeight/2)) };
  }
  return o;
})()`);
console.log(`\nLA PAGE : ${geo.hauteur} px, ecran ${geo.ecran} px, soit ${geo.ecrans} ecrans.`);
for (const [k, v] of Object.entries(geo.elements))
  console.log(`  ${k.padEnd(30)} ${v ? `y=${String(v.top).padStart(5)} px (${String(v.pourcent).padStart(5)} % de la page) · il faut defiler ${v.defilePourVoir} px pour l'apercevoir, ${v.defilePourCentrer} px pour le centrer` : "ABSENT"}`);

// SANS DEFILER DU TOUT
await page.evaluate(() => scrollTo(0, 0));
await attends(900);
const sansDefiler = await page.evaluate(() => {
  const dedans = (el) => { const r = el.getBoundingClientRect();
    return r.top < innerHeight - 4 && r.bottom > 4 && parseFloat(getComputedStyle(el).opacity) > 0.12 && el.textContent.trim().length > 1; };
  const t = [...document.querySelectorAll("h1,h2,p,span,a,button,label,textarea,select,input")]
    .filter(dedans).map((e) => `${e.tagName.toLowerCase()}: ${(e.textContent.trim()||e.getAttribute("placeholder")||"(champ)").replace(/\s+/g," ").slice(0,70)}`);
  return [...new Set(t)];
});
console.log(`\nSANS DEFILER (scroll 0), ce qui est dans l'ecran :`);
sansDefiler.forEach((l) => console.log("  " + l));
await page.screenshot({ path: `${SORTIE}/begin-${PROFIL}-fold.png` });

// LA DESCENTE
console.log(`\nLA DESCENTE (pas de ${Math.round(P.h*0.9)} px) :`);
const pas = Math.round(P.h * 0.9);
for (let i = 1; i <= Math.ceil(geo.hauteur / pas); i += 1) {
  await page.evaluate((y) => scrollTo(0, y), i * pas);
  await attends(650);
  const bloc = await page.evaluate(() => {
    const dedans = (el) => { const r = el.getBoundingClientRect();
      return r.top < innerHeight*0.92 && r.bottom > innerHeight*0.08 && parseFloat(getComputedStyle(el).opacity) > 0.12; };
    const t = [...document.querySelectorAll("h1,h2,p,span,a,button,label")]
      .filter((e) => e.textContent.trim().length > 10 && dedans(e))
      .map((e) => e.textContent.trim().replace(/\s+/g," ").slice(0,58));
    return [...new Set(t)].slice(0, 3);
  });
  console.log(`  ecran ${String(i).padStart(2)} (y=${String(i*pas).padStart(5)}) · ${bloc.length ? bloc.join(" / ") : "RIEN DE LISIBLE"}`);
}

// LA MACHINE : le texte EXTRAIT
const extrait = await page.evaluate(() => {
  const m = document.querySelector("main");
  return { innerText: m.innerText.replace(/\n{2,}/g,"\n").slice(0, 1400),
           textContent: m.textContent.replace(/\s+/g," ").slice(0, 700),
           colles: (m.textContent.match(/[a-z]{24,}/g) || []).slice(0, 8) };
});
console.log(`\nLA MACHINE — main.textContent (ce que recoit un extracteur) :\n${extrait.textContent}`);
console.log(`\nmots de 24+ lettres sans espace (signe de mots colles) : ${extrait.colles.length ? extrait.colles.join(", ") : "aucun"}`);
console.log(`\nmain.innerText :\n${extrait.innerText}`);

// LE CLAVIER SEUL
await page.evaluate(() => scrollTo(0, 0));
await attends(400);
const tab = [];
for (let i = 0; i < 22; i += 1) {
  await page.keyboard.press("Tab");
  tab.push(await page.evaluate(() => {
    const a = document.activeElement; if (!a) return "rien";
    const r = a.getBoundingClientRect();
    return `${a.tagName.toLowerCase()}${a.id ? "#"+a.id : ""} "${(a.textContent||a.getAttribute("aria-label")||"").trim().replace(/\s+/g," ").slice(0,34)}" y=${Math.round(r.top+scrollY)} ecranY=${Math.round(r.top)}`;
  }));
}
console.log(`\nAU CLAVIER SEUL, ordre de Tab depuis le haut :`);
tab.forEach((l, i) => console.log(`  ${String(i+1).padStart(2)}. ${l}`));

await nav.close();
if (dehors) dehors.close();
