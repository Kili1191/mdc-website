"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";

// Titre révélé mot par mot au rythme du souffle.
// Chaque mot fade + monte légèrement, staggerés — un souffle traverse
// la phrase de gauche à droite en ~1.2s. Déclenché quand l'élément
// entre dans le viewport via IntersectionObserver (une seule fois).
//
// Usage :
//   <BreathReveal text="For those who carry everything inside." as="h1" />
// ou :
//   <BreathReveal text="Kilian." as="h1" style={{...}} />

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

    // prefers-reduced-motion : on affiche instantanément
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
        // laisse le browser peindre l'état initial puis déclenche
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

  // Sépare texte → lignes (par lineBreaks) → mots.
  const lines = text.split(lineBreaks).map((l) => l.trim());

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className} style={style}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block" }}>
          {line.split(/\s+/).map((word, wi) => (
            <span
              key={`${li}-${wi}`}
              className="mdc-breath-word"
              style={{
                display: "inline-block",
                opacity: 0,
                transform: "translateY(0.4em)",
                marginRight: "0.28em",
                willChange: "opacity, transform",
              }}
            >
              {word}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
