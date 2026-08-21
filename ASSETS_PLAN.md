# MDC — Effects wiring + Assets plan
*Compilé après validation de /effects. Décrit précisément où chaque effet vit sur le site et liste tous les assets (vidéos/photos) à générer, avec leurs prompts.*

---

## 1. Câblage des effets sur les pages actuelles

### Home (`/`)
| Station | Effet | Note |
|---|---|---|
| SEUIL     | `SplitTextChars` sur le titre (au lieu de BreathReveal) + slot vidéo hero derrière | plus signature qu'un mot-par-mot |
| PIERRE    | Slot image « pierre gravée » avec `ImageReveal` derrière le titre | bas-relief marbre, voir prompt PH-01 |
| MAISON    | 3D House existante (garder tel quel) | déjà signature |
| TRAVAIL   | `BreathReveal` (garder) + `MagneticButton` sur « The Work » | |
| KILIAN    | `SplitTextChars` sur la citation (phrase longue, effet riche) + `MagneticButton` sur « Kilian » | |
| BEGIN     | `SplitTextChars` sur « Arriving is enough. » + `MagneticButton` sur le bouton Begin | |

### Sessions (`/sessions`)
- h1 « Four ways to set it down. » → `SplitTextChars`
- Chaque salle (ANTARA/VAYU/SOMA/TRANSMISSION/Arc) → slot image `ImageReveal` (prompts SI-01..SI-04)
- CTA « Apply » → `MagneticButton`

### Practitioner (`/practitioner`)
- h1 « Kilian. » → `SplitTextChars`
- Slot photo Kilian (silhouette/mains) avec `FluidImage` — prompt PT-01
- Discretion h2 « No one is named. » → `SplitTextChars`
- « See the lineage » → `MagneticButton`

### Lineage (`/lineage`)
- h1 « Where the work comes from. » → `SplitTextChars`
- Chaque lieu (Rishikesh, Dharamshala) → petit slot image `ImageReveal` — prompts LP-01, LP-02

### Retreats (`/retreats`)
- h1 « Once a year… » → `SplitTextChars`
- Slot image atmosphère retreat — prompt RT-01
- CTA « Register interest » → `MagneticButton`

### The Work (`/the-work`)
- h1 « What actually happens. » → `SplitTextChars`
- Pull-quote → `SplitTextChars`
- CTA « Begin » → `MagneticButton`

### Notes (`/notes`)
- h1 « Notes. » → `SplitTextChars`
- Chaque numéro d'essai (Essay 01/02/03) → `TextScramble`

### Begin (`/begin`)
- h1 « Begin. » → `SplitTextChars`
- « What do you carry? » (question centrale) → `TextScramble` (le texte se décode devant toi)
- CTA « Send this » → `MagneticButton`

### Global (layout)
- `Marquee` en bas de chaque page → une bande discrète (texte à définir par Kilian)

---

## 2. Vidéos à générer

### VD-01 — Hero SEUIL (Home)
- **Emplacement** : slot fixe derrière le titre « For those who carry everything inside. »
- **Durée** : boucle 8–12s, seamless loop
- **Ratio** : 21:9 ou 16:9, 4K
- **Codec** : H.264 ou VP9, muted, autoplay
- **Prompt (Runway Gen-3 / Sora)** :
> A slow drift over pale onyx marble, sourceless warm light, dust particles suspended in the air, extremely shallow depth of field. Palette Aube Encens: parchemin cream, ocre, faint rouille veins. No people, no text, no logos. Extremely slow horizontal drift, cinematic, film grain, Sugimoto/Turrell photography aesthetic. 8 second seamless loop.

---

## 3. Photos à générer (Nano Banana Pro — cf ASSETS_NANOBANANA.md workflow)

Tous prompts respectent : palette Aube Encens (Parchemin #EDE4D0, Brou #4A3B2A, Ocre #B89968, Rouille #A55A3E), no human figures sauf mention, fine art photography, sourceless warmth, film grain, medium format aesthetic, 4K, ratio 4:5 sauf mention.

### PH-01 — Pierre gravée (Home / PIERRE station)
Slot 4/5 derrière le titre « There is a kind of tiredness… »
> Close-up of a single hand-carved onyx stone slab, the faint outline of a house engraved in it — barely visible, warm amber inside the engraved lines. Dominant Brou #4A3B2A tones, soft Ocre #B89968 glow from within the engraving. Deep shadow around, single point of warm light. Sugimoto meets Kiefer materiality. No text.

### PT-01 — Practitioner (Kilian portrait)
Slot 4/5 en début de page Practitioner. Deux options selon souhait :
- **Silhouette** :
> A single male silhouette against a warm pale parchment wall, head slightly bowed, out of focus, only the shape of the shoulders and neck readable. Warm amber directional light from the side, deep taupe shadow. Palette Aube Encens. Photojournalistic, dignified, discreet. No sharp facial features visible.
- **Mains** :
> Close-up of a single pair of male hands resting palms up on a warm cream linen cloth, hands relaxed, fingertips softly lit. Warm Ocre #B89968 highlights, deep Brou shadow, sourceless light. Fine art photography, medium format, subtle film grain. Nothing else in frame.

### LP-01 — Rishikesh (Lineage)
Slot 3/4 sous « North India · Rishikesh »
> A quiet stone step on the bank of a wide, misty river at dawn, worn by generations of feet. Warm amber light rising through the mist. No people, no religious iconography visible. Palette Aube Encens: cream sky, taupe mist, warm ocre light. Sugimoto seascapes aesthetic. Contemplative, ancient.

### LP-02 — Dharamshala (Lineage)
Slot 3/4 sous « The Himalaya · Dharamshala »
> A single ancient prayer flag hanging still against distant Himalayan peaks in soft warm light. The flag is faded, its color reading as warm Rouille #A55A3E against pale parchemin sky. Deep silence, no wind, no people. Fine art photography, medium format. Sacred without being spiritual iconography.

### SI-01 — ANTARA (Sessions)
Slot 4/5
> A quiet warm room with a single low platform bed, dressed in cream linen, sourceless warm ambient light. Empty, waiting. Palette Aube Encens: parchemin walls, taupe floor, faint Ocre glow. No decoration, no windows visible, no text. Meditative, threshold-quality space.

### SI-02 — VAYU (Sessions)
> Cream linen curtains slowly moving in still warm air, one thin ray of warm amber light passing through. Just fabric and light. Palette Aube Encens. Fine art photography, extremely soft focus, contemplative. No people, no room details visible.

### SI-03 — SOMA (Sessions)
> A single warm-lit hand-carved wooden low table, one small ceramic bowl of dark amber oil resting on it. Warm shadow around, sourceless light from above. Palette Aube Encens with deeper Brou tones. Nothing else in frame. Ritual, still.

### SI-04 — TRANSMISSION (Sessions)
> A single closed heavy wooden door, warm Rouille #A55A3E lacquered, framed by a pale parchemin stone wall. Deep shadow at the door's threshold, one warm point of light above suggesting inside is warm. No handle visible, no signage. Palette Aube Encens. Contemplative, restrained access.

### RT-01 — Retreats (atmosphère)
Slot 21:9 ou 4/5
> A vast quiet interior of an old stone house, sourceless warm light pooling on the floor, faded parchemin walls, no furniture except a single low bench. Emptiness that feels inhabited rather than abandoned. Palette Aube Encens. Sugimoto Theaters meets Turrell. No text, no people.

---

## 4. Statut / prochaine étape

- **Code effets** : câblés dans les pages ci-dessous (ce commit)
- **Frames placeholders** : divs sizés à la place des futures vidéos/photos, opacité 0.15, label du slot dedans (data-slot="VD-01" etc.) — remplaçables sans changer une ligne du code
- **Génération assets** : Kilian lance les prompts Nano Banana + Runway/Sora, dépose les fichiers dans `/public/videos/vd-01.mp4`, `/public/photos/ph-01.jpg`, etc. Chaque frame les prend automatiquement quand le fichier existe.
