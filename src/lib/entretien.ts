// L'ENTRETIEN — ce que la maison demande avant la seance, et qui le demande.
//
// Demande par Kilian : « un questionnaire interactif avec l'ai dedans qui agit
// en tant que la maison du calme [...] qu'il me demande tout ce que je dois
// savoir avant la seance, mais y aller comme un pro, surtout si la personne est
// fragile ou pas du tout, que l'ia juge et sache quelle sera sa prochaine
// question, et a la fin me remplir un joli formulaire envoye a mon adresse. »
//
// ─────────────────────────────────────────────────────────────────────────
// LA CONTRADICTION A RESOUDRE, ET COMMENT ELLE L'EST
//
// /begin promet, en trois lignes numerotees : « He reads it himself — Not a
// system, not an assistant. » Poser une IA sur le meme parcours peut rendre
// cette phrase fausse, et c'est la seule promesse sur laquelle tout le site
// repose.
//
// Elle reste vraie a une condition, et cette condition est architecturale, pas
// redactionnelle : l'assistant NE REPOND JAMAIS. Il pose des questions, il
// n'en resout aucune. Personne ne recoit de conseil, de reassurance, de lecture
// de son cas ni de reponse a sa question par une machine. Ce qui LIT et ce qui
// REPOND reste Kilian, et la page le dit en clair au visiteur avant la premiere
// question.
//
// C'est aussi pour cette raison que la voix de l'assistant n'est pas la voix de
// la maison au sens du copywriting : la maison AFFIRME, l'assistant DEMANDE.
// Deux registres, et le second est le seul autorise ici.
//
// ─────────────────────────────────────────────────────────────────────────
// CE QUI NE S'INVENTE JAMAIS
//
// Les faits sur Kilian et sa pratique viennent de SERVICES.md et de sa parole.
// Le modele n'en a aucun besoin pour poser une question, donc il en recoit le
// strict minimum et il lui est interdit d'en produire un seul de plus. Meme
// regle sur le dossier final : un champ non aborde reste VIDE. Aucune
// deduction, aucun remplissage vraisemblable. Un dossier qui invente une
// information de sante sur une personne reelle est pire qu'un dossier vide,
// parce que Kilian entrera dans la piece en y croyant.
//
// ─────────────────────────────────────────────────────────────────────────
// SANTE, ASA/CAP, ET DONNEES DE CATEGORIE PARTICULIERE
//
// Ce que cet entretien recolte est de la donnee de sante : article 9 du RGPD
// britannique, categorie particuliere. D'ou trois choix de construction :
//
//   1. rien n'est stocke cote serveur. La conversation vit dans le navigateur
//      du visiteur et dans le corps des requetes. Le serveur ne tient aucune
//      base, aucun journal de contenu ;
//   2. le consentement est demande AVANT la premiere question, en clair, avec
//      ce qui est collecte, qui le lit, et le fait qu'un assistant pose les
//      questions ;
//   3. l'assistant ne pose aucun diagnostic, ne demande aucun diagnostic, et
//      ne promet aucun effet clinique. Au Royaume-Uni l'ASA et le code CAP
//      l'interdisent pour les therapies non conventionnelles, et une plainte
//      se regle contre le praticien.
//
// ─────────────────────────────────────────────────────────────────────────
// LA CRISE
//
// Si quelqu'un dit qu'il veut mourir, decrit un danger immediat ou une urgence
// medicale, l'entretien s'arrete. Le modele n'evalue pas le risque, ne rassure
// pas, ne continue pas. Il leve un drapeau et c'est la PAGE qui affiche des
// ressources reelles, ecrites en dur ici. Un texte de secours genere a la
// volee est un texte qu'on n'a pas relu.

export const MODELE = "claude-opus-5";

// Le plafond dur de l'echange. L'assistant s'arrete de lui-meme bien avant sur
// quelqu'un de fragile ; ce nombre n'est pas une cible, c'est une butee.
export const TOURS_MAX = 22;

// Par reponse, et pour tout l'entretien. Un champ de texte libre ouvert sur une
// API payante est une facture ouverte.
export const LIMITE_REPONSE = 2400;
export const LIMITE_TOTALE = 16000;

// Les cles de ce que Kilian doit savoir. Elles servent trois fois : dans les
// consignes, dans ce que le modele declare avoir couvert, et dans le dossier.
export const BESOINS = [
  { cle: "identite",   quoi: "Their name, and how to reach them." },
  { cle: "porte",      quoi: "What they carry, in their own words." },
  { cle: "depuis",     quoi: "How long it has been like this." },
  { cle: "soin",       quoi: "Whether anyone is already looking after it, and what they have tried." },
  { cle: "medication", quoi: "Anything prescribed or taken regularly they want him to know about." },
  { cle: "corps",      quoi: "Pregnancy, recent surgery, injury, acute pain." },
  { cle: "toucher",    quoi: "Whether touch is welcome, and any area he must not touch." },
  { cle: "etat",       quoi: "Sleep, energy, appetite as they experience them." },
  { cle: "avant",      quoi: "Previous experience of this kind of work, and anything that went badly." },
  { cle: "piece",      quoi: "The room: scent, sound, light, temperature, how much silence." },
  { cle: "pratique",   quoi: "Which days and times are possible, and how they will travel." },
  { cle: "reste",      quoi: "Anything else, including what they would rather not say out loud in the room." },
] as const;

export type Cle = (typeof BESOINS)[number]["cle"];

export const CLES: string[] = BESOINS.map((b) => b.cle);

// LES DEUX QUI NE SE SAUTENT PAS. `corps` et `toucher` sont la securite et le
// consentement : sans elles Kilian pose les mains sans savoir. `identite` sans
// quoi le dossier ne mene a personne.
const OBLIGATOIRES: Cle[] = ["identite", "corps", "toucher"];

const INVENTAIRE = BESOINS.map((b, i) => `${i + 1}. [${b.cle}] ${b.quoi}`).join("\n");

// ─────────────────────────────────────────────────────────────────────────
// LES CONSIGNES. En anglais, parce que c'est la langue dans laquelle
// l'assistant parle au visiteur, et qu'une consigne ecrite dans une autre
// langue que la sortie attendue fabrique des tournures traduites.
// ─────────────────────────────────────────────────────────────────────────

export const SYSTEME = `You put the questions Maison du Calme needs answered before a first session. Maison du Calme is one practitioner, Kilian, working alone in Battersea, South West London.

YOUR ONE JOB IS TO ASK.
You never answer, never advise, never reassure, never explain what the work does, never interpret what someone tells you, never assess anyone, never name or suggest a condition, never promise any effect, and never accept or decline anyone. Kilian reads what you gather, and Kilian decides. If someone asks you a question, give it back to him in one short line ("Kilian answers that himself") and continue with your next question. You do not have his answers and you must not invent them.

You are not the voice of the house. The house states things; you only ask. So: no welcome speech, no atmosphere, no lines about stillness or silence or breath. You sound like a careful person with a notebook, not like a brochure.

WHAT YOU MAY SAY IS TRUE, AND SHORT.
The facts you are allowed to rely on, and nothing beyond them: the work is done lying down, clothed, in silence. Sessions run sixty to ninety minutes. Hands rest on the body or just above it and are held; nothing is worked, pressed or manipulated. One treatment, Abhyanga, uses oil and is arranged separately. Never say where or from whom Kilian learned, never name a school, a certificate or a qualification, never give an address more precise than Battersea, South West London, and never describe how any method works.

You may not invent a fact about Kilian, a price, a duration, an availability, or anything a session produces. If you do not know, you do not say.

HOW YOU WRITE.
British English. One question per turn, and one question only, never two joined by "and". Plain words. Under twenty-five words wherever possible. No em dashes. No exclamation marks. Never say "we": Kilian works alone, so it is "he", or nobody. These words are not used here, in any form: journey, holistic, unlock, transform, sacred space, wellness, nurture, empower, dive deep, elevate, and "energy" in any sense other than how tired someone is. No therapy language: never "I hear you", never "thank you for sharing", never "that must be hard". If someone has just said something heavy, one short plain sentence of acknowledgement is allowed before the question, and only one. Never repeat their words back to them as though reading them.

HOW YOU CHOOSE THE NEXT QUESTION.
Read everything already said before you write. Then ask the one thing that matters most next, given what this particular person has told you. There is no script and you must not behave like one: if an answer has already told you something, do not ask it; if an answer opens something more important than what came next on the list, follow the answer.

WHAT KILIAN NEEDS, EVENTUALLY:
${INVENTAIRE}

You do not need all twelve, and a good intake is rarely all twelve. These three are not optional: ${OBLIGATOIRES.join(", ")}. Everything else is your judgement.

FRAGILITY, AND THE PACE IT SETS.
Rate the person from 1 to 5 every turn: 1 is matter of fact and wants to get on with it, 5 is raw, exhausted, in pain, answering in three words, or has just disclosed grief or something frightening.

At 1 or 2, move at their pace: cover ground, be direct, do not soften what does not need softening. Someone brisk finds a gentle voice patronising.

At 4 or 5, cut the intake to what keeps them safe in the room and nothing more. Shorter questions. Fewer of them. Offer the way out more often. Finish early. A tired person filling in a long form is a person who does not come.

NEVER ASK FOR THE DETAIL OF SOMETHING PAINFUL. You ask whether there is anything the room should know. You never ask what happened. If someone volunteers detail, take it, do not follow it, and move on. If an answer is short or turns away from the question, that is an answer: do not press it twice.

Anyone may refuse any question, and the page tells them so. If someone hesitates or refuses, accept it in at most four words and go elsewhere.

WHEN TO STOP.
Return "assez" as soon as Kilian could safely and usefully meet this person. Do not keep going because the list is not finished. Stop early on someone fragile. Never exceed ${TOURS_MAX} questions in total.

STOP IMMEDIATELY, WITH "arret", IF someone says they want to die or to harm themselves, describes being in danger from another person, or describes what sounds like a medical emergency happening now. Do not assess it, do not reassure, do not ask another question. The page then shows written resources that were reviewed by a person. That is not your text to write.`;

// Le tour : ce que le modele rend a chaque question. `additionalProperties`
// ferme et tous les champs requis — c'est ce qu'un schema strict demande, et
// c'est aussi ce qui evite un champ manquant a rendre cote client.
export const SCHEMA_TOUR = {
  type: "object",
  properties: {
    etat: {
      type: "string",
      enum: ["question", "assez", "arret"],
      description: "question: one more question follows. assez: enough for Kilian to meet them. arret: crisis, stop the intake.",
    },
    question: {
      type: "string",
      description: "The question to put, when etat is question. Empty string otherwise.",
    },
    note: {
      type: "string",
      description: "At most one short plain sentence before the question, and only when something heavy has just been said. Empty string by default.",
    },
    champ: {
      type: "string",
      enum: ["ligne", "paragraphe"],
      description: "ligne for a name, a date, a time, a short fact. paragraphe when the answer wants room.",
    },
    couvert: {
      type: "array",
      items: { type: "string", enum: CLES },
      description: "Every key already answered well enough, including by this turn's answer.",
    },
    fragilite: {
      type: "integer",
      minimum: 1,
      maximum: 5,
      description: "1 matter of fact, 5 raw. Judged on this conversation, not on the topic.",
    },
  },
  required: ["etat", "question", "note", "champ", "couvert", "fragilite"],
  additionalProperties: false,
} as const;

export type Tour = {
  etat: "question" | "assez" | "arret";
  question: string;
  note: string;
  champ: "ligne" | "paragraphe";
  couvert: string[];
  fragilite: number;
};

// ─────────────────────────────────────────────────────────────────────────
// LE DOSSIER. C'est le « joli formulaire » que Kilian recoit.
//
// UNE SEULE REGLE COMPTE ICI et elle est repetee dans les consignes : un champ
// non aborde reste une chaine VIDE. Le formateur ecrira « not asked ». Une
// deduction plausible sur la sante de quelqu'un est un mensonge que le
// praticien emportera dans la piece.
// ─────────────────────────────────────────────────────────────────────────

const CHAMPS_DOSSIER: { cle: string; titre: string; quoi: string }[] = [
  { cle: "nom", titre: "Name", quoi: "Exactly as they gave it." },
  { cle: "contact", titre: "How to reach them", quoi: "The email or telephone number as written." },
  { cle: "porte", titre: "What they carry", quoi: "In their own words. Quote them rather than summarising." },
  { cle: "depuis", titre: "How long", quoi: "As they put it." },
  { cle: "soin", titre: "Already being looked after", quoi: "Who is involved, and what they have tried." },
  { cle: "medication", titre: "Taken regularly", quoi: "Only what they said. Never a diagnosis you inferred." },
  { cle: "corps", titre: "The body", quoi: "Pregnancy, surgery, injury, pain. Their words." },
  { cle: "toucher", titre: "Touch", quoi: "Whether it is welcome, and every area or action they ruled out." },
  { cle: "etat", titre: "Sleep, energy, appetite", quoi: "As they described it." },
  { cle: "avant", titre: "Before this", quoi: "Previous experience, and anything that went badly." },
  { cle: "piece", titre: "The room", quoi: "Scent, sound, light, temperature, how much silence." },
  { cle: "pratique", titre: "Practical", quoi: "Days, times, how they will travel." },
  { cle: "reste", titre: "Anything else", quoi: "Including what they would rather not say out loud." },
];

const LISTE_CHAMPS = CHAMPS_DOSSIER.map((c) => `- ${c.cle}: ${c.quoi}`).join("\n");

export const SYSTEME_DOSSIER = `You are filling in an intake sheet for Kilian, who will read it before he meets this person. You are given the questions that were put and the answers that were given. You fill the sheet from those answers and from nothing else.

THE RULE THAT MATTERS MOST: if something was not asked, or was refused, or the answer does not actually say it, leave that field as an empty string. Never infer, never round up, never write the likely answer. Kilian walks into the room believing this sheet. A plausible sentence you invented about someone's health or body is worse than a blank.

Keep their words. This is not a summary for a file, it is what one person said so another person can meet them well. Quote where quoting is clearer. Do not tidy someone's phrasing into clinical language, and never name a condition they did not name.

Fill in:
${LISTE_CHAMPS}

Then, separately:
- accueil: one or two plain sentences on how to meet this person in the first minute. What they need at the door, not a character assessment. Nothing you cannot point to in what they wrote.
- drapeaux: anything Kilian must read before he touches anyone. Pregnancy, recent surgery, an area ruled out, a refusal of touch, a stated medical condition, a crisis. Short entries. Empty list if there are none, and do not pad it.
- verifier: what to confirm in person, because an answer was unclear, contradictory, or given reluctantly.
- non_dit: what was asked and not answered, or never asked at all, so he knows the shape of the gap.

British English. No em dashes.`;

export const SCHEMA_DOSSIER = {
  type: "object",
  properties: {
    ...Object.fromEntries(
      CHAMPS_DOSSIER.map((c) => [c.cle, { type: "string", description: c.quoi }])
    ),
    accueil: { type: "string", description: "How to meet this person in the first minute." },
    drapeaux: { type: "array", items: { type: "string" }, description: "What must be read before touching anyone." },
    verifier: { type: "array", items: { type: "string" }, description: "To confirm in person." },
    non_dit: { type: "array", items: { type: "string" }, description: "Asked and not answered, or never asked." },
    fragilite: { type: "integer", minimum: 1, maximum: 5, description: "1 matter of fact, 5 raw." },
  },
  required: [...CHAMPS_DOSSIER.map((c) => c.cle), "accueil", "drapeaux", "verifier", "non_dit", "fragilite"],
  additionalProperties: false,
} as const;

export type Dossier = Record<string, unknown>;

export type Echange = { question: string; reponse: string };

// La transcription que le modele lit, et celle que Kilian recoit en bas du
// dossier. La meme fonction pour les deux : ce que le praticien lit est
// exactement ce que le modele a lu, sans version intermediaire.
export function transcription(tours: Echange[]): string {
  if (!tours.length) return "(nothing was said)";
  return tours
    .map((t, i) => `Q${i + 1}. ${t.question}\nA${i + 1}. ${t.reponse || "(no answer given)"}`)
    .join("\n\n");
}

const TRAIT = "-".repeat(66);

// LE FORMULAIRE. Du texte brut, mis en page, et c'est un choix : un HTML
// d'e-mail se fait manger par un client sur deux, et la destination n'est pas
// connue d'ici (voir MDC_BEGIN_FORWARD_URL dans DEPLOY.md). Du texte aligne se
// lit partout, y compris dans un webhook, y compris sur un telephone.
export function formateDossier(d: Dossier, tours: Echange[], urgence: boolean): string {
  const lire = (cle: string) => {
    const v = d[cle];
    return typeof v === "string" && v.trim() ? v.trim() : "";
  };
  const liste = (cle: string) => {
    const v = d[cle];
    return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).map(String) : [];
  };

  const lignes: string[] = [];
  const nom = lire("nom") || "Someone who did not give a name";

  lignes.push("BEFORE THE ROOM");
  lignes.push(`${nom}`);
  lignes.push(`Filled in from ${tours.length} question${tours.length === 1 ? "" : "s"} on ${new Date().toISOString().slice(0, 10)}.`);
  lignes.push("");

  if (urgence) {
    lignes.push(TRAIT);
    lignes.push("READ THIS FIRST");
    lignes.push("The intake was stopped early. What this person wrote was taken as");
    lignes.push("someone in crisis or in danger, and they were shown the Samaritans,");
    lignes.push("NHS 111 and 999 before anything else. They were told this reached you");
    lignes.push("and that you may not see it tonight.");
    lignes.push(TRAIT);
    lignes.push("");
  }

  const drapeaux = liste("drapeaux");
  if (drapeaux.length) {
    lignes.push("BEFORE YOU TOUCH ANYONE");
    drapeaux.forEach((x) => lignes.push(`  !  ${x}`));
    lignes.push("");
  }

  const accueil = lire("accueil");
  if (accueil) {
    lignes.push("AT THE DOOR");
    lignes.push(`  ${accueil}`);
    lignes.push("");
  }

  const f = d.fragilite;
  if (typeof f === "number") {
    lignes.push(`How they arrive, 1 matter of fact to 5 raw:  ${f} of 5`);
    lignes.push("");
  }

  // Le filet qui ouvre les champs ne se redouble pas : l'encadre de crise se
  // termine deja par un trait, et deux traits separes par une ligne vide se
  // lisent comme une page mal composee.
  if (lignes[lignes.length - 2] !== TRAIT) {
    lignes.push(TRAIT);
    lignes.push("");
  }
  for (const c of CHAMPS_DOSSIER) {
    const v = lire(c.cle);
    lignes.push(c.titre.toUpperCase());
    if (v) {
      v.split("\n").forEach((l) => lignes.push(`  ${l}`));
    } else {
      lignes.push("  not asked");
    }
    lignes.push("");
  }

  const verifier = liste("verifier");
  lignes.push(TRAIT);
  lignes.push("");
  lignes.push("TO CONFIRM IN PERSON");
  if (verifier.length) verifier.forEach((x) => lignes.push(`  .  ${x}`));
  else lignes.push("  nothing flagged");
  lignes.push("");

  const nonDit = liste("non_dit");
  lignes.push("NOT ANSWERED, OR NEVER ASKED");
  if (nonDit.length) nonDit.forEach((x) => lignes.push(`  .  ${x}`));
  else lignes.push("  nothing");
  lignes.push("");

  lignes.push(TRAIT);
  lignes.push("");
  lignes.push("WHAT WAS ACTUALLY SAID");
  lignes.push("");
  lignes.push(transcription(tours));
  lignes.push("");
  lignes.push(TRAIT);
  lignes.push("The questions were put by an assistant. The answers are theirs, word");
  lignes.push("for word. Nothing here was read by anyone but you.");

  return lignes.join("\n");
}
