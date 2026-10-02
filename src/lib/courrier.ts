// L'envoi du courrier, et pourquoi il n'y a plus de relais.
//
// Avant ce fichier, les deux routes postaient leur charge en JSON a une URL
// donnee par MDC_BEGIN_FORWARD_URL : un formulaire heberge, un webhook, une
// automatisation. Le fournisseur n'etait pas choisi, et c'etait presente comme
// une qualite. Deux choses ont decide le contraire.
//
// LE 200 NE VOULAIT RIEN DIRE. Une plateforme d'automatisation repond 200 a la
// RECEPTION de la charge, pas a la livraison du mail : la suite est asynchrone.
// Quota epuise, etape en erreur, compte suspendu, et la route voyait 200. La
// page affichait alors a quelqu'un qu'on venait d'orienter vers le 999 que ce
// qu'il avait ecrit etait parti. Tout le dispositif de panne visible de ce
// depot suppose une destination dont le 200 veut dire « accepte pour
// livraison ». Un serveur SMTP qui accepte un message l'a accepte.
//
// L'ARCHIVE ETAIT LE PRODUIT. Un service de formulaire garde les soumissions
// dans un tableau de bord, une plateforme d'automatisation garde l'historique
// d'execution avec la charge : ce n'est pas une fuite, c'est la fonction. La
// fiche de /begin/before porte treize champs de categorie particuliere au sens
// de l'article 9 du RGPD britannique, la transcription mot pour mot, et un
// drapeau d'urgence. Un tiers qui en garde une copie consultable dement la
// phrase que la page affiche, « Nothing is saved here ».
//
// DONC : le site envoie lui-meme, en SMTP, en un saut. Pas de tableau de bord
// intermediaire, pas d'archive ailleurs que dans la boite de Kilian.
//
// LE FOURNISSEUR EST UNE VARIABLE, PAS UN CHOIX GRAVE. MDC_SMTP_URL porte la
// connexion entiere. Resend, Brevo, Proton pour les professionnels : tous
// parlent SMTP. Changer de fournisseur ne touche pas une ligne de code.
//
// RIEN DU CONTENU N'EST JOURNALISE. Les logs disent si l'envoi a reussi, et
// quelle piece de configuration manque. Jamais ce que le message disait, jamais
// qui l'a ecrit.

import nodemailer, { type Transporter } from "nodemailer";

export type Courrier = {
  a: string;
  sujet: string;
  texte: string;
  // L'adresse a laquelle Kilian repond en appuyant sur « Repondre ». Elle n'est
  // posee que quand le visiteur a laisse un e-mail : il peut laisser un
  // telephone, et c'est son droit.
  repondreA?: string;
};

export type Echec = "config_absente" | "envoi_refuse";
export type Resultat = { ok: true } | { ok: false; raison: Echec };

// Le transport garde sa connexion ouverte entre deux appels de la meme instance
// serverless. Le recreer a chaque message refait la poignee de main TLS pour
// rien.
let transport: Transporter | null = null;

function connexion(): Transporter | null {
  const url = process.env.MDC_SMTP_URL;
  if (!url) return null;
  if (!transport) transport = nodemailer.createTransport(url);
  return transport;
}

// Qui envoie. Tant qu'un domaine n'est pas verifie chez le fournisseur, c'est
// l'adresse de bac a sable qu'il impose ; une fois maisonducalme.com verifie,
// c'est une adresse de la maison. Dans les deux cas c'est une variable, parce
// que le jour ou elle change personne ne doit avoir a toucher au code.
function expediteur(): string | undefined {
  return process.env.MDC_COURRIER_DE;
}

// Ou va quoi. L'entretien retombe sur la boite du formulaire ecrit quand sa
// propre adresse n'existe pas : une seule variable suffit a ouvrir les deux
// chemins, et la seconde ne sert qu'a separer les boites.
export function boiteBegin(): string | undefined {
  return process.env.MDC_BEGIN_A;
}

export function boiteEntretien(): string | undefined {
  return process.env.MDC_ENTRETIEN_A || process.env.MDC_BEGIN_A;
}

// Un serveur SMTP injoignable ne refuse pas : il ne repond pas. Sans cette
// borne, la fonction tient jusqu'au plafond de la plateforme et le visiteur
// regarde un bouton tourner. Vingt secondes, puis on dit que ca n'est pas
// parti.
const DELAI = 20_000;

function avecDelai<T>(travail: Promise<T>): Promise<T> {
  return Promise.race([
    travail,
    new Promise<never>((_, rejette) =>
      setTimeout(() => rejette(new Error("delai depasse")), DELAI)
    ),
  ]);
}

export async function envoie(courrier: Courrier): Promise<Resultat> {
  const poste = connexion();
  const de = expediteur();
  if (!poste || !de || !courrier.a) {
    return { ok: false, raison: "config_absente" };
  }

  try {
    await avecDelai(
      poste.sendMail({
        from: de,
        to: courrier.a,
        subject: courrier.sujet,
        text: courrier.texte,
        replyTo: courrier.repondreA || undefined,
      })
    );
  } catch {
    // L'erreur elle-meme n'est pas journalisee : un refus SMTP cite souvent la
    // ligne fautive, et cette ligne est le message de quelqu'un.
    return { ok: false, raison: "envoi_refuse" };
  }

  return { ok: true };
}
