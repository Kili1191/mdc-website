"use client";

import { useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";

// ─── Ce formulaire n'envoyait RIEN ────────────────────────────────────────
// Il portait `onSubmit={(e) => e.preventDefault()}` et rien d'autre : aucune
// route API, aucun mailto, aucun service. L'utilisateur remplissait cinq
// champs, cliquait « Send this », et il ne se passait strictement rien —
// pas meme un message d'erreur. Chaque bouton du site mene ici. Toutes les
// demandes de rendez-vous, toutes les inscriptions a la retraite, toutes les
// candidatures a TRANSMISSION tombaient dans le vide.
//
// Sans identifiants d'un service tiers, `mailto:` est la seule chose qui
// marche vraiment, et elle a l'avantage d'aller droit dans la boite de
// Kilian sans intermediaire — ce que la page promet deja : « read by Kilian
// alone, held in confidence, never shared ».
//
// L'adresse vient de NEXT_PUBLIC_CONTACT_EMAIL. Si elle n'est pas definie,
// le formulaire le DIT et desactive l'envoi. Un formulaire qui echoue en
// silence est pire qu'un formulaire absent : l'un fait partir un client en
// croyant avoir ecrit, l'autre le fait chercher un autre moyen.
const DESTINATION = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const labelStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 12, letterSpacing: "0.24em",
  // brou et non taupe : #A89A85 donne 1,77:1 sur la pierre, il en faut 4,5.
  // Les intitules d'un formulaire sont la derniere chose qu'on peut deviner.
  textTransform: "uppercase", color: COLORS.brou, margin: 0,
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
const noteStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 13.5, lineHeight: 1.7,
  color: COLORS.brou, margin: 0, maxWidth: "52ch",
};

const CHOIX: Record<string, string> = {
  session: "A session",
  deepest: "The deepest room, by application",
  retreat: "The retreat",
  unsure: "Not sure yet",
};

export default function BeginForm() {
  const [envoye, setEnvoye] = useState(false);

  function composer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!DESTINATION) return;

    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? "").trim();

    // Le corps est ecrit pour etre lu dans une boite mail, pas parse.
    const corps = [
      v("carry") && `What they carry\n${v("carry")}`,
      v("name") && `Name\n${v("name")}`,
      v("reach") && `How to reach them\n${v("reach")}`,
      v("source") && `How this reached them\n${v("source")}`,
      v("brings") && `What brings them\n${CHOIX[v("brings")] ?? v("brings")}`,
    ].filter(Boolean).join("\n\n");

    const sujet = v("name") ? `Maison du Calme — ${v("name")}` : "Maison du Calme";
    window.location.href =
      `mailto:${DESTINATION}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
    setEnvoye(true);
  }

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: 48, marginTop: 80 }}
      onSubmit={composer}
    >
      <div>
        <label style={labelStyle} htmlFor="carry">What do you carry?</label>
        <textarea
          id="carry"
          name="carry"
          required
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
          disabled={!DESTINATION}
          style={{
            fontFamily: FONTS.prata, fontSize: 14, letterSpacing: "0.32em",
            textTransform: "uppercase", color: COLORS.rouille,
            background: "transparent", border: `1px solid ${COLORS.rouille}`,
            padding: "18px 44px", borderRadius: 2,
            cursor: DESTINATION ? "pointer" : "not-allowed",
            opacity: DESTINATION ? 1 : 0.45,
          }}
        >
          Send this
        </button>

        {/* L'adresse en clair sous le bouton : mailto ouvre le logiciel de
            messagerie, et tout le monde n'en a pas un de configure. Sans
            elle, ceux-la n'ont aucun recours. */}
        {DESTINATION && (
          <p style={{ ...noteStyle, marginTop: 22 }}>
            {envoye
              ? "Your message is opening in your mail application. If nothing opened, write to "
              : "This opens in your own mail application, and goes to Kilian. You can also write to "}
            <a href={`mailto:${DESTINATION}`} style={{ color: COLORS.rouille }}>{DESTINATION}</a>.
          </p>
        )}
        {!DESTINATION && (
          <p style={{ ...noteStyle, marginTop: 22, color: COLORS.rouille }}>
            This form is not connected yet. Set NEXT_PUBLIC_CONTACT_EMAIL and it
            will send.
          </p>
        )}
      </div>
    </form>
  );
}
