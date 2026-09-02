"use client";

import { COLORS, FONTS } from "@/styles/tokens";

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

export default function BeginForm() {
  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: 48, marginTop: 80 }}
      onSubmit={(e) => e.preventDefault()}
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
        <input id="name" name="name" type="text" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle} htmlFor="reach">How to reach you</label>
        <input
          id="reach"
          name="reach"
          type="text"
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
        >
          Send this
        </button>
      </div>
    </form>
  );
}
