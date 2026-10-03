import puppeteer from "puppeteer";
import { createServer } from "node:http";
const BASE = "https://www.maisonducalme.com";
const attends = (ms) => new Promise(r=>setTimeout(r,ms));
const nav = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium",
  args: ["--no-sandbox", `--proxy-server=${process.env.HTTPS_PROXY}`] });
const page = await nav.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
const dehors = createServer((_,res)=>{res.writeHead(200,{"content-type":"text/html"});res.end(`<!doctype html><a id="y" href="${BASE}/begin">y</a>`);}).listen(3999);
await page.goto("http://localhost:3999/", { waitUntil: "domcontentloaded" });
const t0 = Date.now();
await Promise.all([page.waitForNavigation({waitUntil:"domcontentloaded"}), page.click("#y")]);
let apparu = null;
for (let t=100; t<=6000; t+=100) {
  await attends(Math.max(0, t-(Date.now()-t0)));
  const s = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button,a")].filter(e=>/^skip$/i.test(e.textContent.trim()));
    if (!b.length) return null;
    return b.map(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return {y:Math.round(r.top), x:Math.round(r.left), w:Math.round(r.width), h:Math.round(r.height), op:Math.round(parseFloat(cs.opacity)*100)/100};});
  });
  if (s && s.some(x=>x.op>0.1) && !apparu) { apparu = Date.now()-t0; console.log("SKIP visible a", apparu, "ms :", JSON.stringify(s)); break; }
}
if (!apparu) console.log("aucun SKIP trouve en 6 s");
// on clique le skip
const c = await page.evaluate(() => { const b=[...document.querySelectorAll("button,a")].filter(e=>/^skip$/i.test(e.textContent.trim())).find(e=>parseFloat(getComputedStyle(e).opacity)>0.1);
  const r=b.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2, taille:`${Math.round(r.width)}x${Math.round(r.height)}`}; });
console.log("cible SKIP", JSON.stringify(c));
const tc = Date.now();
await page.mouse.click(c.x, c.y);
let vu = null;
for (let t=100; t<=15000; t+=100) {
  await attends(Math.max(0, t-(Date.now()-tc)));
  const e = await page.evaluate(() => { const h=document.querySelector("h1"); if(!h) return false;
    const r=h.getBoundingClientRect(); const d=document.elementFromPoint(Math.min(innerWidth-2,r.left+r.width/2), Math.min(innerHeight-2,Math.max(2,r.top+r.height/2)));
    return !!d && (d===h||h.contains(d)||d.contains(h)); });
  if (e) { vu = Date.now()-tc; break; }
}
console.log(`apres le clic sur SKIP, « Begin. » lisible en ${vu} ms — soit ${Math.round((Date.now()-t0))} ms au total depuis le clic d'arrivee`);
dehors.close(); await nav.close();
