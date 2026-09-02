// La route qui recoit ce qu'on ecrit sur /begin.
//
// Avant elle, `BeginForm` faisait `onSubmit={(e) => e.preventDefault()}` et
// rien d'autre : le message etait jete. La page, elle, promet « Read by Kilian
// alone. Answered personally, within two working days ». C'est la seule
// promesse sur laquelle tout le site repose, et le code ne la tenait pas.
//
// DESTINATION. Elle n'est pas choisie ici, et c'est volontaire : ou vont les
// messages est une decision de Kilian, pas d'un agent. La route poste le
// message en JSON a l'URL donnee par `MDC_BEGIN_FORWARD_URL` — un formulaire
// hebergé, un webhook, une automatisation, ce qu'il voudra. Aucun fournisseur
// n'est impose et aucune cle n'est ecrite dans le depot.
//
// TANT QU'ELLE N'EST PAS CONFIGUREE, la route repond 503 et le formulaire
// affiche son etat d'echec. C'est volontaire aussi : un envoi qui echoue
// visiblement vaut mieux qu'un envoi qui fait semblant. Personne ne doit
// pouvoir ecrire ce qu'il porte et croire que c'est parti.
//
// CONFIDENTIALITE. Le champ « What do you carry? » est ce que quelqu'un a de
// plus intime, et la page lui promet le secret. Rien de ce qu'il contient n'est
// journalise : les logs ne disent que si l'envoi a reussi, jamais ce qu'il
// disait, jamais qui l'a ecrit.

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

export async function POST(request: Request) {
  let corps: Corps;
  try {
    corps = await request.json();
  } catch {
    return Response.json({ erreur: "corps_illisible" }, { status: 400 });
  }

  const message = {
    carry: texte(corps.carry, LIMITES.carry),
    name: texte(corps.name, LIMITES.name),
    reach: texte(corps.reach, LIMITES.reach),
    source: texte(corps.source, LIMITES.source),
    brings: texte(corps.brings, LIMITES.brings),
    recu: new Date().toISOString(),
  };

  // Le navigateur pose deja `required`, mais on ne fait jamais confiance au
  // client : un POST direct contourne le formulaire.
  if (!message.name || !message.reach) {
    return Response.json({ erreur: "champs_manquants" }, { status: 400 });
  }

  const destination = process.env.MDC_BEGIN_FORWARD_URL;
  if (!destination) {
    // Pas de contenu dans ce log : seulement le fait qu'un message est arrive
    // et n'a nulle part ou aller. C'est ce qu'il faut savoir pour reparer.
    console.error(
      "[begin] Un message est arrive et MDC_BEGIN_FORWARD_URL n'est pas definie. Il n'a PAS ete transmis."
    );
    return Response.json({ erreur: "destination_absente" }, { status: 503 });
  }

  try {
    const reponse = await fetch(destination, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(10_000),
    });
    if (!reponse.ok) {
      console.error(`[begin] La destination a repondu ${reponse.status}. Message non transmis.`);
      return Response.json({ erreur: "destination_en_erreur" }, { status: 502 });
    }
  } catch {
    console.error("[begin] La destination est injoignable. Message non transmis.");
    return Response.json({ erreur: "destination_injoignable" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
