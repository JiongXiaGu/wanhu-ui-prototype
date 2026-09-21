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
async function shot(name) { await page.mouse.move(1900, 20); await page.screenshot({ path: `${out}/usability-${name}.png` }); report.screenshots.push(name); }
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
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
async function checkInspector(label) {
  await page.waitForSelector('.asset-inspector-popover[data-ready="true"]'); await settle();
  const popup = await page.locator('.asset-inspector-popover').boundingBox();
  const workspace = await page.locator('.workspace--catalog').boundingBox();
  const viewport = page.viewportSize();
  assert(popup && workspace && viewport);
  assert(overlap(popup, workspace) < 1, label + ': 浮层遮挡目录');
  assert(popup.x >= 0 && popup.y >= 0 && popup.x + popup.width <= viewport.width + 1 && popup.y + popup.height <= viewport.height + 1, label + ': 浮层超出屏幕');
  report.checks.push({ label, placement: await page.locator('.asset-inspector-popover').getAttribute('data-placement'), popup, workspace });
}
async function checkSettings(label) {
  const rows = await page.locator('.settings-row').evaluateAll(elements => elements.flatMap(element => {
    const label = element.querySelector('.settings-row__label');
    const control = element.querySelector('.settings-row__control');
    if (!label || !control) return [];
    const a = label.getBoundingClientRect(), b = control.getBoundingClientRect();
    return [{ text: label.textContent.trim(), gap: b.left - a.right, left: b.left, right: b.right }];
  }));
  assert(rows.length > 0, label + ': 缺少设置行');
  assert(rows.every(row => Math.abs(row.gap - 40) < 1 && Math.abs(row.left - rows[0].left) < 1), label + ': 控件列起点不一致');
  report.checks.push({ label, rows });
}

try {
  await open('terrain-edit', '.terrain-edit-prototype');
  const terrain = page.locator('.terrain-edit-toolbar-cluster');
  const firstWidth = (await terrain.boundingBox()).width;
  for (const name of ['抬高', '降低', '整平', '平滑', '坡面']) {
    await terrain.getByRole('button', { name, exact: true }).click(); await settle();
    await checkToolLayout('地形/' + name);
    assert.equal((await terrain.boundingBox()).width, firstWidth, '切换模式不能改变工具栏宽度');
    assert.equal(await terrain.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true');
    await shot('terrain-' + name);
  }
  await terrain.getByRole('button', { name: '完成地形编辑', exact: true }).click();
  await page.waitForSelector('.terrain-edit-prototype', { state: 'detached' });
  report.checks.push({ label: '地形结束返回原空间' });

  await open('tree-brush', '.tree-placement-prototype');
  await checkToolLayout('树木/刷子'); await shot('tree-brush');
  await page.locator('.tree-placement-toolbar-cluster').getByRole('button', { name: '单棵', exact: true }).click(); await settle();
  await checkToolLayout('树木/单棵'); await shot('tree-single');
  await page.getByRole('button', { name: '删除选中树木', exact: true }).click(); await settle();
  assert(await page.getByRole('button', { name: '移动选中树木', exact: true }).isDisabled());
  await shot('tree-disabled-actions');

  await open('color-tool-surface', '.color-tool-surface-panel');
  const colorBar = page.locator('.color-tool-toolbar-cluster');
  for (const [name, mode] of [['表面模式', 'surface'], ['灯光模式', 'lighting'], ['方案模式', 'scheme']]) {
    await colorBar.getByRole('button', { name, exact: true }).click(); await settle();
    await checkToolLayout('配色/' + mode); await shot('color-' + mode);
  }
  assert.equal(await colorBar.getByRole('button', { name: '取消配色', exact: true }).count(), 0, '不应展示并不存在的回退操作');
  await colorBar.getByRole('button', { name: '完成配色', exact: true }).click();
  await page.waitForSelector('.color-tool-toolbar-cluster', { state: 'detached' });
  report.checks.push({ label: '配色只有真实的结束动作，未新增提交/回退' });

  await open('workspace-building', '.workspace--catalog');
  // 真实焦点和条目触发 Inspector，不改 DOM 内容或人工放置浮层。
  const cards = page.locator('.design-item-card');
  const count = await cards.count();
  assert(count >= 4, '建筑目录需要足够的条目用于两排避让检查');
  for (const index of [...new Set([0, Math.min(3, count - 1), Math.min(4, count - 1), count - 1])]) {
    await page.keyboard.press('Tab'); await cards.nth(index).focus();
    await checkInspector('建筑条目/' + index); await shot('inspector-building-' + index);
  }
  await page.keyboard.press('Escape');
  await page.waitForSelector('.workspace--catalog', { state: 'detached' });
  assert.equal(await page.locator('.asset-inspector-popover:visible').count(), 0, '关闭目录不能残留详情');
  report.checks.push({ label: '关闭目录清理浮层' });

  await open('workspace-city-wall', '.workspace--catalog');
  const wallCards = page.locator('.design-item-card');
  assert(await wallCards.count());
  await wallCards.first().hover(); await page.waitForTimeout(400);
  await checkInspector('城墙悬停');
  const before = await page.locator('.asset-inspector-popover').boundingBox();
  await wallCards.first().hover({ position: { x: 15, y: 15 } }); await page.waitForTimeout(80);
  const after = await page.locator('.asset-inspector-popover').boundingBox();
  assert(before && after && Math.abs(before.x - after.x) < 1 && Math.abs(before.y - after.y) < 1, '浮层不能随同一条目内鼠标移动');
  await page.screenshot({ path: `${out}/usability-inspector-wall-hover.png` }); report.screenshots.push('inspector-wall-hover');

  await open('settings', '.settings-space');
  await checkSettings('菜单设置/显示'); await shot('settings-display');
  await page.locator('.settings-select-control .ui-select__trigger').first().click();
  await page.waitForSelector('.ui-select__menu'); await shot('settings-select-open');
  await page.keyboard.press('Escape');
  for (const tab of ['图形', '音频', '操作', '游戏']) {
    await page.locator('.settings-space__tabs').getByRole('button', { name: tab, exact: true }).click(); await settle();
    await checkSettings('菜单设置/' + tab); await shot('settings-' + tab);
  }
  await page.locator('.settings-space__tabs').getByRole('button', { name: '音频', exact: true }).click(); await settle();
  await page.locator('.settings-numeric-field .ui-value-button').first().click();
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
  await open('pause-settings', '.settings-space'); await checkSettings('暂停设置/显示'); await shot('pause-settings');

  for (const [width, height] of [[2560, 1440], [3840, 2160]]) {
    await page.setViewportSize({ width, height });
    await open('workspace-building', '.workspace--catalog');
    await page.locator('.design-item-card').last().focus(); await checkInspector('缩放/' + height); await shot('inspector-' + height);
    await open('terrain-edit', '.terrain-edit-prototype'); await checkToolLayout('缩放地形/' + height); await shot('terrain-' + height);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open('weather', '.gameplay-context-panel--weather');
  await page.getByRole('button', { name: '场景模拟', exact: true }).click();
  const time = page.getByRole('slider', { name: '日内时间', exact: true });
  await time.focus(); await time.press('End'); await page.waitForSelector('.gameplay-screen[data-time-of-day="night"]');
  await page.keyboard.press('Escape'); await page.waitForSelector('.gameplay-left-context-surface', { state: 'detached' });
  await page.getByRole('button', { name: '建筑', exact: true }).click(); await page.waitForSelector('.workspace--catalog');
  await page.locator('.design-item-card').first().focus(); await checkInspector('夜景目录'); await shot('inspector-night');

  await open('gameplay', '.gameplay-top-resource-shortcut');
  const metric = page.locator('.gameplay-top-resource-shortcut').first();
  await page.keyboard.press('Tab'); await metric.focus(); await page.waitForTimeout(450);
  const tooltip = await metric.evaluate(element => ({ visible: getComputedStyle(element, '::after').visibility, focused: element.matches(':focus-visible') }));
  assert(tooltip.visible === 'visible' && tooltip.focused); report.checks.push({ label: '顶部指标键盘提示', ...tooltip });
  await page.screenshot({ path: `${out}/usability-hud-focus.png` }); report.screenshots.push('hud-focus');
  const groups = page.locator('.context-utility-toolbar__group');
  assert.equal(await groups.count(), 3);
  const separator = await page.locator('.context-utility-toolbar__separator').first().evaluate(element => getComputedStyle(element).marginLeft);
  assert.equal(separator, '9px'); report.checks.push({ label: '辅助工具保留单一Host及三组结构', separator });
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
