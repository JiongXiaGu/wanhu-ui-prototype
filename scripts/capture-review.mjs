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
  { file: '12d-settings-bindings.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-bindings' },
  { file: '12e-settings-binding-listening.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-binding-listening' },
  { file: '12f-settings-select-open.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-select-open' },
  { file: '12g-settings-slider-changed.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-slider-change' },
  { file: '12h-settings-toggle-changed.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-toggle-change' },
  { file: '12i-settings-disabled-state.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-disabled-state' },
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

  if (scenario.action?.startsWith('settings-') && !['settings-select-open','settings-slider-change','settings-toggle-change','settings-disabled-state','settings-bindings','settings-binding-listening'].includes(scenario.action)) {
    const tab = scenario.action.replace('settings-', '');
    await page.locator('.settings-space__tabs').getByRole('button', { name: tab, exact: true }).click();
    await page.waitForTimeout(220);
  }

  if (scenario.action === 'settings-bindings') {
    await page.locator('.settings-space__tabs').getByRole('button', { name: '操作', exact: true }).click();
    await page.locator('.settings-binding-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
  }

  if (scenario.action === 'settings-binding-listening') {
    await page.locator('.settings-space__tabs').getByRole('button', { name: '操作', exact: true }).click();
    await page.getByRole('button', { name: /营造与道路/ }).click();
    const secondary = page.getByRole('button', { name: '旋转构件次要按键：未设置' });
    await secondary.scrollIntoViewIfNeeded();
    await secondary.click();
    await page.waitForTimeout(180);
  }

  if (scenario.action === 'settings-select-open') {
    await page.locator('[data-setting-id="display-mode"] .settings-select-value').click();
    await page.waitForSelector('.settings-select-menu');
  }

  if (scenario.action === 'settings-slider-change') {
    const slider = page.locator('[data-setting-id="ui-scale"] .settings-slider');
    const box = await slider.boundingBox();
    if (!box) throw new Error('UI scale slider was not measurable.');
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
    const value = Number(await slider.getAttribute('aria-valuenow'));
    if (value <= 100) throw new Error('Clicking the slider track should increase UI scale.');
    if (await page.locator('.settings-apply').isDisabled()) throw new Error('Changing a slider should enable Apply.');
    await page.waitForTimeout(150);
  }

  if (scenario.action === 'settings-toggle-change') {
    const toggle = page.locator('[data-setting-id="hdr-output"] .settings-toggle');
    await toggle.click();
    if ((await toggle.getAttribute('aria-pressed')) !== 'false') throw new Error('HDR toggle should switch off when clicked.');
    if (await page.locator('.settings-apply').isDisabled()) throw new Error('Changing a toggle should enable Apply.');
    await page.waitForTimeout(150);
  }

  if (scenario.action === 'settings-disabled-state') {
    await page.locator('.settings-space__tabs').getByRole('button', { name: '图形', exact: true }).click();
    await page.locator('[data-setting-id="super-resolution"] .settings-select-value').click();
    await page.getByRole('option', { name: '关闭', exact: true }).click();
    const frameGeneration = page.locator('[data-setting-id="frame-generation"]');
    if (!(await frameGeneration.evaluate((node) => node.classList.contains('is-disabled')))) throw new Error('Frame generation should disable when super resolution is off.');
    if (!(await frameGeneration.locator('.settings-toggle').isDisabled())) throw new Error('Disabled frame generation toggle must be non-interactive.');
    await frameGeneration.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
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
