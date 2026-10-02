// Un faux point d'entree Messages, et une fausse destination de formulaire.
//
// POURQUOI. Les deux routes de l'entretien ne peuvent pas etre exercees sans
// clé de modele, et une clé coute de l'argent a chaque essai. Ce stub tient les
// deux bouts : il rend une reponse Messages valide, et il recoit la fiche a la
// place de Kilian. Ce qu'on verifie avec lui n'est pas le modele, c'est le
// CODE AUTOUR — le filet des trois questions obligatoires, le garde-boucle, ce
// qui est reellement poste a la destination, et le repli quand la fiche ne peut
// pas etre remplie.
//
//   S=/tmp/essai node scripts/entretien-faux-modele.mjs &
//   ANTHROPIC_API_KEY=faux ANTHROPIC_BASE_URL=http://localhost:4411 \
//     MDC_ENTRETIEN_FORWARD_URL=http://localhost:4411/collecte npx next start -p 3314
//
// Le comportement se choisit en ecrivant un mot dans $S/mode.txt :
// question · assez-sans-corps · assez-complet · repetition · arret.
// Ce qui est poste a la destination atterrit dans $S/recu.json.
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";

const S = process.env.S;
const lisMode = () => { try { return readFileSync(`${S}/mode.txt`, "utf8").trim(); } catch { return "question"; } };

const message = (objet) => ({
  id: "msg_faux", type: "message", role: "assistant", model: "claude-opus-5",
  content: [{ type: "text", text: JSON.stringify(objet) }],
  stop_reason: "end_turn", stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 10 },
});

createServer((req, res) => {
  let brut = "";
  req.on("data", (c) => (brut += c));
  req.on("end", () => {
    if (req.url.startsWith("/collecte")) {
      writeFileSync(`${S}/recu.json`, brut);
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"ok":true}');
      return;
    }
    const corps = JSON.parse(brut || "{}");
    const systeme = JSON.stringify(corps.system ?? "");
    let sortie;
    if (systeme.includes("filling in an intake sheet")) {
      sortie = {
        nom: "Amara", contact: "amara@example.com",
        porte: "Cannot switch off, not sleeping since March.",
        depuis: "Seven months.", soin: "GP, tablets, stopped.", medication: "",
        corps: "Shoulder surgery in January.", toucher: "Yes, not the right shoulder.",
        etat: "", avant: "", piece: "", pratique: "", reste: "",
        accueil: "Tired, practical, does not need it explained.",
        drapeaux: ["Right shoulder: recent surgery, not to be touched."],
        verifier: ["Whether the shoulder is still under review."],
        non_dit: ["Sleep and energy: never asked."],
        fragilite: 2,
      };
    } else {
      const mode = lisMode();
      if (mode === "assez-sans-corps") {
        sortie = { etat: "assez", question: "", note: "", champ: "paragraphe", couvert: ["identite", "porte"], fragilite: 2 };
      } else if (mode === "assez-complet") {
        sortie = { etat: "assez", question: "", note: "", champ: "paragraphe", couvert: ["identite", "porte", "corps", "toucher"], fragilite: 2 };
      } else if (mode === "repetition") {
        sortie = { etat: "question", question: "How long has it been like that?", note: "", champ: "ligne", couvert: ["porte"], fragilite: 2 };
      } else if (mode === "arret") {
        sortie = { etat: "arret", question: "", note: "", champ: "paragraphe", couvert: ["porte"], fragilite: 5 };
      } else {
        sortie = { etat: "question", question: "What has brought you here?", note: "", champ: "paragraphe", couvert: [], fragilite: 3 };
      }
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(message(sortie)));
  });
}).listen(4411, () => console.log("stub 4411"));
