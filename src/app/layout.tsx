import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BreathingCursor from "@/components/BreathingCursor";
import IntroOverlay from "@/components/IntroOverlay";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import ScrollProvider from "@/components/ScrollProvider";
import SeoNav from "@/components/SeoNav";
import JsonLd from "@/components/JsonLd";
import { graphe, organisation, praticien } from "@/lib/jsonld";
import Footer from "@/components/Footer";
import BreathButton from "@/components/BreathButton";
import Descente from "@/components/Descente";
import SiteMarble from "@/components/SiteMarble";
import SoundToggle from "@/components/SoundToggle";

// WOFF2 et non TTF/OTF : 644 Ko de polices pour 223 Ko une fois converties,
// 65 % de moins. Le TTF est un format de bureau, pas un format de transport.
//
// Great Vibes n'est PAS declaree ici. Elle ne sert qu'a une signature sur
// /practitioner, et le layout la faisait telecharger sur les huit pages —
// 435 Ko bruts pour une phrase qu'on ne voit nulle part ailleurs. Elle est
// desormais declaree dans la page qui l'utilise.
const prata = localFont({
  src: "../../public/fonts/Prata-Regular.woff2",
  variable: "--font-prata",
  display: "swap",
});

const higuen = localFont({
  src: "../../public/fonts/Higuen.woff2",
  variable: "--font-higuen",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Pas de maximumScale : il valait 1 et bloquait le zoom au doigt. C'est un
  // echec d'accessibilite, penalise par Lighthouse, et sur un site dont le
  // corps de texte descend a 11 px en microcopie, c'est aussi une gene reelle.
  viewportFit: "cover" as const,
};

// LA DESCRIPTION DE LA RACINE, ECRITE UNE FOIS.
//
// Elle etait recopiee a l'identique trois fois — description, openGraph,
// twitter. Trois copies d'une meme phrase finissent toujours par diverger :
// on en corrige une, on oublie les deux autres, et Google, WhatsApp et
// LinkedIn se mettent a raconter trois choses differentes du meme site.
//
// AUCUN PRIX. Demande de Kilian : « pas de prix sur la page d'accueil ».
// Elle finissait par « From £130. » — ce n'est pas sur la page, mais c'est ce
// qu'on lit dans Google AVANT de cliquer, donc c'est bien la premiere chose
// que quelqu'un voit de la maison. Les prix vivent sur /sessions et
// /questions, qui les affichent et les balisent.
const DESCRIPTION_RACINE =
  "Silent one-to-one bodywork and breathwork in Battersea, South West London. " +
  "Slow work with the breath and the nervous system, for stress and burnout. " +
  "Reiki, Abhyanga, Marma. Coaching on a call.";

export const metadata: Metadata = {
  metadataBase: new URL("https://maisonducalme.com"),
  title: {
    // LE TITRE PORTE LE METIER ET LE LIEU. Il disait « Maison du Calme »
    // et rien d'autre : c'est l'element le plus lourd en referencement, et
    // il ne nommait ni ce qu'on fait ni ou. Personne ne cherche « maison du
    // calme » — on cherche un metier dans un quartier.
    default: "Maison du Calme: Bodywork & Breathwork in Battersea, London",
    template: "%s · Maison du Calme",
  },
  description: DESCRIPTION_RACINE,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://maisonducalme.com",
    siteName: "Maison du Calme",
    title: "Maison du Calme",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Maison du Calme" }],
    description: DESCRIPTION_RACINE,
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
    title: "Maison du Calme",
    description: DESCRIPTION_RACINE,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${prata.variable} ${higuen.variable}`}>
      <body style={{ margin: 0, minHeight: "100svh", background: "#EDE4D0", color: "#4A3B2A" }}>
        <JsonLd data={graphe(organisation, praticien)} />
        <SeoNav />
        <IntroOverlay />
        <ScrollProvider />
        <SiteMarble />
        <Nav />
        <BreathingCursor />
        <SoundToggle />
        <BreathButton />
        {/* Se retire d'elle-meme sur les pages qui ne declarent pas de
            stations : elle cherche [data-station] et rend null en dessous
            de deux. */}
        <Descente />
        <PageTransition>
          {children}
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
