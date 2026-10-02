// La route qui remplit le formulaire et l'envoie.
//
// Elle fait exactement deux choses, dans cet ordre : elle demande au modele de
// remplir une fiche a partir de ce qui a ETE DIT et de rien d'autre, puis elle
// poste le tout a la destination de Kilian. Elle ne decide rien, elle ne garde
// rien, et elle n'ecrit pas une ligne du contenu dans un journal.
//
// LA DESTINATION n'est pas choisie ici, meme raison que /api/begin : ou vont les
// messages est une decision de Kilian. `MDC_ENTRETIEN_FORWARD_URL` si elle
// existe, sinon `MDC_BEGIN_FORWARD_URL` — l'entretien arrive alors la ou arrive
// deja le formulaire ecrit, ce qui est le comportement souhaitable par defaut.
// Tant qu'aucune des deux n'est definie, la route repond 503 et la page le dit.
// Personne ne doit pouvoir repondre a treize questions sur son corps et croire
// que c'est parti.
//
// CE QUI EST TRANSMIS, et c'est volontairement redondant : le texte mis en page
// sous `message`, parce que c'est la cle que la plupart des services de
// formulaire affichent ; la fiche structuree sous `fiche`, pour le jour ou
// Kilian voudra la mettre ailleurs ; et la transcription complete en bas du
// texte, parce qu'il a demande « toutes les infos » et qu'un resume est
// toujours quelqu'un d'autre qui a decide de ce qui comptait.

import Anthropic from "@anthropic-ai/sdk";
import {
  MODELE, SYSTEME_DOSSIER, SCHEMA_DOSSIER, formateDossier, transcription,
  type Dossier,
} from "@/lib/entretien";
import { adresse, lisTours, tropDAppels } from "@/lib/entretienServeur";

export const runtime = "nodejs";
export const maxDuration = 60;

// Un entretien par personne et par heure suffit largement, et ce plafond porte
// sur l'appel le plus cher de la paire.
const ENVOIS_MAX = 12;

const client = new Anthropic({ timeout: 50_000, maxRetries: 2 });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[entretien] ANTHROPIC_API_KEY n'est pas definie. Aucune fiche n'a pu etre remplie.");
    return Response.json({ erreur: "assistant_absent" }, { status: 503 });
  }

  const destination =
    process.env.MDC_ENTRETIEN_FORWARD_URL || process.env.MDC_BEGIN_FORWARD_URL;
  if (!destination) {
    console.error(
      "[entretien] Une fiche est arrivee et aucune destination n'est definie (MDC_ENTRETIEN_FORWARD_URL, MDC_BEGIN_FORWARD_URL). Elle n'a PAS ete transmise."
    );
    return Response.json({ erreur: "destination_absente" }, { status: 503 });
  }

  if (tropDAppels(adresse(request), ENVOIS_MAX)) {
    return Response.json({ erreur: "trop_dappels" }, { status: 429 });
  }

  let corps: { tours?: unknown; urgence?: unknown };
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: "corps_illisible" }, { status: 400 });
  }

  const tours = lisTours(corps.tours).filter((t) => t.reponse);
  if (!tours.length) {
    return Response.json({ erreur: "rien_a_envoyer" }, { status: 400 });
  }
  const urgence = corps.urgence === true;

  let fiche: Dossier;
  try {
    const reponse = await client.messages.create({
      model: MODELE,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA_DOSSIER } },
      system: [{ type: "text", text: SYSTEME_DOSSIER, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: `Fill in the sheet from this intake. Leave a field empty rather than guessing at it.\n\n${transcription(tours)}`,
        },
      ],
    });
    const texte = reponse.content.find((b) => b.type === "text");
    if (!texte || texte.type !== "text") throw new Error("aucun bloc de texte");
    fiche = JSON.parse(texte.text) as Dossier;
  } catch (e) {
    const quoi =
      e instanceof Anthropic.AuthenticationError ? "cle_refusee"
      : e instanceof Anthropic.RateLimitError ? "limite_fournisseur"
      : e instanceof Anthropic.APIError ? `api_${e.status}`
      : "illisible";
    console.error(`[entretien] La fiche n'a pas pu etre remplie (${quoi}).`);
    // ON ENVOIE QUAND MEME. Ce que la personne a ecrit ne doit pas disparaitre
    // parce qu'une mise en forme a echoue : la transcription seule suffit a
    // Kilian pour la recevoir, et c'est elle qui porte les faits.
    fiche = {};
  }

  const texteDossier = formateDossier(fiche, tours, urgence);
  const nom = typeof fiche.nom === "string" ? fiche.nom.trim() : "";
  const contact = typeof fiche.contact === "string" ? fiche.contact.trim() : "";
  const sujet = `Before the room${nom ? `: ${nom}` : ""}${urgence ? " (stopped early)" : ""}`;

  const charge: Record<string, unknown> = {
    subject: sujet,
    _subject: sujet,
    name: nom,
    message: texteDossier,
    fiche,
    urgence,
    tours: tours.length,
    recu: new Date().toISOString(),
  };
  // Meme convention que /api/begin : quand le contact est un e-mail, on le
  // repete sous `email`, la cle que les services de formulaire lisent pour
  // poser le « repondre a ». Sans elle Kilian recopie l'adresse a la main.
  if (EMAIL.test(contact)) charge.email = contact;

  try {
    const envoi = await fetch(destination, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(charge),
      signal: AbortSignal.timeout(12_000),
    });
    if (!envoi.ok) {
      console.error(`[entretien] La destination a repondu ${envoi.status}. Fiche non transmise.`);
      return Response.json({ erreur: "destination_en_erreur" }, { status: 502 });
    }
  } catch {
    console.error("[entretien] La destination est injoignable. Fiche non transmise.");
    return Response.json({ erreur: "destination_injoignable" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
