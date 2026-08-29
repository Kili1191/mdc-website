"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useIntroReady } from "@/lib/introReady";
import MarbleBackground from "@/components/MarbleBackground";

// Couche marbre unique, montee dans layout.tsx, fond persistant de TOUT le
// site (VISION §1 : « le site entier vit dans le marbre »).
//
// UNE SEULE DALLE, POUR TOUTE LA VISITE. Ce composant ne depend plus de la
// route, et c'est deliberé.
//
// Il choisissait avant un motif par page — bodhi sur les pages intimes,
// compo ailleurs. L'intention etait bonne, le prix ne l'etait pas : le motif
// est une PROP de MarbleBackground, dont l'effet WebGL en depend. Changer de
// motif detruisait donc le renderer, retirait le canvas du DOM et en
// reconstruisait un autre, opacite zero, en attendant le telechargement de la
// nouvelle texture.
//
// Mesure sur le build de production, /sessions -> /practitioner : canvas
// remplace, puis opacite 0 de 2,4 s a 4,2 s, pleine opacite a 4,9 s. Pres de
// DEUX SECONDES sans marbre, fond parchemin plat, puis la pierre revient en
// fondu. C'est exactement ce que voyait Kilian : « la couche marbre apparait
// et disparait ». Le defaut ne venait pas des transitions de page, il venait
// d'ici, et il etait la depuis le debut.
//
// Le fond du site n'est pas une couche parmi d'autres, c'est le sol. Il ne se
// reconstruit pas, il ne se refond pas, il ne s'interrompt pas. Une variation
// de matiere entre les pages ne vaut pas deux secondes de vide.
// `calme` reduit la revelation au curseur pour la lisibilite du texte. C'est
// une valeur de construction du shader, pas un uniform pilote a la frame : la
// changer en cours de route reconstruirait la couche, donc on la fige a
// l'arrivee. C'est deja ce que faisait le code precedent, sans le dire — son
// effet ne dependait que du motif.
export default function SiteMarble() {
  const ready = useIntroReady();
  const pathname = usePathname();
  const [calme] = useState(() => pathname !== "/");
  if (!ready) return null;
  return <MarbleBackground motif="/motif-compo.jpg" calme={calme} />;
}
