// TRAVERSEE DE /begin/before — l'entretien, pour de vrai, en production.
//
// node scripts/visite-entretien.mjs <froid|entretien> <390|1440>
//
//   froid     : arrivee depuis l'exterieur, on ne mesure que l'attente et le seuil.
//   entretien : on arrive par /begin (froid), on clique « Be asked instead »,
//               on clique Start, et on repond a quatre questions. ON NE REPOND
//               PAS « Send this to Kilian » : la fiche partirait vraiment.
//
// Les reponses portent « essai technique » en clair, dans la langue du site et
// en francais, parce qu'elles sont lues par un modele puis par un humain.
import puppeteer from "puppeteer";
import { createServer } from "node:http";

const MODE = process.argv[2] ?? "entretien";
const W = Number(process.argv[3] ?? 390);
const H = W === 390 ? 844 : 900;
const BASE = "https://www.maisonducalme.com";
const SORTIE = process.env.S ?? "/tmp";
const attends = (ms) => new Promise((r) => setTimeout(r, ms));

const REPONSES = [
  "Essai technique du site, merci d'ignorer. Technical test of this page, not a real enquiry. For the record: long weeks at a desk, tired in the evenings.",
  "Essai technique. Technical test, please ignore. A few months, nothing medical, nothing urgent.",
  "Essai technique. Technical test, please ignore. Nothing to report about my body: no injury, no operation, no pregnancy.",
  "Essai technique. Technical test, please ignore. No reply needed, this is an automated check of the page.",
  "Essai technique. Technical test, please ignore.",
  "Essai technique. Technical test, please ignore.",
];

const nav = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox", `--proxy-server=${process.env.HTTPS_PROXY}`, "--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await nav.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: W === 390 ? 3 : 1, hasTouch: W === 390 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
page.on("console", (m) => { if (m.type() === "error") console.log("  [console] " + m.text().slice(0, 160)); });
page.on("requestfailed", (r) => console.log("  [requete echouee] " + r.url().slice(0, 90)));
page.on("response", (r) => { if (r.url().includes("/api/")) console.log(`  [api] ${r.status()} ${r.url().replace(BASE,"")}`); });

// Ce qui est a l'ecran, sans rien deviner.
const vu = () => page.evaluate(() => {
  const opEff = (el) => { let o = 1, n = el; while (n && n !== document.documentElement) { o *= parseFloat(getComputedStyle(n).opacity) || 0; n = n.parentElement; } return o; };
  const dedans = (el) => { const r = el.getBoundingClientRect();
    return r.top < innerHeight - 2 && r.bottom > 2 && r.width > 1 && opEff(el) > 0.12; };
  const lignes = [...document.querySelectorAll("h1,h2,p,label,button,a,span")]
    .filter((e) => e.textContent.trim().length > 1 && dedans(e) && !e.querySelector("h1,h2,p,label,button"))
    .map((e) => `${e.tagName.toLowerCase()}: ${e.textContent.trim().replace(/\s+/g," ").slice(0,78)}`);
  const q = document.querySelector("#mdc-question");
  const champ = document.querySelector("#mdc-reponse");
  const start = [...document.querySelectorAll("button")].find((b) => /^(Start|One moment)$/.test(b.textContent.trim()));
  const next = [...document.querySelectorAll("button")].find((b) => /^(Next|One moment)$/.test(b.textContent.trim()));
  const envoi = [...document.querySelectorAll("button")].find((b) => /Send this to Kilian|Sending/.test(b.textContent));
  const refus = [...document.querySelectorAll("button")].find((b) => /rather not say/.test(b.textContent));
  const alerte = document.querySelector('[role="alert"]');
  const boite = (el) => el ? { y: Math.round(el.getBoundingClientRect().top + scrollY), ecranY: Math.round(el.getBoundingClientRect().top), h: Math.round(el.getBoundingClientRect().height) } : null;
  return {
    url: location.pathname, scrollY: Math.round(scrollY), hauteur: document.documentElement.scrollHeight,
    ecran: innerHeight,
    question: q ? q.textContent.trim() : null, questionBoite: boite(q),
    champ: champ ? { type: champ.tagName.toLowerCase(), desactive: champ.disabled, ...boite(champ) } : null,
    focus: document.activeElement ? (document.activeElement.id || document.activeElement.tagName.toLowerCase()) : null,
    labelStart: start ? start.textContent.trim() : null, startBoite: boite(start),
    labelNext: next ? next.textContent.trim() : null, nextBoite: boite(next),
    envoiPresent: !!envoi, refusPresent: !!refus,
    alerte: alerte ? alerte.textContent.trim() : null,
    chapoAffiche: (() => { const c = document.querySelector(".mdc-seuil-chapo"); return c ? getComputedStyle(c).display : "absent"; })(),
    dataEntretien: document.documentElement.getAttribute("data-entretien"),
    intro: !!document.querySelector(".mdc-intro, .mdc-stage"),
    lignes: [...new Set(lignes)],
  };
});


// CLIQUER COMME UN DOIGT. On amene l'element au centre, on verifie que
// `elementFromPoint` rend bien cet element — sinon un clic de souris frappe
// autre chose et on le dit — puis on clique vraiment.
async function clique(page, trouve, nom) {
  await page.evaluate(`(() => { const el = (${trouve})(); if (el) el.scrollIntoView({ block: "center" }); })()`);
  await attends(900);
  const info = await page.evaluate(`(() => {
    const el = (${trouve})();
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = Math.min(innerWidth-2, Math.max(2, r.left + r.width/2));
    const y = Math.min(innerHeight-2, Math.max(2, r.top + r.height/2));
    const d = document.elementFromPoint(x, y);
    return { x, y, ecranY: Math.round(r.top), scrollY: Math.round(scrollY),
      touche: d ? (d === el || el.contains(d) || d.contains(el)) : false,
      quoi: d ? (String(d.className).slice(0,26) || d.tagName) : "rien" };
  })()`);
  if (!info) { console.log(`  [${nom}] ABSENT de la page`); return null; }
  console.log(`  [${nom}] ecranY=${info.ecranY} scrollY=${info.scrollY} · le doigt toucherait ${info.touche ? "LUI" : "autre chose (" + info.quoi + ")"}`);
  if (info.touche) await page.mouse.click(info.x, info.y);
  else await page.evaluate(`(() => (${trouve})().click())()`);
  return info;
}

if (MODE === "froid") {
  console.log(`\n=== /begin/before · arrivee FROIDE · ${W}x${H} ===\n`);
  const PORT = 3999;
  const dehors = createServer((_, res) => { res.writeHead(200, {"content-type":"text/html"});
    res.end(`<!doctype html><a id="y" href="${BASE}/begin/before">y</a>`); }).listen(PORT);
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click("#y")]);
  const tNav = Date.now();
  console.log("document.referrer :", JSON.stringify(await page.evaluate(() => document.referrer)));
  let premier = null;
  for (const t of [500, 2000, 6000, 12000, 20000, 26000, 26500, 27000, 28000, 31000]) {
    await attends(Math.max(0, t - (Date.now() - tNav)));
    const e = await page.evaluate(() => {
      const h1 = document.querySelector("h1"); const r = h1 && h1.getBoundingClientRect();
      const d = r ? document.elementFromPoint(Math.min(innerWidth-2, r.left+r.width/2), Math.min(innerHeight-2, Math.max(2, r.top+r.height/2))) : null;
      const b = [...document.querySelectorAll("button")].find(x => /^Start$/.test(x.textContent.trim()));
      const br = b && b.getBoundingClientRect();
      const bd = br ? document.elementFromPoint(Math.min(innerWidth-2, br.left+br.width/2), Math.min(innerHeight-2, Math.max(2, br.top+br.height/2))) : null;
      return { titre: h1 ? h1.textContent.trim() : null,
        couvert: d && h1 && !(d===h1||h1.contains(d)||d.contains(h1)) ? (String(d.className).slice(0,22)||d.tagName) : null,
        start: !!b, startEcranY: br ? Math.round(br.top) : null,
        startCouvert: bd && b && !(bd===b||b.contains(bd)) ? (String(bd.className).slice(0,22)||bd.tagName) : null,
        intro: !!document.querySelector(".mdc-intro, .mdc-stage") };
    });
    const lisible = e.titre && !e.couvert;
    if (lisible && !premier) premier = Date.now() - tNav;
    console.log(`t=${String(t).padStart(5)} · titre ${e.titre ? (e.couvert ? "couvert par " + e.couvert : "LISIBLE") : "absent"} · bouton Start ${e.start ? (e.startCouvert ? "couvert par " + e.startCouvert : `visible a ecranY=${e.startEcranY}`) : "absent"}`);
  }
  console.log(`\nTITRE REELLEMENT LISIBLE : ${premier} ms apres le clic`);
  const e = await vu();
  console.log(`\nLE SEUIL · page ${e.hauteur} px, ecran ${e.ecran} px, soit ${Math.round(e.hauteur/e.ecran*10)/10} ecrans`);
  console.log(`bouton Start : y=${e.startBoite?.y} px dans la page, ecranY=${e.startBoite?.ecranY} · ${e.startBoite?.ecranY < e.ecran ? "DANS le premier ecran" : "il faut defiler"}`);
  console.log(`\nSANS DEFILER :`); e.lignes.forEach(l => console.log("  " + l));
  await page.screenshot({ path: `${SORTIE}/before-froid-${W}.png` });
  dehors.close(); await nav.close(); process.exit(0);
}

// ── MODE ENTRETIEN ───────────────────────────────────────────────────────
console.log(`\n=== /begin/before · l'entretien traverse pour de vrai · ${W}x${H} ===\n`);
console.log("On arrive sur /begin depuis l'exterieur, on attend l'intro, on descend, on clique « Be asked instead ».");
const PORT = 3999;
const dehors = createServer((_, res) => { res.writeHead(200, {"content-type":"text/html"});
  res.end(`<!doctype html><a id="y" href="${BASE}/begin">y</a>`); }).listen(PORT);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click("#y")]);
await attends(28000);
const posLien = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href="/begin/before"]')][0];
  return a ? Math.round(a.getBoundingClientRect().top + scrollY) : null;
});
console.log(`« Be asked instead » est a y=${posLien} px. On defile.`);
const tClic0 = Date.now();
await clique(page, `() => document.querySelector('a[href="/begin/before"]')`, "Be asked instead");
const tClic = tClic0;
let arrive = null;
for (let t = 200; t <= 3600; t += 200) {
  await attends(Math.max(0, t - (Date.now() - tClic)));
  const e = await page.evaluate(() => {
    const h1 = document.querySelector("h1"); let o = 1, n = h1;
    while (n && n !== document.documentElement) { o *= parseFloat(getComputedStyle(n).opacity) || 0; n = n.parentElement; }
    return { url: location.pathname, titre: h1 ? h1.textContent.trim().slice(0,22) : null, op: Math.round(o*100)/100 };
  });
  if (!arrive && e.url === "/begin/before" && e.op > 0.05) arrive = Date.now() - tClic;
  if (t % 600 === 0) console.log(`  t=${t} apres le clic · ${e.url} · h1 « ${e.titre} » · opacite ${e.op}`);
}
console.log(`\n« Before the room. » lisible ${arrive} ms apres le clic sur « Be asked instead ».`);

let e = await vu();
console.log(`\nLE SEUIL · page ${e.hauteur} px (${Math.round(e.hauteur/e.ecran*10)/10} ecrans) · scrollY=${e.scrollY} · chapo display:${e.chapoAffiche} · data-entretien=${e.dataEntretien}`);
console.log(`bouton « ${e.labelStart} » : y=${e.startBoite?.y} px, ecranY=${e.startBoite?.ecranY}`);
console.log(`a l'ecran au seuil :`); e.lignes.forEach(l => console.log("  " + l));
await page.screenshot({ path: `${SORTIE}/before-seuil-${W}.png` });

// On remonte en haut, comme quelqu'un qui vient d'arriver.
await page.evaluate(() => scrollTo(0, 0)); await attends(800);
e = await vu();
console.log(`\nEN HAUT DE PAGE, bouton « ${e.labelStart} » a ecranY=${e.startBoite?.ecranY} (ecran ${e.ecran} px) → ${e.startBoite?.ecranY < e.ecran ? "visible sans defiler" : "IL FAUT DEFILER"}`);

// ── ON CLIQUE START ──────────────────────────────────────────────────────
console.log(`\n>>> CLIC SUR START`);
const tS = Date.now();
await clique(page, `() => [...document.querySelectorAll("button")].find(x => /^Start$/.test(x.textContent.trim()))`, "Start");
let q1 = null;
for (let t = 200; t <= 45000; t += 400) {
  await attends(Math.max(0, t - (Date.now() - tS)));
  const s = await vu();
  if (s.question) { q1 = Date.now() - tS; break; }
  if (t % 1600 === 0 || t <= 1000)
    console.log(`  t=${String(t).padStart(5)} ms · bouton « ${s.labelStart ?? s.labelNext ?? "-"} » · a l'ecran : ${s.lignes.slice(0,3).join(" | ").slice(0,150)}${s.alerte ? " · ALERTE: " + s.alerte : ""}`);
}
console.log(`\nPREMIERE QUESTION A L'ECRAN : ${q1 ? q1 + " ms apres le clic sur Start" : "JAMAIS dans 45 s"}`);
e = await vu();
console.log(`question 01 : « ${e.question} »`);
console.log(`  champ ${e.champ?.type}, y=${e.champ?.y}, ecranY=${e.champ?.ecranY}, desactive=${e.champ?.desactive} · focus sur « ${e.focus} »`);
console.log(`  chapo display:${e.chapoAffiche} · data-entretien=${e.dataEntretien} · scrollY=${e.scrollY} · page ${e.hauteur} px`);
console.log(`  bouton « ${e.labelNext} » a ecranY=${e.nextBoite?.ecranY} · « I would rather not say » present: ${e.refusPresent}`);
console.log(`  a l'ecran :`); e.lignes.forEach(l => console.log("    " + l));
await page.screenshot({ path: `${SORTIE}/before-q1-${W}.png` });

// ── QUATRE REPONSES ──────────────────────────────────────────────────────
for (let i = 0; i < 4; i += 1) {
  const texte = REPONSES[i];
  console.log(`\n>>> REPONSE ${i+1} : « ${texte.slice(0,70)}… »`);
  // On tape au clavier, dans le champ qui a le focus.
  const avant = await vu();
  await page.focus("#mdc-reponse");
  await page.type("#mdc-reponse", texte, { delay: 1 });
  const apresFrappe = await vu();
  console.log(`  pendant la frappe : champ a ecranY=${apresFrappe.champ?.ecranY} (etait ${avant.champ?.ecranY}), question a ecranY=${apresFrappe.questionBoite?.ecranY}, page ${apresFrappe.hauteur} px`);
  const nb = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(x => /^(Next|One moment)$/.test(x.textContent.trim()));
    const r = b.getBoundingClientRect(); return { x: r.left+r.width/2, y: r.top+r.height/2, ecranY: Math.round(r.top), dansEcran: r.top < innerHeight && r.bottom > 0 }; });
  console.log(`  bouton Next a ecranY=${nb.ecranY} · dans l'ecran: ${nb.dansEcran}`);
  const tQ = Date.now();
  await clique(page, `() => [...document.querySelectorAll("button")].find(x => /^(Next|One moment)$/.test(x.textContent.trim()))`, "Next");
  let suiv = null, qAvant = apresFrappe.question;
  for (let t = 200; t <= 45000; t += 400) {
    await attends(Math.max(0, t - (Date.now() - tQ)));
    const s = await vu();
    if (s.envoiPresent || (s.question && s.question !== qAvant)) { suiv = Date.now() - tQ; break; }
    if (t === 400 || t % 2000 === 0)
      console.log(`    attente ${String(t).padStart(5)} ms · bouton « ${s.labelNext ?? "-"} » · champ desactive=${s.champ?.desactive} · question encore « ${String(s.question).slice(0,40)}… »${s.alerte ? " · ALERTE: " + s.alerte : ""}`);
  }
  const s = await vu();
  console.log(`  la suite est arrivee en ${suiv} ms`);
  if (s.envoiPresent) { console.log(`  >>> L'ENTRETIEN DIT « assez » : l'ecran de revue est la, avec le bouton d'envoi. ON S'ARRETE ICI, on n'envoie rien.`);
    console.log(`  a l'ecran :`); s.lignes.forEach(l => console.log("    " + l));
    await page.screenshot({ path: `${SORTIE}/before-revue-${W}.png` }); break; }
  console.log(`  question ${String(i+2).padStart(2,"0")} : « ${s.question} »`);
  console.log(`  champ ${s.champ?.type} ecranY=${s.champ?.ecranY} · question ecranY=${s.questionBoite?.ecranY} · scrollY=${s.scrollY} · page ${s.hauteur} px · focus « ${s.focus} »`);
  console.log(`  a l'ecran :`); s.lignes.forEach(l => console.log("    " + l));
  await page.screenshot({ path: `${SORTIE}/before-q${i+2}-${W}.png` });
}

// ── LE CLAVIER SEUL ──────────────────────────────────────────────────────
await page.evaluate(() => scrollTo(0, 0)); await attends(500);
const tab = [];
for (let i = 0; i < 10; i += 1) { await page.keyboard.press("Tab");
  tab.push(await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect();
    return `${a.tagName.toLowerCase()}${a.id?"#"+a.id:""} « ${(a.textContent||"").trim().replace(/\s+/g," ").slice(0,32)} » ecranY=${Math.round(r.top)}`; })); }
console.log(`\nAU CLAVIER SEUL sur /begin/before, une fois l'entretien ouvert :`);
tab.forEach((l, i) => console.log(`  ${i+1}. ${l}`));
console.log(`\nRIEN N'A ETE ENVOYE : aucun clic sur « Send this to Kilian ».`);
await page.screenshot({ path: `${SORTIE}/before-fin-${W}.png` });
dehors.close(); await nav.close();
