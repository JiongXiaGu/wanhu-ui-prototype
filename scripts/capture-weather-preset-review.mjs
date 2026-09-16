import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

const url = new URL(baseUrl);
url.searchParams.set('review', 'weather');
await page.goto(url.toString(), { waitUntil: 'networkidle' });

const panel = page.locator('.gameplay-context-panel--weather');
await panel.waitFor();
await page.waitForTimeout(160);

if ((await panel.getAttribute('data-weather-preset')) !== 'cloudy') {
  throw new Error('Weather review should start from the cloudy preset.');
}

await page.getByRole('button', { name: '大雨天气预设', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-weather-preset') === 'heavy-rain');

const expected = new Map([
  ['云量', '94'],
  ['降水强度', '78'],
  ['积雪量', '0'],
  ['雾量', '22'],
  ['风向', '165'],
  ['风力', '2'],
  ['阵风', '0.65'],
]);

for (const [name, value] of expected) {
  const actual = await page.getByRole('slider', { name, exact: true }).inputValue();
  if (Number(actual) !== Number(value)) {
    throw new Error(`Preset did not update ${name}. expected=${value} actual=${actual}`);
  }
}

const currentPreset = (await page.locator('.weather-preset-section__heading span').textContent())?.trim() ?? '';
if (!currentPreset.includes('当前：大雨') || currentPreset.includes('已微调')) {
  throw new Error(`Preset status should identify the untouched heavy-rain preset. text=${currentPreset}`);
}

await page.screenshot({ path: `${outDir}/10-weather-preset-heavy-rain.png` });

// Manual weather edits retain the originating preset but mark it as adjusted.
await page.getByRole('slider', { name: '云量', exact: true }).evaluate((node) => {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  descriptor?.set?.call(node, '90');
  node.dispatchEvent(new Event('input', { bubbles: true }));
  node.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-weather-preset-modified') === 'true');

const modifiedPreset = (await page.locator('.weather-preset-section__heading span').textContent())?.trim() ?? '';
if (!modifiedPreset.includes('当前：大雨') || !modifiedPreset.includes('已微调')) {
  throw new Error(`Manual edit should mark the active preset as adjusted. text=${modifiedPreset}`);
}

await browser.close();
