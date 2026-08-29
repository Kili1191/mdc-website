import { COLORS, FONTS } from "@/styles/tokens";

// Le bouton de la maison.
//
// Il remplace `MagneticButton`, qui attirait le bouton vers le curseur. C'etait
// la signature Awwwards la plus repandue de la decennie, et elle disait
// exactement le contraire de ce que ce site vend : dans une maison silencieuse,
// rien ne court apres personne. Un bouton qui fuit ou qui saute au-devant du
// geste est un bouton nerveux.
//
// Trois choses le rendaient en plus mauvais, et pas seulement generique :
//
//   - il se decentrait. `pull` valait 0,35 sur un rayon de 90 px, donc un
//     bouton pouvait s'asseoir jusqu'a 31 px de son axe simplement parce que
//     le curseur passait a cote. Sur les stations centrees de l'accueil, c'est
//     visible, et c'est ce que Kilian avait remarque ;
//   - il tournait en permanence. Chaque instance ouvrait une boucle
//     `requestAnimationFrame` et un ecouteur `mousemove` sur `window`, a vie.
//     L'accueil en portait quatre, en plus de la boucle WebGL du marbre ;
//   - il ne repondait qu'a la souris. Au doigt, il ne se passait rien : la
//     seule chose que le bouton avait a offrir n'existait pas sur mobile.
//
// Ici la pierre se rechauffe sous la main, et rien ne bouge. L'arrivee dure un
// souffle sur six comme toutes les revelations du site, le retrait la moitie :
// on perd la chaleur plus vite qu'on ne la gagne, exactement comme le reste.
export default function QuietButton({
  children, href,
}: { children: React.ReactNode; href?: string }) {
  return (
    <a
      className="mdc-button"
      href={href ?? "#"}
      style={{
        fontFamily: FONTS.prata,
        color: COLORS.rouille,
        borderColor: COLORS.rouille,
      }}
    >
      {children}
    </a>
  );
}
