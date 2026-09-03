"use client";

import { useEffect, useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";
import { body, sectionHead, eyebrow, micro } from "@/styles/page";

// Les temoignages video.
//
// Deux regles, et la premiere est la plus importante.
//
// LA SECTION N'EXISTE PAS TANT QUE LES FICHIERS N'EXISTENT PAS. On verifie
// chaque video par une requete HEAD, exactement comme AssetFrame le fait pour
// les images. Un titre « ce qu'ils en disent » suivi d'un cadre vide est pire
// que rien : ca annonce une preuve qu'on ne fournit pas. Si aucune video n'est
// la, le composant ne rend rien du tout.
//
// AUCUNE LECTURE AUTOMATIQUE. Une video qui se lance seule sur un site qui
// vend le silence serait une contradiction ecrite en gros. Elle attend qu'on
// la demande, et elle porte ses controles natifs — pas un lecteur maison qui
// ferait un travail que le navigateur fait mieux, notamment pour quelqu'un qui
// navigue au clavier.
//
// Ces gens ont accepte de parler. C'est un pret, pas un acquis : leur visage
// vaut plus pour eux que pour cette page.
//
// CE SONT DES CLIENTS DU COACHING, ET LA PAGE LE DIT.
//
// C'est plus qu'une precision : c'est ce qui transforme ces temoignages en
// preuve de la discretion au lieu d'une entaille dedans. Un visiteur qui voit
// deux visages sur un site promettant que personne n'est nomme se demande, a
// juste titre, s'il finira lui aussi sur la page. Lui dire que le coaching
// parle et que la maison se tait repond a la question avant qu'il ne la pose —
// et montre que Kilian avait l'occasion de montrer ses clients des seances, et
// ne l'a pas prise.

const SOURCES = ["/testimony/01.mp4", "/testimony/02.mp4"];

export default function Testimonies() {
  const [presentes, setPresentes] = useState<string[] | null>(null);

  useEffect(() => {
    let annule = false;
    Promise.all(
      SOURCES.map((src) =>
        fetch(src, { method: "HEAD" })
          .then((r) => (r.ok ? src : null))
          .catch(() => null),
      ),
    ).then((r) => {
      if (!annule) setPresentes(r.filter(Boolean) as string[]);
    });
    return () => { annule = true; };
  }, []);

  if (!presentes || presentes.length === 0) return null;

  return (
    <section className="mdc-gap">
      <p style={eyebrow}>In their own words</p>
      <h2 style={{ ...sectionHead, marginTop: 26 }}>
        They asked to say this.
      </h2>
      <p style={{ ...body, marginTop: 28 }}>
        Two people who did the coaching, and asked to say so. Nobody who comes to the room is shown here, or anywhere.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
        gap: 48,
        marginTop: 64,
      }}>
        {presentes.map((src) => (
          <figure key={src} style={{ margin: 0 }}>
            <video
              src={src}
              controls
              preload="metadata"
              playsInline
              style={{
                width: "100%",
                display: "block",
                borderRadius: 2,
                background: COLORS.parchemin,
              }}
            />
            <figcaption style={{ ...micro, marginTop: 16, fontFamily: FONTS.prata }}>
              Coaching · In their own words
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
