# Les photos de la maison — prompts

Six images, une par pratique. Elles doivent se lire comme **un seul
reportage**, pas comme six banques d'images. C'est le bloc commun qui fait
ça, pas les sujets.

---

## La méthode, avant les prompts

**1. Travaille en image-to-image, pas en texte seul.**
Nano Banana est bien meilleur en éditeur qu'en générateur. Donne-lui
`assets-source/albatre-lisse-full.jpg` ou `motif-compo-full.jpg` comme image
de départ, avec la consigne : *« Keep this exact stone, this exact light and
this exact colour. Add … »*. C'est la seule façon d'obtenir six photos qui
partagent la matière du site au lieu de six ambiances voisines.

**2. Ce qui fait qu'une image générée a l'air fausse**, dans l'ordre :
une lumière parfaite venue de partout ; une symétrie trop propre ; une peau
sans pore ; des reflets impossibles ; zéro poussière. **Le remède est de
nommer l'imperfection** — chaque prompt en contient au moins deux, ce n'est
pas décoratif.

**3. Les mains.** Cinq des six sujets en contiennent, et c'est là que ces
modèles échouent le plus. Trois parades, appliquées dans les prompts :
- ne montrer qu'**une** main, jamais deux ouvertes face caméra ;
- la couper au poignet ou la laisser sortir du cadre ;
- la poser **dans l'ombre douce**, pas en pleine lumière.
Génère 4 variantes par slot et jette sans état d'âme : un doigt de trop se
voit au premier coup d'œil et ruine tout le reste.

**4. Pas de visage.** Le site promet que personne n'est nommé — une photo de
visage le contredit. C'est aussi ce que ces modèles ratent le mieux. Nuque,
épaule, dos, ou visage sorti du cadre.

**5. Après génération**, passe les six par `scripts/generate_images.py`
(fonction `expose`) pour les amener à la même exposition. Sans ça, deux
images côte à côte ne se ressemblent jamais tout à fait.

---

## LE BLOC COMMUN — à coller dans CHAQUE prompt

> Photograph, not illustration and not a 3D render. Shot on a Hasselblad
> X2D with an 80mm lens at f/2.8, tripod, natural light only. One source: a
> tall north-facing window out of frame to the upper left, late afternoon in
> London. Deep soft shadows that never go black. Warm ivory alabaster and
> honey-veined onyx are present in the frame. Colour is restricted to
> parchment #EDE4D0, walnut brown #4A3B2A, taupe #A89A85 and ochre #B89968,
> with a single small note of rust #A55A3E and nothing else. Fine natural
> film grain, no digital sharpening halo, no HDR. Composition slightly off
> centre, one element gently out of focus. Fine dust visible in the shaft of
> light. Aspect ratio 4:5, vertical.

**Négatif — à coller aussi :**

> No faces. No text, no letters, no logos, no watermark. No candles, no
> folded towels, no orchids, no stacked pebbles, no incense sticks, no
> lotus, no bamboo, no spa signage. No jewellery, no watches, no phones. No
> plastic, no chrome, no cold white, no blue, no grey. No symmetry, no
> perfectly clean surface, no lens flare, no bokeh balls. Not oversaturated.

---

## LES SIX

### 01 · NERVANA — la pièce avant l'arrivée
> An empty treatment room a few minutes before someone arrives. A low
> massage couch dressed in unbleached washed linen, one corner of the sheet
> creased where a hand smoothed it. Bare limewashed wall. A single folded
> wool blanket, oatmeal. The light lies across the floor in one long band.
> Nobody in the room. The stillness of a room that is ready and waiting.

### 02 · ABHYANGA — l'huile chaude
> A small clay bowl of warm sesame oil on an alabaster ledge, the surface
> still moving in slow rings. One forearm and hand enter from the right
> edge, seen from behind and cropped at the wrist, fingers relaxed and
> partly in shadow, skin sheened with oil. A linen cloth beside the bowl,
> two dark stains where oil already fell. Warm amber, no gold glitter.

### 03 · MARMA — le point tenu
> Close on the inside of a wrist and forearm resting on unbleached linen,
> lit from above. A single thumb presses one point on the forearm, the hand
> cropped at the wrist by the frame edge. The skin around the thumb yields
> very slightly. Everything else falls away out of focus. Absolute
> stillness, no movement blur.

### 04 · REIKI — les mains qui ne touchent pas
> Seen from above: one hand held flat and still about three centimetres
> above a clothed shoulder, cropped at the wrist by the frame edge, entirely
> in soft shadow. The person is face down in unbleached linen, only shoulder
> and upper back visible, head out of frame. The gap between hand and body
> is the subject of the photograph.

### 05 · SOUND — le bol posé sur le corps
> A hammered bronze singing bowl resting directly on the lower back of a
> clothed person lying face down, seen from the side at body height. The
> bowl is old, the metal unevenly darkened, one dent near the rim. A wooden
> striker lies on the linen beside it, not held. Head out of frame. The
> bronze is the only warm metal in the picture.

### 06 · COACHING — l'appel
> A quiet corner at the end of the day: a wooden chair by a window, a closed
> laptop on a low table, the screen dark, a glass of water half drunk beside
> it. Nobody in the chair. Outside the window, London roofs dissolved out of
> focus. The light is later and lower than the other five, the room almost
> in shadow. This is the only picture with a horizon in it.

---

## Où elles vont

| fichier | cadrage | page |
|---|---|---|
| `public/photos/si-01.jpg` … `si-04.jpg` | 4:5 | les salles NERVANA |
| `public/photos/pt-01.jpg` | 4:5 | le praticien |
| `public/photos/rt-01.jpg` | **21:9** | la retraite |

Pour le 21:9 de la retraite, garde le bloc commun mais change la dernière
ligne en `Aspect ratio 21:9, wide panorama` et prends un sujet qui respire :
un horizon au lever du jour, aucun bâtiment, aucune silhouette identifiable.
