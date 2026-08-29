"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DURATION, EASE } from "@/lib/motion";
import { traverse } from "@/lib/traverse";

// Traverser la pierre — DIRECTION.md : « un changement de route n'est pas un
// fondu : la camera se deplace sur une meme dalle et la marque de la
// destination s'y grave a l'arrivee ».
//
// Trois choses se produisent au meme instant, et c'est leur simultaneite qui
// fait la traversee :
//
//   1. la dalle glisse       — `traverse` deplace la camera vers la coordonnee
//                              de la destination, des le clic, avant meme que
//                              le contenu ne parte ;
//   2. le contenu se croise  — l'ancienne page sort a contre-sens de la camera,
//                              la nouvelle entre du cote vers lequel on va ;
//   3. la marque se grave    — l'eyebrow de la page porte `view-transition-name:
//                              mdc-mark`, donc le navigateur fait GLISSER le nom
//                              de l'ancienne page vers celui de la nouvelle au
//                              lieu de les faire disparaitre l'un apres l'autre.
//
// Le point 3 passe par la View Transitions API, native depuis Safari 26 : le
// morph est calcule par le compositeur, pas par du JavaScript de frame. Quand
// elle manque — ou que `prefers-reduced-motion` est demande — on retombe sur
// le fondu manuel d'avant, qui reste correct.
//
// Ce que ca coute, mesure sur le build de production : entre le clic et le
// debut des animations, le navigateur affiche l'instantane fige de l'ancienne
// page pendant 218 a 333 ms — marbre compris. C'est le seul moment du site ou
// la pierre s'arrete. La camera, elle, est deja partie : sur les 1375 ms du
// trajet, la courbe n'a franchi que 10 % pendant le gel, donc plus de 90 % du
// deplacement se voit.
//
// Le prefetch des routes au survol a ete essaye pour raccourcir ce gel : sans
// effet mesurable (222 ms contre 215 ms), les pages etant deja prerendues et
// leur payload inline. Retire plutot que garde "au cas ou".
//
// ATTENTION : le voile radial d'origine a ete retire. Il annoncait un
// changement sans rien dire de sa direction ; maintenant que le mouvement a un
// sens, un flash au centre le contredisait.

const LEAVE_MS = DURATION.exit;
const ENTER_MS = DURATION.reveal;
// Filet de securite. Pendant une view transition le navigateur affiche
// l'instantane de l'ancienne page jusqu'a ce que la promesse se resolve : une
// route lente paraitrait donc figee. Passe ce delai on rend la main.
const VT_TIMEOUT_MS = 1200;

type VTDocument = Document & {
  startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> };
};

function canTraverse(): boolean {
  if (typeof document === "undefined") return false;
  if (typeof (document as VTDocument).startViewTransition !== "function") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [entered, setEntered] = useState(false);
  // Vrai une fois la premiere arrivee jouee ET le navigateur capable de
  // traverser : le wrapper peut alors se vider de tout style.
  const [settled, setSettled] = useState(false);
  const [vt, setVt] = useState(false);
  const arrived = useRef<(() => void) | null>(null);
  const heading = useRef({ x: 0, y: 1 });
  const first = useRef(true);

  // La premiere arrivee est jouee par tout le monde, y compris les
  // navigateurs qui savent traverser : on n'entre pas sur le site par une
  // traversee, on y arrive. Ensuite seulement le wrapper se vide.
  useEffect(() => {
    setVt(canTraverse());
    if (!canTraverse()) return;
    const t = window.setTimeout(() => setSettled(true), ENTER_MS + 120);
    return () => window.clearTimeout(t);
  }, []);

  // Se poser sur la dalle au premier rendu, sans trajet : on n'a traverse
  // aucune piece pour arriver ici, on y est ne.
  useEffect(() => { traverse.jump(window.location.pathname); }, []);

  useEffect(() => {
    // Fin de traversee : la nouvelle route est montee, la view transition
    // peut jouer.
    if (arrived.current) { arrived.current(); arrived.current = null; }

    // Retour navigateur, lien externe au site, ancre : le clic n'est pas passe
    // par l'intercepteur, la camera doit rejoindre la page quand meme.
    traverse.to(pathname);

    // Le tout premier rendu n'est pas une traversee : personne n'a clique, il
    // n'y a pas d'ancienne page a croiser. On joue donc l'arrivee a la main,
    // meme sur un navigateur qui sait traverser. Sans cette distinction le
    // contenu restait a opacite zero jusqu'a `settled`, puis apparaissait d'un
    // bloc — le contraire d'une arrivee.
    const initial = first.current;
    first.current = false;
    if (!initial && canTraverse()) return;   // le navigateur anime, rien a faire ici
    setLeaving(false);
    setEntered(false);
    const t = window.setTimeout(() => setEntered(true), 30);
    return () => window.clearTimeout(t);
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

      // Le sens du trajet, donne au CSS. Les deux pages s'en servent en
      // opposition : c'est ce qui distingue un deplacement d'un fondu.
      traverse.heading(url.pathname, heading.current);
      const root = document.documentElement;
      root.style.setProperty("--mdc-dx", String(heading.current.x.toFixed(3)));
      root.style.setProperty("--mdc-dy", String(heading.current.y.toFixed(3)));

      // La pierre part au clic, pas a l'arrivee du contenu. C'est le seul
      // ordre qui donne l'impression d'avoir decide d'aller quelque part.
      traverse.to(url.pathname);

      const doc = document as VTDocument;
      if (canTraverse() && doc.startViewTransition) {
        doc.startViewTransition(() => new Promise<void>((resolve) => {
          let done = false;
          const finish = () => { if (!done) { done = true; resolve(); } };
          arrived.current = finish;
          window.setTimeout(finish, VT_TIMEOUT_MS);
          router.push(dest);
        }));
        return;
      }

      setLeaving(true);
      window.setTimeout(() => router.push(dest), LEAVE_MS);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  // Quand le navigateur sait traverser, ce wrapper ne porte plus rien.
  //
  // Il portait `transform` et `will-change: transform` en PERMANENCE, y compris
  // au repos. Les deux creent un bloc conteneur : tout descendant
  // `position: fixed` se dimensionnait alors sur CE div — hauteur du document —
  // au lieu du viewport, et scrollait avec la page. C'est ce qui avait donne
  // une maison six fois trop grande sur un canvas de 1440x5400.
  //
  // Le piege ne disparait que pour les navigateurs qui animent nativement.
  // Ailleurs il tient toujours : une couche plein ecran rendue depuis une page
  // doit passer par un portal sur <body>, jamais par `position: fixed` seul.
  const contentStyle: React.CSSProperties = vt && settled
    ? {}
    : {
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

  return <div style={contentStyle}>{children}</div>;
}
