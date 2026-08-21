"use client";
import { useEffect, useRef, useState } from "react";

// Text scramble : le texte se décode lettre par lettre depuis des
// glyphes aléatoires vers le texte final. Déclenché à l'entrée du
// viewport.
const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export default function TextScramble({ text, duration = 900 }: { text: string; duration?: number }) {
  const [displayed, setDisplayed] = useState("");
  const elRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const start = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      const t0 = performance.now();
      const finalChars = text.split("");
      const scrambleUntil = finalChars.map((_, i) => (i / finalChars.length) * duration * 0.55 + duration * 0.15);
      let raf = 0;
      const step = (now: number) => {
        const t = now - t0;
        let out = "";
        for (let i = 0; i < finalChars.length; i++) {
          if (t >= scrambleUntil[i]) out += finalChars[i];
          else if (finalChars[i] === " ") out += " ";
          else out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setDisplayed(out);
        if (t < duration) raf = requestAnimationFrame(step);
        else setDisplayed(text);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && start());
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, duration]);

  return (
    <span ref={elRef} style={{ fontFeatureSettings: "'tnum'" }}>
      {displayed || text.replace(/./g, " ")}
    </span>
  );
}
