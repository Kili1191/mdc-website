import puppeteer from "puppeteer";

const url = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/mdc-shot.png";
const scrollY = Number(process.argv[4] ?? "0");

const browser = await puppeteer.launch({
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--use-angle=default",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--enable-features=Vulkan",
    "--use-vulkan=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("requestfailed", (r) =>
  errors.push("requestfailed: " + r.url() + " " + r.failure()?.errorText),
);
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    errors.push("console." + msg.type() + ": " + msg.text());
  }
});

await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

if (scrollY > 0) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await new Promise((r) => setTimeout(r, 1500));
}

// Give the canvas a few extra frames to render through the suspense + DOF.
await new Promise((r) => setTimeout(r, 3000));

// Inspect the canvas: does WebGL exist? Is it filled with non-black pixels?
const canvasInfo = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  if (!c) return { found: false };
  const w = c.width, h = c.height;
  const gl = c.getContext("webgl2") ?? c.getContext("webgl");
  return {
    found: true,
    width: w,
    height: h,
    hasContext: !!gl,
    contextType: gl?.constructor?.name ?? null,
  };
});

await page.screenshot({ path: out, fullPage: false });
await browser.close();

console.log("canvas:", JSON.stringify(canvasInfo));
if (errors.length) {
  console.log("\n--- console / page errors ---");
  for (const e of errors) console.log(e);
} else {
  console.log("(no errors)");
}
