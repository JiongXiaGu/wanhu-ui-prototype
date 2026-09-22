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
async function checkHoverCard(label) {
  await page.waitForSelector('.ui-hover-card[data-ready="true"]'); await settle();
  const popup = await page.locator('.ui-hover-card').boundingBox();
  const workspace = await page.locator('.workspace--catalog').boundingBox();
  const viewport = page.viewportSize();
  assert(popup && workspace && viewport);
  assert(overlap(popup, workspace) < 1, label + ': 浮层遮挡目录');
  assert(popup.x >= 0 && popup.y >= 0 && popup.x + popup.width <= viewport.width + 1 && popup.y + popup.height <= viewport.height + 1, label + ': 浮层超出屏幕');
  report.checks.push({ label, placement: await page.locator('.ui-hover-card').getAttribute('data-placement'), popup, workspace });
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
  const cards = page.locator('.design-item-card');
  const count = await cards.count();
  assert(count >= 4, '建筑目录需要足够的条目用于两排避让检查');
  for (const index of [...new Set([0, Math.min(3, count - 1), Math.min(4, count - 1), count - 1])]) {
    await page.keyboard.press('Tab'); await cards.nth(index).focus();
    await checkHoverCard('建筑条目/' + index); await shot('inspector-building-' + index);
  }
  await page.keyboard.press('Escape');
  await page.waitForSelector('.workspace--catalog', { state: 'detached' });
  assert.equal(await page.locator('.ui-hover-surface:visible').count(), 0, '关闭目录不能残留 Hover Surface');
  report.checks.push({ label: '关闭目录清理浮层' });

  await open('workspace-city-wall', '.workspace--catalog');
  const wallCards = page.locator('.design-item-card');
  assert(await wallCards.count());
  await wallCards.first().hover(); await page.waitForTimeout(540);
  await checkHoverCard('城墙悬停');
  const before = await page.locator('.ui-hover-card').boundingBox();
  await wallCards.first().hover({ position: { x: 15, y: 15 } }); await page.waitForTimeout(80);
  const after = await page.locator('.ui-hover-card').boundingBox();
  assert(before && after && Math.abs(before.x - after.x) < 1 && Math.abs(before.y - after.y) < 1, '浮层不能随同一条目内鼠标移动');
  await page.screenshot({ path: `${out}/hover-card-workspace.png` }); report.screenshots.push('hover-card-workspace');

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
    await page.locator('.design-item-card').last().focus(); await checkHoverCard('缩放/' + height); await shot('inspector-' + height);
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
  await page.locator('.design-item-card').first().focus(); await checkHoverCard('夜景目录'); await shot('inspector-night');

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
