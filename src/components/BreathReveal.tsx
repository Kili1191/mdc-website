"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";

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
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>(".mdc-breath-word").forEach((w) => {
        w.style.opacity = "1";
        w.style.transform = "none";
      });
      return;
    }

    const reveal = () => {
      const words = Array.from(el.querySelectorAll<HTMLElement>(".mdc-breath-word"));
      words.forEach((w, i) => {
        w.style.transition = `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1), transform ${duration}ms cubic-bezier(0.16,1,0.3,1)`;
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
  }, [text, stagger, duration, delay]);

  const lines = text.split(lineBreaks).map((l) => l.trim());

  // overflow:visible sur le wrapper aussi, au cas où un parent applique
  // un mask/clip via CSS.
  const rootStyle: CSSProperties = { overflow: "visible", ...style };

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className} style={rootStyle}>
      {lines.map((line, li) => (
        <span key={li} style={lineSpanStyle}>
          {line.split(/\s+/).map((word, wi) => (
            <span
              key={`${li}-${wi}`}
              className="mdc-breath-word"
              style={wordSpanStyle}
            >
              {word}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
