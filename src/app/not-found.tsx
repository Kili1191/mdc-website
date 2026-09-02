import Link from "next/link";
import { pageStyle, body, bigHead, eyebrow } from "@/styles/page";
import QuietButton from "@/components/effects/QuietButton";

export const metadata = { title: "Nothing here" };

// La page 404 etait celle de Next : « 404: This page could not be found. »
// en Helvetica sur du blanc. Le seul ecran du site ou la maison disparaissait
// entierement — et celui qu'on voit apres avoir clique sur un vieux lien,
// c'est-a-dire au pire moment.
export default function NotFound() {
  return (
    <main style={pageStyle}>
      <div className="mdc-wrap">
        <p style={eyebrow}>404</p>
        <h1 style={{ ...bigHead, marginTop: 36, maxWidth: "16ch" }}>
          There is no room at this address.
        </h1>
        <div className="mdc-measure" style={{ marginTop: 36 }}>
          <p style={body}>
            The page you were looking for has been moved or never existed. Nothing
            you did caused it.
          </p>
        </div>
        <div style={{ marginTop: 52, display: "flex", gap: 28, flexWrap: "wrap" }}>
          <QuietButton href="/">The house</QuietButton>
          <QuietButton href="/sessions">Sessions</QuietButton>
        </div>
      </div>
    </main>
  );
}
