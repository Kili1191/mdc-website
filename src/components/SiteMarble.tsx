"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useIntroReady } from "@/lib/introReady";
import { marbleMode } from "@/lib/marbleMode";
import MarbleBackground from "@/components/MarbleBackground";

// Couche marbre unique, montee dans layout.tsx, fond persistant de TOUT le
// site (VISION §1 : « le site entier vit dans le marbre »).
//
// UNE SEULE DALLE, POUR TOUTE LA VISITE. Ce composant ne passe aucune prop
// dependant de la route, et c'est deliberé : le motif etait une prop de
// MarbleBackground, dont l'effet WebGL depend, donc changer de page detruisait
// le renderer et laissait l'ecran sans marbre pendant pres de deux secondes.
// Mesure et details dans DIRECTION.md.
//
// Ce qui varie par page passe donc par des UNIFORMS lus a la frame, jamais par
// des props : `marbleMode` porte l'attenuation et le masque de la gravure, et
// se lisse sur un demi-souffle pour qu'un changement de page ne bascule pas.
export default function SiteMarble() {
  const ready = useIntroReady();
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    const quiet = pathname !== "/";
    if (first.current) { marbleMode.jump(quiet); first.current = false; }
    else marbleMode.set(quiet);
  }, [pathname]);

  if (!ready) return null;
  return <MarbleBackground motif="/motif-compo.jpg" calme={pathname !== "/"} />;
}
