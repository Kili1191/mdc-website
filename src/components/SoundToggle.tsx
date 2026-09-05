"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";
import { DURATION, EASE } from "@/lib/motion";

// Bouton discret bas-droite : toggle une nappe audio (binaural pad).
// Off par défaut, préférence persistée en localStorage.
// Le fichier audio est /audio/pad.mp3 — s'il n'existe pas encore, le
// toggle change l'état visuel mais rien ne joue (comportement gracieux).
const AUDIO_SRC = "/audio/pad.mp3";
const STORAGE_KEY = "mdc_sound_on";
const FADE_MS = 900;

export default function SoundToggle() {
  const [on, setOn] = useState(false);
  // Pointeur fin ou non. Faux jusqu'a la mesure : le composant ne rend rien
  // tant qu'on ne sait pas, et une frame de retard sur un bouton d'angle ne
  // se voit pas.
  const [fin, setFin] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);

  useEffect(() => {
    // pointer:fine — on n'affiche pas sur touch pour l'instant (autoplay
    // policies iOS/Android trop capricieuses pour un binaural silencieux).
    //
    // CE COMMENTAIRE DISAIT VRAI ET LE CODE NE LE FAISAIT PAS. Le `return`
    // ci-dessous ne sautait que la lecture de la preference : le bouton, lui,
    // etait rendu quand meme. Sur un iPhone 13 (pointer: coarse) il etait bien
    // la, en bas a droite, pose sur le corps du texte — mesure. Le garde
    // commande maintenant le rendu, ce qu'il a toujours pretendu faire.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setFin(true);
    const stored = localStorage.getItem(STORAGE_KEY) === "1";
    setOn(stored);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const cancelFade = () => {
      if (fadeRafRef.current) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
    };
    const fadeTo = (target: number, done?: () => void) => {
      cancelFade();
      const start = performance.now();
      const from = clamp01(a.volume);
      const to = clamp01(target);
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / FADE_MS);
        a.volume = clamp01(from + (to - from) * p);
        if (p < 1) fadeRafRef.current = requestAnimationFrame(step);
        else { fadeRafRef.current = null; done?.(); }
      };
      fadeRafRef.current = requestAnimationFrame(step);
    };

    if (on) {
      a.volume = clamp01(a.volume);
      a.play().then(() => fadeTo(0.35)).catch(() => { /* audio absent / user-gesture requis */ });
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      fadeTo(0, () => a.pause());
      localStorage.setItem(STORAGE_KEY, "0");
    }
    return cancelFade;
  }, [on]);

  // Rien sur touch : ni le bouton, ni la balise audio. Charger un <audio>
  // qu'aucune commande ne peut declencher ne sert personne.
  if (!fin) return null;

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />
      <button
        type="button"
        aria-label={on ? "Turn sound off" : "Turn sound on"}
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
        className="mdc-sound"
        style={{
          position: "fixed", right: 22, bottom: 22, zIndex: 90,
          width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: 0, cursor: "pointer",
          fontFamily: FONTS.prata, fontSize: 10, letterSpacing: "0.24em",
          textTransform: "lowercase", color: COLORS.brou,
          opacity: 0.55, transition: `opacity ${DURATION.exit}ms ${EASE.exit}`,
          padding: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.55"; }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          {/* trois barres verticales qui pulsent quand actif */}
          <rect x="5"  y={on ? "6" : "10"}  width="1.2" height={on ? "10" : "2"} rx="0.6" fill="currentColor">
            {on && <animate attributeName="height" values="6;10;6" dur="1.8s" repeatCount="indefinite" />}
            {on && <animate attributeName="y"      values="8;6;8"  dur="1.8s" repeatCount="indefinite" />}
          </rect>
          <rect x="10" y={on ? "3" : "10"}  width="1.2" height={on ? "16" : "2"} rx="0.6" fill="currentColor">
            {on && <animate attributeName="height" values="10;16;10" dur="2.3s" repeatCount="indefinite" />}
            {on && <animate attributeName="y"      values="6;3;6"    dur="2.3s" repeatCount="indefinite" />}
          </rect>
          <rect x="15" y={on ? "7" : "10"}  width="1.2" height={on ? "8"  : "2"} rx="0.6" fill="currentColor">
            {on && <animate attributeName="height" values="5;8;5" dur="2.0s" repeatCount="indefinite" />}
            {on && <animate attributeName="y"      values="9;7;9" dur="2.0s" repeatCount="indefinite" />}
          </rect>
        </svg>
      </button>
    </>
  );
}
