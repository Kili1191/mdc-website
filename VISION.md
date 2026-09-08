# MDC — VISION.md — Document de vision canonique du site
*Compilé le 19 août 2026 depuis les war rooms et décisions des conversations précédentes.*

---

## ⚠️ QUI GAGNE, ET DEPUIS QUAND

Ce document disait : « en cas de conflit avec du code existant, CE DOCUMENT
gagne. » Cette phrase était juste le 19 août et ne l'est plus telle quelle.
Kilian a depuis renversé plusieurs de ces règles **en conversation**, et une
décision de Kilian passe avant un document — sinon le document devient un
moyen de lui répondre non avec ses propres mots d'il y a deux semaines.

L'ordre d'autorité, du plus fort au plus faible :

1. **Ce que Kilian dit maintenant.**
2. **Ce qui est mesuré** (contraste, poids, images) — un chiffre reproductible
   bat une intention. Voir `src/styles/tokens.ts` et `scripts/contraste-matiere.mjs`.
3. **Ce document**, pour tout ce qu'aucun des deux n'a tranché — c'est-à-dire
   l'essentiel : l'arc émotionnel, la méthode de build, la doctrine de nav,
   la posture de vente. Rien de tout cela n'a été renversé.
4. Le code existant.

Les règles renversées sont marquées **RENVERSÉE** en place, avec par qui et
quand. Elles restent écrites : savoir ce qu'on a cru est utile. Ce qui n'est
pas marqué tient toujours.

Un chantier annoncé mais jamais construit n'est pas une règle renversée —
c'est une dérive, et le §8 les liste au lieu de les laisser passer pour faites.

*Dernière réconciliation : 3 septembre 2026.*

---

## ⚠️ VIRAGE DE DIRECTION — 8 septembre 2026

**Décision de Kilian, en conversation, donc rang 1 de la hiérarchie ci-dessus.**

Question posée : « la regle cest pas awwwards ? which is our focus ». Réponse
choisie parmi trois : **un site plus spectaculaire, assumé** — mouvement,
transitions, moments qui accrochent, quitte à contredire les règles de retenue.

### Ce qui est renversé

**« La retenue est la valeur la plus haute » ne l'est plus.** C'était la
première ligne de `.claude/skills/taste/SKILL.md` et l'arbitre par défaut de
tous ses jugements (« quiet wins by default », « if uncertain, go subtler »).
Ce départage tombe. En cas d'hésitation entre une option sobre et une option
qui accroche, **c'est désormais celle qui accroche**, et l'agent n'a plus à
demander la permission d'ajouter de la présence.

La règle « un seul effet par section » (§9 du skill) tombe avec elle.

Contexte, parce que l'ambiguïté était réelle et a coûté du travail : le mot
« Awwwards » apparaît cinq fois dans ce dépôt et une seule est une
interdiction — « generic Awwwards », dans le skill. Les quatre autres sont des
CIBLES : `page.tsx:21` dit « Modèle Awwwards 2024–2026 (Studio Freight, Igloo
Inc, Active Theory) », `ASSETS_NANOBANANA.md:17` pose « Awwwards-worthy » comme
critère d'acceptation d'un visuel, `FluidImage.tsx` dit « Style Studio
Freight ». Une session a cité la seule interdiction pour refuser d'améliorer un
élément que Kilian trouvait faible. Ne pas recommencer.

### Ce qui NE bouge PAS, et pourquoi

Le virage porte sur la RETENUE, pas sur l'identité ni sur les faits.

- **La palette Aube Encens, les trois fontes, jamais de dark theme.** Kilian
  n'a rien dit contre, et ce sont des règles d'identité, pas de sobriété.
- **La copy.** Zéro texte user-facing inventé par l'agent. Inchangé.
- **NERVANA Guard, jamais l'adresse, jamais Ofqual sans numéro.** Faits.
- **Les planchers d'accessibilité** — contraste, cibles de 24px, sortie visible
  d'une intro qui dure. Un site primé les tient ; ils ne sont pas de la retenue.
- **Ce qui a été retiré pour une raison MESURÉE reste retiré.** C'est la
  distinction qui compte, et elle est facile à rater : `MagneticButton` n'est
  pas parti parce qu'il était voyant, il est parti parce qu'il décentrait le
  bouton de 21,4 px hors de son axe et tenait une boucle rAF à vie par
  instance. La récompense d'immobilité n'est pas partie par sobriété, elle
  faisait dériver le fond sans geste de l'utilisateur. Le voile
  `backdrop-filter` non plus. Un chiffre reproductible reste au rang 2, donc
  au-dessus de ce virage. **Refaire l'effet autrement, oui. Rendre le défaut
  mesuré, non.**
- `HorizontalScroll` et `SmoothScroll`, eux, avaient été supprimés comme
  simples DOUBLONS de `ScrollProvider` — aucune mesure ne les condamne, et
  rien ne s'oppose à construire un scroll horizontal épinglé.

### Ce que ça autorise concrètement

Effets empilés sur une même section, sections épinglées, scroll horizontal
piloté au scroll vertical, transitions plus longues et plus visibles,
moments de bascule. La barre n'est plus « est-ce que c'est discret » mais
**« est-ce que ça tient face à un site primé »**.

---

## 0. RÈGLES ABSOLUES (non négociables)

- **Jamais de dark theme.** Tient, sans exception.
  - ⚠️ **RENVERSÉE — les valeurs hexadécimales** (mesure, 21 août → 3 sept 2026).
    Quatre des sept ont bougé : Sauge #8C8B6A → **#918969**, Taupe #A89A85 →
    **#908067**, Rouille #A55A3E → **#B14E2D** (Kilian, « tes sur cest le bon
    code couleurs du logo ? » — c'est la couleur réelle du logo), et le trait
    #7E6E56 → **#74654F**. La cause : toute la grille avait été calibrée contre
    #EDE4D0, un fond que le site n'affiche jamais. Le fond réel est le marbre,
    plus sombre et **variable**. Voir PR #61 à #64.
  - ⚠️ **RENVERSÉS — les pourcentages** (55 / 15 / 12 / 10 / 5 / 3). Ce sont
    des proportions d'intention, pas un budget de pixels : le marbre occupe
    seul plus de 90 % de la surface. Ils ne se vérifient pas et ne doivent pas
    être vérifiés. Voir PR #61.
  - **Ce qui remplace ces règles** : `src/styles/tokens.ts` est la source, et
    aucune couleur n'y entre sans être mesurée au 1er centile du fond le plus
    sombre où elle peut apparaître. Le brou est la seule encre ; le rouille est
    un signe et un filet, il n'écrit nulle part ; le taupe est de la matière.
- **NERVANA Guard :** aucun nom de technique, phase, mécanique de protocole en
  public. Résultats, sensations, bénéfices — rien d'autre. **Tient.**
  - ⚠️ **RENVERSÉE — les « 5 familles »** (Kilian, août 2026) : « nervana is a
    suite you always have to start with antara ». NERVANA est **une suite**,
    parcourue dans un ordre, pas cinq familles au choix. ANTARA en est
    l'entrée obligatoire. Les noms VAYU, SOMA, TRANSMISSION, URDHVA ne
    structurent plus rien de public. Conséquence tarifaire tranchée par Kilian
    le même mois : « nervana est une suite ca peut pas etre 180 ».
- **Typo :** Prata (corps + display), Higuen (gros titres uniquement), Great Vibes (une seule occurrence : page Kilian, "I don't fix anyone. Nothing is broken.")
- **Le site est l'invitation à la première session, pas la session elle-même.** (Pivot validé — remplace l'ancien "le site EST la session".)
- **La Maison est un concept, pas un lieu** (Kilian, août 2026 : « tu comprends
  que la house cest le concept ? pas un endroit physique »). Une maison au sens
  des maisons de luxe — une signature qui pourra couvrir d'autres objets, un
  merch, un vêtement — **et** un refuge de bien-être. Jamais une adresse. Et
  jamais le mot *shelter*, refusé par Kilian : « shelters makes me remember
  homeless ».
- **MDC accorde l'accès.** Le client ne choisit pas la Maison, la Maison l'admet. Rareté réelle, non simulée. Pas d'absence mechanics artificielles.
- ⚠️ **RENVERSÉE — « Copy = COPY_V13.md, texte exact, zéro réécriture »**
  (Kilian, août 2026, à répétition). Il a fait réécrire les services, les
  prix, la page retraites, la formulation de la maison, et a demandé la
  construction d'un agent de copywriting — `.claude/agents/copywriter.md` —
  précisément pour que le texte continue de bouger sans perdre la voix.
  COPY_V13 est une archive, plus une loi. **Ce qui la remplace :** l'agent
  copywriter porte la voix, les faits vérifiés et la liste des affirmations
  interdites, et il est consulté dès qu'un mot destiné à un client change.
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
- ⚠️ **RENVERSÉE — la liste des onglets** (Kilian, août 2026) : « ducoup tu
  proposes jamais mes services en tant que life coach ? it desserve another
  onglet ». **Coaching** est un onglet à part entière, à distance uniquement.
  Nav réelle : Sessions · Practitioner · Retreats · **Coaching** · The Work ·
  Notes · Begin (Home porté par le logo).

---

## 5. CONVERSION (panel Ogilvy/Godin/strategist HNW, validé)

- ⚠️ **RENVERSÉE — « Bali sept 2026 »** (Kilian, août 2026) : « pour la
  retreat i dont know nothing yet its just a project », puis « Nothing is fixed
  yet — not the country, not the dates, not the length ». **Rien n'est décidé.**
  La règle qui la remplace, de sa main : promouvoir et récolter des
  inscriptions, ne jamais détailler. Il a lui-même jugé le détail incertain
  contre-productif : « if i read that to a website ill never be interested to
  suscribe looks very amateur ».
- 4 choses à vendre : sessions individuelles, retreats privés, retraite à venir
  (lieu et dates non annoncés), objets (coming). **Trouvables en moins de 2 clics depuis n'importe où.** La mythologie sert la conversion, elle ne la remplace pas.
- Psychologie d'achat HNW — trois propriétés de CHAQUE page (pas trois pages) : comprendre QUI est derrière, comprendre pourquoi ce n'est PAS pour tout le monde, sentir que l'accès est rare.
- **Le vrai luxe ne demande pas. Il invite.** Le CTA Begin = conversation, pas formulaire de devis.
- Objets/produits : PAS dans la nav principale, pas mélangés au site praticien (question mortelle : "praticien ou boutique ?"). Espace séparé, lien discret. Coming soon = micro-expérience (un objet dans le monde, une date, un champ — rien d'autre).
- "The Work" = page de confiance, pas de SEO. Position secondaire dans la nav.

---

## 6. INTRO (faite, verrouillée)

Breath-driven logo reveal : mur gauche (inhale) → fond (exhale) → mur droit
(inhale) → toit (exhale), puis les yeux, puis « Maison du Calme » (Higuen).
Sortie : zoom immersif à travers la maison (exponentiel, flou cinétique, flash
de seuil) → le site. Skippable. Composant : `src/components/IntroOverlay.tsx`.

Trois points de ce paragraphe ont été renversés par Kilian (août 2026) :

- ⚠️ **« Cohérence cardiaque 5.5s/5.5s » → « fait du vrai breathwork ».** Le
  cycle est **4 s inspire · 2 s rétention · 6 s expire**, soit 12 s — une
  expiration plus longue que l'inspiration, ce qui est la mécanique
  parasympathique réelle. Le 5,5/5,5 est cohérent mais n'est pas ça.
  *Reste à trancher par Kilian : revenir au 5,5/5,5, ou garder le 4-2-6.*
- ⚠️ **« yeux + texte ensemble » → séparés.** « tu montre les yeux en meme
  temps le texte au milieu tu te rappel pas de comment cetait avant le
  final ? » Les yeux restent fermés et le mot reste dehors pendant **tout** le
  cycle de souffle ; la révélation ne vient qu'après.
- ⚠️ **« Joue une fois » → accessible à volonté, et en boucle.** « faut que le
  user puisse y avoir acces a chaque fois si envie et un mode seemless loop si
  besoin dexercice ». D'où `BreathButton`, présent sur toutes les pages, et le
  mode pratique qui boucle sans redessiner. L'intro reste passée une fois au
  premier chargement (`mdc_intro_seen`), mais ce n'est plus sa seule vie.

`prefers-reduced-motion` reste respecté — et signifie **moins de mouvement,
pas moins de contenu** : le souffle se joue sans animation, il ne disparaît
pas.

---

## 7. MÉTHODE DE BUILD (leçon des boucles passées)

- **Fondation d'abord, validée à l'œil, PUIS on empile.** Jamais tout brancher d'un coup — ça finit en chevauchements où rien ne marche.
- Un chantier à la fois. Build vert + commit après chaque étape.
- Kilian valide visuellement (souvent iOS Safari). Le réglage fin se fait avec panneau Leva quand pertinent, puis valeurs gravées en dur.
- 60fps obligatoire. prefers-reduced-motion respecté partout.

---

## 8. DÉRIVE — ce que ce document annonce et que le site ne fait pas

Personne n'a renversé ces règles. Le code les contredit quand même, ou ne les
a jamais construites. Ce n'est pas la même chose qu'une décision, et ça ne doit
pas passer pour faite. **Ces points attendent un arbitrage de Kilian.**

### Contredit par le code

- **§4 — « Pas de header horizontal fixe permanent ».** `Nav.tsx` est en
  `position: fixed; top: 0`, visible en permanence sur toutes les pages. C'est
  exactement ce que le §4 interdit, et la nav contextuelle qu'il décrit
  (apparition au scroll-up, geste discret, invisible par défaut) n'existe pas.
  À trancher : soit on construit la nav contextuelle, soit on assume le header
  fixe et on réécrit le §4. Aujourd'hui le document ment.

### Annoncé, jamais construit

- **§1 brique 2 — bords organiques (smoothMin).** La révélation au curseur est
  toujours un cercle adouci, pas un contour vivant.
- **§2 — scroll horizontal ET spirale.** Aucun `ScrollTrigger`, aucune spirale
  dans le dépôt. L'horizontal existe seulement sur la rangée des offres, à la
  demande de Kilian (« can the offers appears with a horizontal screaning? »)
  — ce n'est pas le système à deux axes du §2.
- **§3 — les 5 états en pinning sur l'accueil.** L'accueil compte **6 stations**
  qui défilent normalement ; rien n'est épinglé, et l'arc AVANT → PENDANT →
  APRÈS n'est pas piloté par le scroll dans la matière. Le §1 brique 3 (grain +
  vignette) est fait, lui.
- **§1 — « marbre INTERACTIF sur l'accueil, CALME sur les pages de contenu ».**
  Partiellement vrai, jamais vérifié à la mesure.

### Décisions en attente de Kilian, hors document

Relevées pendant la revue design et colorimétrie, aucune n'est tranchée :

- Redessiner le logo en tracé, avec trois graisses optiques et une version
  réduite. Aujourd'hui un seul dessin sert du favicon au grand format.
- Retirer Great Vibes entièrement. Elle ne sert plus qu'à une signature sur
  `/practitioner` — une famille complète chargée pour une ligne.
- « Practitioner » → « Kilian ». L'onglet nomme une fonction là où la page
  parle d'une personne, et le §5 demande justement qu'on comprenne **qui** est
  derrière.
- Sortir les prix de l'accueil.
- Restructurer la nav (7 onglets, dont trois se disputent la même intention).
- Le cycle de souffle : 4-2-6 ou le 5,5/5,5 du §6.

### Ce qui manque pour que le site fonctionne vraiment

- `NEXT_PUBLIC_CONTACT_EMAIL` n'est pas défini sur Vercel. **Sans lui, le
  formulaire `/begin` n'envoie rien** — le bouton se désactive et le dit, mais
  le seul chemin de conversion du site est fermé. C'est le point le plus urgent
  de cette liste.
- Les deux vidéos de témoignage ne sont pas dans `public/testimony/`, et
  `index.json` les attend.
