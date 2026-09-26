# MDC — Déploiement production, pas à pas

Objectif : `https://maisonducalme.com` en ligne, HTTPS, prod optimisée. Chemin recommandé : **GitHub → Vercel → domaine**. Le tout gratuit pour ce trafic, temps total ~30 min hors propagation DNS.

---

## 1. Push le repo sur GitHub

```bash
# Depuis /Users/kilian/Desktop/mdc-website
cd /Users/kilian/Desktop/mdc-website
git remote -v            # si vide → étape ci-dessous
```

Si aucun remote :
1. Va sur https://github.com/new → nom `mdc-website` (ou autre), privé de préférence
2. Copie l'URL SSH (ex `git@github.com:Kili1191/mdc-website.git`)
3. Puis dans le terminal :

```bash
git remote add origin git@github.com:Kili1191/mdc-website.git
git branch -M main
git push -u origin main
```

Si tu n'as pas de clé SSH : `gh auth login` (installe `brew install gh` d'abord) fait tout automatiquement.

---

## 2. Vercel — connecte le repo

1. Va sur https://vercel.com → **Sign up with GitHub** (gratuit, Hobby plan)
2. Dashboard → **Add New… → Project**
3. Sélectionne le repo `mdc-website` → **Import**
4. Framework preset : Next.js (détecté auto)
5. Build settings : garde les valeurs par défaut (`next build`, output `.next`)
6. Environment variables : aucune pour l'instant
7. **Deploy**

En 2–3 min tu as une URL du type `mdc-website-xyz.vercel.app`. Elle marche déjà. Chaque `git push origin main` redéploie automatiquement.

---

## 3. Achète le domaine `maisonducalme.com`

Registrar recommandé (rapport qualité/prix + DNS propres) :
- **Cloudflare Registry** — prix coûtant (~11 €/an .com), DNS ultra-rapide inclus
- **OVH** — ~10 €/an, interface FR
- **Namecheap** — ~13 €/an
- **Google Domains / Squarespace Domains** — ~14 €/an

Vérifie la dispo, achète. Prends 3-5 ans si tu veux — les moteurs de recherche apprécient.

---

## 4. Connecte le domaine à Vercel

### Dans Vercel
1. Project → **Settings → Domains**
2. Tape `maisonducalme.com` → **Add**
3. Vercel te propose deux options : **Vercel Nameservers** (le plus simple si tu veux tout gérer chez Vercel) OU **Records manuels** (garde ta zone DNS chez ton registrar). Recommandé : **Records manuels** pour flexibilité.
4. Vercel affiche deux records à copier :
   - **A**  `@`   → `76.76.21.21`
   - **CNAME**  `www`   → `cname.vercel-dns.com`

### Dans ton registrar (zone DNS)
1. Interface DNS de `maisonducalme.com`
2. Supprime tout enregistrement `A` ou `CNAME` existant sur `@` et `www`
3. Ajoute les deux ci-dessus
4. TTL par défaut (3600s)
5. Sauve

Propagation : 5 min à 24h selon TTL précédent et registrar. Généralement < 30 min.

### Vérification
```bash
dig maisonducalme.com +short         # doit renvoyer 76.76.21.21
dig www.maisonducalme.com +short     # doit renvoyer cname.vercel-dns.com
```

Vercel émet le certificat HTTPS automatiquement dès que le DNS résout. Tu vois une pastille verte dans le dashboard.

---

## 4bis. Où vont les messages du formulaire Begin — À FAIRE

Sans cette étape, `/begin` répond une erreur à chaque envoi. C'est délibéré :
un envoi qui échoue visiblement vaut mieux qu'un envoi qui fait semblant.
Personne ne doit pouvoir écrire ce qu'il porte et croire que c'est parti.

La route `src/app/api/begin/route.ts` poste le message en JSON à l'URL donnée
par **`MDC_BEGIN_FORWARD_URL`**. Aucun fournisseur n'est imposé et aucune clé
n'est écrite dans le dépôt : ça peut être un formulaire hébergé, un webhook,
une automatisation qui envoie l'e-mail.

### Dans Vercel

Settings → Environment Variables → Add

    Nom     MDC_BEGIN_FORWARD_URL
    Valeur  l'URL choisie
    Envs    Production (et Preview si tu veux tester avant)

Puis **redéployer** : une variable ajoutée ne s'applique pas au build en cours.

### Vérifier

    curl -i -X POST https://maisonducalme.com/api/begin \
      -H 'content-type: application/json' \
      -d '{"name":"Test","reach":"toi@exemple.com","carry":"essai"}'

`200 {"ok":true}` et le message arrive à destination. `503
destination_absente` veut dire que la variable n'est pas vue par ce
déploiement.

### Avant la mise en ligne

Le formulaire porte **deux textes en placeholder** — ce qu'il dit une fois
parti, et ce qu'il dit quand ça échoue. Ils s'affichent tels quels
(`TODO — …`). Ils sont en haut de `src/app/begin/BeginForm.tsx` et listés dans
`COPY_OUVERT.md` §1.1. Kilian les écrit, personne d'autre.

Rien du contenu des messages n'est journalisé : les logs disent si l'envoi a
réussi, jamais ce qu'il disait. La page promet le secret, le serveur le tient.

---

## 4ter. L'entretien de `/begin/before` — À FAIRE

La page pose les questions d'avant-séance une par une, choisit la suivante
d'après ce qui vient d'être répondu, et envoie à Kilian une fiche remplie plus
la transcription mot pour mot. Elle a besoin de **deux** choses.

### 1. La clé du modèle

    Nom     ANTHROPIC_API_KEY
    Valeur  la clé (console.anthropic.com → API keys)
    Envs    Production (et Preview si tu veux tester avant)

Elle ne figure nulle part dans le dépôt et ne doit jamais y figurer. Sans elle,
`/api/entretien` répond **503** et la page bascule sur « Write to him instead »,
qui renvoie au formulaire écrit de `/begin`. C'est le même principe que
ci-dessus : rien ne fait semblant de marcher.

### 2. Où va la fiche

    Nom     MDC_ENTRETIEN_FORWARD_URL      (facultatif)
    Valeur  l'URL choisie

**Facultatif** parce que la route retombe sur `MDC_BEGIN_FORWARD_URL` quand
elle n'existe pas : par défaut, l'entretien arrive là où arrive déjà le
formulaire écrit. Ne la définir que pour séparer les deux boîtes.

### Vérifier

    curl -i -X POST https://maisonducalme.com/api/entretien \
      -H 'content-type: application/json' -d '{"tours":[]}'

`200` avec un champ `question` : la clé est vue. `503 assistant_absent` : elle
ne l'est pas par ce déploiement.

### Ce que ça coûte

Un appel au modèle par question posée, plus un pour remplir la fiche. Un
entretien complet en fait une dizaine à une quinzaine. Les garde-fous sont dans
le code et pas dans une facture : `TOURS_MAX` (22 questions maximum),
`LIMITE_TOTALE` (16 000 caractères par entretien) et un plafond de 80 appels
par heure et par adresse IP.

### Ce qui n'est pas stocké

Rien. Pas de base, pas de session, pas de journal de contenu. La conversation
vit dans le navigateur du visiteur et dans le corps des requêtes ; la fiche
part chez Kilian et le serveur l'oublie. C'est de la donnée de santé, donc de
catégorie particulière au sens de l'article 9 du RGPD britannique, et la
manière la plus sûre de ne pas la perdre est de ne jamais la garder.

Conséquence assumée : un rafraîchissement de page perd l'entretien en cours.
La page le dit avant la première question.

## 5. Vérifs post-déploiement

- `https://maisonducalme.com` → doit servir le site (redirect www → apex ou l'inverse selon config Vercel, laisse ce que Vercel propose par défaut)
- `https://maisonducalme.com/sitemap.xml` → 8 routes listées
- `https://maisonducalme.com/robots.txt` → allow tout sauf `/test-site` et `/effects`
- Open Graph (test) : https://www.opengraph.xyz/url/https%3A%2F%2Fmaisonducalme.com/ → title + description + image OG (si tu ajoutes `opengraph-image.jpg` dans `src/app/`)

---

## 6. Déposer les assets vidéo/photo

Une fois en prod :

```bash
# Dépose les fichiers dans le repo, puis push :
cp votre-video.mp4 public/videos/vd-01.mp4
cp votre-photo.jpg public/photos/ph-01.jpg
git add public/videos public/photos
git commit -m "Add hero video + PH-01 stone image"
git push
```

Vercel redéploie en 1 min. Les `AssetFrame` détectent l'existence du fichier et affichent l'asset à la place du placeholder — zéro code à changer.

Cf `ASSETS_PLAN.md` pour la liste des slots + prompts.

---

## 7. Trucs à savoir

- **Preview URLs** : chaque PR/branche crée une URL de preview auto (`mdc-website-git-branch-name.vercel.app`) — utile pour tester avant merge.
- **Analytics** : Vercel Analytics est gratuit pour les 2500 events/mois (à activer dans Settings), donne les Core Web Vitals réels.
- **Logs** : Vercel garde 24h de logs de fonctions/build. Onglet **Deployments → View Function Logs**.
- **Rollback** : `Deployments → …` sur un déploiement précédent → **Promote to Production**. Instant.
- **Passer plus tard sur ton propre serveur ?** Le repo est standard Next.js — `next build && next start` marche partout (VPS, Docker, Railway, Fly.io).

---

## 8. Si un truc merde

- **DNS ne résout pas après 24h** : vérifie qu'il n'y a plus de vieux records `A` sur `@`. Certains registrars laissent des records de parking (ex OVH « anticadremploi »).
- **HTTPS invalide** : attends encore 5 min, Vercel réémet le cert quand le DNS est stable.
- **Site déployé mais 404 sur les routes** : Next.js App Router → normal si le build a échoué. Onglet **Deployments → Failed build → View logs**.
- **Fonts qui ne chargent pas** : les fichiers `.ttf/.otf` sont sous `public/fonts/` et importés via `next/font/local` → tout est bundlé automatiquement, pas de config CDN nécessaire.
