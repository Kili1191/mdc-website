// La route qui remplit le formulaire et l'envoie.
//
// Elle fait exactement deux choses, dans cet ordre : elle demande au modele de
// remplir une fiche a partir de ce qui a ETE DIT et de rien d'autre, puis elle
// poste le tout a la destination de Kilian. Elle ne decide rien, elle ne garde
// rien, et elle n'ecrit pas une ligne du contenu dans un journal.
//
// LA DESTINATION est la boite de Kilian, et le site y envoie le mail lui-meme :
// `MDC_ENTRETIEN_A` si elle existe, sinon `MDC_BEGIN_A` — l'entretien arrive
// alors la ou arrive deja le formulaire ecrit, ce qui est le comportement
// souhaitable par defaut. Tant qu'aucune des deux n'est definie, la route
// repond 503 et la page le dit. Personne ne doit pouvoir repondre a treize
// questions sur son corps et croire que c'est parti.
//
// IL N'Y A PLUS DE RELAIS, et c'est cette charge-ci qui l'a decide : treize
// champs de categorie particuliere au sens de l'article 9 du RGPD britannique,
// la transcription mot pour mot, un drapeau d'urgence, un nom et un contact en
// clair. Un service de formulaire garde ca dans un tableau de bord et une
// plateforme d'automatisation dans un historique d'execution ; ce n'est pas une
// fuite, c'est leur fonction. La page affiche « Nothing is saved here ».
// Voir l'en-tete de `src/lib/courrier.ts`.
//
// CE QUI EST TRANSMIS : la fiche mise en page, et la transcription complete en
// dessous, parce que Kilian a demande « toutes les infos » et qu'un resume est
// toujours quelqu'un d'autre qui a decide de ce qui comptait.

import Anthropic from "@anthropic-ai/sdk";
import {
  MODELE, SYSTEME_DOSSIER, SCHEMA_DOSSIER, formateDossier, transcription,
  type Dossier,
} from "@/lib/entretien";
import { adresse, lisTours, tropDAppels } from "@/lib/entretienServeur";
import { boiteEntretien, envoie } from "@/lib/courrier";

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

  const boite = boiteEntretien();
  if (!boite) {
    console.error(
      "[entretien] Une fiche est arrivee et aucune destination n'est definie (MDC_ENTRETIEN_A, MDC_BEGIN_A). Elle n'a PAS ete transmise."
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
      // Meme raison que dans la route de la question : `thinking` consomme ce
      // plafond, et cette requete-ci tourne a l'effort HAUT sur une
      // transcription entiere. 8000 pouvait partir en reflexion et ne rien
      // laisser pour la fiche. C'est un plafond, pas une depense.
      max_tokens: 16000,
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

  const resultat = await envoie({
    a: boite,
    sujet,
    texte: texteDossier,
    // Le contact quand c'est un e-mail : Kilian appuie sur Repondre et ecrit a
    // quelqu'un qui vient de repondre a treize questions sur son corps, sans
    // recopier une adresse.
    repondreA: EMAIL.test(contact) ? contact : undefined,
  });

  if (!resultat.ok) {
    if (resultat.raison === "config_absente") {
      console.error(
        "[entretien] Une fiche est arrivee et l'envoi n'est pas configure (MDC_SMTP_URL, MDC_COURRIER_DE). Elle n'a PAS ete transmise."
      );
      return Response.json({ erreur: "destination_absente" }, { status: 503 });
    }
    console.error("[entretien] Le serveur de courrier a refuse la fiche. Non transmise.");
    return Response.json({ erreur: "destination_en_erreur" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
