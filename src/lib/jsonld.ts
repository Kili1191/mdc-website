// Les donnees structurees du site.
//
// Le site affiche deja tout ce qui compte — les pratiques, les durees, les
// prix, le quartier — mais aucune machine ne pouvait le lire. Ce fichier
// expose ces memes faits en JSON-LD, sans ajouter un mot destine au client :
// chaque valeur ci-dessous est deja visible quelque part sur une page.
//
// TROIS INTERDITS, qui priment sur tout rendement de referencement :
//
//   1. AUCUNE ADRESSE. « Battersea, South West London » et rien de plus, y
//      compris ici. Pas de `streetAddress`, pas de code postal. La zone
//      desservie remplace le lieu.
//   2. AUCUN FAUX SIGNAL. Pas de `Review`, pas d'`AggregateRating`, pas
//      d'horaires : il n'existe pas d'avis publies ni d'horaires annonces.
//      « Ofqual » a deja ete publie par erreur puis retire pour un titre non
//      verifie ; la meme exigence vaut pour chaque champ.
//   3. NERVANA GUARD. Le nom de la methode s'ecrit. Le COMMENT reste interne,
//      donc aucune description ne dit par quelle mecanique une seance agit.
//
// Regle de maintenance : ne jamais baliser ce que la page n'affiche pas. Une
// donnee structuree qui contredit le texte visible est une penalite, pas un
// gain. Si un prix change sur la page, il change ici le meme jour.

const SITE = "https://maisonducalme.com";

export const ORG_ID = `${SITE}/#maison`;
export const PERSON_ID = `${SITE}/#kilian`;

/** La maison. `HealthAndBeautyBusiness` est plus juste que `LocalBusiness` seul. */
export const organisation = {
  "@type": "HealthAndBeautyBusiness",
  "@id": ORG_ID,
  name: "Maison du Calme",
  url: SITE,
  // Le quartier, jamais l'adresse. C'est une contrainte de marque, pas un oubli.
  areaServed: [
    { "@type": "Place", name: "Battersea, South West London" },
    { "@type": "Place", name: "London" },
  ],
  priceRange: "£130–£250",
  founder: { "@id": PERSON_ID },
  employee: { "@id": PERSON_ID },
};

/** Kilian. Aucun titre qui ne soit pas deja ecrit sur la page Practitioner. */
export const praticien = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Kilian",
  jobTitle: "Practitioner",
  worksFor: { "@id": ORG_ID },
  knowsAbout: [
    "NERVANA",
    "Abhyanga",
    "Marma therapy",
    "Reiki",
    "Sound",
    "Coaching",
  ],
};

type Salle = { nom: string; description: string; minutes?: number; prix?: number };

/** Les pratiques en cabinet. Prix et durees repris de la page Sessions. */
const EN_CABINET: Salle[] = [
  { nom: "ANTARA", description: "The threshold session of NERVANA. For the weight you have carried longest.", minutes: 90, prix: 250 },
  { nom: "VAYU", description: "Part of NERVANA. When you cannot get a full breath.", minutes: 60, prix: 180 },
  { nom: "SOMA", description: "Part of NERVANA. The tension you have stopped noticing.", minutes: 60, prix: 180 },
  // TRANSMISSION n'a pas d'Offer : elle n'est pas reservee, elle est demandee.
  { nom: "TRANSMISSION", description: "Part of NERVANA. By application only." },
  { nom: "Abhyanga", description: "Ayurvedic oil work, learned in India and practised in its old form.", minutes: 60, prix: 160 },
  { nom: "Marma", description: "Ayurvedic marma therapy, learned in India and practised in its old form.", minutes: 60, prix: 160 },
  { nom: "Reiki", description: "Hands resting on the body, or just above it, and held.", minutes: 60, prix: 130 },
  { nom: "Sound", description: "Bowls set on the body.", minutes: 60, prix: 140 },
];

function service(s: Salle) {
  return {
    "@type": "Service",
    name: s.nom,
    description: s.description,
    serviceType: s.nom,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Place", name: "Battersea, South West London" },
    ...(s.prix
      ? {
          offers: {
            "@type": "Offer",
            price: String(s.prix),
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    ...(s.minutes ? { termsOfService: `${s.minutes} minutes` } : {}),
  };
}

export const servicesEnCabinet = EN_CABINET.map(service);

/** Le coaching. La seule offre qui ne depend d'aucun lieu, et c'est un avantage. */
export const serviceCoaching = {
  "@type": "Service",
  name: "Coaching",
  description: "One to one on a call, wherever you are. The first call is free.",
  serviceType: "Coaching",
  provider: { "@id": ORG_ID },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${SITE}/coaching`,
    availableLanguage: "English",
  },
  offers: [
    { "@type": "Offer", name: "One conversation", price: "150", priceCurrency: "GBP" },
    { "@type": "Offer", name: "Six conversations", price: "780", priceCurrency: "GBP" },
  ],
};

/** L'ENSEIGNEMENT DU PREMIER DEGRE.
 *
 * `Course` et non `Service` : ce n'est pas un soin qu'on recoit, c'est une
 * transmission qu'on apprend, et schema.org distingue les deux. Google sait
 * lire `Course`, et personne d'autre sur le quartier ne le declare.
 *
 * CE QUI N'EST PAS DECLARE, ET POURQUOI. Le resultat enrichi « Course info »
 * de Google demande un `courseSchedule` ou un `courseWorkload`. Kilian
 * n'enseigne ni sur calendrier ni sur une duree annoncee — « in person, and
 * rarely ». Inventer un horaire pour decrocher un affichage serait mentir a
 * un moteur sur un fait, exactement ce que le `lastModified` du sitemap a
 * deja coute une fois. On declare ce qui est vrai, meme incomplet.
 *
 * `maximumAttendeeCapacity: 2` est un fait, pas une precaution : une
 * personne, ou deux qui viennent ensemble, jamais plus.
 */
export const enseignement = {
  "@type": "Course",
  "@id": `${SITE}/teaching#course`,
  name: "Usui Reiki, Level One",
  description:
    "Reiki level one, taught in person in Battersea, South West London, to one person or to two who come together. Taught by Kilian, a Reiki master and the eighth name in the line from Usui.",
  url: `${SITE}/teaching`,
  provider: { "@id": ORG_ID },
  inLanguage: "en-GB",
  educationalCredentialAwarded: "Usui Reiki, level one",
  teaches: [
    "The attunements of level one",
    "The hand positions, in their order",
    "Self practice, hands on your own body",
  ],
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "onsite",
    location: { "@type": "Place", name: "Battersea, South West London" },
    instructor: { "@id": PERSON_ID },
    maximumAttendeeCapacity: 2,
    inLanguage: "en-GB",
  },
  offers: [
    {
      "@type": "Offer", name: "One person", price: "450", priceCurrency: "GBP",
      availability: "https://schema.org/LimitedAvailability",
      url: `${SITE}/begin`,
    },
    {
      "@type": "Offer", name: "Two who come together, each", price: "350", priceCurrency: "GBP",
      availability: "https://schema.org/LimitedAvailability",
      url: `${SITE}/begin`,
    },
  ],
};

/** La page des questions pratiques.
 *
 * `QAPage` et NON `FAQPage`, et ce n'est pas une preference de style.
 * Google a restreint les resultats enrichis FAQ aux sites gouvernementaux et
 * de sante en aout 2023, puis les a SUPPRIMES POUR TOUS LES SITES le 7 mai
 * 2026. Baliser `FAQPage` aujourd'hui n'affiche plus rien, pour personne :
 * ce serait du culte du cargo.
 *
 * Ce qui est balise ici est seulement ce que la page EST — une page de
 * questions et de reponses — sans promettre un affichage qui n'existe plus.
 * Les questions elles-memes ne sont pas recopiees dans le graphe : elles sont
 * dans le HTML, lisibles, et la regle de ce fichier est de ne jamais dupliquer
 * ce que la page affiche deja sans gain mesurable.
 */
export const questions = {
  "@type": "QAPage",
  "@id": `${SITE}/questions#page`,
  url: `${SITE}/questions`,
  name: "What to expect, and what it costs",
  isPartOf: { "@id": ORG_ID },
  about: { "@id": ORG_ID },
  inLanguage: "en-GB",
};

/** Emballe un ou plusieurs noeuds dans un graphe unique. */
export function graphe(...noeuds: object[]) {
  return { "@context": "https://schema.org", "@graph": noeuds };
}
