import puppeteer from "puppeteer";
const BASE="https://www.maisonducalme.com";
const attends=(ms)=>new Promise(r=>setTimeout(r,ms));
const nav=await puppeteer.launch({executablePath:"/opt/pw-browsers/chromium",args:["--no-sandbox",`--proxy-server=${process.env.HTTPS_PROXY}`]});
const page=await nav.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,hasTouch:true});
await page.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"no-preference"}]);
page.on("response",r=>{if(r.url().includes("/api/"))console.log(`  [api] ${r.status()}`)});
// adresse tapee : aucun referrer, l'intro joue. On la saute au bouton.
await page.goto(`${BASE}/begin/before`,{waitUntil:"domcontentloaded"});
await attends(1400);
await page.evaluate(()=>document.getElementById("mdc-skip")?.click());
await attends(2600);
await page.evaluate(()=>[...document.querySelectorAll("button")].find(b=>/^Start$/.test(b.textContent.trim())).click());
for(let t=300;t<=45000;t+=300){await attends(300);
  const q=await page.evaluate(()=>{const e=document.querySelector("#mdc-question");return e?e.textContent.trim():null});
  if(q){console.log("Q01 :",q);break;}}
console.log("\n>>> F5 en plein entretien, URL sans parametre :", page.url());
const t2=Date.now();
await page.reload({waitUntil:"domcontentloaded"});
await attends(1200);
console.log(`a 1,2 s : intro presente ? ${await page.evaluate(()=>!!document.querySelector(".mdc-intro, .mdc-stage"))} · navType ${await page.evaluate(()=>performance.getEntriesByType("navigation")[0].type)}`);
let lis=null;
for(let t=200;t<=40000;t+=200){await attends(Math.max(0,t-(Date.now()-t2)));
  const ok=await page.evaluate(()=>{const h=document.querySelector("h1");if(!h)return false;const r=h.getBoundingClientRect();
    const e=document.elementFromPoint(Math.min(innerWidth-2,r.left+r.width/2),Math.min(innerHeight-2,Math.max(2,r.top+r.height/2)));return !!e&&(e===h||h.contains(e)||e.contains(h))});
  if(ok){lis=Date.now()-t2;break;}}
console.log(`titre relisible ${lis} ms apres F5 · question ${await page.evaluate(()=>{const e=document.querySelector("#mdc-question");return e?e.textContent.trim():"AUCUNE — on est revenu au bouton Start"})}`);
await nav.close();
