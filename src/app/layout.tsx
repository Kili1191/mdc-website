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
import SiteMarble from "@/components/SiteMarble";
import SoundToggle from "@/components/SoundToggle";

const prata = localFont({
  src: "../../public/fonts/Prata-Regular.ttf",
  variable: "--font-prata",
  display: "swap",
});

const higuen = localFont({
  src: "../../public/fonts/Higuen.otf",
  variable: "--font-higuen",
  display: "swap",
});

const greatVibes = localFont({
  src: "../../public/fonts/GreatVibes-Regular.ttf",
  variable: "--font-great-vibes",
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

export const metadata: Metadata = {
  metadataBase: new URL("https://maisonducalme.com"),
  title: {
    default: "Maison du Calme",
    template: "%s · Maison du Calme",
  },
  description: "For those who carry everything inside. One to one work in Battersea, South West London. Coaching on a call. Entry is by conversation, not by calendar.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://maisonducalme.com",
    siteName: "Maison du Calme",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Maison du Calme" }],
    title: "Maison du Calme",
    description: "For those who carry everything inside. One to one work in Battersea, South West London. Coaching on a call. Entry is by conversation, not by calendar.",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
    title: "Maison du Calme",
    description: "For those who carry everything inside. One to one work in Battersea, South West London. Coaching on a call. Entry is by conversation, not by calendar.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${prata.variable} ${higuen.variable} ${greatVibes.variable}`}>
      <body style={{ margin: 0, minHeight: "100svh", background: "#EDE4D0", color: "#4A3B2A" }}>
        <JsonLd data={graphe(organisation, praticien)} />
        <SeoNav />
        <IntroOverlay />
        <ScrollProvider />
        <SiteMarble />
        <Nav />
        <BreathingCursor />
        <SoundToggle />
        <PageTransition>
          {children}
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
