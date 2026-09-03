// src/styles/tokens.ts
// Palette Aube Encens — couleur dans la MATIÈRE, jamais l'UI. Jamais dark/froid.
//
// LES POURCENTAGES SONT UNE PROPORTION, PAS UN BUDGET DE PIXELS. « brou 15 % »
// ne veut pas dire que 15 % de l'ecran est brun — du texte ne couvre jamais
// 15 % d'une page. C'est une regle de hierarchie : le fond domine, l'encre
// suit, l'accent est rare.
//
// Mesure sur trois pages, 555 429 pixels echantillonnes :
//
//   pierre (hors palette)  59,7 %   la photographie de marbre
//   parchemin              37,1 %
//   ocre                    1,6 %
//   taupe                   0,7 %
//   sauge                   0,7 %
//   brou + brouFonce        0,3 %
//   rouille                 0,02 %
//
// CE QUE CA DIT, et c'est la palette qui a raison : sauge et ocre n'ont
// AUCUNE occurrence dans src/, et pourtant ils sont a l'ecran. Ils sont dans
// la pierre. C'est exactement la premiere ligne de ce fichier — la couleur
// vit dans la matiere, pas dans l'interface. Les ecrire en CSS serait les
// sortir de leur place.
//
// La seule couleur qui touche l'interface est le rouille, et c'est assume :
// c'est le logo, et le seul accent du site. A 0,02 % de l'ecran, « rare » est
// tenu.

// CONTRASTES — MESURES SUR LE FOND REEL, pas sur le jeton parchemin.
//
// Methode (scripts/contraste-matiere.mjs) : on repere les rectangles de texte
// rendus, PUIS on passe toute l'encre en `color: transparent` et on
// rephotographie exactement les memes rectangles, curseur maintenu sur le mot
// — le shader reagit a sa position. Ce qui reste dans l'image est le fond, et
// rien d'autre. Aucun pixel de glyphe n'entre dans la mesure.
//
// 1440x900, apres le plancher de luminance du shader
// (MarbleBackground : mix(vec3(0.62,0.58,0.52), blanc, col) en fin de passe) :
//
//                  Y au 1er centile   Y median
//   accueil              0,572          0,836     <- le pire fond du site
//   /sessions            0,657          0,845
//   /begin               0,652          0,847
//
// L'accueil est le plus sombre : vignette plus le creux du curseur. C'est LUI
// qui fixe les seuils, pas la mediane.
//
//   contre le pire fond (Y 0,572)     pire      typique     verdict
//   brou       #4A3B2A                6,38:1    9,09:1      texte, partout
//   brouFonce  #2F2519                8,89:1   12,66:1      titres
//   taupeTrait #74654F                3,35:1    4,82:1      filets et bordures
//   rouille    #B14E2D                3,11:1    4,43:1      marque et traits SEULEMENT
//   taupe      #908067                2,28:1    3,24:1      MATIERE, jamais a l'ecran
//
// CE QUE CA TRANCHE :
// — Le brou tient tout le texte du site sans exception, y compris sur
//   l'accueil sous le curseur. C'est la seule encre.
// — Le rouille passe 3,0 (trait, bordure, signe) et ne passe pas 4,5 : il
//   n'ecrit nulle part. La regle plus bas n'est pas une preference de gout,
//   elle est mesuree.
// — Le taupe echoue meme le seuil des traits dans le pire fond. Il ne peut
//   etre qu'une couleur de matiere : la pierre le contient deja.
//
// Historique de l'erreur, garde parce qu'elle etait couteuse : cette grille a
// longtemps ete calibree contre #EDE4D0, un fond que le site n'affiche JAMAIS
// (c'est le fond du <body>, visible seulement avant le shader et dans le repli
// sans WebGL). La mesure du vrai marbre existait pourtant deja dans le depot,
// a src/styles/page.ts ligne 48. Ne calibrez rien contre un jeton : mesurez
// les pixels que le visiteur recoit.
//
// Seuils : 4,5:1 pour du texte, 3,0:1 pour un trait ou une bordure.
export const COLORS = {
  parchemin:  "#EDE4D0", // fond — 55%
  brou:       "#4A3B2A", // texte courant — 8,52:1
  brouFonce:  "#2F2519", // titres forts — 11,87:1

  // LE ROUGE DE LA MAISON, mesure sur public/logo.png : #B14E2D domine
  // (510 px), moyenne ponderee #B14E2C. Le jeton disait « logo » et valait
  // #A55A3E : 24 de distance RGB, l'oeil separe les deux teintes.
  //
  // Il en faut DEUX, et c'est le contraste qui l'impose. Le rouge du logo
  // donne 4,16:1 — assez pour une marque ou un trait, pas pour du texte.
  // Or `rouille` servait de couleur de texte sur TOUS les boutons, le lien
  // BEGIN et le mailto de /begin.
  // UN SEUL ROUGE, et il n'ecrit jamais.
  //
  // J'avais dedouble le rouge — rouille pour la marque, rouilleEncre #A84A2B
  // pour le texte — en calibrant contre #EDE4D0. Sur le fond REEL, ce second
  // rouge vaut 2,43:1 sur les pages internes et 1,18:1 sur l'accueil sous le
  // curseur. Il n'atteignait son but nulle part.
  //
  // Et il n'existe aucun point qui garde la teinte du logo ET passe 4,5:1 :
  // il faudrait #7B1A00, a ΔE00 = 16 du logo, c'est-a-dire un autre rouge.
  //
  // Donc le rouille est la MARQUE et rien d'autre — un trait, une bordure,
  // un signe, une pastille. L'encre est le brou. Sous le lien BEGIN, c'est le
  // filet qui porte le rouge, pas le mot.
  rouille:    "#B14E2D", // valeur exacte du logo, mesuree sur ses pixels

  // Traits et bordures. #A89A85 donnait 2,18:1 ; #908067 donne 3,04:1 sur le
  // parchemin — mais 2,28 au 1er centile de l'accueil. Il reste MATIERE.
  taupe:      "#908067",

  // Le trait qui se voit sur la PIERRE, pas sur le parchemin. C'est lui qui
  // porte les filets, les bordures et les soulignements de champ.
  //
  // #7E6E56 tenait 3,33:1 sur les pages internes mais tombait a 2,93:1 au 1er
  // centile de l'accueil — sous le seuil la ou le fond est le plus sombre.
  // Assombri de 8 % en sRGB : l'ecart est dans la clarte (L* 47,3 -> 43,6),
  // la teinte ne bouge pas (h 81,4 -> 81,0). ΔE00 = 3,6 — visible cote a cote,
  // invisible dans l'usage, et c'est ce qui le fait passer partout.
  taupeTrait: "#74654F", // 3,35:1 au pire fond · 4,82:1 typique

  // Les deux barreaux qui manquaient a l'echelle. Mesure en OKLCH, les ecarts
  // de clarte etaient : 0,092 — 0,244 — 0,021 — 0,071 — 0,221. Deux trous.
  terre:      "#6C5A43", // okL 0,480 — comble le trou bas. MATIERE, jamais encre.
  craie:      "#CBBFAC", // okL 0,810 — comble le trou haut. Voile, bordure claire, ecru.

  // sauge est la seule couleur du cote VERT du jaune : okH 106,2 quand toute
  // la famille est entre 69,9 et 86,6. C'est aussi la seule qui peut lire
  // FROID en aplat, ce que la doctrine de ce fichier interdit. Ramenee a 96,0.
  // Ecart avec l'ancienne : ΔE00 = 1,9 — invisible seule, decisif en aplat.
  sauge:      "#918969",

  ocre:       "#B89968",

  // ETATS. Aucun n'est froid, aucun n'est achromatique — la palette n'a pas
  // de gris et c'est sa force. AUCUN NE PORTE SEUL UNE INFORMATION : sur un
  // fond qui varie de Y 0,16 a 0,88, la couleur ne peut rien signaler toute
  // seule. Toujours doubler d'un mot, d'un filet ou d'une graisse.
  alerte:     "#922716", // rouille pousse vers le rouge et assombri
  olive:      "#4F502B", // descendant assombri de sauge — une olive, pas un vert de succes
  eteint:     "#908067", // = taupe : il ne passe aucun seuil de texte, c'est exactement
                         // ce qu'on veut d'un etat desactive. Doubler d'aria-disabled.
} as const;

export const FONTS = {
  // Prata = corps + sous-titres · Higuen = gros titres uniquement · Great Vibes = exceptionnel
  prata:      "var(--font-prata), Georgia, serif",
  higuen:     "var(--font-higuen), Georgia, serif",
  // Great Vibes n'est plus declaree dans le layout : elle ne sert qu'a la
  // signature de /practitioner, et le layout la faisait telecharger sur les
  // huit pages. Elle est chargee dans cette page-la. Ce jeton ne vaut donc
  // que si la variable existe dans l'arbre — c'est-a-dire sur /practitioner.
  greatVibes: "var(--font-great-vibes), cursive",
} as const;

// Échelle d'espacement (pour des marges cohérentes partout)
export const SPACE = {
  xs: "8px", sm: "16px", md: "32px", lg: "64px", xl: "120px", xxl: "200px",
} as const;
