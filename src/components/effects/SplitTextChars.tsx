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
// marge etait decrit dans Descente.tsx comme « une gravure eclairee d'en haut a
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
//
// ─────────────────────────────────────────────────────────────────────────
// AUCUN TITRE NE FINIT SUR UN MOT SEUL.
//
// Kilian, sur l'accueil en production : « the sentence with only one word a la
// ligne stupid ».
//
// DEUX CORRECTIFS ESSAYES AVANT CELUI-CI, ET LES DEUX SONT INOPERANTS ICI.
//
//   `text-wrap: pretty` et `balance`, poses dans globals.css et faits
//   exactement pour ca. Chromium les abandonne des qu'un bloc contient des
//   boites inline ATOMIQUES, et chaque caractere en est une — l'inline-block
//   est ce qui permet de le tailler. Verifie sur le build : la propriete
//   calculee vaut bien `pretty`, la coupure ne bouge pas d'un mot.
//
//   une espace insecable avant le dernier mot. Elle ne peut rien non plus :
//   CSS Text ouvre une occasion de coupure AVANT ET APRES chaque inline
//   atomique, quel que soit le caractere entre les deux. Retirer l'espace ne
//   retire pas l'occasion.
//
// Ce qui marche est d'INTERDIRE la coupure au lieu de la deplacer : les deux
// derniers mots vivent dans un `white-space: nowrap`, qui supprime les
// occasions a l'interieur de lui. L'espace qui PRECEDE ce duo reste dehors,
// donc la ligne peut toujours se couper avant lui — sinon on lierait trois
// mots au lieu de deux et le probleme reculerait d'un cran.
//
// Chaque caractere garde son propre inline-block, donc son propre temps dans
// le passage de l'outil. Le groupe ne porte que l'interdiction de couper.
// ─────────────────────────────────────────────────────────────────────────

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

  // UNE PHRASE NE SE COUPE QUE SI ELLE NE TIENT PAS.
  //
  // Kilian : « make sure to cut sentences a la ligne quand cest vraiment
  // necessaire autrement mets toute la phrases a la ligne ». Releve sur
  // /the-work : « He will never tell you how. » occupait 536px dans une
  // colonne de 548 et cassait quand meme apres « never ».
  //
  // Chaque phrase devient une boite inline-block : posee ENTIERE si elle tient
  // sur la ligne courante, descendue ENTIERE sinon, et coupee a l'interieur
  // seulement si elle est plus large que la colonne. Meme mecanique que
  // BreathReveal, et elle ne coute aucune mesure a l'execution.
  const phrases = text.split(/(?<=[.!?]["»”’]?)\s+/).filter(Boolean);
  // Rang du caractere sur la LIGNE ENTIERE, espaces compris dans le compte du
  // temps : c'est ce qui fait que l'outil avance a vitesse constante et ne
  // ralentit pas sur les mots courts. Il se compte dans l'ordre du texte, donc
  // avant tout decoupage en groupes.
  let rang = 0;

  const rendu = (part: string, wi: number) => {
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
  };

  // Une phrase : ses mots, et les deux derniers lies pour qu'aucune ligne ne
  // finisse sur un mot seul. L'espace qui PRECEDE le duo reste dehors, sinon
  // on lierait trois mots et le probleme reculerait d'un cran.
  const phraseRendue = (texte: string, pi: number) => {
    const parts = texte.split(/(\s+)/);
    const pleins = parts.map((m, i) => ({ m, i })).filter(({ m }) => m && !/^\s+$/.test(m));
    const debutDuo = pleins.length > 1 ? pleins[pleins.length - 2].i : -1;
    const coupe = debutDuo === -1 ? parts.length : debutDuo;
    const cle = (k: number) => pi * 1000 + k;
    return (
      <>
        {parts.slice(0, coupe).map((part, wi) => rendu(part, cle(wi)))}
        {debutDuo !== -1 && (
          <span style={{ whiteSpace: "nowrap" }}>
            {parts.slice(coupe).map((part, k) => rendu(part, cle(coupe + k)))}
          </span>
        )}
      </>
    );
  };

  return (
    <span ref={ref} style={{ display: "inline", overflow: "visible" }}>
      {phrases.map((ph, pi) => (
        <span key={pi} style={{ display: "inline-block" }}>
          {pi > 0 && <span style={{ fontSize: 0, lineHeight: 0 }}> </span>}
          {phraseRendue(ph, pi)}
        </span>
      ))}
    </span>
  );
}
