"use client";

// LA DESCENTE — la regle gravee dans la marge.
//
// POURQUOI ELLE EXISTE. L'accueil enchainait six stations composees a
// l'identique : un grand italique centre, un paragraphe centre, et rien
// d'autre. Six ecrans qui se ressemblent ne racontent pas une descente, ils
// donnent l'impression de ne pas avancer — et c'est ce qui fait qu'un site
// tres soigne peut quand meme paraitre plat. Il manquait un point fixe : une
// chose qui reste a l'ecran, qui dit ou l'on est, et qui change pendant que
// le reste passe.
//
// CE QUE C'EST. Une regle gravee dans le marbre, dans la marge gauche. Un
// sillon vertical, un cran par station, le cran courant creuse et nomme. Ce
// n'est pas une barre de progression : une barre mesure un chargement, une
// regle mesure une profondeur. La maison est un concept, on y descend.
//
// ET C'EST AUSSI LA NAVIGATION. Chaque cran est un vrai lien d'ancrage, avec
// son nom pour les lecteurs d'ecran. Un element qui ne fait que decorer coute
// des points ; celui-la sert. C'est la reponse la plus directe au §5 de
// VISION.md — tout doit etre atteignable en moins de deux clics.

import { useEffect, useRef, useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";
import { DURATION, EASE } from "@/lib/motion";

type Cran = { id: string; nom: string };

export default function Descente() {
  const [crans, setCrans] = useState<Cran[]>([]);
  const [actif, setActif] = useState(0);
  const boitesRef = useRef<{ id: string; haut: number; bas: number }[]>([]);

  // Les stations se declarent elles-memes. Le composant ne connait pas la
  // page : on peut en ajouter une sans revenir ici.
  useEffect(() => {
    // L'accueil ne rend ses stations qu'une fois pret (`if (!ready) return
    // null`). Un scan unique au montage arrive donc AVANT elles et ne trouve
    // rien — la regle ne s'affichait pas du tout. On observe jusqu'a ce
    // qu'elles existent, puis on arrete d'observer.
    let noeuds: HTMLElement[] = [];
    let mo: MutationObserver | null = null;

    const scanner = () => {
      const trouves = [...document.querySelectorAll<HTMLElement>("[data-station]")];
      if (trouves.length < 2) return false;
      noeuds = trouves;
      setCrans(trouves.map((n) => ({ id: n.id, nom: n.dataset.station ?? "" })));
      return true;
    };

    if (!scanner()) {
      mo = new MutationObserver(() => {
        if (scanner()) { mo?.disconnect(); mo = null; mesurer(); suivre(); }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    const mesurer = () => {
      boitesRef.current = noeuds.map((n) => {
        const r = n.getBoundingClientRect();
        const haut = r.top + window.scrollY;
        return { id: n.id, haut, bas: haut + r.height };
      });
    };
    mesurer();

    // La station active est celle qui occupe le milieu de l'ecran — pas celle
    // qui commence le plus haut. C'est le regard qui decide, pas le DOM.
    let raf = 0;
    const suivre = () => {
      raf = 0;
      const milieu = window.scrollY + window.innerHeight / 2;
      const i = boitesRef.current.findIndex((b) => milieu >= b.haut && milieu < b.bas);
      if (i >= 0) setActif(i);
    };
    const planifier = () => { if (!raf) raf = requestAnimationFrame(suivre); };

    suivre();
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", () => { mesurer(); planifier(); });
    return () => {
      window.removeEventListener("scroll", planifier);
      if (raf) cancelAnimationFrame(raf);
      mo?.disconnect();
    };
  }, []);

  if (crans.length < 2) return null;

  return (
    <nav className="mdc-descente" aria-label="Descente">
      <span className="mdc-descente__sillon" aria-hidden />
      <ol className="mdc-descente__crans">
        {crans.map((c, i) => (
          // Les crans se repartissent sur toute la hauteur du sillon plutot
          // que de s'empiler a 22px : une regle se lit sur sa longueur. Empiles,
          // ils formaient un petit paquet timide au milieu de l'ecran ; etires,
          // ils donnent l'echelle de la descente.
          <li key={c.id} style={{ top: `${(i / (crans.length - 1)) * 100}%` }}>
            <a
              href={`#${c.id}`}
              className={`mdc-descente__cran${i === actif ? " est-ici" : ""}`}
              aria-current={i === actif ? "true" : undefined}
              aria-label={`${String(i + 1).padStart(2, "0")} — ${c.nom}`}
            >
              <span className="mdc-descente__trait" aria-hidden />
              <span className="mdc-descente__nom" aria-hidden>{c.nom}</span>
            </a>
          </li>
        ))}
      </ol>
      {/* La profondeur, en chiffres. Elle ne remplace pas le nom : elle donne
          l'echelle — on sait combien il reste. */}
      <span className="mdc-descente__fond" aria-hidden>
        {String(actif + 1).padStart(2, "0")}
        <i>/{String(crans.length).padStart(2, "0")}</i>
      </span>
      <style>{`
        .mdc-descente{
          position:fixed; left:30px; top:50%; transform:translateY(-50%);
          z-index:60; display:flex; align-items:stretch; gap:14px;
          height:min(62vh, 520px); pointer-events:auto;
        }
        /* Le sillon : un trait sombre et sa levre claire, comme une gravure
           eclairee d'en haut a gauche — la meme lumiere que le marbre. */
        .mdc-descente__sillon{
          width:2px; border-radius:1px; flex:none;
          background:linear-gradient(to right,
            rgba(47,37,25,0.42) 0px, rgba(47,37,25,0.42) 1px,
            rgba(255,251,241,0.66) 1px, rgba(255,251,241,0.66) 2px);
        }
        .mdc-descente__crans{
          list-style:none; margin:0; padding:0;
          position:relative; width:26px; flex:none;
        }
        .mdc-descente__crans > li{ position:absolute; left:0; transform:translateY(-50%); }
        /* position:relative pour que le nom se pose HORS DU FLUX (voir plus
           bas) : sinon chaque cran mesurait 133px de large — la largeur du
           nom invisible — et la regle posait sur la page une colonne de
           liens transparents qui attrapait les clics dans le vide. */
        .mdc-descente__cran{
          position:relative; display:flex; align-items:center;
          text-decoration:none; padding:6px 4px; margin:-6px -4px;
        }
        .mdc-descente__trait{
          display:block; width:9px; height:1px; background:${COLORS.taupeTrait};
          transition:width ${DURATION.reveal}ms ${EASE.reveal},
                     background-color ${DURATION.reveal}ms ${EASE.reveal};
        }
        .mdc-descente__cran:hover .mdc-descente__trait,
        .mdc-descente__cran:focus-visible .mdc-descente__trait{
          width:20px; transition-duration:${DURATION.exit}ms;
        }
        .mdc-descente__cran.est-ici .mdc-descente__trait{
          width:26px; background:${COLORS.brou};
        }
        /* Hors du flux, et insensible au pointeur : il se lit, il ne se
           clique pas. Le cran seul porte la cible — 26px, plus la marge de
           confort de son padding. */
        .mdc-descente__nom{
          position:absolute; left:100%; margin-left:10px; pointer-events:none;
          font-family:${FONTS.prata}; font-size:10px; letter-spacing:0.22em;
          text-transform:uppercase; color:${COLORS.brou};
          white-space:nowrap; opacity:0;
          transform:translateX(-4px);
          transition:opacity ${DURATION.reveal}ms ${EASE.reveal},
                     transform ${DURATION.reveal}ms ${EASE.reveal};
        }
        .mdc-descente__cran.est-ici .mdc-descente__nom,
        .mdc-descente__cran:hover .mdc-descente__nom,
        .mdc-descente__cran:focus-visible .mdc-descente__nom{
          opacity:1; transform:none;
        }
        .mdc-descente__fond{
          position:absolute; left:0; bottom:-34px;
          font-family:${FONTS.prata}; font-size:11px; letter-spacing:0.18em;
          color:${COLORS.brou};
        }
        .mdc-descente__fond i{ font-style:normal; opacity:0.45; }

        /* Sous 1080px les marges ne peuvent plus la porter sans mordre le
           texte. Elle sort — la page reste entiere, on ne perd qu'un repere. */
        @media (max-width: 1080px){ .mdc-descente{ display:none; } }

        /* Moins de mouvement, pas moins de contenu : la regle reste, les
           noms restent lisibles, seules les transitions tombent. */
        @media (prefers-reduced-motion: reduce){
          .mdc-descente__trait,
          .mdc-descente__nom{ transition:none; }
          .mdc-descente__nom{ opacity:0.55; transform:none; }
        }
      `}</style>
    </nav>
  );
}
