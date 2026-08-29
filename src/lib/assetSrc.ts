"use client";

import { useEffect, useState } from "react";

// Resolution d'un asset : la vraie photo si elle existe, sinon l'atmosphere
// Aube Encens generee par scripts/generate_atmospheres.py.
//
// Une seule regle, partagee par tous les composants qui affichent un slot
// (AssetFrame, ScrollDriftGallery). Sans elle, chaque composant decidait dans
// son coin : AssetFrame retombait proprement, les galeries pointaient droit
// sur /photos/si-01.jpg et affichaient des images cassees.

export function atmosphereFor(src: string): string | null {
  const m = /^\/photos\/([a-z0-9-]+)\.(jpg|jpeg|png|webp)$/i.exec(src);
  return m ? `/photos/atmosphere/${m[1]}.jpg` : null;
}

// Renvoie l'URL a afficher, ou null tant qu'on ne sait pas encore.
export function useResolvedAsset(src: string): string | null {
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fallback = atmosphereFor(src);
    fetch(src, { method: "HEAD" })
      .then((r) => { if (!cancelled) setResolved(r.ok ? src : fallback); })
      .catch(() => { if (!cancelled) setResolved(fallback); });
    return () => { cancelled = true; };
  }, [src]);

  return resolved;
}
