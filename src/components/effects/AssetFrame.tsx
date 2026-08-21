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

  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: "HEAD" })
      .then((r) => { if (!cancelled) setExists(r.ok); })
      .catch(() => { if (!cancelled) setExists(false); });
    return () => { cancelled = true; };
  }, [src]);

  const placeholderStyle: CSSProperties = {
    width: "100%", aspectRatio: aspect,
    background: "repeating-linear-gradient(45deg, rgba(168,154,133,0.10) 0, rgba(168,154,133,0.10) 12px, rgba(168,154,133,0.04) 12px, rgba(168,154,133,0.04) 24px)",
    border: `1px dashed ${COLORS.taupe}`,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: COLORS.taupe,
    fontFamily: FONTS.prata, fontSize: 11, letterSpacing: "0.24em",
    textTransform: "uppercase",
    ...style,
  };

  if (exists === false) {
    return (
      <div style={placeholderStyle} title={prompt} data-slot={slot}>
        <span style={{ opacity: 0.8 }}>{slot}</span>
        <span style={{ fontSize: 9, letterSpacing: "0.14em", marginTop: 8, textTransform: "none", opacity: 0.6 }}>
          {kind === "video" ? "video slot" : "image slot"}
        </span>
      </div>
    );
  }
  if (exists === null) return <div style={placeholderStyle} data-slot={slot} />;

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
