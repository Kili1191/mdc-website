// LA FICHE, EN PDF, POUR QU'ELLE S'IMPRIME.
//
// POURQUOI. Le corps du mail reste le texte mis en page : c'est lui qui est
// cherchable dans la boite, et c'est lui qui survit si une piece jointe ne
// s'ouvre pas. Le PDF est en plus, et il sert a UNE chose que le texte ne fait
// pas : se tenir dans la main. Kilian le lit avant d'ouvrir la porte, pas sur
// un telephone pendant que quelqu'un attend sur le palier.
//
// CE QUI DOIT ETRE IMPOSSIBLE A MANQUER, dans cet ordre : l'arret de crise, et
// les drapeaux de « ou ne pas poser les mains ». Tout le reste peut se lire en
// diagonale. Ces deux-la decident ce qu'il fait de ses mains, et c'est la seule
// raison pour laquelle cette page existe.
//
// LES POLICES. Prata pour les titres — elle est au depot, sous licence libre,
// et c'est la voix de la maison. Le corps du texte est en Times integre a PDF,
// qui ne s'embarque pas et ne pose aucune question de licence. Higuen n'entre
// PAS ici : c'est une police sous licence commerciale, et l'embarquer dans un
// fichier qui circule n'est pas la meme chose que la servir sur une page.
//
// L'ENCRE SUIT LA REGLE DU DEPOT. Le rouille #B14E2D mesure 3,11 de contraste :
// il fait des traits et des marques, jamais du texte. Le brou porte les mots.
//
// CE QUI N'EST PAS ICI : aucun en-tete, aucun logo, aucun pied de page avec une
// adresse. C'est un document de travail qui contient des donnees de sante. Il
// ne doit pas ressembler a quelque chose qu'on fait circuler.

import PDFDocument from "pdfkit";
import path from "node:path";
import { CHAMPS_DOSSIER, borne, type Dossier, type Echange } from "@/lib/entretien";

const PRATA = path.join(process.cwd(), "public/fonts/Prata-Regular.ttf");

const BROU = "#4A3B2A";
const BROU_FONCE = "#2F2519";
const TRAIT = "#74654F";
const ROUILLE = "#B14E2D";

const MARGE = 56;
// A4 et pas Letter : Kilian imprime au Royaume-Uni.
const A4: [number, number] = [595.28, 841.89];

function lire(d: Dossier, cle: string): string {
  const v = d[cle];
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function liste(d: Dossier, cle: string): string[] {
  const v = d[cle];
  return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).map(String) : [];
}

export function fichePdf(d: Dossier, tours: Echange[], urgence: boolean): Promise<Buffer> {
  const doc = new PDFDocument({
    size: A4,
    // `bufferPages` est OBLIGATOIRE pour le pied de page : sans lui,
    // `switchToPage` jette, parce que les pages deja ecrites sont parties.
    bufferPages: true,
    margins: { top: MARGE, bottom: MARGE, left: MARGE, right: MARGE },
    info: {
      Title: "Before the room",
      // Pas d'auteur, pas de createur : un PDF porte ses metadonnees partout ou
      // il va, et celui-ci n'a besoin de nommer personne.
    },
  });

  const morceaux: Buffer[] = [];
  const fini = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c: Buffer) => morceaux.push(c));
    doc.on("end", () => resolve(Buffer.concat(morceaux)));
    doc.on("error", reject);
  });

  doc.registerFont("titre", PRATA);
  const L = doc.page.width - MARGE * 2;

  // Une petite capitale espacee, pour les intitules. Le meme geste que les
  // `eyebrow` du site.
  const intitule = (texte: string) => {
    doc.font("Helvetica").fontSize(7.5).fillColor(TRAIT)
      .text(texte.toUpperCase(), { characterSpacing: 1.6 });
    doc.moveDown(0.35);
  };

  const corps = (texte: string, taille = 10.5) => {
    doc.font("Times-Roman").fontSize(taille).fillColor(BROU)
      .text(texte, { width: L, lineGap: 2.5 });
  };

  const filet = () => {
    doc.moveDown(0.9);
    doc.strokeColor(TRAIT).lineWidth(0.4)
      .moveTo(MARGE, doc.y).lineTo(doc.page.width - MARGE, doc.y).stroke();
    doc.moveDown(0.9);
  };

  // ── EN-TETE ────────────────────────────────────────────────────────────
  const nom = lire(d, "nom") || "Someone who did not give a name";
  intitule("Before the room");
  doc.font("titre").fontSize(26).fillColor(BROU_FONCE).text(nom, { width: L });
  doc.moveDown(0.45);
  doc.font("Times-Italic").fontSize(9.5).fillColor(TRAIT).text(
    `Filled in from ${tours.length} question${tours.length === 1 ? "" : "s"} on ${new Date().toISOString().slice(0, 10)}.`,
    { width: L }
  );

  // ── L'ARRET DE CRISE ───────────────────────────────────────────────────
  // En premier, et dans un encadre. Si cette page arrive, c'est la seule chose
  // qui compte avant tout le reste.
  if (urgence) {
    doc.moveDown(1.4);
    const haut = doc.y;
    doc.font("titre").fontSize(12).fillColor(BROU_FONCE)
      .text("Read this first", MARGE + 16, doc.y + 12, { width: L - 28 });
    doc.moveDown(0.5);
    doc.font("Times-Roman").fontSize(10).fillColor(BROU).text(
      "The intake was stopped early. What this person wrote was taken as someone in crisis or in danger, and they were shown the Samaritans, NHS 111 and 999 before anything else. They were told this reached you, and that you may not see it tonight.",
      MARGE + 16, doc.y, { width: L - 28, lineGap: 2.5 }
    );
    const bas = doc.y + 12;
    // Une barre de rouille a gauche, pas un cadre rouge : la marque fait le
    // trait, elle ne crie pas.
    doc.strokeColor(ROUILLE).lineWidth(2.5)
      .moveTo(MARGE + 1, haut).lineTo(MARGE + 1, bas).stroke();
    doc.x = MARGE;
    doc.y = bas;
  }

  // ── LES DRAPEAUX ───────────────────────────────────────────────────────
  const drapeaux = liste(d, "drapeaux");
  if (drapeaux.length) {
    filet();
    intitule("Before you touch anyone");
    drapeaux.forEach((x) => {
      const haut = doc.y;
      doc.font("Times-Roman").fontSize(11.5).fillColor(BROU_FONCE)
        .text(x, MARGE + 14, doc.y, { width: L - 14, lineGap: 2.5 });
      doc.strokeColor(ROUILLE).lineWidth(1.6)
        .moveTo(MARGE + 1, haut + 2).lineTo(MARGE + 1, doc.y - 2).stroke();
      doc.x = MARGE;
      doc.moveDown(0.45);
    });
  }

  // ── A LA PORTE ─────────────────────────────────────────────────────────
  const accueil = lire(d, "accueil");
  const f = typeof d.fragilite === "number" ? borne(d.fragilite) : undefined;
  if (accueil || typeof f === "number") {
    filet();
    intitule("At the door");
    if (accueil) corps(accueil, 11.5);
    if (typeof f === "number") {
      doc.moveDown(0.5);
      doc.font("Times-Italic").fontSize(9.5).fillColor(TRAIT)
        .text(`How they arrive, 1 matter of fact to 5 raw:  ${f} of 5`, { width: L });
    }
  }

  // ── LES CHAMPS ─────────────────────────────────────────────────────────
  // `nom` et `contact` sont deja en tete et dans le « repondre a » du mail ;
  // les reprendre ici ferait lire deux fois la meme ligne. Le contact reste,
  // parce qu'on imprime cette page et qu'un papier sans moyen de rappeler
  // quelqu'un ne sert a rien.
  filet();
  for (const champ of CHAMPS_DOSSIER) {
    if (champ.cle === "nom") continue;
    const valeur = lire(d, champ.cle);
    intitule(champ.titre);
    if (valeur) {
      corps(valeur);
    } else {
      doc.font("Times-Italic").fontSize(10).fillColor(TRAIT)
        .text("not asked", { width: L });
    }
    doc.moveDown(0.9);
  }

  const verifier = liste(d, "verifier");
  const nonDit = liste(d, "non_dit");
  if (verifier.length || nonDit.length) {
    filet();
    if (verifier.length) {
      intitule("Worth checking");
      verifier.forEach((x) => corps(`— ${x}`));
      doc.moveDown(0.8);
    }
    if (nonDit.length) {
      intitule("Never asked");
      nonDit.forEach((x) => corps(`— ${x}`));
    }
  }

  // ── LA TRANSCRIPTION ───────────────────────────────────────────────────
  // Mot pour mot, sur sa propre page. La fiche est une lecture ; ceci est la
  // source, et c'est elle qui fait foi si la fiche et le souvenir divergent.
  if (tours.length) {
    doc.addPage();
    intitule("Word for word");
    doc.font("titre").fontSize(16).fillColor(BROU_FONCE)
      .text("What was asked, and what was said", { width: L });
    doc.moveDown(1.2);

    tours.forEach((t, i) => {
      doc.font("Helvetica").fontSize(7.5).fillColor(TRAIT)
        .text(String(i + 1).padStart(2, "0"), { characterSpacing: 1.2 });
      doc.moveDown(0.3);
      doc.font("Times-Italic").fontSize(10.5).fillColor(TRAIT)
        .text(t.question, { width: L, lineGap: 2 });
      doc.moveDown(0.35);
      doc.font("Times-Roman").fontSize(11).fillColor(BROU)
        .text(t.reponse || "Not answered.", { width: L, lineGap: 2.5 });
      doc.moveDown(1.1);
    });
  }

  // ── LE PIED ────────────────────────────────────────────────────────────
  // Une ligne par page, et elle dit la seule chose qui compte sur un papier
  // qui porte ca : il n'en existe pas de copie ailleurs.
  //
  // LE PIEGE, ET IL COUTE DEUX PAGES BLANCHES. Ecrire sous la marge basse fait
  // croire a pdfkit qu'on deborde, et il ajoute une page — ou le pied s'ecrit a
  // son tour, qui en ajoute une autre. Le premier essai rendait quatre pages
  // pour deux pages de contenu. On annule la marge basse le temps d'ecrire, et
  // on la remet.
  const pages = doc.bufferedPageRange();
  for (let i = pages.start; i < pages.start + pages.count; i++) {
    doc.switchToPage(i);
    const garde = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font("Helvetica").fontSize(7).fillColor(TRAIT).text(
      "Read by Kilian alone. Nothing was kept on the site.",
      MARGE, doc.page.height - 34,
      { width: L, align: "left", lineBreak: false }
    );
    doc.page.margins.bottom = garde;
  }

  doc.end();
  return fini;
}
