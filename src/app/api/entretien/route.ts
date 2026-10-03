// La route qui pose la question suivante.
//
// Elle est SANS ETAT, et c'est une decision de confidentialite avant d'etre une
// decision d'architecture : ce qui se dit ici est de la donnee de sante. Il n'y
// a donc ni base, ni session, ni fichier. La conversation vit dans le
// navigateur du visiteur ; le serveur la recoit, demande une question, la rend,
// et n'en garde rien.
//
// Rien de ce que contient un echange n'est journalise. Les logs disent pourquoi
// un appel a echoue, jamais ce qu'il transportait. Meme regle que /api/begin.
//
// TANT QUE `ANTHROPIC_API_KEY` N'EST PAS DEFINIE, la route repond 503 et la
// page renvoie vers le formulaire ecrit de /begin. Un entretien qui fait
// semblant de fonctionner serait pire que pas d'entretien du tout.

import Anthropic from "@anthropic-ai/sdk";
import {
  MODELE, SYSTEME, SCHEMA_TOUR, TOURS_MAX, borne, transcription, type Tour,
} from "@/lib/entretien";
import { adresse, lisTours, tropDAppels } from "@/lib/entretienServeur";

export const runtime = "nodejs";
export const maxDuration = 60;

// LES TROIS QUESTIONS QUE LA MAISON NE PEUT PAS NE PAS POSER, ecrites a la
// main, relues, et gardees ici en secours.
//
// Le modele a pour consigne de ne jamais conclure sans elles. Une consigne
// n'est pas une garantie : si elle rend `assez` alors qu'une des trois manque,
// le serveur pose la question lui-meme plutot que de la laisser tomber.
// `corps` et `toucher` sont la securite et le consentement — Kilian pose les
// mains, et il doit savoir ou il ne les pose pas.
const SECOURS_OBLIGATOIRES: { cle: string; question: string; champ: "ligne" | "paragraphe" }[] = [
  {
    cle: "identite",
    question: "Before this goes to Kilian: what is your name, and how should he reach you?",
    champ: "ligne",
  },
  {
    cle: "corps",
    question: "Is there anything about your body he should know before you arrive? A pregnancy, a recent operation, an injury, pain anywhere.",
    champ: "paragraphe",
  },
  {
    cle: "toucher",
    question: "Hands rest on the body, or just above it, and are held. Is that welcome, and is there anywhere he should not touch?",
    champ: "paragraphe",
  },
];

// Le plafond d'appels par adresse et par heure. Un entretien complet en
// consomme au plus TOURS_MAX ; quatre-vingts laisse la place a plusieurs
// visiteurs derriere le meme reseau sans laisser tourner une boucle.
const APPELS_MAX = 80;

const client = new Anthropic({ timeout: 40_000, maxRetries: 2 });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[entretien] ANTHROPIC_API_KEY n'est pas definie. Aucune question n'a pu etre posee.");
    return Response.json({ erreur: "assistant_absent" }, { status: 503 });
  }

  if (tropDAppels(adresse(request), APPELS_MAX)) {
    return Response.json({ erreur: "trop_dappels" }, { status: 429 });
  }

  let corps: { tours?: unknown };
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: "corps_illisible" }, { status: 400 });
  }

  const tours = lisTours(corps.tours);

  // La butee dure. Passe ce nombre, on ne demande plus rien a personne.
  if (tours.length >= TOURS_MAX) {
    return Response.json({
      etat: "assez", question: "", note: "", champ: "paragraphe",
      couvert: [], fragilite: 3,
    } satisfies Tour);
  }

  const demande = tours.length
    ? `Here is the conversation so far.\n\n${transcription(tours)}\n\nDecide what to do next.`
    : "Nobody has said anything yet. This is the first question of the intake. Start with what they carry, in their own words, not with their name: a form that opens by asking who you are reads like a form.";

  let tour: Tour;
  try {
    const reponse = await client.messages.create({
      model: MODELE,
      // LE PLAFOND COMPTE LA REFLEXION, ET 2000 NE SUFFISAIT PAS.
      //
      // `thinking: adaptive` fait reflechir le modele avant de repondre, et ces
      // jetons-la comptent dans `max_tokens`. A 2000, la reflexion pouvait
      // remplir le plafond a elle seule : la reponse revenait avec
      // `stop_reason: "max_tokens"` et AUCUN bloc de texte, le `find` plus bas
      // rendait undefined, et la page affichait « assistant muet » sans qu'on
      // puisse savoir pourquoi depuis la production.
      //
      // 16000 est le plancher recommande pour une requete non diffusee. Ce
      // n'est PAS une depense : `max_tokens` est un plafond, pas une
      // reservation. Une question d'entretien fait trente mots, et ce qu'on
      // paie ne change pas d'un jeton.
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      // LE CACHE PORTE AUSSI LA TRANSCRIPTION, et c'est la le gain. La consigne
      // etait deja mise en cache par le bloc `system` ci-dessous ; les tours ne
      // l'etaient pas, et ils sont renvoyes EN ENTIER a chaque question. A la
      // douzieme question, la premiere reponse avait ete payee douze fois plein
      // tarif. Le `cache_control` de plus haut niveau met en cache le dernier
      // bloc cachable, transcription comprise : chaque tour relit ce que le
      // precedent a ecrit au lieu de le repayer.
      //
      // Ca ne tient que si les requetes s'enchainent a moins de cinq minutes —
      // c'est la duree d'une entree ephemere, et une lecture remet le compteur
      // a zero. Quelqu'un qui reflechit six minutes entre deux questions
      // reecrit le cache. C'est acceptable : il paie alors ce qu'on payait
      // partout avant.
      cache_control: { type: "ephemeral" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA_TOUR } },
      system: [{ type: "text", text: SYSTEME, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: demande }],
    });

    const texte = reponse.content.find((b) => b.type === "text");
    // Dire POURQUOI il n'y a pas de texte. Sans `stop_reason`, un plafond
    // atteint et une cle refusee laissaient la meme trace dans les journaux.
    if (!texte || texte.type !== "text") {
      throw new Error(`aucun bloc de texte (stop_reason ${reponse.stop_reason})`);
    }
    tour = JSON.parse(texte.text) as Tour;
  } catch (e) {
    // Le message d'erreur du SDK ne contient pas le corps de la requete, donc
    // il ne peut pas contenir ce que la personne a ecrit. On le garde : sans lui
    // on ne sait pas distinguer une cle refusee d'une limite atteinte.
    const quoi =
      e instanceof Anthropic.AuthenticationError ? "cle_refusee"
      : e instanceof Anthropic.RateLimitError ? "limite_fournisseur"
      : e instanceof Anthropic.APIError ? `api_${e.status}`
      : "illisible";
    const detail = e instanceof Error ? e.message : "";
    console.error(`[entretien] La question suivante n'a pas pu etre obtenue (${quoi}). ${detail}`);
    return Response.json({ erreur: "assistant_muet" }, { status: 502 });
  }

  const couvert = Array.isArray(tour.couvert) ? tour.couvert.filter((c) => typeof c === "string") : [];

  // Le filet des trois obligatoires.
  if (tour.etat === "assez") {
    const manque = SECOURS_OBLIGATOIRES.find(
      (s) => !couvert.includes(s.cle) && !tours.some((t) => t.question === s.question)
    );
    if (manque) {
      return Response.json({
        etat: "question", question: manque.question, note: "",
        champ: manque.champ, couvert, fragilite: borne(tour.fragilite),
      } satisfies Tour);
    }
  }

  // Le garde-boucle. Un modele qui repose la question qu'il vient de poser a
  // perdu le fil, et la personne en face n'a aucune raison de le supporter deux
  // fois : on clot.
  if (tour.etat === "question" && tours.some((t) => t.question === tour.question)) {
    return Response.json({
      etat: "assez", question: "", note: "", champ: "paragraphe",
      couvert, fragilite: borne(tour.fragilite),
    } satisfies Tour);
  }

  return Response.json({
    etat: tour.etat === "arret" || tour.etat === "assez" ? tour.etat : "question",
    question: typeof tour.question === "string" ? tour.question : "",
    note: typeof tour.note === "string" ? tour.note : "",
    champ: tour.champ === "ligne" ? "ligne" : "paragraphe",
    couvert,
    fragilite: borne(tour.fragilite),
  } satisfies Tour);
}
