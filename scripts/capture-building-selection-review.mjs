import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const out = 'review-screenshots';
await mkdir(out, { recursive: true });
const report = { checks: [], screenshots: [], errors: [] };
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', (error) => report.errors.push(error.message));

const ok = (label, value = true) => { assert(value, label); report.checks.push(label); };
async function shot(name) { await page.screenshot({ path: out + '/' + name + '.png' }); report.screenshots.push(name); }
async function open(review) {
  const url = new URL(base);
  url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.gameplay-screen');
  await page.waitForTimeout(260);
}

try {
  await open('gameplay');
  ok('three building anchors', await page.locator('.building-selection-anchor').count() === 3);

  await page.getByRole('button', { name: '选择建筑 临河食肆', exact: true }).click();
  await page.waitForSelector('.building-selection-inspector');
  await page.waitForTimeout(180);

  ok('selection exposes move', await page.getByRole('button', { name: '移动建筑', exact: true }).count() === 1);
  ok('selection exposes scheme toggle', await page.getByRole('button', { name: '配色', exact: true }).count() === 1);
  ok('selection exposes close', await page.getByRole('button', { name: '关闭建筑选择', exact: true }).count() === 1);
  ok('left panel scheme field', await page.getByRole('button', { name: '打开当前建筑配色方案', exact: true }).count() === 1);
  ok('left panel current scheme', await page.getByText('墨瓦沉木', { exact: true }).count() === 1);
  ok('left panel weathering', await page.getByText('48%', { exact: true }).count() >= 1);

  const utility = page.locator('.context-utility-toolbar[data-utility-context="building-selection"]');
  await utility.waitFor();
  for (const label of ['聚焦所选建筑', '撤销 · Ctrl+Z', '重做 · Ctrl+Y', '移除建筑']) {
    ok('selection utility ' + label, await utility.getByRole('button', { name: label, exact: true }).count() === 1);
  }
  ok('right utility has no color action', await utility.getByRole('button', { name: '配色所选建筑', exact: true }).count() === 0);
  await shot('building-selection-01-selected-appearance');

  const schemeToggle = page.getByRole('button', { name: '配色', exact: true });
  await schemeToggle.click();
  await page.waitForSelector('.building-scheme-workspace');
  await page.waitForTimeout(180);
  ok('scheme toggle pressed', await schemeToggle.getAttribute('aria-pressed') === 'true');
  ok('scheme workspace open', await page.getByRole('button', { name: '应用建筑配色方案 粉墙黛瓦', exact: true }).count() === 1);
  await shot('building-selection-02-scheme-toggle-open');

  await page.getByRole('button', { name: '应用建筑配色方案 粉墙黛瓦', exact: true }).click();
  await page.waitForTimeout(100);
  ok('applied scheme rebinds left panel', await page.getByText('粉墙黛瓦', { exact: true }).count() >= 1);
  await shot('building-selection-03-scheme-applied');

  await schemeToggle.click();
  await page.waitForSelector('.building-scheme-workspace', { state: 'detached' });
  ok('scheme toggle closes workspace', await schemeToggle.getAttribute('aria-pressed') === 'false');

  await page.getByRole('button', { name: '打开当前建筑配色方案', exact: true }).click();
  await page.waitForSelector('.building-scheme-workspace');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.building-scheme-workspace', { state: 'detached' });
  ok('escape closes scheme only', await page.locator('.building-selection-inspector').count() === 1);

  await page.getByRole('button', { name: '选择建筑 永安坊民居', exact: true }).click();
  await page.waitForTimeout(100);
  ok('residence appearance rebind', await page.getByText('粉墙黛瓦', { exact: true }).count() >= 1);
  await page.getByRole('button', { name: '移动建筑', exact: true }).click();
  await page.waitForSelector('.building-placement-prototype[data-building-placement-intent="move"]');
  await page.waitForSelector('.context-utility-toolbar[data-utility-context="building-placement"]');
  await page.waitForTimeout(220);
  ok('move reuses placement utility', await page.locator('.context-utility-toolbar[data-utility-context="building-placement"]').getByRole('button', { name: '对齐最近道路', exact: true }).count() === 1);
  await shot('building-selection-04-move');

  await page.getByRole('button', { name: '完成移动', exact: true }).click();
  await page.waitForSelector('.building-selection-inspector[data-selection-id="building-yongan-residence"]');
  await page.waitForSelector('.context-utility-toolbar[data-utility-context="building-selection"]');
  await page.waitForTimeout(160);

  const selectionUtility = page.locator('.context-utility-toolbar[data-utility-context="building-selection"]');
  await selectionUtility.getByRole('button', { name: '移除建筑', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  ok('remove confirmation title', await page.getByRole('heading', { name: '移除建筑', exact: true }).count() === 1);
  ok('remove dialog names building', (await page.getByRole('dialog').textContent())?.includes('永安坊民居') === true);
  await shot('building-selection-05-remove-confirm');

  await page.getByRole('button', { name: '取消', exact: true }).click();
  await page.waitForSelector('.ui-dialog', { state: 'detached' });
  ok('cancel keeps selected building', await page.locator('.building-selection-inspector[data-selection-id="building-yongan-residence"]').count() === 1);

  await selectionUtility.getByRole('button', { name: '移除建筑', exact: true }).click();
  await page.getByRole('button', { name: '确认移除', exact: true }).click();
  await page.waitForSelector('.building-selection-inspector', { state: 'detached' });
  await page.waitForSelector('.command-bar');
  await page.waitForTimeout(120);
  ok('removed building anchor gone', await page.getByRole('button', { name: '选择建筑 永安坊民居', exact: true }).count() === 0);
  ok('two building anchors remain', await page.locator('.building-selection-anchor').count() === 2);
  await shot('building-selection-06-removed');

  await open('building-selection');
  await shot('building-selection-07-direct');
  ok('direct scenario no edit action', await page.getByRole('button', { name: '编辑建筑', exact: true }).count() === 0);
  ok('no runtime errors', report.errors.length === 0);

  console.log('Building selection visual review: PASS (' + report.checks.length + ' checks, ' + report.screenshots.length + ' screenshots).');
} finally {
  await writeFile(out + '/building-selection-report.json', JSON.stringify(report, null, 2));
  await browser.close();
}
