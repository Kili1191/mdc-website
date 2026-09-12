"use client";

import { useEffect, useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";

// Ce que le formulaire dit une fois parti, et quand ca echoue.
//
// Ecrites par l'agent copywriter, sur mandat de Kilian. Ce sont les DERNIERS
// mots que lit quelqu'un qui vient d'ecrire ce qu'il porte : la page promet
// deja « Read by Kilian alone » et « within two working days » vingt lignes
// plus haut, donc la confirmation accuse reception et transfere la garde, elle
// ne rejoue pas la promesse.
//
// L'echec dit le fait, puis leve la seule peur reelle de quelqu'un qui vient
// d'ecrire une page : que son texte soit perdu. Il ne l'est pas — le formulaire
// n'est pas vide et le bouton est reactive. La phrase est donc exacte, et elle
// ne renvoie vers aucun contact de secours : le site n'en publie aucun.
const ENVOYE = "It has arrived. He has it from here.";
const ECHEC = "That did not send. What you wrote is still here: send it again."

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
  textTransform: "uppercase", color: COLORS.brou, margin: 0,
  display: "block", marginBottom: 12,
};
const inputStyle: React.CSSProperties = {
  fontFamily: FONTS.prata, fontSize: 16, color: COLORS.brou,
  background: "transparent",
  border: 0, borderBottom: `1px solid ${COLORS.taupeTrait}`,
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

type Etat = "attente" | "envoi" | "envoye" | "echec";

// Les valeurs que le menu accepte. Sert aussi de liste blanche pour le
// parametre d'URL : on ne pose jamais dans un champ une valeur venue de la
// barre d'adresse sans l'avoir reconnue.
const MOTIFS = ["session", "deepest", "coaching", "teaching", "retreat", "unsure"];

export default function BeginForm() {
  const [apporte, setApporte] = useState("");

  // Lecture cote client, et pas useSearchParams : ce dernier impose une
  // frontiere <Suspense> a toute la page en App Router, pour lire un
  // parametre facultatif qui n'a aucune raison de retarder le rendu.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("brings");
    if (v && MOTIFS.includes(v)) setApporte(v);
  }, []);

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
        {/* Deux libelles structurels, ajoutes a une liste par ailleurs validee
            en COPY_V13.md:366. Les quatre autres ne bougent pas.

            L'OPTION COACHING existe parce que la page Coaching envoie ici avec
            « Ask for the first call » et que le menu n'avait rien pour ces
            gens-la : une ligne de metier entiere obligeait a mentir sur son
            propre motif, en cochant « A session » ou « I'm not sure yet ». Les
            mots sont ceux de la page d'ou ils viennent — « The first call is
            free », « Ask for the first call ».
            Elle est placee TROISIEME, pas juste apres « A session ». La session
            et la deepest room sont le meme travail silencieux, dans la meme
            piece ; le coaching est l'exception, sur un appel. On ne coupe pas
            le travail silencieux en deux pour glisser son contraire au milieu.

            L'OPTION REIKI, LEVEL ONE arrive pour la meme raison, releve par
            l'agent copywriter avant meme que la page existe : /teaching envoie
            ici avec « Ask about level one », et le menu n'avait rien pour ces
            gens-la. Le meme defaut que le coaching, un metier plus tard. Elle
            suit le coaching parce que les deux sont hors de la piece
            silencieuse, et precede la retraite qui est hors de la maison.

            LE MENU SE PRESELECTIONNE. Chaque page qui envoie ici connait le
            motif de la personne, et la laisser le rechercher dans une liste de
            six est une friction gratuite au pire moment. `?brings=teaching`
            ouvre donc le formulaire deja regle. La valeur est verifiee contre
            la liste : une URL bricolee ne peut pas injecter une option qui
            n'existe pas. Et rien n'est verrouille, le menu reste un menu.

            L'OPTION D'INVITE remplace un <option> sans libelle : le select
            s'affichait vide et rien ne disait qu'il s'ouvrait. « Whichever is
            closest » reprend le « whichever you prefer » du champ juste
            au-dessus. Ce n'est pas « Choose one » : la maison ne donne pas
            d'ordre de formulaire, et quelqu'un qui hesite entre deux portes a
            besoin qu'on lui dise qu'approcher suffit. */}
        <select id="brings" name="brings" value={apporte}
                onChange={(e) => setApporte(e.target.value)} style={selectStyle}>
          <option value="" disabled>Whichever is closest</option>
          <option value="session">A session</option>
          <option value="deepest">The deepest room, by application</option>
          <option value="coaching">Coaching, the first call</option>
          <option value="teaching">Reiki, level one</option>
          <option value="retreat">The retreat</option>
          <option value="unsure">I&apos;m not sure yet</option>
        </select>
      </div>
      <div>
        <button
          type="submit"
          style={{
            fontFamily: FONTS.prata, fontSize: 14, letterSpacing: "0.32em",
            // Le brou et non le rouille : c'est leur correction de contraste,
            // et elle est juste. Le filet reste en rouille.
            textTransform: "uppercase", color: COLORS.brou,
            background: "transparent", border: `1px solid ${COLORS.rouille}`,
            padding: "18px 44px", borderRadius: 2,
            cursor: etat === "envoi" ? "wait" : "pointer",
            opacity: etat === "envoye" ? 0.45 : 1,
          }}
          // Le bouton n'est plus grise selon une adresse connue du navigateur :
          // la destination vit cote SERVEUR (MDC_BEGIN_FORWARD_URL), le client
          // ne la voit pas. Il se desactive pendant l'envoi et une fois parti.
          disabled={etat === "envoi" || etat === "envoye"}
          aria-busy={etat === "envoi"}
        >
          Send this
        </button>
        {(etat === "envoye" || etat === "echec") && (
          <p
            role={etat === "echec" ? "alert" : "status"}
            aria-live={etat === "echec" ? "assertive" : "polite"}
            style={{
              ...labelStyle, marginTop: 24, marginBottom: 0,
              letterSpacing: "0.16em", textTransform: "none", opacity: 1,
            }}
          >
            {etat === "envoye" ? ENVOYE : ECHEC}
          </p>
        )}
      </div>
    </form>
  );
}
