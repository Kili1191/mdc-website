// Mesure le contraste du texte contre LE FOND REEL DU SITE, pas contre
// #EDE4D0.
//
// POURQUOI CE FICHIER EXISTE. Toute la palette a ete calibree une fois contre
// #EDE4D0 — le fond du <body>, visible seulement avant le chargement du shader
// et dans le repli sans WebGL. Le fond reel est la photographie de marbre,
// plus sombre, et il VARIE : la revelation au curseur amene la matiere sombre
// exactement la ou le lecteur pointe.
//
// Resultat de cette erreur : un rouge de texte annonce a 4,51:1 valait 2,43:1
// sur les pages internes et 1,18:1 sur l'accueil.
//
// LA METHODE, et c'est tout le sujet. Photographier la bande du texte alors
// que le texte est visible ne mesure pas le fond : le 1er centile tombe sur
// l'encre des lettres, et on obtient des ratios absurdes (brouFonce a 1,00:1,
// c'est-a-dire l'encre contre elle-meme). Donc, en deux temps :
//
//   1. on releve les rectangles des elements de texte tels qu'ils sont rendus ;
//   2. on passe TOUTE l'encre en `color: transparent` — aucun fond n'est
//      touche — et on rephotographie exactement les memes rectangles.
//
// Le curseur est maintenu sur le mot pendant la prise, car le shader reagit a
// sa position et c'est la que la pierre s'ouvre. Ce qui reste dans l'image est
// le fond que le lecteur a derriere ses lettres, et rien d'autre.
//
// LA REGLE : aucune encre ne passe si elle n'atteint pas son seuil au 1er
// centile du scenario le plus sombre ou elle peut apparaitre. Ce n'est pas le
// ratio median qui decide.
//
// Le 1er centile varie de quelques centiemes d'une execution a l'autre : les
// zones echantillonnees dependent du rendu, et le shader n'est pas fige.
// Retenez la valeur la plus BASSE que vous ayez vue, jamais la derniere.
//
//   node scripts/contraste-matiere.mjs [url]

import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const SEUIL_TEXTE = 4.5;
const SEUIL_TRAIT = 3.0;

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const Yrgb = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const ENCRES = {
  brou: '#4A3B2A', brouFonce: '#2F2519', rouille: '#B14E2D',
  taupe: '#908067', taupeTrait: '#74654F',
};

const nav = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});

for (const route of ['/', '/sessions', '/begin']) {
  const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${BASE}${route}?from=carry`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(5500);

  const zones = await p.evaluate(() => [...document.querySelectorAll('p, h1, h2, h3, a, button')]
    .filter((e) => e.textContent.trim().length > 3)
    .map((e) => e.getBoundingClientRect())
    .filter((r) => r.width > 60 && r.height > 8 && r.top > 60 && r.bottom < innerHeight - 40)
    .slice(0, 10)
    .map((r) => ({ x: r.left + r.width / 2, y: r.top, w: Math.min(r.width, 360), h: r.height })));

  // On efface l'encre, jamais le fond : seule la couleur du texte change.
  await p.addStyleTag({ content: `*, *::before, *::after {
    color: transparent !important;
    -webkit-text-stroke-color: transparent !important;
    text-shadow: none !important;
  }` });
  await p.waitForTimeout(400);

  const ech = [];
  for (const z of zones) {
    await p.mouse.move(z.x, z.y + z.h / 2);
    await p.waitForTimeout(250);
    const png = await p.screenshot({ clip: {
      x: Math.round(z.x - z.w / 2), y: Math.round(z.y),
      width: Math.round(z.w), height: Math.round(z.h),
    } });
    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += info.channels) ech.push(Yrgb(data[i], data[i + 1], data[i + 2]));
  }

  ech.sort((a, b) => a - b);
  const p1 = ech[Math.floor(ech.length * 0.01)];
  const median = ech[Math.floor(ech.length * 0.5)];

  console.log(`\n${route}  — ${zones.length} zones · ${ech.length} pixels de fond pur`);
  console.log(`   Y au 1er centile ${p1.toFixed(3)} · median ${median.toFixed(3)}`);
  for (const [nom, h] of Object.entries(ENCRES)) {
    const y = Yrgb(...hex(h));
    const pire = ratio(y, p1), typique = ratio(y, median);
    // Le rouille et les taupes ne sont PAS des encres : ils portent des
    // traits, des bordures, un signe. On les juge donc a 3,0, pas a 4,5 —
    // les afficher "SOUS 4,5" serait signaler une faute la ou la regle est
    // justement de ne jamais les faire ecrire.
    const seuil = (nom.includes('taupe') || nom === 'rouille') ? SEUIL_TRAIT : SEUIL_TEXTE;
    // `taupe` ne passe aucun seuil et n'est pas cense en passer : c'est une
    // couleur de matiere, elle vit dans la pierre. On l'affiche pour memoire,
    // pas comme une faute — un script qui sort une ligne rouge permanente
    // finit par n'etre plus lu.
    const verdict = nom === 'taupe' ? 'matiere (jamais un trait a l ecran)'
                  : pire >= seuil   ? 'OK'
                  :                   `SOUS ${seuil}`;
    console.log(`   ${nom.padEnd(11)} ${h}  pire ${pire.toFixed(2)}:1  typique ${typique.toFixed(2)}:1   ${verdict}`);
  }
  await p.close();
}
await nav.close();
