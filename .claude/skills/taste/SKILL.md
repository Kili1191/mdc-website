---
name: taste
description: Design taste judgment for Maison du Calme (MDC). Encodes concrete rules learned from the project's design decisions — palette, typography, motion, restraint, content density, copy discipline — so any future session knows when a screen is *done* vs *over-decorated / jarring / off-brand*. Invoke before finalising any UI change on this site, or when asked "does this look right?".
type: judgment
---

# taste — MDC design judgment

The MDC design language is **Aman × The Row × Aesop** filtered through **Sugimoto / Turrell / Kiefer / Bill Viola** in the Aube Encens palette. Everything on the site defers to that. If a decision reads as "clever," "modern for its own sake," "generic Awwwards," or "designer showing off," it is wrong. Restraint is the highest value.

## When to invoke

- Before shipping any UI change (component, page, effect, animation)
- Before writing new copy (spoiler: don't — see rule §7)
- When the user asks "does this look right / is this good / what do you think"
- When choosing between two visual options
- When adding a new library, effect, or pattern

## Absolute rules (never break)

### 1. Palette — Aube Encens only, no exception
Legal colors:
- `#EDE4D0` Parchemin — bg, 55% of surface
- `#4A3B2A` Brou — text, 15%
- `#2F2519` Brou foncé — strong titles
- `#8C8B6A` Sauge — vegetal accent, ≤ 12%, sparse
- `#A89A85` Taupe — neutral pause, 10%
- `#B89968` Ocre — warm accent, ≤ 5%
- `#A55A3E` Rouille — logo, CTAs, highlights, ≤ 3%

Illegal:
- Any dark mode
- Any color outside the palette (that includes greys, whites, pure blacks, bright accents, gradients into off-palette hues)
- Neon, cool blues, purples, saturated brights
- CSS defaults (default blue link, default black text)

If a component looks correct but uses a non-palette color, it is wrong.

### 2. Typography — three fonts, exact hierarchy
- **Prata** — body, subtitles, microcopy, everything default
- **Higuen** — big display titles, section labels, room names (ANTARA/VAYU/SOMA/TRANSMISSION), quotes
- **Great Vibes** — **one single occurrence on the entire site**: the Practitioner page quote `I don't fix anyone. Nothing is broken.` Nowhere else.

Illegal:
- Any other font
- All-caps used freely (only in Higuen labels/eyebrows with letter-spacing 0.14–0.32em)
- Font weights other than 400 (single weight per font family)
- Bold, italic used for emphasis in body

### 3. Motion — cohérence cardiaque 5.5s, subtle, never showy
- Half-breath: **3000ms** (post-shortening) or **5500ms** (contexts requiring true 5.5s coherence, e.g. cursor)
- Any oscillating element must synchronise to this rhythm or a coherent multiple
- Ease: `cubic-bezier(0.16, 1, 0.3, 1)` for reveals (out-quart-like), `cubic-bezier(0.4, 0, 0.6, 1)` for exits
- No `bounce`, no `elastic`, no cartoon ease
- Reveal amplitude: `translateY` between 0.4em and 0.6em, never more
- Duration: fades 700–950ms, transitions 400–600ms, page transitions 450ms out / 700ms in
- No motion that fights the reader — every animation must feel like breath, not a spring

Never:
- Element scaling > 1.4 unless it's a hero moment (house zoom, intro exit)
- Rotations > 15° on content
- Any hover animation with a "pop" character
- CSS animation on properties that trigger layout (width, height, top, left) — GPU only (transform, opacity, filter)

### 4. Spacing — generous, ritualistic
- Section-to-section vertical: 96–200px (`SPACE.lg`–`xxl`), never < 64px
- Container max-width: 640–780px for reading, 940 for feature pages
- Container horizontal padding: `8vw` on desktop, tighter on mobile via clamp/`6vw`
- Paragraph-to-paragraph gap: 24px
- Title to body: 40px
- Body font-size: 18px minimum, line-height 1.75

If a screen feels "tight," add whitespace before touching anything else.

### 5. Frames, cards, overlays — near-invisible
- Content containers use `background: rgba(237, 228, 208, 0.28)` + `backdrop-filter: blur(3px)` — a *voile*, not a card
- Never a visible border on content
- Never a shadow on content (except cinematic vignette in shaders)
- The marble (SiteMarble) is the persistent background — content floats over it, does not sit on cards
- No visible rectangle around media (no dashed placeholder, no border on images)

### 6. The house = the logo, always
- The house on the Home MAISON station and everywhere the house appears is `/public/mdc-logo.svg`
- Not a custom architectural 3D house (walls, roof, door)
- Rendered as **solid fill** in Rouille (matching IntroOverlay), not wireframe outlines
- Max scale in HomeStage: **0.48** — never fills the viewport
- If someone builds a "realistic 3D house," it is wrong

### 7. Copy — validated set only, never invented
- All visible text on the site comes from the validated set:
  - `COPY_V13.md` (internal pages)
  - User-provided copy in chat (Home 6 stations, Great Vibes quote, session-specific corrections)
  - Future canonical files when added: `MDC_Site_V6`, `SITE_Prototype_V5_Valide_Typo_Figee`, `HOME_Traversee_Maison_Remplace_5Etats`, `WARROOM_Site_Decision_Finale`
- **Zero new user-facing copy** by the agent. Ever. If a section seems to need text that doesn't exist, place a TODO placeholder and flag it to Kilian.
- **No em dashes** (`—`) anywhere in visible text. Replace with `,`, `.`, `:`, or `·` per context.
- **No meta/defensive sections** — the house never justifies itself. No "Why we don't do X," no "Why no names, no dates," no FAQ that defends the practice. If it explains the discretion, it violates the discretion.
- **NERVANA is now public** (decision de Kilian, cette session). Le nom de la
  methode s'ecrit sur le site : c'est sa technique, elle se pratique nulle part
  ailleurs, et c'est la seule chose vraiment inimitable de l'offre. Les noms de
  salles restent publics (ANTARA, VAYU, SOMA, TRANSMISSION, URDHVA).
  Ce qui reste interne : le **comment**. Decrire ce qu'une seance fait, oui.
  Decrire la mecanique par laquelle elle le fait, non.

### 8. Density — content > quote wallpaper
- A page that is only 6 short phrases with nothing else is not enough. That was the frustration on Home traversée v1.
- Each station / section needs at least one of: real image (`AssetFrame` placeholder now, real asset later), a 3D moment (House, DepthImageLayer), meaningful whitespace with a marble reveal, or interactive matter.
- If a page reads as "quotes scrolling with nothing between," it fails the taste check.

### 9. Effects — one signature per section, not a demo reel
Effects available (`src/components/effects/`): `SplitTextChars`, `ImageReveal`, `FluidImage`, `ScrollDriftGallery`, `AssetFrame`, `QuietButton`. Plus `BreathReveal` in `src/components/`.

That list is short on purpose. `TextScramble`, `Marquee`, `ImageMarquee`, `ParallaxStack`, `DepthImageLayer` and `HorizontalScroll` were deleted — see DIRECTION.md. Do not reintroduce them, and do not assume a component exists because this file once named it.

Rules:
- **One primary effect per section** — never stack SplitTextChars + Marquee + Parallax + Fluid on the same block
- Big titles: SplitTextChars OR BreathReveal, not both
- CTAs: `QuietButton`, always. **Never a magnetic / cursor-attracted button.** `MagneticButton` was removed: it pulled the button toward the pointer at 0.35 of a 90px radius, so a centred CTA could sit 31px off its axis just because the cursor passed nearby — visible on the home stations, and the thing Kilian noticed. It also kept a permanent `requestAnimationFrame` loop and a window `mousemove` listener per instance (four on the home page, on top of the marble's WebGL loop), and it did nothing at all on touch. In a silent house, nothing chases anyone.
- Body text: no effect (readability wins)
- Image slots: `ImageReveal` for atmospheric, `FluidImage` for feature moments, `ScrollDriftGallery` for atmospheric strips — never all three on one page
- Marquee (text): once per page maximum, footer-style, not headline
- Cursor: BreathingCursor is enough — no additional trailing, sparkles, blob morphs

### 10. Performance — 60fps or it doesn't ship
- All animations on GPU (transform + opacity only in rAF)
- No `width` / `height` animations
- No blur > 10px on animated elements (blur is expensive)
- `will-change` on animated properties, removed after animation
- No more than ONE persistent WebGL context outside home (SiteMarble). Effects with their own canvas (FluidImage, HomeStage) are OK if they exist only where used
- **The marble layer is never rebuilt.** `SiteMarble` must not depend on the route: making the motif a prop of `MarbleBackground` tore down the renderer on navigation and left the screen without marble for 1.8s. Measured. See DIRECTION.md
- On mobile: WebGL and heavy interactions gate on `pointer: fine` (BreathingCursor, SoundToggle already do; extend the pattern)
- Test in production build (`npm run build && npm start`) before declaring a motion "done" — dev mode overhead lies

### 10b. Le fond ne s'ouvre que sur un geste

The marble opens under a pointer or a finger. **Nothing else opens it** — no
timer, no idle detection, no breath clock.

A stillness reward was built and removed. From the inside it is a reward for
stopping; from the outside nobody knows they were rewarded, so it reads as a
background changing on its own, and on a content page it floated the motif's
engraved house up *behind the body text*. Measured, visitor perfectly still:
local background detail went 34.81 → 36.79 over ten seconds and kept climbing;
after removal it is 34.61 at every sample.

An interaction the user cannot attribute to their own gesture is not an
interaction, it is instability.

Stillness survives in exactly one place, because Kilian asked for it there: on
the home MAISON station it drives the chisel deeper and revives the ember in
the groove. It never touches the ground again.

**Anything that varies per route is a uniform read per frame** (`marbleMode`),
never a prop — a prop of `MarbleBackground` rebuilds the WebGL layer.

### 10c. Rien ne defile sous un voile plein ecran

The intro covers the screen for ~15 s while the page behind it is already
6161 px tall and scrollable. A visitor who sees nothing happening swipes —
everyone does — and lands wherever they scrolled when the veil lifts.
Reproduced: six swipes during the intro put the document at 4083 px; the intro
lifted at **79 % of the page**, in the middle of the session images.

A CSS lock is not enough. `overflow: hidden` on `html` and `body` stops
*native* scrolling, but **Lenis does not scroll natively** — it swallows the
wheel and the touch and moves the window in JavaScript, and programmatic
scrolling walks straight through `overflow: hidden`. Measured with the CSS lock
in place and Lenis running: one wheel of 1500 still reached 610 px, a real
touch swipe 750 px.

So a full-screen veil owes three things, not one:

1. `overflow: hidden` on `html` and `body` (native scrolling),
2. **`lenis.stop()`** until the veil lifts (JavaScript scrolling),
3. `window.scrollTo(0, 0)` when it lifts — a browser can also restore a
   position from an earlier visit while the veil hides it. You never arrive in
   the middle of someone's house.

And a safety timeout that restarts Lenis regardless. A page that can no longer
scroll is worse than anything the lock was fixing.

### 11. Le taupe n'ecrit pas

`COLORS.taupe` (#A89A85) is a **pause** colour — a rule, a border, a divider.
It is not a text colour. Measured against the site's marble ground
(~rgb(221,205,185)): **1.77:1**. Small text needs 4.5:1. `COLORS.brou` gives
**6.93:1**.

This was not cosmetic. Every duration and every fee line on the Sessions page
— the information that actually sells — was written in taupe italic at 12px.
It was, in practice, invisible. Use `brou` for eyebrows and micro-labels, with
opacity no lower than 0.78, and drop the italic: small caps + wide tracking +
italic at 12px is three legibility costs stacked on one line.

### 12. A page is not a column

One centred 720px column with `<hr>` between sections is not a layout, it is a
default. What a page owes the reader:

- **An index when there is more than one offer.** Before: you had to scroll
  four long sections to learn there were four rooms. A four-line index at the
  top — number, name, one-line promise, duration — is the single change that
  moves a page from "quotes scrolling past" to "here is what I can take".
- **Alternating spreads**, image one side and text the other, side swapping
  down the page. Stacking everything in the same order at the same width reads
  as a document, not a design.
- **A number instead of a rule.** `<hr>` is a free separation; `01` says where
  you are.
- **No translucent blurred card over the background.** A frosted box is an
  admission that you do not trust your own ground. The marble is light
  (luminance 205); brou reads on it directly.
- **Body measure capped** around 62ch.

## Checklist before shipping any UI change

Run mentally, silently, top to bottom. If any answer is "no" or "not sure," fix before declaring done.

1. Every visible color is in the Aube Encens palette?
2. Every font used is Prata, Higuen, or Great Vibes (and Great Vibes only in *the one place*)?
3. All copy text comes from a validated source (V13, user chat, canonical Drive doc)?
4. No em dashes anywhere?
5. No meta/defensive sections (no "why we don't", no FAQ that defends discretion)?
6. NERVANA named where it belongs, and the *method* still internal? (The name is public since Kilian's decision — see §above. How it works is not.)
7. Every reveal/motion synchronises to the breath rhythm or is completely still?
8. Every animation uses only `transform` / `opacity` / `filter`?
9. Every CTA is a `QuietButton`, and nothing on the page follows or flees the cursor?
10. Every image uses `AssetFrame` (so missing files degrade gracefully) OR is a proven local asset?
11. No visible frame, border, shadow, or card on content? (A `backdrop-filter` box counts as a card.)
12. Section vertical spacing ≥ 96px?
13. Every text colour ≥ 4.5:1 against the marble — i.e. no text written in taupe?
15. If a full-screen overlay is up, is scrolling stopped in JS as well as CSS, and is the page returned to the top when it lifts?
16. Does anything change on screen without the user having done something? (A timer, an idle clock, a breath driving the background — all forbidden on the ground layer.)
14. If the page presents more than one offer, is there an index at the top?
13. Body font-size ≥ 18px, line-height ≥ 1.75?
14. If this section is copy-only, is there also a non-textual moment (image slot, 3D, matter)?
15. The 3D house is the logo (Rouille fill, ≤ 0.48 scale), not a custom architecture?
16. On mobile (< 640px), does everything still fit without horizontal scroll and stay readable?
17. Does it run at 60fps in the production build?
18. If a user glances at this for 2 seconds, does it say "Sugimoto/Aman quiet" or "designer showing off"?

## Anti-patterns — automatic fail

Any one of these means the change must be reworked:

- Orange glow (emissive Rouille pulsing loud)
- Wireframe rendering of anything (unless deliberately architectural at low scale)
- 3D element filling more than 60% of viewport height
- Bright accent color introduced (blue, green, purple)
- Sans-serif fallback rendering (means font not loaded — must fix)
- Text over animated shader without contrast guarantee (voile card if unsure)
- CTA without magnetic hover
- Any element that scales > 20% on hover
- Any transition longer than 1.5s that isn't the intro or the home hero traversal
- Adding a section named "About" or "Why us"
- Writing new sentences for the client because "it feels missing"
- Using `!important` more than three times in a component

## Judgement calls the agent should make

- Between two acceptable options, pick the one closer to *Aman restraint*
- Between one striking option and one quiet option, quiet wins by default (only override with explicit user approval)
- If uncertain about a color, use Taupe (safe neutral)
- If uncertain about a type size, go smaller
- If uncertain about a motion amplitude, go subtler
- If uncertain about copy, use exactly what exists in the validated set, or TODO placeholder

## Files that encode taste (read these before major changes)

- `VISION.md` — canonical design vision
- `AGENTS.md` / `CLAUDE.md` — project rules
- `COPY_V13.md` — validated copy
- `ASSETS_PLAN.md` — asset slots and prompts
- `ASSETS_NANOBANANA.md` — image generation prompts + workflow
- `DEPLOY.md` — production standard
- `src/styles/tokens.ts` — color and font source of truth

## What "done" feels like

A screen is done when:
- Nothing on it is trying to be noticed
- The reader's eye lands on the copy, not on the effect
- Removing any element would degrade the ritual, not simplify it
- The palette is warm and quiet, no cool tones detected
- Motion, if present, feels like breath — not like a spring, ping, or slide
- A photograph of the screen could sit next to Aman's website without looking cheap

If any of those isn't true, take one more pass.
