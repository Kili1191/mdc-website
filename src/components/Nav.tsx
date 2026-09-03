"use client";

// LE SEUIL — la nav d'une maison, pas d'un site.
//
// CE QU'ELLE ETAIT. Sept liens en capitales espacees, alignes en haut a
// droite. C'est la barre de mille sites de luxe : un jury en voit deux cents
// par saison. Elle avait deja la bonne MECANIQUE — elle se retirait au scroll
// vers le bas, revenait au scroll vers le haut, au curseur en haut d'ecran ou
// a Escape, exactement ce que demande le §4 de VISION.md. Ce qui n'allait pas
// n'etait pas son comportement, c'etait sa FORME.
//
// CE QU'ELLE EST. Deux marques, et rien d'autre :
//   — la maison, en haut a gauche : le retour a l'accueil ;
//   — Begin, en haut a droite : l'invitation, jamais cachee.
// Le reste vit derriere un seul mot, Index, qui ouvre un seuil : les pieces
// gravees dans la pierre, numerotees, en grand. Une maison montre un
// monogramme et une invitation, pas un menu.
//
// POURQUOI BEGIN RESTE DEHORS. C'est le seul chemin de conversion du site.
// Une nav qui cache son unique appel gagne en silence et perd en usage — et
// le §5 demande l'inverse : « le vrai luxe ne demande pas, il invite ».
//
// CE QUE CA REPARE, EN PLUS DE LA FORME. Le clavier tombait sur seize arrets
// pour huit destinations : les huit liens invisibles de SeoNav, puis les huit
// de la nav — et il continuait d'entrer dans la nav pendant qu'elle etait
// repliee et marquee aria-hidden. Un utilisateur au clavier suivait un focus
// qu'il ne voyait pas. SeoNav se retire maintenant a l'hydratation (§4 : le
// repli est masque une fois le site pret), et le seuil replie ne laisse plus
// aucun arret.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { COLORS, FONTS } from "@/styles/tokens";
import { useIntroReady } from "@/lib/introReady";
import { DURATION, EASE } from "@/lib/motion";

const PIECES = [
  { label: "Sessions", href: "/sessions", note: "In the room" },
  { label: "Coaching", href: "/coaching", note: "On a call" },
  { label: "Retreats", href: "/retreats", note: "Away" },
  { label: "Practitioner", href: "/practitioner", note: "Who receives you" },
  { label: "The Work", href: "/the-work", note: "What it does" },
  { label: "Notes", href: "/notes", note: "In writing" },
];

const EDGE_PX = 80;         // bande haute qui rappelle le seuil au survol
const AUTO_HIDE_MS = 2500;
const SCROLL_HYSTERESIS = 6;

export default function Nav() {
  const ready = useIntroReady();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [ouvert, setOuvert] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimer = useRef<number | null>(null);
  const panneauRef = useRef<HTMLDivElement | null>(null);
  const declencheurRef = useRef<HTMLButtonElement | null>(null);

  // Le repli SEO sort du parcours au clavier des que le vrai seuil existe :
  // sinon chaque destination compte deux arrets. Il reste dans le HTML servi,
  // donc les robots et le sans-JS le voient toujours.
  useEffect(() => {
    if (!ready) return;
    const repli = document.querySelector<HTMLElement>('nav[aria-label="Site"]');
    if (repli) repli.hidden = true;
    return () => { if (repli) repli.hidden = false; };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    const scheduleHide = (ms: number) => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), ms);
    };
    const cancelHide = () => {
      if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null; }
    };

    const onScroll = () => {
      if (ouvert) return;            // le seuil ouvert ne se derobe pas
      const y = window.scrollY;
      const dy = y - lastScrollY.current;
      lastScrollY.current = y;
      if (y < EDGE_PX) { cancelHide(); setVisible(true); return; }
      if (dy < -SCROLL_HYSTERESIS) { setVisible(true); scheduleHide(AUTO_HIDE_MS); }
      else if (dy > SCROLL_HYSTERESIS) { cancelHide(); setVisible(false); }
    };
    const onMove = (e: MouseEvent) => {
      if (!ouvert && e.clientY < EDGE_PX) { setVisible(true); scheduleHide(AUTO_HIDE_MS); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Escape ferme le seuil s'il est ouvert ; sinon il bascule la barre,
      // comme avant. Une seule touche, deux sens selon l'etat.
      if (ouvert) { setOuvert(false); declencheurRef.current?.focus(); }
      else setVisible((v) => !v);
    };

    lastScrollY.current = window.scrollY;
    if (window.scrollY >= EDGE_PX && !ouvert) scheduleHide(AUTO_HIDE_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [ready, ouvert]);

  // Seuil ouvert : le focus reste dedans, et le fond ne defile pas sous lui.
  useEffect(() => {
    if (!ouvert) return;
    const panneau = panneauRef.current;
    panneau?.querySelector<HTMLElement>("a")?.focus();
    const precedent = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const piege = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panneau) return;
      const cibles = [...panneau.querySelectorAll<HTMLElement>("a, button")];
      if (!cibles.length) return;
      const premier = cibles[0], dernier = cibles[cibles.length - 1];
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    };
    window.addEventListener("keydown", piege);
    return () => {
      window.removeEventListener("keydown", piege);
      document.body.style.overflow = precedent;
    };
  }, [ouvert]);

  if (!ready) return null;

  const replie = !visible && !ouvert;

  return (
    <>
      <style>{`
        .mdc-seuil{
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; justify-content:space-between; align-items:center;
          padding:22px 48px; pointer-events:none;
          transition:transform ${DURATION.reveal}ms ${EASE.reveal},
                     opacity ${DURATION.exit}ms ${EASE.exit};
        }
        .mdc-seuil > *{ pointer-events:auto; }
        .mdc-seuil.est-replie{ transform:translateY(-110%); opacity:0; }
        .mdc-seuil.est-replie > *{ pointer-events:none; }

        .mdc-seuil__marque{ display:flex; align-items:center; gap:12px; text-decoration:none; }
        .mdc-seuil__mot{
          font-family:${FONTS.higuen}; font-size:15px; letter-spacing:0.22em;
          color:${COLORS.brouFonce};
        }
        .mdc-seuil__droite{ display:flex; align-items:center; gap:30px; }

        /* Index et Begin partagent la meme graisse : ni l'un ni l'autre ne
           domine. Seul le filet rouille sous Begin dit lequel est l'appel. */
        .mdc-seuil__index, .mdc-seuil__begin{
          font-family:${FONTS.prata}; font-size:12px; letter-spacing:0.14em;
          text-transform:uppercase; color:${COLORS.brou};
          text-decoration:none; background:none; border:0; cursor:pointer;
          padding:8px 2px; margin:-8px -2px;
        }
        .mdc-seuil__begin{ border-bottom:1px solid ${COLORS.rouille}; padding-bottom:3px; }
        .mdc-seuil__index{ opacity:0.82; }
        .mdc-seuil__index:hover, .mdc-seuil__index:focus-visible{ opacity:1; }

        /* LE PANNEAU. Le marbre reste visible dessous : on n'entre pas dans
           un autre site, on ouvre une porte du meme. */
        .mdc-porte{
          position:fixed; inset:0; z-index:120;
          background:rgba(237,228,208,0.90);
          backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
          display:flex; align-items:center;
          padding:0 clamp(28px, 9vw, 150px);
          animation:mdc-porte-ouvre ${DURATION.reveal}ms ${EASE.reveal} both;
        }
        @keyframes mdc-porte-ouvre{ from{ opacity:0 } to{ opacity:1 } }

        /* 1180 px, la largeur de contenu du reste du site : a 900 l'index
           laissait un tiers droit mort et ne s'alignait sur aucune autre
           page. Les notes se calent donc sur la meme colonne que le texte
           courant. */
        .mdc-porte__liste{ list-style:none; margin:0; padding:0; width:100%; max-width:1180px; }
        .mdc-porte__ligne{ border-top:1px solid ${COLORS.taupeTrait}; }
        .mdc-porte__ligne:last-child{ border-bottom:1px solid ${COLORS.taupeTrait}; }
        .mdc-porte__lien{
          display:flex; align-items:baseline; gap:clamp(14px, 3vw, 40px);
          text-decoration:none; padding:clamp(14px, 2.2vh, 26px) 0;
        }
        .mdc-porte__n{
          font-family:${FONTS.prata}; font-size:11px; letter-spacing:0.2em;
          color:${COLORS.brou}; opacity:0.55; flex:none; width:2.5em;
        }
        /* Le nom ne prend PAS toute la place restante : flex:1 l'etirait a
           685 px pour un mot de 245, et le sillon grave de .mdc-here — qui
           court d'un bord a l'autre de son element — depassait donc de
           440 px au-dela de la derniere lettre. Un burin s'arrete au mot.
           C'est margin-right:auto qui pousse la note a droite, pas le nom. */
        .mdc-porte__nom{
          font-family:${FONTS.higuen}; font-size:clamp(28px, 5vw, 58px);
          line-height:1; color:${COLORS.brouFonce};
          flex:0 1 auto; margin-right:auto;
          transition:transform ${DURATION.exit}ms ${EASE.reveal};
        }
        .mdc-porte__lien:hover .mdc-porte__nom,
        .mdc-porte__lien:focus-visible .mdc-porte__nom{ transform:translateX(14px); }
        .mdc-porte__note{
          font-family:${FONTS.prata}; font-size:12px; letter-spacing:0.14em;
          text-transform:uppercase; color:${COLORS.brou}; opacity:0.7;
          flex:none; text-align:right;
        }
        /* La piece ou l'on est deja se GRAVE — le coup de burin que Kilian a
           demande. Il ne se refait pas ici : c'est .mdc-here, dans
           globals.css, avec son sillon en coupe et son balayage de 700 ms.
           Il n'avait plus de consommateur depuis que la barre de sept liens
           a disparu, et il jouait sur des mots de 12 px ou Kilian trouvait,
           a juste titre, que ca ne ressemblait pas a une gravure. Ici le mot
           fait jusqu'a 58 px : le sillon a enfin la place d'etre vu. */
        .mdc-porte__fermer{
          position:absolute; top:22px; right:48px;
          font-family:${FONTS.prata}; font-size:12px; letter-spacing:0.14em;
          text-transform:uppercase; color:${COLORS.brou};
          background:none; border:0; cursor:pointer; padding:8px;
        }

        @media (max-width: 720px){
          .mdc-seuil{ padding:16px 20px; }
          .mdc-seuil__mot{ display:none; }
          .mdc-seuil__droite{ gap:20px; }
          .mdc-porte__fermer{ right:20px; }
          .mdc-porte__note{ display:none; }
        }
        @media (prefers-reduced-motion: reduce){
          .mdc-porte{ animation:none; }
          .mdc-porte__nom{ transition:none; }
        }
      `}</style>

      <nav className={`mdc-seuil${replie ? " est-replie" : ""}`} aria-label="Maison du Calme">
        <a href="/" className="mdc-seuil__marque" aria-label="Maison du Calme, accueil"
           tabIndex={replie ? -1 : 0}>
          <img src="/logo.png" alt="" style={{ height: 30, width: "auto", display: "block" }} />
          <span className="mdc-seuil__mot">MAISON DU CALME</span>
        </a>
        <div className="mdc-seuil__droite">
          <button
            ref={declencheurRef}
            type="button"
            className="mdc-seuil__index"
            aria-expanded={ouvert}
            aria-haspopup="dialog"
            onClick={() => { setOuvert(true); setVisible(true); }}
            tabIndex={replie ? -1 : 0}
          >
            Index
          </button>
          <a href="/begin" className="mdc-seuil__begin" tabIndex={replie ? -1 : 0}>Begin</a>
        </div>
      </nav>

      {ouvert && (
        <div
          className="mdc-porte"
          role="dialog"
          aria-modal="true"
          aria-label="Index"
          ref={panneauRef}
          onClick={(e) => { if (e.target === e.currentTarget) setOuvert(false); }}
        >
          <ol className="mdc-porte__liste">
            {PIECES.map((p, i) => (
              <li key={p.href} className="mdc-porte__ligne">
                <a
                  href={p.href}
                  className="mdc-porte__lien"
                  aria-current={pathname === p.href ? "page" : undefined}
                >
                  <span className="mdc-porte__n" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <span className={`mdc-porte__nom${pathname === p.href ? " mdc-here" : ""}`}>
                    {p.label}
                  </span>
                  <span className="mdc-porte__note" aria-hidden>{p.note}</span>
                </a>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="mdc-porte__fermer"
            onClick={() => { setOuvert(false); declencheurRef.current?.focus(); }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
