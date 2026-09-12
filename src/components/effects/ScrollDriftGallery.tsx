"use client";

import { useEffect, useRef, useState } from "react";
import { scrollStore } from "@/lib/scrollStore";
import FluidImage from "./FluidImage";
import { useResolvedAsset } from "@/lib/assetSrc";

// ScrollDriftGallery — rangée d'images qui glisse latéralement au fil
// du scroll vertical de la page. Effet "les visuels dérivent quand tu
// descends" (Studio Freight, Active Theory).
// Option `fluid` : chaque image reçoit une distorsion WebGL ripple
// sous le curseur (pas cumulable avec beaucoup d'images — 3-5 max
// recommandé pour rester à 60fps).
export type DriftItem = { src: string; alt?: string; width?: number };

export default function ScrollDriftGallery({
  items, direction = "left", amplitude = 40, height = 360, gap = 24,
  fluid = false,
}: {
  items: DriftItem[];
  direction?: "left" | "right";
  amplitude?: number;   // vw d'amplitude entre entrée et sortie viewport
  height?: number;
  gap?: number;
  fluid?: boolean;      // WebGL ripple distortion sur chaque image
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    let raf = 0;
    let visible = false;
    const sign = direction === "left" ? -1 : 1;

    // LA BOUCLE NE S'ARRETAIT JAMAIS. `tick` se replanifiait a chaque frame,
    // que le bandeau soit a l'ecran ou a six ecrans plus bas, et chaque frame
    // lit un getBoundingClientRect — une mesure qui force le navigateur a
    // recalculer la mise en page. Sur telephone, ou le marbre WebGL tourne
    // deja en permanence, c'est une boucle de trop pour un element que
    // personne ne regarde.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    }, { rootMargin: "20% 0px" });
    // La derive se mesurait sur la traversee complete du viewport par le
    // bandeau : il fallait que son centre atteigne le haut de l'ecran pour que
    // la course s'acheve. Or ce bandeau est le DERNIER element de la page. La
    // page cesse de defiler avant, et la derive se figeait a mi-course.
    //
    // Mesure avant correction, en bas de page : 29,1vw parcourus sur 60
    // possibles sur Sessions, 27,2 sur 56 sur Retreats. Moitie de la course,
    // puis arret net.
    //
    // On rapporte donc l'avancee au scroll REELLEMENT disponible : la fenetre
    // pendant laquelle l'element est visible, bornee par la fin du document.
    // La course s'acheve toujours, que l'element soit au milieu ou en dernier.
    const tick = () => {
      const rect = outer.getBoundingClientRect();
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docMax = Math.max(0, document.documentElement.scrollHeight - vh);
      const elTop = rect.top + y;
      const start = Math.max(0, elTop - vh);
      const end = Math.min(docMax, elTop + rect.height);
      const p = Math.max(0, Math.min(1, (y - start) / Math.max(1, end - start)));
      inner.style.transform = `translate3d(${sign * (p - 0.5) * amplitude * 2}vw, 0, 0)`;
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const unsubscribe = scrollStore.subscribe(() => {});
    io.observe(outer);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      unsubscribe();
    };
  }, [direction, amplitude]);

  return (
    <div ref={outerRef} style={{ overflow: "hidden", width: "100%", height }}>
      <div
        ref={innerRef}
        style={{
          display: "inline-flex", height: "100%", gap,
          padding: `0 ${gap}px`,
          willChange: "transform",
        }}
      >
        {items.map((it, i) => (
          <DriftCell key={i} item={it} height={height} fluid={fluid} />
        ))}
      </div>
    </div>
  );
}


// Une cellule par image : la resolution vraie-photo / atmosphere passe par un
// hook, donc elle ne peut pas vivre dans le .map du parent.
function DriftCell({
  item, height, fluid,
}: { item: DriftItem; height: number; fluid: boolean }) {
  const w = item.width ?? 260;
  const src = useResolvedAsset(item.src);

  // PAS DE WEBGL SUR UN DOIGT.
  //
  // FluidImage distord l'image sous LE CURSEUR. Sur un ecran tactile il n'y a
  // pas de curseur : l'effet ne se declenche jamais, et on paie quand meme un
  // contexte WebGL par image. Mesure sur iPhone 13 : Sessions ouvrait cinq
  // canvas (quatre images plus le marbre) contre un sur une page sans
  // bandeau, et la meme mesure de frames dans le meme harnais tombait a peu
  // pres de moitie. On payait donc le prix fort pour un effet invisible.
  //
  // La page Practitioner avait deja fait ce choix — « FluidImage ouvre son
  // propre contexte » — mais seulement pour elle. La regle descend ici, ou
  // vivent les bandeaux, donc Sessions et Retreats en heritent.
  //
  // `null` tant qu'on n'a pas mesure : monter le canvas puis le demonter
  // coute plus cher que d'attendre une frame.
  const [fin, setFin] = useState<boolean | null>(null);
  useEffect(() => { setFin(window.matchMedia("(pointer: fine)").matches); }, []);

  return (
    <div style={{ height: "100%", width: w, flex: "none", overflow: "hidden" }}>
      {!src || fin === null ? null : fluid && fin ? (
        <FluidImage src={src} aspect={`${w}/${height}`} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.alt ?? ""}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>
  );
}
