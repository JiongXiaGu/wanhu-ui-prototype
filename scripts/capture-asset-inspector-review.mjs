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

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

function alphaFromCssColor(value) {
  const match = value.match(/rgba?\([^,]+,[^,]+,[^,]+(?:,\s*([\d.]+))?\)/);
  if (!match) return 1;
  return match[1] === undefined ? 1 : Number(match[1]);
}

function usesBackdropBlur(value) {
  return Boolean(value && value !== 'none');
}

async function inspectElevatedMaterial(inspector, label) {
  const visual = await inspector.evaluate((node) => {
    const style = getComputedStyle(node);
    const occlusion = getComputedStyle(node, '::before');
    return {
      backdropFilter: style.backdropFilter,
      webkitBackdropFilter: style.webkitBackdropFilter,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderColor: style.borderTopColor,
      boxShadow: style.boxShadow,
      occlusionColor: occlusion.backgroundColor,
      pointerEvents: style.pointerEvents,
    };
  });

  if (usesBackdropBlur(visual.backdropFilter) || usesBackdropBlur(visual.webkitBackdropFilter)) {
    throw new Error(`${label} Inspector must not depend on UI-over-UI backdrop blur. visual=${JSON.stringify(visual)}`);
  }
  if (!visual.backgroundImage.includes('glass-noise-soft.png')) {
    throw new Error(`${label} Inspector must retain the shared Mist Glass noise material. background=${visual.backgroundImage}`);
  }
  if (alphaFromCssColor(visual.backgroundColor) < 0.70) {
    throw new Error(`${label} Inspector Elevated Surface must be dense enough to mask underlying UI. background=${visual.backgroundColor}`);
  }
  if (alphaFromCssColor(visual.occlusionColor) < 0.18) {
    throw new Error(`${label} Inspector must keep a local occlusion plate behind its content. occlusion=${visual.occlusionColor}`);
  }
  if (!visual.borderColor || visual.borderColor === 'rgba(0, 0, 0, 0)') {
    throw new Error(`${label} Inspector must keep a visible Elevated edge.`);
  }
  if (visual.boxShadow === 'none') throw new Error(`${label} Inspector must keep Elevated shadow separation.`);
  if (visual.pointerEvents !== 'none') throw new Error(`${label} Inspector must ignore pointer picking.`);
}

async function openBridgeInspector() {
  const dock = page.locator('.command-bar');
  await dock.locator('.category-row').getByRole('button', { name: '桥梁', exact: true }).click();
  const workspace = page.locator('.workspace--design[data-design-category="bridge"]');
  await workspace.waitFor();
  const card = workspace.locator('.design-item-card').first();
  await card.hover();
  await page.waitForTimeout(340);
  const inspector = page.locator('.asset-inspector-popover');
  await inspector.waitFor();
  return { workspace, inspector };
}

// Day: verify the Inspector works without blurring the Workspace below it.
await open('gameplay', '.command-bar');
let { inspector: dayInspector } = await openBridgeInspector();
await inspectElevatedMaterial(dayInspector, 'Day');
await page.screenshot({ path: `${outDir}/41-asset-inspector-day.png` });

// Night: create the night scene through the real Environment control, then
// open the same Workspace/Inspector relationship and re-check readability.
await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });

const nightResult = await openBridgeInspector();
await inspectElevatedMaterial(nightResult.inspector, 'Night');
if ((await page.locator('.gameplay-screen').getAttribute('data-time-of-day')) !== 'night') {
  throw new Error('Night Inspector review must remain on the night scene.');
}
await page.screenshot({ path: `${outDir}/42-asset-inspector-night.png` });

await browser.close();
