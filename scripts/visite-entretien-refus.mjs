import puppeteer from "puppeteer";
const BASE="https://www.maisonducalme.com";
const attends=(ms)=>new Promise(r=>setTimeout(r,ms));
const nav=await puppeteer.launch({executablePath:"/opt/pw-browsers/chromium",args:["--no-sandbox",`--proxy-server=${process.env.HTTPS_PROXY}`]});
const page=await nav.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,hasTouch:true});
await page.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"no-preference"}]);
page.on("response",r=>{if(r.url().includes("/api/"))console.log(`  [api] ${r.status()} ${r.url().replace(BASE,"")}`)});
await page.goto(`${BASE}/begin/before?from=carry`,{waitUntil:"domcontentloaded"});
await attends(2000);
await page.evaluate(()=>[...document.querySelectorAll("button")].find(b=>/^Start$/.test(b.textContent.trim())).click());
let q=null;const t0=Date.now();
for(let t=300;t<=45000;t+=300){await attends(300);
  q=await page.evaluate(()=>{const e=document.querySelector("#mdc-question");return e?e.textContent.trim():null});
  if(q)break;}
console.log(`Q01 (${Date.now()-t0} ms) : « ${q} »`);
// >>> « I would rather not say »
const t1=Date.now();
await page.evaluate(()=>[...document.querySelectorAll("button")].find(b=>/rather not say/.test(b.textContent)).click());
let q2=null;
for(let t=300;t<=45000;t+=300){await attends(300);
  const s=await page.evaluate(()=>{const e=document.querySelector("#mdc-question");return e?e.textContent.trim():null});
  if(s&&s!==q){q2=s;break;}}
console.log(`apres « I would rather not say » (${Date.now()-t1} ms) : « ${q2} »`);
console.log(`ce qui est inscrit dans « What you have said » : ${await page.evaluate(()=>{const s=document.querySelector('section[aria-label="What you have said"]');return s?s.innerText.replace(/\n+/g," / ").slice(0,200):"absent"})}`);
// >>> RAFRAICHISSEMENT
console.log(`\n>>> on rafraichit la page en plein entretien`);
const t2=Date.now();
await page.reload({waitUntil:"domcontentloaded"});
await attends(1500);
console.log(`a 1,5 s apres F5 : intro ${await page.evaluate(()=>!!document.querySelector(".mdc-intro, .mdc-stage"))} · question ${await page.evaluate(()=>{const e=document.querySelector("#mdc-question");return e?e.textContent.trim():"AUCUNE"})} · transcription ${await page.evaluate(()=>!!document.querySelector('section[aria-label="What you have said"]'))}`);
let lis=null;
for(let t=200;t<=40000;t+=200){await attends(Math.max(0,t-(Date.now()-t2)));
  const ok=await page.evaluate(()=>{const h=document.querySelector("h1");if(!h)return false;const r=h.getBoundingClientRect();
    const e=document.elementFromPoint(Math.min(innerWidth-2,r.left+r.width/2),Math.min(innerHeight-2,Math.max(2,r.top+r.height/2)));return !!e&&(e===h||h.contains(e)||e.contains(h))});
  if(ok){lis=Date.now()-t2;break;}}
console.log(`titre relisible ${lis} ms apres F5 · etat : ${await page.evaluate(()=>document.querySelector("main").innerText.replace(/\n+/g," / ").slice(0,160))}`);
await nav.close();
