import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function open(review, waitFor) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(waitFor);
  await page.waitForTimeout(220);
}

async function reportSmallText(rootSelector, label) {
  const rows = await page.locator(rootSelector).evaluate((root) => {
    const selectors = 'button,span,small,b,p,em,strong,label,kbd,output';
    const elements = [...root.querySelectorAll(selectors)];
    const result = [];
    for (const element of elements) {
      const text = (element.textContent || '').trim().replace(/\s+/g, ' ');
      if (!text) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      const fontSize = Number.parseFloat(style.fontSize);
      if (fontSize < 9.5) {
        result.push({
          fontSize,
          text: text.slice(0, 48),
          className: typeof element.className === 'string' ? element.className : '',
        });
      }
    }
    return result;
  });

  console.log(label + ' visible text below 9.5px: ' + rows.length);
  for (const row of rows.slice(0, 30)) {
    console.log('  ' + row.fontSize + 'px ' + row.className + ' :: ' + row.text);
  }
}

await open('load', '.archive-space--load');
await reportSmallText('.archive-space--load', 'Archive / Load');
await page.screenshot({ path: outDir + '/typography-decision-archive.png' });

await open('gameplay', '.gameplay-top-navigation');

await page.getByRole('button', { name: '库存', exact: true }).click();
await page.waitForSelector('.management-space--inventory');
await page.waitForTimeout(180);
await reportSmallText('.management-space--inventory', 'Inventory Management');
await page.screenshot({ path: outDir + '/typography-decision-inventory.png' });

await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });

await page.getByRole('button', { name: '城市', exact: true }).click();
await page.waitForSelector('.management-space--city');
await page.waitForTimeout(180);
await reportSmallText('.management-space--city', 'City Management');
await page.screenshot({ path: outDir + '/typography-decision-management.png' });

await browser.close();
