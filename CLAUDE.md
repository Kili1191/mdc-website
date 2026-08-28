@AGENTS.md

# Design taste

Before shipping ANY UI change, copy edit, effect, animation, or color decision — read `.claude/skills/taste/SKILL.md`. It encodes MDC's concrete design judgment (palette, typography, motion, spacing, copy discipline, anti-patterns, checklist for "done"). This overrides personal taste, current trends, and defaults. When uncertain, quieter wins.

# Sources of truth (canonical)

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
