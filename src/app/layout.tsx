import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BreathingCursor from "@/components/BreathingCursor";
import IntroOverlay from "@/components/IntroOverlay";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import ScrollProvider from "@/components/ScrollProvider";
import SeoNav from "@/components/SeoNav";
import Footer from "@/components/Footer";
import BreathButton from "@/components/BreathButton";
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
  maximumScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://maisonducalme.com"),
  title: {
    default: "Maison du Calme",
    template: "%s · Maison du Calme",
  },
  description: "Maison du Calme is a house for the people who hold everything and never say so. Silent one-to-one work in Battersea, South West London, and coaching on a call. From £130.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://maisonducalme.com",
    siteName: "Maison du Calme",
    title: "Maison du Calme",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Maison du Calme" }],
    description: "Maison du Calme is a house for the people who hold everything and never say so. Silent one-to-one work in Battersea, South West London, and coaching on a call. From £130.",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
    title: "Maison du Calme",
    description: "Maison du Calme is a house for the people who hold everything and never say so. Silent one-to-one work in Battersea, South West London, and coaching on a call. From £130.",
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
        <BreathButton />
        <PageTransition>
          {children}
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
