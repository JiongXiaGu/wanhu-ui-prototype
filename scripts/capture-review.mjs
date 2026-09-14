import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({
  path: `${outDir}/01-main-menu.png`,
  fullPage: false,
});

await page.getByRole('button', { name: /继续游戏/ }).click();
await page.waitForSelector('.gameplay-screen');
await page.waitForTimeout(1200);
await page.screenshot({
  path: `${outDir}/02-gameplay.png`,
  fullPage: false,
});

await browser.close();
