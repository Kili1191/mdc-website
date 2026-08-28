---
name: taste
description: Le jugement esthétique du site Maison du Calme — quoi accepter, quoi refuser, quoi retirer. À charger AVANT d'écrire ou de modifier toute surface visible (composant, page, couleur, typo, espacement, animation, shader), avant de relire un écran, et avant de dire qu'un écran est fini. Se déclenche sur : design, UI, visuel, style, look, esthétique, couleur, palette, typo, spacing, layout, animation, motion, transition, hero, landing, "c'est moche", "ça fait cheap", "améliore le rendu", design review, polish.
---

# Taste — MDC

Ce fichier ne décrit pas des goûts. Il décrit **des décisions déjà prises** (VISION.md, `src/styles/tokens.ts`, COPY_V13.md) et **la manière de juger** ce qui n'est pas écrit ailleurs.

Ordre d'autorité : `VISION.md` > ce fichier > l'intuition. En cas de conflit avec du code existant, VISION.md gagne.

---

## 0. Non négociables — un manquement = régression, pas un avis

- **Jamais de dark theme.** Fond Parchemin `#EDE4D0`, toujours. La profondeur se rend par la densité du marbre, jamais par le noir.
- **Jamais `#FFF` ni `#000`.** Le blanc pur et le noir pur n'existent pas dans cette maison. `--color-ink #0A0806` est réservé à la profondeur WebGL, jamais à du texte ni à un fond d'UI.
- **Palette fermée à 7 couleurs** (`src/styles/tokens.ts`). Aucune huitième, jamais, pas même « juste pour un état hover ».
- **Typo verrouillée** : Prata = corps + display. Higuen = gros titres uniquement. Great Vibes = **une seule occurrence sur tout le site** (page Kilian). Si tu en ajoutes une deuxième, tu casses la seule qui comptait.
- **Copy = COPY_V13.md, au mot près.** Aucune réécriture, aucun « j'ai amélioré la formulation ».
- **NERVANA Guard** : aucun nom de technique, de phase ou de mécanique de protocole en public. Uniquement les 5 familles (ANTARA, VAYU, SOMA, TRANSMISSION, URDHVA) + résultats et sensations.
- **`prefers-reduced-motion` respecté partout**, et le chemin réduit doit rester *beau* — pas une version amputée.
- **60fps.** Un effet à 45fps n'est pas un effet, c'est un bug qui se déguise.
- **Zéro scroll horizontal accidentel.** L'horizontal est un geste voulu (§2 VISION), jamais un débordement.

---

## 1. Les cinq tests — le goût proprement dit

Applique-les dans l'ordre. Le premier qui échoue commande la correction.

### Test 1 — « Safe » (Porges)
Le premier frame doit dire *sécurité* au système nerveux avant que le cerveau lise quoi que ce soit.
- Courbes organiques, jamais d'angles durs. Un `border-radius: 4px` est un angle dur déguisé — soit c'est franchement rond, soit ce n'est pas un cadre.
- Lumière chaude, jamais froide. Une ombre bleutée est une faute.
- Rythme lent, jamais d'urgence. Aucun compte à rebours, aucun clignotement, aucun « plus que 3 places ».

**Échec si** : l'écran donne envie de se dépêcher.

### Test 2 — La matière porte la couleur, pas l'UI
La couleur vit **dans le marbre**. L'interface, elle, est du parchemin et du brou.
- Un bouton coloré, un badge, un liseré ocre autour d'une carte → faute.
- Un CTA se signale par l'espace autour de lui et par la typo, pas par un fond.

**Échec si** : en supprimant le calque marbre, il reste des taches de couleur.

### Test 3 — Le retrait
Retire un élément de l'écran. Si l'écran n'est pas *moins bon*, laisse-le retiré.
- Le luxe se lit à ce qui est absent. Pas de sous-titre explicatif sous un titre qui se suffit, pas d'icône à côté d'un mot clair, pas de flèche « scroll » si le contenu appelle déjà le scroll.
- Deux éléments qui disent la même chose : garde le plus silencieux.

**Échec si** : tu as ajouté quelque chose pour « remplir » un vide. Le vide était le sujet.

### Test 4 — La respiration
- Espacements **exclusivement** depuis `SPACE` : 8 / 16 / 32 / 64 / 120 / 200. Aucune valeur arbitraire, jamais un `margin-top: 47px`.
- Deux blocs distincts séparés par moins de `lg` (64px) en desktop se disputent l'attention. Une séparation de section, c'est `xl` (120) minimum.
- Longueur de ligne 60–70 caractères. `line-height` ≥ 1.5 sur le corps de texte.

**Échec si** : l'écran est plein. Il doit être *habité*, ce n'est pas pareil.

### Test 5 — Miyazaki
Le monde doit sembler avoir toujours existé, découvert et non construit pour le visiteur.
- Rien qui sente le template : pas de grille de 3 cartes, pas de « as seen in », pas de section témoignages en carrousel, pas de bandeau cookie stylisé comme une pub.
- Pas d'animation d'entrée sur chaque bloc au scroll. Ce qui apparaît partout n'apparaît nulle part.

**Échec si** : on reconnaît le composant avant de lire le contenu.

---

## 2. Décisions par domaine

### Couleur
Ratios visés (surface perçue, pas nombre d'usages) : Parchemin 55% · Brou 15% · Sauge 12% · Taupe 10% · Ocre 5% · Rouille 3%.
- **Sauge refroidit.** Usage mesuré, jamais en masse, jamais en fond de section.
- **Rouille** = logo et highlights rares. Trois pour cent, c'est presque rien : tiens-t'y.
- **Brou foncé `#2F2519`** pour les titres forts uniquement, pas pour du corps de texte.

### Typographie
- Higuen uniquement au-dessus de ~48px. En dessous il devient illisible et fait « police décorative ».
- Jamais de faux gras (`font-weight` synthétique sur Prata), jamais de corps de texte en capitales.
- `letter-spacing` positif seulement sur Higuen en capitales. Sur Prata, l'espacement par défaut est le bon.

### Mouvement
- **Tempo de base : la cohérence cardiaque, 5.5s / 5.5s.** Toute animation lente s'aligne dessus ou sur ses divisions. C'est la signature du site, pas une décoration.
- Easing sortant long (≥ 1.2s sur les révélations). Jamais de `bounce`, jamais d'`elastic` — ce sont des signaux d'urgence.
- Rien ne boucle mécaniquement. Ce qui se répète à l'identique se remarque, et ce qui se remarque casse l'immersion (Anadol : jamais deux fois pareil).
- Le monde répond à la présence (Lusion) : si un élément bouge sans rapport avec le visiteur, demande-toi pourquoi il bouge.

### Texte au-dessus du marbre
- Le contraste se mesure **contre l'image de fond la plus claire que le shader puisse produire**, pas contre la moyenne. Minimum 4.5:1 dans ce pire cas.
- Marbre **interactif** sur l'accueil, **calme** sur les pages de contenu. Un texte long sur un fond qui bouge n'est pas lisible, quelle que soit sa beauté.
- Pour asseoir un texte : voile parchemin en dégradé doux. **Jamais une carte** avec un fond opaque et un bord — ça ramène l'UI par la fenêtre (voir Test 2).

### Navigation
- Pas de header fixe permanent. La nav apparaît au besoin, s'efface sinon.
- Le fallback `<nav>` sémantique reste complet et présent pour les crawlers, masqué en CSS une fois le WebGL prêt. Ne le simplifie jamais « puisqu'il est invisible ».

---

## 3. Revue d'écran — à passer avant de dire « c'est fini »

```
[ ] iOS Safari 390px : aucun débordement horizontal, `dvh` et non `vh`
[ ] prefers-reduced-motion : l'écran reste complet et beau
[ ] contraste texte ≥ 4.5:1 contre le frame de fond le plus clair
[ ] espacements uniquement dans l'échelle SPACE
[ ] ratios de palette à l'œil ; aucune 8e couleur ; aucun #FFF / #000
[ ] `grep -rn "font-great-vibes" src/app src/components` → une seule *utilisation*
    (page practitioner) en plus de la déclaration dans `layout.tsx`
[ ] copy identique à COPY_V13.md (diff, pas lecture rapide)
[ ] 60fps sur l'écran le plus chargé
[ ] build vert
```

---

## 4. Pièges connus de ce repo

- **`100vh` sur iOS Safari** casse la mise en page à cause de la barre d'URL → `100dvh`.
- Le calque WebGL **vole les événements de pointeur et le scroll** sur iOS s'il n'a pas `pointer-events: none` quand il est décoratif.
- Un `transform` 3D sur un parent **floute le texte enfant** au rendu. Sors le texte du contexte 3D plutôt que d'ajuster le `translateZ`.
- **Les valeurs du marbre sont gravées** : `uSpread 1.00`, `uDecay 0.93`, `uRadius 0.29`, `lerp 0.65`, `uReflet 0.05`, `uIrisation 0.09`. On ne les retouche pas.
- Leva sert au réglage, jamais à la production : une valeur validée à l'œil est **écrite en dur** dans le code, immédiatement.
- Next.js 16 dans ce repo n'est pas celui de ta mémoire d'entraînement — lis `node_modules/next/dist/docs/` avant d'écrire (`AGENTS.md`).

---

## 5. Méthode

- **Fondation validée à l'œil, puis on empile.** Un chantier à la fois, build vert + commit entre chaque. Tout brancher d'un coup finit systématiquement en chevauchements où plus rien ne marche.
- Kilian valide **visuellement**, souvent sur iOS Safari. Un « ça compile » n'est pas une validation.
- Quand quelque chose est laid : **nomme la règle enfreinte** (le test ou la ligne ci-dessus), puis propose **le plus petit correctif** qui la respecte. Pas de refonte non demandée, pas de nouvelle librairie de composants, pas de « j'en ai profité pour ».
