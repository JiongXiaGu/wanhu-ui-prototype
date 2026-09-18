import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

const url = new URL(baseUrl);
url.searchParams.set('review', 'gameplay');
await page.goto(url.toString(), { waitUntil: 'networkidle' });
await page.waitForSelector('.gameplay-top-navigation');

function classTokens(value) {
  return new Set((value ?? '').split(/\s+/).filter(Boolean));
}

function assertCanonicalShell(name, className) {
  const tokens = classTokens(className);
  if (!tokens.has('left-context-panel')) throw new Error(`${name} must use LeftContextPanel.`);
  if (!tokens.has('gameplay-left-context-surface')) throw new Error(`${name} must use gameplay-left-context-surface.`);
  if (tokens.has('gameplay-context-panel')) throw new Error(`${name} must not use the removed legacy gameplay-context-panel shell class.`);
}

async function assertNumericRowsFillContext(panel, label) {
  const rows = panel.locator('.ui-parameter-row');
  const count = await rows.count();
  if (count === 0) throw new Error(`${label} must expose shared RuntimeParameterRow controls.`);

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const directChildren = await row.locator(':scope > *').count();
    if (directChildren !== 2) throw new Error(`${label} parameter row ${index} must be Label + NumericSliderField. children=${directChildren}`);

    const gridColumns = await row.evaluate((node) => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/));
    if (gridColumns.length !== 2) throw new Error(`${label} parameter row ${index} must resolve to two grid columns. columns=${JSON.stringify(gridColumns)}`);

    const field = row.locator(':scope > .ui-numeric-slider-field');
    if ((await field.count()) !== 1) throw new Error(`${label} parameter row ${index} must contain exactly one NumericSliderField.`);

    const slider = field.locator('.ui-slider');
    const value = field.locator('.ui-value-button');
    const [rowBox, fieldBox, sliderBox, valueBox] = await Promise.all([
      row.boundingBox(),
      field.boundingBox(),
      slider.boundingBox(),
      value.boundingBox(),
    ]);
    if (!rowBox || !fieldBox || !sliderBox || !valueBox) throw new Error(`${label} parameter row ${index} geometry unavailable.`);

    const rowRight = rowBox.x + rowBox.width;
    const fieldRight = fieldBox.x + fieldBox.width;
    const valueRight = valueBox.x + valueBox.width;
    if (Math.abs(rowRight - fieldRight) > 1.5) throw new Error(`${label} NumericSliderField must fill the second row column. gap=${rowRight - fieldRight}px`);
    if (Math.abs(rowRight - valueRight) > 1.5) throw new Error(`${label} ValueField must terminate at the row right edge; stale columns are reserving whitespace. gap=${rowRight - valueRight}px`);
    if (sliderBox.width < 96) throw new Error(`${label} Slider is over-compressed. width=${sliderBox.width}px`);
  }
}

async function materialFingerprint(locator) {
  return locator.evaluate((node) => {
    const root = getComputedStyle(node);
    const header = getComputedStyle(node.querySelector(':scope > .left-context-panel__header'));
    const body = getComputedStyle(node.querySelector(':scope > .left-context-panel__body'));
    return {
      backgroundColor: root.backgroundColor,
      backgroundImage: root.backgroundImage,
      borderColor: root.borderTopColor,
      borderRadius: root.borderRadius,
      backdropFilter: root.backdropFilter || root.webkitBackdropFilter || '',
      headerBackground: header.backgroundColor,
      headerRule: header.borderBottomColor,
      bodyBackground: body.backgroundImage || body.backgroundColor,
    };
  });
}

const cameraButton = page.getByRole('button', { name: '相机', exact: true });
const environmentButton = page.getByRole('button', { name: '环境控制', exact: true });

await cameraButton.click();
const camera = page.locator('.gameplay-context-panel--camera');
await camera.waitFor();
assertCanonicalShell('Camera', await camera.getAttribute('class'));
if ((await camera.locator('> footer').count()) !== 1) throw new Error('Camera must use the shared Context footer.');
if ((await camera.locator('.gameplay-context-panel__body .segment').count()) !== 0) throw new Error('Camera mode selector must live in the footer, not the body.');
if ((await camera.locator('> footer .segment').count()) !== 1) throw new Error('Camera footer must contain one mode selector.');
const cameraHeaderHeight = await camera.locator('> header').evaluate((node) => getComputedStyle(node).height);
const canonicalMaterial = await materialFingerprint(camera);
await assertNumericRowsFillContext(camera, 'Camera');
await camera.getByRole('button', { name: '规划', exact: true }).click();
if (Number(await camera.getByRole('slider', { name: '镜头高度', exact: true }).inputValue()) !== 62) throw new Error('Planning camera preset must apply its camera parameters.');
await page.screenshot({ path: `${outDir}/58-left-context-camera.png` });
await cameraButton.click();

await environmentButton.click();
const environment = page.locator('.gameplay-context-panel--weather');
await environment.waitFor();
assertCanonicalShell('Environment', await environment.getAttribute('class'));
if (JSON.stringify(await materialFingerprint(environment)) !== JSON.stringify(canonicalMaterial)) throw new Error('Environment and Camera must resolve to one Left Context material recipe.');
if ((await environment.locator('> footer').count()) !== 1) throw new Error('Environment must use the shared Context footer.');
const environmentHeaderHeight = await environment.locator('> header').evaluate((node) => getComputedStyle(node).height);
if (cameraHeaderHeight !== environmentHeaderHeight) throw new Error('Camera and Environment must share header geometry.');
await assertNumericRowsFillContext(environment, 'Environment');
const environmentWidth = Number.parseFloat(await environment.evaluate((node) => getComputedStyle(node).width));
if (Math.abs(environmentWidth - 400) > .5) throw new Error(`Environment panel width should remain 400px; fix parameter geometry instead of shrinking the panel. width=${environmentWidth}`);
await page.screenshot({ path: `${outDir}/58-left-context-environment.png` });
await environmentButton.click();

const mainDock = page.locator('.command-bar');
await mainDock.locator('.category-row').getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
await page.locator('.building-card').first().click();
const building = page.locator('.building-placement-prototype');
await building.waitFor();
const buildingClassName = await building.getAttribute('class');
assertCanonicalShell('Building Placement', buildingClassName);
if (!buildingClassName?.includes('placement-context-panel')) throw new Error('Building Placement must enter Left Context through PlacementContextPanel.');
if (JSON.stringify(await materialFingerprint(building)) !== JSON.stringify(canonicalMaterial)) throw new Error('Building Placement must resolve to the canonical Left Context material recipe.');
if ((await building.locator('.gameplay-context-panel__heading-icon').count()) !== 1) throw new Error('Building Placement must use the shared icon-led header.');
if ((await building.locator('.ui-parameter-row').count()) < 2) throw new Error('Building Placement parameters must use shared RuntimeParameterRow controls.');
if ((await building.locator('> footer').count()) !== 0) throw new Error('Building Placement must not duplicate the central Action Bar with a Context footer.');
const buildingHeaderHeight = await building.locator('> header').evaluate((node) => getComputedStyle(node).height);
const buildingWidth = await building.evaluate((node) => getComputedStyle(node).width);
await page.screenshot({ path: `${outDir}/58-left-context-building.png` });

await page.keyboard.press('Escape');
await page.waitForSelector('.workspace--building');
await mainDock.locator('.category-row').getByRole('button', { name: '道路', exact: true }).click();
const roadWorkspace = page.locator('.workspace--design[data-design-category="road"]');
await roadWorkspace.waitFor();
await roadWorkspace.locator('.design-item-card').first().click();

const road = page.locator('.road-placement-prototype');
await road.waitFor();
const roadClassName = await road.getAttribute('class');
assertCanonicalShell('Road Placement', roadClassName);
if (!roadClassName?.includes('placement-context-panel')) throw new Error('Road Placement must enter Left Context through PlacementContextPanel.');
if (JSON.stringify(await materialFingerprint(road)) !== JSON.stringify(canonicalMaterial)) throw new Error('Road Placement must resolve to the canonical Left Context material recipe.');
if ((await road.locator('.left-context-panel__section').count()) !== 2) throw new Error('Road Placement must express its content through shared LeftContextSection blocks.');
if ((await road.locator('.ui-parameter-row').count()) !== 3) throw new Error('Smart-curve Road Placement should expose three shared RuntimeParameterRow controls.');
if ((await road.locator('> footer').count()) !== 0) throw new Error('Road Placement modes and commit actions belong to the central Placement Action Bar, not the Context footer.');

const roadHeaderHeight = await road.locator('> header').evaluate((node) => getComputedStyle(node).height);
const roadWidth = await road.evaluate((node) => getComputedStyle(node).width);
if (roadHeaderHeight !== buildingHeaderHeight) throw new Error('Building and Road Placement must share the same Left Context header geometry.');
if (roadWidth !== buildingWidth) throw new Error('Building and Road Placement must share the same Placement Context width.');

const roadActionBar = page.getByLabel('道路铺设操作栏');
await roadActionBar.getByRole('button', { name: '直线', exact: true }).click();
if ((await road.getAttribute('data-road-mode')) !== 'straight') throw new Error('Road draw mode must remain owned by the central Placement Action Bar.');
if ((await road.locator('.ui-parameter-row').count()) !== 2) throw new Error('Straight road mode should hide the curve-smoothing business parameter.');
if (!(await road.locator('.left-context-panel__section-title').first().textContent())?.includes('直线')) throw new Error('Road Context content must react to the shared Road draw-mode state.');
await page.screenshot({ path: `${outDir}/58-left-context-road.png` });

await browser.close();
