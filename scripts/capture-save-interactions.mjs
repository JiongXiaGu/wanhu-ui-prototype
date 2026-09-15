import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function openSave() {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'pause-save');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.save-game-space');
  await page.waitForTimeout(160);
}

await openSave();
if ((await page.locator('.archive-save-type-tabs button').count()) !== 4) throw new Error('Save Space must expose the same four save-type filters as Load Space.');
if ((await page.getByRole('switch', { name: '隐藏过时存档' }).count()) !== 1) throw new Error('Save Space must expose the hide-outdated toggle.');
if (await page.locator('.save-create-zone').count()) throw new Error('Save Space should not keep the old top create-save entry.');
if ((await page.getByRole('button', { name: '快速保存', exact: true }).count()) !== 1) throw new Error('Save footer must expose Quick Save.');
if ((await page.getByRole('button', { name: '保存存档', exact: true }).count()) !== 1) throw new Error('Save footer must expose Save Game.');

await page.locator('.archive-save-type-tabs').getByRole('button', { name: '快速存档', exact: true }).click();
await page.waitForTimeout(140);
const filteredKinds = await page.locator('.archive-save-card').evaluateAll((items) => items.map((item) => item.getAttribute('data-save-kind')));
if (filteredKinds.length < 2 || filteredKinds.some((kind) => kind !== 'quick')) throw new Error('Save quick filter must only show quick saves.');
await page.screenshot({ path: `${outDir}/13b-pause-save-filter-quick.png` });

await openSave();
const cardCountBeforeQuick = await page.locator('.archive-save-card').count();
await page.getByRole('button', { name: '快速保存', exact: true }).click();
await page.waitForSelector('.save-toast');
const firstKind = await page.locator('.archive-save-card').first().getAttribute('data-save-kind');
const firstName = (await page.locator('.archive-save-card__title-row b').first().textContent())?.trim();
if (firstKind !== 'quick' || !firstName?.startsWith('快速存档.')) throw new Error('Quick Save must create a new quick save at the top of the list.');
if ((await page.locator('.archive-save-card').count()) !== cardCountBeforeQuick + 1) throw new Error('Quick Save should add one save while below the quick-save limit.');
await page.screenshot({ path: `${outDir}/13c-pause-quick-save.png` });

await openSave();
await page.getByRole('button', { name: '保存存档', exact: true }).click();
const dialog = page.getByRole('dialog', { name: '保存存档' });
await dialog.waitFor();
const nameInput = dialog.getByRole('textbox', { name: '存档名称' });
if (!(await nameInput.inputValue()).startsWith('手动存档.')) throw new Error('Manual save dialog should start with an automatic manual-save name.');
await nameInput.fill('城西新市落成');
await page.screenshot({ path: `${outDir}/13d-pause-save-dialog.png` });
await dialog.getByRole('button', { name: '保存', exact: true }).click();
await page.waitForSelector('.save-name-layer', { state: 'detached' });
if ((await page.locator('.archive-save-card__title-row b').first().textContent())?.trim() !== '城西新市落成') throw new Error('Confirmed manual save should become the newest save card.');
await page.screenshot({ path: `${outDir}/13e-pause-manual-save-created.png` });

const saveCardStructure = await page.locator('.archive-save-card').first().evaluate((node) => ({
  image: Boolean(node.querySelector('.archive-save-card__image')),
  copy: Boolean(node.querySelector('.archive-save-card__copy')),
  status: Boolean(node.querySelector('.archive-save-card__status')),
  actions: Boolean(node.querySelector('.archive-save-card__actions')),
}));
if (Object.values(saveCardStructure).some((value) => !value)) throw new Error('Save Space must use the shared archive save-card structure.');

const loadUrl = new URL(baseUrl);
loadUrl.searchParams.set('review', 'load');
await page.goto(loadUrl.toString(), { waitUntil: 'networkidle' });
await page.waitForSelector('.archive-space--load .archive-save-card');
const loadCardStructure = await page.locator('.archive-save-card').first().evaluate((node) => ({
  image: Boolean(node.querySelector('.archive-save-card__image')),
  copy: Boolean(node.querySelector('.archive-save-card__copy')),
  status: Boolean(node.querySelector('.archive-save-card__status')),
  actions: Boolean(node.querySelector('.archive-save-card__actions')),
}));
if (JSON.stringify(saveCardStructure) !== JSON.stringify(loadCardStructure)) throw new Error('Save and Load must share the same save-card visual structure.');

await browser.close();
