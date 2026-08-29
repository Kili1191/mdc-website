"use client";
import { useEffect, useRef } from "react";
import { DURATION, EASE } from "@/lib/motion";

// Image reveal : rideau qui s'ouvre via clip-path anime a l'entree dans le
// viewport.
//
// Piege corrige ici : la version precedente posait le clip-path sur l'element
// OBSERVE, et se bloquait elle-meme. `clip-path: inset(0 0 100%)` reduit la
// surface visible a zero, Chromium en tient compte dans `intersectionRatio`,
// donc le ratio restait a 0 et le `threshold: 0.25` n'etait jamais atteint.
// L'element restait clipe parce qu'il etait clipe. Toutes les images en
// `effect="reveal"` du site etaient invisibles en permanence, y compris de
// vraies photos.
//
// La structure separe donc les roles : un conteneur exterieur, jamais clipe,
// sert de cible a l'observateur ; le clip vit sur un enfant.

export default function ImageReveal({
  src, alt = "", aspect = "4/5", duration = 1100,
}: { src: string; alt?: string; aspect?: string; duration?: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const clip = clipRef.current;
    const img = imgRef.current;
    if (!outer || !clip || !img) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      clip.style.transition = `clip-path ${duration}ms ${EASE.reveal}`;
      img.style.transition = `transform ${duration + 400}ms ${EASE.reveal}`;
      requestAnimationFrame(() => {
        clip.style.clipPath = "inset(0% 0% 0% 0%)";
        img.style.transform = "scale(1)";
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { reveal(); io.disconnect(); }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(outer);

    // Filet : une image deja dans le viewport au montage doit se reveler meme
    // si aucun evenement de scroll ne suit (arrivee directe, ancre, reload).
    const r = outer.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      window.setTimeout(reveal, 80);
    }

    return () => io.disconnect();
  }, [duration]);

  return (
    <div ref={outerRef} style={{ width: "100%", aspectRatio: aspect }}>
      <div
        ref={clipRef}
        style={{
          width: "100%", height: "100%",
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
    </div>
  );
}
