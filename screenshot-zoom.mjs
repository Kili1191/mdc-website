import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: "new",
  args: [
    "--no-sandbox",
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
await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 4000));

// Full frame
await page.screenshot({ path: "/tmp/mdc-full.png", fullPage: false });
// House crop (centered)
await page.screenshot({
  path: "/tmp/mdc-house-crop.png",
  clip: { x: 520, y: 250, width: 400, height: 400 },
});

await browser.close();
console.log("done");
