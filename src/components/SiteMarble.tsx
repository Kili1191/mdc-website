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

// Couche marbre unique, montée dans layout.tsx, fond persistant de TOUT
// le site (VISION §1 + directive Awwwards : "le site entier vit dans le
// marbre").
// - Home ("/") : marbre INTERACTIF (calme=false)
// - Autres pages : marbre CALME (uEffectScale réduit pour la lisibilité)
// - Gated on useIntroReady() pour ne pas initialiser WebGL pendant l'intro.
export default function SiteMarble() {
  const ready = useIntroReady();
  const pathname = usePathname();
  if (!ready) return null;
  const motif = MOTIF_BY_PATH[pathname] ?? "/motif-compo.jpg";
  const isHome = pathname === "/";
  return <MarbleBackground motif={motif} calme={!isHome} />;
}
