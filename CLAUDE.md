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

# Copy rule (absolute)

**Zéro nouvelle copy user-facing écrite par l'agent.** Toute copie visible provient exclusivement du set validé ci-dessus + des fichiers Drive canoniques suivants (à ajouter au repo quand fournis) :

- **MDC_Site_V6** / **SITE_Prototype_V5_Valide_Typo_Figee.md** — spec typographique + copy validée
- **HOME_Traversee_Maison_Remplace_5Etats.md** — copy des 6 stations de la Home (annule et remplace la direction "5 états + arc")
- **WARROOM_Site_Decision_Finale.md** — décisions structurelles finales

Si une section semble avoir besoin d'un texte qui n'existe pas encore : **placer un TODO placeholder et flagger explicitement** dans la réponse. Kilian valide toute copie avant intégration. Aucune écriture, aucune paraphrase, aucun "remplissage plausible".

Règle brand associée : la Maison ne se justifie jamais. Aucune section méta/défensive (pas de "Why we don't do X", pas d'explication de la discrétion, pas de FAQ défensive). La discrétion est une condition, pas une promesse à défendre.
