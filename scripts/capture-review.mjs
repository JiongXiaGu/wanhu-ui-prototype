import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';

const scenarios = [
  { file: '01-main-menu.png', review: 'menu', waitFor: '.main-menu-screen' },
  { file: '02-gameplay.png', review: 'gameplay', waitFor: '.command-utility' },
  { file: '03-workspace.png', review: 'workspace-building', waitFor: '.workspace' },
  { file: '03a-workspace-content-wheel.png', review: 'workspace-building', waitFor: '.workspace', action: 'content-wheel' },
  { file: '03b-workspace-category-wheel.png', review: 'workspace-building', waitFor: '.workspace', action: 'category-wheel' },
  { file: '03c-workspace-filter-persistence.png', review: 'workspace-building', waitFor: '.workspace', action: 'filter-persistence' },
  { file: '04-tool-position-hints.png', review: 'building-position', waitFor: '.gameplay-operation-hints' },
  { file: '05-tool-massing-hints.png', review: 'building-massing', waitFor: '.gameplay-operation-hints' },
  { file: '06-tool-roof-hints.png', review: 'building-roof', waitFor: '.bp-mode-content' },
  { file: '07-tool-manual-elevation-hints.png', review: 'building-height', waitFor: '.bp-terrain-summary' },
  { file: '08-camera-flyout.png', review: 'camera', waitFor: '.right-edge-flyout--camera' },
  { file: '09-weather-flyout.png', review: 'weather', waitFor: '.right-edge-flyout--weather' },
  { file: '10-tool-camera-flyout-hints-hidden.png', review: 'building-camera', waitFor: '.right-edge-flyout--camera' },
  { file: '11-pause-layer.png', review: 'pause', waitFor: '.pause-command-surface' },
  { file: '12-menu-settings.png', review: 'settings', waitFor: '.settings-panel--menu' },
  { file: '12a-settings-graphics.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-图形' },
  { file: '12b-settings-controls.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-操作' },
  { file: '12c-settings-gameplay.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-游戏' },
  { file: '12d-settings-bindings.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'controls-bindings' },
  { file: '12e-settings-binding-listening.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'controls-binding-listening' },
  { file: '13-pause-save.png', review: 'pause-save', waitFor: '.archive-space--save' },
  { file: '14-pause-settings.png', review: 'pause-settings', waitFor: '.settings-panel--pause' },
  { file: '15-menu-load.png', review: 'load', waitFor: '.archive-space--load' },
  { file: '16-new-game.png', review: 'new-game', waitFor: '.flow-frame' },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

for (const scenario of scenarios) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', scenario.review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(scenario.waitFor);
  await page.waitForTimeout(180);

  if (scenario.action === 'content-wheel') {
    await page.locator('.workspace-content-stage').hover();
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(280);
    const activeContentPager = await page.locator('.workspace-content-pager button').evaluateAll((items) => items.findIndex((item) => item.classList.contains('is-active')));
    if (activeContentPager !== 1) throw new Error('Workspace content wheel should advance exactly one content group.');
  }

  if (scenario.action === 'category-wheel') {
    await page.locator('.workspace-primary-rail').hover();
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(280);
    const activeCategoryPager = await page.locator('.workspace-rail-pager button').evaluateAll((items) => items.findIndex((item) => item.classList.contains('is-active')));
    if (activeCategoryPager !== 1) throw new Error('Workspace category wheel should advance exactly one category group.');
  }

  if (scenario.action === 'filter-persistence') {
    await page.getByRole('button', { name: '歇山', exact: true }).click();
    await page.getByRole('button', { name: '塔', exact: true }).click();
    await page.getByRole('button', { name: '全部建筑', exact: true }).click();
    await page.waitForTimeout(180);
    const activeContextFilter = await page.locator('.workspace-context-filter__scroll > button.is-active').textContent();
    if (activeContextFilter?.trim() !== '歇山') throw new Error('Primary category changes must not reset the top context filter.');
  }

  if (scenario.action?.startsWith('settings-')) {
    const tab = scenario.action.replace('settings-', '');
    await page.locator('.settings-space__tabs').getByRole('button', { name: tab, exact: true }).click();
    await page.waitForTimeout(220);
  }

  if (scenario.action === 'controls-bindings' || scenario.action === 'controls-binding-listening') {
    await page.locator('.settings-space__tabs').getByRole('button', { name: '操作', exact: true }).click();
    await page.waitForTimeout(220);
    await page.locator('.settings-binding-section').evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(180);
  }

  if (scenario.action === 'controls-binding-listening') {
    await page.getByRole('button', { name: /营造与道路/ }).click();
    await page.waitForTimeout(120);
    await page.getByRole('button', { name: '旋转构件次要按键：未设置' }).click();
    await page.waitForTimeout(120);
    const listeningCount = await page.locator('.settings-binding-cell.is-listening').count();
    if (listeningCount !== 1) throw new Error('Exactly one key binding should be listening for input.');
  }

  if (scenario.review === 'building-camera') {
    const hintCount = await page.locator('.gameplay-operation-hints').count();
    if (hintCount !== 0) throw new Error('OperationHints should be hidden while a right-edge flyout is open.');
  }

  if (scenario.review === 'pause' || scenario.review === 'pause-save' || scenario.review === 'pause-settings') {
    const flyoutCount = await page.locator('.right-edge-flyout').count();
    if (flyoutCount !== 0) throw new Error('Right-edge flyouts should be closed in Pause Space.');
  }

  await page.screenshot({ path: `${outDir}/${scenario.file}`, fullPage: false });
}

await browser.close();
