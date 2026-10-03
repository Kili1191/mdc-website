import puppeteer from "puppeteer";
import { createServer } from "node:http";
const BASE="https://www.maisonducalme.com";
const attends=(ms)=>new Promise(r=>setTimeout(r,ms));
const nav=await puppeteer.launch({executablePath:"/opt/pw-browsers/chromium",args:["--no-sandbox",`--proxy-server=${process.env.HTTPS_PROXY}`]});
const page=await nav.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,hasTouch:true});
await page.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"no-preference"}]);
const d=createServer((_,res)=>{res.writeHead(200,{"content-type":"text/html"});res.end(`<!doctype html><a id="y" href="${BASE}/begin">y</a>`)}).listen(3999);
await page.goto("http://localhost:3999/",{waitUntil:"domcontentloaded"});
const t0=Date.now();
await Promise.all([page.waitForNavigation({waitUntil:"domcontentloaded"}),page.click("#y")]);
await attends(1500);
// un geste de defilement au doigt, au milieu de l'ecran
const tg=Date.now();
await page.touchscreen.touchStart(195,600);
await page.touchscreen.touchMove(195,420);
await page.touchscreen.touchEnd();
let vu=null;
for(let t=100;t<=15000;t+=100){await attends(Math.max(0,t-(Date.now()-tg)));
  const ok=await page.evaluate(()=>{const h=document.querySelector("h1");if(!h)return false;const r=h.getBoundingClientRect();
    const e=document.elementFromPoint(Math.min(innerWidth-2,r.left+r.width/2),Math.min(innerHeight-2,Math.max(2,r.top+r.height/2)));
    return !!e&&(e===h||h.contains(e)||e.contains(h));});
  if(ok){vu=Date.now()-tg;break;}}
console.log(`geste de defilement au doigt a 1500 ms · « Begin. » lisible ${vu} ms apres le geste, soit ${Date.now()-t0} ms au total`);
d.close();await nav.close();
