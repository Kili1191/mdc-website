"use client";

import { useEffect, useRef } from "react";

const PARCHEMIN = "#EDE4D0";
const BROU = "#4A3B2A";
const BROU_FONCE = "#2F2519";
const OCRE = "#B89968";
const ROUILLE = "#A55A3E";

const NAV = ["Still", "Kilian", "A Session", "Further", "The Interior", "Notes", "Begin"];

export default function Site() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) (e.target as HTMLElement).style.opacity = "1",
          (e.target as HTMLElement).style.transform = "translateY(0)";
      }),
      { threshold: 0.15 }
    );
    revealRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const reveal = (i: number) => ({
    ref: (el: HTMLElement | null) => { revealRefs.current[i] = el; },
    style: { opacity: 0, transform: "translateY(32px)", transition: "opacity 1.2s ease, transform 1.2s ease" } as React.CSSProperties,
  });

  return (
    <div style={{ background: PARCHEMIN, color: BROU, fontFamily: "'Prata', serif" }}>
      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "26px 48px", background: "rgba(237,228,208,0.85)", backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: 15, letterSpacing: "0.2em", color: BROU_FONCE }}>MAISON DU CALME</span>
        <div style={{ display: "flex", gap: 30 }}>
          {NAV.map((n) => (
            <a key={n} href="#" style={{
              fontSize: 12.5, letterSpacing: "0.12em", textDecoration: "none",
              color: n === "Begin" ? ROUILLE : BROU, opacity: 0.85,
            }}>{n}</a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100svh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 8%",
      }}>
        <img src="/logo.png" alt="Maison du Calme" style={{
          width: "clamp(90px, 12vw, 150px)", height: "auto", marginBottom: 48, opacity: 0.95,
        }} />
        <h1 style={{ fontSize: "clamp(48px, 9vw, 120px)", margin: 0, color: BROU_FONCE, fontWeight: 400 }}>Enough.</h1>
        <p style={{ fontSize: "clamp(18px, 2.4vw, 28px)", lineHeight: 1.5, maxWidth: 620, marginTop: 36, color: BROU }}>
          You've optimised everything.<br />Except the part that holds it all.
        </p>
        <span style={{ marginTop: 80, fontSize: 11, letterSpacing: "0.3em", opacity: 0.5 }}>SCROLL</span>
      </section>

      {/* SECTION 1 — texte + image (dense) */}
      <section {...reveal(0)} style={{ ...reveal(0).style, padding: "12vh 8%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, letterSpacing: "0.2em", color: ROUILLE }}>THE WORK</span>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 52px)", color: BROU_FONCE, fontWeight: 400, margin: "20px 0 28px" }}>
            For those who carry everything inside.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: BROU, fontFamily: "Georgia, serif" }}>
            You have built a life that works. The calendar is full, the results are real, the surface is composed.
            And still, somewhere beneath all of it, something keeps holding on. Maison du Calme is a place to set it down —
            not to fix you, but to let what you carry finally move.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: BROU, fontFamily: "Georgia, serif", marginTop: 20 }}>
            This is not wellness as performance. It is depth, privacy, and a single point of presence —
            for those who have everything, and quietly need somewhere to be held.
          </p>
        </div>
        <div style={{ aspectRatio: "4/5", background: `linear-gradient(135deg, ${OCRE}33, ${ROUILLE}22)`, borderRadius: 4, overflow: "hidden" }}>
          <img src="/motif-compo.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </section>

      {/* SECTION 2 — image pleine largeur + légende */}
      <section {...reveal(1)} style={{ ...reveal(1).style, padding: "10vh 0" }}>
        <div style={{ height: "70vh", overflow: "hidden", position: "relative" }}>
          <img src="/motif-bodhi.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: "0 8% 6vh" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", color: PARCHEMIN, fontWeight: 400, maxWidth: 600, textShadow: "0 2px 30px rgba(47,37,25,0.5)" }}>
              A single session can change how you hold your life.
            </h2>
          </div>
        </div>
      </section>

      {/* SECTION 3 — trois colonnes (les offres) */}
      <section {...reveal(2)} style={{ ...reveal(2).style, padding: "12vh 8%" }}>
        <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)", color: BROU_FONCE, fontWeight: 400, marginBottom: 60, textAlign: "center" }}>
          Three ways to begin.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
          {[
            { t: "A Session", d: "Ninety minutes of silent release. Clothed, unhurried, deeply private. From £350.", img: "/motif-compo.jpg" },
            { t: "Further", d: "Private retreats. Bali, September 2026 — six places only. By invitation.", img: "/motif-bodhi.jpg" },
            { t: "The Interior", d: "The method, felt rather than explained. Seven levels of descent, in sensation.", img: "/albatre-lisse.jpg" },
          ].map((c, i) => (
            <div key={i}>
              <div style={{ aspectRatio: "3/4", borderRadius: 4, overflow: "hidden", marginBottom: 24 }}>
                <img src={c.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ fontSize: 24, color: BROU_FONCE, fontWeight: 400, margin: "0 0 12px" }}>{c.t}</h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: BROU, fontFamily: "Georgia, serif" }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — citation pleine page */}
      <section {...reveal(3)} style={{ ...reveal(3).style, padding: "16vh 8%", textAlign: "center" }}>
        <p style={{ fontSize: "clamp(26px, 4vw, 56px)", lineHeight: 1.4, color: BROU_FONCE, maxWidth: 900, margin: "0 auto", fontWeight: 400 }}>
          Something in you already knows.
        </p>
      </section>

      {/* BEGIN */}
      <section style={{ padding: "14vh 8% 18vh", textAlign: "center" }}>
        <a href="#" style={{
          fontSize: 18, letterSpacing: "0.3em", color: ROUILLE, textDecoration: "none",
          border: `1px solid ${ROUILLE}`, padding: "18px 56px", borderRadius: 2, display: "inline-block",
        }}>BEGIN</a>
        <p style={{ marginTop: 40, fontSize: 13, letterSpacing: "0.1em", opacity: 0.6 }}>
          London · Dubai · Lyon — Sessions available by inquiry.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "6vh 8%", borderTop: `1px solid ${OCRE}55`, display: "flex", justifyContent: "space-between", fontSize: 12, letterSpacing: "0.1em", opacity: 0.7 }}>
        <span>MAISON DU CALME</span>
        <span>For those who carry everything inside.</span>
      </footer>
    </div>
  );
}
