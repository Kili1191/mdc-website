"use client";

// L'INSCRIPTION — ce qui remplace la regle gravee de la marge.
//
// Kilian, deux fois : « why this thing ugly on the side ? ugly af », puis
// « remove la regle du cote soit creatif pour le awwwards design more than the
// actual ».
//
// La regle avait ete reparee — les crans touchaient enfin le sillon, le
// sillon s'eteignait a ses bouts, les cibles faisaient 24px. Tout etait juste
// et ca restait un WIDGET : un petit instrument de mesure pose dans un coin,
// qui explique ou l'on est. Reparer un objet ne le rend pas desirable.
//
// CE QUI LE REMPLACE, ET POURQUOI CELUI-LA. Le nom de la station, taille
// GRAND dans la pierre du bord de l'ecran, et volontairement coupe par ce
// bord. On ne lit pas un indicateur : on longe une inscription sur un mur,
// dont on ne voit qu'une partie parce qu'on est trop pres. C'est la langue que
// ce site parle depuis ce matin — le burin, la traversee, les titres tailles —
// portee a l'echelle d'un batiment plutot qu'a celle d'une interface.
//
// Ecarte : le nom en vertical le long du bord. C'est le reflexe du genre, on
// le voit sur la moitie des sites primes, et le skill taste a raison de se
// mefier du « generic Awwwards » meme apres le virage. Une inscription
// horizontale et rognee est architecturale ; un texte tourne a 90 degres est
// une convention de site web.
//
// ─────────────────────────────────────────────────────────────────────────
// LE MUR NU. C'est la seule regle du composant, et elle vient d'un defaut
// mesure sur capture : a la premiere version l'inscription etait toujours a
// gauche, et la station « The weight » — la seule composee A GAUCHE — se
// faisait traverser par le mot. La barre du H passait dans la hauteur d'x de
// « tiredness ». Exactement le reproche deja formule : « ça peut pas être
// brouillon ».
//
// On ne choisit donc plus un cote : on MESURE, pour la station active, ou le
// mur est nu. La page alterne centre / gauche / centre / droite / centre, et
// cette alternance est porteuse de sens (voir RANGEE dans page.tsx) ; le mur
// nu est donc, selon la station, a gauche, a droite, large ou inexistant.
// L'inscription va du cote le plus large, et se fond dans la pierre 260px
// avant la copie. Quand il n'y a pas de mur — le sommaire « The practice »
// occupe toute la largeur — elle ne s'ecrit pas du tout.
//
// Consequence assumee : elle n'apparait pas sur les six stations, et sur un
// ecran etroit elle n'apparait que sur les deux stations poussees aux marges.
// C'est voulu. Une inscription qui se force sur un mur deja couvert n'est pas
// une inscription, c'est un calque.
// ─────────────────────────────────────────────────────────────────────────
//
// DEUX CHOSES QUE LA REGLE FAISAIT ET QUI NE SE PERDENT PAS :
//
//   La navigation. Les ancres existent toujours, dans un `nav` accessible mais
//   invisible. Un lecteur d'ecran et le clavier gardent donc la liste complete
//   des stations, ce que le grand mot ne peut pas donner.
//
//   Le reperage. Le compteur reste, petit, sous l'inscription, et lui ne
//   disparait jamais.
//
// Et c'est CE PARTAGE qui autorise l'inscription a etre aussi discrete qu'elle
// veut : elle est `aria-hidden`, purement decorative. Le contraste n'a donc
// pas a lui appliquer le plancher de 4,5:1 — l'information vit dans le nav
// invisible, pas dans elle. Sans ce partage, un mot geant a faible contraste
// serait une faute.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";
import { DURATION, EASE } from "@/lib/motion";

type Station = { id: string; nom: string };
// `large` : la largeur de mur nu, en pixels. `cote` : de quel bord elle part.
type Place = { cote: "g" | "d"; large: number };

// La distance qu'on laisse entre le dernier caractere de l'inscription et le
// premier de la copie. Assez pour que les deux ne se lisent jamais ensemble.
const GARDE = 120;
// Le mot est taille A LA MESURE DU MUR : jamais un fragment, jamais un
// depassement. Ces deux bornes disent seulement quand l'echelle cesse d'etre
// architecturale — trop petit, ce n'est plus une inscription mais une
// legende ; trop grand, ca cesse d'etre de la pierre et redevient un titre.
//
// Le plancher est haut, et c'est le point : il vaut mieux pas d'inscription
// qu'une petite. Mesure faite a 1440px — les seules stations qui ouvrent un
// vrai mur sont les deux poussees aux marges, « The weight » et « Kilian »,
// c'est-a-dire les deux qui encadrent la gravure. L'inscription tombe donc
// exactement sur la symetrie que la page a deja.
const TAILLE_MIN = 100;
const TAILLE_MAX = 150;
// Taille de reference pour la mesure. On lit la largeur naturelle du mot a
// 100px une fois, et on en deduit la taille qui remplit le mur.
const ETALON = 100;

export default function Inscription() {
  const [stations, setStations] = useState<Station[]>([]);
  const [actif, setActif] = useState(0);
  const [place, setPlace] = useState<Place | null>(null);
  const boitesRef = useRef<{ haut: number; bas: number }[]>([]);
  const noeudsRef = useRef<HTMLElement[]>([]);
  const motRef = useRef<HTMLSpanElement>(null);
  const ici: Station | undefined = stations[actif];

  useEffect(() => {
    // Meme mecanique que la regle qu'elle remplace : l'accueil ne rend ses
    // stations qu'une fois pret, donc un scan unique au montage arrive avant
    // elles et ne trouve rien. On observe jusqu'a ce qu'elles existent.
    let mo: MutationObserver | null = null;

    const scanner = () => {
      const t = [...document.querySelectorAll<HTMLElement>("[data-station]")];
      if (t.length < 2) return false;
      noeudsRef.current = t;
      setStations(t.map((n) => ({ id: n.id, nom: n.dataset.station ?? "" })));
      return true;
    };

    // PAS DE getBoundingClientRect ICI. Le piege est le meme que celui deja
    // corrige dans page.tsx : la choregraphie applique un translateY allant
    // jusqu'a 460px a chaque station, et le rectangle renvoye est le
    // rectangle APRES transformation. Les boites etaient donc decalees d'une
    // valeur qui depend de l'endroit ou l'on se trouvait au moment de la
    // mesure — au milieu du sommaire, l'inscription affichait deja « Kilian ».
    //
    // offsetTop et offsetHeight ignorent les transformations. C'est la seule
    // mesure stable ici.
    const hautDoc = (n: HTMLElement) => {
      let y = 0;
      let e: HTMLElement | null = n;
      while (e) { y += e.offsetTop; e = e.offsetParent as HTMLElement | null; }
      return y;
    };
    const mesurer = () => {
      boitesRef.current = noeudsRef.current.map((n) => {
        const haut = hautDoc(n);
        return { haut, bas: haut + n.offsetHeight };
      });
    };

    // L'etendue horizontale de ce que la station ECRIT, pas de la section.
    // La section fait toujours toute la largeur ; c'est son contenu qui est
    // pousse au centre, a gauche ou a droite.
    //
    // ON DESCEND JUSQU'AUX FEUILLES, et ce n'est pas de la prudence. Mesure
    // faite : en ne prenant que les enfants de premier rang, le sommaire
    // « The practice » renvoyait la largeur de sa colonne .mdc-wrap — 900px
    // centres — alors que le rail epingle sort en pleine largeur et depasse
    // l'ecran des deux cotes. L'inscription se croyait donc au large sur un
    // mur entierement couvert.
    //
    // Les elements sans surface sont ignores : un bloc vide ou de 1px est du
    // gabarit, pas du texte.
    const murDe = (n: HTMLElement): Place | null => {
      // Sous 1080px la copie prend toute la largeur : il n'y a plus de mur.
      // La decision vit ICI et nulle part ailleurs — une media query ne peut
      // pas la prendre, puisque la mesure ecrit `display` en ligne et qu'un
      // style en ligne bat une feuille de style. Premiere version : le mot
      // restait affiche a 1024px malgre la regle a 1080.
      if (window.innerWidth <= 1080) return null;
      let g = Infinity, d = -Infinity;
      for (const k of Array.from(n.querySelectorAll<HTMLElement>("*"))) {
        const b = k.getBoundingClientRect();
        if (b.width < 4 || b.height < 4) continue;
        g = Math.min(g, b.left);
        d = Math.max(d, b.right);
      }
      if (g === Infinity) return null;
      const vw = window.innerWidth;
      const aGauche = g - GARDE;
      const aDroite = vw - d - GARDE;
      const cote = aDroite > aGauche ? "d" : "g";
      const large = Math.max(aGauche, aDroite);
      // La taille minimale decide du reste : un mur qui ne peut pas porter le
      // mot entier a TAILLE_MIN n'est pas un mur.
      return large >= TAILLE_MIN ? { cote, large: Math.round(large) } : null;
    };

    // Les boites des stations sont mesurees UNE fois, et c'etait faux : le
    // sommaire « The practice » se donne sa hauteur en JavaScript apres le
    // montage (RailEpingle epingle la section et l'allonge de toute la course
    // horizontale). Toutes les boites d'en dessous etaient donc decalees, et
    // au milieu du sommaire l'inscription affichait deja « Kilian ».
    // On remesure des qu'une station change de taille — ce qui couvre aussi
    // l'arrivee des fontes.
    let ro: ResizeObserver | null = null;

    let raf = 0;
    let dernier = -1;
    const suivre = () => {
      raf = 0;
      // La station active est celle qui occupe le milieu de l'ecran. C'est le
      // regard qui decide, pas l'ordre du DOM.
      const milieu = window.scrollY + window.innerHeight / 2;
      const i = boitesRef.current.findIndex((b) => milieu >= b.haut && milieu < b.bas);
      if (i < 0) return;
      setActif(i);
      // On ne remesure le mur qu'au changement de station : sa largeur ne
      // depend que de la mise en page, jamais du scroll.
      if (i !== dernier) { dernier = i; setPlace(murDe(noeudsRef.current[i])); }
    };
    const planifier = () => { if (!raf) raf = requestAnimationFrame(suivre); };

    if (!scanner()) {
      mo = new MutationObserver(() => {
        if (!scanner()) return;
        mo?.disconnect(); mo = null;
        mesurer(); suivre();
        noeudsRef.current.forEach((n) => ro?.observe(n));
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } else { mesurer(); suivre(); }

    ro = new ResizeObserver(() => { mesurer(); dernier = -1; planifier(); });
    noeudsRef.current.forEach((n) => ro?.observe(n));

    const surResize = () => { mesurer(); dernier = -1; planifier(); };
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", surResize);
    // Les fontes changent la largeur du texte en arrivant : un mur mesure
    // avant elles est faux.
    document.fonts?.ready.then(surResize).catch(() => {});
    return () => {
      window.removeEventListener("scroll", planifier);
      window.removeEventListener("resize", surResize);
      if (raf) cancelAnimationFrame(raf);
      mo?.disconnect();
      ro?.disconnect();
    };
  }, []);

  // LA TAILLE SE MESURE, ELLE NE SE DEVINE PAS.
  //
  // Premiere version : une taille fixe en clamp(58px, 9vw, 150px) et un
  // degrade qui effacait ce qui depassait. Resultat mesure sur capture a
  // 1990px : « THRESHOLD » commencait et s'eteignait au bout de trois
  // lettres. Un mot coupe en plein milieu ne se lit pas comme une inscription
  // rognee par le bord de l'ecran, il se lit comme un bogue.
  //
  // Le mot est donc taille A LA MESURE DU MUR. On lit sa largeur naturelle a
  // 100px, on en deduit la taille qui remplit exactement la place libre, et
  // on la refuse si elle tombe sous le seuil architectural. Consequence :
  // l'inscription est toujours ENTIERE, et sa taille dit d'elle-meme combien
  // de mur la composition lui a laisse.
  //
  // useLayoutEffect, pas useEffect : la mesure et la pose doivent tenir dans
  // la meme frame, sinon on voit le mot a 100px pendant une image.
  // Pose ecrite directement sur le noeud, sans passer par un etat React : une
  // mesure suivie d'un setState relancerait cet effet, qui remettrait la
  // taille etalon pour remesurer, et React s'arreterait la faute de valeur
  // nouvelle — le mot resterait fige a 100px. Ici la mesure et la pose sont
  // le meme geste, dans la meme frame.
  useLayoutEffect(() => {
    const el = motRef.current;
    if (!el) return;
    if (!place) { el.style.display = "none"; return; }
    el.style.display = "block";
    el.style.fontSize = `${ETALON}px`;
    el.style.width = "auto";
    const naturel = el.scrollWidth;
    if (!naturel) return;
    const brute = ETALON * (place.large / naturel);
    if (brute < TAILLE_MIN) { el.style.display = "none"; return; }
    const t = Math.min(TAILLE_MAX, brute);
    el.style.fontSize = `${t}px`;
    el.style.width = `${Math.ceil(naturel * (t / ETALON))}px`;
  }, [ici?.nom, place]);

  if (stations.length < 2) return null;
  const droite = place?.cote === "d";

  return (
    <>
      {/* L'information, pour qui ne voit pas l'inscription. Invisible a
          l'ecran, complete pour un lecteur d'ecran et pour le clavier. */}
      <nav className="mdc-inscription__liste" aria-label="Stations">
        <ol>
          {stations.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={i === actif ? "true" : undefined}>
                {String(i + 1).padStart(2, "0")} {s.nom}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className={`mdc-inscription${droite ? " mdc-inscription--d" : ""}`} aria-hidden>
        {/* key sur le nom ET le cote : React remonte l'element a chaque
            changement, donc l'animation d'entree rejoue. Sans elle, le mot
            changerait d'un coup, sans que rien ne se taille. */}
        <span
          key={`${ici.id}-${place?.cote ?? "x"}`}
          ref={motRef}
          className="mdc-inscription__mot"
        >
          {/* UN MOT PAR LIGNE. Une inscription sur un mur s'empile ; c'est une
              ligne de texte qui court en travers. Et c'est aussi ce qui rend
              la chose possible : le mur nu fait 400 a 900px de large et
              900px de haut, donc « THE WEIGHT » sur une ligne n'y tient qu'en
              tout petit, alors qu'empile il y tient a pleine taille. */}
          {ici.nom.split(/\s+/).map((m, i) => (
            <span key={i} className="mdc-inscription__ligne">{m}</span>
          ))}
        </span>
        <span className="mdc-inscription__compte">
          {String(actif + 1).padStart(2, "0")}
          <i>/{String(stations.length).padStart(2, "0")}</i>
        </span>
      </div>

      <style>{`
        /* Le nav accessible : retire de l'ecran, jamais de l'arbre. */
        .mdc-inscription__liste{
          position:absolute; width:1px; height:1px; overflow:hidden;
          clip:rect(0 0 0 0); white-space:nowrap; border:0; padding:0; margin:-1px;
        }

        /* L'INSCRIPTION. Calee contre le bord du mur nu, et volontairement
           SORTIE de l'ecran : on longe un mur, on ne lit pas une etiquette.
           C'est le rognage qui fait l'echelle. */
        .mdc-inscription{
          position:fixed; left:0; top:50%; transform:translateY(-50%);
          z-index:4; pointer-events:none;
          display:flex; flex-direction:column; align-items:flex-start; gap:18px;
        }
        .mdc-inscription--d{ left:auto; right:0; align-items:flex-end; }

        .mdc-inscription__mot{
          display:block;
          margin-left:-0.14em;
          font-family:${FONTS.higuen};
          /* Grand, et qui grandit avec l'ecran. Le plafond tombe a 1700px de
             large, comme tous les autres depuis ce matin. */
          /* La taille est posee par la mesure, pas par une regle : voir le
             useLayoutEffect. Cette valeur n'est que le repli du premier
             rendu, avant que la mesure ait eu lieu. */
          font-size:${TAILLE_MIN}px;
          line-height:0.86;
          letter-spacing:-0.015em;
          text-transform:uppercase;
          color:${COLORS.brou};
          /* Cache par defaut : c'est la mesure qui l'allume, et tant qu'elle
             n'a pas eu lieu il n'y a rien a montrer. Evite aussi de voir le
             mot a la taille etalon pendant une image. */
          display:none;
          /* Tres bas : c'est de la pierre, pas un titre. L'information est
             dans le nav au-dessus, donc ce mot n'a rien a porter. */
          opacity:0.10;
          /* Le meme relief que les titres tailles au burin, a l'echelle du
             corps : la lumiere vient toujours d'en haut a gauche. */
          text-shadow:
             0.017em 0.021em 0 rgba(255, 251, 241, 0.55),
            -0.008em -0.010em 0.012em rgba(47, 37, 25, 0.22);
          animation: mdc-inscription-entre ${DURATION.reveal}ms ${EASE.reveal} both;
        }
        .mdc-inscription__ligne{ display:block; white-space:nowrap; }
        .mdc-inscription--d .mdc-inscription__mot{
          margin-left:0; margin-right:-0.14em; text-align:right;
        }

        .mdc-inscription__compte{
          margin-left:30px;
          font-family:${FONTS.prata}; font-size:11px; letter-spacing:0.18em;
          color:${COLORS.brou}; opacity:0.82;
        }
        .mdc-inscription--d .mdc-inscription__compte{ margin-left:0; margin-right:30px; }
        .mdc-inscription__compte i{ font-style:normal; opacity:0.5; }

        @keyframes mdc-inscription-entre{
          from{ opacity:0; transform:translateX(-0.06em); }
          to  { opacity:0.10; transform:none; }
        }

        /* Sous 1080px il n'y a pas de mur (voir murDe) : seul le compteur
           reste, en bas a gauche, discret. */
        @media (max-width: 1080px){
          .mdc-inscription{ top:auto; bottom:18px; left:0; right:auto; transform:none;
                            align-items:flex-start; }
          .mdc-inscription__compte{ margin-left:22px; margin-right:0; }
        }

        @media (prefers-reduced-motion: reduce){
          .mdc-inscription__mot{ animation:none; opacity:0.10; }
        }
      `}</style>
    </>
  );
}
