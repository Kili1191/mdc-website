# MDC — La copy qui attend une decision de Kilian

*Sortie de la passe complete de l'agent copywriter, 2 septembre 2026. Ce qui
pouvait etre corrige sans ecrire un mot l'a ete et est en ligne (voir le commit
« L'agent copywriter est passe sur tout le site »). Ce document ne contient que
ce qui reste : les passages ou la correction demande une phrase neuve.*

**Les numeros de ligne derivent.** Ils sont justes au 2 septembre 2026, apres
la passe qui a corrige la pile A. L'ancre fiable est la CITATION, pas le numero :
chercher le texte entre backticks plutot que d'aller a la ligne.

**La regle qui explique ce document.** Aucun agent n'ecrit de copy destinee au
client. Donc rien ici n'est propose redige : chaque entree dit ou est le
probleme, pourquoi c'en est un, et **ce que la phrase doit faire**. La phrase,
c'est Kilian.

Quand une decision est prise, elle se reporte dans `COPY_V13.md` en meme temps
que dans le code, sinon elle est perdue a la session suivante.

---

## 1. Les trois urgences

### 1.1 Le formulaire Begin jette les messages

`src/app/begin/BeginForm.tsx:42` — `onSubmit={(e) => e.preventDefault()}`

Rien n'est envoye. Pas de destination, pas de confirmation, pas d'erreur. Le
visiteur voit un formulaire, il ecrit ce qu'il porte, il clique, et le message
disparait.

C'est de l'ingenierie avant d'etre de la copy, mais c'est la copy qui devient
fausse : `begin/page.tsx:71` promet **« Read by Kilian alone… Answered
personally, within two working days »**. C'est la seule promesse sur laquelle
tout le site repose, et elle n'est pas tenue par le code.

**LE BRANCHEMENT EST FAIT** (2 septembre 2026). `src/app/api/begin/route.ts`
recoit le message, le valide et le poste a l'URL donnee par
`MDC_BEGIN_FORWARD_URL`. Aucun fournisseur n'est impose : le choix reste entier.
Rien du contenu n'est journalise, la page promet le secret. Tant que la variable
n'est pas posee, la route repond 503 et le formulaire affiche son echec — un
envoi qui rate visiblement vaut mieux qu'un envoi qui fait semblant.

**Ce qu'il reste a Kilian, et rien d'autre :**

1. **La destination.** Une URL a poser dans Vercel. Voir `DEPLOY.md` §4bis.
2. **Deux phrases**, qui n'existent nulle part dans le set valide et qu'aucun
   agent n'ecrira : ce que le formulaire dit une fois parti, et ce qu'il dit
   quand ca echoue. Elles sont en placeholder visible en haut de
   `src/app/begin/BeginForm.tsx` (`TODO_ENVOYE`, `TODO_ECHEC`).

La troisieme phrase annoncee ici — « ce champ est obligatoire » — n'est plus
necessaire : `name` et `reach` portent `required`, et c'est le navigateur qui le
dit, dans la langue du visiteur.

### 1.1bis Les deux phrases du formulaire — ECRITES (3 sept. 2026)

Kilian a passe la plume : « 1 mais copywrite ». Ecrites par l'agent copywriter,
posees dans `BeginForm.tsx`, a valider par lui :

- **confirmation** — `It has arrived. He has it from here.`
- **echec** — `That did not send. What you wrote is still here: send it again.`

La confirmation accuse reception et transfere la garde, sans rejouer « Read by
Kilian alone » ni le delai, deja promis vingt lignes plus haut. L'echec dit le
fait puis leve la seule peur reelle de quelqu'un qui vient d'ecrire une page :
que son texte soit perdu. Il ne l'est pas, le formulaire n'est pas vide et le
bouton est reactive. Aucun recours vers un contact de secours n'est propose,
puisque le site n'en publie aucun.

Corrige au passage : l'echec passait par `role="status"` / `aria-live="polite"`,
qu'un lecteur d'ecran peut ne pas annoncer avant que la personne reparte. Il
porte desormais `role="alert"`.

### 1.1ter La sante, et pourquoi elle ne va PAS sur la page Begin

Question posee par Kilian : « study what to ask in my field ». Verdict de
l'agent copywriter, et c'est le point le plus important de sa reponse.

Le trou clinique est reel : huile de sesame et allergies pour Abhyanga,
grossesse, chirurgie recente, traitement en cours, tension, et les
contre-indications propres au son. Kilian pose son intention de soin sans
savoir tout cela.

**Sa recommandation est de ne rien mettre sur la page Begin**, pour deux
raisons.

1. **La nature du document change.** Une donnee de sante est une donnee de
   categorie particuliere au sens du UK GDPR (art. 9). Un champ medical
   transforme un formulaire de contact en collecte de donnees de sante :
   consentement explicite, base legale, duree de conservation, mention de
   confidentialite, et une garantie sur le transit — or la route poste a une
   URL tierce, et le service choisi (Formspree) STOCKE les messages sur ses
   serveurs. **Ce n'est pas une decision de copy.** A trancher avec §6.3, qui
   note deja qu'aucune mention de confidentialite n'existe sur le site.
2. **Le registre.** Un champ « conditions medicales » sur la page qui promet
   « this is not a form to be processed » casse exactement ce qu'elle vend.

Le bon endroit est l'echange prive d'avant seance — la decision restee ouverte
en §1.4. La sante s'y demande sans rien couter au site, et elle y est mieux
protegee.

**Attention, et ca vaut des maintenant :** le champ « What do you carry? »
invite deja quelqu'un a ecrire ce qu'il porte. Une partie des reponses
contiendra de la sante, qu'on l'ait demandee ou non. Le choix du service de
reception n'est donc pas neutre.

### 1.1quater Le formulaire lui-meme — propositions non appliquees

- **Un seul champ neuf merite sa place** : « When you could come », facultatif,
  placeholder `Weekdays, evenings, weekends. Roughly is enough.` La reponse de
  Kilian devient une proposition de creneau au lieu d'une question, et
  l'echange passe de trois allers-retours a un.
- **Le menu n'a pas d'option coaching**, alors que la page Coaching y envoie.
  Libelle propose : « Coaching, the first call », juste apres « A session ».
- **L'option vide en tete** s'affiche blanche : « Choose one », `disabled`
  conserve. Et le champ n'est pas `required`, donc il part vide une fois sur
  deux et Kilian perd le triage.
- **Prerempli depuis Coaching** via `/begin?brings=coaching`. Ingenierie, pas
  copy, mais c'est le meilleur point de conversion du lot.
- **« How to reach you »** pourrait dire `Email or telephone. Say if a call is
  welcome.` — pour qu'il n'appelle jamais quelqu'un qui ne le voulait pas.

Ce qu'il ne faut PAS toucher : « What do you carry? » en premier, avant le nom
(c'est le H1 de la page, le deplacer en ferait un champ comme un autre), et
« How this reached you », seule mesure d'acquisition du site.

### 1.2 Retreats — TRANCHE (2 sept. 2026)

Kilian : **« on en a pas encore fait »**. Aucune retraite n'a eu lieu, donc
aucune affirmation sur sa frequence, sa duree, son nombre de places ou le
comportement de participants ne peut tenir. Tout est retire, par suppression
pure. La page garde le refus (« this is not a wellness holiday »), le critere de
silence, la liste d'attente et ce qui est inclus.

L'agent copywriter a trouve **deux passages que la liste avait manques**, meme
faute exactement : « It happens rarely » (un present sur ce qui n'a pas eu lieu,
c'est-a-dire « Once a year » sous un autre mot) et le recit du premier et du
deuxieme jour, qui raconte un sejour que personne n'a vecu.

**Reste a l'appreciation de Kilian, sans qu'un mot soit a ecrire :**

- **« Very few people » dans le H1** est garde. C'est une intention de taille,
  pas un compte de places deja tenu. S'il l'estime aussi indecide, le titre
  devient `Somewhere quiet.` — toujours par simple suppression.
- **Le trou laisse la ou vivait le recit des jours.** La section se tient sans,
  et son titre (`Long enough to stop being reachable.`) porte deja l'idee. S'il
  veut une raison d'y aller a cet endroit precis, c'est une phrase de lui.

### 1.3 La voix — TRANCHE (2 sept. 2026)

Kilian : **« je sais pas, find the best answer »**. Verdict de l'agent
copywriter, applique : **tout passe en « he »**, Kilian nomme.

Sa raison, et elle est juste : le site vend une seule chose invérifiable, qu'il
n'y a personne derriere le rideau. Le « we » etait la seule phrase du site qui
la contredisait a chaque occurrence. La voix impersonnelle aurait ete le choix
lache — elle enleve le faux collectif sans rendre le texte a quelqu'un, et sur
le bloc Discretion elle transforme un homme qui tient parole en une politique
d'entreprise.

Verifie apres coup : **zero `we`, `us`, `our` sur tout le site.**

**Un point qui demande son accord, pas son ecriture :** `The Work` et `Retreats`
ne le nommaient jamais, donc « he » y serait sans antecedent. Le nom « Kilian »
entre une fois par page, a la premiere occurrence. C'est la seule matiere
ajoutee par cette passe — un nom deja present partout ailleurs, jamais une
phrase.

### 1.4 Ce qui se passe AVANT la seance — non decide, donc absent du site

Trouve par Kilian lui-meme, en lisant sa propre page : « faut bien que je sache
sur quoi je travaille ».

La page Practitioner disait **« He does not talk about any of this while he
works. He does not talk at all. »** La seconde phrase est retiree (2 sept.
2026, suppression pure). Elle etait fausse deux fois :

- **contre sa pratique** — il doit savoir ce que quelqu'un porte pour poser son
  intention de soin ;
- **contre la page elle-meme** — quinze lignes plus bas, elle dit « Where he
  trained, and with whom, he will tell you himself. In conversation. »

La premiere phrase reste, et elle est juste : il ne parle pas de sa formation
pendant qu'il travaille. Le silence de la seance est celui du CLIENT — « not
asked to speak » — pas le sien.

**Ce qui reste ouvert.** Kilian : « je vais envoyer peut-etre un questionnaire
avant session ou talk avant session ». **Peut-etre.** Donc rien n'entre sur le
site, meme regle que Retreats : on n'ecrit pas ce qui n'est pas arrete.

Deux choses a savoir quand il tranchera :

1. **Le formulaire Begin EST deja une prise d'information ecrite.** « What do
   you carry? » recueille exactement ce qu'un questionnaire d'avant-seance
   demanderait. S'il en ajoute un seceond, les deux se recouvriront et le client
   ecrira deux fois la meme chose. Le plus probable est qu'il n'a rien a
   construire, seulement a decider s'il rappelle avant.
2. **C'est un argument de vente, pas un detail d'organisation.** Le site ne dit
   nulle part que la seance est PREPAREE. Un lecteur qui voit « in silence »
   peut se demander comment le praticien sait quoi faire de lui. Dire qu'il y a
   un echange avant montre que rien n'est improvise — mais la phrase devra
   venir de Kilian, et seulement une fois le processus reel arrete.

---

## 2 a 5 — RESOLUES (3 sept. 2026)

Kilian : **« trouve des solutions toi meme en expert »**. Mandat passe a l'agent
copywriter, avec l'ordre des recours impose : supprimer, sinon restaurer une
formulation validee, sinon corriger un fait par un fait etabli, et n'ecrire une
phrase neuve qu'en dernier ressort.

**Resultat : treize corrections sans un mot neuf, trois phrases neuves, toutes
en metadata.** Aucune phrase neuve sur une page.

### Ce qui a ete supprime

- `Six ways in.` devient `Five in the room. One on a call.` — la porte part, le
  compte de six est deja porte par l'index numerote juste dessous.
- `Maison du Calme is a house.` part : la definition tournait en rond. Restent
  les deux verbes que Kilian avait nommes, le refuge et la fabrication.
- `Each begins the same way… Each leaves you somewhere different.` devient
  `Every session in NERVANA begins the same way…` — l'antecedent arrive, et le
  perimetre se borne a la suite. La seconde phrase suggerait un menu d'issues.
- `they are not silent in the same way` part : chaque carte dit deja ses
  propres conditions, et la contradiction avec REIKI disparait.
- `The oil work — Abhyanga, Marma — is also practised here, and it is not this.
  It is described on Sessions.` — les DEUX DERNIERS CADRATINS du site, plus une
  note de redacteur qui nommait un onglet.
- Le chiasme de Coaching, qui disait une fois ce qu'il disait deux fois, et
  `Many people only ever use one`, un chiffre qui ne vient de nulle part.
- `shape` en double a vingt-cinq lignes d'ecart : `An hour is usual.`

### Ce qui a ete restaure ou corrige par un fait

- Le H1 de Coaching passe de `The other door.` a `Some people need to say it
  out loud.` — la premiere phrase du chapo monte, sans un mot neuf. Le compteur
  de portes quitte le titre ; l'expression reste en eyebrow sur Practitioner,
  ou elle est bonne.
- `Nobody who comes to the house` devient `to the room`. Un mot, et c'est plus
  exact : le coaching ne se passe pas dans la piece.
- Practitioner disait ou le coaching NE se passe PAS. Il dit maintenant
  `on a call, wherever you are` — repris du titre de section de la page
  Coaching. La soustraction devient l'argument.
- `Begins at £250` devient `ANTARA · £250`. Se lisait « a partir de », faux
  puisque la suite contient VAYU et SOMA a £180. On ne peut pas entrer a £180.
- La phrase en Great Vibes prend des guillemets. Aucun mot touche : la page
  s'intitule « Kilian. » et porte son portrait, les guillemets suffisent a dire
  qui parle. La reformuler en « he » tuait la phrase.
- La meta de The Work finissait sur `An honest answer that gives away nothing`,
  qui dans Google se lit « on ne vous dira pas ». Remplacee par une queue tiree
  mot pour mot de COPY_V13.

### Les trois phrases neuves, a valider par Kilian

Toutes en metadata, aucune visible sur une page. Chacune est assemblee a partir
de fragments deja en ligne ; c'est l'assemblage qui est neuf.

1. **Accueil** (`layout.tsx`, les trois champs description) — `For those who
   carry everything inside. One to one work in Battersea, South West London.
   Coaching on a call. Entry is by conversation, not by calendar.`
2. **Sessions** — `Sessions at Maison du Calme, in Battersea. NERVANA is
   silent, fully clothed, and begins with ANTARA. Abhyanga, Marma, Reiki and
   sound as well. £130 to £250.`
3. **Coaching** — `Coaching with Kilian. One to one on a call, wherever you
   are, for people who need to say it out loud. The first call is free.`

Verifie au navigateur, huit pages, 1440 et 390 px : **zero cadratin sur tout le
site**, zero « we », zero debordement, aucune erreur.

---

## 6. Decisions produit, avant decisions de copy

### 6.1 Notes promet une revue et n'en livre pas une ligne

`notes/page.tsx` — trois resumes d'essais, aucun lien, aucune date, aucun texte
lisible. Le chapo annonce `Once a month there is a single essay`. Un lecteur qui
veut lire ne peut pas, et ne sait pas si le premier est paru.

**A trancher avant toute copy :** les essais existent-ils, et sinon, la page
doit-elle etre en ligne.

### 6.2 ~~Le menu de Begin n'a pas d'option pour le coaching~~ **REGLE**

`begin/BeginForm.tsx:81-84` — les options sont `A session`, `The deepest room, by
application`, `The retreat`, `I'm not sure yet`. Or `coaching/page.tsx:186`
envoie ici avec le bouton `Ask for the first call`. Le prospect coaching arrive
et ne trouve rien qui lui corresponde.

Accessoirement, l'`<option value="" disabled>` de la ligne 80 est **vide** :
le select s'affiche blanc, sans invite. Deux libelles a ecrire.

**Tranche par l'agent copywriter, applique, reporte dans `COPY_V13.md`.**
L'option est `Coaching, the first call`, en TROISIEME position : la session et la
deepest room sont le meme travail dans la meme piece, le coaching est l'exception
sur un appel, et on ne coupe pas la paire pour glisser son contraire au milieu.
L'invite est `Whichever is closest` — pas `Choose one` : la maison ne donne pas
d'ordre de formulaire sur la page qui promet « This is not a form to be processed ».
Les mots des deux libelles viennent de pages deja validees.

Reste ouvert et non tranche : le champ n'est toujours pas `required`, donc il part
vide une fois sur deux et Kilian perd le triage (voir 6.4 ci-dessous si elle existe,
sinon c'est ici). L'invite reduit le probleme, elle ne le regle pas.

### 6.3 Aucune mention de confidentialite

Le pied de page n'a ni contact, ni mentions, ni politique de confidentialite. La
page Begin recueille un nom, un moyen de contact et un texte intime, avec la
promesse `held in confidence`. Il manque au minimum une ligne.

---

## 7. Deux lignes validees que Kilian doit voir quand meme

Elles sont dans `COPY_V13.md`, donc personne n'y touche. Elles sont aussi les
plus abstraites du site, et le client decrit en section 4 de l'agent copywriter
— celui dont le metier est de reperer les phrases creuses — s'arrete dessus.

- `practitioner/page.tsx:86` — `It is the accumulation of a life spent learning
  to be present with what other people cannot hold`. « L'accumulation d'une
  vie » ne designe rien de saisissable, au milieu d'une page tres concrete.
- `practitioner/page.tsx:153` — `No one is named. This is not a policy. It is
  the product.` La rythmique en trois temps est belle ; « the product » est un
  mot de vendeur, pose au milieu de la promesse de discretion.
- `sessions/page.tsx:175` — `SOMA meets the tissue where it has settled and lets
  it change its mind.` Un tissu qui change d'avis, quand toutes les autres
  phrases de SOMA sont physiques.

---

## 8. Le conflit de palette — REGLE, et ce qui reste n'est pas ce qu'on croyait

**Cette section annoncait 93 textes en rouille sous le seuil. C'est faux
aujourd'hui, et il faut le dire clairement parce que le chiffre a ete repete.**

Re-mesure avec `scripts/contraste-matiere.mjs` contre le vrai fond de marbre,
sur `/`, `/sessions` et `/begin` : **aucun texte du site n'est ecrit en
rouille.** Tout le rouille restant dans `src/` est une bordure, un filet ou le
point du curseur. Le rouille vaut desormais `#B14E2D` (valeur validee par
Kilian, `VISION.md`), mesure 3,49:1 au pire — au-dessus des 3,0 que demande un
trait, et il n'a plus besoin d'atteindre 4,5 puisqu'il n'ecrit plus.

Le conflit entre `VISION.md` et la checklist de gout est donc **eteint**, et il
l'a ete par le travail de l'autre session : les mots sont passes au brou, le
filet est reste rouille. Il n'y a rien a arbitrer ici.

**Ce qui reste sous le seuil est une affaire d'opacite, pas de couleur.** Brou
compose en espace sRGB sur le fond reel : 1,00 → 8,22:1 ; 0,82 → 5,18:1 ; 0,62
→ 3,20:1 ; 0,25 → 1,51:1. Le plancher de 0,82 tient largement. Deux commandes
vivantes passent dessous :

- `BreathButton` — brou a 0,62, soit **3,20:1**.
- `.mdc-skip` dans `IntroOverlay` — taupe `#A89A85` a 0,25, soit **1,19:1**.
  C'est aussi la seule couleur dont le §11 dit qu'elle n'ecrit jamais, et c'est
  la seule sortie d'une intro de 18 secondes. Qui veut passer ne voit pas le
  bouton.

**A trancher par Kilian**, parce que les rendre lisibles se paie en discretion,
et que la discretion est voulue. Ce n'est plus une question de palette.
Detail dans `.claude/skills/taste/SKILL.md`, §11b.
