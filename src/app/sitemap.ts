import type { MetadataRoute } from "next";

const BASE = "https://maisonducalme.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/sessions",
    "/practitioner",
    "/retreats",
    "/coaching",
    "/the-work",
    "/notes",
    "/begin",
  ];
  // Pas de `lastModified`.
  //
  // Il valait `new Date()`, donc CHAQUE page se declarait modifiee a l'instant,
  // a chaque deploiement, y compris celles qui n'avaient pas bouge depuis des
  // mois. C'est un faux signal de fraicheur, et un crawler qui le constate
  // apprend a ne plus faire confiance au sitemap entier. Mieux vaut ne rien
  // dire que dire faux : sans le champ, Google se fie a ses propres releves.
  //
  // Le jour ou une date reelle par page existe (essais dates sur /notes, ou
  // date du dernier commit touchant le fichier), elle peut revenir ici.
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
