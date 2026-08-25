import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/test-site", "/effects"] },
    ],
    sitemap: "https://maisonducalme.com/sitemap.xml",
    host: "https://maisonducalme.com",
  };
}
