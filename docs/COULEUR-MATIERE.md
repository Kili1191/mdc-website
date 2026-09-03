# Aube Encens hors écran — référence pour le textile et l'impression

Ce document sert à commander de la matière : tissu, papier, encre, broderie.
Il ne sert pas à écrire du CSS — pour l'écran, la source de vérité reste
`src/styles/tokens.ts`.

---

## 1. Ce que ce document peut et ne peut pas garantir

Les valeurs ci-dessous sont **dérivées des hex sRGB de la marque**, calculées en
CIELAB, illuminant **D65, observateur 2°** — c'est-à-dire l'observateur pour
lequel sRGB est défini. Le textile se contrôle conventionnellement en **D65/10°**.
Ce sont deux observateurs différents et je ne convertis pas de l'un vers l'autre
en partant d'un espace écran : ce serait un chiffre inventé.

Donc, en clair :

- ces L\*a\*b\* sont un **point de départ exact pour la couleur à l'écran**, pas
  un étalon textile ;
- avant toute production, il faut **un étalon physique** — un lab dip ou un tirage
  papier — mesuré au spectrophotomètre en **D65/10°, SCI, ouverture 8 mm**, et
  c'est *ce* relevé qui devient la référence ;
- les noms Pantone en §4 sont une **présélection non vérifiée**. Aucun n'a été
  mesuré. Ils servent à demander les bons chips au fournisseur, pas à commander.

Le métamérisme est le vrai risque : deux teintures qui s'accordent en D65 peuvent
diverger sous l'halogène d'une boutique. D'où le §5.

---

## 2. Les valeurs

sRGB → CIELAB, D65/2°.

| Jeton | Hex | L\* | a\* | b\* | C\* | h° | Rôle hors écran |
|---|---|---|---|---|---|---|---|
| parchemin | `#EDE4D0` | 90,80 | −0,26 | 10,86 | 10,86 | 91,4 | fond de page, papier, doublure |
| craie | `#CBBFAC` | 77,84 | 1,04 | 11,11 | 11,16 | 84,6 | écru, voile, seconde peau |
| ocre | `#B89968` | 64,94 | 4,86 | 30,04 | 30,43 | 80,8 | matière chaude, rare |
| sauge | `#918969` | 57,01 | −2,34 | 18,29 | 18,44 | 97,3 | matière, jamais un aplat large |
| taupe | `#908067` | 54,39 | 2,03 | 15,83 | 15,96 | 82,7 | matière — **n'écrit jamais** |
| rouille | `#B14E2D` | 45,62 | 38,26 | 38,39 | 54,20 | 45,1 | **la marque** : signe, filet, fil |
| taupeTrait | `#74654F` | 43,63 | 2,34 | 14,68 | 14,87 | 81,0 | filets, bordures, surpiqûre |
| terre | `#6C5A43` | 39,42 | 3,69 | 16,05 | 16,47 | 77,0 | matière profonde |
| olive | `#4F502B` | 33,08 | −6,77 | 21,63 | 22,66 | 107,4 | état, doublé d'un mot |
| alerte | `#922716` | 33,18 | 43,80 | 36,23 | 56,84 | 39,6 | état, doublé d'un mot |
| brou | `#4A3B2A` | 26,01 | 3,80 | 13,03 | 13,57 | 73,7 | **l'encre** : texte, étiquette |
| brouFonce | `#2F2519` | 15,48 | 2,58 | 9,77 | 10,11 | 75,2 | titres, marquage à chaud |

La famille tient en un fait : sauf `rouille`, `alerte` et `olive`, **tout se
range entre h 73° et 91°**, chroma 10 à 30. C'est une seule teinte déclinée en
clarté. C'est pour ça qu'elle ne peut pas jurer avec elle-même — et pourquoi une
dérive de teinte en teinturerie se verrait immédiatement.

---

## 3. Tolérances

ΔE00, contre l'étalon physique approuvé, pas contre le tableau ci-dessus.

| Couleur | Tolérance | Pourquoi ce chiffre |
|---|---|---|
| `rouille` | **ΔE00 ≤ 1,0** | C'est la marque. Elle apparaît à côté du logo imprimé et sur des supports différents dans une même vitrine : au-delà de 1,0 l'écart se lit comme une erreur de fabrication. |
| neutres (`parchemin`, `craie`, `taupe`, `taupeTrait`, `terre`, `brou`, `brouFonce`, `ocre`, `sauge`) | **ΔE00 ≤ 1,5** | Faible chroma : l'œil y est moins sensible qu'à un rouge saturé, et 1,5 reste sous le seuil de gêne quand deux pièces se touchent. |
| `alerte`, `olive` | ΔE00 ≤ 2,0 | Ils ne servent qu'à un état, jamais à une pièce portée. |

Contraintes qui s'ajoutent, et qui sont souvent ce qui casse une série :

- **ΔL\* ≤ 0,8** entre deux pièces d'un même vêtement (corps / manche / capuche).
  Une dérive de clarté se voit avant une dérive de teinte.
- **Bain à bain** : ΔE00 ≤ 1,0 entre lots, faute de quoi les pièces d'un même
  ensemble ne s'assortissent plus.
- **Solidité** : ≥ 4 à la lumière (ISO 105-B02) et ≥ 4 au frottement humide
  (ISO 105-X12). Un rouille qui rosit au bout d'un été n'est plus le rouille.

---

## 4. Présélection Pantone — **non vérifiée, à faire mesurer**

Ces références servent à **demander les bons chips**, et rien d'autre. Aucune
n'a été relevée au spectrophotomètre ; les valeurs Pantone ne sont pas publiées
sous une forme que je puisse vérifier ici. Le fournisseur mesure, on compare, on
tranche.

- Vêtement — demander en **TCX** (Fashion, Home + Interiors, coton) :
  seul le TCX est un étalon *sur textile*. Le TPG est papier et ne doit pas
  servir de référence de teinture.
- Impression et packaging — **Coated / Uncoated** selon le support, avec un
  tirage de contrôle sur le papier réellement retenu.

| Jeton | Chips TCX à demander | Chips C/U à demander |
|---|---|---|
| parchemin | 11-0605, 12-0713 | 7499, 9224 |
| craie | 13-0907, 14-1108 | 7527, 468 |
| ocre | 15-1132, 16-1144 | 7407, 465 |
| rouille | **17-1345, 18-1248, 18-1440** | **7599, 174, 1675** |
| taupe / taupeTrait | 17-1113, 18-1108 | 7504, 7505 |
| terre | 19-0840, 18-1027 | 7526, 4625 |
| brou / brouFonce | 19-0840, 19-0912 | 476, 440 |

Le rouille a trois candidats parce que c'est lui qui compte : il faut voir les
trois côte à côte sur le tissu retenu, sous les trois lumières du §5, avant de
choisir.

---

## 5. Le protocole d'approbation, en une page

1. Envoyer au fournisseur : ce document, le fichier logo, et le rôle exact de la
   couleur (fil, corps de vêtement, étiquette, impression).
2. Recevoir **trois lab dips** par couleur, sur le tissu réel — jamais sur un
   substrat de substitution.
3. Juger en **cabine lumière**, sous trois illuminants :
   **D65** (référence), **TL84** (boutique), **A** (incandescent, chaud).
   Une teinte qui saute d'un illuminant à l'autre est refusée même si elle
   passe en D65 : c'est du métamérisme, et il se verra en magasin.
4. Mesurer le dip retenu au spectrophotomètre, **D65/10°, SCI**. Ce relevé
   devient l'étalon. Le noter ici, dans un tableau « valeurs approuvées », en
   indiquant la date et le lot.
5. Ne rien lancer en production tant que le §4 reste marqué « non vérifié ».

---

## 6. Ce qui ne change pas hors écran

Les deux règles de la palette valent aussi sur le tissu et le papier :

- **Le rouille ne fait pas de texte.** À l'écran il donne 3,11:1 sur le fond le
  plus sombre du site — assez pour un trait, pas pour un mot. Imprimé, il n'y a
  aucune raison de lui en demander plus. L'encre est le brou.
- **Le taupe ne fait pas de trait visible.** 2,28:1 dans le pire cas. C'est une
  couleur de matière : elle vit dans la pierre, dans la trame, dans le fil qu'on
  devine. Pour un filet qui doit se voir, c'est `taupeTrait`.

Une marque se reconnaît à ce qu'elle refuse de faire avec sa propre couleur.
