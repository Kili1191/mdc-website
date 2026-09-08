"use client";
import { useEffect, useRef } from "react";

// LE BURIN.
//
// Les lettres n'apparaissent pas : elles se font CREUSER. Un outil passe le
// long de la ligne, et derriere lui chaque caractere est taille dans la pierre
// — arete claire en bas a droite, ombre portee en haut a gauche.
//
// Ce n'est pas un effet choisi dans un catalogue. C'est la langue que ce depot
// parlait deja partout sans jamais l'appliquer au texte : le sillon de la
// marge est decrit dans Descente.tsx comme « une gravure eclairee d'en haut a
// gauche, la meme lumiere que le marbre », la station MAISON pilote un burin
// dans le shader, et DIRECTION.md appelle la page une descente gravee. Le
// texte, lui, etait simplement POSE sur la pierre. Il y est maintenant entre.
//
// Les deux valeurs de lumiere sont reprises telles quelles du sillon :
// rgba(47,37,25,0.42) pour le creux, rgba(255,251,241,0.66) pour la levre.
//
// CE QUI NE CHANGE PAS : la couleur de l'encre. Le brou reste le brou, a
// 6,93:1. La taille est un relief autour de la lettre, jamais un
// remplacement de sa couleur — le plancher de contraste survit au virage du
// 8 septembre, et une lettre couleur pierre serait illisible.
//
// UN DEFAUT CORRIGE AU PASSAGE. Le decalage de chaque caractere se calculait
// sur son rang DANS SON MOT : l'index repartait a zero a chaque espace. Avec un
// simple fondu ca ne se voyait pas ; avec un outil qui parcourt la ligne, le
// burin serait reparti au debut de chaque mot. L'index est desormais global.

export default function SplitTextChars({
  text, delay = 20, duration = 900,
}: { text: string; delay?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mouvement reduit : la taille est la, l'outil ne passe pas. On garde le
    // relief, qui est une apparence, et on retire le geste, qui est du
    // mouvement. La preference systeme passe avant le virage.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>(".mdc-char").forEach((c) => {
        c.style.animation = "none";
        c.style.opacity = "1";
        c.style.transform = "none";
        c.classList.add("mdc-char--grave");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        el.querySelectorAll<HTMLElement>(".mdc-char").forEach((c) => {
          c.style.animationPlayState = "running";
        });
        io.disconnect();
      }),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, delay, duration]);

  const parts = text.split(/(\s+)/);
  // Rang du caractere sur la LIGNE ENTIERE, espaces compris dans le compte du
  // temps : c'est ce qui fait que l'outil avance a vitesse constante et ne
  // ralentit pas sur les mots courts.
  let rang = 0;

  return (
    <span ref={ref} style={{ display: "inline", overflow: "visible" }}>
      {parts.map((part, wi) => {
        if (/^\s+$/.test(part)) { rang += part.length; return <span key={wi}>{part}</span>; }
        return (
          <span
            key={wi}
            style={{ display: "inline-block", whiteSpace: "nowrap", overflow: "visible" }}
          >
            {Array.from(part).map((c, i) => {
              const r = rang++;
              return (
                <span
                  key={i}
                  className="mdc-char"
                  style={{
                    display: "inline-block",
                    willChange: "opacity, transform",
                    paddingBottom: "0.05em",
                    animation: `mdc-burin ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${r * delay}ms both`,
                    animationPlayState: "paused",
                  }}
                >
                  {c}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
