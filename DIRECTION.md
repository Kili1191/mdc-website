# MDC — Direction, l'immobilite comme interaction

*Document canonique. Se lit avec `VISION.md` (l'intention), `COPY_V13.md` (les
mots) et `.claude/skills/taste/SKILL.md` (le jugement).*

## Le constat

Le site etait bien construit et couvert d'effets. Ce n'est pas ce qui distingue
un site : on pouvait retirer chaque effet sans que rien ne change dans la facon
dont il fonctionne. L'idee etait ecrite dans les documents, elle n'etait pas
dans la structure.

## L'idee, et ce qu'il en reste

**Tout le web recompense l'input. Ce site devait recompenser l'arret.**

Quand le scroll et le pointeur se taisaient, la pierre s'ouvrait : le motif
remontait a la surface, la matiere se rechauffait, le burin s'enfoncait tout
seul. C'etait la direction canonique de ce document.

**Le fond ne le fait plus.** Retire sur signalement de Kilian, deux fois : « le
fond respire entre la couche 1 et la couche 2 », et sur Sessions « c'est la
maison gravee ».

Il avait raison, et l'erreur etait de conception, pas de reglage. De
l'interieur, une pierre qui s'ouvre quand on s'arrete est une recompense. De
l'exterieur, personne ne sait qu'il a ete recompense : on voit un fond qui
change tout seul, sans qu'on ait rien fait, et sur une page de contenu on voit
la maison gravee du motif remonter DERRIERE le texte. Une interaction que
l'utilisateur ne peut pas attribuer a son propre geste n'est pas une
interaction, c'est une instabilite.

Mesure, visiteur parfaitement immobile sur l'accueil, detail local du fond :
avant 34,81 puis 36,79 apres dix secondes, et ca continuait de monter ; apres,
34,61 a chaque echantillon, sans une decimale d'ecart. Sur Sessions, texte
masque, la zone ou la gravure remontait : avant 4,94 / 3,92 / 5,39 / 4,21 ;
apres 3,38 / 3,41 / 3,41 / 3,41.

### Ce qui reste de l'idee

L'immobilite n'a pas disparu : elle a ete rendue a l'endroit ou Kilian l'avait
demandee. Sur la station MAISON de l'accueil, rester tranquille enfonce le
burin et ravive la braise au fond du sillon. La gravure y respire, comme
demande. Le FOND, lui, ne bouge plus jamais tout seul.

C'est la meme regle que pour la couche marbre : **le sol du site ne change pas
sans qu'on le lui demande.** Le pointeur et le doigt l'ouvrent — c'est un geste,
on sait ce qu'on a fait. Rien d'autre ne l'ouvre.

### Le regime par page passe par des uniforms, jamais par des props

Sur une page de contenu, la revelation s'attenue ET evite la gravure du motif :
deux maisons a l'ecran, celle du site et celle de la pierre, ne s'expliquent
pas. Ce reglage vit dans `src/lib/marbleMode.ts`, lu a la frame et lisse sur un
demi-souffle.

Il ne peut PAS etre une prop de `MarbleBackground` : l'effet WebGL en
dependrait, donc chaque navigation detruirait le renderer. C'est exactement ce
qui laissait l'ecran sans marbre pendant pres de deux secondes.

## Les regles qui tiennent l'idee

1. **Le fond ne s'ouvre que sur un geste.** Pointeur ou doigt. Ni minuteur, ni
   immobilite, ni horloge.
2. **La couche marbre ne se reconstruit jamais.** Ce qui varie par page est un
   uniform lu a la frame.
3. **L'immobilite revele de la matiere, jamais des mots.** Aucun texte
   n'apparait a l'arret.
4. **`prefers-reduced-motion` desactive entierement l'effet.**

## Ce qui a ete retire, et pourquoi

Retirer est la moitie du travail. Chaque element ci-dessous etait construit,
fonctionnel, et affaiblissait l'ensemble.

| retire | raison |
|---|---|
| `TextScramble` | des lettres qui se brouillent, signature 2019, et ca contredit le calme |
| `ImageMarquee`, `Marquee` | jamais cables sur une vraie page |
| `ParallaxStack`, `DepthImageLayer` | idem, code mort |
| `HorizontalScroll`, `SmoothScroll` | doublons de `ScrollProvider` |
| `/effects`, `/test-site` | pages de demonstration servies en production |
| `MagneticButton` | le bouton courait apres le curseur. Mesure : jusqu'a 21,4 px hors de son axe quand le curseur passait a 88 px sans jamais le toucher, une boucle `requestAnimationFrame` par instance a vie (quatre sur l'accueil), et rien du tout au doigt. Remplace par `QuietButton` : la pierre se rechauffe sous la main, rien ne bouge. Decalage mesure apres : 0,0 px |

## Ce qui reste a faire

- **Une seule loi de mouvement.** Tout sur 5500 ms ou un multiple propre, deux
  courbes d'easing au total. Les durees sont encore dispersees.
- **La navigation traverse la pierre.** Un changement de route n'est pas un
  fondu : la camera se deplace sur une meme dalle et la marque de la
  destination s'y grave a l'arrivee. La gravure devient la grammaire du site.

## Ce qui a ete essaye pour la navigation, et retire

La navigation a traverse la pierre pendant deux versions : chaque page avait une
coordonnee sur la dalle, la camera glissait de l'une a l'autre, et le nom de la
page glissait avec elle via la View Transitions API. La geographie fonctionnait,
mesuree au pixel pres. Tout a ete retire.

**Une view transition remplace la page par des instantanes, et un canvas WebGL
ne survit pas a l'instantane.** Pendant toute la traversee, le marbre n'etait
plus a l'ecran : fond parchemin plat, deux copies fantomes du logo qui se
croisaient dessus. Contraste global de l'image : 12,13 au depart, 7,75 au
milieu. Lui donner son propre `view-transition-name` n'y changeait rien
(8,60 contre 7,75).

Anime en CSS sur le wrapper de contenu, sans instantane, le marbre tenait la
mesure (15,42 / 15,16 / 14,98). Ca ne suffisait pas non plus : deplacer la
pierre entre deux pages, meme sans jamais la capturer, se lit encore comme une
couche qui change. Retire sur demande.

**La regle qui en sort, et qui prime sur toute idee de navigation :** le marbre
n'apparait pas, ne disparait pas, ne se deplace pas d'une page a l'autre. C'est
le sol du site, pas une couche parmi d'autres. Toute technique qui le capture,
le fige, le fond ou le fait glisser est disqualifiee, quelle que soit sa valeur
par ailleurs.

## Le vrai coupable etait ailleurs, et il etait la depuis le debut

Apres avoir tout remis en etat, le defaut restait. Il ne venait pas des
transitions de page.

`SiteMarble` choisissait un motif PAR PAGE — bodhi sur practitioner, lineage et
the-work, compo ailleurs. Or le motif est une prop de `MarbleBackground`, dont
l'effet WebGL depend. Changer de page detruisait donc le renderer, retirait le
canvas du DOM et en reconstruisait un autre, opacite zero, en attendant le
telechargement de la nouvelle texture.

Mesure sur le build de production, /sessions -> /practitioner, releve toutes
les 120 ms : canvas remplace, **opacite 0 de 2,4 s a 4,2 s**, pleine opacite a
4,9 s. Pres de deux secondes de fond parchemin plat, puis la pierre revient en
fondu.

Le motif est desormais unique pour tout le site. Une variation de matiere entre
les pages ne vaut pas deux secondes de vide. Verifie par un tour complet des
huit pages, releve toutes les 60 ms : zero frame sans canvas, zero frame avec
un autre canvas, opacite minimale observee 1.

Reste a savoir, si la variation de matiere revient un jour : elle devra se
faire par un fondu de texture DANS le shader, sans jamais reconstruire la
couche.

## Les images — faites, et tirees de la vraie matiere

Le blocage annonce ici pendant des semaines etait : « les neuf photographies,
c'est la seule piece que le code ne peut pas produire ». C'etait faux, et il a
fallu que Kilian le dise pour qu'on regarde.

`public/motif-compo-full.jpg` est une photographie reelle en 5504x3072 du
bas-relief d'onyx de la maison : lotus sculptes, veinage chaud, et la maison
gravee en haut. C'est la matiere de la marque, et personne d'autre ne l'a. Il
n'y avait rien a inventer.

`scripts/generate_images.py` en tire les huit slots du site. Chacun est un
CADRAGE de cette meme pierre a une distance differente, du champ large au
petale isole. Une seule matiere, une seule lumiere, huit distances : c'est ce
qui fait une serie plutot qu'une collection.

Quatre traitements pour que ca se lise comme de la photographie et non comme de
la texture :

1. le cadrage se prend dans les pixels d'origine, jamais agrandi ;
2. une source de lumiere unique avec sa vraie decroissance — sans elle une
   texture reste plate, aussi fine soit-elle ;
3. une profondeur de champ : le flou croit avec la distance au point de
   nettete. C'est le signal le plus fort qu'un oeil lit « photographie » ;
4. un etalonnage Aube Encens **multiplicatif**. Soustraire pour l'ombre retire
   plus de rouge que de bleu et desature la pierre chaude vers le gris argent —
   l'erreur deja faite sur la gravure du marbre.

**Une regle d'exposition, pas huit reglages.** Premier jet : luminance moyenne
149 pour l'image contre 205 pour le marbre autour. Elle ne paraissait pas
froide — elle etait plus chaude que le fond (R-B de 62 contre 36) — elle
paraissait LOURDE. Un bloc sombre sur une page claire casse le calme qu'on
vend. Toutes les images sont donc ramenees a la meme luminance, avec un
epaulement dans les hautes lumieres : 168 a 184 sur les huit. La serie tient
ensemble, et elle tient avec le fond.

### Ce que ces images ne sont pas

`pt-01` est la maison gravee dans la pierre, pas un portrait. **Le vrai
portrait de Kilian reste la seule image que lui seul peut fournir**, et c'est
la seule qui manque encore vraiment.

Les neuf `public/photo-*.jpg` presentes dans le depot n'ont pas ete utilisees :
sauge et cristaux, agave bleu-vert, salle de spa a stores venitiens, cartes de
tarot. C'est exactement le cliche bien-etre que la maison refuse, et c'est hors
palette. Une seule tient — `photo-8.jpg`, un vrai support de shirodhara — et
elle reste disponible si un jour la page Sessions veut montrer le geste
ayurvedique plutot que la pierre.

## Revenir en arriere

La branche `restore/v1-carve` conserve l'etat du site avant cette direction.

    git checkout restore/v1-carve
