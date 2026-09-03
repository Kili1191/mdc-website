import { body, micro, label, eyebrow } from "@/styles/page";
import { COLORS, FONTS } from "@/styles/tokens";

// Le site n'avait pas de pied de page : il s'arretait sur un bouton et ne se
// signait jamais. Or une maison se signe — c'est meme le seul endroit d'un
// site ou elle se presente comme institution plutot que comme catalogue.
//
// Kilian : « une maison comme les maisons de luxe, mais aussi comme un refuge
// wellness, et plus tard je vais connecter plein de choses a ca — merch,
// clothing brand ».
//
// D'ou la structure, qui porte les deux sens et prepare le troisieme :
//
//   REFUGE    la signature dit ce que la maison fait AVANT de vendre :
//             elle abrite. C'est la moitie emotionnelle que « what it makes
//             is calm » ne portait pas.
//   MAISON    les liens sont ranges par METIER, pas en liste plate. Une
//             maison a des metiers ; un cabinet a des services.
//   L'AVENIR  le vetement et les objets seront une colonne de plus. Rien
//             n'est annonce ici — on n'ecrit jamais ce qu'on n'a pas encore
//             (Kilian sur la liste d'attente : « ca fait tres amateur »).
//             La preparation est la structure, pas une promesse.

const METIERS = [
  { titre: "In the room", liens: [
    { l: "Sessions", h: "/sessions" },
    { l: "The Work", h: "/the-work" },
  ]},
  { titre: "Beyond the room", liens: [
    { l: "Coaching", h: "/coaching" },
    { l: "Retreats", h: "/retreats" },
  ]},
  // « Maison » plutot que « The house », sur proposition de Kilian, verdict de
  // l'agent copywriter. « The house » n'etait pas casse tout seul : lu en serie
  // avec ses deux voisines — In the room / Beyond the room / The house — le set
  // devenait un degrade de LIEUX (dedans, dehors, le batiment), et rendait a la
  // maison la porte que toute la copy lui retire. Un nom ne s'arpente pas.
  // Nom nu, jamais « The Maison » : l'article anglais le rhabille en lieu.
  { titre: "Maison", liens: [
    { l: "Practitioner", h: "/practitioner" },
    { l: "Notes", h: "/notes" },
    { l: "Begin", h: "/begin" },
  ]},
];

export default function Footer() {
  return (
    <footer
      className="mdc-wrap"
      style={{ position: "relative", zIndex: 5, paddingTop: 40, paddingBottom: 72 }}
    >
      <div style={{ borderTop: `1px solid ${COLORS.taupeTrait}`, paddingTop: 56 }}>
        <div className="mdc-foot">
          <div>
            <p style={{
              fontFamily: FONTS.higuen, fontSize: 15, letterSpacing: "0.22em",
              textTransform: "uppercase", color: COLORS.brouFonce, margin: 0,
            }}>
              Maison du Calme
            </p>
            {/* Le refuge, sans le mot « shelter » : Kilian — « shelter makes
                me remember homeless ». En anglais c'est le vocabulaire du
                foyer d'accueil. « Receives » est au contraire le verbe des
                maisons : une maison recoit. */}
            <p style={{ ...body, fontSize: 17, marginTop: 24, maxWidth: "34ch" }}>
              A house receives. This one is for the people who never say
              they need it.
            </p>
            <p style={{ ...micro, marginTop: 28 }}>Battersea, South West London</p>
          </div>

          {METIERS.map((m) => (
            <nav key={m.titre} aria-label={m.titre}>
              <p style={eyebrow}>{m.titre}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0" }}>
                {m.liens.map((x) => (
                  <li key={x.l} style={{ marginTop: 12 }}>
                    <a href={x.h} style={{ ...label, fontSize: 15, textDecoration: "none" }}>
                      {x.l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
