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

async function setVariant(variant) {
  await page.locator('.gameplay-screen').evaluate((node, nextVariant) => {
    node.setAttribute('data-edge-study', nextVariant);
  }, variant);
  await page.waitForTimeout(90);
}

async function clearVariant() {
  await page.locator('.gameplay-screen').evaluate((node) => {
    node.removeAttribute('data-edge-study');
  });
  await page.waitForTimeout(90);
}

async function borderSnapshot(selector) {
  return page.locator(selector).first().evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      top: style.borderTopColor,
      right: style.borderRightColor,
      bottom: style.borderBottomColor,
      left: style.borderLeftColor,
      shadow: style.boxShadow,
    };
  });
}

async function assertDirectional(label, selector) {
  const edge = await borderSnapshot(selector);
  if (edge.top === edge.bottom && edge.left === edge.right) {
    throw new Error(`${label} must use directional edge colors. edge=${JSON.stringify(edge)}`);
  }
  if (edge.shadow === 'none') throw new Error(`${label} must keep an elevation shadow.`);
}

async function assertBorderless(label, selector) {
  const edge = await borderSnapshot(selector);
  const alphas = [edge.top, edge.right, edge.bottom, edge.left].map(alphaFromCssColor);
  if (alphas.some((alpha) => alpha > 0.03)) {
    throw new Error(`${label} must remove the structural outer border. edge=${JSON.stringify(edge)}`);
  }
  if (edge.shadow === 'none') throw new Error(`${label} must keep an elevation shadow.`);
}

async function assertElevatedContour(label) {
  const edge = await borderSnapshot('.asset-inspector-popover');
  if (alphaFromCssColor(edge.top) < 0.08 || alphaFromCssColor(edge.bottom) < 0.08 || edge.top === edge.bottom) {
    throw new Error(`${label} Inspector must retain a directional contour. edge=${JSON.stringify(edge)}`);
  }
}

async function assertInternalDarkRule(label, selector) {
  const edge = await borderSnapshot(selector);
  if (alphaFromCssColor(edge.bottom) < 0.05) {
    throw new Error(`${label} must retain a visible internal separator while the outer shell stays borderless. edge=${JSON.stringify(edge)}`);
  }
}

async function assertFormalMix(period) {
  await assertDirectional(`${period} Top HUD`, '.gameplay-top-status');
  await assertDirectional(`${period} Secondary HUD`, '.gameplay-top-navigation');
  await assertBorderless(`${period} Workspace`, '.workspace--design');
  await assertBorderless(`${period} Main Dock`, '.command-bar');
  await assertBorderless(`${period} Utility`, '.world-utility-toolbar');
  await assertBorderless(`${period} Operation Hint`, '.gameplay-operation-hints');
  await assertBorderless(`${period} System Menu`, '.gameplay-system-menu-button');
  await assertElevatedContour(`${period} formal`);
  await assertInternalDarkRule(`${period} Workspace Header`, '.workspace-header');
  await assertInternalDarkRule(`${period} Workspace Filter`, '.workspace-context-filter');
}

async function captureVariants(period) {
  const variants = ['a', 'b', 'c'];
  for (const variant of variants) {
    await setVariant(variant);
    if (variant === 'b') {
      await assertDirectional(`${period} Top HUD`, '.gameplay-top-status');
      await assertDirectional(`${period} Workspace`, '.workspace--design');
      await assertDirectional(`${period} Main Dock`, '.command-bar');
      await assertDirectional(`${period} Inspector`, '.asset-inspector-popover');
    }
    if (variant === 'c') {
      await assertBorderless(`${period} Top HUD`, '.gameplay-top-status');
      await assertBorderless(`${period} Workspace`, '.workspace--design');
      await assertBorderless(`${period} Main Dock`, '.command-bar');
      await assertBorderless(`${period} Utility`, '.world-utility-toolbar');
      await assertElevatedContour(period);
    }
    await page.screenshot({ path: `${outDir}/45-edge-${variant}-${period}.png` });
  }
}

// Day: first validate the formal mixed runtime, then preserve the pure A/B/C study views.
await open('gameplay', '.gameplay-top-status');
await openBridgeInspector();
await clearVariant();
await assertFormalMix('day');
await page.screenshot({ path: `${outDir}/46-edge-v1-day.png` });
await captureVariants('day');

// Night: use the real Environment control and validate the same formal hierarchy.
await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await openBridgeInspector();
await clearVariant();
await assertFormalMix('night');
await page.screenshot({ path: `${outDir}/46-edge-v1-night.png` });
await captureVariants('night');

await browser.close();
