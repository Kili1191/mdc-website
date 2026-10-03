// L'ENTRETIEN AU CLAVIER SEUL, et la geometrie a 1440x900.
// node scripts/visite-entretien-clavier.mjs [1440|390]
// On arrive avec ?from=carry pour sauter l'intro — c'est une COMMANDE du site,
// pas un contournement du harnais, et l'arrivee froide est mesuree ailleurs.
// On ne touche JAMAIS « Send this to Kilian ».
import puppeteer from "puppeteer";
const W = Number(process.argv[2] ?? 1440);
const H = W === 390 ? 844 : 900;
const BASE = "https://www.maisonducalme.com";
const SORTIE = process.env.S ?? "/tmp";
const attends = (ms) => new Promise((r) => setTimeout(r, ms));
const nav = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox", `--proxy-server=${process.env.HTTPS_PROXY}`, "--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await nav.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: W === 390 ? 3 : 1, hasTouch: W === 390 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
page.on("response", (r) => { if (r.url().includes("/api/")) console.log(`  [api] ${r.status()} ${r.url().replace(BASE,"")}`); });

const focus = () => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return { quoi: "body (aucun focus)", };
  const r = a.getBoundingClientRect(); const cs = getComputedStyle(a);
  return { quoi: `${a.tagName.toLowerCase()}${a.id?"#"+a.id:""} « ${(a.textContent||"").trim().replace(/\s+/g," ").slice(0,30)} »`,
    ecranY: Math.round(r.top), hors: r.top < 0 || r.bottom > innerHeight,
    outline: cs.outlineWidth + " " + cs.outlineStyle + " " + cs.outlineColor,
    ombre: cs.boxShadow.slice(0, 40), desactive: a.disabled ?? null };
});
const ecran = () => page.evaluate(() => {
  const q = document.querySelector("#mdc-question"); const c = document.querySelector("#mdc-reponse");
  const b = (el) => el ? { y: Math.round(el.getBoundingClientRect().top + scrollY), ecranY: Math.round(el.getBoundingClientRect().top) } : null;
  const next = [...document.querySelectorAll("button")].find(x => /^(Next|One moment)$/.test(x.textContent.trim()));
  const start = [...document.querySelectorAll("button")].find(x => /^(Start|One moment)$/.test(x.textContent.trim()));
  const live = [...document.querySelectorAll("[aria-live],[role=alert],[role=status],[aria-busy=true]")]
    .map(e => `${e.tagName.toLowerCase()}[${e.getAttribute("role")||e.getAttribute("aria-live")||"aria-busy"}] "${e.textContent.trim().slice(0,46)}"`);
  return { url: location.pathname, scrollY: Math.round(scrollY), hauteur: document.documentElement.scrollHeight, ecran: innerHeight,
    question: q ? q.textContent.trim() : null, qBoite: b(q), champ: b(c), champType: c ? c.tagName.toLowerCase() : null,
    nextLabel: next ? next.textContent.trim() : null, nextBoite: b(next), nextDesactive: next ? next.disabled : null,
    startLabel: start ? start.textContent.trim() : null, startBoite: b(start),
    live, titreVu: !!document.querySelector("h1") };
});

console.log(`\n=== /begin/before au clavier seul · ${W}x${H} ===\n`);
await page.goto(`${BASE}/begin/before?from=carry`, { waitUntil: "domcontentloaded" });
await attends(2500);
let e = await ecran();
console.log(`page ${e.hauteur} px, ecran ${e.ecran} px, soit ${Math.round(e.hauteur/e.ecran*10)/10} ecrans`);
console.log(`bouton « ${e.startLabel} » : y=${e.startBoite.y}, ecranY=${e.startBoite.ecranY} → ${e.startBoite.ecranY < e.ecran ? "visible sans defiler" : "IL FAUT DEFILER"}`);
console.log(`regions annoncees a l'arrivee : ${e.live.length ? e.live.join(" | ") : "aucune"}`);
await page.screenshot({ path: `${SORTIE}/clavier-seuil-${W}.png` });

console.log(`\nTab depuis le haut jusqu'a trouver Start :`);
for (let i = 1; i <= 8; i += 1) {
  await page.keyboard.press("Tab");
  const f = await focus();
  console.log(`  Tab ${i} → ${f.quoi} · ecranY=${f.ecranY}${f.hors ? " (HORS ECRAN)" : ""} · outline ${f.outline} · ombre ${f.ombre}`);
  if (/Start/.test(f.quoi)) break;
}
console.log(`\n>>> ENTREE sur Start`);
const t0 = Date.now();
await page.keyboard.press("Enter");
for (const t of [200, 1000, 2500, 4500]) {
  await attends(Math.max(0, t - (Date.now() - t0)));
  const f = await focus(); const s = await ecran();
  console.log(`  t=${String(t).padStart(5)} ms · focus: ${f.quoi} · bouton « ${s.startLabel ?? s.nextLabel ?? "-"} » · regions annoncees : ${s.live.length ? s.live.join(" | ") : "aucune"}`);
}
let q = null;
for (let t = 4500; t <= 45000; t += 500) {
  await attends(Math.max(0, t - (Date.now() - t0)));
  const s = await ecran(); if (s.question) { q = Date.now() - t0; break; }
}
console.log(`\nquestion a l'ecran apres ${q} ms`);
e = await ecran();
const f = await focus();
console.log(`question 01 : « ${e.question} »`);
console.log(`  question y=${e.qBoite.y} ecranY=${e.qBoite.ecranY} · champ ${e.champType} y=${e.champ.y} ecranY=${e.champ.ecranY} · Next ecranY=${e.nextBoite.ecranY} (desactive ${e.nextDesactive}) · scrollY=${e.scrollY} · page ${e.hauteur} px`);
console.log(`  tout tient-il dans l'ecran de ${e.ecran} px sans defiler ? question ${e.qBoite.ecranY<e.ecran?"oui":"non"} · champ ${e.champ.ecranY<e.ecran?"oui":"non"} · Next ${e.nextBoite.ecranY<e.ecran?"oui":"non"}`);
console.log(`  focus apres l'arrivee de la question : ${f.quoi} · outline ${f.outline}`);
console.log(`  regions annoncees : ${e.live.length ? e.live.join(" | ") : "aucune"}`);
await page.screenshot({ path: `${SORTIE}/clavier-q1-${W}.png` });

// On tape au clavier, puis on essaie Entree DANS le champ.
for (let i = 0; i < 2; i += 1) {
  const texte = "Essai technique. Technical test of the page, please ignore. Nothing medical, nothing urgent.";
  console.log(`\n>>> on tape la reponse ${i+1} au clavier, puis ENTREE dans le champ`);
  await page.keyboard.type(texte, { delay: 1 });
  let s = await ecran();
  console.log(`  Next desactive ? ${s.nextDesactive} · champ ${s.champType}`);
  const avant = s.question;
  const tE = Date.now();
  await page.keyboard.press("Enter");
  await attends(1500);
  s = await ecran();
  const partiParEntree = s.question !== avant || s.nextLabel === "One moment" || s.live.some(l=>/busy/.test(l));
  console.log(`  ENTREE dans un ${s.champType} a-t-elle envoye la reponse ? ${partiParEntree ? "OUI" : "NON (il faut atteindre Next)"}`);
  if (!partiParEntree) {
    const tabs = [];
    for (let k = 1; k <= 3; k += 1) { await page.keyboard.press("Tab"); const ff = await focus(); tabs.push(`Tab ${k} → ${ff.quoi}`);
      if (/Next/.test(ff.quoi)) break; }
    console.log(`  ${tabs.join(" · ")}`);
    await page.keyboard.press("Enter");
  }
  let v = null;
  for (let t = 300; t <= 45000; t += 400) {
    await attends(300);
    const ss = await ecran();
    if ((ss.question && ss.question !== avant) || !ss.question) { v = Date.now() - tE; break; }
  }
  s = await ecran();
  const ff = await focus();
  if (!s.question) { console.log(`  >>> plus de question : l'ecran de revue est la. ON S'ARRETE, rien n'est envoye.`);
    console.log(`  a l'ecran : ${(await page.evaluate(()=>document.querySelector("main").innerText.replace(/\n+/g," / ").slice(0,300)))}`); break; }
  console.log(`  question suivante apres ${v} ms : « ${s.question} »`);
  console.log(`  question ecranY=${s.qBoite.ecranY} · champ ${s.champType} ecranY=${s.champ.ecranY} · Next ecranY=${s.nextBoite.ecranY} · scrollY=${s.scrollY} · page ${s.hauteur} px`);
  console.log(`  focus : ${ff.quoi}`);
}
await page.screenshot({ path: `${SORTIE}/clavier-fin-${W}.png` });
console.log(`\nRIEN N'A ETE ENVOYE.`);
await nav.close();
