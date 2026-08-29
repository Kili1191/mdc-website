"use client";
import { useEffect, useRef } from "react";

// Split text char-by-char : chaque caractère (lettre) est révélé avec
// un stagger. Trigger à l'entrée du viewport.
// Word-safe : split par mots d'abord, chars à l'intérieur de spans
// nowrap → le wrap ne peut se faire QU'ENTRE mots, jamais au milieu.
export default function SplitTextChars({
  text, delay = 20, duration = 900,
}: { text: string; delay?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>(".mdc-char").forEach((c) => {
        c.style.opacity = "1"; c.style.transform = "none";
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const chars = Array.from(el.querySelectorAll<HTMLElement>(".mdc-char"));
        chars.forEach((c, i) => {
          c.style.transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
          c.style.transitionDelay = `${i * delay}ms`;
          requestAnimationFrame(() => {
            c.style.opacity = "1";
            c.style.transform = "translateY(0)";
          });
        });
        io.disconnect();
      }),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, delay, duration]);

  const parts = text.split(/(\s+)/);
  return (
    <span ref={ref} style={{ display: "inline", overflow: "visible" }}>
      {parts.map((part, wi) => {
        if (/^\s+$/.test(part)) return <span key={wi}>{part}</span>;
        return (
          <span
            key={wi}
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "visible",
            }}
          >
            {Array.from(part).map((c, i) => (
              <span
                key={i}
                className="mdc-char"
                style={{
                  display: "inline-block",
                  opacity: 0,
                  transform: "translateY(0.6em)",
                  willChange: "opacity, transform",
                  paddingBottom: "0.05em",
                }}
              >
                {c}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
