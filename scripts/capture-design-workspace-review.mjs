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
  await page.waitForTimeout(160);
}

const designCategories = [
  ['road', '道路'],
  ['bridge', '桥梁'],
  ['building', '建筑'],
  ['platform', '台基'],
  ['city-wall', '城墙'],
  ['wall', '围墙'],
  ['decoration', '装饰'],
  ['tree', '树木'],
];

await open('gameplay', '.command-bar');
const dock = page.locator('.command-bar');
const categoryRow = dock.locator('.category-row');

for (const [id, label] of designCategories) {
  await categoryRow.getByRole('button', { name: label, exact: true }).click();
  const workspace = page.locator(`.workspace--design[data-design-category="${id}"]`);
  await workspace.waitFor();

  const title = (await workspace.locator('.workspace-title b').textContent())?.trim();
  if (title !== label) throw new Error(`Design Workspace title mismatch for ${label}: ${title}`);
  if ((await categoryRow.getByRole('button', { name: label, exact: true }).getAttribute('aria-pressed')) !== 'true') {
    throw new Error(`Main Dock should show ${label} as the explicit active launcher while its Workspace is open.`);
  }

  const rail = workspace.locator('.workspace-primary-rail');
  const railBox = await rail.boundingBox();
  if (!railBox || railBox.width < 140) throw new Error(`${label} rail must reserve enough width for six Chinese characters.`);

  const railLabels = await workspace.locator('.workspace-primary-rail__page > button span').allTextContents();
  if (!railLabels.length) throw new Error(`${label} Workspace must expose at least one primary rail category.`);
  for (const railLabel of railLabels) {
    if (Array.from(railLabel.trim()).length > 6) throw new Error(`${label} rail label exceeds the six-character contract: ${railLabel}`);
  }

  if ((await workspace.locator('.workspace-primary-rail__page > button[aria-pressed="true"]').count()) !== 1) {
    throw new Error(`${label} Workspace must expose exactly one active primary filter.`);
  }
  if ((await workspace.locator('.workspace-context-filter__scroll > button[aria-pressed="true"]').count()) !== 1) {
    throw new Error(`${label} Workspace must expose exactly one active context filter.`);
  }
  if ((await workspace.locator('.design-item-card').count()) < 1) throw new Error(`${label} Workspace must show content items.`);

  if (id === 'road' || id === 'bridge' || id === 'building' || id === 'city-wall') {
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${outDir}/03-design-${id}.png` });
  }

  await categoryRow.getByRole('button', { name: label, exact: true }).click();
  await workspace.waitFor({ state: 'detached' });
  if ((await categoryRow.locator('button[aria-pressed="true"]').count()) !== 0) {
    throw new Error(`Re-clicking ${label} must close its Workspace and clear Main Dock selection.`);
  }
}

// Switching between design launchers should replace Workspace content in-place instead of forcing an intermediate close.
await categoryRow.getByRole('button', { name: '道路', exact: true }).click();
await page.waitForSelector('.workspace--design[data-design-category="road"]');
await categoryRow.getByRole('button', { name: '桥梁', exact: true }).click();
await page.waitForSelector('.workspace--design[data-design-category="bridge"]');
if ((await page.locator('.workspace--design').count()) !== 1) throw new Error('Switching design categories must keep exactly one shared Design Workspace surface.');
if ((await categoryRow.getByRole('button', { name: '道路', exact: true }).getAttribute('aria-pressed')) !== 'false') throw new Error('Previous design launcher must clear when switching categories.');
if ((await categoryRow.getByRole('button', { name: '桥梁', exact: true }).getAttribute('aria-pressed')) !== 'true') throw new Error('Target design launcher must become active immediately.');

// Building keeps the same shared framework but its content item enters the dedicated placement Tool.
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--design[data-design-category="building"]');
await page.locator('.design-item-card').first().click();
await page.waitForSelector('.building-placement-prototype');
await page.keyboard.press('Escape');
await page.waitForSelector('.workspace--design[data-design-category="building"]');
if ((await categoryRow.getByRole('button', { name: '建筑', exact: true }).getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Exiting Building Placement must return to Design Workspace / Building context.');
}

await browser.close();
