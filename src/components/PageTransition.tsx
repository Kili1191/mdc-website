"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DURATION, EASE } from "@/lib/motion";
import { traverse } from "@/lib/traverse";

// Traverser la pierre — DIRECTION.md : « un changement de route n'est pas un
// fondu : la camera se deplace sur une meme dalle ».
//
// Deux choses se produisent ensemble, et c'est leur simultaneite qui fait la
// traversee :
//
//   1. la dalle glisse      — `traverse` deplace la camera vers la coordonnee
//                             de la destination, des le clic, avant meme que
//                             le contenu ne parte ;
//   2. le contenu se croise — l'ancienne page sort A CONTRE-SENS de la camera,
//                             la nouvelle entre du cote vers lequel on va. Si
//                             les deux partaient du meme cote, le deplacement
//                             se lirait comme un fondu de plus.
//
// LE MARBRE NE PARTICIPE PAS. Jamais. C'est la regle qui a coute le plus cher
// a apprendre ici.
//
// La View Transitions API avait ete cablee pour ce composant : elle permettait
// de faire GLISSER le nom de la page d'une position a l'autre, nativement, par
// le compositeur. Elle a ete retiree.
//
// Raison, mesuree en gelant la transition a un instant choisi puis en
// photographiant : pendant toute la traversee, le marbre n'etait plus a
// l'ecran. Une view transition remplace la page par des instantanes, et un
// canvas WebGL ne survit pas a l'instantane — l'ecran retombait sur le fond
// parchemin plat, avec deux copies fantomes du logo qui se croisaient dessus.
// Contraste global de l'image : 12,13 au depart, 7,75 au milieu de la
// transition. Donner au marbre son propre `view-transition-name` n'y changeait
// rien de mesurable (8,60 contre 7,75).
//
// Le morph du nom etait une jolie chose. Un fond qui disparait est un defaut.
// On garde donc le fond : ici tout est anime sur le wrapper de contenu, en
// CSS, et la pierre continue de vivre dessous sans jamais etre capturee.

const LEAVE_MS = DURATION.exit;
const ENTER_MS = DURATION.reveal;

// De combien les deux pages se croisent. Un deplacement, pas un carrousel :
// assez pour donner un sens, trop peu pour qu'on lise une diapositive.
const SHIFT_PX = 34;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [entered, setEntered] = useState(false);
  // Vrai une fois l'arrivee jouee : le wrapper se vide alors de tout style,
  // et le piege du bloc conteneur disparait jusqu'a la prochaine traversee.
  const [settled, setSettled] = useState(false);
  // Sens du trajet, fige au clic. On le garde pendant toute la traversee :
  // l'entree doit repondre a la sortie, donc les deux lisent le meme vecteur.
  const [dir, setDir] = useState({ x: 0, y: 1 });
  const heading = useRef({ x: 0, y: 1 });

  // Se poser sur la dalle au premier rendu, sans trajet : on n'a traverse
  // aucune piece pour arriver ici, on y est ne.
  useEffect(() => { traverse.jump(window.location.pathname); }, []);

  useEffect(() => {
    // Retour navigateur, lien externe au site, ancre : le clic n'est pas passe
    // par l'intercepteur, la camera doit rejoindre la page quand meme.
    traverse.to(pathname);
    setLeaving(false);
    setEntered(false);
    setSettled(false);
    const t = window.setTimeout(() => setEntered(true), 30);
    const u = window.setTimeout(() => setSettled(true), 30 + 60 + ENTER_MS + 60);
    return () => { window.clearTimeout(t); window.clearTimeout(u); };
  }, [pathname]);

  // Intercepteur global de clics sur les <a> internes.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;                                   // clic gauche seul
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nouvel onglet, etc.
      const target = e.target as Element | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      e.preventDefault();
      const dest = url.pathname + url.search + url.hash;

      traverse.heading(url.pathname, heading.current);
      // Sous `prefers-reduced-motion`, le croisement devient un fondu pur :
      // le sens du trajet reste vrai, il n'est simplement plus joue.
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setDir(still ? { x: 0, y: 0 } : { x: heading.current.x, y: heading.current.y });

      // La pierre part au clic, pas a l'arrivee du contenu. C'est le seul
      // ordre qui donne l'impression d'avoir decide d'aller quelque part.
      traverse.to(url.pathname);

      setSettled(false);
      setLeaving(true);
      window.setTimeout(() => router.push(dest), LEAVE_MS);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  // On sort du cote d'ou l'on vient, on entre du cote ou l'on va.
  const out = `translate(${(-dir.x * SHIFT_PX).toFixed(1)}px, ${(-dir.y * SHIFT_PX).toFixed(1)}px)`;
  const in0 = `translate(${(dir.x * SHIFT_PX * 0.8).toFixed(1)}px, ${(dir.y * SHIFT_PX * 0.8).toFixed(1)}px)`;

  // ATTENTION — ce wrapper ne porte `transform` et `will-change` que PENDANT
  // un mouvement, et rien du tout au repos.
  //
  // Les deux creent un bloc conteneur : tout descendant `position: fixed` se
  // dimensionne alors sur CE div — hauteur du document — au lieu du viewport,
  // et scrolle avec la page. Portes en permanence, comme avant, ils avaient
  // donne une maison six fois trop grande sur un canvas de 1440x5400.
  //
  // Le piege existe donc encore, mais seulement pendant les 450 a 900 ms d'une
  // traversee. Une couche plein ecran rendue depuis une page doit toujours
  // passer par un portal sur <body>, jamais par `position: fixed` seul.
  const moving = leaving || !entered;
  const contentStyle: React.CSSProperties = settled && !leaving
    ? {}
    : moving
    ? {
        opacity: 0,
        transform: leaving ? out : in0,
        transition: leaving
          ? `opacity ${LEAVE_MS}ms ${EASE.exit}, transform ${LEAVE_MS}ms ${EASE.exit}`
          : "none",
        willChange: "opacity, transform",
      }
    : {
        opacity: 1,
        transform: "translate(0px, 0px)",
        transition: `opacity ${ENTER_MS}ms ${EASE.reveal} 60ms, transform ${ENTER_MS}ms ${EASE.reveal} 60ms`,
        willChange: "opacity, transform",
      };

  return <div style={contentStyle}>{children}</div>;
}
