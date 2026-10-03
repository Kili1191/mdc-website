// L'ARRIVEE CHAUDE sur /begin : on est deja dans la maison, on clique Begin.
// La navigation interne est INTERCEPTEE par PageTransition (fade 450ms puis
// router.push) : ce n'est pas un rechargement, et l'intro ne rejoue pas.
// On mesure donc depuis le CLIC, pas depuis une navigation.
// node scripts/visite-begin-chaud.mjs <390|1440> [depart]
import puppeteer from "puppeteer";
const W = Number(process.argv[2] ?? 390);
const H = W === 390 ? 844 : 900;
const DEPART = process.argv[3] ?? "/sessions";
const BASE = "https://www.maisonducalme.com";
const SORTIE = process.env.S ?? "/tmp";
const nav = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox", `--proxy-server=${process.env.HTTPS_PROXY}`, "--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await nav.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: W === 390 ? 3 : 1, hasTouch: W === 390 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
const attends = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\n=== /begin chaud · ${W}x${H} · on part de ${DEPART}, l'intro y a deja joue ===\n`);
await page.goto(BASE + DEPART, { waitUntil: "domcontentloaded" });
await attends(29000); // on laisse l'intro de la page de depart finir
console.log("intro de la page de depart finie ?", await page.evaluate(() => !document.querySelector(".mdc-intro, .mdc-stage")));
const cible = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href="/begin"]')].find((a) => {
    const r = a.getBoundingClientRect();
    return r.width > 2 && r.top >= 0 && r.top < innerHeight;
  });
  if (!a) return null;
  const r = a.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, txt: a.textContent.trim() };
});
if (!cible) { console.log("aucun lien Begin visible sans defiler sur " + DEPART); await nav.close(); process.exit(0); }
console.log(`on clique « ${cible.txt} » a (${Math.round(cible.x)}, ${Math.round(cible.y)})`);

const t0 = Date.now();
await page.mouse.click(cible.x, cible.y);
const etat = () => page.evaluate(() => {
  const h1 = document.querySelector("h1");
  if (!h1) return { quoi: "pas de h1" };
  const r = h1.getBoundingClientRect();
  const op = parseFloat(getComputedStyle(h1).opacity);
  // L'opacite effective, parents compris : PageTransition met le contenu a 0.
  let eff = 1, n = h1;
  while (n && n !== document.documentElement) { eff *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
  const d = r.width > 1 ? document.elementFromPoint(Math.min(innerWidth-2, r.left+r.width/2), Math.min(innerHeight-2, Math.max(2, r.top+r.height/2))) : null;
  return { url: location.pathname, titre: h1.textContent.trim().slice(0,20),
    opacite: Math.round(eff*100)/100,
    couvert: d && !(d===h1 || h1.contains(d) || d.contains(h1)) ? (String(d.className).slice(0,22)||d.tagName) : null };
});
let vuA = null;
for (let t = 100; t <= 4000; t += 100) {
  await attends(Math.max(0, t - (Date.now() - t0)));
  const e = await etat();
  const ok = e.url === "/begin" && e.titre.startsWith("Begin") && e.opacite > 0.05 && !e.couvert;
  if (ok && !vuA) vuA = Date.now() - t0;
  if (t % 300 === 0 || (ok && t < 1600))
    console.log(`t=${String(t).padStart(4)} · ${e.url} · h1 « ${e.titre} » · opacite cumulee ${e.opacite} · ${e.couvert ? "couvert par " + e.couvert : "non couvert"}`);
}
console.log(`\n« Begin. » REELLEMENT LISIBLE (opacite > 0,05 et non recouvert) : ${vuA} ms apres le clic`);
// Et a quel moment il est PLEINEMENT opaque ?
const plein = await page.evaluate(() => {
  let eff = 1, n = document.querySelector("h1");
  while (n && n !== document.documentElement) { eff *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
  return Math.round(eff*100)/100;
});
console.log(`opacite cumulee du titre a 4 s : ${plein}`);
console.log(`liens vers /begin/before sur la page : ${await page.evaluate(() => document.querySelectorAll('a[href*="/begin/before"]').length)}`);
await page.screenshot({ path: `${SORTIE}/begin-chaud-${W}.png` });
await nav.close();
