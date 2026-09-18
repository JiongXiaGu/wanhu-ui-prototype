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

async function expectSharedSlider(root, label) {
  const slider = root.locator('.ui-slider').first();
  if ((await slider.count()) !== 1) throw new Error(`${label} must use the shared UI slider.`);
  const range = slider.locator('input[type="range"]');
  if ((await range.count()) !== 1) throw new Error(`${label} shared slider must expose a real range input.`);
  const trackHeight = await slider.locator('.ui-slider__track').evaluate((node) => Number.parseFloat(getComputedStyle(node).height));
  const thumbSize = await slider.locator('.ui-slider__thumb').evaluate((node) => Number.parseFloat(getComputedStyle(node).width));
  if (trackHeight < 3 || trackHeight > 5) throw new Error(`${label} slider track should stay near the 4px visual baseline. height=${trackHeight}`);
  if (thumbSize < 10 || thumbSize > 13) throw new Error(`${label} slider thumb should stay near the 11px baseline. size=${thumbSize}`);
}

// Building placement: parameter controls share the generic segmented / slider / stepper language.
await open('building-position', '.building-placement-prototype');
const buildingPanel = page.locator('.building-placement-prototype');
await expectBlur(buildingPanel, 'Building Placement panel');
const placementSegment = buildingPanel.locator('.bp-segment-row .ui-segmented').first();
await expectRounded(placementSegment, 'Building Placement segmented control', 9);
const segmentButtons = placementSegment.getByRole('button');
if ((await segmentButtons.count()) < 3) throw new Error('Building Placement segmented control must expose multiple clickable options.');
await expectRounded(segmentButtons.first(), 'Building Placement segment option', 7);
const activeSegment = placementSegment.locator('button.is-active').first();
const activeTone = await activeSegment.evaluate((node) => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, backgroundColor: style.backgroundColor };
});
const hasBackgroundImage = Boolean(activeTone.backgroundImage && activeTone.backgroundImage !== 'none');
const hasBackgroundColor = Boolean(
  activeTone.backgroundColor
  && activeTone.backgroundColor !== 'transparent'
  && activeTone.backgroundColor !== 'rgba(0, 0, 0, 0)'
);
if (!hasBackgroundImage && !hasBackgroundColor) throw new Error('Active segmented option must have a visible active tone.');
await expectSharedSlider(buildingPanel, 'Building Placement');
await expectRounded(buildingPanel.locator('.ui-stepper-button').first(), 'Building Placement stepper button', 7);
await page.screenshot({ path: `${outDir}/30-visual-system-building-segment.png` });

// Road placement now reuses the same numeric field instead of its own +/- only skin.
await open('road-smart', '.road-placement-prototype');
const roadPanel = page.locator('.road-placement-prototype');
await expectSharedSlider(roadPanel, 'Road Placement');
await expectRounded(roadPanel.locator('.ui-stepper-button').first(), 'Road Placement stepper button', 7);
await page.screenshot({ path: `${outDir}/30b-visual-system-road-controls.png` });

// Gameplay context surfaces share the same blur and runtime slider contract.
await open('camera', '.gameplay-context-panel--camera');
const cameraPanel = page.locator('.gameplay-context-panel--camera');
await expectBlur(cameraPanel, 'Camera context panel');
await expectSharedSlider(cameraPanel, 'Camera context panel');

// Settings keeps its richer interaction implementation but its skin is bridged to the shared field tokens.
await open('settings', '.settings-panel--menu');
const settingsSurface = page.locator('.settings-command-surface');
await expectBlur(settingsSurface, 'Settings blocking surface');
await expectRounded(page.getByRole('button', { name: '返回', exact: true }), 'Settings back button');
const settingsNumeric = page.locator('.settings-row .ui-numeric-slider-field').first();
if ((await settingsNumeric.count()) === 1) {
  await expectSharedSlider(settingsNumeric, 'Settings NumericSliderField');
  await expectRounded(settingsNumeric.locator('.ui-stepper-button').first(), 'Settings stepper button', 7);
}
const settingsSelect = page.locator('.settings-row .ui-select__trigger').first();
if ((await settingsSelect.count()) === 1) await expectRounded(settingsSelect, 'Settings select trigger', 8);
const settingsToggleTrack = page.locator('.settings-row .ui-toggle > i').first();
if ((await settingsToggleTrack.count()) === 1) await expectRounded(settingsToggleTrack, 'Settings toggle track', 9);
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

// Load / Save footer actions share the same rounded action grammar; Archive toggle uses the shared switch skin.
await open('load', '.archive-space--load');
await expectBlur(page.locator('.archive-space__footer'), 'Load footer');
await expectRounded(page.getByRole('button', { name: '返回', exact: true }), 'Load back button');
await expectRounded(page.locator('.archive-hide-outdated > i'), 'Archive toggle track', 9);
await page.screenshot({ path: `${outDir}/33-visual-system-load-footer.png` });

await open('pause-save', '.save-game-space');
await expectBlur(page.locator('.save-game-space__footer'), 'Save footer');
for (const label of ['更改存档组名称', '快速保存', '保存存档', '返回']) {
  await expectRounded(page.getByRole('button', { name: label, exact: true }), `Save action ${label}`, label === '更改存档组名称' ? 7 : 8);
}
await page.screenshot({ path: `${outDir}/34-visual-system-save-footer.png` });

await browser.close();
