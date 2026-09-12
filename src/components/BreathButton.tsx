"use client";

import { useEffect, useState } from "react";
import { ouvrirLeSouffle } from "@/lib/introReady";
import { COLORS, FONTS } from "@/styles/tokens";

// L'intro n'est plus seulement une porte franchie une fois. Kilian : « faut
// que le user puisse y avoir acces a chaque fois si envie, et un mode
// seamless loop si besoin d'exercice ».
//
// Ce bouton rouvre le souffle en MODE EXERCICE : le cycle 4-2-6 boucle sans
// fin jusqu'a ce qu'on ferme. C'est la seule chose du site qui fait quelque
// chose POUR le visiteur avant qu'il ait ecrit ou paye — et c'est exactement
// ce que la maison pretend faire.
//
// ─────────────────────────────────────────────────────────────────────────
// POURQUOI DEUX VARIANTES, ET PAS UN BOUTON FIXE PARTOUT.
//
// Mesure sur iPhone 13, trois captures : « breathe » etait POSE SUR LE CORPS
// DU TEXTE. Sur l'accueil il recouvrait la ligne de meta d'une carte du rail,
// sur Sessions il barrait une phrase du texte courant.
//
// Deux causes, et la premiere est une betise :
//
//   `right: 74px` reservait la place du bouton de son. Or SoundToggle ne se
//   rend PAS sur un pointeur grossier (sa propre regle, mesuree et corrigee
//   plus tot). Sur telephone, « breathe » se posait donc a 74px du bord, en
//   plein milieu de la colonne de texte, pour laisser la place a un voisin
//   absent.
//
//   Mais meme colle au bord, un element fixe en bas d'ecran passe sa vie sur
//   le texte : un telephone n'a pas de marge ou le poser. A 390px de large,
//   la colonne de texte EST l'ecran. Sur desktop il y a 8vw de marge, et le
//   bouton y vit sans jamais rien recouvrir.
//
// Donc : fixe sur pointeur fin, et RANGE DANS LE PIED DE PAGE sur pointeur
// grossier. Meme composant, meme geste, meme mot. Ce qui change est
// seulement l'endroit ou il a le droit de se tenir.
// ─────────────────────────────────────────────────────────────────────────

type Variante = "fixe" | "range";

// Ni l'une ni l'autre ne se rend tant qu'on n'a pas mesure le pointeur :
// afficher les deux une frame ferait clignoter le mot a deux endroits.
function usePointeurFin(): boolean | null {
  const [fin, setFin] = useState<boolean | null>(null);
  useEffect(() => { setFin(window.matchMedia("(pointer: fine)").matches); }, []);
  return fin;
}

export default function BreathButton({ variante = "fixe" }: { variante?: Variante }) {
  const [visible, setVisible] = useState(false);
  const fin = usePointeurFin();

  // Il n'apparait qu'une fois l'intro passee : proposer de respirer par-dessus
  // une respiration en cours n'a pas de sens.
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  if (fin === null) return null;
  if (variante === "fixe" && !fin) return null;
  if (variante === "range" && fin) return null;

  const commun: React.CSSProperties = {
    background: "transparent", border: 0,
    borderBottom: "1px solid rgba(74,59,42,0.35)",
    fontFamily: FONTS.prata, letterSpacing: "0.22em",
    textTransform: "lowercase", color: COLORS.brou,
    cursor: "pointer",
    // 0,82 et non 0,62 : « breathe » est un mot, pas une icone, donc la
    // barre est a 4,5:1. A 0,62 il donnait 3,20. Le plancher mesure du
    // skill taste, 0,82, donne 5,18.
    opacity: visible ? 0.82 : 0,
    transition: "opacity 900ms cubic-bezier(0.16,1,0.3,1)",
  };

  return (
    <button
      onClick={ouvrirLeSouffle}
      aria-label="Breathe, a guided cycle you can repeat"
      style={
        variante === "fixe"
          ? {
              ...commun,
              position: "fixed", right: 74, bottom: 22, zIndex: 90,
              fontSize: 11.5, padding: "6px 2px",
            }
          : {
              // Range : plus grand et plus haut, parce qu'un pouce le vise.
              // 44px de haut, la cible que le reste de la barre du haut
              // atteint desormais aussi.
              ...commun,
              display: "inline-flex", alignItems: "center", minHeight: 44,
              fontSize: 14, padding: "0 2px",
            }
      }
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.82"; }}
    >
      breathe
    </button>
  );
}
