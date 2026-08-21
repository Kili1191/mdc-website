import potrace from "potrace";
import { writeFileSync } from "node:fs";

const input = "public/mdc-logo.png";
const output = "public/mdc-logo.svg";

// Tuned for a hand-drawn line logo:
//  - threshold 180   → keep medium tones, don't blow out delicate strokes
//  - turdSize 8      → discard noise specks smaller than 8px
//  - alphaMax 1.0    → smooth corners (looks more natural for a sketch)
//  - optCurve true   → fit curves instead of straight segments
//  - turnPolicy minority → handle thin strokes consistently
const options = {
  threshold: 180,
  turdSize: 8,
  alphaMax: 1.0,
  optCurve: true,
  optTolerance: 0.2,
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
  color: "#A55A3E",
  background: "transparent",
};

potrace.trace(input, options, (err, svg) => {
  if (err) {
    console.error("trace failed:", err);
    process.exit(1);
  }
  writeFileSync(output, svg, "utf8");
  console.log(`wrote ${output} (${svg.length} bytes)`);

  // Quick stats: how many <path> elements, total d-attribute length
  const paths = svg.match(/<path\b[^>]*>/g) ?? [];
  console.log(`paths: ${paths.length}`);
  const dAttrs = svg.match(/\sd="[^"]*"/g) ?? [];
  const totalD = dAttrs.reduce((sum, d) => sum + d.length, 0);
  console.log(`total d-attribute length: ${totalD} chars`);
});
