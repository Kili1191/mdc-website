"use client";
import { useEffect, useRef } from "react";

// Image reveal : la div se dévoile via clip-path inset(...) animé
// quand elle entre dans le viewport. Effet "rideau qui s'ouvre",
// classique Awwwards.
export default function ImageReveal({
  src, alt = "", aspect = "4/5", duration = 1100,
}: { src: string; alt?: string; aspect?: string; duration?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const reveal = () => {
      wrap.style.transition = `clip-path ${duration}ms cubic-bezier(0.7, 0, 0.2, 1)`;
      img.style.transition = `transform ${duration + 400}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      requestAnimationFrame(() => {
        wrap.style.clipPath = "inset(0% 0% 0% 0%)";
        img.style.transform = "scale(1)";
      });
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (reveal(), io.disconnect())),
      { threshold: 0.25 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [duration]);

  return (
    <div
      ref={wrapRef}
      style={{
        aspectRatio: aspect, width: "100%",
        overflow: "hidden", position: "relative",
        clipPath: "inset(0% 0% 100% 0%)",
        willChange: "clip-path",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: "scale(1.18)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
