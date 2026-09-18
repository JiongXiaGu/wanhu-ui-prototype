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
  await page.waitForTimeout(200);
}

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function activePauseAction() {
  return page.evaluate(() => document.activeElement?.getAttribute('data-pause-action'));
}

function rgbaChannels(value) {
  return (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
}

// Day Pause: composition, material, hierarchy and keyboard focus.
await open('pause', '.pause-command-surface');
let surface = page.locator('.pause-command-surface');
const commandButtons = surface.locator('.pause-command-list button');

if ((await page.locator('.pause-footer').count()) !== 0) throw new Error('Pause must not render the legacy Esc footer hint.');
if ((await commandButtons.count()) !== 4) throw new Error('Pause must expose exactly four commands.');
if ((await surface.locator('.pause-command-group').count()) !== 2 || (await surface.locator('.pause-command-divider').count()) !== 1) {
  throw new Error('Pause must use a 3+1 hierarchy with one structural divider.');
}
if ((await surface.locator('.pause-command-group').first().locator('button').count()) !== 3) {
  throw new Error('Pause current-game command group must contain Continue / Save / Settings.');
}
if ((await surface.locator('.pause-command-group--exit button').count()) !== 1) {
  throw new Error('Return to Main Menu must be isolated in the weaker exit group.');
}

const actions = await commandButtons.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-pause-action')));
if (JSON.stringify(actions) !== JSON.stringify(['resume', 'save', 'settings', 'main-menu'])) {
  throw new Error(`Pause command order is invalid: ${JSON.stringify(actions)}`);
}
if ((await commandButtons.first().getAttribute('class') ?? '').includes('is-primary')) {
  throw new Error('Continue Game must not retain the legacy permanent primary skin.');
}

await page.waitForFunction(() => document.activeElement?.getAttribute('data-pause-action') === 'resume');
await page.keyboard.press('ArrowDown');
if ((await activePauseAction()) !== 'save') throw new Error('ArrowDown must move focus to Save Game.');
await page.keyboard.press('End');
if ((await activePauseAction()) !== 'main-menu') throw new Error('End must move focus to Return to Main Menu.');
await page.keyboard.press('Home');
if ((await activePauseAction()) !== 'resume') throw new Error('Home must move focus to Continue Game.');
await page.keyboard.press('ArrowUp');
if ((await activePauseAction()) !== 'main-menu') throw new Error('ArrowUp from the first command must wrap to the last command.');
await page.keyboard.press('ArrowDown');
if ((await activePauseAction()) !== 'resume') throw new Error('ArrowDown from the last command must wrap to the first command.');

const visual = await surface.evaluate((node) => {
  const style = getComputedStyle(node);
  return {
    width: style.width,
    radius: style.borderRadius,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage,
  };
});
if (Math.abs(Number.parseFloat(visual.width) - 432) > .5 || visual.radius !== '18px') {
  throw new Error(`Pause geometry must remain 432px / 18px. visual=${JSON.stringify(visual)}`);
}
if (!visual.backgroundImage.includes('glass-noise-soft.png')) {
  throw new Error(`Pause must consume the shared graphite material noise. image=${visual.backgroundImage}`);
}
if (visual.backgroundImage.includes('90deg')) throw new Error('Pause must not restore the legacy horizontal gradient strip.');
const dayChannels = rgbaChannels(visual.backgroundColor);
if (dayChannels.length !== 3 || Math.max(...dayChannels) - Math.min(...dayChannels) > 4) {
  throw new Error(`Pause surface must stay neutral graphite. background=${visual.backgroundColor}`);
}
await page.screenshot({ path: `${outDir}/pause-day.png` });

// Esc from Pause Menu resumes the game.
await page.keyboard.press('Escape');
await page.waitForSelector('.pause-layer', { state: 'detached' });

// Pause -> Save, screenshot, Esc -> Pause Menu.
await open('pause-save', '.save-game-space');
await page.screenshot({ path: `${outDir}/pause-save.png` });
await page.keyboard.press('Escape');
await page.waitForSelector('.pause-command-surface');

// Pause -> Settings, screenshot, Esc -> Pause Menu.
await open('pause-settings', '.settings-panel--pause');
await page.screenshot({ path: `${outDir}/pause-settings.png` });
await page.keyboard.press('Escape');
await page.waitForSelector('.pause-command-surface');

// Return-to-main-menu confirmation is the only elevated confirmation state.
await open('pause', '.pause-command-surface');
const exitButton = page.getByRole('button', { name: '返回主菜单', exact: true });
if ((await exitButton.getAttribute('class') ?? '').includes('danger')) throw new Error('Pause menu exit command must remain neutral.');
await exitButton.click();
await page.getByRole('dialog', { name: '返回主菜单？' }).waitFor();
await page.screenshot({ path: `${outDir}/pause-return-main-menu-dialog.png` });
await page.keyboard.press('Escape');
await page.waitForSelector('.ui-dialog', { state: 'detached' });

// Night Pause: derive it from the real Environment control, then open Pause via Esc.
await open('weather', '.gameplay-context-panel--weather');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await page.keyboard.press('Escape');
surface = page.locator('.pause-command-surface');
await surface.waitFor();
if ((await page.locator('.gameplay-screen').getAttribute('data-time-of-day')) !== 'night') {
  throw new Error('Opening Pause must preserve the real night gameplay state.');
}
const nightVisual = await surface.evaluate((node) => {
  const style = getComputedStyle(node);
  return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage };
});
const nightChannels = rgbaChannels(nightVisual.backgroundColor);
if (nightChannels.length !== 3 || Math.max(...nightChannels) - Math.min(...nightChannels) > 4) {
  throw new Error(`Night Pause must remain the same neutral graphite language. background=${nightVisual.backgroundColor}`);
}
if (!nightVisual.backgroundImage.includes('glass-noise-soft.png')) {
  throw new Error('Night Pause must retain the shared blocking material.');
}
await page.screenshot({ path: `${outDir}/pause-night.png` });

await browser.close();
