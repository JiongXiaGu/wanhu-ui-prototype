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
  { file: '12j-settings-restored.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-restore-defaults' },
  { file: '12k-settings-safe-confirmation.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-safe-confirmation' },
  { file: '12l-settings-safe-rollback.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-safe-rollback' },
  { file: '12m-settings-safe-kept.png', review: 'settings', waitFor: '.settings-panel--menu', action: 'settings-safe-keep' },
  { file: '13-pause-save.png', review: 'pause-save', waitFor: '.save-game-space' },
  { file: '13a-pause-save-group-rename.png', review: 'pause-save', waitFor: '.save-game-space', action: 'save-group-rename' },
  { file: '14-pause-settings.png', review: 'pause-settings', waitFor: '.settings-panel--pause' },
  { file: '15-menu-load.png', review: 'load', waitFor: '.archive-space--load' },
  { file: '15a-menu-load-actions.png', review: 'load', waitFor: '.archive-space--load', action: 'archive-save-actions' },
  { file: '15b-menu-load-rename.png', review: 'load', waitFor: '.archive-space--load', action: 'archive-save-rename' },
  { file: '15c-menu-load-delete.png', review: 'load', waitFor: '.archive-space--load', action: 'archive-save-delete' },
  { file: '15d-menu-load-quick-filter.png', review: 'load', waitFor: '.archive-space--load', action: 'archive-filter-quick' },
  { file: '15e-menu-load-hide-outdated.png', review: 'load', waitFor: '.archive-space--load', action: 'archive-hide-outdated' },
  { file: '15f-menu-load-scroll-density.png', review: 'load', waitFor: '.archive-space--load', action: 'archive-scroll-density' },
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

  const simpleSettingsActions = ['settings-显示', 'settings-图形', 'settings-音频', 'settings-操作', 'settings-游戏'];
  if (scenario.action && simpleSettingsActions.includes(scenario.action)) {
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
    const slider = page.locator('[data-setting-id="safe-area"] .settings-slider');
    const box = await slider.boundingBox();
    if (!box) throw new Error('Safe area slider was not measurable.');
    await page.mouse.move(box.x + box.width * 0.95, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    const value = Number(await slider.getAttribute('aria-valuenow'));
    if (value >= 100) throw new Error('Dragging the safe area slider should lower its value.');
    if (await page.locator('.settings-safe-layer').count()) throw new Error('Normal sliders should save immediately without safe display confirmation.');
    await page.waitForTimeout(150);
  }

  if (scenario.action === 'settings-toggle-change') {
    const toggle = page.locator('[data-setting-id="v-sync"] .settings-toggle');
    await toggle.click();
    if ((await toggle.getAttribute('aria-pressed')) !== 'false') throw new Error('V-Sync toggle should switch off when clicked.');
    if (await page.locator('.settings-safe-layer').count()) throw new Error('Normal toggles should save immediately without safe display confirmation.');
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

  if (scenario.action === 'settings-restore-defaults') {
    const toggle = page.locator('[data-setting-id="v-sync"] .settings-toggle');
    await toggle.click();
    if ((await toggle.getAttribute('aria-pressed')) !== 'false') throw new Error('V-Sync should be changed before restore.');
    await page.getByRole('button', { name: '恢复当前分类默认值', exact: true }).click();
    if ((await toggle.getAttribute('aria-pressed')) !== 'true') throw new Error('Restore should return V-Sync to its default value.');
    if (await page.locator('.settings-safe-layer').count()) throw new Error('Restoring only normal changed values should not show safe confirmation.');
    await page.waitForTimeout(150);
  }

  if (scenario.action === 'settings-safe-confirmation') {
    await page.locator('[data-setting-id="ui-scale"] .settings-select-value').click();
    await page.getByRole('option', { name: '125%', exact: true }).click();
    await page.waitForSelector('.settings-safe-layer');
    const countdown = Number((await page.locator('.settings-safe-dialog__countdown').textContent())?.trim());
    if (!(countdown > 0 && countdown <= 15)) throw new Error('Safe confirmation should show a live countdown.');
  }

  if (scenario.action === 'settings-safe-rollback') {
    const resolution = page.locator('[data-setting-id="resolution"] .settings-select-value');
    await resolution.click();
    await page.getByRole('option', { name: '2560 × 1440', exact: true }).click();
    await page.waitForSelector('.settings-safe-layer');
    await page.keyboard.press('Escape');
    await page.waitForSelector('.settings-safe-layer', { state: 'detached' });
    if ((await resolution.textContent())?.includes('2560 × 1440')) throw new Error('Esc should roll back the temporary resolution change.');
    if (!(await resolution.textContent())?.includes('3840 × 2160')) throw new Error('Resolution should return to its previous safe value.');
  }

  if (scenario.action === 'settings-safe-keep') {
    const scale = page.locator('[data-setting-id="ui-scale"] .settings-select-value');
    await scale.click();
    await page.getByRole('option', { name: '125%', exact: true }).click();
    await page.waitForSelector('.settings-safe-layer');
    await page.getByRole('button', { name: /保留设置/ }).click();
    await page.waitForSelector('.settings-safe-layer', { state: 'detached' });
    if (!(await scale.textContent())?.includes('125%')) throw new Error('Keeping a safe display change should preserve the selected UI scale.');
  }

  if (scenario.action === 'save-group-rename') {
    await page.getByRole('button', { name: '更改存档组名称', exact: true }).click();
    const input = page.getByRole('textbox', { name: '更改存档组名称' });
    if ((await input.count()) !== 1) throw new Error('Save Space group rename should enter inline editing.');
    await input.fill('昭平城测试组');
    await page.keyboard.press('Enter');
    if ((await page.locator('.save-current-game h2').textContent())?.trim() !== '昭平城测试组') throw new Error('Save Space should commit the edited save-group name.');
  }

  if (scenario.action === 'archive-save-actions') {
    const card = page.locator('.archive-save-card').nth(1);
    await card.hover();
    await page.waitForTimeout(160);
    if ((await card.locator('.archive-save-card__actions button').count()) !== 3) throw new Error('Load save card should expose rename, load, and delete icon actions.');
  }

  if (scenario.action === 'archive-save-rename') {
    const card = page.locator('.archive-save-card').nth(1);
    await card.hover();
    await card.getByRole('button', { name: /^重命名 / }).click();
    if ((await card.getByRole('textbox', { name: '重命名存档' }).count()) !== 1) throw new Error('Rename icon should enter inline save-name editing.');
    await page.waitForTimeout(160);
  }

  if (scenario.action === 'archive-save-delete') {
    const card = page.locator('.archive-save-card').nth(1);
    await card.hover();
    await card.getByRole('button', { name: /^删除 / }).click();
    if ((await card.locator('.archive-save-card__confirm').count()) !== 1) throw new Error('Delete icon should open local save deletion confirmation.');
    await page.waitForTimeout(160);
  }

  if (scenario.action === 'archive-filter-quick') {
    await page.locator('.archive-save-type-tabs').getByRole('button', { name: '快速存档', exact: true }).click();
    await page.waitForTimeout(160);
    const cards = page.locator('.archive-save-card');
    if ((await cards.count()) < 2) throw new Error('Quick-save filter should still leave multiple saves for density testing.');
    const kinds = await cards.evaluateAll((items) => items.map((item) => item.getAttribute('data-save-kind')));
    if (kinds.some((kind) => kind !== 'quick')) throw new Error('Quick-save filter must only show quick saves.');
  }

  if (scenario.action === 'archive-hide-outdated') {
    const oldBefore = await page.locator('.archive-save-card[data-compatibility="outdated"], .archive-save-card[data-compatibility="incompatible"]').count();
    if (oldBefore === 0) throw new Error('Archive review data should contain outdated saves before toggling the filter.');
    const toggle = page.getByRole('switch', { name: '隐藏过时存档' });
    if ((await toggle.getAttribute('aria-checked')) !== 'false') throw new Error('Hide outdated saves must be off by default.');
    await toggle.click();
    await page.waitForTimeout(160);
    if ((await toggle.getAttribute('aria-checked')) !== 'true') throw new Error('Hide outdated saves toggle should turn on.');
    const oldAfter = await page.locator('.archive-save-card[data-compatibility="outdated"], .archive-save-card[data-compatibility="incompatible"]').count();
    if (oldAfter !== 0) throw new Error('Hide outdated saves should remove old and incompatible saves from the visible list.');
  }

  if (scenario.action === 'archive-scroll-density') {
    const groupList = page.locator('.archive-group-list');
    const saveList = page.locator('.archive-save-list');
    if ((await page.locator('.archive-group-card').count()) < 10) throw new Error('Archive review must include at least 10 save groups.');
    if ((await page.locator('.archive-save-card').count()) < 20) throw new Error('Archive review must include at least 20 saves in the current group.');
    await groupList.hover();
    await page.mouse.wheel(0, 720);
    await page.waitForTimeout(120);
    const groupScrollTop = await groupList.evaluate((node) => node.scrollTop);
    if (groupScrollTop <= 0) throw new Error('Game-group list must be independently scrollable.');
    await saveList.hover();
    await page.mouse.wheel(0, 960);
    await page.waitForTimeout(120);
    const saveScrollTop = await saveList.evaluate((node) => node.scrollTop);
    if (saveScrollTop <= 0) throw new Error('Save-card list must be independently scrollable.');
  }

  if (scenario.review === 'settings' || scenario.review === 'pause-settings') {
    if (await page.locator('.settings-space__header .global-space-back').count()) throw new Error('Settings Header should not contain Back; page navigation belongs in the footer action bar.');
    const restore = page.locator('.settings-space__footer .settings-restore');
    const back = page.locator('.settings-space__footer .settings-footer-back');
    if ((await back.count()) !== 1 || (await restore.count()) !== 1) throw new Error('Settings footer must contain Restore and Back actions.');
    const restoreBox = await restore.boundingBox();
    const backBox = await back.boundingBox();
    if (!restoreBox || !backBox || restoreBox.x >= backBox.x) throw new Error('Settings Restore must stay on the left and Back on the far right.');
    if (await page.getByRole('button', { name: '取消', exact: true }).count()) throw new Error('Settings should not expose a persistent Cancel button.');
    if (await page.getByRole('button', { name: '应用', exact: true }).count()) throw new Error('Settings should not expose a persistent Apply button.');
  }

  if (scenario.review === 'pause-save') {
    if ((await page.locator('.save-game-space').count()) !== 1) throw new Error('Pause save flow should use the dedicated SaveGameSpace.');
    if (await page.locator('.archive-groups').count()) throw new Error('Save Space must not expose Load Space game-group browser UI.');
    if ((await page.getByRole('button', { name: '更改存档组名称', exact: true }).count()) !== 1) throw new Error('Save Space footer should expose the save-group rename action on the left.');
    if ((await page.getByRole('button', { name: '返回', exact: true }).count()) !== 1) throw new Error('Save Space footer should expose Back on the right.');
  }

  if (scenario.review === 'load') {
    if (await page.locator('.archive-preview').count()) throw new Error('Load Archive should not restore the old fixed Preview column.');
    if ((await page.locator('.archive-space__footer-left .archive-footer-action').count()) < 2) throw new Error('Load footer should expose group rename and delete management actions on the left.');
    const back = page.locator('.archive-space__footer-right .archive-footer-back');
    if ((await back.count()) !== 1) throw new Error('Load footer should expose Back on the right.');
    if ((await page.locator('.archive-save-type-tabs button').count()) !== 4) throw new Error('Load Archive should expose exactly four save-type filters.');
    if ((await page.getByRole('switch', { name: '隐藏过时存档' }).count()) !== 1) throw new Error('Load Archive should expose the hide-outdated toggle.');
    if (await page.getByText('排序', { exact: true }).count()) throw new Error('Load Archive should not expose manual sorting controls.');
    if (await page.getByPlaceholder(/搜索/).count()) throw new Error('Load Archive should not expose search controls.');
    if (!scenario.action) {
      const firstName = await page.locator('.archive-save-card__title-row b').first().textContent();
      if (firstName?.trim() !== '自动存档.001') throw new Error('Latest save should be first in the default ordering.');
    }
    if ((await page.locator('.archive-save-card__status').first().count()) !== 1) throw new Error('Save card should expose type/version status in its top-right corner.');
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
