import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'review-screenshots';
const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
await mkdir(out, { recursive: true });
const report = { checks: [], screenshots: [], errors: [] };
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(15000);
page.on('pageerror', error => report.errors.push(error.message));
async function settle() { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(340); }
async function open(review, selector) {
  const url = new URL(baseUrl); url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(selector); await settle();
}
async function shot(name) { await page.mouse.move(20, 200); await page.screenshot({ path: `${out}/usability-${name}.png` }); report.screenshots.push(name); }
async function placementShot(name) { await page.mouse.move(20, 200); await page.screenshot({ path: `${out}/${name}.png` }); report.screenshots.push(name); }
async function operationHintsShot(name) { await page.mouse.move(20, 200); await page.screenshot({ path: `${out}/operation-hints-${name}.png` }); report.screenshots.push('operation-hints-' + name); }
async function secondaryActionShot(name) { await page.mouse.move(20, 200); await page.screenshot({ path: `${out}/secondary-action-${name}.png` }); report.screenshots.push('secondary-action-' + name); }
async function mainDockShot(name) { await page.mouse.move(20, 200); await page.screenshot({ path: `${out}/main-dock-${name}.png` }); report.screenshots.push('main-dock-' + name); }
async function blueprintWorkspaceShot(name) { await page.screenshot({ path: `${out}/blueprint-workspace-${name}.png` }); report.screenshots.push('blueprint-workspace-' + name); }
async function workspacePagerShot(name) { await page.mouse.move(20, 200); await page.screenshot({ path: `${out}/workspace-pager-${name}.png` }); report.screenshots.push('workspace-pager-' + name); }
async function topControlTrayShot() { await page.mouse.move(20, 200); await page.screenshot({ path: `${out}/top-control-tray.png` }); report.screenshots.push('top-control-tray'); }
async function checkPersistentHints(label, expectedContext, utilityExpected = true) {
  const hints = page.locator('.gameplay-operation-hints');
  assert.equal(await hints.count(), 1, label + ': 非 Pause Gameplay 必须恰好存在一个 Operation Hints Host');
  assert.equal(await hints.getAttribute('data-hint-context'), expectedContext, label + ': Operation Hints Context Rebind 错误');
  const hintsBox = await hints.boundingBox();
  assert(hintsBox, label + ': Operation Hints 必须可测量');
  assert(Math.abs((hintsBox.x + hintsBox.width) - (1920 - 16)) < 1.5, label + ': Operation Hints 必须固定在 16px 右安全边');
  if (utilityExpected) {
    const utilityBox = await page.locator('.context-utility-toolbar').boundingBox();
    assert(utilityBox && overlap(hintsBox, utilityBox) < 1, label + ': Operation Hints 不得覆盖 Context Utility');
    const gap = utilityBox.y - (hintsBox.y + hintsBox.height);
    assert(gap >= 11 && gap <= 13, label + ': Operation Hints 与 Utility 应保持约 12px 间距');
  }
  report.checks.push({ label: label + '/operation-hints', expectedContext, hintsBox });
}
async function checkTopControlTray() {
  const tray = page.locator('.gameplay-top-navigation');
  const [trayBox, display, sceneButtons, managementButtons, viewButtons] = await Promise.all([
    tray.boundingBox(),
    tray.evaluate((node) => getComputedStyle(node).display),
    tray.locator('.gameplay-top-navigation__scene .gameplay-top-navigation__button').count(),
    tray.locator('.gameplay-top-navigation__management .gameplay-top-navigation__button').count(),
    tray.locator('.gameplay-top-navigation__view .gameplay-top-navigation__button').count(),
  ]);
  assert(trayBox, 'Top Control Tray 必须可测量');
  assert(Math.abs(trayBox.width - 400) < 1 && Math.abs(trayBox.height - 38) < 1, 'Top Control Tray 必须保持 400×38');
  assert.equal(display, 'grid', 'Top Control Tray 必须保持单行 Grid，而不是退化为 Block');
  assert.equal(sceneButtons, 2, 'Top Control Tray Scene Group 必须有 2 个按钮');
  assert.equal(managementButtons, 5, 'Top Control Tray Management Group 必须有 5 个按钮');
  assert.equal(viewButtons, 1, 'Top Control Tray View Group 必须有 1 个按钮');

  const buttonMetrics = await tray.locator('.gameplay-top-navigation__button').evaluateAll((buttons) => buttons.map((button) => {
    const style = getComputedStyle(button);
    const icon = button.querySelector('.ui-icon')?.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      borderTopWidth: style.borderTopWidth,
      backgroundColor: style.backgroundColor,
      iconWidth: icon?.width,
    };
  }));
  assert.equal(buttonMetrics.length, 8, 'Top Control Tray 必须一共显示 8 个导航按钮');
  assert(buttonMetrics.every(item => item.borderTopWidth === '0px'), 'Top Control Tray Button 不得恢复浏览器默认边框');
  assert(buttonMetrics.every(item => item.backgroundColor === 'rgba(0, 0, 0, 0)' || item.backgroundColor === 'transparent'), 'Top Control Tray 默认按钮背景必须透明');
  assert(buttonMetrics.every(item => Math.abs(item.iconWidth - 18) < 1), 'Top Control Tray 图标必须保持 18px');
  const rowTop = Math.min(...buttonMetrics.map(item => item.y));
  const rowBottom = Math.max(...buttonMetrics.map(item => item.y));
  assert(rowBottom - rowTop < 11, 'Top Control Tray 按钮必须保持同一横向行，不得退化成 2 / 5 / 1 三行');

  report.checks.push({ label: 'Top Control Tray Geometry', trayBox, display, sceneButtons, managementButtons, viewButtons, buttonMetrics });
}

async function checkMainDock(label, expectedMode, expectedCategoryCount) {
  const dock = page.locator('.main-dock');
  const dockBox = await dock.boundingBox();
  const viewport = page.viewportSize();
  assert(dockBox && viewport, label + ': Main Dock 必须可测量');
  assert(Math.abs(dockBox.width - 880) < 1, label + ': Main Dock 固定宽度必须为 880px');
  assert(Math.abs(dockBox.height - 84) < 1, label + ': Main Dock 必须保持 84px 高');
  assert(Math.abs((dockBox.y + dockBox.height) - (viewport.height - 16)) < 1.5, label + ': Main Dock 必须保持 16px 底部安全边');
  assert.equal(await dock.getAttribute('data-dock-mode'), expectedMode, label + ': Dock Mode 错误');

  const modeButtons = dock.locator('.main-dock__mode-button');
  assert.equal(await modeButtons.count(), 2, label + ': 设计 / 蓝图必须是两个稳定 Mode Button');
  const modeMetrics = await modeButtons.evaluateAll((buttons) => buttons.map((button) => {
    const icon = button.querySelector('.ui-icon')?.getBoundingClientRect();
    const text = button.querySelector('.main-dock__label')?.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      iconWidth: icon?.width,
      iconCenterY: icon ? icon.y + icon.height / 2 : null,
      textCenterY: text ? text.y + text.height / 2 : null,
      iconRight: icon?.right,
      textLeft: text?.left,
    };
  }));
  assert(modeMetrics.every(item =>
    Math.abs(item.width - 68) < 1
    && Math.abs(item.height - 30) < 1
    && Math.abs(item.iconWidth - 18) < 1
    && item.iconRight < item.textLeft
    && Math.abs(item.iconCenterY - item.textCenterY) < 1.5
  ), label + ': Mode Rail 必须上下两行，每行 68×30，18px 图标在左、11px 文字在右');

  const categories = dock.locator('.main-dock__category-button');
  assert.equal(await categories.count(), expectedCategoryCount, label + ': 分类数量错误');
  const categoryMetrics = await categories.evaluateAll((buttons) => buttons.map((button) => {
    const icon = button.querySelector('.ui-icon')?.getBoundingClientRect();
    const text = button.querySelector('.main-dock__label')?.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    const style = button.querySelector('.main-dock__label') ? getComputedStyle(button.querySelector('.main-dock__label')) : null;
    return { height: rect.height, iconWidth: icon?.width, iconBottom: icon?.bottom, textTop: text?.top, fontSize: style?.fontSize };
  }));
  assert(categoryMetrics.every(item => Math.abs(item.height - 64) < 1 && Math.abs(item.iconWidth - 24) < 1 && item.iconBottom < item.textTop && item.fontSize === '11px'), label + ': 分类必须为 64px 高、24px 图标在上、11px 文字在下');
  report.checks.push({ label: label + '/main-dock', dockBox, expectedMode, modeMetrics, categoryMetrics });
}
async function checkPlacementBottom(label) {
  const main = page.locator('.placement-main-action-bar');
  const utility = page.locator('.context-utility-toolbar.is-placement-stacked');
  const [mainBox, utilityBox] = await Promise.all([main.boundingBox(), utility.boundingBox()]);
  assert(mainBox && utilityBox, label + ': 缺少 Placement 底部菜单');
  assert(Math.abs(mainBox.height - 84) < 1, label + ': 中下主栏必须为 84px');
  assert(Math.abs(utilityBox.height - 84) < 1, label + ': 右下 Utility 必须为 84px');
  assert(Math.abs((mainBox.y + mainBox.height) - (utilityBox.y + utilityBox.height)) < 1, label + ': 中下与右下必须同底边');
  assert(overlap(mainBox, utilityBox) < 1, label + ': 中下与右下不得重叠');
  const rows = utility.locator('.context-utility-toolbar__row');
  assert.equal(await rows.count(), 2, label + ': Placement Utility 必须固定两行');
  assert.equal(await rows.nth(0).getAttribute('data-utility-row-role'), 'action', label + ': 第一行必须表达 Action');
  assert.equal(await rows.nth(1).getAttribute('data-utility-row-role'), 'support', label + ': 第二行必须表达 Support');
  const firstKinds = await rows.nth(0).getByRole('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('data-utility-kind')));
  assert(firstKinds.every(kind => kind === 'action'), label + ': 第一行只能出现 Primary Action');
  const secondMeta = await rows.nth(1).getByRole('button').evaluateAll(buttons => buttons.map(button => ({
    label: button.getAttribute('aria-label'), kind: button.getAttribute('data-utility-kind'),
    danger: button.getAttribute('data-utility-danger'), right: button.getBoundingClientRect().right,
  })));
  assert(secondMeta.every(item => item.kind === 'toggle' || item.kind === 'action' || item.kind === 'history'), label + ': 第二行只能出现 Toggle / Secondary Action / History / Danger');
  assert(secondMeta.length > firstKinds.length, label + ': 第二行可见图标数必须严格多于第一行');
  const secondRowBox = await rows.nth(1).boundingBox();
  const secondButtons = rows.nth(1).getByRole('button');
  const lastSecondButtonBox = await secondButtons.last().boundingBox();
  assert(secondRowBox && lastSecondButtonBox && Math.abs((lastSecondButtonBox.x + lastSecondButtonBox.width) - (secondRowBox.x + secondRowBox.width)) < 1.5, label + ': 第二行必须向右对齐');
  const supportGroups = rows.nth(1).locator(':scope > .context-utility-toolbar__group');
  const supportGroupCount = await supportGroups.count();
  const firstSupportGroupBox = supportGroupCount ? await supportGroups.first().boundingBox() : null;
  const lastSupportGroupBox = supportGroupCount ? await supportGroups.last().boundingBox() : null;
  assert(firstSupportGroupBox && lastSupportGroupBox, label + ': 第二行必须存在可见分组');
  const supportContentWidth = lastSupportGroupBox.x + lastSupportGroupBox.width - firstSupportGroupBox.x;
  const compactWidthDelta = Math.abs(utilityBox.width - (supportContentWidth + 12));
  assert(compactWidthDelta <= 3, label + ': Placement Utility 宽度必须由内容收缩，而不是固定宽度；delta=' + compactWidthDelta);
  const undoIndex = secondMeta.findIndex(item => item.label === '撤销 · Ctrl+Z');
  const redoIndex = secondMeta.findIndex(item => item.label === '重做 · Ctrl+Y');
  assert(undoIndex >= 0 && redoIndex === undoIndex + 1, label + ': Undo / Redo 必须固定相邻且在第二行');
  const danger = secondMeta.find(item => item.danger === 'true');
  if (danger) assert(secondMeta.every(item => item === danger || danger.right >= item.right - 1), label + ': Danger 必须位于第二行最右');
  const labels = await main.locator('.placement-action-bar__label').evaluateAll(elements => elements.map(element => ({ text: element.textContent, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth })));
  assert(labels.length > 0 && labels.every(row => row.scrollWidth <= row.clientWidth + 1), label + ': 中下中文标签不得截断');
  report.checks.push({ label, mainBox, utilityBox, firstKinds, secondMeta, labels });
}
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
async function checkSecondaryActionBar(label, selector = '.secondary-action-bar') {
  const bar = page.locator(selector).first();
  const barBox = await bar.boundingBox();
  const viewport = page.viewportSize();
  assert(barBox && viewport, label + ': Secondary Action Bar 必须可测量');
  assert(Math.abs(barBox.height - 84) < 1, label + ': 所有二级中下菜单必须统一为 84px 高');
  assert(Math.abs((barBox.y + barBox.height) - (viewport.height - 16)) < 1.5, label + ': Secondary Action Bar 必须保持 16px 底部安全边');

  const buttons = bar.locator('.placement-action-bar__button--labeled');
  const count = await buttons.count();
  assert(count >= 1, label + ': Secondary Action Bar 必须提供可见文字标签');
  const metrics = await buttons.evaluateAll((elements) => elements.map((element) => {
    const icon = element.querySelector('.ui-icon');
    const label = element.querySelector('.placement-action-bar__label');
    const buttonRect = element.getBoundingClientRect();
    const iconRect = icon?.getBoundingClientRect();
    const labelRect = label?.getBoundingClientRect();
    const labelStyle = label ? getComputedStyle(label) : null;
    return {
      aria: element.getAttribute('aria-label'),
      button: { width: buttonRect.width, height: buttonRect.height },
      icon: iconRect ? { x: iconRect.x, y: iconRect.y, width: iconRect.width, height: iconRect.height, bottom: iconRect.bottom } : null,
      label: labelRect ? { x: labelRect.x, y: labelRect.y, width: labelRect.width, height: labelRect.height, top: labelRect.top, scrollWidth: label.scrollWidth, clientWidth: label.clientWidth } : null,
      labelFontSize: labelStyle?.fontSize ?? '',
    };
  }));
  for (const item of metrics) {
    assert(item.icon && item.label, label + ': 每个可见按钮必须同时有图标和文字');
    assert(Math.abs(item.button.height - 64) < 1, label + ': 二级按钮内部高度必须为 64px');
    assert(Math.abs(item.button.width - 76) < 1, label + ': 带文字二级按钮宽度必须为 76px');
    assert(Math.abs(item.icon.width - 24) < 1 && Math.abs(item.icon.height - 24) < 1, label + ': 图标必须使用 24px 主视觉尺寸');
    assert(item.icon.bottom < item.label.top, label + ': 图标必须在文字上方');
    const iconCenter = item.icon.x + item.icon.width / 2;
    const labelCenter = item.label.x + item.label.width / 2;
    assert(Math.abs(iconCenter - labelCenter) < 1.5, label + ': 图标与文字必须垂直居中对齐');
    assert(item.label.scrollWidth <= item.label.clientWidth + 1, label + ': 二级菜单文字不得截断');
    assert(item.labelFontSize === '11px', label + ': 二级菜单文字必须为 11px 次层级');
  }
  report.checks.push({ label: label + '/secondary-action-bar', barBox, metrics });
}
async function checkToolLayout(label) {
  const bar = await page.locator('.tool-action-bar').boundingBox();
  const panel = await page.locator('.gameplay-left-context-surface').boundingBox();
  const utility = await page.locator('.context-utility-toolbar').boundingBox();
  assert(bar && panel && utility, label + ': 缺少工具槽位');
  assert(overlap(bar, panel) < 1 && overlap(bar, utility) < 1, label + ': 工具条不得遮挡参数或辅助操作');
  const labels = await page.locator('.placement-action-bar__label').evaluateAll(elements => elements.map(element => ({ text: element.textContent, width: element.getBoundingClientRect().width, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth })));
  assert(labels.length > 1 && labels.every(row => row.scrollWidth <= row.clientWidth + 1), label + ': 短标签不得截断');
  report.checks.push({ label, bar, labels });
}
async function checkHoverCard(label, anchor) {
  await page.waitForSelector('.ui-hover-card[data-ready="true"]'); await settle();
  const surface = page.locator('.ui-hover-card');
  const [popup, anchorBox, workspace] = await Promise.all([
    surface.boundingBox(),
    anchor.boundingBox(),
    page.locator('.workspace--catalog').boundingBox(),
  ]);
  const viewport = page.viewportSize();
  const placement = await surface.getAttribute('data-placement');
  assert(popup && anchorBox && workspace && viewport);
  assert.equal(placement, 'top', label + ': Catalog Workspace Rich Hover 必须固定在 Card 上方');
  assert(overlap(popup, anchorBox) < 1, label + ': Rich Hover 不得遮挡当前 Anchor');
  assert(popup.x >= 0 && popup.y >= 0 && popup.x + popup.width <= viewport.width + 1 && popup.y + popup.height <= viewport.height + 1, label + ': 浮层超出屏幕');
  if (placement === 'right') assert(popup.x >= anchorBox.x + anchorBox.width - 1, label + ': right 必须位于 Anchor 右侧');
  if (placement === 'left') assert(popup.x + popup.width <= anchorBox.x + 1, label + ': left 必须位于 Anchor 左侧');
  if (placement === 'top') assert(popup.y + popup.height <= anchorBox.y + 1, label + ': top 必须位于 Anchor 上方');
  if (placement === 'bottom') assert(popup.y >= anchorBox.y + anchorBox.height - 1, label + ': bottom 必须位于 Anchor 下方');
  report.checks.push({ label, placement, popup, anchor: anchorBox, workspace, overlapsWorkspace: overlap(popup, workspace) > 0 });
}
async function checkSettings(label) {
  const geometry = await page.locator('.settings-space__content').evaluate(root => {
    const canvas = root.closest('.game-canvas');
    const scale = canvas.getBoundingClientRect().width / canvas.clientWidth;
    const rows = [...root.querySelectorAll('.settings-row')].flatMap(element => {
      const label = element.querySelector('.settings-row__label');
      const control = element.querySelector('.settings-row__control');
      if (!label || !control) return [];
      const a = label.getBoundingClientRect(), b = control.getBoundingClientRect();
      return [{ text: label.textContent.trim(), gap: (b.left - a.right) / scale, left: b.left / scale, width: b.width / scale }];
    });
    return { contentWidth: root.clientWidth, rows };
  });
  assert.equal(geometry.contentWidth, 820, label + ': 旧几何覆盖不能恢复 1100px 宽度');
  assert(geometry.rows.length > 0, label + ': 缺少设置行');
  assert(geometry.rows.every(row => Math.abs(row.gap - 40) < 1 && Math.abs(row.width - 380) < 1 && Math.abs(row.left - geometry.rows[0].left) < 1), label + ': 控件列几何不一致');
  report.checks.push({ label, ...geometry });
}
async function checkSelectEscape(label, focusOption) {
  const trigger = page.locator('.settings-select-control .ui-select__trigger').first();
  const previous = await trigger.textContent();
  await trigger.click();
  await page.waitForSelector('.ui-select__menu');
  if (focusOption) await page.locator('.ui-select__menu [role="option"]').first().focus();
  await page.keyboard.press('Escape'); await settle();
  assert.equal(await page.locator('.ui-select__menu').count(), 0, label + ': 下拉应关闭');
  assert.equal(await page.locator('.settings-space:visible').count(), 1, label + ': 不得同时关闭设置页');
  assert.equal(await trigger.textContent(), previous, label + ': 取消下拉不得修改设置');
  assert(await trigger.evaluate(element => element === document.activeElement), label + ': 焦点应返回触发按钮');
  report.checks.push({ label, focusOption });
}

try {
  await open('terrain-edit', '.terrain-edit-prototype');
  await checkPersistentHints('地形/抬高', 'terrain-raise');
  await checkSecondaryActionBar('地形编辑', '.terrain-edit-toolbar-cluster .secondary-action-bar');
  await operationHintsShot('terrain');
  await secondaryActionShot('terrain');
  const terrain = page.locator('.terrain-edit-toolbar-cluster');
  const firstWidth = (await terrain.boundingBox()).width;
  for (const name of ['抬高', '降低', '整平', '平滑', '坡面']) {
    await terrain.getByRole('button', { name, exact: true }).click(); await settle();
    await checkToolLayout('地形/' + name);
    assert.equal((await terrain.boundingBox()).width, firstWidth, '切换模式不能改变工具栏宽度');
    assert.equal(await terrain.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true');
    const expectedTerrainContext = ({ '抬高': 'terrain-raise', '降低': 'terrain-lower', '整平': 'terrain-flatten', '平滑': 'terrain-smooth', '坡面': 'terrain-slope' })[name];
    await checkPersistentHints('地形/' + name, expectedTerrainContext);
    await shot('terrain-' + name);
  }
  await terrain.getByRole('button', { name: '完成地形编辑', exact: true }).click();
  await page.waitForSelector('.terrain-edit-prototype', { state: 'detached' });
  report.checks.push({ label: '地形结束返回原空间' });

  await open('building-position', '.building-placement-toolbar-cluster');
  await checkToolLayout('建筑放置');
  await checkSecondaryActionBar('建筑放置', '.building-placement-toolbar-cluster .secondary-action-bar');
  await checkPlacementBottom('建筑放置');
  assert.equal(await page.locator('.building-placement-toolbar-cluster').getByRole('button', { name: '逆时针旋转', exact: true }).count(), 0, '建筑旋转不得继续留在中下主栏');
  const buildingRows = page.locator('.context-utility-toolbar[data-utility-context="building-placement"] .context-utility-toolbar__row');
  const buildingActionLabels = await buildingRows.nth(0).getByRole('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
  const buildingSupportLabels = await buildingRows.nth(1).getByRole('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
  assert.deepEqual(buildingActionLabels, ['逆时针旋转', '顺时针旋转', '镜像建筑']);
  assert.deepEqual(buildingSupportLabels, ['网格吸附', '网格显示', '对齐最近道路', '校准建筑基底', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']);
  assert(buildingSupportLabels.length > buildingActionLabels.length, '建筑 Placement 第二行图标必须严格多于第一行');
  await placementShot('placement-building-84');
  await placementShot('placement-building-utility-two-rows');
  await secondaryActionShot('building-placement');

  await open('road-smart', '.road-placement-toolbar-cluster');
  await checkToolLayout('道路放置');
  await checkSecondaryActionBar('道路放置', '.road-placement-toolbar-cluster .secondary-action-bar');
  await checkPlacementBottom('道路放置');
  assert.equal(await page.locator('.road-placement-toolbar-cluster').getByRole('button', { name: '反转道路方向', exact: true }).count(), 0, '道路反转不得继续留在中下主栏');
  await placementShot('placement-road-84');
  await secondaryActionShot('road');

  await open('tree-brush', '.tree-placement-prototype');
  await checkToolLayout('树木/刷子');
  await checkSecondaryActionBar('树木放置', '.tree-placement-toolbar-cluster .secondary-action-bar');
  await checkPersistentHints('树木/刷子', 'tree-brush');
  await checkPlacementBottom('树木/刷子');
  assert.equal(await page.getByRole('button', { name: '移动选中树木', exact: true }).count(), 0, '刷子模式不应强制展示单棵对象动作');
  await shot('tree-brush');
  await secondaryActionShot('tree');
  await page.locator('.tree-placement-toolbar-cluster').getByRole('button', { name: '单棵', exact: true }).click(); await settle();
  await checkToolLayout('树木/单棵');
  await checkPlacementBottom('树木/单棵');
  await checkPersistentHints('树木/单棵', 'tree-single');
  await operationHintsShot('tree-single');
  assert.equal(await page.getByRole('button', { name: '移动选中树木', exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: '删除选中树木', exact: true }).count(), 1);
  await placementShot('placement-tree-84');
  await shot('tree-single');
  await page.getByRole('button', { name: '删除选中树木', exact: true }).click(); await settle();
  assert.equal(await page.getByRole('button', { name: '移动选中树木', exact: true }).count(), 0, '删除单棵对象后 Action Group 应直接隐藏');
  assert.equal(await page.getByRole('button', { name: '删除选中树木', exact: true }).count(), 0, '无真实对象时 Danger Group 应直接隐藏');
  await shot('tree-empty-actions');

  await open('city-wall-construction', '.city-wall-construction-toolbar-cluster');
  await checkToolLayout('城墙主体/范围');
  await checkSecondaryActionBar('城墙主体', '.city-wall-construction-toolbar-cluster .secondary-action-bar');
  await checkPlacementBottom('城墙主体/范围');
  assert.equal(await page.getByRole('button', { name: '交换正反面', exact: true }).count(), 0, '范围模式没有正反面即时动作时不应伪造 Disabled Action');
  await page.locator('.city-wall-construction-toolbar-cluster').getByRole('button', { name: '定宽延伸', exact: true }).click(); await settle();
  assert.equal(await page.locator('.context-utility-toolbar__row').nth(0).getByRole('button', { name: '交换正反面', exact: true }).count(), 1);
  await checkPlacementBottom('城墙主体/定宽');
  await placementShot('placement-city-wall-84');
  await secondaryActionShot('city-wall');

  for (const [review, selector, label] of [
    ['city-wall-gate-free', '.city-wall-gate-toolbar-cluster', '城门/自由'],
    ['city-wall-gate-connected', '.city-wall-gate-toolbar-cluster', '城门/连接'],
    ['city-wall-access-stair', '.city-wall-access-stair-toolbar-cluster', '登城梯'],
    ['city-wall-transition-stair', '.city-wall-transition-stair-toolbar-cluster', '高差楼梯'],
  ]) {
    await open(review, selector);
    await checkToolLayout(label);
    await checkSecondaryActionBar(label, selector + ' .secondary-action-bar');
    await checkPlacementBottom(label);
  }

  await open('color-tool-surface', '.color-tool-surface-panel');
  await checkPersistentHints('配色/表面', 'color-surface');
  await checkSecondaryActionBar('配色工具', '.color-tool-toolbar-cluster .secondary-action-bar');
  await operationHintsShot('color-surface');
  await secondaryActionShot('color');

  await page.getByRole('button', { name: '打开材质方案库', exact: true }).click();
  await page.waitForSelector('.material-preset-workspace');
  await settle();
  const materialCards = page.locator('.material-preset-workspace__card-apply');
  assert(await materialCards.count() > 0, '材质方案 Workspace 必须存在可悬浮条目');
  const materialSourceBadges = page.locator('.material-preset-workspace .workspace-item-card__source.is-compact');
  assert(await materialSourceBadges.count() > 0, '材质方案 Card 来源必须复用共享 Compact Source Badge');
  await materialCards.first().hover(); await page.waitForTimeout(540);
  await checkHoverCard('材质方案锚定', materialCards.first());
  await page.screenshot({ path: `${out}/hover-material-preset-top.png` }); report.screenshots.push('hover-material-preset-top');
  await page.getByRole('button', { name: '关闭材质方案工作区', exact: true }).click();
  await page.waitForSelector('.material-preset-workspace', { state: 'detached' });

  const colorBar = page.locator('.color-tool-toolbar-cluster');
  for (const [name, mode] of [['表面模式', 'surface'], ['灯光模式', 'lighting'], ['方案模式', 'scheme']]) {
    await colorBar.getByRole('button', { name, exact: true }).click(); await settle();
    await checkToolLayout('配色/' + mode);
    await checkPersistentHints('配色/' + mode, 'color-' + mode);
    await shot('color-' + mode);
  }
  assert.equal(await colorBar.getByRole('button', { name: '取消配色', exact: true }).count(), 0, '不应展示并不存在的回退操作');
  await colorBar.getByRole('button', { name: '完成配色', exact: true }).click();
  await page.waitForSelector('.color-tool-toolbar-cluster', { state: 'detached' });
  report.checks.push({ label: '配色只有真实的结束动作，未新增提交/回退' });

  await open('workspace-building', '.workspace--catalog');
  await checkPersistentHints('建筑目录', 'workspace-building');
  await operationHintsShot('workspace-building');

  const designRailPagerMarks = page.locator('.workspace--design .workspace-rail-pager button span');
  const designContentPagerMarks = page.locator('.workspace--design .workspace-content-pager button span');
  assert(await designRailPagerMarks.count() > 1, '建筑 Workspace 必须提供多页 Rail 用于 Pager 一致性审查');
  assert(await designContentPagerMarks.count() > 1, '建筑 Workspace 必须提供多页 Content Pager 用于一致性审查');
  const designRailPagerMetrics = await designRailPagerMarks.evaluateAll((marks) => marks.map((mark) => {
    const rect = mark.getBoundingClientRect();
    const style = getComputedStyle(mark);
    const active = Boolean(mark.closest('button')?.classList.contains('is-active'));
    return { width: rect.width, height: rect.height, active, backgroundColor: style.backgroundColor, opacity: Number(style.opacity), borderRadius: style.borderRadius };
  }));
  const designContentPagerMetrics = await designContentPagerMarks.evaluateAll((marks) => marks.map((mark) => {
    const rect = mark.getBoundingClientRect();
    const style = getComputedStyle(mark);
    const active = Boolean(mark.closest('button')?.classList.contains('is-active'));
    return { width: rect.width, height: rect.height, active, backgroundColor: style.backgroundColor, opacity: Number(style.opacity), borderRadius: style.borderRadius };
  }));
  const designRailActive = designRailPagerMetrics.filter(item => item.active);
  const designRailInactive = designRailPagerMetrics.filter(item => !item.active);
  const designContentActive = designContentPagerMetrics.filter(item => item.active);
  const designContentInactive = designContentPagerMetrics.filter(item => !item.active);
  assert(designRailActive.length === 1 && designRailInactive.length >= 1, 'Design Rail Pager 必须同时存在当前页竖线与未选中圆点');
  assert(designRailActive.every(item => Math.abs(item.width - 3) < 1 && Math.abs(item.height - 14) < 1), 'Design Rail 当前页必须使用 3×14 竖线');
  assert(designRailInactive.every(item => Math.abs(item.width - 3) < 1 && Math.abs(item.height - 3) < 1), 'Design Rail 未选中页必须使用 3×3 圆点');
  assert(designContentActive.length === 1 && designContentInactive.length >= 1, 'Design Content Pager 必须同时存在当前页横线与未选中圆点');
  assert(designContentActive.every(item => Math.abs(item.width - 14) < 1 && Math.abs(item.height - 3) < 1), 'Design Content 当前页必须使用 14×3 横线');
  assert(designContentInactive.every(item => Math.abs(item.width - 3) < 1 && Math.abs(item.height - 3) < 1), 'Design Content 未选中页必须使用 3×3 圆点');
  assert([...designRailActive, ...designContentActive].every(item => item.backgroundColor === 'rgb(238, 233, 223)' && item.opacity > .8), 'Design 当前页 Pager 必须使用 Paper White 高亮');
  assert([...designRailInactive, ...designContentInactive].every(item => item.opacity < .5), 'Design 未选中页必须保持低对比圆点');
  report.checks.push({ label: 'Design Workspace oriented pagers', designRailPagerMetrics, designContentPagerMetrics });
  await workspacePagerShot('design');

  const cards = page.locator('.design-item-card');
  const count = await cards.count();
  assert(count >= 4, '建筑目录需要足够的条目用于多位置锚定检查');
  for (const index of [...new Set([0, Math.min(3, count - 1), Math.min(4, count - 1), count - 1])]) {
    await page.keyboard.press('Tab'); await cards.nth(index).focus();
    await checkHoverCard('建筑条目/' + index, cards.nth(index)); await shot('inspector-building-' + index);
  }
  await page.keyboard.press('Escape');
  await page.waitForSelector('.workspace--catalog', { state: 'detached' });
  assert.equal(await page.locator('.ui-hover-surface:visible').count(), 0, '关闭目录不能残留 Hover Surface');
  report.checks.push({ label: '关闭目录清理浮层' });

  await open('workspace-blueprint-all', '.workspace--blueprint');
  await checkPersistentHints('蓝图目录', 'workspace-blueprint-all');
  const blueprintWorkspace = page.locator('.workspace--blueprint');
  const blueprintFavoriteRail = blueprintWorkspace.locator('.blueprint-workspace__rail .workspace-primary-rail__favorite');
  assert.equal(await blueprintFavoriteRail.getByText('收藏', { exact: true }).count(), 1, '蓝图左 Rail 必须提供独立收藏快捷筛选');
  const blueprintRailLabels = await blueprintWorkspace.locator('.blueprint-workspace__rail .workspace-primary-rail__page>button').evaluateAll(buttons => buttons.map(button => button.textContent?.trim()));
  assert.deepEqual(blueprintRailLabels, ['全部', '小型', '中型', '大型'], '蓝图分类区继续固定为 全部 / 小型 / 中型 / 大型');
  const blueprintSourceLabels = await blueprintWorkspace.locator('.blueprint-workspace__source-filter .workspace-context-filter__scroll>button').evaluateAll(buttons => buttons.map(button => button.textContent?.trim()));
  assert.deepEqual(blueprintSourceLabels, ['全部', '系统内置', '创意工坊', '我的蓝图'], '蓝图顶部筛选必须按来源显示');
  const createBlueprintButton = blueprintWorkspace.getByRole('button', { name: '新建全部蓝图', exact: true });
  assert.equal(await createBlueprintButton.count(), 1, '蓝图来源栏右侧必须有独立“新建蓝图”动作');

  const blueprintSingleRailMark = blueprintWorkspace.locator('.workspace-rail-pager-marker');
  const blueprintContentPagerMarks = blueprintWorkspace.locator('.workspace-content-pager button span');
  assert.equal(await blueprintSingleRailMark.count(), 1, '蓝图单页 Rail 必须保留一个稳定 Pager Marker');
  assert(await blueprintContentPagerMarks.count() > 1, '全部蓝图必须有多页 Content Pager');
  const blueprintSingleRailMetric = await blueprintSingleRailMark.evaluate((mark) => {
    const rect = mark.getBoundingClientRect();
    const style = getComputedStyle(mark);
    return { width: rect.width, height: rect.height, backgroundColor: style.backgroundColor, opacity: Number(style.opacity) };
  });
  const blueprintContentPagerMetrics = await blueprintContentPagerMarks.evaluateAll((marks) => marks.map((mark) => {
    const rect = mark.getBoundingClientRect();
    const style = getComputedStyle(mark);
    const active = Boolean(mark.closest('button')?.classList.contains('is-active'));
    return { width: rect.width, height: rect.height, active, backgroundColor: style.backgroundColor, opacity: Number(style.opacity) };
  }));
  assert(Math.abs(blueprintSingleRailMetric.width - 3) < 1 && Math.abs(blueprintSingleRailMetric.height - 14) < 1, 'Blueprint 单页 Rail Marker 必须使用 3×14 Paper White 竖线');
  assert(blueprintSingleRailMetric.backgroundColor === 'rgb(238, 233, 223)' && blueprintSingleRailMetric.opacity > .7, 'Blueprint 单页 Rail Marker 必须作为当前页使用 Paper White');
  const blueprintContentActive = blueprintContentPagerMetrics.filter(item => item.active);
  const blueprintContentInactive = blueprintContentPagerMetrics.filter(item => !item.active);
  assert(blueprintContentActive.length === 1 && blueprintContentInactive.length >= 1, 'Blueprint Content Pager 必须同时存在当前页横线与未选中圆点');
  assert(blueprintContentActive.every(item => Math.abs(item.width - 14) < 1 && Math.abs(item.height - 3) < 1), 'Blueprint 当前 Content Page 必须使用 14×3 横线');
  assert(blueprintContentInactive.every(item => Math.abs(item.width - 3) < 1 && Math.abs(item.height - 3) < 1), 'Blueprint 未选中 Content Page 必须使用 3×3 圆点');
  assert(blueprintContentActive.every(item => item.backgroundColor === 'rgb(238, 233, 223)' && item.opacity > .8), 'Blueprint 当前 Content Page 必须使用 Paper White 高亮');
  assert(blueprintContentInactive.every(item => item.opacity < .5), 'Blueprint 未选中 Content Page 必须保持低对比圆点');
  report.checks.push({ label: 'Blueprint Workspace oriented pagers', blueprintSingleRailMetric, blueprintContentPagerMetrics });
  await workspacePagerShot('blueprint');

  const blueprintCards = blueprintWorkspace.locator('.blueprint-workspace__card');
  assert.equal(await blueprintCards.count(), 4, '蓝图第一页必须显示 4 张大图 Card');
  assert.equal(await blueprintWorkspace.locator('.blueprint-workspace__card-shell>.workspace-item-menu-trigger').count(), 4, '蓝图所有来源 Card 都必须常驻共享 ··· 操作入口');
  assert(await blueprintWorkspace.locator('.workspace-item-card__favorite-star').count() >= 1, '已收藏蓝图必须在名称后显示星标');
  const blueprintMetrics = await blueprintCards.evaluateAll((cards) => cards.map((card) => {
    const rect = card.getBoundingClientRect();
    const preview = card.querySelector('.blueprint-workspace__preview')?.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      previewWidth: preview?.width,
      previewHeight: preview?.height,
      backgroundImage: preview ? getComputedStyle(card.querySelector('.blueprint-workspace__preview')).backgroundImage : '',
    };
  }));
  assert(blueprintMetrics.every(item => Math.abs(item.width / item.height - 4 / 3) < .025), '蓝图 Card 必须保持 4:3 图片比例');
  assert(Math.max(...blueprintMetrics.map(item => item.y)) - Math.min(...blueprintMetrics.map(item => item.y)) < 1, '蓝图 4 张 Card 必须保持单行');
  const blueprintWorkspaceBox = await blueprintWorkspace.boundingBox();
  assert(blueprintWorkspaceBox && Math.abs(blueprintWorkspaceBox.height - 330) < 1, 'Blueprint Workspace 应为 4:3 Card 提供约 330px 高度');
  assert(blueprintMetrics.every(item => item.previewWidth >= item.width - 2 && item.previewHeight >= item.height - 2 && item.backgroundImage && item.backgroundImage !== 'none'), '蓝图 Preview 必须覆盖 Card 主体并绑定场景示例图');
  report.checks.push({ label: 'Blueprint Workspace 4×1 image cards', blueprintRailLabels, blueprintSourceLabels, blueprintMetrics });
  await blueprintWorkspaceShot('all');

  await blueprintFavoriteRail.click();
  await settle();
  assert.equal(await blueprintWorkspace.getAttribute('data-blueprint-favorite'), 'true', '蓝图收藏快捷筛选必须进入 Favorite 状态');
  assert((await blueprintWorkspace.locator('.blueprint-workspace__card').count()) > 0, '收藏筛选必须显示已收藏蓝图');
  await blueprintWorkspace.locator('.blueprint-workspace__rail').getByRole('button', { name: '全部', exact: true }).click();
  await settle();

  const firstBlueprintCard = blueprintCards.first();
  await firstBlueprintCard.hover();
  await page.waitForTimeout(540);
  await checkHoverCard('蓝图卡片', firstBlueprintCard);
  await blueprintWorkspaceShot('hover');
  await page.mouse.move(20, 200);
  await blueprintWorkspace.locator('.blueprint-workspace__rail').getByRole('button', { name: '小型', exact: true }).click();
  await settle();
  assert.equal(await blueprintWorkspace.getAttribute('data-blueprint-size'), 'small', '蓝图规模筛选必须绑定到 Workspace 状态');

  await blueprintWorkspace.getByRole('button', { name: '新建全部蓝图', exact: true }).click();
  await page.waitForSelector('.blueprint-photography[data-blueprint-photography="active"]');
  await page.waitForSelector('.workspace--blueprint', { state: 'detached' });
  await settle();

  const photographyFrame = page.locator('.blueprint-photography__frame');
  const photographyPanel = page.locator('.blueprint-photography-context-panel');
  const photographyToolbar = page.locator('.blueprint-photography-toolbar-cluster .secondary-action-bar');
  const [photographyBox, photographyPanelBox, photographyToolbarBox] = await Promise.all([
    photographyFrame.boundingBox(),
    photographyPanel.boundingBox(),
    photographyToolbar.boundingBox(),
  ]);
  assert(photographyBox && Math.abs(photographyBox.width / photographyBox.height - 4 / 3) < .02, '蓝图摄影取景框必须保持 4:3');
  assert(photographyBox.y >= 95 && (1080 - (photographyBox.y + photographyBox.height)) >= 115, '蓝图摄影取景框必须遵守 96px Top / 116px Bottom Safe Distance');
  assert(photographyBox.width <= 901, '1080p 蓝图摄影取景框最大宽度不得超过约 900px');
  assert(photographyPanelBox && Math.abs(photographyPanelBox.x - 16) < 1.5 && Math.abs(photographyPanelBox.width - 360) < 1.5, '蓝图摄影参数必须复用左侧 360px Context Panel');
  assert(photographyToolbarBox && Math.abs(photographyToolbarBox.height - 84) < 1.5 && Math.abs((photographyToolbarBox.x + photographyToolbarBox.width / 2) - 960) < 1.5, '蓝图摄影操作必须复用 84px 居中 Secondary Action Bar');
  assert.equal(await page.locator('.blueprint-photography__header, .blueprint-photography__footer').count(), 0, '蓝图摄影不得恢复私有上下菜单条');
  assert.equal(await page.locator('.gameplay-top-shell, .gameplay-compass-hud, .gameplay-system-menu-button, .context-utility-toolbar').count(), 0, '摄影 Tool 必须隐藏普通 Gameplay HUD / Compass / Utility');
  assert.equal(await page.locator('.blueprint-photography-context-panel .ui-parameter-row').count(), 3, '蓝图摄影左栏必须展示 FOV / 高度 / 俯角三个镜头参数');
  assert.equal(await page.locator('.blueprint-photography__grid').count(), 0, '构图线默认应关闭，保持预览干净');
  await checkPersistentHints('蓝图摄影', 'blueprint-photography', false);
  const photographyHintsBox = await page.locator('.gameplay-operation-hints').boundingBox();
  assert(photographyHintsBox && Math.abs((photographyHintsBox.y + photographyHintsBox.height) - (1080 - 16)) < 1.5, '蓝图摄影 Operation Hints 必须落在右下 16px Safe Edge');
  assert.equal(await page.locator('.workspace--blueprint').count(), 0, '进入摄影模式并完成退出 Motion 后 Blueprint Workspace 必须卸载');

  await page.screenshot({ path: `${out}/blueprint-workflow-photography.png` }); report.screenshots.push('blueprint-workflow-photography');

  await page.getByRole('button', { name: '显示构图线', exact: true }).click();
  assert.equal(await page.locator('.blueprint-photography__grid').count(), 1, '构图线 Quick Action 必须可切换');
  await page.getByRole('button', { name: '关闭构图线', exact: true }).click();
  await page.getByRole('button', { name: '完成摄影', exact: true }).click();
  await page.waitForSelector('.blueprint-editor[data-blueprint-editor="create"]');
  const createEditorSurface = page.locator('.blueprint-editor[data-blueprint-editor="create"]');
  assert(await createEditorSurface.evaluate(node => node.classList.contains('ui-modal-surface')), '蓝图编辑窗口必须复用共享 ui-modal-surface 材质');
  const editorPreview = page.locator('.blueprint-editor__preview');
  const editorPreviewBox = await editorPreview.boundingBox();
  assert(editorPreviewBox && Math.abs(editorPreviewBox.width / editorPreviewBox.height - 4 / 3) < .02, '蓝图编辑窗口必须保留摄影所得 4:3 Preview');
  const rephotoButton = createEditorSurface.getByRole('button', { name: '重新拍摄', exact: true });
  const rephotoBox = await rephotoButton.boundingBox();
  assert(
    editorPreviewBox && rephotoBox
      && rephotoBox.x >= editorPreviewBox.x
      && rephotoBox.y >= editorPreviewBox.y
      && Math.abs((editorPreviewBox.x + editorPreviewBox.width) - (rephotoBox.x + rephotoBox.width) - 9) < 2
      && Math.abs((editorPreviewBox.y + editorPreviewBox.height) - (rephotoBox.y + rephotoBox.height) - 8) < 2,
    '重新拍摄必须固定在蓝图预览图内部右下角',
  );
  await page.screenshot({ path: `${out}/blueprint-workflow-editor.png` }); report.screenshots.push('blueprint-workflow-editor');

  const createBlueprintEditor = page.locator('.blueprint-editor[data-blueprint-editor="create"]');
  const blueprintNameInput = createBlueprintEditor.getByRole('textbox', { name: '蓝图名称' });
  await blueprintNameInput.fill('测试摄影蓝图');
  await createBlueprintEditor.getByRole('button', { name: '商业', exact: true }).click();
  await createBlueprintEditor.getByRole('button', { name: '保存蓝图', exact: true }).click();
  await page.waitForSelector('.blueprint-editor', { state: 'detached' });
  await page.waitForSelector('.workspace--blueprint');
  const returnedBlueprintWorkspace = page.locator('.workspace--blueprint');
  await returnedBlueprintWorkspace.locator('.workspace-context-filter__scroll').getByRole('button', { name: '我的蓝图', exact: true }).click();
  await settle();
  const createdBlueprintCard = returnedBlueprintWorkspace.locator('[data-blueprint-id^="bp-user-"]').filter({ hasText: '测试摄影蓝图' });
  assert.equal(await createdBlueprintCard.count(), 1, '摄影完成并保存后，新蓝图必须进入“我的蓝图”');

  const createdShell = createdBlueprintCard.locator('..');
  const createdMenuTrigger = createdShell.getByRole('button', { name: '蓝图操作 测试摄影蓝图', exact: true });
  assert(await createdMenuTrigger.evaluate(node => node.classList.contains('workspace-item-menu-trigger') && node.classList.contains('is-media')), '我的蓝图管理入口必须复用共享 Media Menu Trigger');
  const createdSourceBadge = createdShell.locator('.workspace-item-card__source.is-media.is-user');
  assert.equal(await createdSourceBadge.count(), 1, '我的蓝图来源 Badge 必须位于共享 Media Source 槽位');
  const [createdCardBox, createdSourceBox, createdTriggerBox] = await Promise.all([
    createdBlueprintCard.boundingBox(),
    createdSourceBadge.boundingBox(),
    createdMenuTrigger.boundingBox(),
  ]);
  assert(
    createdCardBox && createdSourceBox && createdTriggerBox
      && createdSourceBox.x < createdTriggerBox.x
      && createdSourceBox.x - createdCardBox.x < 16
      && (createdCardBox.x + createdCardBox.width) - (createdTriggerBox.x + createdTriggerBox.width) < 16,
    'Media Card 必须保持左上来源、右上管理入口的四角职责',
  );
  await createdMenuTrigger.click();
  assert.equal(await createdShell.getByRole('menu').count(), 1, '我的蓝图 Card 必须提供管理 Popover');
  assert.deepEqual(
    await createdShell.getByRole('menuitem').evaluateAll(items => items.map(item => item.textContent?.trim())),
    ['收藏', '编辑', '删除'],
    '我的蓝图操作菜单必须包含共享收藏 + 编辑 / 删除',
  );
  await page.screenshot({ path: `${out}/blueprint-workflow-manage.png` }); report.screenshots.push('blueprint-workflow-manage');

  await createdShell.getByRole('menuitem', { name: '编辑', exact: true }).click();
  await page.waitForSelector('.blueprint-editor[data-blueprint-editor="edit"]');
  await page.getByRole('textbox', { name: '蓝图名称' }).fill('测试摄影蓝图·改');
  await page.getByRole('button', { name: '保存修改', exact: true }).click();
  await page.waitForSelector('.blueprint-editor', { state: 'detached' });
  assert.equal(await page.getByText('测试摄影蓝图·改', { exact: true }).count(), 1, '编辑保存后必须更新我的蓝图 Card 名称');

  const renamedShell = page.locator('.blueprint-workspace__card-shell').filter({ hasText: '测试摄影蓝图·改' });
  await renamedShell.getByRole('button', { name: '蓝图操作 测试摄影蓝图·改', exact: true }).click();
  await renamedShell.getByRole('menuitem', { name: '删除', exact: true }).click();
  await page.waitForSelector('.ui-dialog');
  assert((await page.locator('.ui-dialog').textContent())?.includes('已经放置在城市中的内容不会受到影响'), '删除蓝图确认必须说明不会反向删除城市内容');
  await page.locator('.ui-dialog').getByRole('button', { name: '删除', exact: true }).click();
  await page.waitForSelector('.ui-dialog', { state: 'detached' });
  assert.equal(await page.getByText('测试摄影蓝图·改', { exact: true }).count(), 0, '确认删除后玩家蓝图 Card 必须移除');

  report.checks.push({ label: 'Blueprint create → photography → editor → manage workflow' });

  await open('workspace-city-wall', '.workspace--catalog');
  const wallCards = page.locator('.design-item-card');
  assert(await wallCards.count());
  await wallCards.first().hover(); await page.waitForTimeout(540);
  await checkHoverCard('城墙悬停', wallCards.first());
  const before = await page.locator('.ui-hover-card').boundingBox();
  await wallCards.first().hover({ position: { x: 15, y: 15 } }); await page.waitForTimeout(80);
  const after = await page.locator('.ui-hover-card').boundingBox();
  assert(before && after && Math.abs(before.x - after.x) < 1 && Math.abs(before.y - after.y) < 1, '浮层不能随同一条目内鼠标移动');
  await page.screenshot({ path: `${out}/hover-design-workspace-top.png` }); report.screenshots.push('hover-design-workspace-top');

  await open('settings', '.settings-space');
  await checkSettings('菜单设置/显示'); await shot('settings-display');
  const firstSelect = page.locator('.settings-select-control .ui-select__trigger').first();
  await firstSelect.click(); await page.waitForSelector('.ui-select__menu'); await shot('settings-select-open');
  await firstSelect.click();
  await checkSelectEscape('Trigger Esc 只关闭下拉', false);
  await checkSelectEscape('Option Esc 只关闭下拉并返回焦点', true);
  for (const tab of ['图形', '音频', '操作', '游戏']) {
    await page.locator('.settings-space__tabs').getByRole('button', { name: tab, exact: true }).click(); await settle();
    await checkSettings('菜单设置/' + tab); await shot('settings-' + tab);
  }
  await page.locator('.settings-space__tabs').getByRole('button', { name: '音频', exact: true }).click(); await settle();
  await page.locator('.settings-row--slider .ui-numeric-slider-field .ui-value-button').first().click();
  await page.waitForSelector('.ui-dialog'); await shot('settings-number-dialog');
  await page.keyboard.press('Escape'); await page.waitForSelector('.ui-dialog', { state: 'detached' });
  await page.locator('.settings-space__tabs').getByRole('button', { name: '操作', exact: true }).click(); await settle();
  const bindingHeader = page.locator('.settings-binding-group__header').first();
  await bindingHeader.scrollIntoViewIfNeeded();
  if (!(await page.locator('.settings-binding-control:visible').count())) await bindingHeader.click();
  await page.locator('.settings-binding-control').first().scrollIntoViewIfNeeded(); await settle();
  const binding = await page.locator('.settings-binding-control:visible').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width));
  assert(binding.length && binding.every(width => width >= 170), '键位表保留自己的字段尺寸');
  report.checks.push({ label: '键位绑定字段未被普通表单压缩', widths: binding }); await shot('settings-bindings');
  await open('pause-settings', '.settings-space'); await checkSettings('暂停设置/显示');
  await checkSelectEscape('暂停设置中的 Esc 只关闭下拉', true); await shot('pause-settings');

  for (const [width, height] of [[2560, 1440], [3840, 2160]]) {
    await page.setViewportSize({ width, height });
    await open('workspace-building', '.workspace--catalog');
    const scaledCard = page.locator('.design-item-card').last(); await scaledCard.focus(); await checkHoverCard('缩放/' + height, scaledCard); await shot('inspector-' + height);
    await open('terrain-edit', '.terrain-edit-prototype'); await checkToolLayout('缩放地形/' + height); await shot('terrain-' + height);
    await open('settings', '.settings-space'); await checkSettings('缩放设置/' + height); await shot('settings-' + height);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open('weather', '.gameplay-context-panel--weather');
  await checkPersistentHints('环境控制', 'context-weather');
  await operationHintsShot('weather');
  await page.getByRole('button', { name: '场景模拟', exact: true }).click();
  const time = page.getByRole('slider', { name: '日内时间', exact: true });
  await time.focus(); await time.press('End'); await page.waitForSelector('.gameplay-screen[data-time-of-day="night"]');
  await page.keyboard.press('Escape'); await page.waitForSelector('.gameplay-left-context-surface', { state: 'detached' });
  await page.getByRole('button', { name: '建筑', exact: true }).click(); await page.waitForSelector('.workspace--catalog');
  const nightCard = page.locator('.design-item-card').first(); await nightCard.focus(); await checkHoverCard('夜景目录', nightCard); await shot('inspector-night');

  await open('management-finance', '.management-space--finance');
  await checkPersistentHints('城市财政', 'management-finance', false);
  const [managementHintsBox, managementPanelBox] = await Promise.all([
    page.locator('.gameplay-operation-hints').boundingBox(),
    page.locator('.management-space__panel').boundingBox(),
  ]);
  assert(managementHintsBox && managementPanelBox && overlap(managementHintsBox, managementPanelBox) < 1, 'Management Operation Hints 必须放在 Blocking Panel 外侧');
  await operationHintsShot('management-finance');

  await open('gameplay', '.gameplay-top-resource-shortcut');
  await checkPersistentHints('普通 Gameplay', 'world');
  await checkTopControlTray();
  await topControlTrayShot();
  await checkMainDock('Main Dock/设计', 'design', 8);
  await mainDockShot('design');
  const mainDockSwitch = page.locator('.main-dock');
  await mainDockSwitch.getByRole('button', { name: '蓝图', exact: true }).click(); await settle();
  await checkMainDock('Main Dock/蓝图', 'blueprint', 9);
  await mainDockShot('blueprint');
  await mainDockSwitch.getByRole('button', { name: '设计', exact: true }).click(); await settle();
  await checkMainDock('Main Dock/返回设计', 'design', 8);
  const metric = page.locator('.gameplay-top-resource-shortcut').first();
  await page.keyboard.press('Tab'); await metric.focus(); await page.waitForTimeout(80);
  const topTooltip = page.locator('.ui-tooltip-surface[data-ready="true"]');
  assert.equal(await topTooltip.count(), 1, '顶部指标 Focus 必须使用全局 Tooltip');
  assert.equal(await page.locator('.ui-hover-overlay-host').getAttribute('data-ui-layer'), 'hover');
  await page.screenshot({ path: `${out}/hover-tooltip-top-resource.png` }); report.screenshots.push('hover-tooltip-top-resource');
  report.checks.push({ label: '顶部指标键盘提示', text: await topTooltip.textContent() });

  const worldToolbar = page.locator('.context-utility-toolbar[data-utility-context="world"]');
  await worldToolbar.waitFor();
  const firstUtilityButton = worldToolbar.getByRole('button').first();
  await firstUtilityButton.hover(); await page.waitForTimeout(380);
  assert.equal(await page.locator('.ui-tooltip-surface[data-ready="true"]').count(), 1, 'Context Utility Hover 必须使用全局 Tooltip');
  await page.screenshot({ path: `${out}/hover-tooltip-utility.png` }); report.screenshots.push('hover-tooltip-utility');
  assert(await worldToolbar.evaluate(element => element.classList.contains('is-world-stacked')), '主游玩 World Utility 应使用双层结构');
  const rows = worldToolbar.locator('.context-utility-toolbar__row');
  assert.equal(await rows.count(), 2, '主游玩 World Utility 必须只有两行');
  const firstRowLabels = await rows.nth(0).getByRole('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
  const secondRowLabels = await rows.nth(1).getByRole('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')));
  assert.deepEqual(firstRowLabels, ['地图解锁', '编辑区域', '地形编辑', '配色工具']);
  assert.deepEqual(secondRowLabels, ['网格吸附', '网格显示', '范围复制', '范围移动', '撤销 · Ctrl+Z', '重做 · Ctrl+Y', '批量摧毁建筑']);
  const mainDock = page.locator('.command-bar');
  const [toolbarBox, mainDockBox, firstRowBox, secondRowBox] = await Promise.all([
    worldToolbar.boundingBox(),
    mainDock.boundingBox(),
    rows.nth(0).boundingBox(),
    rows.nth(1).boundingBox(),
  ]);
  assert(toolbarBox && mainDockBox && firstRowBox && secondRowBox);
  assert(Math.abs(toolbarBox.width - 356) < 1 && Math.abs(toolbarBox.height - 84) < 1, '双层 World Utility 使用固定 356×84 逻辑尺寸');
  assert(Math.abs(mainDockBox.height - 84) < 1, 'Main Dock 必须使用 84px 高度');
  const stackedButtonBox = await worldToolbar.getByRole('button', { name: '地图解锁', exact: true }).boundingBox();
  assert(stackedButtonBox && Math.abs(stackedButtonBox.width - 36) < 1 && Math.abs(stackedButtonBox.height - 36) < 1, '84px 双层 Utility 使用 36px 命中区');
  assert(secondRowBox.y > firstRowBox.y + firstRowBox.height - 1, '两行不能互相重叠');
  const mainDockBottom = mainDockBox.y + mainDockBox.height;
  const utilityBottom = toolbarBox.y + toolbarBox.height;
  assert(Math.abs(mainDockBox.height - toolbarBox.height) <= 1, 'Main Dock 与双层 Utility 必须同高');
  assert(Math.abs(mainDockBottom - utilityBottom) <= 1, 'Main Dock 与双层 Utility 必须同底边');
  const destroy = worldToolbar.getByRole('button', { name: '批量摧毁建筑', exact: true });
  const destroyBox = await destroy.boundingBox();
  const secondButtons = await rows.nth(1).getByRole('button').evaluateAll(buttons => buttons.map(button => ({ label: button.getAttribute('aria-label'), right: button.getBoundingClientRect().right })));
  assert(destroyBox && secondButtons.every(button => button.label === '批量摧毁建筑' || destroyBox.x + destroyBox.width >= button.right - 1), '批量摧毁必须位于第二行最右侧');
  const hintsBox = await page.locator('.gameplay-operation-hints').boundingBox();
  assert(hintsBox && overlap(toolbarBox, hintsBox) < 1, '双层 Utility 不得遮挡操作提示');
  const separator = await worldToolbar.locator('.context-utility-toolbar__separator').first().evaluate(element => getComputedStyle(element).marginLeft);
  assert.equal(separator, '9px');
  report.checks.push({ label: '主游玩辅助工具84px双层分组与同高同底边', toolbarBox, mainDockBox, stackedButtonBox, firstRowLabels, secondRowLabels, separator, mainDockBottom, utilityBottom });
  await shot('world-utility-two-rows');

  assert.equal(await page.locator('.building-selection-anchor').count(), 3, '普通 Gameplay 应保留建筑选择入口');
  await destroy.click(); await settle();
  assert.equal(await destroy.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.gameplay-screen').getAttribute('data-world-demolition'), 'active');
  assert.equal(await page.locator('.building-selection-anchor').count(), 0, '批量摧毁模式不得与单栋建筑 Selection 抢点击');
  assert.equal(await page.locator('.operation-hints__task').textContent(), '批量摧毁');
  await shot('world-utility-demolition-active');
  await page.keyboard.press('Escape'); await settle();
  assert.equal(await page.locator('.gameplay-screen').getAttribute('data-world-demolition'), 'inactive');
  assert.equal(await page.locator('.building-selection-anchor').count(), 3, 'Esc 退出批量摧毁后恢复普通建筑 Selection');
  report.checks.push({ label: '批量摧毁 Toggle / Esc / Selection 互斥' });

  await open('workspace-building', '.workspace--catalog');
  const workspace = page.locator('.workspace--catalog');
  const workspaceUtility = page.locator('.context-utility-toolbar[data-utility-context="world"]');
  const workspaceMainDock = page.locator('.command-bar');
  assert(await workspaceUtility.evaluate(element => element.classList.contains('is-world-stacked')), 'Workspace 打开时 World Utility 应继续保持双层');
  assert.equal(await workspaceUtility.locator('.context-utility-toolbar__row').count(), 2);
  const [workspaceBox, workspaceUtilityBox, workspaceMainDockBox] = await Promise.all([
    workspace.boundingBox(),
    workspaceUtility.boundingBox(),
    workspaceMainDock.boundingBox(),
  ]);
  assert(workspaceBox && workspaceUtilityBox && workspaceMainDockBox);
  const workspaceBottom = workspaceBox.y + workspaceBox.height;
  const utilityGap = workspaceUtilityBox.y - workspaceBottom;
  const mainDockGap = workspaceMainDockBox.y - workspaceBottom;
  const workspaceMainBottom = workspaceMainDockBox.y + workspaceMainDockBox.height;
  const workspaceUtilityBottom = workspaceUtilityBox.y + workspaceUtilityBox.height;
  assert(utilityGap >= 11.5, 'Workspace 与双层 Utility 至少保留 12px 安全间距');
  assert(mainDockGap >= 11.5, 'Workspace 与 Main Dock 至少保留 12px 安全间距');
  assert(Math.abs(workspaceMainDockBox.height - workspaceUtilityBox.height) <= 1, 'Workspace 状态下 Main Dock / Utility 必须同高');
  assert(Math.abs(workspaceMainBottom - workspaceUtilityBottom) <= 1, 'Workspace 状态下 Main Dock / Utility 必须同底边');
  assert(overlap(workspaceBox, workspaceUtilityBox) < 1 && overlap(workspaceBox, workspaceMainDockBox) < 1, 'Workspace 不得覆盖任一底部菜单');
  report.checks.push({ label: 'Workspace 与双层 Utility 共存', workspaceBox, workspaceUtilityBox, workspaceMainDockBox, utilityGap, mainDockGap });
  await shot('world-utility-workspace-balanced');

  assert.equal(report.errors.length, 0, report.errors.join('\n'));
  console.log(`Tool usability visual review: PASS (${report.checks.length} checks, ${report.screenshots.length} screenshots).`);
} catch (error) {
  report.failure = String(error.stack || error);
  await page.screenshot({ path: `${out}/usability-failure.png` }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${out}/tool-usability-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
