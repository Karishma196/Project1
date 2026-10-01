import puppeteer from "puppeteer-core";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });

  const reportPath = path.resolve(__dirname, "../lighthouse-report.report.html");
  await page.goto(`file://${reportPath}`, { waitUntil: "networkidle0" });

  const outputPath = path.resolve(__dirname, "../public/lighthouse-mobile-audit.png");
  await page.screenshot({ path: outputPath, fullPage: false });

  await browser.close();
  console.log(`Lighthouse screenshot saved to: ${outputPath}`);
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
