"use client";

import { useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";

// ─────────────────────────────────────────────────────────────────────────
//  TROIS PHRASES MANQUENT, ET UN AGENT NE LES ECRIT PAS.
//
//  Le formulaire sait maintenant envoyer (voir src/app/api/begin/route.ts).
//  Il lui faut ce qu'il dit une fois parti, et ce qu'il dit quand ca echoue.
//  Ces deux textes n'existent nulle part dans le set valide : ni dans
//  COPY_V13.md, ni dans ce que Kilian a donne. La regle absolue du projet
//  interdit de les inventer, donc ils sont poses en PLACEHOLDER, visibles
//  comme tels, et listes dans COPY_OUVERT.md section 1.1.
//
//  A REMPLACER AVANT TOUTE MISE EN LIGNE.
//
//  Le troisieme texte, « ce champ est obligatoire », n'est pas ici : les
//  champs portent `required` et c'est le navigateur qui le dit, dans la
//  langue du visiteur. Une phrase de moins a ecrire.
// ─────────────────────────────────────────────────────────────────────────
const TODO_ENVOYE = "TODO — texte de confirmation, a ecrire par Kilian";
const TODO_ECHEC = "TODO — texte d'echec, a ecrire par Kilian";

// Les libelles des champs etaient ecrits en taupe. Mesure sur le marbre du
// site : 1,77:1, quand un petit texte en demande 4,5. « Your name », « How to
// reach you », « What brings you » etaient donc illisibles en pratique, sur la
// seule page qui transforme un visiteur en client.
//
// C'est la faute exacte que le §11 du skill taste decrit : le taupe est une
// couleur de PAUSE, une regle ou un filet, jamais une couleur de texte. Elle
// avait ete corrigee sur Sessions, ou elle mangeait les durees et les tarifs,
// et personne n'etait revenu ici. Le brou donne 6,93:1.
//
// Le taupe reste juste au-dessous, en bordure de champ : c'est son emploi.
const labelStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.24em",
  textTransform: "uppercase", color: COLORS.brou, opacity: 0.82, margin: 0,
  display: "block", marginBottom: 12,
};
const inputStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 16, color: COLORS.brou,
  background: "transparent",
  border: 0, borderBottom: `1px solid ${COLORS.taupe}`,
  padding: "12px 0", width: "100%", outline: "none",
};
const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 140, resize: "vertical", lineHeight: 1.6,
  paddingTop: 12, paddingBottom: 12,
};
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  cursor: "pointer",
};

type Etat = "attente" | "envoi" | "envoye" | "echec";

export default function BeginForm() {
  const [etat, setEtat] = useState<Etat>("attente");

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (etat === "envoi") return;
    const donnees = Object.fromEntries(new FormData(e.currentTarget));
    setEtat("envoi");
    try {
      const r = await fetch("/api/begin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(donnees),
      });
      setEtat(r.ok ? "envoye" : "echec");
    } catch {
      setEtat("echec");
    }
  }

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: 48, marginTop: 80 }}
      onSubmit={envoyer}
    >
      <div>
        <label style={labelStyle} htmlFor="carry">What do you carry?</label>
        <textarea
          id="carry"
          name="carry"
          placeholder="In your own words. As much or as little as you like."
          style={textareaStyle}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="name">Your name</label>
        <input id="name" name="name" type="text" required style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle} htmlFor="reach">How to reach you</label>
        <input
          id="reach"
          name="reach"
          type="text"
          required
          placeholder="Email or telephone, whichever you prefer"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="source">How this reached you</label>
        <input
          id="source"
          name="source"
          type="text"
          placeholder="Optional. A name, a club, a recommendation."
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="brings">What brings you</label>
        <select id="brings" name="brings" defaultValue="" style={selectStyle}>
          <option value="" disabled></option>
          <option value="session">A session</option>
          <option value="deepest">The deepest room, by application</option>
          <option value="retreat">The retreat</option>
          <option value="unsure">I&apos;m not sure yet</option>
        </select>
      </div>
      <div>
        <button
          type="submit"
          style={{
            fontFamily: FONTS.prata, fontSize: 14, letterSpacing: "0.32em",
            textTransform: "uppercase", color: COLORS.rouille,
            background: "transparent", border: `1px solid ${COLORS.rouille}`,
            padding: "18px 44px", borderRadius: 2, cursor: "pointer",
          }}
          disabled={etat === "envoi" || etat === "envoye"}
          aria-busy={etat === "envoi"}
        >
          Send this
        </button>
        {(etat === "envoye" || etat === "echec") && (
          <p
            role="status"
            aria-live="polite"
            style={{
              ...labelStyle, marginTop: 24, marginBottom: 0,
              letterSpacing: "0.16em", textTransform: "none", opacity: 1,
            }}
          >
            {etat === "envoye" ? TODO_ENVOYE : TODO_ECHEC}
          </p>
        )}
      </div>
    </form>
  );
}
