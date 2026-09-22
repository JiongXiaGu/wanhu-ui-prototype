import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });
const report = { referenceResolution: [1920, 1080], checks: [], runtimeErrors: [], screenshots: [] };
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', error => report.runtimeErrors.push(error.message));

async function settle() {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(260);
}
async function open(review, waitFor = '.game-canvas') {
  const url = new URL(baseUrl);
  url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(waitFor);
  await settle();
}
async function shot(name) {
  await page.mouse.move(1900, 20);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  report.screenshots.push(name);
}
async function assertFont(selector, minimum, label) {
  const rows = await page.locator(selector).evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    const style = getComputedStyle(element);
    return [{ text: element.textContent.trim(), fontSize: parseFloat(style.fontSize), color: style.color }];
  }));
  assert(rows.length > 0, `${label}: 未找到可见文字`);
  assert(rows.every(row => row.fontSize >= minimum), `${label}: ${JSON.stringify(rows)}`);
  report.checks.push({ label, minimum, rows });
}
async function assertNoTextOverflow(selector, label) {
  const rows = await page.locator(selector).evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    return [{ text: element.textContent.trim(), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }];
  }));
  assert(rows.length > 0, `${label}: 未找到可见内容`);
  const failures = rows.filter(row => row.scrollWidth > row.clientWidth + 1);
  assert.equal(failures.length, 0, `${label}: ${JSON.stringify(failures)}`);
  report.checks.push({ label, checked: rows.length, overflowCount: failures.length });
}

try {
  // 固定真实页面及原有交付文件名，不用合成 DOM 冒充页面回归。
  await open('load', '.archive-space--load');
  await assertFont('.archive-save-type-tabs button', 12, '存档筛选字号');
  await assertFont('.archive-save-card__title-row b', 14, '存档名称字号');
  await assertFont('.archive-group-card__title b', 13, '城市分组名称字号');
  await assertNoTextOverflow('.archive-save-card__time-row>small', '存档日期标签不截断');
  const dateLabels = await page.locator('.archive-save-card__time-row>small').evaluateAll(elements => elements.map(element => ({
    text: element.textContent.trim(), whiteSpace: getComputedStyle(element).whiteSpace,
  })));
  assert(dateLabels.length && dateLabels.every(row => row.whiteSpace === 'nowrap'), '日期标签应保持单行，不缩小字号');
  report.checks.push({ label: '存档日期标签单行', rows: dateLabels });
  await shot('typography-decision-archive');

  const selectedGroup = page.locator('.archive-group-card.is-selected').first();
  await page.keyboard.press('Tab');
  await selectedGroup.focus();
  const focus = await selectedGroup.evaluate(element => {
    const style = getComputedStyle(element);
    return { selected: element.classList.contains('is-selected'), visible: element.matches(':focus-visible'), width: style.outlineWidth, style: style.outlineStyle };
  });
  assert(focus.selected && focus.visible && parseFloat(focus.width) >= 1 && focus.style !== 'none', '选中与键盘焦点必须同时可见');
  report.checks.push({ label: 'Selected + Focus', ...focus });
  await shot('readability-archive-selected-focus');

  const toggle = page.locator('.archive-hide-outdated .ui-toggle').first();
  const toggleBefore = await toggle.evaluate(element => ({ on: element.classList.contains('is-on'), width: element.getBoundingClientRect().width }));
  await toggle.click();
  await settle();
  const toggleAfter = await toggle.evaluate(element => ({ on: element.classList.contains('is-on'), width: element.getBoundingClientRect().width }));
  assert.notEqual(toggleBefore.on, toggleAfter.on, 'Toggle 必须实际改变状态');
  assert.equal(toggleBefore.width, toggleAfter.width, 'Toggle 状态变化不得改变命中尺寸');
  report.checks.push({ label: 'Toggle 真实状态切换', before: toggleBefore, after: toggleAfter });
  await shot('readability-archive-toggle-changed');

  await open('gameplay', '.gameplay-top-navigation');
  await page.getByRole('button', { name: '库存', exact: true }).evaluate((button) => button.click());
  await page.waitForSelector('.management-space--inventory');
  await settle();
  await assertFont('.inventory-resource-row:not(.inventory-resource-row--head)>b', 13, '库存资源名称');
  await assertFont('.inventory-resource-row>strong', 14, '库存总量');
  await assertNoTextOverflow('.inventory-resource-row>strong, .inventory-resource-row>em', '库存数字不截断');
  const statusHeader = await page.locator('.inventory-resource-row--head>span').last().evaluate(element => ({
    text: element.textContent.trim(), align: getComputedStyle(element).textAlign,
  }));
  assert.equal(statusHeader.align, 'left', '库存状态表头与状态内容必须同向对齐');
  report.checks.push({ label: '库存状态列对齐', ...statusHeader });
  await shot('typography-decision-inventory');
  await page.locator('.inventory-management__tabs button').nth(1).click();
  await settle();
  await shot('readability-inventory-warehouses');
  await page.locator('.inventory-management__tabs button').nth(2).click();
  await settle();
  await shot('readability-inventory-villages');

  await page.keyboard.press('Escape');
  await page.waitForSelector('.management-space', { state: 'detached' });
  await page.getByRole('button', { name: '城市', exact: true }).evaluate((button) => button.click());
  await page.waitForSelector('.management-space--city');
  await settle();
  await assertFont('.management-task-row>span b', 13, '城市任务正文');
  await assertFont('.management-task-row>span small', 12, '城市任务说明');
  await shot('typography-decision-management');

  for (const [scenario, name] of [
    ['menu', 'readability-main-menu'],
    ['new-game', 'readability-new-game'],
    ['settings', 'readability-settings'],
    ['pause', 'readability-pause'],
    ['pause-save', 'readability-save'],
    ['management-finance', 'readability-finance'],
  ]) {
    await open(scenario);
    await shot(name);
  }

  // 当前 LeftContextPanel 不再附加已退役的裸 gameplay-context-panel 类。
  await open('camera', '.gameplay-context-panel--camera');
  await assertFont('.ui-numeric-slider-field>.ui-value-button', 11, '相机参数值可读性');
  await assertNoTextOverflow('.ui-numeric-slider-field>.ui-value-button', '相机参数值不截断');
  await shot('readability-camera-day');

  // 先进入真实场景模拟模式，再通过时间控件进入夜景；不修改 dataset 或伪造背景。
  await open('weather', '.gameplay-context-panel--weather');
  await page.getByRole('button', { name: '场景模拟', exact: true }).click();
  await settle();
  await shot('readability-weather-day');
  const timeSlider = page.getByRole('slider', { name: '日内时间', exact: true });
  await timeSlider.focus();
  await timeSlider.press('End');
  await page.waitForSelector('.gameplay-screen[data-time-of-day="night"]');
  await settle();
  report.checks.push({ label: '真实时间控件切换夜景', time: await timeSlider.inputValue() });
  await shot('readability-weather-night');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.gameplay-left-context-surface', { state: 'detached' });
  await page.getByRole('button', { name: '建筑', exact: true }).click();
  await page.waitForSelector('.workspace--catalog');
  await settle();
  await shot('readability-workspace-night');

  await open('camera', '.gameplay-context-panel--camera');
  await page.setViewportSize({ width: 3840, height: 2160 });
  await settle();
  const canvas = await page.locator('.game-canvas').boundingBox();
  assert(canvas && Math.abs(canvas.width - 3840) < 2 && Math.abs(canvas.height - 2160) < 2, '4K 应等比缩放同一逻辑画布');
  report.checks.push({ label: '4K 逻辑画布缩放', canvas });
  await shot('readability-camera-4k');
  assert.equal(report.runtimeErrors.length, 0, `Runtime errors: ${report.runtimeErrors.join('; ')}`);
  console.log('Readability / controls / day-night / 4K checks passed.');
} catch (error) {
  report.failure = String(error.stack || error);
  await page.screenshot({ path: `${outDir}/readability-failure.png` }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${outDir}/readability-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
