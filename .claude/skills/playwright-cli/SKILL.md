---
name: playwright-cli
description: Drive a real browser against this site to screenshot pages, read console errors, and verify a visual change actually renders. Use when asked to check how a page looks, reproduce a visual bug, confirm a UI change works end to end, or audit the site in a browser. Covers the WebGL flags this repo specifically requires.
---

# Playwright on this repo

## The one thing that will waste your afternoon

Maison du Calme renders its background in WebGL on **every** route
(`SiteMarble` lives in the root layout). A headless Chromium launched with
default flags in a container has no GPU, and the renderer **crashes** — you get
Chrome's "This page couldn't load" sad-tab and conclude the site is broken when
it is fine.

Always pass software GL:

```
--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader
```

Symptom you are missing them: `PAGEERROR: Error creating WebGL context.` plus
a page body reading "This page couldn't load".

## Browsers are preinstalled, never run `playwright install`

The image ships Chromium at `/opt/pw-browsers` and sets
`PLAYWRIGHT_BROWSERS_PATH`. The pinned build (1194) does not match whatever
version `npx playwright` resolves to, so the CLI will demand
`npx playwright install`. Do not run it. Point Playwright at the binary
instead:

```js
chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: [...] })
```

`npx playwright screenshot` has no `executablePath` flag, so for this repo
write a small script rather than using the CLI subcommands.

## Working recipe

```bash
# 1. build + serve production (dev mode distorts animation timing)
npm run build && PORT=3100 npx next start &

# 2. install the driver without touching package.json
npm i --no-save playwright@1.62.1
```

```js
import { chromium } from 'playwright';

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage',
         '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

// Skip the intro overlay, otherwise you screenshot 30s of breathing animation.
await p.addInitScript(() => { try { localStorage.setItem('mdc_intro_seen', '1'); } catch {} });

p.on('pageerror', e => console.log('PAGEERROR:', e.message));
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });

await p.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);          // let the reveal + breath settle
await p.screenshot({ path: 'home.png' });
await b.close();
```

## Repo-specific gotchas

- **Intro overlay.** Without `mdc_intro_seen` in localStorage the first paint is
  the logo animation, not the site. Set it in `addInitScript`, not after
  `goto` — it must exist before first render.
- **`?from=carry`** also bypasses the intro, as does `prefers-reduced-motion`.
- **Wait ~3s.** `networkidle` fires before `SplitTextChars` and the marble
  reveal have run. Screenshots taken immediately look half-empty.
- **Asset slots now exist.** `/photos/*.jpg` are produced by
  `scripts/generate_images.py` from the real onyx bas-relief and are committed.
  This line used to say they were missing and that console 404s on those paths
  were expected — so a genuine 404 there is now a regression, not the norm.
  `AssetFrame` still HEAD-probes, so a missing file degrades quietly rather
  than breaking the page: check the network log, not just the screenshot.
- **`/testimony/*.mp4` 404s ARE expected**, unlike the images above. `/coaching`
  HEAD-probes `01.mp4` and `02.mp4` to decide whether to render the "In their
  own words" section at all; the videos are not in the repo yet. Deposing a
  file is meant to be the whole act, with no manifest to keep in sync. See
  `public/testimony/README.txt`. Do not chase these two.
- **Page height is a timing trap.** Measure `document.documentElement.scrollHeight`
  only after the wait. Measured too early the home page reads 900 instead of
  5400 and looks like the 6 stations vanished.

## Testing the no-WebGL path

The site must stay readable when a browser refuses WebGL (see
`src/lib/webgl.ts`). Simulate a refusal without crashing Chromium by stubbing
`getContext` rather than passing `--disable-webgl`:

```js
await p.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (typeof type === 'string' && type.toLowerCase().includes('webgl')) return null;
    return orig.call(this, type, ...rest);
  };
});
```

Expected result: no page errors, nav and copy present, a static alabaster
background. Anything blank is a regression.

## Note on dependencies

Playwright is deliberately **not** in `package.json`. Vercel installs
devDependencies during the build, and this repo already carries `puppeteer`
for `screenshot.mjs`. Install it with `--no-save` when you need it so
production builds stay lean. `puppeteer` works too and needs the same GL flags.

## Measuring an animation mid-flight

Verifying that a *finished* animation looks right is easy. Verifying that it
**progresses** — that a sweep actually sweeps — took a full session of wrong
answers on this repo. Every trap below was hit for real while checking the nav
engraving. They compound: each one alone produces a confident, wrong reading.

**1. `getAnimations()` pause does not take.** Grabbing the animation and
pausing it left every frame showing the finished state. The series looked
identical at 120 / 300 / 620 ms because it *was* identical, and the tiny
differences being measured were marble noise.

**2. Freeze with a negative `animation-delay` instead.** It does not depend on
`getAnimations()` resolving the pseudo-element, which is what failed above:

```js
el.style.animation = 'none';
void el.offsetWidth;                       // force reflow
el.style.animation = 'mdc-graver 700ms cubic-bezier(0.65,0.05,0.36,1) forwards';
el.style.animationDelay = '-240ms';        // 240ms into the curve
el.style.animationPlayState = 'paused';
```

**3. Set the freeze BEFORE restarting the animation.** Changing
`animation-delay` on an animation that has already finished does not rewind it
in Chrome. Order matters: kill, reflow, re-declare with the delay, then pause.

**4. The marble pollutes every pixel diff.** `SiteMarble` veins move
continuously behind everything, so a naive frame-to-frame diff reports change
where nothing changed. **Measure the noise floor first** — two captures with
nothing animating — and only trust a threshold above it.

**5. Do not hide the canvas to remove that noise.** Hiding the marble layer
gated the nav off entirely and produced a blank measurement. Clip to the
element's own bounding box instead, and keep the ground where it is.

**6. The first capture can be blank.** The canvas had not painted yet, so the
0 ms reference frame was empty — which silently invalidated the whole series
measured against it. Always look at the reference frame before trusting the
deltas.

**7. Anchor the clip on the element, not on coordinates.** A hand-placed crop
drifted onto the wordmark twice. Take `boundingBox()` of the actual node.

**8. Shoot at true size.** An 8× zoom flattered a lip that read as an outline,
not a groove, at the size a visitor sees.

And a plain one: **screenshots do not survive the container.** Re-shoot against
the merged build rather than trusting a PNG from an earlier session.
