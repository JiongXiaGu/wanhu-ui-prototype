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
  const selectionActionBar = page.locator('.building-selection-action-cluster .secondary-action-bar');
  const selectionActionBarBox = await selectionActionBar.boundingBox();
  ok('selection action bar unified height', Boolean(selectionActionBarBox && Math.abs(selectionActionBarBox.height - 84) < 1));
  const selectionActionMetrics = await selectionActionBar.locator('.placement-action-bar__button--labeled').evaluateAll((buttons) => buttons.map((button) => {
    const icon = button.querySelector('.ui-icon')?.getBoundingClientRect();
    const label = button.querySelector('.placement-action-bar__label')?.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    return { width: rect.width, height: rect.height, iconY: icon?.y, iconBottom: icon?.bottom, iconWidth: icon?.width, labelY: label?.y };
  }));
  ok('selection uses vertical icon-label hierarchy', selectionActionMetrics.length === 3 && selectionActionMetrics.every((item) => item.width === 76 && item.height === 64 && item.iconWidth === 24 && item.iconBottom < item.labelY));
  const selectionHints = page.locator('.gameplay-operation-hints');
  ok('selection keeps persistent operation hints', await selectionHints.count() === 1);
  ok('selection operation hints context', await selectionHints.getAttribute('data-hint-context') === 'building-selection');
  ok('left panel scheme field', await page.getByRole('button', { name: '打开当前建筑配色方案', exact: true }).count() === 1);
  ok('left panel current scheme', await page.getByText('墨瓦沉木', { exact: true }).count() === 1);
  ok('left panel weathering', await page.getByText('48%', { exact: true }).count() >= 1);
  const inspectorBody = page.locator('.building-selection-inspector__body');
  const buildingSliderField = page.locator('.building-selection-inspector .ui-numeric-slider-field').first();
  const buildingControlMetrics = await buildingSliderField.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      className: node.className,
      stepSize: style.getPropertyValue('--ui-parameter-step-size').trim(),
      valueWidth: style.getPropertyValue('--ui-parameter-value-width').trim(),
    };
  });
  ok('building slider uses standard density', buildingControlMetrics.className.includes('is-standard'));
  ok('building standard stepper size', buildingControlMetrics.stepSize === '30px');
  ok('building standard value width', buildingControlMetrics.valueWidth === '68px');
  ok('building inspector uses shared scroll region', await inspectorBody.evaluate((node) => node.classList.contains('ui-scroll-region')));
  ok('building scrollbar consumes shared 6px token', await inspectorBody.evaluate((node) => getComputedStyle(node).getPropertyValue('--ui-scrollbar-size').trim()) === '6px');
  const schemeField = page.getByRole('button', { name: '打开当前建筑配色方案', exact: true });
  const [bodyBox, schemeBox] = await Promise.all([inspectorBody.boundingBox(), schemeField.boundingBox()]);
  ok('appearance controls visible without scrolling', Boolean(bodyBox && schemeBox && schemeBox.y >= bodyBox.y && schemeBox.y + schemeBox.height <= bodyBox.y + bodyBox.height));

  const utility = page.locator('.context-utility-toolbar[data-utility-context="building-selection"]');
  await utility.waitFor();
  for (const label of ['聚焦所选建筑', '撤销 · Ctrl+Z', '重做 · Ctrl+Y', '移除建筑']) {
    ok('selection utility ' + label, await utility.getByRole('button', { name: label, exact: true }).count() === 1);
  }
  ok('right utility has no color action', await utility.getByRole('button', { name: '配色所选建筑', exact: true }).count() === 0);
  await shot('building-selection-01-selected-appearance');
  await page.screenshot({ path: out + '/operation-hints-selection.png' }); report.screenshots.push('operation-hints-selection');
  await page.screenshot({ path: out + '/secondary-action-building-selection.png' }); report.screenshots.push('secondary-action-building-selection');

  const schemeToggle = page.getByRole('button', { name: '配色', exact: true });
  await schemeToggle.click();
  await page.waitForSelector('.building-scheme-workspace');
  await page.waitForTimeout(180);
  ok('scheme toggle pressed', await schemeToggle.getAttribute('aria-pressed') === 'true');
  ok('scheme workspace open', await page.getByRole('button', { name: '应用建筑配色方案 粉墙黛瓦', exact: true }).count() === 1);
  ok('scheme workspace keeps operation hints', await selectionHints.getAttribute('data-hint-context') === 'building-scheme');
  await shot('building-selection-02-scheme-toggle-open');
  await page.screenshot({ path: out + '/operation-hints-selection-scheme.png' }); report.screenshots.push('operation-hints-selection-scheme');

  const firstSchemeCard = page.locator('.building-scheme-workspace__card-apply').first();
  ok('scheme source uses shared compact badge', await page.locator('.building-scheme-workspace .workspace-item-card__source.is-compact').count() > 0);
  ok('scheme cards keep permanent action slots', await page.locator('.building-scheme-workspace .building-scheme-workspace__card>.workspace-item-menu-trigger').count() > 0);
  ok('scheme favorites show name star', await page.locator('.building-scheme-workspace .workspace-item-card__favorite-star').count() > 0);
  ok('scheme selected state uses shared card language', await page.locator('.building-scheme-workspace .workspace-item-card.is-selected .workspace-item-card__state-line').count() === 1);
  await firstSchemeCard.hover();
  await page.waitForTimeout(540);
  const hoverCard = page.locator('.ui-hover-card[data-ready="true"]');
  const [schemeCardBox, hoverBox, schemeWorkspaceBox] = await Promise.all([
    firstSchemeCard.boundingBox(),
    hoverCard.boundingBox(),
    page.locator('.building-scheme-workspace').boundingBox(),
  ]);
  const hoverPlacement = await hoverCard.getAttribute('data-placement');
  ok('scheme hover stays above card', Boolean(
    schemeCardBox
    && hoverBox
    && hoverPlacement === 'top'
    && hoverBox.y + hoverBox.height <= schemeCardBox.y + 1
  ));
  ok('scheme hover stays local to workspace', Boolean(
    hoverBox
    && schemeWorkspaceBox
    && hoverBox.x < schemeWorkspaceBox.x + schemeWorkspaceBox.width
    && hoverBox.x + hoverBox.width > schemeWorkspaceBox.x
    && hoverBox.y < schemeWorkspaceBox.y + schemeWorkspaceBox.height
    && hoverBox.y + hoverBox.height > schemeWorkspaceBox.y
  ));
  await page.screenshot({ path: out + '/hover-building-scheme-top.png' }); report.screenshots.push('hover-building-scheme-top');
  await page.mouse.move(1700, 120);
  await page.waitForTimeout(120);

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
  ok('move rebinds operation hints', await selectionHints.getAttribute('data-hint-context') === 'building-placement-move');
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

  const settingsUrl = new URL(base);
  settingsUrl.searchParams.set('review', 'settings');
  await page.goto(settingsUrl.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.settings-space');
  await page.waitForTimeout(180);
  const settingsSliderField = page.locator('.settings-row--slider .ui-numeric-slider-field').first();
  const settingsControlMetrics = await settingsSliderField.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      className: node.className,
      stepSize: style.getPropertyValue('--ui-parameter-step-size').trim(),
      valueWidth: style.getPropertyValue('--ui-parameter-value-width').trim(),
    };
  });
  ok('settings slider uses standard density', settingsControlMetrics.className.includes('is-standard'));
  ok('building and settings share stepper size', settingsControlMetrics.stepSize === buildingControlMetrics.stepSize);
  ok('building and settings share value width', settingsControlMetrics.valueWidth === buildingControlMetrics.valueWidth);
  const settingsList = page.locator('.settings-list');
  ok('settings uses shared scroll region', await settingsList.evaluate((node) => node.classList.contains('ui-scroll-region')));
  ok('settings scrollbar consumes shared 6px token', await settingsList.evaluate((node) => getComputedStyle(node).getPropertyValue('--ui-scrollbar-size').trim()) === '6px');
  await shot('building-selection-08-shared-settings-controls');

  ok('no runtime errors', report.errors.length === 0);

  console.log('Building selection visual review: PASS (' + report.checks.length + ' checks, ' + report.screenshots.length + ' screenshots).');
} finally {
  await writeFile(out + '/building-selection-report.json', JSON.stringify(report, null, 2));
  await browser.close();
}
