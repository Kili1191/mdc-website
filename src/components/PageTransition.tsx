"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DURATION, EASE } from "@/lib/motion";

// Transitions liquides entre routes — sans rechargement visuel.
// 1. À l'entrée d'une nouvelle route (change de pathname) : le contenu
//    monte avec opacity 0 → 1 + léger translateY, sur ~700ms.
// 2. À la sortie : on intercepte les clics sur les <a> internes, on
//    lance une phase "leaving" (fade out ~450ms), puis router.push.
// 3. Un voile parchemin radial en fondu accompagne la transition —
//    donne l'impression que la matière absorbe la page et révèle
//    la suivante.
//
// Le marbre (SiteMarble) reste monté ; c'est SiteMarble qui swap le
// motif sur pathname — ce composant s'occupe uniquement du contenu
// et du voile.

const LEAVE_MS = DURATION.exit;
const ENTER_MS = DURATION.reveal;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [entered, setEntered] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fade in à chaque changement de pathname
  useEffect(() => {
    setLeaving(false);
    setEntered(false);
    const t = window.setTimeout(() => setEntered(true), 30);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Intercepteur global de clics sur les <a> internes
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;                    // click gauche seul
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab, etc.
      const target = e.target as Element | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      // même origine ?
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // même route (juste ancre / query) : laisse le navigateur
      if (url.pathname === window.location.pathname && url.hash) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      e.preventDefault();
      setLeaving(true);
      const dest = url.pathname + url.search + url.hash;
      window.setTimeout(() => router.push(dest), LEAVE_MS);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  // ATTENTION — ce wrapper porte `transform` et `will-change: transform` en
  // permanence, y compris au repos. Les deux creent un bloc conteneur : tout
  // descendant `position: fixed` se dimensionne alors sur CE div (hauteur du
  // document) et non sur le viewport, et il scrolle avec la page.
  //
  // Une couche plein ecran rendue depuis une page doit donc passer par un
  // portal sur <body>, pas par `position: fixed` seul.
  const contentStyle: React.CSSProperties = {
    opacity: leaving ? 0 : entered ? 1 : 0,
    transform: leaving
      ? "translateY(-8px)"
      : entered
      ? "translateY(0)"
      : "translateY(12px)",
    transition: leaving
      ? `opacity ${LEAVE_MS}ms ${EASE.exit}, transform ${LEAVE_MS}ms ${EASE.exit}`
      : `opacity ${ENTER_MS}ms ${EASE.reveal} 60ms, transform ${ENTER_MS}ms ${EASE.reveal} 60ms`,
    willChange: "opacity, transform",
  };

  // Voile radial qui absorbe/révèle — pointer-events:none, non intrusif.
  const veilStyle: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 80,
    pointerEvents: "none",
    background:
      "radial-gradient(120% 90% at 50% 55%, rgba(237,228,208,0.55) 0%, rgba(237,228,208,0) 65%)",
    opacity: leaving ? 1 : 0,
    transition: `opacity ${LEAVE_MS}ms ${EASE.exit}`,
    willChange: "opacity",
  };

  return (
    <>
      <div style={veilStyle} aria-hidden />
      <div ref={contentRef} style={contentStyle}>
        {children}
      </div>
    </>
  );
}
