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
// L'INTERCEPTION PASSE PAR CDP, PAS PAR `setRequestInterception`.
//
// `page.setRequestInterception(true)` met TOUTES les requetes en attente, y
// compris les chunks JavaScript de Next. Il suffit qu'un chunk parte en
// `ERR_ABORTED` pour que l'hydratation echoue : la page s'affiche, plus rien ne
// repond au clic, et le script echoue sur « bouton introuvable : Start » —
// c'est-a-dire qu'il accuse la page d'un defaut que lui-meme vient de causer.
//
// `Fetch.enable` avec un motif d'URL ne met en attente que l'API. Tout le reste
// du chargement est intact.
const cdp = await page.createCDPSession();
await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*api/entretien*" }] });

let poses = 0;
let envois = 0;

const rendre = (requestId, objet) =>
  cdp.send("Fetch.fulfillRequest", {
    requestId,
    responseCode: 200,
    responseHeaders: [{ name: "content-type", value: "application/json" }],
    body: Buffer.from(JSON.stringify(objet)).toString("base64"),
  });

cdp.on("Fetch.requestPaused", async (e) => {
  const u = e.request.url;
  if (u.includes("/api/entretien/dossier")) {
    envois += 1;
    await rendre(e.requestId, { ok: true });
    return;
  }
  const tours = JSON.parse(e.request.postData || "{}").tours ?? [];
  if (SCENARIO === "crise" && tours.length === 2) {
    await rendre(e.requestId, { etat: "arret", question: "", note: "", champ: "paragraphe", couvert: [], fragilite: 5 });
    return;
  }
  if (tours.length >= QUESTIONS.length) {
    await rendre(e.requestId, { etat: "assez", question: "", note: "", champ: "paragraphe", couvert: [], fragilite: 2 });
    return;
  }
  const t = QUESTIONS[tours.length];
  poses += 1;
  await rendre(e.requestId, { etat: "question", question: t.q, note: t.note, champ: t.champ, couvert: [], fragilite: 2 });
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
  // ON N'ASSERTE PAS SUR LA COPY. Cette ligne cherchait « That is everything he
  // needs » et a rendu MANQUE le jour ou l'agent copywriter a ecrit « That is
  // enough to go on » — un faux echec sur une page parfaitement saine, ce qui
  // est exactement la facon dont un harnais perd sa credibilite. On asserte sur
  // ce qui ne bouge pas : l'ecran de revue est celui qui porte le bouton
  // d'envoi et plus aucun champ de reponse.
  const revue = await page.evaluate(() => ({
    envoi: [...document.querySelectorAll("button")].some((b) => /Kilian/.test(b.textContent)),
    champ: !!document.querySelector("#mdc-reponse"),
  }));
  console.log("revue :", revue.envoi && !revue.champ ? "ok" : `MANQUE ${JSON.stringify(revue)}`);
  await clic("Send this to Kilian");
  await attendre(900);
  // Les deux boutons qui restent a l'ecran ne sont pas a l'entretien : ce sont
  // le son et la nav, montes dans layout.tsx. On ne compte donc pas les
  // boutons de la PAGE, on verifie qu'aucune commande de l'entretien ne
  // subsiste — plus de champ, plus de Next, plus d'envoi.
  const fin = await page.evaluate(() => ({
    champ: !!document.querySelector("#mdc-reponse"),
    commandes: [...document.querySelectorAll("button")]
      .map((b) => b.textContent.trim())
      .filter((t) => t === "Next" || /Kilian/.test(t) || t === "Start"),
  }));
  console.log("fin :", !fin.champ && !fin.commandes.length ? "ok" : `MANQUE ${JSON.stringify(fin)}`);
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
