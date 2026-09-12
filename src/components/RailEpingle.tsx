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
// L'EPINGLE VAUT AUSSI SUR TELEPHONE — correction du 12 septembre.
//
// Elle etait coupee sous 1081px, et le commentaire qui le justifiait disait :
// « le pouce sait deja pousser un rail horizontalement, et epingler sur un
// telephone allonge la page pour un geste que personne n'a demande ».
// Kilian : « the horizontal scroll automatic doesnt work on mobile ». Il
// l'avait demande, deux fois, sans jamais dire « sur desktop ». Le raisonnement
// etait le mien, pas le sien, et il tranche.
//
// Ce que l'activation demande en plus, et qui n'existait pas :
//
//   LA HAUTEUR DE REFERENCE N'EST PLUS `window.innerHeight`. Sur iPhone, la
//   barre d'adresse se retracte au defilement et innerHeight grandit de
//   soixante a quatre-vingt-dix pixels EN COURS DE ROUTE. La zone calee, elle,
//   fait 100svh — le petit viewport, qui ne bouge jamais. Les deux valeurs
//   divergeaient donc en plein milieu de la course, et le rail terminait sa
//   translation a cote de sa sortie d'epingle. On mesure maintenant la zone
//   calee elle-meme : une seule hauteur, celle qui est reellement a l'ecran.
//
//   LE GESTE HORIZONTAL REPOND. Epinglee, la piste n'a plus de debordement a
//   faire defiler : un balayage lateral sur une rangee de cartes ne faisait
//   donc RIEN, ce qui est pire qu'un effet absent. Le balayage est desormais
//   converti en avancee de page (voir `onTouchMove`), en ecoute PASSIVE : on
//   n'annule jamais le geste, on l'ajoute. Le doigt pousse les cartes, la page
//   suit, et le scroll vertical fait exactement la meme chose qu'avant.
//
// DEUX SORTIES DE SECOURS RESTENT :
//
//   1. `prefers-reduced-motion` — on rend le rail libre d'avant, celui qui se
//      pousse au doigt ou au trackpad. Aucune epingle. Celle-la n'est pas une
//      preference de design, c'est une preference systeme, et elle reste.
//   2. Le clavier — voir `onFocusIn` plus bas. Une carte qui recoit le focus
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
  const caleRef = useRef<HTMLDivElement>(null);
  const pisteRef = useRef<HTMLElement>(null);
  // `null` tant qu'on n'a pas mesure : on ne rend pas l'epingle cote serveur,
  // et on ne l'active pas avant de connaitre la distance reelle.
  const [epingle, setEpingle] = useState(false);

  useEffect(() => {
    const dehors = dehorsRef.current;
    const cale = caleRef.current;
    const piste = pisteRef.current;
    if (!dehors || !cale || !piste) return;

    const sobre = window.matchMedia("(prefers-reduced-motion: reduce)");

    let distance = 0;
    let hauteur = 0;   // la hauteur de la zone calee, 100svh resolus
    let raf = 0;
    let actif = false;

    const mesurer = () => {
      actif = !sobre.matches;
      setEpingle(actif);
      if (!actif) {
        piste.style.transform = "";
        dehors.style.height = "";
        return;
      }
      // Ce qui depasse de l'ecran, et donc la course a parcourir.
      distance = Math.max(0, piste.scrollWidth - window.innerWidth);
      // La zone calee fait 100svh. On lit sa hauteur REELLE plutot que
      // window.innerHeight : sur telephone les deux different de la hauteur
      // de la barre d'adresse, et innerHeight change en cours de route.
      // Sa hauteur doit se lire avant qu'on impose celle du bloc exterieur,
      // sinon un bloc trop court l'ecraserait.
      dehors.style.height = "";
      hauteur = cale.offsetHeight;
      // Un ecran cale, plus la course.
      dehors.style.height = `${hauteur + distance}px`;
      placer();
    };

    const placer = () => {
      raf = 0;
      if (!actif) return;
      const r = dehors.getBoundingClientRect();
      const course = r.height - hauteur;
      if (course <= 0) return;
      // 0 quand le haut de la section touche le haut de l'ecran,
      // 1 quand son bas y arrive.
      const p = Math.min(1, Math.max(0, -r.top / course));
      piste.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
    };

    // LE BALAYAGE LATERAL, SUR TELEPHONE.
    //
    // Ecoute PASSIVE, donc aucun preventDefault : on n'a pas le droit de
    // confisquer le geste, c'est la regle de tout ce composant. Un balayage
    // franchement horizontal ne fait presque rien defiler verticalement de
    // lui-meme ; on lui ajoute la conversion, et la page avance comme si le
    // doigt poussait les cartes.
    //
    // Le rapport est de un pour un : la section fait une hauteur calee plus la
    // course, donc un pixel de page vaut un pixel de piste. Il reste ecrit
    // pour survivre a un changement de hauteur.
    let tx = 0, ty = 0, lateral = false;
    const onTouchStart = (e: TouchEvent) => {
      if (!actif || e.touches.length !== 1) return;
      tx = e.touches[0].clientX; ty = e.touches[0].clientY; lateral = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!actif || distance <= 0 || e.touches.length !== 1) return;
      const x = e.touches[0].clientX, y = e.touches[0].clientY;
      const dx = x - tx, dy = y - ty;
      tx = x; ty = y;
      // L'intention se decide au premier mouvement franc et ne change plus
      // pendant le geste : sans cela, un balayage en arc basculerait d'un
      // mode a l'autre en cours de route.
      if (!lateral) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        lateral = Math.abs(dx) > Math.abs(dy);
        if (!lateral) return;
      }
      const course = dehors.offsetHeight - hauteur;
      if (course <= 0) return;
      window.scrollBy({ top: -dx * (course / distance), behavior: "auto" });
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
        const course = dehors.offsetHeight - hauteur;
        if (course <= 0) return;
        window.scrollBy({ top: ecart * (course / distance), behavior: "auto" });
      });
    };

    mesurer();
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", mesurer);
    sobre.addEventListener("change", mesurer);
    piste.addEventListener("focusin", onFocusIn);
    cale.addEventListener("touchstart", onTouchStart, { passive: true });
    cale.addEventListener("touchmove", onTouchMove, { passive: true });

    // Les cartes portent des polices personnalisees : leur largeur change
    // quand les fontes arrivent, et la distance mesuree avant serait fausse.
    const ro = new ResizeObserver(mesurer);
    ro.observe(piste);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", planifier);
      window.removeEventListener("resize", mesurer);
      sobre.removeEventListener("change", mesurer);
      piste.removeEventListener("focusin", onFocusIn);
      cale.removeEventListener("touchstart", onTouchStart);
      cale.removeEventListener("touchmove", onTouchMove);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={dehorsRef} className={epingle ? "mdc-epingle" : undefined}>
      <div ref={caleRef} className={epingle ? "mdc-epingle__cale" : undefined}>
        <div className={epingle ? "mdc-epingle__entete" : undefined}>{entete}</div>
        {/* `data-lenis-prevent` seulement quand le rail se pousse lui-meme :
            epingle, c'est la page qui doit recevoir la molette ET le doigt, et
            l'attribut l'en empecherait. Il ne reste donc que pour le mouvement
            reduit, ou le rail redevient un vrai debordement horizontal. */}
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
