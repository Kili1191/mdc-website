// Le piege qui m'a casse deux builds dans la meme journee.
//
// Ce depot ecrit du CSS et du GLSL dans des litteraux de gabarit :
//
//     <style>{`  ... `}</style>
//     fragmentShader: ` ... `
//
// Tout est commente en francais, abondamment, et c'est une bonne chose. Mais un
// commentaire qui cite du code entre backticks — « voir `mix(veil, motifCol, r)` »
// — FERME LE LITTERAL. Le reste du fichier devient du JavaScript invalide, et
// l'erreur qu'on recoit pointe une ligne de prose, pas la cause.
//
// C'est arrive dans Descente.tsx le matin, puis dans MarbleBackground.tsx
// l'apres-midi. Deux fois le meme jour, par la meme main. Se promettre d'y
// faire attention n'a manifestement pas suffi.
//
//     node scripts/verifie-litteraux.mjs
//
// Sort 1 s'il trouve un backtick a l'interieur d'un litteral, avec le fichier
// et la ligne. Se branche avant le build, ou se lance seul.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RACINE = "src";
const EXT = /\.(tsx|ts)$/;

function fichiers(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? fichiers(p) : EXT.test(n) ? [p] : [];
  });
}

// On parcourt caractere par caractere en suivant l'etat : dans un litteral ou
// non, dans une interpolation ${...} ou non. Une regex ne suffit pas — les
// litteraux s'imbriquent via l'interpolation, et c'est justement la que le
// raisonnement a la main se trompe.
function fautes(src) {
  const out = [];
  let i = 0, ligne = 1;
  let dansLitteral = false;
  let profondeurInterp = 0;
  let debutLigne = 0;

  while (i < src.length) {
    const c = src[i];
    if (c === "\n") { ligne++; debutLigne = ligne; }

    if (!dansLitteral) {
      // On saute les chaines ordinaires et les commentaires, ou un backtick
      // est parfaitement legal.
      if (c === '"' || c === "'") {
        const q = c; i++;
        while (i < src.length && src[i] !== q) { if (src[i] === "\\") i++; if (src[i] === "\n") ligne++; i++; }
        i++; continue;
      }
      if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") {
        i += 2;
        while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") ligne++; i++; }
        i += 2; continue;
      }
      if (c === "`") { dansLitteral = true; i++; continue; }
      i++; continue;
    }

    // Dans un litteral.
    if (c === "\\") { i += 2; continue; }
    if (c === "$" && src[i + 1] === "{") { profondeurInterp++; i += 2; continue; }
    if (profondeurInterp > 0) {
      if (c === "}") profondeurInterp--;
      i++; continue;
    }
    if (c === "`") { dansLitteral = false; i++; continue; }

    // Un commentaire DANS le litteral : c'est la qu'on cherche.
    const estCommentaire =
      (c === "/" && src[i + 1] === "/") || (c === "/" && src[i + 1] === "*");
    if (estCommentaire) {
      const fin = src[i + 1] === "/" ? src.indexOf("\n", i) : src.indexOf("*/", i);
      const bloc = src.slice(i, fin === -1 ? src.length : fin);
      if (bloc.includes("`")) {
        out.push({ ligne, extrait: bloc.split("\n")[0].trim().slice(0, 74) });
      }
      for (const ch of bloc) if (ch === "\n") ligne++;
      i += bloc.length; continue;
    }
    i++;
  }
  return out;
}

let total = 0;
for (const f of fichiers(RACINE)) {
  const src = readFileSync(f, "utf8");
  if (!src.includes("`")) continue;
  for (const { ligne, extrait } of fautes(src)) {
    console.error(`${f}:${ligne}  backtick dans un commentaire a l'interieur d'un litteral`);
    console.error(`   ${extrait}`);
    total++;
  }
}

if (total) {
  console.error(`\n${total} occurrence(s). Elles cassent le build en fermant le litteral.`);
  console.error("Retire les backticks : dans un commentaire de CSS ou de GLSL, ils ne servent a rien.");
  process.exit(1);
}
console.log("Litteraux : aucun backtick egare.");
