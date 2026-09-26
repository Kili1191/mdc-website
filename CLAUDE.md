@AGENTS.md

# Design taste

Before shipping ANY UI change, copy edit, effect, animation, or color decision — read `.claude/skills/taste/SKILL.md`. It encodes MDC's concrete design judgment (palette, typography, motion, spacing, copy discipline, anti-patterns, checklist for "done"). This overrides personal taste, current trends, and defaults. When uncertain, quieter wins.

## Precedence over the installed design skills

`.claude/skills/` also carries a general frontend-design library (13 skills from
Leonxlnx/taste-skill, plus `web-interface-guidelines` and `design-md-catalogue`).
They are useful for technique. They are **not** authoritative here.

Most of them optimise for "premium agency" maximalism: bold type, dense bento
grids, layered shadows, strong motion, brand-forward color. Maison du Calme is
the opposite bet — restraint, one effect per section, Aube Encens only, motion
tied to a 5.5s breath. A skill telling you to add gradients, a hero with three
stacked effects, or a non-palette accent is wrong **on this repo**, however
good the advice is in general.

Order of authority, highest first:

1. `VISION.md`, `COPY_V13.md`, `ASSETS_NANOBANANA.md` (canonical, repo root)
2. `.claude/skills/taste/SKILL.md` (MDC design judgment)
3. `.claude/skills/web-interface-guidelines/` (accessibility, input, performance
   craft — applies as written, it is not a visual style)
4. everything else in `.claude/skills/` (technique only, never a mandate)

`design-md-catalogue` is study material. Never import another brand's tokens,
palette, type scale or motion into this site.

# Piege connu : `position: fixed` depuis une page

`PageTransition` enveloppe `children` dans un div qui porte `transform` et
`will-change: transform` en permanence. Les deux creent un bloc conteneur pour
les descendants `position: fixed`. Une couche plein ecran rendue depuis une
page se dimensionne donc sur la hauteur du document, pas sur le viewport.

C'est ce qui rendait la maison de la Home six fois trop grande et rognee : le
canvas R3F faisait 1440x5400 au lieu de 1440x900. Les constantes de zoom
etaient justes depuis le debut, quatre passes de reglage n'y pouvaient rien.

Toute couche plein ecran rendue depuis une page passe par un portal sur
`<body>` (voir `HomeStage`). Les couches montees dans `layout.tsx` (SiteMarble,
Nav, BreathingCursor, SoundToggle, IntroOverlay) sont hors du wrapper et ne
sont pas concernees.

# L'entretien de `/begin/before`, et la seule regle qui le tient

Une IA pose les questions d'avant-seance, une par une, et choisit la suivante
d'apres ce qui vient d'etre repondu. A la fin, Kilian recoit une fiche remplie
et la transcription mot pour mot.

**L'assistant ne repond JAMAIS.** Il demande, il n'explique pas, il ne rassure
pas, il ne lit pas un cas, il n'accepte et ne refuse personne. C'est la
condition qui garde vraie la promesse de `/begin` : ce qui LIT et ce qui REPOND
est Kilian. Le jour ou l'assistant repond quelque chose a quelqu'un, la page
ment, et c'est la seule promesse sur laquelle tout le site repose.

Trois autres regles, et elles sont dans le code :

- **les consignes ne partent pas dans le navigateur.** Elles vivent dans
  `src/lib/entretien.ts`, cote serveur. Le composant client ne l'importe pas.
  Seul `src/lib/secours.ts` est partage, parce qu'il est fait pour etre lu ;
- **rien n'est stocke.** Ni base, ni session, ni journal de contenu. C'est de la
  donnee de sante, article 9 du RGPD britannique ;
- **un champ non aborde reste vide dans la fiche.** Aucune deduction. Kilian
  entre dans la piece en croyant ce qu'il a lu.

Ce qui reste interdit ne bouge pas d'un mot : aucune allegation de sante, aucun
diagnostic demande ou pose, aucun effet promis. L'ASA et le code CAP, au
Royaume-Uni, se reglent contre le praticien.

Les variables d'environnement sont dans `DEPLOY.md` §4ter. Sans `ANTHROPIC_API_KEY`
la page bascule proprement sur le formulaire ecrit de `/begin`.

# Sources of truth (canonical)

`SERVICES.md` — ce que Kilian propose reellement (suite silencieuse, retraites,
coaching, enseignement Reiki niveau 1, sound healing) et ce que le site en
montre. Interne, jamais publie. Les cinq lignes de metier y sont desormais
toutes presentes sur le site ; le document reste la source des faits et de ce
qui ne s'ecrit pas — a lire avant de supposer que la pratique se resume aux
Sessions.

`COPY_OUVERT.md` — les passages de copy qui attendent une phrase de Kilian, et
pourquoi. Sorti de la passe complete de l'agent copywriter. Tout ce qui pouvait
etre corrige sans ecrire un mot l'a deja ete ; ce qui reste demande une
decision, jamais une invention. A lire avant de toucher a une page, et a vider
au fur et a mesure que Kilian tranche — une entree resolue se reporte dans
`COPY_V13.md` ET dans le code, sinon elle revient.

`DIRECTION.md` — l'immobilite comme interaction. Ce que le site fait de
different, ce qui a ete retire pour y arriver, et ce qui reste. A lire avant
d'ajouter le moindre effet.


These docs live at repo root and win over anything in code when they conflict:

- **VISION.md** — identité visuelle, système de scroll deux axes (vertical/horizontal, spirale à venir), arc émotionnel (avant/pendant/après), règles absolues (palette Aube Encens, NERVANA Guard, typo Prata/Higuen/Great Vibes, jamais de dark theme), méthode de build (fondation → empilement, un chantier à la fois, build vert + commit).
- **ASSETS_NANOBANANA.md** — les 5 images d'états mentaux traversées au scroll (La Charge Vue → Le Premier Lâcher → La Chaleur Qui Revient → L'Espace Intérieur → La Présence à Soi), prompts Nano Banana verrouillés WEB09, workflow depth map (depth-anything.com), spec `DepthImageLayer.tsx` (HANDOFF_WEB07), fichiers attendus `public/states/state-N.jpg` + `state-N-depth.jpg`.
- **COPY_V13.md** — copy des pages internes (Sessions, Practitioner, Retreats, The Work, Notes, Begin). Cadratins interdits.

# L'agent copywriter, et la racine de session

`.claude/agents/copywriter.md` porte les faits verifies, les six fautes deja
commises et la voix. A convoquer des qu'un mot destine a un client est ecrit ou
modifie.

**Il ne se charge que si `mdc-website` est la RACINE de la session.** Claude
Code lit `.claude/agents/` du dossier racine, pas des depots attaches. Une
session ouverte sur un autre depot avec mdc-website en second ne le voit pas :
`@copywriter` echoue, et on ecrit la copy sans filet sans s'en rendre compte.
C'est arrive, et le depannage (copier le fichier dans `~/.claude/agents/`) ne
survit pas au conteneur. Ouvrir la session depuis `Kili1191/mdc-website`.

# Les agents, et qui fait quoi

Neuf agents, et ils ne se recouvrent pas. Convoquer le mauvais coute une passe ;
n'en convoquer aucun coute une regression.

| agent | il repond a |
|---|---|
| `designer` | est-ce que cette page FONCTIONNE — ce qui porte, ce qu'il faut couper, ou l'oeil decroche, si ca mene a Begin |
| `proportions` | des CHIFFRES de mise en page — echelle, longueur de ligne, alignements, rythme, cibles |
| `copywriter` | tout mot destine a un client |
| `seo` | faire venir les bonnes personnes |
| `ingenieur` | la machine — WebGL, Next 16, la loi de mouvement, pourquoi ca casse en prod |
| `accessibilite` | est-ce que quelqu'un qui voit mal, n'a pas de souris, ou a le vertige peut s'en servir |
| `confidentialite` | ce qui peut couter a Kilian ou blesser un visiteur — donnees de sante, allegations, secrets, detresse |
| `qa` | « comment le sais-tu » — prouver, et prouver que la preuve ne ment pas |
| `offre` | ce qui est vendu, a quel prix, comment on l'achete, et ce qui dort chez Kilian |
| skill `taste` | la marque — palette, fontes, motion, et la liste de controle |

Le skill `taste` n'est pas un agent : il se lit avant de livrer, toujours.

**Ce qui les rend utiles n'est pas leur competence generale.** Un modele connait
deja le WebGL, le WCAG, le RGPD et la tarification. Ce qu'aucun ne connait, et
ce que chacun de ces fichiers porte, c'est **ce qui a ete tente ICI puis retire,
avec le chiffre qui l'a decide**. C'est la seule chose qui ne se deduit pas, et
c'est ce qui se perd si personne ne l'ecrit.

**Ils vieillissent.** Chaque decision de Kilian, chaque retrait sur mesure,
chaque harnais qui a menti se reporte dans l'agent concerne. Un agent qu'on ne
nourrit pas redevient un modele generique en trois mois, et un modele generique
est exactement le probleme que ce site essaie d'eviter.

**Ils ne se chargent que si `mdc-website` est la RACINE de la session** — voir la
section sur l'agent copywriter plus bas. C'est vrai des neuf.

# L'agent designer

`.claude/agents/designer.md` fait la direction artistique. A convoquer devant
une page entiere, une nouvelle section, un parcours, ou quand quelque chose est
techniquement juste et laisse froid.

**Ce qu'il porte et qu'aucun modele n'a :** ce qui a ete tente sur ce depot puis
RETIRE, avec le chiffre qui l'a decide — MagneticButton, la recompense
d'immobilite, le voile en backdrop-filter, la page Lineage, la regle gravee de
la marge, le balisage FAQPage. Il connait les deux virages (le 8 septembre sur
le spectaculaire, le 11 sur la copy) et ce qu'ils n'emportent PAS.

Il ne mesure pas lui-meme — c'est `proportions`. Il n'ecrit pas la copy — c'est
`copywriter`. Et il a le droit de dire qu'une page va bien : une direction
artistique qui trouve toujours quelque chose a changer est une direction
artistique qui invente.

**Il vieillit si on ne le nourrit pas.** Chaque decision de Kilian, chaque
retrait sur chiffre, chaque effet rate se reporte dedans — comme `SERVICES.md`
tient les faits et `COPY_OUVERT.md` les questions ouvertes.

# L'agent proportions

`.claude/agents/proportions.md` mesure la mise en page dans un navigateur reel
— echelle typographique, longueur de ligne, alignements, rythme vertical,
cibles tactiles — et rend des chiffres, jamais des impressions.

**A convoquer AVANT de valider un changement visuel**, et des que quelque
chose « ne tombe pas juste » sans qu'on sache dire quoi. Il porte les six
pieges deja payes sur ce depot : `ch` qui ment d'un facteur 1,515 en Prata et
1,164 en Higuen, une garde fixe a cote d'une garde fluide (496px d'ecart a
1990px de large), `getBoundingClientRect` qui renvoie la boite apres
transformation, le blanc que l'interlettre pousse apres la derniere lettre, un
trace qui deborde et ne s'aligne donc pas sur sa boite, et le telephone dont la
colonne est bornee par l'ecran — ce qui rend un defaut de mesure invisible la
ou on regarde le plus souvent.

Il ne choisit ni couleur ni effet — c'est le skill `taste` — et il n'ecrit
jamais un mot destine a un client.

# L'agent seo

`.claude/agents/seo.md` porte la strategie de visibilite : pourquoi ce site ne
gagnera jamais « wellness London » et ne doit pas essayer, ou il gagne
reellement (la marque, le local a intention forte, la longue traine du
symptome), et l'etat technique mesure du referencement.

**Il n'ecrit JAMAIS de copy destinee au client.** Il constate, il priorise, et
il passe le brief a l'agent `copywriter` ou a Kilian. Un texte optimise ecrit
par un agent SEO est la mort de ce site.

Il connait aussi les bonnes pratiques SEO qui sont INTERDITES ici — la page FAQ
en premier, que la regle « la maison ne se justifie jamais » disqualifie quel
que soit son rendement.

# L'agent ingenieur

`.claude/agents/ingenieur.md` tient la machine : la couche WebGL permanente, le
scroll en JavaScript, la loi de mouvement, la sante du build.

**A convoquer AVANT** de toucher au marbre, au scroll, aux transitions de page,
a une couche plein ecran, a une route d'API, et des que quelque chose « marche
en dev et pas en prod ».

**Ce qu'il porte :** les six pannes deja payees avec le chiffre qui les a
diagnostiquees — le canvas a 1440x5400 parce qu'un `transform` parent capture
`position: fixed`, les deux secondes de fond plat parce que le motif etait une
prop, les 7,75 de contraste quand une view transition avale le canvas, les
610px de scroll qui passaient sous un verrou CSS parce que Lenis ne scrolle pas
nativement, les deux builds casses le meme jour par un backtick dans un
commentaire, et le geste d'onglet fini a 110ms. Plus les valeurs gravees, qu'on
ne retouche pas.

# L'agent accessibilite

`.claude/agents/accessibilite.md` repond a une seule question : est-ce que
quelqu'un qui voit mal, n'utilise pas de souris, lit a l'oreille ou a le vertige
peut se servir de cette maison comme les autres. Sur un site qui recoit des gens
epuises, ce n'est pas une case a cocher, c'est la population reelle.

**Ce qu'il porte :** les planchers MESURES contre le pire fond (brou 6,38 au 1er
centile de l'accueil, rouille 3,11 donc jamais d'encre, taupe 2,28 donc jamais a
l'ecran), le plancher d'opacite a 0,82 et non 0,78, la double condition
`pointer: coarse` ET `max-width: 720px` — parce qu'un telephone emule n'est pas
coarse et que la cible mesurait 33px la ou on regarde le plus —, et **les deux
controles qui restent sous la barre parce que Kilian en a decide ainsi**. Les
resignaler a chaque passe est inutile ; les corriger sans lui est une faute.

# L'agent confidentialite

`.claude/agents/confidentialite.md` demande « et si ca tombe mal ». Une plainte
ASA se regle contre le praticien. Une donnee de sante appartient a quelqu'un qui
ne l'a dite a personne d'autre. Un fait invente sur Kilian est une affirmation
sur une personne reelle.

**Ce qu'il porte :** les interdits avec leur raison — Ofqual deja publie par
erreur puis retire, l'adresse, le COMMENT de NERVANA, l'ecole, les histoires de
clients, `/lineage` supprimee parce qu'expliquer ce qu'on retient fabrique de la
mefiance — et l'etat reel de ce que le depot tient deja : rien n'est stocke,
aucun contenu n'est journalise, aucune cle dans le depot, les consignes de
l'assistant ne partent pas dans le navigateur, et les ressources de crise sont
ecrites en dur et relues.

# L'agent qa

`.claude/agents/qa.md` repond a « comment le sais-tu ». Ce depot est plein de
decisions qui portent un chiffre, et c'est sa force ; un chiffre FAUX est plus
dangereux qu'aucun chiffre, parce qu'il clot la discussion.

**Ce qu'il porte :** les sept fois ou un harnais de ce depot a menti — le script
qui echantillonnait zero bloc et rendait « aucun probleme », le canvas WebGL lu
noir sans `preserveDrawingBuffer`, le port mort pris pour une panne de code, le
serveur de prod perime dont le CSS repondait 404 et qui faisait mesurer une page
sans aucun style, `isMobile` qui fausse toutes les boites, le rectangle
post-transformation, et la colonne du telephone bornee par l'ecran. Plus
l'outillage reel : playwright n'est PAS installe, puppeteer l'est.

# L'agent offre

`.claude/agents/offre.md` tient ce qui est vendu, a quel prix, comment quelqu'un
l'achete, et ce qui dort chez Kilian. Personne d'autre ne porte cette question :
`seo` fait venir, `designer` juge si la page mene quelque part, `copywriter`
ecrit, mais personne ne demande si ce qu'on vend tient debout.

**Il n'invente JAMAIS un prix**, une duree ou une disponibilite. La source est
`SERVICES.md`, ce que le site publie deja, et la parole de Kilian. Quand un
chiffre manque, il ecrit « a trancher par Kilian » et dit ce que la decision
change.

**Ce qu'il porte :** la grille reelle, la logique qui la tient (ANTARA est une
porte obligatoire, pas la premiere d'une liste ; le cycle de six n'est pas une
remise), la faute deja commise ou la mise en page faisait lire VAYU comme une
entree moins chere, et la liste des decisions en attente — a commencer par la
variable d'environnement absente qui fait perdre CENT POUR CENT des demandes.

# Copy rule — LEVÉE PAR KILIAN LE 11 SEPTEMBRE 2026

**Décision de Kilian, en conversation, donc rang 1 de la hiérarchie de
`VISION.md` :** « tu peux inventer c'est moi qui decide et aussi tu peux
reprendre des articles avec liens sur la source pour rassurer les sceptic ».

L'agent peut désormais **rédiger** de la copy destinée au client — essais de
`/notes` en premier lieu — et **citer des sources externes avec leur lien**.
Kilian valide avant publication. La règle d'origine est conservée plus bas
parce qu'elle explique ce qui l'avait motivée, et parce que tout ce qui suit
n'est PAS levé.

## Ce qui n'est pas levé, et qui n'est pas une question de copy

**Les faits sur Kilian et sa pratique ne s'inventent pas.** Ce qu'il fait dans
la pièce, où il a appris, ce qu'une séance produit, ses titres : la source est
`SERVICES.md` et sa parole, jamais la vraisemblance. Inventer là-dessus n'est
pas écrire, c'est fabriquer des affirmations sur une personne réelle.

**Aucune allégation de santé non étayée.** C'est le piège exact du sujet : on
cite des études pour rassurer les sceptiques, et on se retrouve à écrire qu'un
soin traite une pathologie. Au Royaume-Uni l'ASA et le code CAP l'interdisent
pour les thérapies non conventionnelles, et une plainte se règle contre le
praticien, pas contre le site. Décrire une expérience, oui. Promettre un effet
clinique, non.

**Une source citée doit être réelle, vérifiable, et dire ce qu'on lui fait
dire.** Lien direct, auteur, année. Une référence inventée ou déformée fait
exactement l'inverse de ce que Kilian demande : elle donne au sceptique la
preuve qu'il cherchait.

**Restent interdits sans changement :** « Ofqual » et « RQF » sans numéro au
dossier, l'adresse au-delà de « Battersea, South West London », le COMMENT de
NERVANA, les sections méta ou défensives, la page FAQ, les cadratins, et les
mots bannis listés dans `.claude/agents/copywriter.md`.

**L'agent `copywriter` reste la porte d'entrée** de tout mot destiné au client.
Ce qui change, c'est qu'il peut maintenant proposer du texte neuf au lieu de
seulement signaler un manque.

---

# Copy rule (règle d'origine, conservée pour mémoire)

**Zéro nouvelle copy user-facing écrite par l'agent.** Toute copie visible provient exclusivement du set validé ci-dessus + des fichiers Drive canoniques suivants (à ajouter au repo quand fournis) :

- **MDC_Site_V6** / **SITE_Prototype_V5_Valide_Typo_Figee.md** — spec typographique + copy validée
- **HOME_Traversee_Maison_Remplace_5Etats.md** — copy des 6 stations de la Home (annule et remplace la direction "5 états + arc")
- **WARROOM_Site_Decision_Finale.md** — décisions structurelles finales

Si une section semble avoir besoin d'un texte qui n'existe pas encore : **placer un TODO placeholder et flagger explicitement** dans la réponse. Kilian valide toute copie avant intégration. Aucune écriture, aucune paraphrase, aucun "remplissage plausible".

Règle brand associée : la Maison ne se justifie jamais. Aucune section méta/défensive (pas de "Why we don't do X", pas d'explication de la discrétion, pas de FAQ défensive). La discrétion est une condition, pas une promesse à défendre.
