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
- **La navigation traverse la pierre.** Un changement de route n'est pas un
  fondu : la camera se deplace sur une meme dalle et la marque de la
  destination s'y grave a l'arrivee. La gravure devient la grammaire du site.
- **`MagneticButton`** : la signature Awwwards la plus generique qui soit. A
  reconstruire sur le souffle, ou a retirer.

## Le blocage, dit franchement

**Les neuf photographies.** Les atmospheres generees
(`scripts/generate_atmospheres.py`) empechent le site de paraitre casse, elles
ne remplacent pas une direction artistique. Un jury lit des degrades
procéduraux comme du travail inacheve en deux secondes.

C'est la seule piece que le code ne peut pas produire, et la plus determinante.

## Revenir en arriere

La branche `restore/v1-carve` conserve l'etat du site avant cette direction.

    git checkout restore/v1-carve
