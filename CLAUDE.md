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

`DIRECTION.md` — l'immobilite comme interaction. Ce que le site fait de
different, ce qui a ete retire pour y arriver, et ce qui reste. A lire avant
d'ajouter le moindre effet.


These docs live at repo root and win over anything in code when they conflict:

- **VISION.md** — identité visuelle, système de scroll deux axes (vertical/horizontal, spirale à venir), arc émotionnel (avant/pendant/après), règles absolues (palette Aube Encens, NERVANA Guard, typo Prata/Higuen/Great Vibes, jamais de dark theme), méthode de build (fondation → empilement, un chantier à la fois, build vert + commit).
- **ASSETS_NANOBANANA.md** — les 5 images d'états mentaux traversées au scroll (La Charge Vue → Le Premier Lâcher → La Chaleur Qui Revient → L'Espace Intérieur → La Présence à Soi), prompts Nano Banana verrouillés WEB09, workflow depth map (depth-anything.com), spec `DepthImageLayer.tsx` (HANDOFF_WEB07), fichiers attendus `public/states/state-N.jpg` + `state-N-depth.jpg`.
- **COPY_V13.md** — copy des pages internes (Sessions, Practitioner, Retreats, The Work, Notes, Begin). Cadratins interdits.

# Copy rule (absolute)

**Zéro nouvelle copy user-facing écrite par l'agent.** Toute copie visible provient exclusivement du set validé ci-dessus + des fichiers Drive canoniques suivants (à ajouter au repo quand fournis) :

- **MDC_Site_V6** / **SITE_Prototype_V5_Valide_Typo_Figee.md** — spec typographique + copy validée
- **HOME_Traversee_Maison_Remplace_5Etats.md** — copy des 6 stations de la Home (annule et remplace la direction "5 états + arc")
- **WARROOM_Site_Decision_Finale.md** — décisions structurelles finales

Si une section semble avoir besoin d'un texte qui n'existe pas encore : **placer un TODO placeholder et flagger explicitement** dans la réponse. Kilian valide toute copie avant intégration. Aucune écriture, aucune paraphrase, aucun "remplissage plausible".

Règle brand associée : la Maison ne se justifie jamais. Aucune section méta/défensive (pas de "Why we don't do X", pas d'explication de la discrétion, pas de FAQ défensive). La discrétion est une condition, pas une promesse à défendre.
