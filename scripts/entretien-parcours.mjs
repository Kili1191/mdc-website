// Traverse /begin/before de bout en bout, l'API simulee.
//
// POURQUOI CE FICHIER EXISTE. L'entretien a six etats — le seuil, la question,
// la revue, l'envoi, la panne, l'arret de crise — et cinq d'entre eux sont
// invisibles sans clé de modele. Une session sans clé ne peut donc ni les
// regarder, ni mesurer la page, ni verifier qu'un changement de style ne les a
// pas casses. Elle finit par livrer a l'aveugle.
//
// Ici, les deux routes sont INTERCEPTEES DANS LE NAVIGATEUR. Aucun appel au
// modele, aucun centime depense, et le composant teste est le vrai : c'est sa
// machine a etats, sa mise en page et son comportement au doigt qu'on regarde.
//
// Playwright n'est PAS installe dans ce depot. Puppeteer l'est, et le Chromium
// du conteneur vit dans /opt/pw-browsers.
//
//   npm run build && npx next start -p 3313
//   node scripts/entretien-parcours.mjs http://localhost:3313 [normal|crise]
//
// Les captures sortent dans le dossier donne par $S, sinon dans /tmp.
import puppeteer from "puppeteer";

const BASE = process.argv[2] ?? "http://localhost:3000";
const SCENARIO = process.argv[3] ?? "normal";
const SORTIE = process.env.S ?? "/tmp";

// Les questions que le faux assistant pose. Elles ne pretendent pas etre
// celles que le modele choisirait : elles couvrent les deux longueurs qui
// changent la mise en page (une ligne, et une question de vingt-cinq mots qui
// descend d'une marche typographique) et les deux types de champ.
const QUESTIONS = [
  { q: "What has brought you here? Say it however it comes.", champ: "paragraphe", note: "" },
  { q: "How long has it been like that?", champ: "ligne", note: "" },
  { q: "Is anyone looking after it at the moment?", champ: "ligne", note: "" },
  { q: "Is there anything about your body he should know before you arrive? A pregnancy, a recent operation, an injury, pain anywhere.", champ: "paragraphe", note: "Seven months is a long time to carry that." },
  { q: "Hands rest on the body, or just above it, and are held. Is that welcome, and is there anywhere he should not touch?", champ: "paragraphe", note: "" },
  { q: "What is your name, and how should he reach you?", champ: "ligne", note: "" },
];

const REPONSES = [
  "I cannot switch off. I have not slept properly since March and I am short with everyone.",
  "About seven months",
  "My GP gave me tablets, I stopped them",
  "Shoulder surgery in January, still sore on the right side.",
  "That is fine, but not the right shoulder please.",
  "Amara, amara@example.com",
];

const navigateur = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
const page = await navigateur.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.setRequestInterception(true);

let poses = 0;
let envois = 0;
page.on("request", (req) => {
  const u = req.url();
  if (u.includes("/api/entretien/dossier")) {
    envois += 1;
    req.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    return;
  }
  if (u.includes("/api/entretien")) {
    const tours = JSON.parse(req.postData() || "{}").tours ?? [];
    const rendre = (o) => req.respond({ status: 200, contentType: "application/json", body: JSON.stringify(o) });
    if (SCENARIO === "crise" && tours.length === 2) {
      rendre({ etat: "arret", question: "", note: "", champ: "paragraphe", couvert: [], fragilite: 5 });
      return;
    }
    if (tours.length >= QUESTIONS.length) {
      rendre({ etat: "assez", question: "", note: "", champ: "paragraphe", couvert: [], fragilite: 2 });
      return;
    }
    const t = QUESTIONS[tours.length];
    poses += 1;
    rendre({ etat: "question", question: t.q, note: t.note, champ: t.champ, couvert: [], fragilite: 2 });
    return;
  }
  req.continue();
});

// `?from=carry` saute l'intro — voir shouldBypassIntro dans src/lib/introReady.ts.
await page.goto(`${BASE}/begin/before?from=carry`, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1200));

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const clic = async (texte) => {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll("button, a.mdc-button")].find((x) => x.textContent.trim() === t);
    if (!b) return false;
    b.click();
    return true;
  }, texte);
  if (!ok) throw new Error(`bouton introuvable : ${texte}`);
  await attendre(900);
};

await clic("Start");

for (let i = 0; i < REPONSES.length; i += 1) {
  const question = await page.$eval("#mdc-question", (n) => n.textContent.trim()).catch(() => null);
  if (!question) break;
  if (SCENARIO === "crise" && i === 2) {
    await page.type("#mdc-reponse", "Honestly I do not want to be here at all any more.");
    await clic("Next");
    break;
  }
  await page.type("#mdc-reponse", REPONSES[i]);
  console.log(`Q${i + 1} ${question.slice(0, 64)}`);
  await clic("Next");
}

if (SCENARIO === "crise") {
  await attendre(900);
  const t = await page.evaluate(() => document.body.innerText);
  console.log("crise :", /116 123/.test(t) ? "ressources affichees" : "MANQUE LES RESSOURCES");
  console.log("envoi automatique :", envois);
  await page.screenshot({ path: `${SORTIE}/crise.png` });
} else {
  await attendre(800);
  await page.screenshot({ path: `${SORTIE}/revue.png`, fullPage: true });
  const revue = await page.evaluate(() => document.body.innerText);
  console.log("revue :", /That is everything he needs/.test(revue) ? "ok" : "MANQUE");
  await clic("Send this to Kilian");
  await attendre(900);
  const fin = await page.evaluate(() => document.body.innerText);
  console.log("fin :", /It has arrived/.test(fin) ? "ok" : "MANQUE");
  console.log("questions posees :", poses, "· envois :", envois);

  // Le telephone. `hasTouch` sans `isMobile` : `isMobile` change l'echelle de
  // rendu et rend les mesures de cibles fausses, ce qui a deja coute une passe.
  await page.goto(`${BASE}/begin/before?from=carry`, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true });
  await attendre(1000);
  await clic("Start");
  await page.type("#mdc-reponse", REPONSES[0]);
  await clic("Next");
  await page.type("#mdc-reponse", REPONSES[1]);
  await clic("Next");
  const releve = await page.evaluate(() => ({
    largeurDoc: document.documentElement.scrollWidth,
    largeurVue: window.innerWidth,
    cibles: [...document.querySelectorAll("button, a.mdc-button")].map((b) => {
      const r = b.getBoundingClientRect();
      return { quoi: b.textContent.trim().slice(0, 24), h: Math.round(r.height) };
    }),
  }));
  console.log("telephone :", JSON.stringify(releve));
  await page.screenshot({ path: `${SORTIE}/telephone.png`, fullPage: true });
}

await navigateur.close();
