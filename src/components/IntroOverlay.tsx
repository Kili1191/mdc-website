'use client';

/**
 * MDC IntroOverlay — breath-driven logo reveal
 * - Joue une fois (localStorage mdc_intro_seen) ; bypass via ?from=carry
 * - Skippable ; respecte prefers-reduced-motion
 * - Sortie : zoom immersif à travers la maison → révèle le site derrière
 * Séquence : mur gauche (inhale) → fond (exhale) → mur droit (inhale)
 *            → toit (exhale) → yeux + "Maison du Calme" ensemble
 * Cohérence cardiaque 5.5s / 5.5s
 */

import { useEffect, useRef, useState } from 'react';
import { INTRO_DONE_EVENT, INTRO_EXIT_EVENT, INTRO_PRELOAD_EVENT, shouldBypassIntro } from '@/lib/introReady';
import { BREATH_MS } from '@/lib/stillness';

// Le demi-souffle, et pourquoi il n'est plus un nombre ecrit ici.
//
// Il a valu 3000 ms pendant des mois. Le commit qui l'avait pose disait
// « Intro trop longue avant le zoom : demi-souffle 5500ms -> 3000ms », en
// reponse a un signalement de Kilian. Le raccourcissement etait legitime,
// l'endroit ne l'etait pas : 3 secondes par demi-souffle font DIX
// respirations par minute, quand la coherence cardiaque en demande 5,5. On ne
// peut pas respirer avec, et c'est tout le propos de cette ouverture.
//
// Le fichier se contredisait lui-meme : son en-tete annonce « Coherence
// cardiaque 5.5s / 5.5s », `src/lib/stillness.ts` pose BREATH_MS a 5500, et
// VISION.md l'exige. Seule cette constante disait autre chose.
//
// Elle vient donc maintenant de la meme source que le reste du site. Le
// souffle ne peut plus deriver dans un coin sans que tout le reste suive.
//
// Ce qui reste raccourci l'est a bon droit : HOLD et EXIT sont des PAUSES et
// un zoom, pas de la respiration. Les toucher ne change pas le rythme.
const T = BREATH_MS;   // demi-souffle, 5500 ms
const HOLD = 1200;     // pause après yeux + titre
const EXIT = 1600;     // durée du zoom d'entrée

const LABELS = ['inhale', 'exhale', 'inhale', 'exhale'];

export default function IntroOverlay() {
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);

  const introRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef<HTMLDivElement>(null);
  const bwRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const rLW = useRef<SVGRectElement>(null);
  const rBT = useRef<SVGRectElement>(null);
  const rRW = useRef<SVGRectElement>(null);
  const rRF = useRef<SVGRectElement>(null);
  const eyesG = useRef<SVGGElement>(null);
  const exiting = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (shouldBypassIntro()) {
      setDone(true);
      return;
    }
    setMounted(true);
  }, []);

  // LE DOCUMENT NE DOIT PAS DEFILER SOUS L'INTRO.
  //
  // L'intro dure quinze secondes et couvre tout l'ecran, mais la page derriere
  // elle mesure deja 6161 px et reste scrollable. Un visiteur qui attend sans
  // voir bouger fait ce que tout le monde fait : il swipe. Rien ne lui indique
  // que son geste agit, et quand le voile se leve il se retrouve la ou il a
  // scrolle.
  //
  // Reproduit : six swipes pendant l'intro amenent le document a 4083 px ;
  // l'intro se leve a 4200 px, soit 79 % de la page, en plein dans le bandeau
  // d'images des seances. C'est exactement ce que Kilian decrivait : « ca
  // ouvre directement en bas de la page sessions ».
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    const body = document.body;
    const memo = {
      htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = memo.htmlOverflow;
      body.style.overflow = memo.bodyOverflow;
      html.style.overscrollBehavior = memo.htmlOverscroll;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    // Preload site content early (during breath) so Three.js is warm
    // before the exit zoom — prevents main-thread block that would
    // freeze the zoom animation.
    const preloadTimer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(INTRO_PRELOAD_EVENT));
    }, 600);

    const easeIO = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
    const easeExpoIn = (x: number) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10));

    let wipePhase = -1;
    function wipe(h: number, f: number) {
      // Only mutate the currently-animating rect (and snap prior ones to
      // their final state on phase change). Reduces per-frame setAttribute
      // from 8 to 1-2 so mask+clip re-composite happens only for the layer
      // that's actually moving.
      if (h >= 4) {
        rLW.current?.setAttribute('height', '310');
        rBT.current?.setAttribute('width', '574');
        rRW.current?.setAttribute('height', '310');
        rRW.current?.setAttribute('y', '168');
        rRF.current?.setAttribute('width', '574');
        wipePhase = 4;
        return;
      }
      if (h > wipePhase) {
        if (h > 0) rLW.current?.setAttribute('height', '310');
        if (h > 1) rBT.current?.setAttribute('width', '574');
        if (h > 2) {
          rRW.current?.setAttribute('height', '310');
          rRW.current?.setAttribute('y', '168');
        }
        if (h > 3) rRF.current?.setAttribute('width', '574');
        wipePhase = h;
      }
      if (h === 0) rLW.current?.setAttribute('height', (310 * f).toFixed(2));
      else if (h === 1) rBT.current?.setAttribute('width', (574 * f).toFixed(2));
      else if (h === 2) {
        const hgt = 310 * f;
        rRW.current?.setAttribute('height', hgt.toFixed(2));
        rRW.current?.setAttribute('y', (478 - hgt).toFixed(2));
      }
      else if (h === 3) rRF.current?.setAttribute('width', (574 * f).toFixed(2));
    }

    function setEyes(o: number) {
      if (eyesG.current) eyesG.current.style.opacity = String(o);
    }

    let lastLabel = '';
    function updateBreath(h: number, f: number, on: boolean) {
      const el = bwRef.current;
      if (!el) return;
      if (!on) { el.style.opacity = '0'; return; }
      const isIn = h === 0 || h === 2;
      const sz = isIn ? 10 + 9 * f : 19 - 9 * f;
      const label = LABELS[Math.min(h, 3)];
      if (label !== lastLabel) { el.textContent = label; lastLabel = label; }
      // GPU transform scale instead of font-size (avoids per-frame text layout)
      el.style.transform = `translate(-50%,-50%) scale(${(sz / 19).toFixed(4)})`;
      el.style.opacity = (0.55 * Math.sin(Math.PI * f)).toFixed(4);
    }

    function enterHouse(startTs?: number) {
      if (exiting.current) return;
      exiting.current = true;
      const e0 = startTs ?? performance.now();
      localStorage.setItem('mdc_intro_seen', '1');
      window.dispatchEvent(new CustomEvent(INTRO_EXIT_EVENT));

      function exitTick(ts: number) {
        const p = Math.min(1, (ts - e0) / EXIT);
        const z = easeExpoIn(p);

        if (wrapRef.current) {
          wrapRef.current.style.transform = `translateZ(0) scale(${(1 + z * 26).toFixed(3)})`;
          wrapRef.current.style.transformOrigin = '50% 44%';
          wrapRef.current.style.filter = `blur(${(z * 9).toFixed(2)}px)`;
        }
        if (thresholdRef.current) {
          const flash = Math.sin(Math.PI * Math.min(1, p / 0.82));
          thresholdRef.current.style.opacity = (flash * 0.85).toFixed(3);
          thresholdRef.current.style.transform = `translateZ(0) scale(${(1 + z * 3).toFixed(3)})`;
        }
        if (introRef.current) {
          const fade = p < 0.28 ? 1 : 1 - easeIO((p - 0.28) / 0.72);
          introRef.current.style.opacity = fade.toFixed(4);
        }
        if (p < 1) requestAnimationFrame(exitTick);
        else {
          // On rend la main EN HAUT DE LA PAGE, sans condition. Le verrou
          // ci-dessus empeche le defilement pendant l'intro, mais un navigateur
          // peut aussi restaurer une position d'une visite precedente pendant
          // que le voile la cache. On n'arrive jamais chez quelqu'un au milieu
          // de sa maison.
          const html = document.documentElement;
          html.style.overflow = "";
          document.body.style.overflow = "";
          html.style.overscrollBehavior = "";
          window.scrollTo(0, 0);
          window.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT));
          setDone(true);
        }
      }
      requestAnimationFrame(exitTick);
    }

    let t0: number | null = null;
    function tick(ts: number) {
      if (t0 === null) t0 = ts;
      const t = ts - t0;
      const h = Math.floor(t / T);
      const f = easeIO((t - h * T) / T);

      if (h < 4) {
        wipe(h, f); setEyes(0);
        brandRef.current?.classList.remove('mdc-brand-in');
        updateBreath(h, f, true);
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      if (h === 4) {
        wipe(4, 1); setEyes(f);
        brandRef.current?.classList.toggle('mdc-brand-in', f > 0.05);
        updateBreath(0, 0, false);
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      if (t - 5 * T < HOLD) {
        wipe(4, 1); setEyes(1);
        brandRef.current?.classList.add('mdc-brand-in');
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      enterHouse(ts);
    }

    const skipHandler = () => {
      cancelAnimationFrame(rafId.current);
      wipe(4, 1); setEyes(1);
      brandRef.current?.classList.add('mdc-brand-in');
      updateBreath(0, 0, false);
      setTimeout(() => enterHouse(), 350);
    };
    const skipBtn = document.getElementById('mdc-skip');
    skipBtn?.addEventListener('click', skipHandler);

    rafId.current = requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(preloadTimer);
      cancelAnimationFrame(rafId.current);
      skipBtn?.removeEventListener('click', skipHandler);
    };
  }, [mounted]);

  if (done) return null;
  if (!mounted) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#EDE4D0' }} />
  );

  return (
    <>
      <style>{`
        .mdc-intro{position:fixed;inset:0;z-index:9999;background:#EDE4D0;
          touch-action:none;overscroll-behavior:none;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          will-change:opacity;isolation:isolate;contain:layout paint;
          transform:translateZ(0);}
        .mdc-intro::after{content:"";position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(110% 110% at 50% 48%,
            rgba(237,228,208,0) 48%, rgba(168,154,133,.14) 100%);}
        .mdc-wrap{display:flex;flex-direction:column;align-items:center;
          will-change:transform,filter;transform:translateZ(0);
          backface-visibility:hidden;}
        .mdc-stage{position:relative;width:min(68vw,340px);aspect-ratio:574/480;
          transform:translateZ(0);}
        .mdc-stage svg{width:100%;height:100%;overflow:visible;display:block;
          pointer-events:none;transform:translateZ(0);}
        .mdc-breath{position:absolute;left:50%;top:58%;
          transform:translate(-50%,-50%) scale(0.526);
          transform-origin:center;
          font-family:var(--font-prata),'Cormorant Garamond',Georgia,serif;
          font-weight:300;font-style:italic;
          letter-spacing:.38em;text-transform:lowercase;
          color:#4A3B2A;white-space:nowrap;
          pointer-events:none;user-select:none;
          opacity:0;font-size:19px;
          will-change:transform,opacity;}
        /* Le nom de la maison sous le dessin.
           Il etait a clamp(14px,3.4vw,22px) : sur un telephone de 390 px, 3,4vw
           vaut 13,3 px, donc la borne basse s'appliquait et le nom sortait a
           14 px sous une maison de 265 px de large. Le dessin ecrasait la
           marque. Le nom vaut au moins un quinzieme de la largeur du dessin. */
        .mdc-brand{font-family:'Higuen','Higuen Elegant Serif',var(--font-prata),Georgia,serif;
          font-size:clamp(21px,6.4vw,34px);letter-spacing:.14em;
          color:#2F2519;opacity:0;transform:translateY(7px);
          transition:opacity 2.2s cubic-bezier(0.16, 1, 0.3, 1),transform 2.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align:center;margin-top:clamp(16px,3.6vw,26px);
          white-space:nowrap;pointer-events:none;user-select:none;}
        .mdc-brand-in{opacity:1 !important;transform:translateY(0) !important;}
        .mdc-threshold{position:fixed;inset:0;z-index:10000;
          background:radial-gradient(circle at 50% 44%,
            rgba(255,252,244,.95) 0%,
            rgba(237,228,208,.7) 35%,
            rgba(237,228,208,0) 72%);
          opacity:0;pointer-events:none;will-change:opacity,transform;}
        .mdc-skip{position:fixed;bottom:18px;right:22px;
          background:none;border:none;
          font-family:var(--font-prata),Georgia,serif;
          font-size:10px;letter-spacing:.24em;color:#A89A85;
          opacity:.25;text-transform:lowercase;cursor:pointer;
          padding:8px 4px;transition:opacity .4s;z-index:10001;}
        .mdc-skip:hover{opacity:.65;}
      `}</style>

      <div className="mdc-threshold" ref={thresholdRef} />

      <div className="mdc-intro" ref={introRef}>
        <div className="mdc-wrap" ref={wrapRef}>
          <div className="mdc-stage">
            <svg viewBox="0 0 574 480" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <g id="bV"><path fill="#A55A3E" fillRule="evenodd" d="M 285.500 3 C 284.505 4.100, 283.338 5, 282.908 5 C 282.478 5, 278.061 7.813, 273.092 11.250 C 260.943 19.655, 239.105 34.925, 226.973 43.500 C 221.525 47.350, 209.290 55.976, 199.784 62.669 C 190.278 69.361, 180.374 76.336, 177.777 78.169 C 175.179 80.001, 167.079 85.691, 159.777 90.813 C 152.474 95.935, 141.775 103.462, 136 107.539 C 130.225 111.616, 121.677 117.550, 117.005 120.726 C 112.333 123.902, 107.158 127.641, 105.505 129.035 C 103.852 130.429, 98.900 134.008, 94.500 136.988 C 90.100 139.967, 86.350 142.764, 86.167 143.203 C 85.983 143.641, 85.384 144, 84.834 144 C 84.285 144, 81.060 146.025, 77.668 148.499 C 68.577 155.131, 55.268 164.499, 49 168.676 C 45.975 170.693, 40.119 174.853, 35.987 177.921 C 31.856 180.990, 26.489 184.850, 24.061 186.500 C 17.667 190.845, 1 205.875, 1.002 207.293 C 1.004 208.646, 8.993 214, 11.010 214 C 11.726 214, 13.786 212.875, 15.589 211.500 C 17.392 210.125, 19.242 209, 19.702 209 C 20.161 209, 22.715 207.200, 25.377 205 C 28.040 202.800, 30.518 201, 30.886 201 C 31.254 201, 32.917 199.762, 34.583 198.250 C 36.249 196.737, 40.286 193.505, 43.556 191.067 C 46.825 188.629, 49.831 186.154, 50.235 185.567 C 51.060 184.369, 51.013 183.448, 51.480 210 C 51.669 220.725, 52.179 241.200, 52.613 255.500 C 53.047 269.800, 53.424 325.375, 53.451 379 L 53.500 476.500 56.750 476.813 C 58.615 476.993, 60 476.664, 60 476.040 C 60 475.356, 60.833 475.478, 62.250 476.369 C 65.195 478.223, 75.651 478.588, 111.500 478.089 C 143.099 477.650, 265.067 477.422, 355.500 477.633 C 386.850 477.706, 426.225 477.707, 443 477.636 C 459.775 477.565, 484.108 477.873, 497.072 478.320 C 517.936 479.039, 520.795 478.952, 521.950 477.560 C 523.447 475.756, 524.024 464.870, 524.285 433.500 C 524.437 415.166, 524.143 403.898, 522.442 363 C 521.783 347.133, 521.939 284.600, 522.692 263 C 523.104 251.175, 523.454 228.338, 523.471 212.251 C 523.487 196.164, 523.686 183.002, 523.913 183.001 C 524.140 183.001, 529.540 186.930, 535.913 191.734 C 556.847 207.513, 562.911 211.015, 566.748 209.543 C 567.711 209.173, 568.565 209.012, 568.645 209.185 C 568.725 209.358, 569.737 208.643, 570.895 207.595 C 574.251 204.558, 573.638 200.425, 569.250 196.498 C 562.002 190.011, 559.451 187.963, 554 184.253 C 550.975 182.194, 548.050 179.998, 547.500 179.374 C 546.950 178.749, 541.550 174.896, 535.500 170.810 C 529.450 166.725, 521.001 160.934, 516.724 157.941 C 512.447 154.949, 507.885 151.825, 506.586 151 C 503.193 148.846, 481.575 134.107, 474.500 129.124 C 471.200 126.800, 464.900 122.423, 460.500 119.399 C 456.100 116.374, 446.425 109.675, 439 104.511 C 424.561 94.470, 378.378 63.148, 371.895 59 C 356.926 49.421, 344.475 40.388, 332.113 30.138 C 329.700 28.137, 327 26.079, 326.113 25.565 C 325.226 25.051, 321.800 22.554, 318.500 20.017 C 315.200 17.479, 309.125 13.214, 305 10.538 C 300.875 7.862, 295.901 4.621, 293.946 3.336 C 289.598 0.478, 287.846 0.408, 285.500 3 M 289.459 10.067 C 289.096 10.653, 288.957 11.251, 289.150 11.395 C 289.342 11.539, 294.900 15.164, 301.500 19.451 C 308.100 23.738, 315.525 28.610, 318 30.277 C 326.820 36.221, 319.517 29.809, 309.104 22.466 C 303.272 18.353, 296.843 13.641, 294.817 11.994 C 290.717 8.661, 290.399 8.546, 289.459 10.067 M 275.854 25.825 C 264.511 34.851, 239.397 53.324, 237.688 53.900 C 237.035 54.120, 236.275 54.584, 236 54.931 C 235.438 55.640, 226.177 62.464, 217.586 68.500 C 207.474 75.605, 188.701 89.180, 181 94.957 C 176.875 98.051, 172.375 101.353, 171 102.295 C 169.625 103.236, 166.025 105.818, 163 108.031 C 159.975 110.245, 142.425 122.137, 124 134.458 C 105.575 146.779, 86.532 159.704, 81.682 163.180 L 72.863 169.500 72.878 285 C 72.885 348.525, 73.029 414.946, 73.196 432.602 L 73.500 464.703 91.500 465.426 C 101.400 465.823, 111.075 466.311, 113 466.511 C 117.384 466.966, 231.865 466.936, 253.500 466.474 C 262.300 466.286, 283.900 465.765, 301.500 465.316 C 343.568 464.243, 463.514 464.319, 491.771 465.436 L 514.042 466.317 513.973 433.658 C 513.934 415.696, 513.572 401, 513.168 401 C 512.764 401, 512.560 413.488, 512.716 428.750 C 512.871 444.012, 512.765 457.512, 512.480 458.750 C 512.112 460.349, 511.235 461, 509.450 461 C 508.068 461, 506.758 460.438, 506.540 459.750 C 504.830 454.375, 504.500 429.758, 504.500 307.730 L 504.500 168.960 481 153.228 C 468.075 144.575, 453.225 134.698, 448 131.278 C 423.962 115.545, 403.531 101.289, 391.977 92.185 C 374.603 78.497, 348.054 59.106, 341.752 55.500 C 340.791 54.950, 337.641 52.866, 334.752 50.869 C 331.864 48.871, 322.975 42.956, 315 37.723 C 307.025 32.491, 297.442 25.912, 293.704 23.105 C 289.967 20.297, 286.592 18.034, 286.204 18.075 C 285.817 18.116, 281.159 21.603, 275.854 25.825 M 511 179 C 511 181.933, 511.184 184.146, 511.409 183.917 C 512.171 183.141, 512.424 175.090, 511.709 174.376 C 511.319 173.986, 511 176.067, 511 179 M 57.214 179.563 C 55.225 180.956, 55.146 181.289, 56.491 182.634 C 57.332 183.475, 58 185.909, 58 188.130 C 58 190.577, 58.393 191.875, 59.016 191.490 C 59.575 191.144, 59.863 190.555, 59.655 190.181 C 59.447 189.806, 59.576 186.912, 59.941 183.750 C 60.306 180.588, 60.344 178, 60.025 178 C 59.706 178, 58.441 178.703, 57.214 179.563 M 114.367 239.816 C 112.153 241.275, 111.284 244.328, 112.071 247.884 C 113.026 252.199, 118.515 257.453, 126.355 261.559 L 131.757 264.387 126.519 271.443 C 123.638 275.324, 120.446 279.962, 119.426 281.749 C 117.710 284.753, 117.693 285.122, 119.200 286.629 C 121.729 289.157, 125.117 287.619, 128.780 282.281 C 130.584 279.651, 133.764 275.528, 135.848 273.118 C 139.070 269.391, 139.929 268.892, 141.592 269.781 C 142.667 270.357, 146.461 271.582, 150.023 272.503 C 153.586 273.424, 156.624 274.300, 156.776 274.449 C 156.928 274.598, 154.985 279.292, 152.457 284.881 C 147.713 295.371, 147.356 297.566, 150.114 299.302 C 152.930 301.075, 154.755 299.329, 158.469 291.310 C 164.708 277.838, 165.618 276.493, 168.447 276.563 C 169.851 276.597, 174.311 276.709, 178.357 276.813 L 185.714 277 186.402 286.750 C 187.589 303.593, 187.708 304, 191.437 304 C 195.456 304, 195.927 302.288, 195.025 290.981 C 193.873 276.558, 193.761 277.121, 197.917 276.446 C 199.887 276.126, 204.594 275.201, 208.376 274.391 C 212.158 273.581, 215.369 273.050, 215.511 273.209 C 215.654 273.369, 218.059 278.078, 220.855 283.673 C 223.652 289.268, 226.430 294.147, 227.027 294.517 C 227.625 294.886, 229.213 294.912, 230.557 294.575 C 234.374 293.617, 234.015 291.817, 226.922 276.329 C 225.266 272.714, 224.044 269.698, 224.206 269.628 C 224.367 269.558, 228.869 267.276, 234.208 264.558 C 247.595 257.743, 255.870 249.603, 254.591 244.507 C 253.559 240.395, 248.978 241.160, 240.621 246.841 C 226.531 256.421, 214.643 261.487, 200.452 263.961 C 191.227 265.569, 172.627 265.345, 163 263.510 C 147.951 260.641, 138.467 256.357, 125.768 246.692 C 115.599 238.952, 115.640 238.977, 114.367 239.816 M 455.500 243.585 C 449.882 248.635, 437.793 256.004, 431 258.520 C 428.525 259.436, 425.600 260.592, 424.500 261.087 C 421.178 262.584, 408.872 264.854, 400.439 265.524 C 380.735 267.091, 352.058 258.799, 335.055 246.618 C 328.082 241.622, 324.673 240.875, 323.012 243.977 C 321.564 246.683, 323.791 251.805, 327.929 255.287 C 331.985 258.700, 341.645 264.381, 346.182 266.021 C 353.451 268.650, 353.440 268.556, 347.778 279.766 C 343.475 288.286, 342.869 290.137, 343.955 291.445 C 344.664 292.300, 346.299 293, 347.588 293 C 349.528 293, 350.927 291.199, 355.716 282.534 C 358.897 276.778, 361.950 272.233, 362.500 272.434 C 363.050 272.635, 367.908 273.628, 373.296 274.640 L 383.092 276.480 382.888 289.081 C 382.777 296.011, 383.007 302.203, 383.402 302.841 C 383.796 303.478, 384.936 304, 385.937 304 C 389.508 304, 390.481 301.136, 391 289.102 L 391.500 277.500 401.115 277.215 L 410.730 276.931 413.027 283.215 C 414.290 286.672, 416.181 291.857, 417.229 294.738 C 419.251 300.295, 421.112 302.045, 424.153 301.250 C 427.465 300.384, 427.241 296.788, 423.185 285.754 L 419.260 275.078 428.380 271.956 C 433.396 270.239, 437.950 268.669, 438.500 268.468 C 439.050 268.267, 441.525 270.660, 444 273.786 C 452.566 284.607, 455.985 287.888, 458.240 287.454 C 460.414 287.035, 461.958 285.354, 461.985 283.377 C 461.993 282.759, 458.869 278.208, 455.043 273.264 L 448.085 264.274 453.526 260.527 C 464.364 253.062, 468.064 246.725, 464.965 240.934 C 463.386 237.984, 460.981 238.657, 455.500 243.585 M 512.310 298.500 C 512.315 301.800, 512.502 303.029, 512.725 301.232 C 512.947 299.435, 512.943 296.735, 512.715 295.232 C 512.486 293.729, 512.304 295.200, 512.310 298.500 M 61 381 C 61 394.383, 61.231 405.102, 61.514 404.819 C 62.194 404.139, 62.207 357.873, 61.527 357.193 C 61.237 356.904, 61 367.617, 61 381 M 512.109 396 C 512.154 400.154, 512.234 400.291, 513.150 397.788 C 513.818 395.961, 513.802 394.491, 513.101 393.288 C 512.273 391.865, 512.071 392.418, 512.109 396 M 65.630 455.250 C 64.787 458.396, 64.857 460, 65.838 460 C 66.299 460, 66.735 458.425, 66.808 456.500 C 66.959 452.483, 66.502 451.998, 65.630 455.250 M 65.285 466.291 C 65.258 469.887, 65.496 470.881, 66.053 469.500 C 67.137 466.812, 67.199 462.241, 66.161 461.600 C 65.700 461.315, 65.306 463.426, 65.285 466.291"/></g>
                <mask id="mLW"><image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAj4AAAHgCAAAAACAhTiyAAADsElEQVR4nO3dOW7DQBAAQcrw/78sB5aUGtqeRJ6qmNyoMQTBY68LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlrn1Je6Da/FZvtvp978P4R8r+Whnva/zU9XD6fTRDtdpPuLhuq7Di5d6+HWSj3p4OMhHPTy9n496eAk37iAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E7+dj2yVeTB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh+AgH5uZ8mT6EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDMJiP//7sY/oQyIdAPgSD+dznluJDmD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAi8LkZg+hDIh0A+BPIhkA+BfAjkQyAfAvkQyIfAd14Epg+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh2AyHzsyrWP6EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CCbzuQ2uxUcYzEc9+8zlo56FxvJRz0ZT+ahnpaF81LPTTD7qWWokH/VsNZGPetYayEc9e3loQSAfAvkQyIdAPgQn+bjV4uEHpogPZWD29ooAAAAASUVORK5CYII=" x="0" y="0" width="574" height="480"/></mask>
                <mask id="mBT"><image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAj4AAAHgCAAAAACAhTiyAAABw0lEQVR4nO3aQQ6CMBAFUGq8/5XrRoNEE4U/RIrv7cpiKJ0PaUinCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC1WlGdXlmMUVxryvSaMiyXst1HbXnxOGrm0iuLHd3zh3aE12bPrpTU/ryI4wRrhEBsNXehv14KK24XrfhOwXrMqZ06DwWy9S/onv4MLUrAJb699Iwt6l8cH+kZXdLBND7SM76gh+HeR3rOZW0c8r0Pf0x8CIgPAfEhID4ExIeA+BAQHwLiw2z1T+Si04Y/s/qB55Mc8/DNORi+cgOfYBkhoDOvnQAAAABJRU5ErkJggg==" x="0" y="0" width="574" height="480"/></mask>
                <mask id="mRW"><image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAj4AAAHgCAAAAACAhTiyAAADyElEQVR4nO3dwWrCQBRAUdv//+d0VRWplPEONfSdszIbCXgRk5n4LhcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHibj3efAO9wfL+In798RjruD0ID8hnpeDh+NQP5jPSYz+XFEj7rifBPHD8k9Sv58O2FfuTD1foXkHwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyCfkXY9YCMfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkw83ymC/5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyGekY9P7yIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPlwtj7SQD4V8CORDIB8C+RDIh0A+BPLhav0/x+RDIB8C+RDIh0A+BPIhkA+BfLiy34fAbUP+lHwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkQyCfidaHVzwhHwL5EMiHQD4E8iGQD4F8CORDIB8C+Uy0PnH7CfkQyGcia16cgXwI5EMgHwL5TOTCnTOQD4F8CORDIB8C+XCzvJghHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkM9EHhPkDORDIB8C+RDIh0A+BPLhzuoVvXwI5EMgHwL5EMiHQD4E8iGQD4F8CORDIB8C+RDIh0A+BPIhkA+BfAjkM5GRKJyBfAjkM5Fn3DkD+RDIh0A+BPIhkM9EbhtyBvIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXwI5EMgHwL5EMiHQD4E8hlp13ZD+RDIh0A+BPIhkA+BfAjkQyAfAvkQyIdAPgTyIZAPgXxmerLkvroSLx8C+RDIh0A+Q+3Zbyifqbb0I5+xdvQjHwL5EMiHQD5zbfjxI5/Bej/ymSz3I5/Raj/ymW3bbB0AAADgdL4Aig4UUsQEwfwAAAAASUVORK5CYII=" x="0" y="0" width="574" height="480"/></mask>
                <mask id="mRF"><image href="data:image/png;base64,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" x="0" y="0" width="574" height="480"/></mask>
                <mask id="mEY"><image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAj4AAAHgCAAAAACAhTiyAAAFBUlEQVR4nO3cwXKjMAwAULKz///L7GGbNmkgELAlAe+d2mkntmRhDJgMAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwMdu4S2OSe2e3Xj/ITK10cP4HaQCausnsZGZ/RvX1DA8BTkm1884DGp4r+D8jY+/5I1d00O1woT6lNfAfsRG/BxlVrrb5rrCEZGW1z9hLU0Yx+X/qd7o+Oa3KDmtDkNy+WQE3rnFlAMirxPJ5ROd7v7zXfyMmjf35JdPbPAhjcUOZ8oC4Ft6+UTGH9RS5IimFk+F8olzujpNnnqGGuUTk4TQVMe0NddK3IV78F3nGWP3iKMP0/4RZZ+3hmGoMfsMQ/e5od+nz1ZJ74gqVE+Z8ul6ML1LdcdJoucIlyie3GdeL/p0pnObJwxpvbwNG5Pad6d/gycMabXwZ3xLs27bDoW0Viukc5dPZPhRTS0vRJrFVKp4UnYYBCV7xeKyVfBr1rEt2goMaaWS5TPs7ldEG9HtRRXpJ1L2N3VO9sqL2qahr72Q3trous8PH80a2+PmbOhd73Hc2+6WprNiqtjif12y/cm9tPDr6Y3t9yzL/ars7l6w3M0+g/eRT+8EL3aiQEwF2/yy9b77c5c3fUqvqLd0ZqIvjT4mQOqLTkkPbnrGnPUsKmkcc9+Ty0h254hT6idtFLNfs4zOdkC8CQV01fI5YfUMGQWUNYw1dhsGiUryrcp2nO4utPZJfR+7tysunQNTXPXZXjPXu3CPy+8B7q3vlhJj4l7n81dPqJTlVp2t8ifUbURvVQ6IUs+8ul2x5ETZJ5jb7Gdf6ZHpZPXM/mmn05TPTyA16qdQ+dze/3mXjDBfQrjtDWrxYXF4mFm3DReqZ9d57FbmLbpfbkOrfQZVlNlt+LsjG9M8dwIs8EbJrtl1qv8Fpp8qDy32x13z8JzTYoacOBlGf9txlUXlSz9mp491a8b3x36AVR2YrqDJa6vJ/qfPPymzz57quf+09KZutdXP8rBuGPj0KGvcNjzfLpxVzT3900IOsgtlWonyWT73fF5fxZZCnQLIjrJE+XRxjb0EyfVToXx6TD6vUmf/ft8Dk1s/BconewLuoEmpHiEvBcrnVZuJotGNyBZ6fmVIapXll8+K8I9wHHawMuzM7KSUz23m5y+tVj5lpp/OA7yQzp6yZ5824da8KXLXakhno/zZPXaNZ1735+md722k35TdaX3/r/ae15t4Dz7mL868css+eS3bk/0KI1ehD93UL58r+1V69ebl8uWz7+DNf/ny1JNP/fKZs2V7Q/tezDZ1b+vc1VNmt+Gcvel/uHiJHck2rVW/dqxePrud/PBPdtiTFxUUL5/Lzx3FE1CwfIpnjAcFy+eBSiqegopL59oZi5Z27bhG7dnnQuZLI+1x+goFu7TWwy2Ro0Zx+BAOPPscM+FPXl5+PJqDdvu/cRgOHgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA09g9JyciLWjCHHQAAAABJRU5ErkJggg==" x="0" y="0" width="574" height="480"/></mask>
                <clipPath id="cLW"><rect ref={rLW} x="0" y="175" width="574" height="0"/></clipPath>
                <clipPath id="cBT"><rect ref={rBT} x="0" y="430" width="0" height="55"/></clipPath>
                <clipPath id="cRW"><rect ref={rRW} x="0" y="478" width="574" height="0"/></clipPath>
                <clipPath id="cRF"><rect ref={rRF} x="0" y="0" width="0" height="230"/></clipPath>
              </defs>

              <g clipPath="url(#cLW)"><g mask="url(#mLW)"><use href="#bV"/></g></g>
              <g clipPath="url(#cBT)"><g mask="url(#mBT)"><use href="#bV"/></g></g>
              <g clipPath="url(#cRW)"><g mask="url(#mRW)"><use href="#bV"/></g></g>
              <g clipPath="url(#cRF)"><g mask="url(#mRF)"><use href="#bV"/></g></g>
              <g ref={eyesG} mask="url(#mEY)" style={{ opacity: 0 }}><use href="#bV"/></g>
            </svg>
            <div className="mdc-breath" ref={bwRef} />
          </div>
          <div className="mdc-brand" ref={brandRef}>Maison du Calme</div>
        </div>
        <button className="mdc-skip" id="mdc-skip">skip</button>
      </div>
    </>
  );
}
