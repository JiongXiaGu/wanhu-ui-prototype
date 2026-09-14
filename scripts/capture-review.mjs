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
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/01-main-menu.png`, fullPage: false });

await page.getByRole('button', { name: /继续游戏/ }).click();
await page.waitForSelector('.gameplay-screen');
await page.waitForSelector('.command-utility');
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/02-gameplay.png`, fullPage: false });

await page.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace');
await page.waitForFunction(() => {
  const utility = document.querySelector('.command-utility');
  return utility && getComputedStyle(utility).visibility === 'hidden';
});
await page.waitForTimeout(350);
await page.screenshot({ path: `${outDir}/03-workspace.png`, fullPage: false });

await page.getByRole('button', { name: /八角楼阁式木塔/ }).click();
await page.waitForSelector('.building-placement-prototype');
await page.waitForSelector('.building-placement-toolbar-cluster');
await page.waitForTimeout(350);
await page.screenshot({ path: `${outDir}/04-tool-default.png`, fullPage: false });

await page.locator('.building-placement-toolbar-cluster [data-mode="manual-elevation"]').click();
await page.waitForSelector('.building-placement__manual-elevation-container:not(.is-hidden)');
await page.waitForTimeout(200);
await page.screenshot({ path: `${outDir}/05-tool-manual-elevation.png`, fullPage: false });

await page.locator('.building-placement-toolbar-cluster [data-mode="roof"]').click();
await page.waitForSelector('.building-placement__roof-section-toolbar:not(.is-hidden)');
await page.waitForTimeout(200);
await page.screenshot({ path: `${outDir}/06-tool-roof-adjustment.png`, fullPage: false });

await browser.close();
