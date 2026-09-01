"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { scrollStore } from "@/lib/scrollStore";
import { INTRO_DONE_EVENT, shouldBypassIntro } from "@/lib/introReady";

// VISION §2 : scroll deux axes.
// - Lenis pour l'inertie verticale (lerp ~0.06)
// - Détection de l'intention horizontale sur wheel : |dx| > |dy| ⇒ mode
//   "horizontal", on accumule x sans consommer le scroll natif.
// - Recentre doucement x → 0 dès qu'on repasse en vertical (VISION : "recentre
//   à la transition de niveau").
const RECENTER_LERP = 0.06;
const H_SENSITIVITY = 1.2;

export default function ScrollProvider() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.06, smoothWheel: true });

    // LENIS DORT TANT QUE L'INTRO COUVRE L'ECRAN.
    //
    // L'intro pose bien un verrou CSS (overflow: hidden sur html et body),
    // mais Lenis ne scrolle pas nativement : il avale la molette et le toucher
    // puis deplace la fenetre EN JAVASCRIPT. Un scroll programmatique traverse
    // overflow: hidden comme si de rien n'etait.
    //
    // Mesure, verrou CSS en place et Lenis actif : une molette de 1500 amenait
    // quand meme le document a 610 px, un vrai swipe tactile a 750. Le
    // visiteur scrollait donc a l'aveugle derriere le voile pendant quinze
    // secondes, et se retrouvait en bas de page quand il se levait.
    //
    // Un verrou qui ne retient pas le seul scroll qui compte n'est pas un
    // verrou. Celui-ci commence donc par arreter Lenis.
    if (!shouldBypassIntro()) lenis.stop();
    const onIntroDone = () => { window.clearTimeout(secours); lenis.start(); };
    window.addEventListener(INTRO_DONE_EVENT, onIntroDone);

    // Filet. L'intro rend la main par un evenement ; si cet evenement ne
    // partait pas — une frame perdue, un onglet passe en arriere-plan pendant
    // la sortie — Lenis resterait arrete et le site serait definitivement
    // impossible a faire defiler. Une page qui ne scrolle plus est pire que
    // tout ce qu'on cherchait a corriger.
    const secours = window.setTimeout(() => lenis.start(), 25000);

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      // recentre horizontal doucement quand on n'est plus en exploration
      const s = scrollStore.get();
      if (s.mode !== "horizontal" && Math.abs(s.x) > 0.5) {
        scrollStore.set({ x: s.x * (1 - RECENTER_LERP) });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onLenisScroll = (e: { scroll: number; limit: number }) => {
      scrollStore.set({
        y: e.scroll,
        progress: e.limit > 0 ? e.scroll / e.limit : 0,
      });
    };
    lenis.on("scroll", onLenisScroll);

    const onWheel = (e: WheelEvent) => {
      const ax = Math.abs(e.deltaX);
      const ay = Math.abs(e.deltaY);
      if (ax > ay && ax > 4) {
        // exploration horizontale : on avale l'événement, on ne scrolle pas
        e.preventDefault();
        const s = scrollStore.get();
        scrollStore.set({ mode: "horizontal", x: s.x + e.deltaX * H_SENSITIVITY });
      } else if (ay > 4) {
        scrollStore.set({ mode: "vertical" });
      }
    };
    // wheel doit être non-passive pour permettre preventDefault
    window.addEventListener("wheel", onWheel, { passive: false });

    // Swipe mobile : même logique via touch deltas.
    let touchStart: { x: number; y: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;
      const t = e.touches[0];
      const dx = touchStart.x - t.clientX;
      const dy = touchStart.y - t.clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        e.preventDefault();
        const s = scrollStore.get();
        scrollStore.set({ mode: "horizontal", x: s.x + dx * H_SENSITIVITY });
        touchStart = { x: t.clientX, y: t.clientY };
      } else if (Math.abs(dy) > 8) {
        scrollStore.set({ mode: "vertical" });
        touchStart = { x: t.clientX, y: t.clientY };
      }
    };
    const onTouchEnd = () => { touchStart = null; };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(secours);
      window.removeEventListener(INTRO_DONE_EVENT, onIntroDone);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}
