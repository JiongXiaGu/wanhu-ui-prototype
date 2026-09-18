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

function channels(value) {
  return (value.match(/[\d.]+/g) ?? []).map(Number);
}

async function material(locator, name) {
  const value = await locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderRadius: style.borderRadius,
      borderColor: style.borderTopColor,
    };
  });
  const rgba = channels(value.backgroundColor);
  if (rgba.length < 3) throw new Error(`${name} must expose a stable surface background. value=${value.backgroundColor}`);
  const rgb = rgba.slice(0, 3);
  if (Math.max(...rgb) - Math.min(...rgb) > 5) {
    throw new Error(`${name} must remain neutral Smoked Graphite. background=${value.backgroundColor}`);
  }
  if (value.borderRadius !== '14px') throw new Error(`${name} must use the shared 14px command radius. radius=${value.borderRadius}`);
  if (!value.backgroundImage.includes('glass-noise-soft.png')) {
    throw new Error(`${name} must use the shared soft material texture. image=${value.backgroundImage}`);
  }
  return { ...value, alpha: rgba[3] ?? 1 };
}

function assertActiveLine(button, name) {
  return button.evaluate((node, label) => {
    const before = getComputedStyle(node, '::before');
    if (before.content === 'none' || before.height !== '2px') {
      throw new Error(`${label} must expose the shared 2px active line.`);
    }
  }, name);
}

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

// Normal Gameplay: L + S must already read as one family.
await open('gameplay', '.command-bar');
const dock = page.locator('.command-bar');
const utility = page.locator('.world-utility-toolbar');
const dockMaterial = await material(dock, 'Main Dock L');
const utilityMaterial = await material(utility, 'World Utility S');
if (!(dockMaterial.alpha > utilityMaterial.alpha)) throw new Error('Main Dock must be denser than World Utility.');
const utilityGroups = utility.locator('.world-utility-toolbar__group');
if ((await utilityGroups.count()) !== 4) throw new Error('World Utility must expose four semantic groups.');
const utilityGroupLabels = await utilityGroups.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')));
if (JSON.stringify(utilityGroupLabels) !== JSON.stringify(['世界编辑','精确辅助','范围操作','历史'])) {
  throw new Error(`World Utility group order must match player mental model. groups=${JSON.stringify(utilityGroupLabels)}`);
}
if ((await utility.locator('.world-utility-toolbar__separator').count()) !== 3) throw new Error('World Utility must separate four groups with three dividers.');
if ((await utility.locator('.world-utility-toolbar__button').count()) !== 10) throw new Error('World Utility must retain all ten existing functions.');
const utilityIcon = await utility.locator('.world-utility-toolbar__button svg').first().evaluate((node) => {
  const style = getComputedStyle(node);
  return { width: style.width, height: style.height, strokeWidth: style.strokeWidth };
});
if (parseFloat(utilityIcon.width) < 22 || parseFloat(utilityIcon.height) < 22 || parseFloat(utilityIcon.strokeWidth) < 1.65) {
  throw new Error(`World Utility icons must be optically readable. visual=${JSON.stringify(utilityIcon)}`);
}
await dock.locator('.mode-rail button.is-active').first().waitFor();
await page.screenshot({ path: `${outDir}/63-bottom-command-family-gameplay-day.png` });

// Building Tool: M + S + Left Context must form one complete tool composition.
await open('building-position', '.building-placement-prototype');
const buildingBar = page.getByLabel('建筑放置操作栏');
const buildingUtility = page.locator('.world-utility-toolbar');
const buildingMaterial = await material(buildingBar, 'Building Placement M');
const buildingUtilityMaterial = await material(buildingUtility, 'Building World Utility S');
if (!(buildingMaterial.alpha > dockMaterial.alpha && dockMaterial.alpha > buildingUtilityMaterial.alpha)) throw new Error('Day density hierarchy must remain M > L > S.');
if ((await buildingBar.locator('.placement-action-bar__button--mode.is-active').count()) !== 2) {
  throw new Error('Building Placement must expose one active mode in each mode group.');
}
if ((await buildingBar.locator('.placement-action-bar__button--quick.is-active').count()) !== 0) {
  throw new Error('Building quick actions must remain one-shot and never selected.');
}
await assertActiveLine(buildingBar.locator('.placement-action-bar__button--mode.is-active').first(), 'Building active mode');
await assertActiveLine(buildingBar.locator('.placement-action-bar__button--confirm'), 'Building confirm');
if ((await page.locator('.gameplay-operation-hints .operation-hints__row.is-secondary').count()) < 3) {
  throw new Error('Building hints must demote generic camera controls beneath tool-specific actions.');
}
await page.screenshot({ path: `${outDir}/64-bottom-command-building-day.png` });

// Road Tool: same M material, different business groups.
await open('road-smart', '.road-placement-prototype');
const roadBar = page.getByLabel('道路铺设操作栏');
const roadMaterial = await material(roadBar, 'Road Placement M');
if (roadMaterial.backgroundColor !== buildingMaterial.backgroundColor || roadMaterial.backgroundImage !== buildingMaterial.backgroundImage) {
  throw new Error('Road and Building Placement must resolve to the same M material recipe.');
}
if ((await roadBar.locator('.placement-action-bar__button--mode.is-active').count()) !== 1) {
  throw new Error('Road Placement must expose exactly one active draw mode.');
}
if ((await roadBar.locator('.placement-action-bar__button--quick.is-active').count()) !== 0) {
  throw new Error('Road quick action must remain one-shot and never selected.');
}
await page.screenshot({ path: `${outDir}/65-bottom-command-road-day.png` });

// Night: keep the same family and hierarchy instead of switching to blue/green.
await open('weather', '.gameplay-context-panel--weather');
const dayTime = page.getByRole('slider', { name: '日内时间' });
await setRangeValue(dayTime, 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
const nightDock = page.locator('.command-bar');
const nightUtility = page.locator('.world-utility-toolbar');
const nightDockMaterial = await material(nightDock, 'Night Main Dock L');
const nightUtilityMaterial = await material(nightUtility, 'Night World Utility S');
if (!(nightDockMaterial.alpha > nightUtilityMaterial.alpha)) throw new Error('Night L/S density hierarchy must remain stable.');
await page.screenshot({ path: `${outDir}/66-bottom-command-family-gameplay-night.png` });

const categories = nightDock.locator('.category-row');
await categories.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
await page.locator('.building-card').first().click();
const nightBuildingBar = page.getByLabel('建筑放置操作栏');
const nightBuildingMaterial = await material(nightBuildingBar, 'Night Building Placement M');
if (!(nightBuildingMaterial.alpha > nightDockMaterial.alpha && nightDockMaterial.alpha > nightUtilityMaterial.alpha)) throw new Error('Night density hierarchy must remain M > L > S.');
await page.screenshot({ path: `${outDir}/67-bottom-command-building-night.png` });

await page.keyboard.press('Escape');
await page.waitForSelector('.workspace--building');
await categories.getByRole('button', { name: '道路', exact: true }).click();
const roadWorkspace = page.locator('.workspace--design[data-design-category="road"]');
await roadWorkspace.waitFor();
await roadWorkspace.locator('.design-item-card').first().click();
const nightRoadBar = page.getByLabel('道路铺设操作栏');
await material(nightRoadBar, 'Night Road Placement M');
await page.screenshot({ path: `${outDir}/68-bottom-command-road-night.png` });

await browser.close();
