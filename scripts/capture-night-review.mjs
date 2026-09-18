import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function openEnvironment() {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'weather');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.gameplay-context-panel--weather');
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

await openEnvironment();

const screen = page.locator('.gameplay-screen');
const panel = page.locator('.gameplay-context-panel--weather');
const footer = panel.locator('.gameplay-context-panel__footer--weather-mode');
const restoreCurrent = page.getByRole('button', { name: '恢复当前游戏环境', exact: true });

if ((await panel.getAttribute('aria-label')) !== '环境面板') {
  throw new Error(`Context panel should present itself as the environment panel. aria=${await panel.getAttribute('aria-label')}`);
}
if ((await panel.locator('.gameplay-context-panel__title').textContent())?.trim() !== '环境') {
  throw new Error('Environment panel title must read “环境”.');
}
if (!(await restoreCurrent.isDisabled())) {
  throw new Error('Restore-current action should start disabled when preview matches the runtime environment.');
}
if ((await panel.getAttribute('data-environment-modified')) !== 'false') {
  throw new Error('Environment panel should start unmodified.');
}

const sceneFooterBox = await footer.boundingBox();
if (!sceneFooterBox) throw new Error('Environment mode footer must be visible in scene simulation mode.');

await page.getByRole('button', { name: '跟随世界', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-context-mode') === '跟随世界');
await page.waitForSelector('.weather-world-summary');
await page.waitForTimeout(120);

const followFooterBox = await footer.boundingBox();
if (!followFooterBox) throw new Error('Environment mode footer must stay visible in follow-world mode.');
if (Math.abs(sceneFooterBox.y - followFooterBox.y) > 1 || Math.abs(sceneFooterBox.x - followFooterBox.x) > 1) {
  throw new Error(`Environment footer must stay fixed while mode content changes. scene=${JSON.stringify(sceneFooterBox)} follow=${JSON.stringify(followFooterBox)}`);
}
if (!(await restoreCurrent.isDisabled())) {
  throw new Error('Restore-current action must stay disabled while following the world.');
}
await page.screenshot({ path: `${outDir}/34-weather-follow-world.png` });

await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-context-mode') === '场景模拟');
await page.waitForSelector('[aria-label="日内时间"]');

if ((await page.locator('.weather-preset-section__heading > span').count()) !== 0) {
  throw new Error('Weather preset heading must not repeat the current preset in helper text.');
}
if ((await page.locator('.weather-wind-compass').count()) !== 0) {
  throw new Error('Environment panel should use the shared wind-direction slider instead of a compass control.');
}

await page.locator('.weather-time-track').waitFor();
await page.locator('.weather-season-track').waitFor();

const timeTrackVisual = await page.locator('.weather-time-track__segments').evaluate((node) => getComputedStyle(node).backgroundImage);
if (!timeTrackVisual.includes('linear-gradient') || timeTrackVisual.includes('url(')) {
  throw new Error(`Time-of-day control must use an abstract gradient with no scene artwork. background=${timeTrackVisual}`);
}
const seasonTrackVisual = await page.locator('.weather-season-track__segments').evaluate((node) => getComputedStyle(node).backgroundImage);
if (!seasonTrackVisual.includes('linear-gradient') || seasonTrackVisual.includes('url(')) {
  throw new Error(`Season control must use an abstract gradient with no scene artwork. background=${seasonTrackVisual}`);
}
const glassTexture = await panel.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!glassTexture.includes('glass-noise-soft.png')) {
  throw new Error(`Environment glass must retain the soft material texture. background=${glassTexture}`);
}

const windDirection = page.getByRole('slider', { name: '风向', exact: true });
if (Number(await windDirection.inputValue()) !== 135) {
  throw new Error(`Wind direction should remain a standard slider. value=${await windDirection.inputValue()}`);
}
await page.screenshot({ path: `${outDir}/37-weather-visual-controls.png` });

const dayTime = page.getByRole('slider', { name: '日内时间' });
const runtimeDayTime = Number(await dayTime.inputValue());
await setRangeValue(dayTime, 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-environment-modified') === 'true');
if (await restoreCurrent.isDisabled()) {
  throw new Error('Restore-current action must enable after the player changes an environment parameter.');
}

const nightBackground = await screen.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!nightBackground.includes('wanhu-gameplay-city-night.png')) {
  throw new Error(`Night scene must use the dedicated night background. background=${nightBackground}`);
}

const clock = (await page.locator('.gameplay-top-status__clock').textContent())?.trim() ?? '';
if (!clock.includes('22:00')) throw new Error(`Top HUD clock must follow the environment-panel day time. clock=${clock}`);

await page.screenshot({ path: `${outDir}/35-weather-night.png` });

await restoreCurrent.click();
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-environment-modified') === 'false');
if (Number(await dayTime.inputValue()) !== runtimeDayTime) {
  throw new Error(`Restore-current must restore the runtime time-of-day. expected=${runtimeDayTime} actual=${await dayTime.inputValue()}`);
}
if (!(await restoreCurrent.isDisabled())) {
  throw new Error('Restore-current action must disable again after the preview matches runtime state.');
}
const restoredBackground = await screen.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!restoredBackground.includes('wanhu-gameplay-city.png') || restoredBackground.includes('night')) {
  throw new Error(`Restore-current must restore the runtime daytime scene. background=${restoredBackground}`);
}
await page.screenshot({ path: `${outDir}/38-environment-restored.png` });

await setRangeValue(dayTime, 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await page.waitForTimeout(120);
await page.screenshot({ path: `${outDir}/36-gameplay-night.png` });

// Settings is a Global / Blocking Surface. It must preserve the current night world
// underneath instead of swapping in a Settings-owned daytime scene image.
await page.keyboard.press('Escape');
await page.waitForSelector('.pause-command-surface');
await page.getByRole('button', { name: '游戏设置', exact: true }).click();
const nightSettings = page.locator('.settings-panel--pause');
await nightSettings.waitFor();
const nightSettingsBackground = await nightSettings.evaluate((node) => getComputedStyle(node).backgroundImage);
if (nightSettingsBackground.includes('wanhu-gameplay-city.png') || nightSettingsBackground.includes('wanhu-gameplay-city-night.png')) {
  throw new Error(`Settings must inherit scene artwork from its parent context. background=${nightSettingsBackground}`);
}
if ((await screen.getAttribute('data-time-of-day')) !== 'night') {
  throw new Error('Opening Settings from Pause must preserve the current night gameplay state.');
}
if ((await nightSettings.locator('.settings-slider, .settings-toggle, .settings-select-root').count()) !== 0) {
  throw new Error('Night Settings must not fall back to legacy local controls.');
}
if ((await nightSettings.locator('.ui-select--settings').count()) === 0 || (await nightSettings.locator('.ui-toggle--settings').count()) === 0) {
  throw new Error('Night Settings must retain shared Select and Toggle controls.');
}
await page.waitForTimeout(160);
await page.screenshot({ path: `${outDir}/40-settings-night.png` });
await nightSettings.getByRole('button', { name: '返回', exact: true }).click();
await page.waitForSelector('.pause-command-surface');
await page.getByRole('button', { name: '继续游戏', exact: true }).click();
await page.waitForSelector('.pause-layer', { state: 'detached' });

const mainDock = page.locator('.command-bar');
const categoryRow = mainDock.locator('.category-row');
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
const nightWorkspace = page.locator('.workspace--design[data-design-category="building"]');
await nightWorkspace.waitFor();
await page.waitForTimeout(160);
const workspaceTexture = await nightWorkspace.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!workspaceTexture.includes('glass-noise-soft.png')) {
  throw new Error(`Night Workspace must retain the shared soft material texture. background=${workspaceTexture}`);
}
await page.screenshot({ path: `${outDir}/39-workspace-night.png` });
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
await nightWorkspace.waitFor({ state: 'detached' });

await page.getByRole('button', { name: '环境控制', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 14.5);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'day');

const dayBackground = await screen.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!dayBackground.includes('wanhu-gameplay-city.png') || dayBackground.includes('night')) {
  throw new Error(`Day scene must restore the original gameplay background. background=${dayBackground}`);
}

await browser.close();
