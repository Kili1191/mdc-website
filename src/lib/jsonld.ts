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

/** Emballe un ou plusieurs noeuds dans un graphe unique. */
export function graphe(...noeuds: object[]) {
  return { "@context": "https://schema.org", "@graph": noeuds };
}
