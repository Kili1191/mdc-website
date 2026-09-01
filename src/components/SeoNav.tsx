// SSR-only semantic nav for crawlers and assistive tech.
// Visually hidden (sr-only clip pattern) so it never affects layout,
// but every route is discoverable in the raw HTML.
// The visual Nav is a separate client component gated on the intro.

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Sessions", href: "/sessions" },
  { label: "Practitioner", href: "/practitioner" },
  { label: "Retreats", href: "/retreats" },
  { label: "The Work", href: "/the-work" },
  { label: "Notes", href: "/notes" },
  { label: "Begin", href: "/begin" },
];

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1, height: 1,
  padding: 0, margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function SeoNav() {
  return (
    <nav aria-label="Site" style={srOnly}>
      <ul>
        {LINKS.map((l) => (
          <li key={l.href}><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
    </nav>
  );
}
