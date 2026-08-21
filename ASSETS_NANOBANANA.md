# MDC — ASSETS_NANOBANANA.md — Les 5 images d'états mentaux (prompts verrouillés WEB09)
*Complément de VISION.md. Prompts finaux validés le 8 juin 2026 — ne pas réécrire.*

## LE CONCEPT

Le visiteur ne regarde pas un décor. Il traverse **ses propres états mentaux** — les 5 états qu'un client MDC vit en session. Au scroll, chaque image cède à la suivante : **un scroll = une autre image**. Chaque image est chargée en Three.js comme PlaneGeometry haute résolution avec displacement shader piloté par sa depth map — profondeur 3D réelle, parallax au mouvement.

Séquence : La Charge Vue → Le Premier Lâcher → La Chaleur Qui Revient → L'Espace Intérieur → La Présence à Soi → puis la caméra approche la Maison 3D.

Note palette : les images 1-3 sont dominées par Brou foncé #2F2519 — c'est l'imagerie de la charge, PAS un dark theme d'interface. Le #2F2519 fait partie de la palette Aube Encens officielle. L'UI autour reste claire. L'arc va du dense vers le Parchemin lumineux : c'est la transformation elle-même.

## WORKFLOW

1. Générer chaque image via **Nano Banana Pro** (Gemini 3 Pro Image, Google AI Pro), ratio 16:9, 4K.
2. **Double test par image** (les DEUX obligatoires, sinon régénérer) :
   - Somatique : je ressens quelque chose dans mon corps ? (1: compression thoracique · 2: micro-relâchement · 3: chaleur qui monte · 4: espace, ouverture · 5: présence calme)
   - Visuel : niveau galerie d'art premium ? (composition retenue, matière/grain, lumière maîtrisée, palette respectée, Awwwards-worthy)
3. Pour chaque image validée : depth map via **depth-anything.com** (gratuit).
4. Three.js : DepthImageLayer.tsx (spec dans HANDOFF_WEB07) — PlaneGeometry ~256×256, vertex shader displacement par la depth map, les 5 plans en série sur l'axe Z, la caméra traverse au scroll.
5. Fichiers attendus dans le repo : public/states/state-1.jpg + state-1-depth.jpg ... jusqu'à state-5.

## LES 5 PROMPTS FINAUX (coller tels quels dans Nano Banana Pro)

### Image 1 — LA CHARGE VUE — "Oh. Je porte ça depuis combien de temps ?"

A subjective interior space rendered as fine art photography.
Heavy organic matter — dense, layered, ancient — fills the upper
two-thirds of the frame, descending like accumulated weight.
A single warm point of light in the lower center reveals
the density that was always there but never seen.
The light is not bright — it's the quality of light that
makes you see something you walked past for years.
Deep brown #2F2519 dominant, single point of warm amber #B89968.
Composition: heavy top, anchored bottom, asymmetric.
Texture: visible film grain, patina, dust suspended in light.
Style: Sugimoto seascapes meets Kiefer materiality.
Mood: oppressive but beautiful, contemplative, premium.
No human figures. No recognizable objects.
4K. Photorealistic painterly. Hasselblad medium format aesthetic.

### Image 2 — LE PREMIER LÂCHER — "Je peux poser ça ?"

Same interior space. The dense matter from the upper frame
has begun to release — not falling, releasing.
Small vertical traces of warm amber light appear where
threads have let go. Tiny voids in the texture.
The composition has the same heaviness but with subtle
breaks — like watching a held breath start to exhale.
Light: same warm point, now joined by faint vertical traces.
Texture: matter beginning to show its own internal structure.
Style: Sugimoto seascapes meets Kiefer materiality.
Mood: surprise, quiet relief, beauty of slow undoing.
Palette: Brou #2F2519, threads of Ocre #B89968 emerging.
4K. Photorealistic painterly. Premium fine art photography.

### Image 3 — LA CHALEUR QUI REVIENT — "Tiens. Je sens mes mains."

Same space, transformed by temperature.
The cool browns of the previous frames are warming visibly.
Ocre #B89968 begins to permeate the matter from below upward,
like blood returning to extremities.
The dense matter is still present but now alive with warmth —
no longer cold weight but warm presence.
Composition: warmth rising through the frame, lower half glowing.
Light: warm amber permeates everywhere, no longer a point source.
Texture: matter softening, edges less defined, breath visible.
Style: Bill Viola video stills meets Eliasson light phenomena.
Mood: dawning life, vivid warmth, quiet awakening.
4K. Photorealistic painterly. Premium fine art.

### Image 4 — L'ESPACE INTÉRIEUR — "Il y a de la place ici."

The dense matter has receded to the edges of the frame.
The center is now occupied by warm Parchemin #EDE4D0 light —
not empty, but inhabited by luminous space.
A vast interior volume where there was compression.
The matter remains at the periphery, no longer threatening,
just present — like context, not pressure.
Composition: open center, framed by softened matter edges.
Light: Parchemin glow from within the space itself, sourceless.
Texture: lighter, more spacious, particles drift in the warmth.
Style: Turrell light installations photographed by Sugimoto.
Mood: relief, expansion, sacred space found inside.
4K. Photorealistic painterly. Premium fine art.

### Image 5 — LA PRÉSENCE À SOI — "Je suis là."

Pure warm luminous interior. Parchemin #EDE4D0 throughout.
Not empty — inhabited by self-presence.
A single small architectural detail in the distance —
suggesting the form of a house, simple and clean,
in warm Rouille #A55A3E lines.
The space breathes with quiet aliveness.
The matter of the early frames has completely dissolved.
What remains is the quality of being home in oneself.
Composition: vast warm space, small precise focal point.
Light: ambient warmth, no shadows, no source needed.
Texture: subtle film grain, otherwise smooth and luminous.
Style: Hiroshi Sugimoto Theaters meets Anish Kapoor voids.
Mood: arrival, peace, the home was always inside.
4K. Photorealistic painterly. Premium fine art.

## EXTENSION AUX AUTRES PAGES

Le même système (image Nano Banana + depth map + parallax) sert les autres pages, chaque page recevant sa matière propre — même formule de prompt (espace subjectif, palette Aube Encens, style fine art, grain, sans figures humaines), déclinée selon la page :
- Sessions : matière au seuil du relâchement (entre états 1 et 2).
- Practitioner (Kilian) : espace chaleureux habité, présence (proche état 5, plus intime).
- Retreats : vastitude naturelle abstraite, lumière d'aube (état 4 ouvert sur l'horizon).
- The Work : matière en transmission, fils d'Ocre structurés (état 2-3).
- Begin : le seuil lumineux — Parchemin pur, une ouverture (état 5 épuré).
Chaque nouveau prompt suit les critères WEB09 : un état nerveux rendu visible, retenue formelle, un point focal, sourceless warmth, beauté qui se révèle à la durée. Double test somatique + visuel obligatoire avant intégration.

## STATUT

Les images n'ont JAMAIS été générées (bloqué sur souscription Google AI Pro en juin). Le code DepthImageLayer est spécifié (WEB07) mais pas construit. Action Kilian : générer Image 1 d'abord, double test, puis les 4 autres si validation.
