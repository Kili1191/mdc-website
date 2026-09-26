"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS, FONTS } from "@/styles/tokens";
import { body, sectionHead, eyebrow, micro } from "@/styles/page";
import { labelChamp, champLigne, champTexte } from "@/styles/champs";
import { SECOURS } from "@/lib/secours";

// L'entretien, cote visiteur.
//
// UNE QUESTION A L'ECRAN, et la suivante decidee par ce qui vient d'etre
// repondu. Ce n'est pas un formulaire deguise : personne ne voit treize champs
// vides, personne ne repond a une question qui ne le concerne pas, et quelqu'un
// d'epuise s'arrete plus tot parce que l'assistant le voit.
//
// CE QUI NE PART PAS DANS LE NAVIGATEUR. Les consignes de l'assistant vivent
// dans `src/lib/entretien.ts`, cote serveur, et ce fichier ne les importe pas.
// Un visiteur qui lit les regles de l'entretien est un visiteur qui peut les
// contourner. Seules les ressources de crise sont partagees — elles sont faites
// pour etre lues.
//
// RIEN N'EST STOCKE. La conversation vit ici, dans cet etat React, et dans le
// corps des requetes. Fermer l'onglet l'efface : c'est de la donnee de sante, et
// la maison n'en tient pas de registre. Le prix est qu'un rafraichissement perd
// tout, et la page le dit avant la premiere question plutot que de faire
// semblant du contraire.
//
// L'ENVOI EST UN GESTE. A la fin, la personne relit et clique. Rien ne part
// parce qu'un modele a decide que c'etait fini. La seule exception est l'arret
// de crise, ou l'envoi est automatique et annonce en clair : on ne demande pas
// un dernier clic a quelqu'un qu'on vient d'orienter vers le 999.

type Echange = { question: string; reponse: string };
type Tour = {
  etat: "question" | "assez" | "arret";
  question: string;
  note: string;
  champ: "ligne" | "paragraphe";
  fragilite: number;
};

type Phase = "seuil" | "question" | "revue" | "envoi" | "fini" | "arret" | "panne";

// Le marqueur d'un refus. Il part dans la transcription telle quelle : Kilian
// doit voir qu'une question a ete POSEE et ecartee, ce qui n'est pas du tout la
// meme information qu'une question jamais posee. La chaine est ecrite ici et
// non dans `@/lib/entretien` pour garder ce fichier independant du serveur.
const REFUS = "(declined)";

const ABSENT = "The assistant is not putting questions right now. Write to Kilian instead: it reaches him the same way.";
const MUET = "The next question did not come through. Nothing you have written is lost: try again.";
const NON_ENVOYE = "That did not send. Everything you wrote is still on this page: send it again.";
// L'echec d'envoi APRES un arret de crise ne peut pas dire « send it again » :
// il n'y a pas de bouton d'envoi sur cet ecran, et on parlerait de mise en page
// a quelqu'un qu'on vient d'orienter vers le 999. Il a donc sa propre phrase,
// et elle renvoie aux numeros plutot qu'a la page.
const NON_ENVOYE_CRISE = "That did not reach Kilian. The numbers above matter more than this page. You can write to him later.";
const EN_ROUTE = "Sending what you wrote to Kilian.";

export default function Entretien() {
  const [phase, setPhase] = useState<Phase>("seuil");
  const [tours, setTours] = useState<Echange[]>([]);
  const [courant, setCourant] = useState<Tour | null>(null);
  const [reponse, setReponse] = useState("");
  const [souci, setSouci] = useState("");
  const [attente, setAttente] = useState(false);
  const [parti, setParti] = useState(false);

  const champRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const numero = tours.length + 1;

  // LA PAGE APPREND QUE L'ENTRETIEN A COMMENCE, et elle s'en sert au telephone
  // pour rendre l'ecran a la question.
  //
  // Mesure a 390x844 : le preambule — eyebrow, titre, chapo — occupe 558 a
  // 612px, soit 66 a 73 % du premier ecran. En face, le bloc question plus
  // bouton manque de 145 a 199px. Le chapo seul vaut 224px avec sa marge : le
  // cacher une fois l'entretien ouvert suffit, et le titre reste.
  //
  // Il ne bouge QUE sur un geste — la personne a appuye sur Start. Un preambule
  // qui se replie tout seul serait exactement l'instabilite que ce site a
  // retiree du fond.
  useEffect(() => {
    const racine = document.documentElement;
    if (phase === "seuil") racine.removeAttribute("data-entretien");
    else racine.setAttribute("data-entretien", "ouvert");
    return () => racine.removeAttribute("data-entretien");
  }, [phase]);

  // Le focus suit la question, sans deplacer la page : `preventScroll` parce que
  // Lenis tient le defilement en JavaScript et qu'un navigateur qui recentre
  // seul se bagarre avec lui.
  useEffect(() => {
    if (phase === "question" && champRef.current) {
      champRef.current.focus({ preventScroll: true });
    }
  }, [phase, courant?.question]);

  // LA REPONSE N'EST INSCRITE QU'UNE FOIS LA SUIVANTE OBTENUE, et c'est un
  // defaut corrige, pas une precaution : en l'inscrivant avant l'appel, un
  // echec reseau laissait la question a la fois AFFICHEE et deja rangee dans
  // « what you have said ». Elle apparaissait deux fois, et reappuyer sur Next
  // en ajoutait une troisieme.
  //
  // Ici, un echec ne deplace rien : le texte reste dans le champ, le bouton
  // redevient actif, et reappuyer refait exactement la meme demande.
  async function demande(suite: Echange[]) {
    setAttente(true);
    setSouci("");
    try {
      const r = await fetch("/api/entretien", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tours: suite }),
      });
      if (r.status === 503) { setPhase("panne"); setSouci(ABSENT); return; }
      if (!r.ok) { setSouci(MUET); return; }
      const t = (await r.json()) as Tour;
      setTours(suite);
      setCourant(t);
      setReponse("");
      if (t.etat === "arret") { await envoie(suite, true); return; }
      if (t.etat === "assez") { setPhase("revue"); return; }
      setPhase("question");
    } catch {
      setSouci(MUET);
    } finally {
      setAttente(false);
    }
  }

  async function envoie(suite: Echange[], urgence: boolean) {
    setAttente(true);
    setSouci("");
    setPhase(urgence ? "arret" : "envoi");
    try {
      const r = await fetch("/api/entretien/dossier", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tours: suite, urgence }),
      });
      if (!r.ok) {
        setSouci(NON_ENVOYE);
        if (!urgence) setPhase("revue");
        return;
      }
      setParti(true);
      if (!urgence) setPhase("fini");
    } catch {
      setSouci(NON_ENVOYE);
      if (!urgence) setPhase("revue");
    } finally {
      setAttente(false);
    }
  }

  function repond(texte: string) {
    if (attente || !courant) return;
    void demande([...tours, { question: courant.question, reponse: texte }]);
  }

  const bouton: React.CSSProperties = {
    fontFamily: FONTS.prata, color: COLORS.brou, borderColor: COLORS.rouille,
    // L'interlettre pousse un blanc APRES la derniere lettre, donc un libelle
    // centre part optiquement vers la gauche de la moitie de ce blanc. On le
    // reprend en retrait. Meme correction que le bouton de /begin.
    textIndent: "0.32em",
    background: "transparent", cursor: attente ? "wait" : "pointer",
  };

  // ── Le seuil ─────────────────────────────────────────────────────────
  if (phase === "seuil") {
    return (
      <div>
        <p style={{ ...body, marginTop: 0 }}>
          Nothing is saved here. What you write stays on this page until you
          send it, and it goes to Kilian alone. If you close this tab it is gone,
          and you start again.
        </p>
        <div style={{ marginTop: 44 }}>
          <button className="mdc-button" style={bouton} onClick={() => void demande([])} disabled={attente}>
            {attente ? "One moment" : "Start"}
          </button>
        </div>
        {souci && <Souci texte={souci} />}
      </div>
    );
  }

  // ── L'arret ──────────────────────────────────────────────────────────
  //
  // Le texte est ecrit en dur et relu. Rien ici ne vient du modele : une
  // orientation de crise generee a la volee est une orientation que personne
  // n'a verifiee.
  if (phase === "arret") {
    return (
      <div className="mdc-venir">
        <p style={eyebrow}>Before anything else</p>
        <h2 style={{ ...sectionHead, marginTop: 26, maxWidth: "24ch" }}>
          This needs someone who can answer now.
        </h2>
        <p style={{ ...body, marginTop: 28 }}>
          Kilian is one person and he may not read this tonight. The three below
          will answer tonight.
        </p>
        <div style={{ marginTop: 40, borderTop: `1px solid ${COLORS.taupeTrait}` }}>
          {SECOURS.map((s) => (
            <div key={s.quoi} style={{ padding: "22px 0", borderBottom: `1px solid ${COLORS.taupeTrait}` }}>
              <p style={{ ...body, fontSize: 21, maxWidth: "none", color: COLORS.brouFonce }}>
                {s.quoi}, {s.numero}
              </p>
              <p style={{ ...body, fontSize: 17, maxWidth: "none", opacity: 0.82, marginTop: 6 }}>{s.note}</p>
            </div>
          ))}
        </div>
        {/* CETTE PHRASE EST CONDITIONNELLE, et c'est le seul endroit du site ou
            ca compte a ce point : elle n'est vraie que si l'envoi a reussi.
            L'annoncer quand meme a quelqu'un qu'on vient d'orienter vers le 999
            serait le pire mensonge que cette page puisse dire. */}
        {parti ? (
          <p style={{ ...body, marginTop: 40 }}>
            What you wrote has been sent to Kilian, so you do not have to write
            it again.
          </p>
        ) : (
          <p style={{ ...body, marginTop: 40 }}>
            {attente ? EN_ROUTE : NON_ENVOYE_CRISE}
          </p>
        )}
      </div>
    );
  }

  // ── C'est parti ──────────────────────────────────────────────────────
  if (phase === "fini") {
    return (
      <div className="mdc-venir">
        <p style={eyebrow}>Sent</p>
        <h2 style={{ ...sectionHead, marginTop: 26, maxWidth: "22ch" }}>
          It has arrived. He has it from here.
        </h2>
        <p style={{ ...body, marginTop: 28 }}>
          Kilian reads it himself and answers personally, within two working days.
          Nothing else is needed from you.
        </p>
      </div>
    );
  }

  // ── L'assistant est absent ───────────────────────────────────────────
  if (phase === "panne") {
    return (
      <div>
        <p style={{ ...body, marginTop: 0 }}>{souci || ABSENT}</p>
        <div style={{ marginTop: 40 }}>
          <a className="mdc-button" href="/begin" style={{ ...bouton, cursor: "pointer" }}>
            Write to him instead
          </a>
        </div>
      </div>
    );
  }

  // ── La revue, et l'envoi ─────────────────────────────────────────────
  if (phase === "revue" || phase === "envoi") {
    return (
      <div className="mdc-venir">
        <p style={eyebrow}>{tours.length} answered</p>
        <h2 style={{ ...sectionHead, marginTop: 26, maxWidth: "22ch" }}>
          That is enough to go on.
        </h2>
        <p style={{ ...body, marginTop: 28 }}>
          Read it back if you want to. Nothing has been sent yet.
        </p>
        <div style={{ marginTop: 44 }}>
          <button
            className="mdc-button"
            style={bouton}
            onClick={() => void envoie(tours, false)}
            disabled={attente || phase === "envoi"}
            aria-busy={attente}
          >
            {phase === "envoi" ? "Sending" : "Send this to Kilian"}
          </button>
        </div>
        {souci && <Souci texte={souci} />}
        <Dit tours={tours} titre="What you have said" />
      </div>
    );
  }

  // ── Une question ─────────────────────────────────────────────────────
  const longue = courant?.champ !== "ligne";

  // LA TAILLE DE LA QUESTION SUIT SA LONGUEUR, et ce n'est pas un reglage de
  // gout : mesure a 1440x900, « Is there anything about your body he should
  // know before you arrive? A pregnancy, a recent operation, an injury, pain
  // anywhere. » compose SIX lignes a 40px et pousse le champ de reponse sous la
  // ligne de flottaison. On ne peut pas repondre a une question dont on ne voit
  // pas le champ.
  //
  // Un gros titre du site est une AFFIRMATION, et elles sont courtes par
  // construction. Une question de vingt-cinq mots n'est pas un titre, et la
  // composer comme tel n'est pas de l'ambition, c'est une erreur de nature.
  //
  // Les trois marches sont celles de `ECHELLE` (afficheS 40, titre 24, chapo
  // 21), jamais des nombres choisis ici. Les seuils sont en caracteres parce
  // que c'est ce qui decide du nombre de lignes.
  const MARCHES = [
    "clamp(29px, 3.6vw, 40px)",
    "clamp(24px, 2.6vw, 29px)",
    "clamp(21px, 2.2vw, 24px)",
  ];
  const longueurQ = courant?.question.length ?? 0;
  const rang = longueurQ <= 42 ? 0 : longueurQ <= 90 ? 1 : 2;
  // LA NOTE COMPTE DANS LA MARCHE, et c'est ce que ma premiere mesure avait
  // rate. Le reglage ne regardait que la longueur de la QUESTION ; la note qui
  // la precede (17px plus 24 de marge) ajoute 54px mesures au-dessus d'elle et
  // n'entrait dans aucun seuil. Resultat a 1440x900, question longue precedee
  // d'une note : le champ de reponse passait 20px SOUS la ligne de flottaison.
  // Une note presente descend donc d'une marche.
  const tailleQ = MARCHES[Math.min(MARCHES.length - 1, rang + (courant?.note ? 1 : 0))];

  return (
    <div>
      <div className="mdc-venir" key={courant?.question}>
        <p style={eyebrow}>Question {String(numero).padStart(2, "0")}</p>
        {courant?.note && (
          <p style={{ ...body, fontSize: 17, marginTop: 24, opacity: 0.82 }}>{courant.note}</p>
        )}
        {/* 34ch et non 26 : a 26ch la question plafonnait a 324px dans une
            colonne qui en fait 445. Mesure a 1440, question de 126 caracteres :
            en levant le plafond elle passe de CINQ lignes a QUATRE (28 puis 36
            caracteres par ligne) et le champ de reponse remonte de 29px. Un
            titre a 26ch est juste ; une question de vingt-cinq mots n'est pas un
            titre, et l'etrangler lui coute une ligne pour rien. */}
        <h2 id="mdc-question" style={{ ...sectionHead, fontSize: tailleQ, marginTop: 26, maxWidth: "34ch" }}>
          {courant?.question}
        </h2>
      </div>

      <form
        style={{ marginTop: 44 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!reponse.trim()) return;
          repond(reponse.trim());
        }}
      >
        <label style={labelChamp} htmlFor="mdc-reponse">
          {longue ? "In your own words" : "Your answer"}
        </label>
        {longue ? (
          <textarea
            id="mdc-reponse"
            ref={champRef as React.Ref<HTMLTextAreaElement>}
            aria-labelledby="mdc-question"
            value={reponse}
            maxLength={2400}
            onChange={(e) => setReponse(e.target.value)}
            style={{ ...champTexte, minHeight: 116 }}
            disabled={attente}
          />
        ) : (
          <input
            id="mdc-reponse"
            ref={champRef as React.Ref<HTMLInputElement>}
            aria-labelledby="mdc-question"
            type="text"
            value={reponse}
            maxLength={2400}
            onChange={(e) => setReponse(e.target.value)}
            style={champLigne}
            disabled={attente}
          />
        )}

        <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32 }}>
          <button
            className="mdc-button"
            type="submit"
            style={bouton}
            disabled={attente || !reponse.trim()}
            aria-busy={attente}
          >
            {attente ? "One moment" : "Next"}
          </button>
          {/* Le droit de ne pas repondre, a cote du bouton et pas en note de bas
              de page. Une question sur le corps a laquelle on ne peut pas dire
              non n'est pas une question, c'est un passage oblige. */}
          <button type="button" className="mdc-refus" onClick={() => repond(REFUS)} disabled={attente}>
            I would rather not say
          </button>
        </div>
        {souci && <Souci texte={souci} />}
      </form>

      <Dit tours={tours} titre="What you have said" />
    </div>
  );
}

function Souci({ texte }: { texte: string }) {
  return (
    <p
      role="alert"
      aria-live="assertive"
      style={{ ...labelChamp, marginTop: 28, marginBottom: 0, letterSpacing: "0.16em", textTransform: "none" }}
    >
      {texte}
    </p>
  );
}

// Ce qui a deja ete dit, SOUS la question en cours et en ordre inverse.
//
// Le plus recent d'abord, parce que la question active doit rester a la meme
// hauteur d'ecran d'un tour a l'autre : une transcription qui pousse le champ
// vers le bas oblige a defiler apres chaque reponse, et treize fois de suite
// c'est une raison d'abandonner.
function Dit({ tours, titre }: { tours: Echange[]; titre: string }) {
  if (!tours.length) return null;
  return (
    <section style={{ marginTop: 112 }} aria-label={titre}>
      <p style={eyebrow}>{titre}</p>
      <div style={{ marginTop: 32 }}>
        {[...tours].reverse().map((t, i) => (
          <div className="mdc-dit" key={`${i}-${t.question}`}>
            <span style={{ ...micro, opacity: 0.82 }} aria-hidden="true">
              {String(tours.length - i).padStart(2, "0")}
            </span>
            <span style={{ ...body, fontSize: 15, maxWidth: "none", opacity: 0.82 }}>{t.question}</span>
            <span style={{ ...body, fontSize: 17, maxWidth: "none" }}>
              {t.reponse === REFUS ? "Not answered." : t.reponse}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
