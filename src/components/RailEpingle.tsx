"use client";

// LE RAIL EPINGLE — « What is practised here ».
//
// Demande de Kilian : « when scrolling down the horizontal scroll must done
// till the end to be able to scroll down again ». La section se cale a
// l'ecran, le scroll vertical fait defiler le sommaire a l'horizontale, et la
// page ne repart vers le bas qu'une fois la derniere carte atteinte.
//
// COMMENT, ET POURQUOI PAS AUTREMENT. On n'intercepte RIEN. Un
// `preventDefault` sur la molette est la mauvaise facon de faire ca : il
// confisque le geste, casse la barre de defilement, casse la molette du
// milieu, et laisse un visiteur coince si une mesure se trompe d'un pixel.
//
// Ici la section est simplement HAUTE — un ecran plus la distance horizontale
// a parcourir — et son contenu est `position: sticky` en haut. Le scroll
// vertical n'est jamais bloque : il est REINTERPRETE. On lit la progression
// dans la section et on la transforme en `translate3d` sur la piste. Le
// visiteur qui insiste avance toujours, et il ressort par le bas au moment
// exact ou la derniere carte arrive. C'est ce que fait Studio Freight, et
// c'est la seule version de cet effet qui ne pieger personne.
//
// Consequence : la piste bouge en `transform` seul, sur le GPU, jamais en
// `left` ni en `scrollLeft`.
//
// TROIS SORTIES DE SECOURS, parce qu'un effet qui s'impose partout est un
// piege deguise :
//
//   1. `prefers-reduced-motion` — on rend le rail libre d'avant, celui qui se
//      pousse au doigt ou au trackpad. Aucune epingle.
//   2. Sous 1081px — meme chose. Le pouce sait deja pousser un rail
//      horizontalement, et epingler sur un telephone allonge la page de trois
//      ecrans pour un geste que personne n'a demande.
//   3. Le clavier — voir `onFocusIn` plus bas. Une carte qui recoit le focus
//      dans une piste translatee ne peut PAS etre amenee dans le champ par le
//      navigateur : il scrollerait le conteneur, or ce n'est pas le conteneur
//      qui bouge. On convertit donc la position de la carte en position de
//      scroll de la page. Sans ca, tabuler dans le rail donne un focus
//      invisible, ce qui est pire que pas d'effet du tout.

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Les cartes. Rendues telles quelles dans la piste. */
  children: React.ReactNode;
  /** Libelle du `nav`, repris de l'appelant. */
  label: string;
  /**
   * Le surtitre et le titre de la section.
   *
   * Ils sont RENDUS DANS LA ZONE CALEE, pas au-dessus d'elle, et c'est le
   * point. Laisses dans le flux, ils defilaient hors de l'ecran des la
   * premiere carte : on regardait ensuite quatre cartes sans savoir de quoi
   * elles etaient la liste. Cales avec le rail, ils tiennent le contexte
   * pendant toute la course, et c'est la moitie de l'effet — le titre reste,
   * la matiere passe devant lui.
   */
  entete: React.ReactNode;
};

export default function RailEpingle({ children, label, entete }: Props) {
  const dehorsRef = useRef<HTMLDivElement>(null);
  const pisteRef = useRef<HTMLElement>(null);
  // `null` tant qu'on n'a pas mesure : on ne rend pas l'epingle cote serveur,
  // et on ne l'active pas avant de connaitre la distance reelle.
  const [epingle, setEpingle] = useState(false);

  useEffect(() => {
    const dehors = dehorsRef.current;
    const piste = pisteRef.current;
    if (!dehors || !piste) return;

    const sobre = window.matchMedia("(prefers-reduced-motion: reduce)");
    const large = window.matchMedia("(min-width: 1081px)");

    let distance = 0;
    let raf = 0;
    let actif = false;

    const mesurer = () => {
      actif = large.matches && !sobre.matches;
      setEpingle(actif);
      if (!actif) {
        piste.style.transform = "";
        dehors.style.height = "";
        return;
      }
      // Ce qui depasse de l'ecran, et donc la course a parcourir.
      distance = Math.max(0, piste.scrollWidth - window.innerWidth);
      // Un ecran pour tenir la section calee, plus la course.
      dehors.style.height = `${window.innerHeight + distance}px`;
      placer();
    };

    const placer = () => {
      raf = 0;
      if (!actif) return;
      const r = dehors.getBoundingClientRect();
      const course = r.height - window.innerHeight;
      if (course <= 0) return;
      // 0 quand le haut de la section touche le haut de l'ecran,
      // 1 quand son bas y arrive.
      const p = Math.min(1, Math.max(0, -r.top / course));
      piste.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
    };

    const planifier = () => { if (!raf) raf = requestAnimationFrame(placer); };

    // Le clavier. On amene la page la ou la carte focalisee sera visible,
    // puisque le navigateur ne peut pas le faire lui-meme.
    //
    // DEUX PIEGES, tous les deux mesures.
    //
    // 1. Pas `offsetLeft`. Il se compte depuis le premier ancetre positionne,
    //    qui n'est pas la piste, et il inclut le padding du debord. Premiere
    //    version : la derniere carte atterrissait a left=-53, hors ecran.
    // 2. Le navigateur scrolle DEJA de lui-meme quand un element recoit le
    //    focus. Un calcul absolu s'ajoute au sien et depasse.
    //
    // Donc : on laisse le navigateur faire ce qu'il veut, on attend une frame,
    // on MESURE ou la carte a atterri, et on corrige de l'ecart. Autocorrectif,
    // quoi qu'ait fait le navigateur.
    //
    // La conversion est triviale ici : la section fait un ecran plus la course,
    // donc un pixel de scroll vertical vaut exactement un pixel de deplacement
    // horizontal. Le rapport reste ecrit pour que la relation survive a un
    // changement de hauteur.
    const onFocusIn = (e: FocusEvent) => {
      if (!actif || distance <= 0) return;
      const cible = e.target as HTMLElement | null;
      if (!cible || !piste.contains(cible)) return;
      requestAnimationFrame(() => {
        const r = cible.getBoundingClientRect();
        const ecart = r.left + r.width / 2 - window.innerWidth / 2;
        if (Math.abs(ecart) < 2) return;
        const course = dehors.offsetHeight - window.innerHeight;
        if (course <= 0) return;
        window.scrollBy({ top: ecart * (course / distance), behavior: "auto" });
      });
    };

    mesurer();
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", mesurer);
    sobre.addEventListener("change", mesurer);
    large.addEventListener("change", mesurer);
    piste.addEventListener("focusin", onFocusIn);

    // Les cartes portent des polices personnalisees : leur largeur change
    // quand les fontes arrivent, et la distance mesuree avant serait fausse.
    const ro = new ResizeObserver(mesurer);
    ro.observe(piste);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", planifier);
      window.removeEventListener("resize", mesurer);
      sobre.removeEventListener("change", mesurer);
      large.removeEventListener("change", mesurer);
      piste.removeEventListener("focusin", onFocusIn);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={dehorsRef} className={epingle ? "mdc-epingle" : undefined}>
      <div className={epingle ? "mdc-epingle__cale" : undefined}>
        <div className={epingle ? "mdc-epingle__entete" : undefined}>{entete}</div>
        {/* `data-lenis-prevent` seulement quand le rail se pousse lui-meme :
            epingle, c'est la page qui doit recevoir la molette, et l'attribut
            l'en empecherait. */}
        <nav
          ref={pisteRef}
          className={`mdc-rail${epingle ? " mdc-rail--epingle" : ""}`}
          aria-label={label}
          {...(epingle ? {} : { "data-lenis-prevent": true })}
        >
          {children}
        </nav>
      </div>
    </div>
  );
}
