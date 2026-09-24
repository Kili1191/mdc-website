"use client";

// LA LIGNE, COMPTEE A L'OEIL.
//
// Kilian, apres avoir lu la premiere version de /teaching : « You didn't
// explain that's rare only 8 master ». Il avait raison, et le defaut n'etait
// pas dans les mots : la rarete etait ECRITE, en prose, au milieu d'un
// paragraphe de la troisieme section. « Kilian is the eighth name on his » se
// lit en une seconde et ne se COMPTE pas. Huit, c'est un nombre qu'il faut
// voir pour le croire.
//
// Alors on le montre. Huit rangs, numerotes, du premier au dernier. Le lecteur
// ne prend pas ma parole pour argent comptant : il compte.
//
// CE QUE CE COMPOSANT REGLE EN PLUS, ET QUI EST LE PLUS DIFFICILE SUR CETTE
// PAGE. /practitioner promet que « where he trained, and with whom, he will
// tell you himself. In conversation, not on a website. » Une page qui vend une
// lignee ne peut donc pas publier la lignee entiere — et une lignee dont on ne
// montre rien ne vend rien.
//
// Les quatre rangs du milieu resolvent les deux : ils EXISTENT, numerotes,
// a leur place, et ils portent la raison de leur silence au lieu d'un blanc.
// Le lecteur voit qu'il manque quatre noms, voit que ce n'est pas un oubli, et
// compte quand meme jusqu'a huit. La discretion devient une chose qu'on
// regarde plutot qu'une chose qu'on subit.
//
// LA CONVENTION DE COMPTAGE EST ICI RENDUE EXPLICITE, et c'est voulu. J'avais
// retire de la prose la phrase « four names stand between Takata and Kilian »
// parce que « huitieme » pouvait se compter en incluant Usui ou apres lui.
// Kilian a depuis ecrit « only 8 master » : huit au total, donc Usui en 01 et
// Kilian en 08. Le tableau le dit ouvertement — c'est la forme la plus
// verifiable, donc la plus honnete, et si la convention etait autre le defaut
// se voit immediatement plutot que de se cacher dans une phrase.
//
// PAS DE COULEUR NOUVELLE, PAS D'EFFET NOUVEAU. Les rangs reprennent la
// grammaire de .mdc-index — numero, nom, note, filet — et la reveleation est
// celle de tout le site : opacite et 0,4em, 900 ms, la courbe de reveal. Un
// seul effet, deja parle ailleurs.

import { useEffect, useRef } from "react";
import { COLORS, FONTS } from "@/styles/tokens";
import { DURATION, EASE } from "@/lib/motion";

type Rang = { n: string; nom: string; note: string; tenu?: boolean; ici?: boolean };

// Les trois premiers noms sont de l'histoire publique et datee — ils sont sur
// Wikipedia, n'importe qui les verifie. Les quatre suivants sont a Kilian.
const LIGNE: Rang[] = [
  { n: "01", nom: "Mikao Usui", note: "Tokyo, 1922" },
  { n: "02", nom: "Chujiro Hayashi", note: "Master, 1925" },
  { n: "03", nom: "Hawayo Takata", note: "Master, 1938" },
  { n: "04", nom: "Given in person", note: "His teachers", tenu: true },
  { n: "05", nom: "Given in person", note: "His teachers", tenu: true },
  { n: "06", nom: "Given in person", note: "His teachers", tenu: true },
  { n: "07", nom: "Given in person", note: "His teachers", tenu: true },
  { n: "08", nom: "Kilian", note: "Battersea", ici: true },
];

export default function Lignee() {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rangs = [...el.querySelectorAll<HTMLElement>("li")];

    // Mouvement reduit : les rangs sont la, poses, sans que rien ne monte.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rangs.forEach((r) => { r.style.opacity = "1"; r.style.transform = "none"; });
      return;
    }

    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        rangs.forEach((r, i) => {
          // 90 ms par rang : les huit se posent en 630 ms, assez pour qu'on
          // les voie tomber un par un, trop peu pour qu'on attende.
          r.style.transitionDelay = `${i * 90}ms`;
          r.style.opacity = "1";
          r.style.transform = "none";
        });
        io.disconnect();
      });
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <ol ref={ref} className="mdc-lignee" aria-label="The line from Usui">
        {LIGNE.map((r) => (
          <li key={r.n} className={r.ici ? "mdc-lignee__ici" : undefined}>
            <span className="mdc-lignee__n" aria-hidden>{r.n}</span>
            <span className={`mdc-lignee__nom${r.tenu ? " est-tenu" : ""}`}>{r.nom}</span>
            <span className="mdc-lignee__note">{r.note}</span>
          </li>
        ))}
      </ol>

      <style>{`
        .mdc-lignee{
          list-style:none; margin:44px 0 0; padding:0;
          border-top:1px solid #74654F;
        }
        .mdc-lignee li{
          display:grid;
          grid-template-columns:3.5rem 1fr auto;
          gap:24px; align-items:baseline;
          padding:22px 0;
          border-bottom:1px solid #74654F;
          opacity:0; transform:translateY(0.4em);
          transition:opacity ${DURATION.reveal}ms ${EASE.reveal},
                     transform ${DURATION.reveal}ms ${EASE.reveal};
        }
        .mdc-lignee__n{
          font-family:${FONTS.prata}; font-size:11px; letter-spacing:0.2em;
          color:${COLORS.brou}; opacity:0.55;
        }
        .mdc-lignee__nom{
          font-family:${FONTS.higuen};
          /* 40 et non 38 : sur /teaching les titres de section plafonnent a
             40, et deux tailles a 1,05 l'une de l'autre sur le meme ecran ne
             font pas une hierarchie. Marche afficheS de l echelle. */
          font-size:clamp(23px, 3vw, 40px);
          line-height:1.05; color:${COLORS.brouFonce};
        }
        /* Les rangs tenus sont PLUS PETITS et en Prata, pas plus pales : un
           nom a 0,35 d'opacite serait sous le plancher de contraste, et ce
           texte porte une information — pourquoi il n'y a pas de nom. Il
           change de voix, pas de lisibilite. Mesure : brou plein sur le
           marbre, 6,93:1. */
        .mdc-lignee__nom.est-tenu{
          font-family:${FONTS.prata};
          font-size:clamp(15px, 1.5vw, 18px);
          letter-spacing:0.02em;
          color:${COLORS.brou};
          font-style:italic;
        }
        .mdc-lignee__note{
          font-family:${FONTS.prata}; font-size:12px; letter-spacing:0.14em;
          text-transform:uppercase; color:${COLORS.brou}; opacity:0.7;
          text-align:right;
        }
        /* Le huitieme rang porte le seul accent du site, comme Begin dans la
           barre du haut : c'est la meme fonction, dire ou l'on arrive. */
        .mdc-lignee__ici{ border-bottom-color:${COLORS.rouille} !important; }
        .mdc-lignee__ici .mdc-lignee__nom{
          font-size:clamp(28px, 4vw, 52px);
        }
        .mdc-lignee__ici .mdc-lignee__note{ opacity:0.9; }

        @media (max-width: 640px){
          .mdc-lignee li{
            grid-template-columns:2.6rem 1fr;
            row-gap:6px; padding:18px 0;
          }
          .mdc-lignee__note{ grid-column:2; text-align:left; }
        }
      `}</style>
    </>
  );
}
