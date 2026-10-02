// La route qui recoit ce qu'on ecrit sur /begin.
//
// Avant elle, `BeginForm` faisait `onSubmit={(e) => e.preventDefault()}` et
// rien d'autre : le message etait jete. La page, elle, promet « Read by Kilian
// alone. Answered personally, within two working days ». C'est la seule
// promesse sur laquelle tout le site repose, et le code ne la tenait pas.
//
// DESTINATION. Le site envoie le mail lui-meme, en un saut, vers la boite de
// Kilian (MDC_BEGIN_A). Il n'y a plus de relais : voir l'en-tete de
// `src/lib/courrier.ts` pour les deux raisons qui ont retire le webhook, dont
// celle-ci, qui compte ici — une plateforme d'automatisation repond 200 a la
// reception et pas a la livraison, donc cette route aurait annonce « parti »
// sur un message perdu.
//
// TANT QUE LA CONFIGURATION MANQUE, la route repond 503 et le formulaire
// affiche son etat d'echec. C'est volontaire aussi : un envoi qui echoue
// visiblement vaut mieux qu'un envoi qui fait semblant. Personne ne doit
// pouvoir ecrire ce qu'il porte et croire que c'est parti.
//
// CONFIDENTIALITE. Le champ « What do you carry? » est ce que quelqu'un a de
// plus intime, et la page lui promet le secret. Rien de ce qu'il contient n'est
// journalise : les logs ne disent que si l'envoi a reussi, jamais ce qu'il
// disait, jamais qui l'a ecrit.

import { boiteBegin, envoie } from "@/lib/courrier";

export const runtime = "nodejs";

type Corps = {
  carry?: unknown;
  name?: unknown;
  reach?: unknown;
  source?: unknown;
  brings?: unknown;
};

const LIMITES = { carry: 5000, name: 200, reach: 200, source: 300, brings: 60 };

function texte(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// Ce que Kilian lit dans sa boite. Les champs vides ne s'ecrivent pas : une
// ligne « Source : » suivie de rien lui fait croire a une panne. Et ce qu'on
// porte vient en dernier, parce que c'est ce qu'on lit en entier.
function lettre(m: Record<string, string>): string {
  const lignes = [
    ["Name", m.name],
    ["Reach", m.reach],
    ["Brings", m.brings],
    ["Source", m.source],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);

  if (m.carry) lignes.push("", "Carries:", m.carry);
  lignes.push("", `Received ${m.recu}`);
  return lignes.join("\n");
}

export async function POST(request: Request) {
  let corps: Corps;
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: "corps_illisible" }, { status: 400 });
  }

  const message: Record<string, string> = {
    carry: texte(corps.carry, LIMITES.carry),
    name: texte(corps.name, LIMITES.name),
    reach: texte(corps.reach, LIMITES.reach),
    source: texte(corps.source, LIMITES.source),
    brings: texte(corps.brings, LIMITES.brings),
    recu: new Date().toISOString(),
  };

  // « How to reach you » accepte un e-mail OU un telephone, au choix du
  // visiteur. Quand c'est un e-mail, il devient le « repondre a » du mail :
  // Kilian appuie sur Repondre et ecrit, sans recopier une adresse a la main
  // pour repondre a quelqu'un qui vient d'ecrire ce qu'il porte. Le test est
  // volontairement grossier — il ne sert qu'a decider si on pose ce champ,
  // jamais a refuser un message.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.reach)) {
    message.email = message.reach;
  }

  // Le navigateur pose deja `required`, mais on ne fait jamais confiance au
  // client : un POST direct contourne le formulaire.
  if (!message.name || !message.reach) {
    return Response.json({ erreur: "champs_manquants" }, { status: 400 });
  }

  const boite = boiteBegin();
  if (!boite) {
    // Pas de contenu dans ce log : seulement le fait qu'un message est arrive
    // et n'a nulle part ou aller. C'est ce qu'il faut savoir pour reparer.
    console.error(
      "[begin] Un message est arrive et MDC_BEGIN_A n'est pas definie. Il n'a PAS ete transmis."
    );
    return Response.json({ erreur: "destination_absente" }, { status: 503 });
  }

  const resultat = await envoie({
    a: boite,
    sujet: message.name ? `Begin: ${message.name}` : "Begin",
    texte: lettre(message),
    repondreA: message.email,
  });

  if (!resultat.ok) {
    if (resultat.raison === "config_absente") {
      console.error(
        "[begin] Un message est arrive et l'envoi n'est pas configure (MDC_SMTP_URL, MDC_COURRIER_DE). Il n'a PAS ete transmis."
      );
      return Response.json({ erreur: "destination_absente" }, { status: 503 });
    }
    console.error("[begin] Le serveur de courrier a refuse le message. Non transmis.");
    return Response.json({ erreur: "destination_en_erreur" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
