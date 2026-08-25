import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BreathingCursor from "@/components/BreathingCursor";
import IntroOverlay from "@/components/IntroOverlay";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import ScrollProvider from "@/components/ScrollProvider";
import SeoNav from "@/components/SeoNav";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://maisonducalme.com"),
  title: {
    default: "Maison du Calme",
    template: "%s · Maison du Calme",
  },
  description: "For those who carry everything inside.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://maisonducalme.com",
    siteName: "Maison du Calme",
    title: "Maison du Calme",
    description: "For those who carry everything inside.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison du Calme",
    description: "For those who carry everything inside.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${prata.variable} ${higuen.variable} ${greatVibes.variable}`}>
      <body style={{ margin: 0, minHeight: "100vh", background: "#EDE4D0", color: "#4A3B2A" }}>
        <SeoNav />
        <IntroOverlay />
        <ScrollProvider />
        <SiteMarble />
        <Nav />
        <BreathingCursor />
        <SoundToggle />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
