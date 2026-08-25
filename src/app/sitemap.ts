import type { MetadataRoute } from "next";

const BASE = "https://maisonducalme.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/sessions",
    "/practitioner",
    "/lineage",
    "/retreats",
    "/the-work",
    "/notes",
    "/begin",
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
