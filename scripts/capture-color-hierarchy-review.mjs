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
  await page.waitForTimeout(220);
}

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function assertPaletteTokens() {
  const tokens = await page.locator('.gameplay-screen').evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      jade: style.getPropertyValue('--wanhu-color-jade').trim(),
      qing: style.getPropertyValue('--wanhu-color-qing').trim(),
      gold: style.getPropertyValue('--wanhu-color-old-gold').trim(),
      cinnabar: style.getPropertyValue('--wanhu-color-cinnabar').trim(),
      paper: style.getPropertyValue('--wanhu-color-paper').trim(),
    };
  });
  if (Object.values(tokens).some((value) => !value) || new Set(Object.values(tokens)).size < 5) {
    throw new Error(`Wanhu colour role tokens must all exist and remain distinct. tokens=${JSON.stringify(tokens)}`);
  }
}

async function assertTopResourceHierarchy() {
  const resources = page.locator('.gameplay-top-status__resources > span');
  const count = await resources.count();
  const iconColours = [];
  const labelColours = [];
  const valueColours = [];
  for (let index = 0; index < count; index += 1) {
    const resource = resources.nth(index);
    iconColours.push(await resource.locator('svg').evaluate((node) => getComputedStyle(node).color));
    labelColours.push(await resource.locator('small').evaluate((node) => getComputedStyle(node).color));
    valueColours.push(await resource.locator('b').evaluate((node) => getComputedStyle(node).color));
  }
  if (new Set(iconColours).size < 4 || new Set(labelColours).size < 4) {
    throw new Error(`Top resources need distinct low-saturation category accents. icons=${iconColours} labels=${labelColours}`);
  }
  if (new Set(valueColours).size !== 1) {
    throw new Error(`Resource values must stay one paper-white reading tier. values=${valueColours}`);
  }
}

async function assertWeatherHierarchy() {
  const presetIcons = page.locator('.weather-preset-card__icon');
  const colours = [];
  for (let index = 0; index < await presetIcons.count(); index += 1) {
    colours.push(await presetIcons.nth(index).evaluate((node) => getComputedStyle(node).color));
  }
  if (new Set(colours).size < 6) {
    throw new Error(`Weather presets must carry recognisable weather hues. colours=${colours}`);
  }

  const weatherFill = await page.locator('.gameplay-context-panel__body--weather.is-scene-simulation > .gameplay-context-panel__section:not(.weather-preset-section):not(.weather-wind-section):not(.weather-time-season-section) .ui-slider__track > i').first().evaluate((node) => getComputedStyle(node).backgroundColor);
  const windFill = await page.locator('.weather-wind-section .ui-slider__track > i').first().evaluate((node) => getComputedStyle(node).backgroundColor);
  const weatherTitle = await page.locator('.gameplay-context-panel__body--weather.is-scene-simulation > .gameplay-context-panel__section:not(.weather-preset-section):not(.weather-wind-section):not(.weather-time-season-section) .gameplay-context-panel__section-title b').first().evaluate((node) => getComputedStyle(node).color);
  const windTitle = await page.locator('.weather-wind-section .gameplay-context-panel__section-title b').evaluate((node) => getComputedStyle(node).color);
  const timeTitle = await page.locator('.weather-time-season-section .gameplay-context-panel__section-title b').evaluate((node) => getComputedStyle(node).color);
  if (weatherFill === windFill || new Set([weatherTitle, windTitle, timeTitle]).size < 3) {
    throw new Error(`Weather groups must separate Qing / Jade / Warm reading roles. fills=${weatherFill},${windFill} titles=${weatherTitle},${windTitle},${timeTitle}`);
  }
}

async function openBridgeWorkspace() {
  const bridgeButton = page.locator('.command-bar .category-row').getByRole('button', { name: '桥梁', exact: true });
  await bridgeButton.click();
  const workspace = page.locator('.workspace--design[data-design-category="bridge"]');
  await workspace.waitFor();
  await page.waitForTimeout(220);
  return workspace;
}

async function assertWorkspaceHierarchy(workspace) {
  const buttons = workspace.locator('.workspace-primary-rail__page > button');
  const inactiveIconColours = [];
  let activeColour = null;
  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    const active = await button.evaluate((node) => node.classList.contains('is-active'));
    const colour = await button.locator('svg').evaluate((node) => getComputedStyle(node).color);
    if (active) activeColour = colour;
    else inactiveIconColours.push(colour);
  }
  if (new Set(inactiveIconColours).size < 4) {
    throw new Error(`Workspace inactive categories need restrained category hues. colours=${inactiveIconColours}`);
  }
  if (!activeColour) throw new Error('Workspace active category colour was not found.');
  const filterActive = await workspace.locator('.workspace-context-filter__scroll > button.is-active').evaluate((node) => getComputedStyle(node).color);
  if (filterActive === inactiveIconColours[0]) {
    throw new Error(`Workspace selected/filter state must stay visually separate from category hues. active=${filterActive}`);
  }
}

await open('gameplay', '.gameplay-top-status');
await assertPaletteTokens();
await assertTopResourceHierarchy();
await page.screenshot({ path: `${outDir}/50-color-hierarchy-gameplay-day.png` });

await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await assertPaletteTokens();
await assertTopResourceHierarchy();
await assertWeatherHierarchy();
await page.screenshot({ path: `${outDir}/50-color-hierarchy-weather-day.png` });

await open('gameplay', '.gameplay-top-status');
const workspace = await openBridgeWorkspace();
await assertWorkspaceHierarchy(workspace);
await page.screenshot({ path: `${outDir}/50-color-hierarchy-workspace-day.png` });

await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await assertWeatherHierarchy();
await page.screenshot({ path: `${outDir}/50-color-hierarchy-weather-night.png` });

await browser.close();
