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

## 2. La doctrine de la maison

Le test, tel qu'il est ecrit dans l'agent copywriter : la maison peut avoir un
age et contenir des pratiques ; elle ne peut pas avoir un dedans et un dehors
ou l'on se deplace.

### 2.1 Trois phrases lui redonnent une porte

- `page.tsx:288` — `Six ways in. Five in the room, one on a call.` « ways in »
  suppose un interieur ; et comme l'une des six n'est justement pas dans la
  piece, le « in » ne peut designer que la maison. Le compte de portes rappelle
  en plus les « Five doors » annules.
- `components/effects/Testimonies.tsx:64` — `Nobody who comes to the house` :
  on vient a la maison, donc elle a une porte. Ce devrait etre la piece.
- `coaching/page.tsx:54` (meta) et `:63` (H1) — `The other door.` Excellent en corps de texte,
  mais en titre de page ca installe le compteur de portes.

**Ce que ces phrases doivent faire :** nommer le nombre et la forme de l'offre
(c'est utile, ca vend) sans compter des portes ni faire franchir un seuil.

### 2.2 La phrase qui nomme la maison tourne en rond

`page.tsx:248` — `Maison du Calme is a house. It asks nothing of you, and what
it makes is calm.`

La deuxieme moitie fait exactement le travail voulu : le refuge, puis la maison
de couture qui fabrique. La premiere dit « Maison du Calme est une maison » — et
une bonne partie d'une clientele londonienne aisee entend « House of Calm is a
house ».

**Ce que la phrase doit faire :** poser que c'est une maison au sens
institution, sans que la definition tourne en rond.

---

## 3. Ce que le lecteur ne peut pas suivre

### 3.1 « Each » n'a rien a quoi se rapporter

`sessions/page.tsx:59` — `Each begins the same way… Each leaves you somewhere
different.` C'est la deuxieme phrase de la page. Rien de pluriel n'a ete nomme :
le titre dit « It begins with ANTARA », singulier. Et « leaves you somewhere
different » suggere un menu d'issues au choix, ce que la doctrine de la suite
refuse.

**Ce que la phrase doit faire :** dire que c'est une suite de seances avant de
dire ce qu'elles ont en commun.

### 3.2 Un prix qui peut se lire comme faux

`page.tsx:76` — `Begins at £250` sur la ligne NERVANA. Le jeu de mots avec « It
opens with ANTARA, always » est bon, mais dans une colonne ou les cinq autres
lignes affichent un tarif sec, ca se lit « a partir de 250 £ » — alors que la
suite contient VAYU et SOMA a £180.

**A trancher :** est-ce le prix d'ANTARA, et il faut le dire ; ou une
fourchette, et il faut l'ecrire comme telle.

### 3.3 Contradiction sur le silence

`sessions/page.tsx:228` dit des quatre pratiques hors suite : `they are not
silent in the same way`. Trente lignes plus bas, sous REIKI : `Fully clothed,
in silence.`

**Ce que la phrase d'intro doit faire :** dire ce que ces quatre pratiques
partagent reellement (elles sortent de la suite), sans avancer sur le silence,
qui varie de l'une a l'autre.

### 3.4 On dit ou le coaching ne se passe pas, jamais ou il se passe

`practitioner/page.tsx:141` — `It is not the silent work, and it does not
happen in the room.` Le lecteur en conclut « donc une autre piece ». La page
Coaching, elle, dit clairement « on a call ».

**Ce que la phrase doit faire :** dire que ca se passe au telephone. C'est un
avantage, pas une soustraction.

---

## 4. La voix

### 4.1 Le chapo de The Work fait du tort a sa propre page

`the-work/page.tsx:32` — `A fair question. Here is an honest answer that gives
away nothing, because the giving-away is not the point.`

Trois fautes en une phrase : l'annonce d'honnetete (faute 2), le refus de dire
affiche (faute 4), et une justification meta que `CLAUDE.md` interdit. Or la
suite de la page est excellente et dit vraiment ce qui se passe.

**Ce que la phrase doit faire :** promettre le recit qui suit, rien d'autre.
Meme remarque pour la meta `:20`, qui finit sur `An honest answer that gives
away nothing.` — dans Google, ca se lit « on ne vous dira pas ».

### 4.2 Voix administrative, et les deux derniers cadratins

`the-work/page.tsx:44` — `This describes NERVANA, the silent work. The oil work
— Abhyanga, Marma — is also practised here, and it is not this. It is described
on Sessions.`

Le fait est necessaire, il resout la contradiction huile / pas d'huile entre
deux pages. Mais « It is described on Sessions » est une note de redacteur, et
« and it is not this » est bancal.

**Ce que la phrase doit faire :** dire en une ligne que cette page raconte le
travail silencieux, et renvoyer l'huile ailleurs sans nommer un onglet.

### 4.3 Symetrie de machine sur Coaching

`coaching/page.tsx:140` — `It is not added on to the silent work, and the silent
work is not turned into a conversation.` Le chiasme dit une seule chose deux
fois, en miroir. Suit `Many people only ever use one`, une statistique de
confort qui ne vient de nulle part.

**Ce que le passage doit faire :** dire une fois que les deux ne se melangent
pas.

### 4.4 « shape » deux fois en vingt-cinq lignes

`coaching/page.tsx:145` — `An hour is the usual shape.` et `:170` — `This is
the shape the work takes.` Bonnes separement ; ensemble, le tic s'entend.

### 4.5 Un « I » isole au milieu d'une page en « he »

`practitioner/page.tsx:112` — `I don't fix anyone. Nothing is broken.` La
meilleure phrase de la page, en Great Vibes, sans guillemets ni attribution,
dans une page entierement a la troisieme personne. Le lecteur ne sait pas qui
parle.

**A trancher :** citation attribuee a Kilian, ou reformulation en « he ».

---

## 5. Les metadata, que personne ne relit

### 5.1 L'accueil n'a pas de description propre

`page.tsx` est un composant client, donc aucune `metadata` n'y est exportee :
Google affiche la description racine, `layout.tsx:45` → `For those who carry
everything inside.` C'est un titre, pas une description : ni ce qui est propose,
ni a qui, ni ou. La version de `COPY_V13:72` n'est pas reutilisable telle
quelle, elle contient « a private house in London », qui est une adresse.

**Il faut une phrase neuve.**

### 5.2 La meta Sessions decrit la moitie de la page

`sessions/page.tsx:35` — `Silent, one to one, fully clothed, in Battersea.` Or
la page vend aussi Abhyanga, qui est huile et n'est pas habille.

### 5.3 La meta Coaching ne dit aucun des deux arguments de vente

`coaching/page.tsx:54` — se termine sur `arranged separately from the silent
work`, de la logique interne qui ne veut rien dire pour qui n'a jamais vu le
site. Manquent les deux seuls faits qui font cliquer : **a distance, ou que vous
soyez**, et **le premier appel est gratuit**.

---

## 6. Decisions produit, avant decisions de copy

### 6.1 Notes promet une revue et n'en livre pas une ligne

`notes/page.tsx` — trois resumes d'essais, aucun lien, aucune date, aucun texte
lisible. Le chapo annonce `Once a month there is a single essay`. Un lecteur qui
veut lire ne peut pas, et ne sait pas si le premier est paru.

**A trancher avant toute copy :** les essais existent-ils, et sinon, la page
doit-elle etre en ligne.

### 6.2 Le menu de Begin n'a pas d'option pour le coaching

`begin/BeginForm.tsx:81-84` — les options sont `A session`, `The deepest room, by
application`, `The retreat`, `I'm not sure yet`. Or `coaching/page.tsx:186`
envoie ici avec le bouton `Ask for the first call`. Le prospect coaching arrive
et ne trouve rien qui lui corresponde.

Accessoirement, l'`<option value="" disabled>` de la ligne 80 est **vide** :
le select s'affiche blanc, sans invite. Deux libelles a ecrire.

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

## 8. Le conflit de palette, qui n'est pas de la copy mais qui attend aussi

Mesure sur le fond marbre du site : le **rouille #A55A3E donne 3,27:1**, quand
un texte en demande 4,5. Sauge 2,25, taupe 1,77, ocre 1,73. Seuls le brou (6,93)
et le brou fonce (9,65) peuvent porter du texte.

Consequence : **93 textes du site sont sous le seuil**, tous en rouille — chaque
`QuietButton`, chaque nom de salle, et le « Begin » de la nav a 2,59.

Assombrir le rouille sortirait de la palette Aube Encens, ce que `VISION.md`
interdit, et `VISION.md` prime sur le skill de design. C'est donc un arbitrage
entre deux regles canoniques, et il appartient a Kilian. Detail complet dans
`.claude/skills/taste/SKILL.md`, §11b.
