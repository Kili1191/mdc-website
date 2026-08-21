# MDC — VISION.md — Document de vision canonique du site
*Compilé le 19 août 2026 depuis les war rooms et décisions des conversations précédentes. Ce document réconcilie les visions successives. En cas de conflit avec du code existant, CE DOCUMENT gagne.*

---

## 0. RÈGLES ABSOLUES (non négociables)

- **Jamais de dark theme.** Palette Aube Encens uniquement : Parchemin #EDE4D0 (fond, 55%), Brou #4A3B2A (texte, 15%), Brou foncé #2F2519 (titres forts), Sauge #8C8B6A (accent 12%), Taupe #A89A85 (pause 10%), Ocre #B89968 (accent chaleureux 5%), Rouille #A55A3E (alertes/logo, 3%).
- **NERVANA Guard :** aucun nom de technique, phase, mécanique de protocole en public. Uniquement les noms des 5 familles (ANTARA, VAYU, SOMA, TRANSMISSION, URDHVA) + résultats/sensations/bénéfices.
- **Typo :** Prata (corps + display), Higuen (gros titres uniquement), Great Vibes (une seule occurrence : page Kilian, "I don't fix anyone. Nothing is broken.")
- **Le site est l'invitation à la première session, pas la session elle-même.** (Pivot validé — remplace l'ancien "le site EST la session".)
- **MDC accorde l'accès.** Le client ne choisit pas la Maison, la Maison l'admet. Rareté réelle, non simulée. Pas d'absence mechanics artificielles.
- Copy = COPY_V13.md, texte exact, zéro réécriture.
- Scroll direction : vertical ET horizontal (voir §2). Jamais de scroll horizontal accidentel/débordement.

---

## 1. IDENTITÉ VISUELLE VERROUILLÉE (HANDOFF_WEB36, décision finale)

**« Le marbre est l'univers entier du site. Sur chaque page, le marbre est la matière. Le texte et les photos flottent EN SUSPENS dessus, avec les effets (révélation, reflets). La navigation se fait par des scrolls travaillés — spirale et horizontal. »**

Trois systèmes qui coexistent, à empiler UN PAR UN (fondation validée à l'œil, puis on empile — jamais tout d'un coup) :

1. **Le marbre vivant** comme fond permanent de TOUT le site (layer dans layout.tsx, derrière chaque page).
   - Brique 1 (FAITE, valeurs verrouillées à l'œil via Leva) : diffusion fluide du trail — uSpread 1.00, uDecay 0.93, uRadius 0.29, lerp 0.65, uReflet 0.05, uIrisation 0.09. Ces valeurs sont gravées, ne pas retoucher.
   - Brique 2 (À FAIRE) : smoothMin / bords organiques — la révélation a des contours mous/vivants, pas un cercle net.
   - Brique 3 (À FAIRE) : post-processing plein écran — grain + vignette cinématographique (EffectComposer/ShaderPass sur la sortie renderer).
   - Décision d'usage : marbre INTERACTIF sur l'accueil, CALME/apaisé sur les pages de contenu (lisibilité du texte). 
2. **Le contenu en suspens** : textes + photos flottent au-dessus du marbre avec révélation/reflets (FloatingText existant = la base).
3. **Les scrolls sculptés** : horizontal d'abord, spirale ensuite. Un à la fois, prototypé, validé à l'œil.

---

## 2. SYSTÈME DE SCROLL DEUX AXES (modèle Active Theory, validé)

- **Vertical = descendre.** On traverse les niveaux/états du site. La caméra avance en profondeur.
- **Horizontal = explorer.** À l'intérieur d'un niveau, on regarde autour de soi (caméra ±X ou rotation Y ±30°). Ne change PAS de niveau. Recentre doucement (X=0) à la transition de niveau.
- Détection : |deltaX| > |deltaY| → exploration horizontale ; inverse → descente. Même logique en swipe mobile.
- **PAS un wagon/couloir.** Un univers LARGE, ouvert, enveloppant, à 360°. On entre DANS Maison du Calme, on ne roule pas sur des rails. Le monde existe autour du visiteur, il peut regarder partout. (Référence : entrer dans un monde à la Miyazaki, préexistant, qui continue d'exister sans toi.)
- Lenis pour l'inertie (lerp ~0.06), GSAP ScrollTrigger lie scroll ↔ caméra.

---

## 3. L'ARC ÉMOTIONNEL DU SITE (war room Lynch/Miyazaki/Turrell/Anadol/Porges — TRANSPOSÉ EN CLAIR)

⚠️ La version originale du war room était sombre (#0D0A06). Elle est TRANSPOSÉE dans la palette claire — la règle "jamais de dark theme" gagne. La dramaturgie reste, les couleurs changent : la profondeur se rend par la densité de la matière marbre, la saturation des veines, la lumière — jamais par le noir.

Le site traverse trois états d'un même monde (avant → pendant → après la session), rendus dans le marbre :

- **AVANT — la charge (début du scroll).** La matière est dense. Veinage marbre plus serré, plus sombre (Brou/Taupe dominants dans les veines), formes/nœuds organiques présents et entremêlés dans la profondeur, lumière contenue. Sensation : "je porte quelque chose."
- **PENDANT — la dissolution (milieu).** Les nœuds se défont, le veinage se liquéfie, la matière se diffuse. Transition Brou → Ocre. La lumière devient diffuse, l'espace s'ouvre. Sensation : "quelque chose se défait."
- **APRÈS — l'espace retrouvé (fin).** Le marbre devient presque pur Parchemin, veines rares et légères, immense espace lumineux. La Maison aux yeux fermés seule, qui respire. BEGIN apparaît. Sensation : "je suis léger. C'est ça qu'on cherchait."

Home = ce parcours à travers les 5 états intérieurs de la copy V1.3 (One → Five), chaque état occupe l'écran (pinning) avant de céder au suivant, la matière évoluant en fond selon l'arc ci-dessus.

Principes du panel à respecter partout :
- **Turrell :** le visiteur est À L'INTÉRIEUR de la lumière, pas dans un espace éclairé.
- **Lusion :** le monde répond à la présence — raycasting/conscience spatiale globale, les éléments savent que tu es là (pas des loops génériques). Réaction à la souris, au mouvement.
- **Porges (signaux de sécurité neurologiques dès le premier frame) :** courbes organiques jamais d'angles durs, lumière chaude jamais froide, rythme lent jamais d'urgence. Le système nerveux dit "safe" avant que le cerveau comprenne.
- **Anadol :** des formes organiques génératives qui morphent (jamais deux fois pareilles), représentant les états du système nerveux.
- **Miyazaki :** le monde semble avoir toujours existé — découvert, pas construit pour toi.

---

## 4. NAVIGATION (panel Lusion + Henschel, validé)

- **Pas de header horizontal fixe permanent** — contradictoire avec l'expérience immersive. La nav apparaît quand on en a besoin, s'efface sinon (Contextual Scroll Navigation / Scroll-Driven UI).
- Accès nav : geste discret (curseur coin, touche Escape, ou apparition au scroll-up). Invisible par défaut.
- **SEO/accessibilité :** fallback <nav> HTML sémantique complet visible avant hydratation JS, masqué en CSS une fois le WebGL prêt. Les crawlers voient les liens, les visiteurs voient le monde.
- Nav = celle de COPY_V13.md : Home · Sessions · Practitioner · Retreats · The Work · Notes · Begin.

---

## 5. CONVERSION (panel Ogilvy/Godin/strategist HNW, validé)

- 4 choses à vendre : sessions individuelles, retreats privés, Bali sept 2026, objets (coming). **Trouvables en moins de 2 clics depuis n'importe où.** La mythologie sert la conversion, elle ne la remplace pas.
- Psychologie d'achat HNW — trois propriétés de CHAQUE page (pas trois pages) : comprendre QUI est derrière, comprendre pourquoi ce n'est PAS pour tout le monde, sentir que l'accès est rare.
- **Le vrai luxe ne demande pas. Il invite.** Le CTA Begin = conversation, pas formulaire de devis.
- Objets/produits : PAS dans la nav principale, pas mélangés au site praticien (question mortelle : "praticien ou boutique ?"). Espace séparé, lien discret. Coming soon = micro-expérience (un objet dans le monde, une date, un champ — rien d'autre).
- "The Work" = page de confiance, pas de SEO. Position secondaire dans la nav.

---

## 6. INTRO (faite, verrouillée)

Breath-driven logo reveal : mur gauche (inhale) → fond (exhale) → mur droit (inhale) → toit (exhale) → yeux + "Maison du Calme" (Higuen) ensemble. Cohérence cardiaque 5.5s/5.5s. Mots inhale/exhale qui gonflent/dégonflent. Sortie : zoom immersif à travers la maison (exponentiel, flou cinétique, flash de seuil) → le site. Joue une fois (localStorage mdc_intro_seen), skippable, prefers-reduced-motion respecté. Composant : src/components/IntroOverlay.tsx.

---

## 7. MÉTHODE DE BUILD (leçon des boucles passées)

- **Fondation d'abord, validée à l'œil, PUIS on empile.** Jamais tout brancher d'un coup — ça finit en chevauchements où rien ne marche.
- Un chantier à la fois. Build vert + commit après chaque étape.
- Kilian valide visuellement (souvent iOS Safari). Le réglage fin se fait avec panneau Leva quand pertinent, puis valeurs gravées en dur.
- 60fps obligatoire. prefers-reduced-motion respecté partout.
