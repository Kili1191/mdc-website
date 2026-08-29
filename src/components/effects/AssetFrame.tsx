"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { COLORS, FONTS } from "@/styles/tokens";
import ImageReveal from "./ImageReveal";
import FluidImage from "./FluidImage";

// Slot placeholder pour un asset qui n'existe pas encore.
// - Si `src` existe (HEAD 200), rend l'asset (video ou image via
//   ImageReveal/FluidImage). Sinon rend un rectangle Aube Encens avec
//   le nom du slot, le prompt en title, prêt à recevoir le fichier.
// - Zéro changement de code quand Kilian dépose le fichier.

type Kind = "image" | "video";

// Une atmosphere Aube Encens existe pour chaque slot image, generee par
// scripts/generate_atmospheres.py. Elle n'est pas un pis-aller visible : c'est
// un champ de lumiere, le registre meme de la reference (Turrell, Sugimoto).
// Elle s'efface d'elle-meme des que la vraie photo est deposee.
function atmosphereFor(src: string): string | null {
  const m = /^\/photos\/([a-z0-9-]+)\.(jpg|jpeg|png|webp)$/i.exec(src);
  return m ? `/photos/atmosphere/${m[1]}.jpg` : null;
}
type Props = {
  slot: string;             // ex "PH-01"
  kind: Kind;
  src: string;              // ex "/photos/ph-01.jpg"
  aspect?: string;          // default 4/5
  prompt?: string;          // pour title/hover — trace du prompt
  effect?: "reveal" | "fluid" | "none"; // effet à appliquer à l'image
  style?: CSSProperties;
};

export default function AssetFrame({
  slot, kind, src, aspect = "4/5", prompt, effect = "reveal", style,
}: Props) {
  const [exists, setExists] = useState<boolean | null>(null);
  const atmosphere = kind === "image" ? atmosphereFor(src) : null;

  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: "HEAD" })
      .then((r) => { if (!cancelled) setExists(r.ok); })
      .catch(() => { if (!cancelled) setExists(false); });
    return () => { cancelled = true; };
  }, [src]);

  // En dev, le slot se voit (hachures + nom) pour reperer ce qui reste a
  // produire. En production, un slot vide n'est PAS un rectangle en
  // pointilles legende "image slot" : c'est une respiration, le marbre
  // qu'on laisse passer. Taste §5 : aucun cadre visible autour d'un media.
  const showSlotAffordance = process.env.NODE_ENV === "development";

  const placeholderStyle: CSSProperties = {
    width: "100%", aspectRatio: aspect,
    ...(showSlotAffordance ? {
      background: "repeating-linear-gradient(45deg, rgba(168,154,133,0.10) 0, rgba(168,154,133,0.10) 12px, rgba(168,154,133,0.04) 12px, rgba(168,154,133,0.04) 24px)",
      border: `1px dashed ${COLORS.taupe}`,
      color: COLORS.taupe,
      fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.24em",
      textTransform: "uppercase" as const,
    } : null),
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    ...style,
  };

  // Vraie photo absente mais atmosphere disponible : on rend l'atmosphere,
  // avec le meme effet, au meme format. Zero difference de code le jour ou la
  // photo arrive.
  if (exists === false && atmosphere) {
    if (effect === "fluid") return <FluidImage src={atmosphere} aspect={aspect} />;
    if (effect === "reveal") return <ImageReveal src={atmosphere} aspect={aspect} />;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={atmosphere} alt="" data-slot={slot} data-atmosphere=""
      style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block", ...style }} />;
  }

  if (exists === false) {
    return (
      <div style={placeholderStyle} title={prompt} data-slot={slot} aria-hidden>
        {showSlotAffordance ? (
          <>
            <span style={{ opacity: 0.8 }}>{slot}</span>
            <span style={{ fontSize: 9, letterSpacing: "0.14em", marginTop: 8, textTransform: "none", opacity: 0.6 }}>
              {kind === "video" ? "video slot" : "image slot"}
            </span>
          </>
        ) : null}
      </div>
    );
  }
  if (exists === null) return <div style={placeholderStyle} data-slot={slot} aria-hidden />;

  if (kind === "video") {
    return (
      <video
        src={src}
        data-slot={slot}
        autoPlay muted loop playsInline
        style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block", ...style }}
      />
    );
  }
  if (effect === "fluid") return <FluidImage src={src} aspect={aspect} />;
  if (effect === "reveal") return <ImageReveal src={src} aspect={aspect} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" data-slot={slot} style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block", ...style }} />;
}
