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

## 4bis. Où va le courrier — À FAIRE

Sans cette étape, `/begin` répond une erreur à chaque envoi et l'entretien de
`/begin/before` ne transmet rien. C'est délibéré : un envoi qui échoue
visiblement vaut mieux qu'un envoi qui fait semblant. Personne ne doit pouvoir
écrire ce qu'il porte et croire que c'est parti.

**Le site envoie le mail lui-même, en SMTP, en un saut.** Il n'y a pas de
relais, pas de webhook, pas de service de formulaire. Deux raisons, et chacune
suffirait.

Une plateforme d'automatisation répond **200 à la réception** de la charge, pas
à la livraison du mail : quota épuisé, étape en erreur, compte suspendu, et la
route voyait 200. La page affichait alors à quelqu'un qu'on venait d'orienter
vers le 999 que ce qu'il avait écrit était parti.

Et l'archive est leur produit : un service de formulaire garde les soumissions
dans un tableau de bord, une plateforme d'automatisation garde l'historique
d'exécution avec la charge. La fiche de `/begin/before` porte treize champs de
catégorie particulière au sens de l'article 9 du RGPD britannique, la
transcription mot pour mot et un drapeau d'urgence. La page affiche « Nothing
is saved here ».

### Les variables

    Nom     MDC_SMTP_URL
    Valeur  la connexion entière, identifiants compris
    Envs    Production (et Preview si tu veux tester avant)

    Nom     MDC_COURRIER_DE
    Valeur  l'adresse qui envoie

    Nom     MDC_BEGIN_A
    Valeur  la boîte qui reçoit

    Nom     MDC_ENTRETIEN_A        (facultatif)
    Valeur  une seconde boîte, pour l'entretien seul

`MDC_SMTP_URL` porte la connexion entière, donc **le fournisseur est une
variable et pas un choix gravé** : Resend, Brevo, Proton pour les
professionnels, tous parlent SMTP. En changer ne touche pas une ligne de code.

    smtps://utilisateur:motdepasse@serveur:465     (TLS direct)
    smtp://utilisateur:motdepasse@serveur:587      (STARTTLS)

Chez Resend, l'utilisateur est littéralement `resend` et le mot de passe est la
clé d'API. Tant que `maisonducalme.com` n'est pas vérifié chez le fournisseur,
`MDC_COURRIER_DE` doit être l'adresse de bac à sable qu'il impose, et le seul
destinataire autorisé est l'adresse du compte.

`MDC_ENTRETIEN_A` est **facultative** : sans elle, l'entretien arrive dans
`MDC_BEGIN_A`. Elle sert à séparer les boîtes, et il y a une raison de le
faire : les deux charges ne sont pas de même nature, et le drapeau d'urgence
mérite sa propre notification. Deux adresses chez le même fournisseur
suffisent.

Puis **redéployer** : une variable ajoutée ne s'applique pas au build en cours.
C'est le piège qui a déjà coûté deux passes.

### Vérifier

    curl -i -X POST https://maisonducalme.com/api/begin \
      -H 'content-type: application/json' \
      -d '{"name":"Test","reach":"toi@exemple.com","carry":"essai"}'

`200 {"ok":true}` et le mail arrive. `503 destination_absente` veut dire qu'il
manque une variable à ce déploiement — le journal Vercel dit laquelle, et c'est
la seule chose qu'il dit. `502 destination_en_erreur` veut dire que le serveur
de courrier a refusé.

**Le seul test qui compte est un mail réellement reçu.** La présence de la
variable ne prouve rien, et les journaux de fonctions sont purgés vite.

### En local, sans rien dépenser

`scripts/entretien-faux-modele.mjs` monte un faux point d'entrée Messages et un
faux serveur de courrier qui écrit le mail reçu sur le disque. Le mode d'emploi
est en tête du fichier.

### La délivrabilité, et les trois choses qui l'ont décidée

Mesuré le 3 octobre 2026, en production, après que les premiers envois soient
partis en spam.

**Il manquait DMARC, et c'est l'essentiel.** Le domaine avait SPF et DKIM, et
ça ne suffit plus : depuis 2024, Gmail et Outlook traitent avec méfiance un
domaine qui n'a pas de DMARC. L'enregistrement posé chez Cloudflare :

    Type      TXT
    Name      _dmarc
    Content   v=DMARC1; p=none; rua=mailto:contact@maisonducalme.com

`p=none` observe sans rien bloquer. Après ça, les envois sont arrivés en boîte
de réception. **C'est le levier qui a tout changé, et il coûte un
enregistrement.**

**Le SPF de la racine ne connaît pas Resend**, et ça n'a pas empêché le
résultat :

    v=spf1 include:_spf.mx.cloudflare.net ~all

Il est posé par Cloudflare Email Routing, qui gouverne la RECEPTION, et
Cloudflare le marque « Locked ». SPF échoue donc sur un envoi depuis
`contact@maisonducalme.com` — mais la signature DKIM de Resend est posée sur
`resend._domainkey` et alignée sur le domaine, et DMARC accepte qu'une seule
des deux passe. **Ne pas y toucher sans raison : cet enregistrement tient le
courrier entrant.** Les adresses de Resend, si un jour il le faut, sont dans
le TXT de `send.maisonducalme.com`.

**Un domaine neuf part toujours bas.** `maisonducalme.com` n'avait jamais
envoyé un mail avant ce soir-là. Et un message d'essai court et sans sens est
exactement ce qu'un filtre cherche : tester avec un vrai texte, sinon on
diagnostique le contenu en croyant diagnostiquer le domaine.

### Répondre depuis l'adresse de la maison

Gmail, Paramètres → Comptes et importation → « Envoyer des e-mails en tant
que » → ajouter `contact@maisonducalme.com`, avec le SMTP de Resend
(`smtp.resend.com`, port 465, utilisateur `resend`, mot de passe une clé
d'API **distincte de celle du site**, en Sending access). Puis « Utiliser comme
adresse par défaut » ET « Toujours répondre à partir de l'adresse par défaut ».

**Le piège qui a coûté une passe :** Resend refuse un message sans sujet, et
répond `550 Missing subject field.`. Google traduit ça par « The settings for
your Send mail as account are misconfigured or out of date », qui accuse la
configuration. La configuration allait bien. **Toujours lire « The response
from the remote server was » avant de toucher à quoi que ce soit** — c'est la
même leçon que le 400 de l'entretien, le même soir.

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
la transcription mot pour mot. Elle a besoin de la clé du modèle, en plus du
courrier de §4bis.

    Nom     ANTHROPIC_API_KEY
    Valeur  la clé (console.anthropic.com → API keys)
    Envs    Production (et Preview si tu veux tester avant)

Elle ne figure nulle part dans le dépôt et ne doit jamais y figurer. Sans elle,
`/api/entretien` répond **503** et la page bascule sur « Write to him instead »,
qui renvoie au formulaire écrit de `/begin`. Rien ne fait semblant de marcher.

**Attention au périmètre de la clé.** Une clé liée à l'organisation et non à un
espace de travail fait répondre 400 à chaque appel, et le journal le dit mot
pour mot. Prendre une clé d'espace de travail.

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

### Ce qui reste à régler, et qui n'est pas du code

**La rétention chez le fournisseur du modèle.** La transcription entière lui
part pour remplir la fiche. C'est de l'article 9 : demander la rétention zéro
sur la clé de ce projet.

**La boîte qui reçoit.** C'est là que des années de fiches vont s'accumuler, et
un compte de messagerie grand public gratuit n'a pas de contrat de
sous-traitance derrière lui. Une boîte professionnelle sous adéquation
britannique (Suisse, EEE) n'exige aucun instrument de transfert.

**Les destinataires ne sont nommés nulle part.** Le site écrit « Nothing is
saved here », « Never shared », « read by Kilian alone ». Il n'y a aucune page
de confidentialité. La phrase manquante est à écrire, et elle ne peut pas être
une bannière de trois paragraphes : ce serait trahir ce qu'elle protège.

### Ce qui n'est pas stocké

Rien. Pas de base, pas de session, pas de journal de contenu. La conversation
vit dans le navigateur du visiteur et dans le corps des requêtes ; la fiche
part chez Kilian et le serveur l'oublie. C'est de la donnée de santé, donc de
catégorie particulière au sens de l'article 9 du RGPD britannique, et la
discipline est la même partout dans ce dépôt.

---

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
