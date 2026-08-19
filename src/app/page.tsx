"use client";
import dynamic from "next/dynamic";
import FloatingText from "@/components/FloatingText";
import { useIntroReady } from "@/lib/introReady";
const AlbatreHero = dynamic(() => import("@/components/AlbatreHero"), { ssr: false });
export default function Home() {
  const ready = useIntroReady();
  if (!ready) return null;
  return (
    <>
      <AlbatreHero />
      <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}>
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8%" }}>
          <div style={{ pointerEvents: "auto" }}>
            <FloatingText text="You've optimised everything. / Except the part that holds it all." />
          </div>
        </section>
      </div>
    </>
  );
}
