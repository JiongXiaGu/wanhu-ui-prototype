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
await page.waitForSelector('.building-placement-prototype .bp-context-panel');
await page.waitForSelector('.building-placement-toolbar-cluster');
await page.waitForTimeout(350);
await page.screenshot({ path: `${outDir}/04-tool-position.png`, fullPage: false });

await page.locator('.building-placement-toolbar-cluster [data-mode="massing"]').click();
await page.waitForFunction(() => document.querySelector('.bp-mode-heading b')?.textContent?.includes('楼身调整'));
await page.waitForTimeout(180);
await page.screenshot({ path: `${outDir}/05-tool-massing.png`, fullPage: false });

await page.locator('.building-placement-toolbar-cluster [data-mode="roof"]').click();
await page.waitForSelector('.bp-segment[data-segment="roof-section"]');
await page.waitForTimeout(180);
await page.screenshot({ path: `${outDir}/06-tool-roof.png`, fullPage: false });

await page.locator('.building-placement-toolbar-cluster [data-mode="manual-elevation"]').click();
await page.waitForFunction(() => document.querySelector('.bp-terrain-summary__top b')?.textContent?.includes('手动标高'));
await page.waitForTimeout(180);
await page.screenshot({ path: `${outDir}/07-tool-manual-elevation.png`, fullPage: false });

await browser.close();
