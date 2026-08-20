import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import IntroOverlay from "@/components/IntroOverlay";
import Nav from "@/components/Nav";
import SiteMarble from "@/components/SiteMarble";

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
  title: "Maison du Calme",
  description: "For those who carry everything inside.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${prata.variable} ${higuen.variable} ${greatVibes.variable}`}>
      <body style={{ margin: 0, minHeight: "100vh", background: "#EDE4D0", color: "#4A3B2A" }}>
        <IntroOverlay />
        <SiteMarble />
        <Nav />
        {children}
      </body>
    </html>
  );
}
