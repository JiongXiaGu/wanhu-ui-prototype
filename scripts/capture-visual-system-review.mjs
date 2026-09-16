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
  await page.waitForTimeout(180);
}

function radiusValue(value) {
  return Number.parseFloat(value || '0');
}

async function expectRounded(locator, label, minRadius = 8) {
  const radius = await locator.evaluate((node) => getComputedStyle(node).borderTopLeftRadius);
  if (radiusValue(radius) < minRadius) throw new Error(`${label} must use the shared slightly-rounded control language. radius=${radius}`);
}

async function expectBlur(locator, label) {
  const filter = await locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return style.backdropFilter || style.webkitBackdropFilter || '';
  });
  if (!filter.includes('blur(')) throw new Error(`${label} must use the shared blur treatment. filter=${filter}`);
}

// Building placement: parameter segmented controls must read as real controls, and the panel must use glass blur.
await open('building-position', '.building-placement-prototype');
const buildingPanel = page.locator('.building-placement-prototype');
await expectBlur(buildingPanel, 'Building Placement panel');
const placementSegment = page.locator('.bp-segment').first();
await expectRounded(placementSegment, 'Building Placement segmented control', 9);
const segmentButtons = placementSegment.getByRole('button');
if ((await segmentButtons.count()) < 3) throw new Error('Building Placement segmented control must expose multiple clickable options.');
await expectRounded(segmentButtons.first(), 'Building Placement segment option', 7);
const activeSegment = placementSegment.locator('button.is-active').first();
const activeBackground = await activeSegment.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!activeBackground || activeBackground === 'none') throw new Error('Active segmented option must have a visible active tone.');
await page.screenshot({ path: `${outDir}/30-visual-system-building-segment.png` });

// Gameplay context surfaces share the same blur contract.
await open('camera', '.gameplay-context-panel--camera');
await expectBlur(page.locator('.gameplay-context-panel--camera'), 'Camera context panel');

// Settings footer: rounded navigation button + blurred footer surface.
await open('settings', '.settings-panel--menu');
const settingsFooter = page.locator('.settings-space__footer');
await expectBlur(settingsFooter, 'Settings footer');
await expectRounded(page.getByRole('button', { name: '返回', exact: true }), 'Settings back button');
await page.screenshot({ path: `${outDir}/31-visual-system-settings-footer.png` });

// New Game: primary / secondary footer actions and segmented controls use the same control family.
await open('new-game', '.new-game-space');
const newGameFooter = page.locator('.new-game-space__footer');
await expectBlur(newGameFooter, 'New Game footer');
await expectRounded(page.getByRole('button', { name: '开始营造', exact: true }), 'New Game primary action');
await expectRounded(page.getByRole('button', { name: '返回', exact: true }), 'New Game back action');
const newGameSegment = page.locator('.new-game-segmented').first();
await expectRounded(newGameSegment, 'New Game segmented control', 9);
await expectRounded(newGameSegment.getByRole('button').first(), 'New Game segment option', 7);
await page.screenshot({ path: `${outDir}/32-visual-system-new-game-footer.png` });

// Load / Save footer actions share the same rounded action grammar.
await open('load', '.archive-space--load');
await expectBlur(page.locator('.archive-space__footer'), 'Load footer');
await expectRounded(page.getByRole('button', { name: '返回', exact: true }), 'Load back button');
await page.screenshot({ path: `${outDir}/33-visual-system-load-footer.png` });

await open('pause-save', '.save-game-space');
await expectBlur(page.locator('.save-game-space__footer'), 'Save footer');
for (const label of ['更改存档组名称', '快速保存', '保存存档', '返回']) {
  await expectRounded(page.getByRole('button', { name: label, exact: true }), `Save action ${label}`, label === '更改存档组名称' ? 7 : 8);
}
await page.screenshot({ path: `${outDir}/34-visual-system-save-footer.png` });

await browser.close();
