# MDC — Direction, l'immobilite comme interaction

*Document canonique. Se lit avec `VISION.md` (l'intention), `COPY_V13.md` (les
mots) et `.claude/skills/taste/SKILL.md` (le jugement).*

## Le constat

Le site etait bien construit et couvert d'effets. Ce n'est pas ce qui distingue
un site : on pouvait retirer chaque effet sans que rien ne change dans la facon
dont il fonctionne. L'idee etait ecrite dans les documents, elle n'etait pas
dans la structure.

## L'idee

**Tout le web recompense l'input. Ce site recompense l'arret.**

Scroller plus, survoler plus, cliquer plus : c'est le contrat implicite de
toutes les interfaces. Maison du Calme s'adresse a des gens qui n'arrivent plus
a s'arreter. Le site doit donc faire l'inverse de ce que fait le web.

Quand le scroll et le pointeur se taisent, la pierre s'ouvre. Le motif grave
remonte a la surface, la matiere se rechauffe, le burin s'enfonce tout seul.
Au premier mouvement, tout se retire.

Il y a donc deux axes de progression, pas un :

| axe | mesure | recompense |
|---|---|---|
| scroll | jusqu'ou on est descendu | la traversee, les stations |
| **immobilite** | **combien de temps on s'est arrete** | **la pierre s'ouvre** |

Le second est invisible tant qu'on ne s'arrete pas. C'est voulu.

## Les regles qui tiennent l'idee

1. **La montee dure un souffle.** `stillness` passe de 0 a 1 sur 5500 ms, la
   coherence cardiaque du site. La recompense arrive au rythme de la
   respiration, jamais d'un minuteur.
2. **On perd le calme plus vite qu'on ne le gagne.** La descente est sept fois
   plus vive que la montee. C'est aussi vrai hors du navigateur.
3. **L'immobilite revele de la matiere, jamais des mots.** Aucun texte
   n'apparait a l'arret. La copy reste celle du corpus valide, sans exception.
4. **Un onglet en arriere-plan n'est pas de l'immobilite choisie.** Le compteur
   se reinitialise sur `visibilitychange`.
5. **`prefers-reduced-motion` desactive entierement l'effet.**

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

## Ce qui reste a faire

- **Une seule loi de mouvement.** Tout sur 5500 ms ou un multiple propre, deux
  courbes d'easing au total. Les durees sont encore dispersees.
- **`MagneticButton`** : la signature Awwwards la plus generique qui soit. A
  reconstruire sur le souffle, ou a retirer.

## La navigation traverse la pierre — fait

Un changement de route n'est plus un fondu. La dalle est une seule pierre et
chaque page occupe une coordonnee PRECISE dessus (`src/lib/traverse.ts`).
Naviguer fait glisser la camera d'un point a l'autre.

                       notes
         practitioner     |
                 .    [ ACCUEIL ]    .   sessions
            lineage       |
                      the-work
                          |
                      retreats

    begin est en retrait derriere le seuil : on ressort par ou l'on est entre.

Les coordonnees sont fixes, donc la geographie s'apprend : aller de l'accueil
aux seances deplace toujours la pierre de la meme facon, et revenir refait le
chemin en sens inverse. C'est la difference entre un effet, qui se remarque une
fois, et une structure.

Trois choses se produisent ensemble :

1. **la dalle glisse** — `uPan` dans le shader, des le clic, avant que le
   contenu ne parte ;
2. **le contenu se croise a contre-sens** — l'ancienne page sort du cote d'ou
   l'on vient, la nouvelle entre du cote ou l'on va (`--mdc-dx/--mdc-dy`) ;
3. **la marque se grave** — chaque page porte son nom une fois, sous
   `view-transition-name: mdc-mark`. Le navigateur fait GLISSER ce nom d'une
   position a l'autre au lieu de l'effacer puis de le reecrire.

Le point 3 passe par la View Transitions API : le morph est calcule par le
compositeur, pas par du JavaScript de frame. Sans elle — ou sous
`prefers-reduced-motion` — on retombe sur le fondu manuel, et la camera se pose
d'un coup au lieu de voyager.

**Verifie.** Correlation de phase entre les captures du marbre seul, quatre
paires de pages : ecart mesure a moins d'un pixel de l'ecart predit par la
carte (attendu (-24.4, 51.7), mesure (24, 52) ; attendu (58.5, -78.9), mesure
(-58, -79) ; attendu (151.1, 70.7), mesure (-151, 71) — le signe en x est une
convention de correlation, celui en y l'axe inverse des textures WebGL). Cout :
218 a 333 ms de gel au clic, pendant lesquels la courbe de deplacement n'a
franchi que 10 %.

## Le blocage, dit franchement

**Les neuf photographies.** Les atmospheres generees
(`scripts/generate_atmospheres.py`) empechent le site de paraitre casse, elles
ne remplacent pas une direction artistique. Un jury lit des degrades
procéduraux comme du travail inacheve en deux secondes.

C'est la seule piece que le code ne peut pas produire, et la plus determinante.

## Revenir en arriere

La branche `restore/v1-carve` conserve l'etat du site avant cette direction.

    git checkout restore/v1-carve
