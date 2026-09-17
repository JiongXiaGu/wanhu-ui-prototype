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

async function inspectRole(selector, label, minAlpha, maxAlpha, edgeMode) {
  const locator = page.locator(selector).first();
  await locator.waitFor();
  const visual = await locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter || '',
      borderTopColor: style.borderTopColor,
      borderRightColor: style.borderRightColor,
      borderBottomColor: style.borderBottomColor,
      borderLeftColor: style.borderLeftColor,
      boxShadow: style.boxShadow,
    };
  });
  const alpha = alphaFromCssColor(visual.backgroundColor);
  if (alpha < minAlpha || alpha > maxAlpha) {
    throw new Error(`${label} surface alpha must stay in role range ${minAlpha}-${maxAlpha}. visual=${JSON.stringify(visual)}`);
  }
  if (!visual.backgroundImage.includes('glass-noise-soft.png')) {
    throw new Error(`${label} must use the shared Mist Glass noise material. background=${visual.backgroundImage}`);
  }
  if (!visual.backdropFilter.includes('blur(20px)')) {
    throw new Error(`${label} must use the 20px shared scene blur. filter=${visual.backdropFilter}`);
  }

  const edgeColors = [visual.borderTopColor, visual.borderRightColor, visual.borderBottomColor, visual.borderLeftColor];
  const edgeAlphas = edgeColors.map(alphaFromCssColor);
  if (edgeMode === 'directional') {
    if (Math.max(...edgeAlphas) < .05 || (visual.borderTopColor === visual.borderBottomColor && visual.borderLeftColor === visual.borderRightColor)) {
      throw new Error(`${label} must keep the formal directional edge language. visual=${JSON.stringify(visual)}`);
    }
  } else if (edgeMode === 'borderless') {
    if (edgeAlphas.some((edgeAlpha) => edgeAlpha > .03)) {
      throw new Error(`${label} must remain borderless under Edge & Elevation v1. visual=${JSON.stringify(visual)}`);
    }
  }

  if (visual.boxShadow === 'none') throw new Error(`${label} must keep surface separation shadow.`);
}

async function inspectHudRoles(prefix) {
  await inspectRole('.gameplay-top-status', `${prefix} Top HUD`, .44, .54, 'directional');
  await inspectRole('.gameplay-top-navigation', `${prefix} Secondary HUD`, .36, .46, 'directional');
  await inspectRole('.command-bar', `${prefix} Main Dock`, .53, .62, 'borderless');
  await inspectRole('.world-utility-toolbar', `${prefix} Utility Toolbar`, .36, .46, 'borderless');
  await inspectRole('.gameplay-operation-hints', `${prefix} Operation Hint`, .40, .50, 'borderless');
  await inspectRole('.gameplay-system-menu-button', `${prefix} System Menu`, .34, .44, 'borderless');
}

// Day: all persistent HUD roles on the normal gameplay world.
await open('gameplay', '.gameplay-top-status');
await inspectHudRoles('Day');
await page.screenshot({ path: `${outDir}/43-hud-material-study-day.png` });

// Night: change the real environment time, close the panel, then review the same HUD roles.
await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await inspectHudRoles('Night');
await page.screenshot({ path: `${outDir}/44-hud-material-study-night.png` });

await browser.close();
