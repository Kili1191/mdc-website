"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType } from "react";

// Titre révélé mot par mot au rythme du souffle.
// Chaque mot fade + monte légèrement, staggerés — un souffle traverse
// la phrase de gauche à droite en ~1.2s. Déclenché quand l'élément
// entre dans le viewport via IntersectionObserver (une seule fois).
//
// Fix typographique : les glyphes italiques (Higuen f, j, apostrophes,
// swashes) débordent du bounding box strict d'un inline-block. On
// applique du padding em-relatif compensé par des marges négatives
// équivalentes : les glyphes ont de la place pour respirer, le layout
// ne bouge pas d'un pixel.

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  stagger?: number;      // ms entre mots (default 90)
  duration?: number;     // ms d'apparition d'un mot (default 900)
  delay?: number;        // ms avant démarrage (default 100)
  lineBreaks?: string;   // séparateur pour retour à la ligne (default "/")
  /**
   * Le burin, au MOT plutot qu'a la lettre.
   *
   * Reservé aux titres d'affichage, et c'est un choix explicite et non un
   * automatisme : ce composant sert aussi au corps de texte, et une taille
   * dans de la pierre a 18px ne serait pas une gravure, ce serait de la
   * bouillie. Le relief est en `em`, donc il ne peut pas etre juste "plus
   * petit" — il devient illisible.
   *
   * Sur un titre, l'outil avance mot par mot au lieu de lettre par lettre.
   * C'est la meme main avec un geste plus large, ce qui est juste : une phrase
   * de six mots taillee lettre par lettre durerait trop longtemps.
   */
  grave?: boolean;
};

// Espace ménagé autour de chaque mot pour les débords de glyphes
// italiques + compensation en marge négative pour ne rien décaler.
const PAD_X = "0.1em";
const PAD_Y = "0.15em";
const WORD_GAP = "0.28em";

const wordSpanStyle: CSSProperties = {
  display: "inline-block",
  opacity: 0,
  transform: "translateY(0.4em)",
  paddingLeft: PAD_X, paddingRight: PAD_X,
  paddingTop: PAD_Y, paddingBottom: PAD_Y,
  marginLeft: `calc(-1 * ${PAD_X})`,
  marginTop: `calc(-1 * ${PAD_Y})`,
  marginBottom: `calc(-1 * ${PAD_Y})`,
  // total right gap = -PAD_X + PAD_X + WORD_GAP = WORD_GAP (inchangé)
  marginRight: `calc(${WORD_GAP} - ${PAD_X})`,
  overflow: "visible",
  willChange: "opacity, transform",
};

const lineSpanStyle: CSSProperties = {
  display: "block",
  overflow: "visible",
  paddingBottom: "0.05em",
};

export default function BreathReveal({
  text,
  as: Tag = "span",
  className,
  style,
  stagger = 90,
  duration = 900,
  delay = 100,
  lineBreaks = "/",
  grave = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>(".mdc-breath-word").forEach((w) => {
        w.style.animation = "none";
        w.style.opacity = "1";
        w.style.transform = "none";
        if (grave) w.classList.add("mdc-char--grave");
      });
      return;
    }

    const reveal = () => {
      const words = Array.from(el.querySelectorAll<HTMLElement>(".mdc-breath-word"));
      words.forEach((w, i) => {
        if (grave) {
          // Meme animation que SplitTextChars, meme courbe, meme lumiere.
          // L'outil est le meme, il taille juste plus large.
          w.style.animation =
            `mdc-burin ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * stagger}ms both`;
          return;
        }
        w.style.transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        w.style.transitionDelay = `${delay + i * stagger}ms`;
        requestAnimationFrame(() => {
          w.style.opacity = "1";
          w.style.transform = "translateY(0)";
        });
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal();
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, stagger, duration, delay, grave]);

  const lines = text.split(lineBreaks).map((l) => l.trim());

  // overflow:visible sur le wrapper aussi, au cas où un parent applique
  // un mask/clip via CSS.
  const rootStyle: CSSProperties = { overflow: "visible", ...style };

  return (
    <Tag ref={ref} className={className} style={rootStyle}>
      {lines.map((line, li) => {
        const mots = line.split(/\s+/);

        // UN MOT, ET L'ESPACE QUI LE PRECEDE.
        //
        // L'espace est pose a `fontSize: 0` : il EXISTE dans le texte, l'arbre
        // d'accessibilite et le presse-papier, et il n'occupe aucune largeur —
        // c'est la marge du mot qui fait le blanc. Mesure avant et apres son
        // ajout : 1,59 px entre deux mots, identique.
        //
        // Sans lui, le HTML servi de l'accueil se lisait
        // « Thereisakindoftirednessthatrestdoesn'treach. » Trois couts reels :
        // un lecteur d'ecran annoncait un seul mot interminable, une selection
        // copiee rendait du texte colle, et aucun extracteur — Google compris —
        // ne pouvait apparier les phrases de longue trainee que ce site vise.
        const mot = (m: string, wi: number) => (
          <Fragment key={`${li}-${wi}`}>
            {wi > 0 && <span style={{ fontSize: 0, lineHeight: 0 }}> </span>}
            <span className="mdc-breath-word" style={wordSpanStyle}>{m}</span>
          </Fragment>
        );

        // AUCUNE LIGNE NE FINIT SUR UN MOT SEUL.
        //
        // Kilian : « the sentence with only one word a la ligne stupid ».
        // Releve : « Tell Kilian what you / carry. »
        //
        // DEUX CORRECTIFS ESSAYES AVANT CELUI-CI, ET LES DEUX SONT INOPERANTS
        // ICI, pour la meme raison de fond :
        //
        //   `text-wrap: pretty`, pose dans globals.css et fait exactement pour
        //   ca. Chromium l'abandonne des qu'un bloc contient des boites inline
        //   ATOMIQUES, et chaque mot en est une — l'inline-block est ce qui
        //   permet de le faire monter. Verifie sur le build : la propriete
        //   calculee vaut bien `pretty`, la coupure ne bouge pas d'un mot.
        //
        //   une espace insecable avant le dernier mot. Elle ne peut rien non
        //   plus : CSS Text ouvre une occasion de coupure AVANT ET APRES chaque
        //   inline atomique, quel que soit le caractere entre les deux. Retirer
        //   l'espace ne retire pas l'occasion.
        //
        // Ce qui marche est d'interdire la coupure plutot que de la deplacer :
        // les deux derniers mots vivent dans un `white-space: nowrap`, qui
        // supprime les occasions A L'INTERIEUR de lui. L'espace qui PRECEDE ce
        // duo reste dehors, donc la ligne peut toujours se couper avant lui —
        // sinon on lierait trois mots au lieu de deux et on deplacerait le
        // probleme d'un cran.
        //
        // Chaque mot garde son propre `inline-block` et donc son propre souffle
        // dans le stagger : le groupe ne porte que l'interdiction de couper.
        if (mots.length < 2) {
          return <span key={li} style={lineSpanStyle}>{mots.map(mot)}</span>;
        }
        const avant = mots.slice(0, -2).map(mot);
        const i = mots.length - 2;
        return (
          <span key={li} style={lineSpanStyle}>
            {avant}
            {i > 0 && <span style={{ fontSize: 0, lineHeight: 0 }}> </span>}
            <span style={{ whiteSpace: "nowrap" }}>
              {mot(mots[i], 0)}
              {mot(mots[i + 1], 1)}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
