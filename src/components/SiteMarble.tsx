"use client";

import { usePathname } from "next/navigation";
import { useIntroReady } from "@/lib/introReady";
import MarbleBackground from "@/components/MarbleBackground";

// Choix du motif par page (VISION §3 : arc émotionnel — la matière varie).
// Défaut compo, bodhi pour les pages plus "intimes".
const MOTIF_BY_PATH: Record<string, string> = {
  "/practitioner": "/motif-bodhi.jpg",
  "/lineage": "/motif-bodhi.jpg",
  "/the-work": "/motif-bodhi.jpg",
};

// Couche marbre unique, montée dans layout.tsx derrière chaque page.
// - Home ("/") : sautée, l'AlbatreHero (avec ses panels + scroll) gère le fond.
// - Pages internes : marbre CALME (uEffectScale réduit — VISION §1).
// - Gated on useIntroReady() pour ne pas initialiser WebGL pendant l'intro.
export default function SiteMarble() {
  const ready = useIntroReady();
  const pathname = usePathname();
  if (!ready) return null;
  if (pathname === "/") return null;
  const motif = MOTIF_BY_PATH[pathname] ?? "/motif-compo.jpg";
  return <MarbleBackground motif={motif} calme />;
}
