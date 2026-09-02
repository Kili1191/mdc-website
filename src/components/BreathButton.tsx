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
// Il se place a gauche du bouton de son, meme coin, meme discretion.
export default function BreathButton() {
  const [visible, setVisible] = useState(false);

  // Il n'apparait qu'une fois l'intro passee : proposer de respirer par-dessus
  // une respiration en cours n'a pas de sens.
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <button
      onClick={ouvrirLeSouffle}
      aria-label="Breathe — a guided cycle you can repeat"
      style={{
        position: "fixed", right: 74, bottom: 22, zIndex: 90,
        background: "transparent", border: 0,
        borderBottom: `1px solid rgba(74,59,42,0.35)`,
        fontFamily: FONTS.prata, fontSize: 11.5, letterSpacing: "0.22em",
        textTransform: "lowercase", color: COLORS.brou,
        padding: "6px 2px", cursor: "pointer",
        opacity: visible ? 0.62 : 0,
        transition: "opacity 900ms cubic-bezier(0.16,1,0.3,1)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.62"; }}
    >
      breathe
    </button>
  );
}
