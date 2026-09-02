# Maison du Calme

Le site de Maison du Calme. Next.js 16 (App Router, Turbopack), React 19,
Three.js / React Three Fiber, GSAP, Lenis.

## Lire ceci avant d'ecrire une ligne

Ce depot a des documents qui GAGNENT sur le code quand les deux se
contredisent. Ils ne sont pas de la documentation d'accompagnement : ils sont
la decision.

| document | ce qu'il tranche |
|---|---|
| `VISION.md` | identite visuelle, palette Aube Encens, typo, regles absolues |
| `COPY_V13.md` | la copy validee des pages internes. Aucune ligne visible ne s'ecrit ailleurs |
| `DIRECTION.md` | ce que le site fait de different, et surtout ce qui a ete RETIRE pour y arriver |
| `SERVICES.md` | les faits : ce que Kilian pratique reellement (interne, jamais publie) |
| `ASSETS_NANOBANANA.md`, `ASSETS_PLAN.md` | les images et leurs emplacements |
| `DEPLOY.md` | le standard de production |
| `CLAUDE.md` / `AGENTS.md` | les regles pour un agent, et l'ordre d'autorite |

Deux regles qui surprennent et qu'il vaut mieux connaitre tout de suite :

- **Zero nouvelle copy destinee au client.** Tout texte visible vient du set
  valide. Si une section semble manquer une phrase, on pose un TODO et on
  demande — on n'ecrit pas un texte plausible.
- **Un effet retire est retire.** `DIRECTION.md` liste ce qui a ete supprime et
  pourquoi, mesures a l'appui. Ne pas le reintroduire en croyant bien faire.

`.claude/skills/taste/SKILL.md` porte le jugement de design du projet, et
`.claude/agents/copywriter.md` porte les faits et la voix. L'agent ne se charge
que si ce depot est la RACINE de la session.

## Developpement

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # doit passer avant tout commit
npm start
```

Le build vert avant chaque commit est la methode du projet, pas une politesse :
un chantier a la fois, valide a l'oeil, puis on empile.

## Verifier une page dans un vrai navigateur

Le fond est un canvas WebGL sur toutes les routes, ce qui piege un Chromium
sans GPU. La recette complete, les drapeaux a passer et les pieges de mesure
d'animation sont dans `.claude/skills/playwright-cli/SKILL.md`.

## Deploiement

Vercel. Voir `DEPLOY.md`.
