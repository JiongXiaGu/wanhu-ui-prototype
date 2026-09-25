import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function open(review, waitFor) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(waitFor);
  await page.waitForTimeout(260);
}

async function assertTerrainShell(label) {
  const panel = page.locator('.terrain-edit-prototype');
  const panelBox = await panel.boundingBox();
  if (!panelBox) throw new Error(`${label}: terrain panel must be measurable.`);
  if (panelBox.width < 392 || panelBox.width > 408) {
    throw new Error(`${label}: terrain panel should stay near 400px wide. width=${panelBox.width}`);
  }
  if (panelBox.height > 360) {
    throw new Error(`${label}: terrain panel must size to content instead of stretching down the screen. height=${panelBox.height}`);
  }
  if (Math.abs((panelBox.y + panelBox.height) - (1080 - 16)) > 3) {
    throw new Error(`${label}: terrain panel must stay on the 16px lower safe edge.`);
  }

  if (await page.getByText('当前地形', { exact: true }).count()) {
    throw new Error(`${label}: persistent current-terrain readout should not occupy the left panel.`);
  }
  if (await page.locator('.terrain-brush-preview__label').count()) {
    throw new Error(`${label}: brush preview must not render persistent text below the ring.`);
  }
  if ((await page.locator('.terrain-brush-preview__outer').count()) !== 1) {
    throw new Error(`${label}: terrain world preview should retain one outer brush ring.`);
  }
  const hints = page.locator('.gameplay-operation-hints');
  if ((await hints.count()) !== 1) throw new Error(`${label}: terrain must keep exactly one persistent Operation Hints host.`);
  if ((await hints.getAttribute('data-hint-context')) !== 'terrain-' + label) {
    throw new Error(`${label}: terrain Operation Hints did not rebind to the active mode.`);
  }

  const utility = page.locator('.context-utility-toolbar[data-utility-context="terrain-edit"]');
  if ((await utility.count()) !== 1) throw new Error(`${label}: terrain utility context is missing.`);
  for (const action of ['网格显示', '等高线', '坡度视图', '保护已建区域', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']) {
    if ((await utility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
      throw new Error(`${label}: terrain utility missing ${action}.`);
    }
  }

  const bar = page.locator('.terrain-edit-toolbar-cluster .tool-action-bar');
  if ((await bar.count()) !== 1) throw new Error(`${label}: terrain ToolActionBar is missing.`);
  if ((await bar.locator('.placement-action-bar__button--mode').count()) !== 5) {
    throw new Error(`${label}: terrain ToolActionBar must expose five modes.`);
  }
  if ((await bar.getByRole('button', { name: '完成地形编辑', exact: true }).count()) !== 1) {
    throw new Error(`${label}: terrain ToolActionBar must expose Complete.`);
  }
  if (await bar.getByRole('button', { name: '取消', exact: true }).count()) {
    throw new Error(`${label}: terrain ToolActionBar must not expose a session-wide Cancel action.`);
  }
}


async function assertTreeShell(label, mode) {
  const panel = page.locator('.tree-placement-prototype');
  const panelBox = await panel.boundingBox();
  if (!panelBox) throw new Error(label + ': tree panel must be measurable.');
  if (panelBox.width < 392 || panelBox.width > 408) throw new Error(label + ': tree panel width=' + panelBox.width);
  if (panelBox.height > 520) throw new Error(label + ': tree panel too tall. height=' + panelBox.height);
  if ((await panel.locator('.tree-variant-button').count()) !== 4) throw new Error(label + ': expected four tree variants.');

  const utility = page.locator('.context-utility-toolbar[data-utility-context="tree-placement"]');
  if ((await utility.count()) !== 1) throw new Error(label + ': tree utility missing.');
  for (const action of ['避让建筑', '避让道路', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']) {
    if ((await utility.getByRole('button', { name: action, exact: true }).count()) !== 1) throw new Error(label + ': tree utility missing ' + action);
  }

  const bar = page.locator('.tree-placement-toolbar-cluster .tool-action-bar');
  if ((await bar.locator('.placement-action-bar__button--mode').count()) !== 2) throw new Error(label + ': expected brush and single modes.');
  if ((await bar.getByRole('button', { name: '完成树木放置', exact: true }).count()) !== 1) throw new Error(label + ': complete action missing.');
  const hints = page.locator('.gameplay-operation-hints');
  if ((await hints.count()) !== 1) throw new Error(label + ': tree must keep exactly one persistent Operation Hints host.');
  if ((await hints.getAttribute('data-hint-context')) !== 'tree-' + mode) throw new Error(label + ': tree Operation Hints context mismatch.');

  if (mode === 'brush') {
    if ((await panel.getByRole('button', { name: '随机混合四种树形', exact: true }).count()) !== 1) throw new Error(label + ': random mix missing.');
    if ((await page.locator('.tree-brush-preview').count()) !== 1) throw new Error(label + ': brush preview missing.');
  } else {
    if (await panel.getByRole('button', { name: '随机混合四种树形', exact: true }).count()) throw new Error(label + ': single mode must use a concrete variant.');
    if ((await page.locator('.tree-single-preview').count()) !== 1) throw new Error(label + ': single preview missing.');
    for (const action of ['移动选中树木', '逆时针旋转', '顺时针旋转', '删除选中树木']) {
      if ((await utility.getByRole('button', { name: action, exact: true }).count()) !== 1) throw new Error(label + ': single utility action missing ' + action);
    }
    if ((await bar.getByRole('button', { name: '移动选中树木', exact: true }).count()) !== 0) throw new Error(label + ': object actions must not remain in the Placement Main Action Bar.');
  }
}

async function assertParameterFieldFillsRow(rootSelector, label) {
  const root = page.locator(rootSelector);
  await root.waitFor();
  const row = root.locator('.ui-parameter-row').first();
  const field = row.locator('.ui-numeric-slider-field');
  const rowBox = await row.boundingBox();
  const fieldBox = await field.boundingBox();
  if (!rowBox || !fieldBox) throw new Error(`${label}: parameter row and field must be measurable.`);
  if (fieldBox.width < 220) {
    throw new Error(`${label}: NumericSliderField is still constrained by a legacy grid column. width=${fieldBox.width}`);
  }
  const rightGap = rowBox.x + rowBox.width - (fieldBox.x + fieldBox.width);
  if (rightGap > 3) {
    throw new Error(`${label}: NumericSliderField must reach the right edge of ParameterRow. gap=${rightGap}`);
  }
  const directChildren = await row.locator(':scope > *').count();
  if (directChildren !== 2) {
    throw new Error(`${label}: RuntimeParameterRow must keep exactly Label + NumericSliderField direct children. count=${directChildren}`);
  }
}

await open('gameplay', '.context-utility-toolbar[data-utility-context="world"]');

// Map View Visual Parity: formal overlays use real Spot/Band elements rather than CSS Gradient/Filter.
const mapViewButton = page.getByRole('button', { name: '信息视图', exact: true });
await mapViewButton.click();
await page.waitForSelector('.gameplay-top-map-panel');
for (const mapReview of [
  { label: '地价', mode: 'land-value', visible: '.map-view-layer__spot' },
  { label: '道路', mode: 'traffic', visible: '.map-view-layer__band' },
  { label: '水利', mode: 'water', visible: '.map-view-layer__spot' },
]) {
  if (!(await page.locator('.gameplay-top-map-panel').count())) {
    await mapViewButton.click();
    await page.waitForSelector('.gameplay-top-map-panel');
  }
  const mapPanel = page.locator('.gameplay-top-map-panel');
  await mapPanel.getByRole('button', { name: mapReview.label, exact: true }).click();
  await page.waitForTimeout(160);
  const layer = page.locator('.map-view-layer--' + mapReview.mode);
  if ((await layer.count()) !== 1) throw new Error('Map View layer missing: ' + mapReview.mode);
  const layerStyle = await layer.evaluate(node => {
    const style = getComputedStyle(node);
    return {
      backgroundImage: style.backgroundImage,
      filter: style.filter,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter || 'none',
      opacity: style.opacity,
    };
  });
  if (layerStyle.backgroundImage !== 'none') throw new Error('Map View must not depend on CSS Gradient: ' + mapReview.mode + ' ' + layerStyle.backgroundImage);
  if (layerStyle.filter !== 'none') throw new Error('Map View must not depend on CSS filter: ' + mapReview.mode + ' ' + layerStyle.filter);
  if (layerStyle.backdropFilter !== 'none') throw new Error('Map View must not depend on backdrop-filter: ' + mapReview.mode + ' ' + layerStyle.backdropFilter);
  if (Number(layerStyle.opacity) < .9) throw new Error('Map View layer must be visible: ' + mapReview.mode);
  const visibleParts = await layer.locator(mapReview.visible).evaluateAll(nodes =>
    nodes.filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && rect.width > 0 && rect.height > 0;
    }).length
  );
  if (visibleParts < 1) throw new Error('Map View structural parts missing: ' + mapReview.mode);
  await page.screenshot({ path: `${outDir}/map-view-${mapReview.mode}.png` });
}
if (!(await page.locator('.gameplay-top-map-panel').count())) {
  await mapViewButton.click();
  await page.waitForSelector('.gameplay-top-map-panel');
}
await page.locator('.gameplay-top-map-panel').getByRole('button', { name: '默认', exact: true }).click();
await page.waitForTimeout(100);
if (await page.locator('.gameplay-top-map-panel').count()) await mapViewButton.click();

const worldUtility = page.locator('.context-utility-toolbar[data-utility-context="world"]');
await worldUtility.getByRole('button', { name: '地形编辑', exact: true }).click();
await page.waitForSelector('.terrain-edit-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="terrain-edit"]');
await page.waitForTimeout(260);
await assertTerrainShell('raise');
await assertParameterFieldFillsRow('.terrain-edit-prototype', 'terrain raise');
const raiseBox = await page.locator('.terrain-edit-prototype').boundingBox();
if (!raiseBox || raiseBox.height > 280) {
  throw new Error(`Raise mode should stay compact. height=${raiseBox?.height}`);
}
await page.screenshot({ path: `${outDir}/terrain-01-raise.png` });

await page.getByRole('button', { name: '整平', exact: true }).click();
await page.waitForSelector('.terrain-edit-mode-section');
await page.waitForTimeout(160);
await assertTerrainShell('flatten');
if ((await page.getByRole('button', { name: '取样当前位置标高', exact: true }).count()) !== 1) {
  throw new Error('Flatten mode must expose the height-sample action.');
}
await page.screenshot({ path: `${outDir}/terrain-02-flatten.png` });

await page.getByRole('button', { name: '坡面', exact: true }).click();
await page.waitForTimeout(160);
await assertTerrainShell('slope');
for (const text of ['起点高度', '终点高度', '预估坡度']) {
  if (!(await page.getByText(text, { exact: true }).count())) throw new Error(`Slope mode missing ${text}.`);
}
await page.screenshot({ path: `${outDir}/terrain-03-slope.png` });

const utility = page.locator('.context-utility-toolbar[data-utility-context="terrain-edit"]');
await utility.getByRole('button', { name: '等高线', exact: true }).click();
await utility.getByRole('button', { name: '坡度视图', exact: true }).click();
await page.waitForTimeout(120);
if ((await utility.getByRole('button', { name: '等高线', exact: true }).getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Contour toggle should expose active state.');
}
if ((await utility.getByRole('button', { name: '坡度视图', exact: true }).getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Slope-view toggle should expose active state.');
}
await page.screenshot({ path: `${outDir}/terrain-04-utility-active.png` });

await page.getByRole('button', { name: '完成地形编辑', exact: true }).click();
await page.waitForSelector('.terrain-edit-prototype', { state: 'detached' });
await page.waitForSelector('.command-bar');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="world"]');
await page.waitForTimeout(180);
await page.screenshot({ path: `${outDir}/terrain-05-return-gameplay.png` });

await open('building-position', '.building-placement-prototype');
await assertParameterFieldFillsRow('.building-placement-prototype', 'building placement');
await page.screenshot({ path: `${outDir}/tool-06-building-parameter-width.png` });

await open('road-smart', '.road-placement-prototype');
await assertParameterFieldFillsRow('.road-placement-prototype', 'road placement');
await page.screenshot({ path: `${outDir}/tool-07-road-parameter-width.png` });


await open('workspace-tree', '.workspace[data-design-category="tree"]');
await page.locator('[data-item-id="tree-pine"]').click();
await page.waitForSelector('.tree-placement-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="tree-placement"]');
await page.waitForTimeout(260);
await assertTreeShell('tree brush', 'brush');
const treeBrushBox = await page.locator('.tree-placement-prototype').boundingBox();
if (!treeBrushBox || treeBrushBox.height > 430) throw new Error('Tree brush panel should stay compact with one row of four variants. height=' + treeBrushBox?.height);
await assertParameterFieldFillsRow('.tree-placement-prototype', 'tree brush');
await page.screenshot({ path: outDir + '/tree-08-brush.png' });

await page.getByRole('button', { name: '单棵', exact: true }).click();
await page.waitForTimeout(160);
await assertTreeShell('tree single', 'single');
await page.getByRole('button', { name: '树木样式 03', exact: true }).click();
if ((await page.getByRole('button', { name: '树木样式 03', exact: true }).getAttribute('aria-pressed')) !== 'true') throw new Error('Tree variant 03 should be selected.');
await page.getByRole('button', { name: '顺时针旋转', exact: true }).click();
await page.getByRole('button', { name: '移动选中树木', exact: true }).click();
await page.waitForTimeout(120);
await page.screenshot({ path: outDir + '/tree-09-single-edit.png' });

await page.getByRole('button', { name: '完成树木放置', exact: true }).click();
await page.waitForSelector('.tree-placement-prototype', { state: 'detached' });
await page.waitForSelector('.workspace[data-design-category="tree"]');
await page.waitForTimeout(180);
await page.screenshot({ path: outDir + '/tree-10-return-workspace.png' });



await open('workspace-city-wall', '.workspace[data-design-category="city-wall"]');
const cityWallWorkspace = page.locator('.workspace[data-design-category="city-wall"]');
for (const system of ['所有', '小倾斜角', '高倾斜角', '临水', '山地']) {
  if ((await cityWallWorkspace.getByRole('button', { name: system, exact: true }).count()) !== 1) {
    throw new Error('City wall workspace missing system rail item: ' + system);
  }
}
for (const category of ['全部', '城墙', '门洞', '登城梯', '高差楼梯']) {
  if ((await cityWallWorkspace.getByRole('button', { name: category, exact: true }).count()) !== 1) {
    throw new Error('City wall workspace missing module filter: ' + category);
  }
}
for (const retired of ['夯土城墙', '包砖城墙', '马面角楼', '平地', '缓坡', '陡坡', '河岸']) {
  if (await cityWallWorkspace.getByRole('button', { name: retired, exact: true }).count()) {
    throw new Error('City wall workspace still exposes retired category: ' + retired);
  }
}
if ((await cityWallWorkspace.locator('.design-item-card').count()) !== 8) {
  throw new Error('City wall all-systems first page should expose eight module cards.');
}
await page.screenshot({ path: outDir + '/city-wall-11-all-systems.png' });

await cityWallWorkspace.getByRole('button', { name: '小倾斜角', exact: true }).click();
await page.waitForTimeout(120);
if ((await cityWallWorkspace.locator('.design-item-card').count()) !== 4) {
  throw new Error('Small-slope wall system should expose exactly four module categories.');
}
for (const name of ['标准墙段', '拱券门洞', '直登城梯', '马道高差梯']) {
  if ((await cityWallWorkspace.getByRole('button', { name: new RegExp(name) }).count()) !== 1) {
    throw new Error('Small-slope wall system missing module: ' + name);
  }
}
await page.screenshot({ path: outDir + '/city-wall-12-gentle-system.png' });

await cityWallWorkspace.getByRole('button', { name: '门洞', exact: true }).click();
await page.waitForTimeout(120);
if ((await cityWallWorkspace.locator('.design-item-card').count()) !== 1) {
  throw new Error('Small-slope gate-opening filter should expose one module.');
}
if ((await cityWallWorkspace.getByRole('button', { name: /拱券门洞/ }).count()) !== 1) {
  throw new Error('Small-slope gate-opening module missing.');
}

await cityWallWorkspace.getByRole('button', { name: '临水', exact: true }).click();
await page.waitForTimeout(120);
if ((await cityWallWorkspace.getByRole('button', { name: /拱券水门洞/ }).count()) !== 1) {
  throw new Error('Waterside gate-opening should remain under the shared gate-opening category.');
}
await page.screenshot({ path: outDir + '/city-wall-13-waterside-gate.png' });

const watersideGateCard = cityWallWorkspace.getByRole('button', { name: /拱券水门洞/ });
await watersideGateCard.hover();
await page.waitForTimeout(540);
const cityWallInspector = page.locator('#ui-hover-surface[data-hover-kind="card"]');
for (const fact of ['所属体系', '构件类型', '营造方式']) {
  if ((await cityWallInspector.getByText(fact, { exact: true }).count()) !== 1) {
    throw new Error('City wall inspector missing fact: ' + fact);
  }
}
for (const value of ['临水', '城墙门洞', '嵌入墙段']) {
  if ((await cityWallInspector.getByText(value, { exact: true }).count()) !== 1) {
    throw new Error('City wall inspector missing value: ' + value);
  }
}
await page.screenshot({ path: outDir + '/city-wall-14-inspector.png' });



await open('workspace-city-wall', '.workspace[data-design-category="city-wall"]');
const cityWallConstructionWorkspace = page.locator('.workspace[data-design-category="city-wall"]');
await cityWallConstructionWorkspace.getByRole('button', { name: '小倾斜角', exact: true }).click();
await cityWallConstructionWorkspace.getByRole('button', { name: '城墙', exact: true }).click();
await cityWallConstructionWorkspace.getByRole('button', { name: /标准墙段/ }).click();
await page.waitForSelector('.city-wall-construction-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="city-wall-construction"]');
await page.waitForTimeout(260);

const wallPanel = page.locator('.city-wall-construction-prototype');
const wallPanelBox = await wallPanel.boundingBox();
if (!wallPanelBox || wallPanelBox.width < 392 || wallPanelBox.width > 408) {
  throw new Error('City wall construction panel should stay near 400px wide. width=' + wallPanelBox?.width);
}
for (const text of ['范围模式', '墙体参数', '墙高', '墙体厚度', '地形关系', '基底处理', '当前范围']) {
  if ((await wallPanel.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('City wall range panel missing: ' + text);
  }
}
await assertParameterFieldFillsRow('.city-wall-construction-prototype', 'city wall construction');

const wallBar = page.locator('.city-wall-construction-toolbar-cluster .tool-action-bar');
for (const mode of ['范围模式', '定宽延伸']) {
  if ((await wallBar.getByRole('button', { name: mode, exact: true }).count()) !== 1) {
    throw new Error('City wall construction mode missing: ' + mode);
  }
}
for (const retired of ['智能折线', '直线', '曲线']) {
  if (await wallBar.getByRole('button', { name: retired, exact: true }).count()) {
    throw new Error('Retired road-like wall mode is still visible: ' + retired);
  }
}
if (await wallBar.getByRole('button', { name: '交换正反面', exact: true }).count()) {
  throw new Error('Range mode must not expose facing flip; rectangle outside is automatically Front.');
}
for (const action of ['完成城墙营造', '取消城墙营造']) {
  if ((await wallBar.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall construction action missing: ' + action);
  }
}

const wallUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-construction"]');
for (const action of ['网格吸附', '网格显示', '墙顶线', '节点显示', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']) {
  if ((await wallUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall construction utility missing: ' + action);
  }
}
if ((await page.locator('.city-wall-range-preview').count()) !== 1) {
  throw new Error('Range mode needs one rectangular thick-wall preview.');
}
if ((await page.locator('.city-wall-range-preview__wall').count()) !== 4) {
  throw new Error('Range mode must preview four thick wall sides.');
}
if ((await page.locator('.city-wall-range-preview__front').count()) !== 4) {
  throw new Error('Range mode must show four outward Front indicators.');
}
if ((await wallPanel.getAttribute('data-wall-construction-mode')) !== 'range') {
  throw new Error('Range mode should expose range state.');
}
if ((await wallPanel.getAttribute('data-wall-facing')) !== 'outside-auto') {
  throw new Error('Range mode facing must be automatically outside.');
}
if ((await page.getByText('城墙 · 范围模式', { exact: true }).count()) !== 1) {
  throw new Error('City wall operation hints should match range mode.');
}
const rangePreviewParity = await page.locator('.city-wall-range-preview').evaluate(node => ({ filter: getComputedStyle(node).filter }));
const rangeWallParity = await page.locator('.city-wall-range-preview__wall').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow };
});
const rangeHandleParity = await page.locator('.city-wall-range-preview__handle').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { borderWidth: style.borderTopWidth, boxShadow: style.boxShadow };
});
if (rangePreviewParity.filter !== 'none') throw new Error('City wall range preview must not depend on CSS filter.');
if (rangeWallParity.backgroundImage !== 'none' || rangeWallParity.boxShadow !== 'none') {
  throw new Error('City wall range wall must use solid fill + border without Gradient/Inset Shadow.');
}
if (rangeHandleParity.borderWidth !== '2px' || rangeHandleParity.boxShadow !== 'none') {
  throw new Error('City wall range handle must use a 2px solid edge instead of Glow.');
}
await page.screenshot({ path: outDir + '/city-wall-15-construction-range.png' });

await wallBar.getByRole('button', { name: '定宽延伸', exact: true }).click();
await page.waitForTimeout(140);
if ((await wallPanel.getAttribute('data-wall-construction-mode')) !== 'fixed-width') {
  throw new Error('City wall construction panel should expose fixed-width mode.');
}
if ((await wallPanel.getAttribute('data-wall-facing')) !== 'right') {
  throw new Error('Fixed-width mode should default Front to path right side.');
}
if ((await wallUtility.getByRole('button', { name: '交换正反面', exact: true }).count()) !== 1) {
  throw new Error('Fixed-width mode must expose facing flip in Placement Utility row 1.');
}
for (const text of ['定宽延伸', '当前路径']) {
  if ((await wallPanel.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('Fixed-width wall panel missing: ' + text);
  }
}
const facingSummary = wallPanel.locator('.city-wall-facing-summary');
if ((await facingSummary.getByText(/^正面/).count()) !== 1) {
  throw new Error('Fixed-width wall panel should expose one Front summary row.');
}
if ((await facingSummary.getByText(/^背面/).count()) !== 1) {
  throw new Error('Fixed-width wall panel should expose one Back summary row.');
}
if ((await page.locator('.city-wall-fixed-preview').count()) !== 1) {
  throw new Error('Fixed-width mode needs one L-shaped wall preview.');
}
if ((await page.locator('.city-wall-fixed-preview__wall').count()) !== 2) {
  throw new Error('Fixed-width preview should expose two thick L wall legs.');
}
if ((await page.getByText('城墙 · 定宽延伸', { exact: true }).count()) !== 1) {
  throw new Error('City wall operation hints should rebind to fixed-width mode.');
}
const fixedPreviewParity = await page.locator('.city-wall-fixed-preview').evaluate(node => ({ filter: getComputedStyle(node).filter }));
const fixedWallParity = await page.locator('.city-wall-fixed-preview__wall').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow };
});
const fixedNodeParity = await page.locator('.city-wall-fixed-preview__node').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { borderWidth: style.borderTopWidth, boxShadow: style.boxShadow };
});
if (fixedPreviewParity.filter !== 'none') throw new Error('City wall fixed preview must not depend on CSS filter.');
if (fixedWallParity.backgroundImage !== 'none' || fixedWallParity.boxShadow !== 'none') {
  throw new Error('City wall fixed wall must use solid fill + border without Gradient/Inset Shadow.');
}
if (fixedNodeParity.borderWidth !== '2px' || fixedNodeParity.boxShadow !== 'none') {
  throw new Error('City wall fixed node must use a 2px solid edge instead of Glow.');
}

await wallUtility.getByRole('button', { name: '交换正反面', exact: true }).click();
await page.waitForTimeout(100);
if ((await wallPanel.getAttribute('data-wall-facing')) !== 'left') {
  throw new Error('City wall facing should flip from path right to path left.');
}

await wallUtility.getByRole('button', { name: '墙顶线', exact: true }).click();
await page.waitForTimeout(100);
if (await page.locator('.city-wall-fixed-preview__top-line').count()) {
  throw new Error('Wall top-line toggle should hide fixed-width preview lines.');
}
await page.screenshot({ path: outDir + '/city-wall-16-construction-fixed-width.png' });

await wallBar.getByRole('button', { name: '完成城墙营造', exact: true }).click();
await page.waitForSelector('.city-wall-construction-prototype', { state: 'detached' });
await page.waitForSelector('.workspace[data-design-category="city-wall"]');
await page.waitForTimeout(180);
await page.screenshot({ path: outDir + '/city-wall-17-return-workspace.png' });



await open('workspace-city-wall', '.workspace[data-design-category="city-wall"]');
const cityWallGateWorkspace = page.locator('.workspace[data-design-category="city-wall"]');
await cityWallGateWorkspace.getByRole('button', { name: '小倾斜角', exact: true }).click();
await cityWallGateWorkspace.getByRole('button', { name: '门洞', exact: true }).click();
await cityWallGateWorkspace.getByRole('button', { name: /拱券门洞/ }).click();
await page.waitForSelector('.city-wall-gate-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="city-wall-gate-free"]');
await page.waitForTimeout(260);

const gatePanel = page.locator('.city-wall-gate-prototype');
const gatePanelBox = await gatePanel.boundingBox();
if (!gatePanelBox || gatePanelBox.width < 392 || gatePanelBox.width > 408) {
  throw new Error('City wall gate panel should stay near 400px wide. width=' + gatePanelBox?.width);
}
for (const text of ['门洞尺寸', '洞口净宽', '洞口净高', '建筑纵深']) {
  if ((await gatePanel.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('City wall gate free panel missing: ' + text);
  }
}
for (const redundant of ['放置状态', '当前连接', '城墙体系', '墙体厚度', '墙高', '城门纵深']) {
  if (await gatePanel.getByText(redundant, { exact: true }).count()) {
    throw new Error('City wall gate left panel should not repeat scene state: ' + redundant);
  }
}
if (await gatePanel.locator('.city-wall-gate-facts').count()) {
  throw new Error('City wall gate informational facts block should be removed.');
}
if (gatePanelBox.height > 250) {
  throw new Error('City wall gate panel should stay compact after removing scene-state details. height=' + gatePanelBox.height);
}
await assertParameterFieldFillsRow('.city-wall-gate-prototype', 'city wall gate');

const gateBar = page.locator('.city-wall-gate-toolbar-cluster .tool-action-bar');
for (const mode of ['自由放置', '城墙连接']) {
  if ((await gateBar.getByRole('button', { name: mode, exact: true }).count()) !== 1) {
    throw new Error('City wall gate placement mode missing: ' + mode);
  }
}
for (const action of ['完成城墙门洞放置', '取消城墙门洞放置']) {
  if ((await gateBar.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall gate flow action missing: ' + action);
  }
}

const gateFreeUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-gate-free"]');
for (const action of ['城门左转', '城门右转', '交换正反面']) {
  if ((await gateFreeUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall gate object action missing from Placement Utility: ' + action);
  }
}
for (const action of ['网格吸附', '网格显示', '门洞净空', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']) {
  if ((await gateFreeUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall gate free utility missing: ' + action);
  }
}
if (await gateFreeUtility.getByRole('button', { name: '墙体连接点', exact: true }).count()) {
  throw new Error('Free gate placement must not expose wall connection points.');
}
if ((await page.locator('.city-wall-gate-free-preview').count()) !== 1) {
  throw new Error('Free gate placement needs one independent building preview.');
}
if ((await page.locator('.city-wall-gate-free-preview__volume').count()) !== 1) {
  throw new Error('Free gate preview must express a building volume, not only a door icon.');
}
if ((await page.getByText('城门 · 自由放置', { exact: true }).count()) !== 1) {
  throw new Error('Gate operation hints should match free mode.');
}
const freeGateParity = await page.locator('.city-wall-gate-free-preview').evaluate(node => ({ filter: getComputedStyle(node).filter }));
const freeGateFaceParity = await page.locator('.city-wall-gate-free-preview__front-face').evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow };
});
const freeGateOpeningParity = await page.locator('.city-wall-gate-free-preview__opening').evaluate(node => ({ boxShadow: getComputedStyle(node).boxShadow }));
if (freeGateParity.filter !== 'none') throw new Error('Free gate preview must not depend on CSS drop-shadow.');
if (freeGateFaceParity.backgroundImage !== 'none' || freeGateFaceParity.boxShadow !== 'none') {
  throw new Error('Free gate front face must use a solid fill without Gradient/Inset Shadow.');
}
if (freeGateOpeningParity.boxShadow !== 'none') throw new Error('Free gate opening must not depend on inset shadow.');
await page.screenshot({ path: outDir + '/city-wall-gate-18-free.png' });

await gateBar.getByRole('button', { name: '城墙连接', exact: true }).click();
await page.waitForSelector('.context-utility-toolbar[data-utility-context="city-wall-gate-connected"]');
await page.waitForTimeout(180);

if ((await gatePanel.getAttribute('data-gate-placement-mode')) !== 'wall-connected') {
  throw new Error('Gate panel should expose wall-connected mode.');
}
for (const redundant of ['放置状态', '当前连接', '城墙体系', '墙体厚度', '墙高', '城门纵深', '正面', '背面']) {
  if (await gatePanel.getByText(redundant, { exact: true }).count()) {
    throw new Error('Connected gate left panel should keep only editable parameters: ' + redundant);
  }
}
const gateConnectedUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-gate-connected"]');
for (const retiredAction of ['城门左转', '城门右转']) {
  if (await gateConnectedUtility.getByRole('button', { name: retiredAction, exact: true }).count()) {
    throw new Error('Wall-connected gate should hide free rotation action: ' + retiredAction);
  }
}
if ((await gateConnectedUtility.getByRole('button', { name: '交换正反面', exact: true }).count()) !== 1) {
  throw new Error('Wall-connected gate should retain semantic facing flip in Placement Utility.');
}
for (const action of ['网格显示', '墙体连接点', '门洞净空', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']) {
  if ((await gateConnectedUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('Connected gate utility missing: ' + action);
  }
}
if (await gateConnectedUtility.getByRole('button', { name: '网格吸附', exact: true }).count()) {
  throw new Error('Wall connection is mandatory in connected mode; grid snap should not compete with it.');
}
if ((await page.locator('.city-wall-gate-connected-preview').count()) !== 1) {
  throw new Error('Connected gate placement needs one wall integration preview.');
}
if ((await page.locator('.city-wall-gate-connected-preview__connection').count()) !== 2) {
  throw new Error('Connected gate preview should expose two wall connection anchors.');
}
const depthLabel = await page.locator('.city-wall-gate-connected-preview__depth-label').textContent();
if (!depthLabel || !depthLabel.includes('10.0 m') || !depthLabel.includes('墙厚 6.0 m')) {
  throw new Error('Connected gate preview must preserve custom building depth independently from wall thickness.');
}
if ((await page.getByText('城门 · 城墙连接', { exact: true }).count()) !== 1) {
  throw new Error('Gate operation hints should rebind to wall-connected mode.');
}
const connectedGateWallParity = await page.locator('.city-wall-gate-connected-preview__wall').evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow };
});
const connectedGateAnchorParity = await page.locator('.city-wall-gate-connected-preview__connection').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { borderWidth: style.borderTopWidth, boxShadow: style.boxShadow };
});
if (connectedGateWallParity.backgroundImage !== 'none' || connectedGateWallParity.boxShadow !== 'none') {
  throw new Error('Connected gate wall must use solid fill + edge without Gradient/Inset Shadow.');
}
if (connectedGateAnchorParity.borderWidth !== '2px' || connectedGateAnchorParity.boxShadow !== 'none') {
  throw new Error('Connected gate anchor must use a 2px solid edge instead of Glow.');
}
await page.screenshot({ path: outDir + '/city-wall-gate-19-connected.png' });

await gateConnectedUtility.getByRole('button', { name: '交换正反面', exact: true }).click();
await page.waitForTimeout(100);
if ((await gatePanel.getAttribute('data-gate-facing-flipped')) !== 'true') {
  throw new Error('Gate facing semantic should flip independently from transform rotation.');
}
await page.screenshot({ path: outDir + '/city-wall-gate-20-connected-flipped.png' });

await gateBar.getByRole('button', { name: '完成城墙门洞放置', exact: true }).click();
await page.waitForSelector('.city-wall-gate-prototype', { state: 'detached' });
await page.waitForSelector('.workspace[data-design-category="city-wall"]');
await page.waitForTimeout(180);
await page.screenshot({ path: outDir + '/city-wall-gate-21-return-workspace.png' });



await open('workspace-city-wall', '.workspace[data-design-category="city-wall"]');
const cityWallAccessStairWorkspace = page.locator('.workspace[data-design-category="city-wall"]');
await cityWallAccessStairWorkspace.getByRole('button', { name: '小倾斜角', exact: true }).click();
await cityWallAccessStairWorkspace.getByRole('button', { name: '登城梯', exact: true }).click();
await cityWallAccessStairWorkspace.getByRole('button', { name: /直登城梯/ }).click();
await page.waitForSelector('.city-wall-access-stair-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="city-wall-access-stair"]');
await page.waitForTimeout(260);

const accessStairPanel = page.locator('.city-wall-access-stair-prototype');
const accessStairPanelBox = await accessStairPanel.boundingBox();
if (!accessStairPanelBox || accessStairPanelBox.width < 392 || accessStairPanelBox.width > 408) {
  throw new Error('City wall access stair panel should stay near 400px wide. width=' + accessStairPanelBox?.width);
}
if (accessStairPanelBox.height > 250) {
  throw new Error('City wall access stair panel should stay compact. height=' + accessStairPanelBox.height);
}
for (const text of ['楼梯尺寸', '楼梯宽度', '楼梯高度', '楼梯长度']) {
  if ((await accessStairPanel.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('City wall access stair panel missing: ' + text);
  }
}
for (const retired of ['自动高度', '目标坡度', '城墙连接', '登城连接', '当前连接', '墙顶挂点']) {
  if (await accessStairPanel.getByText(retired, { exact: true }).count()) {
    throw new Error('City wall access stair first version should not expose automated wall logic: ' + retired);
  }
}
await assertParameterFieldFillsRow('.city-wall-access-stair-prototype', 'city wall access stair');

const accessStairBar = page.locator('.city-wall-access-stair-toolbar-cluster .tool-action-bar');
if ((await accessStairBar.locator('.placement-action-bar__button--mode').count()) !== 0) {
  throw new Error('City wall access stair should not expose placement mode buttons in the first version.');
}
for (const action of ['完成登城梯放置', '取消登城梯放置']) {
  if ((await accessStairBar.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall access stair flow action missing: ' + action);
  }
}

const accessStairUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-access-stair"]');
for (const action of ['登城梯左转', '登城梯右转', '交换上下端']) {
  if ((await accessStairUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall access stair object action missing from Placement Utility: ' + action);
  }
}
for (const action of ['网格吸附', '网格显示', '楼梯净空', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']) {
  if ((await accessStairUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall access stair utility missing: ' + action);
  }
}
if ((await page.locator('.city-wall-access-stair-preview').count()) !== 1) {
  throw new Error('City wall access stair needs one independent stair ghost.');
}
if ((await page.locator('.city-wall-access-stair-preview__step').count()) !== 8) {
  throw new Error('City wall access stair preview should visibly express stair steps.');
}
if ((await page.getByText('登城梯 · 自由放置', { exact: true }).count()) !== 1) {
  throw new Error('City wall access stair operation hints should describe simple free placement.');
}
const accessStairPreviewParity = await page.locator('.city-wall-access-stair-preview').evaluate(node => ({ filter: getComputedStyle(node).filter }));
const accessStairStepParity = await page.locator('.city-wall-access-stair-preview__step').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow, backgroundColor: style.backgroundColor };
});
const accessStairSide = page.locator('.city-wall-access-stair-preview__side');
const accessStairSideParity = await accessStairSide.evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, overflow: style.overflow };
});
const accessStairSideFill = accessStairSide.locator('.city-wall-access-stair-preview__side-fill');
if ((await accessStairSideFill.count()) !== 1) {
  throw new Error('Access stair diagonal side volume must use one real clipped fill element.');
}
const accessStairSideFillParity = await accessStairSideFill.evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundColor: style.backgroundColor, transform: style.transform };
});
if (accessStairPreviewParity.filter !== 'none') throw new Error('Access stair preview must not depend on CSS drop-shadow.');
if (accessStairStepParity.backgroundImage !== 'none' || accessStairStepParity.boxShadow !== 'none') {
  throw new Error('Access stair steps must use solid fill without Gradient/Inset Shadow.');
}
if (accessStairSideParity.backgroundImage !== 'none' || accessStairSideParity.overflow !== 'hidden') {
  throw new Error('Access stair side must clip a real fill element instead of using a diagonal CSS Gradient.');
}
if (accessStairSideFillParity.backgroundColor === 'rgba(0, 0, 0, 0)' || accessStairSideFillParity.transform === 'none') {
  throw new Error('Access stair real side fill must stay visible and rotated.');
}
await page.screenshot({ path: outDir + '/city-wall-access-stair-22-free.png' });

await accessStairUtility.getByRole('button', { name: '登城梯右转', exact: true }).click();
await accessStairUtility.getByRole('button', { name: '交换上下端', exact: true }).click();
await page.waitForTimeout(120);
if ((await accessStairPanel.getAttribute('data-stair-rotation')) !== '90') {
  throw new Error('City wall access stair should rotate by explicit player action.');
}
if ((await accessStairPanel.getAttribute('data-stair-reversed')) !== 'true') {
  throw new Error('City wall access stair should allow explicit High/Low direction reversal.');
}
await page.screenshot({ path: outDir + '/city-wall-access-stair-23-rotated-reversed.png' });

await accessStairBar.getByRole('button', { name: '完成登城梯放置', exact: true }).click();
await page.waitForSelector('.city-wall-access-stair-prototype', { state: 'detached' });
await page.waitForSelector('.workspace[data-design-category="city-wall"]');
await page.waitForTimeout(180);
await page.screenshot({ path: outDir + '/city-wall-access-stair-24-return-workspace.png' });



await open('workspace-city-wall', '.workspace[data-design-category="city-wall"]');
const cityWallTransitionStairWorkspace = page.locator('.workspace[data-design-category="city-wall"]');
await cityWallTransitionStairWorkspace.getByRole('button', { name: '小倾斜角', exact: true }).click();
await cityWallTransitionStairWorkspace.getByRole('button', { name: '高差楼梯', exact: true }).click();
await cityWallTransitionStairWorkspace.getByRole('button', { name: /马道高差梯/ }).click();
await page.waitForSelector('.city-wall-transition-stair-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="city-wall-transition-stair"]');
await page.waitForTimeout(260);

const transitionStairPanel = page.locator('.city-wall-transition-stair-prototype');
const transitionStairPanelBox = await transitionStairPanel.boundingBox();
if (!transitionStairPanelBox || transitionStairPanelBox.width < 392 || transitionStairPanelBox.width > 408) {
  throw new Error('City wall transition stair panel should stay near 400px wide. width=' + transitionStairPanelBox?.width);
}
if (transitionStairPanelBox.height > 250) {
  throw new Error('City wall transition stair panel should stay compact. height=' + transitionStairPanelBox.height);
}
for (const text of ['楼梯尺寸', '楼梯宽度', '楼梯高差', '楼梯长度']) {
  if ((await transitionStairPanel.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('City wall transition stair panel missing: ' + text);
  }
}
for (const retired of ['自动高差', '自动高度', '目标坡度', '马道连接', '当前连接', '墙顶挂点']) {
  if (await transitionStairPanel.getByText(retired, { exact: true }).count()) {
    throw new Error('City wall transition stair first version should not expose automated connection logic: ' + retired);
  }
}
await assertParameterFieldFillsRow('.city-wall-transition-stair-prototype', 'city wall transition stair');

const transitionStairBar = page.locator('.city-wall-transition-stair-toolbar-cluster .tool-action-bar');
if ((await transitionStairBar.locator('.placement-action-bar__button--mode').count()) !== 0) {
  throw new Error('City wall transition stair should not expose placement mode buttons in the first version.');
}
for (const action of ['完成高差楼梯放置', '取消高差楼梯放置']) {
  if ((await transitionStairBar.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall transition stair flow action missing: ' + action);
  }
}

const transitionStairUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-transition-stair"]');
for (const action of ['高差楼梯左转', '高差楼梯右转', '交换上下端']) {
  if ((await transitionStairUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall transition stair object action missing from Placement Utility: ' + action);
  }
}
for (const action of ['网格吸附', '网格显示', '楼梯净空', '撤销 · Ctrl+Z', '重做 · Ctrl+Y']) {
  if ((await transitionStairUtility.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall transition stair utility missing: ' + action);
  }
}
if ((await page.locator('.city-wall-transition-stair-preview').count()) !== 1) {
  throw new Error('City wall transition stair needs one independent stair ghost.');
}
if ((await page.locator('.city-wall-transition-stair-preview__step').count()) !== 7) {
  throw new Error('City wall transition stair preview should visibly express stair steps.');
}
if ((await page.locator('.city-wall-transition-stair-preview__platform').count()) !== 2) {
  throw new Error('City wall transition stair preview should show low and high walkway platform ends.');
}
if ((await page.getByText('高差楼梯 · 自由放置', { exact: true }).count()) !== 1) {
  throw new Error('City wall transition stair operation hints should describe simple free placement.');
}
const transitionStairPreviewParity = await page.locator('.city-wall-transition-stair-preview').evaluate(node => ({ filter: getComputedStyle(node).filter }));
const transitionStairPlatformParity = await page.locator('.city-wall-transition-stair-preview__platform').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow, backgroundColor: style.backgroundColor };
});
const transitionStairStepParity = await page.locator('.city-wall-transition-stair-preview__step').first().evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow, backgroundColor: style.backgroundColor };
});
const transitionStairSide = page.locator('.city-wall-transition-stair-preview__side');
const transitionStairSideParity = await transitionStairSide.evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, overflow: style.overflow };
});
const transitionStairSideFill = transitionStairSide.locator('.city-wall-transition-stair-preview__side-fill');
if ((await transitionStairSideFill.count()) !== 1) {
  throw new Error('Transition stair diagonal side volume must use one real clipped fill element.');
}
const transitionStairSideFillParity = await transitionStairSideFill.evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundColor: style.backgroundColor, transform: style.transform };
});
if (transitionStairPreviewParity.filter !== 'none') throw new Error('Transition stair preview must not depend on CSS drop-shadow.');
if (transitionStairPlatformParity.backgroundImage !== 'none' || transitionStairPlatformParity.boxShadow !== 'none') {
  throw new Error('Transition stair platforms must use solid fill without Gradient/Inset Shadow.');
}
if (transitionStairStepParity.backgroundImage !== 'none' || transitionStairStepParity.boxShadow !== 'none') {
  throw new Error('Transition stair steps must use solid fill without Gradient/Inset Shadow.');
}
if (transitionStairSideParity.backgroundImage !== 'none' || transitionStairSideParity.overflow !== 'hidden') {
  throw new Error('Transition stair side must clip a real fill element instead of using a diagonal CSS Gradient.');
}
if (transitionStairSideFillParity.backgroundColor === 'rgba(0, 0, 0, 0)' || transitionStairSideFillParity.transform === 'none') {
  throw new Error('Transition stair real side fill must stay visible and rotated.');
}
await page.screenshot({ path: outDir + '/city-wall-transition-stair-25-free.png' });

await transitionStairUtility.getByRole('button', { name: '高差楼梯右转', exact: true }).click();
await transitionStairUtility.getByRole('button', { name: '交换上下端', exact: true }).click();
await page.waitForTimeout(120);
if ((await transitionStairPanel.getAttribute('data-transition-stair-rotation')) !== '90') {
  throw new Error('City wall transition stair should rotate by explicit player action.');
}
if ((await transitionStairPanel.getAttribute('data-transition-stair-reversed')) !== 'true') {
  throw new Error('City wall transition stair should allow explicit High/Low direction reversal.');
}
await page.screenshot({ path: outDir + '/city-wall-transition-stair-26-rotated-reversed.png' });

await transitionStairBar.getByRole('button', { name: '完成高差楼梯放置', exact: true }).click();
await page.waitForSelector('.city-wall-transition-stair-prototype', { state: 'detached' });
await page.waitForSelector('.workspace[data-design-category="city-wall"]');
await page.waitForTimeout(180);
await page.screenshot({ path: outDir + '/city-wall-transition-stair-27-return-workspace.png' });



// Shared Catalog Rail review: Design and Material must consume the same compact
// rail geometry while selection and pagination keep different visual semantics.
await open('workspace-building', '.workspace[data-design-category="building"]');
const buildingCatalogWorkspace = page.locator('.workspace[data-design-category="building"]');
if (!(await buildingCatalogWorkspace.evaluate((node) => node.classList.contains('workspace--catalog')))) {
  throw new Error('Design Workspace must consume the shared workspace--catalog contract.');
}
const buildingCatalogRail = buildingCatalogWorkspace.locator('.workspace-primary-rail');
if ((await buildingCatalogRail.locator('.workspace-rail-pager button').count()) !== 2) {
  throw new Error('Building Workspace should expose the shared two-page Rail Pager.');
}
await buildingCatalogRail.getByRole('button', { name: '楼阁', exact: true }).click();
await page.waitForTimeout(100);
const buildingSelectedRailItem = buildingCatalogRail.getByRole('button', { name: '楼阁', exact: true });
const buildingRailItemBox = await buildingSelectedRailItem.boundingBox();
const buildingActiveRailPager = buildingCatalogRail.locator('.workspace-rail-pager button.is-active span');
const buildingRailPagerBox = await buildingActiveRailPager.boundingBox();
if (!buildingRailItemBox || !buildingRailPagerBox
  || Math.abs(buildingRailItemBox.height - 29) > 1
  || Math.abs(buildingRailPagerBox.width - 3) > 1
  || Math.abs(buildingRailPagerBox.height - 14) > 1) {
  throw new Error('Building shared Rail geometry regressed. item=' + JSON.stringify(buildingRailItemBox) + ' pager=' + JSON.stringify(buildingRailPagerBox));
}
const buildingRailPagerGap = buildingRailItemBox.x - (buildingRailPagerBox.x + buildingRailPagerBox.width);
if (buildingRailPagerGap < 12) {
  throw new Error('Building Rail Pager must keep a readable gutter before the Selected lane. gap=' + buildingRailPagerGap);
}
const buildingSelectionColor = await buildingSelectedRailItem.evaluate((node) => getComputedStyle(node, '::before').backgroundColor);
const buildingPagerColor = await buildingActiveRailPager.evaluate((node) => getComputedStyle(node).backgroundColor);
if (!buildingSelectionColor || !buildingPagerColor || buildingSelectionColor === buildingPagerColor) {
  throw new Error('Rail selection and pagination must use different visual tones in Design Workspace.');
}
await page.screenshot({ path: outDir + '/workspace-building-rail-selection-vs-page.png' });

await open('gameplay', '.context-utility-toolbar[data-utility-context="world"]');
const worldUtilityForMaterial = page.locator('.context-utility-toolbar[data-utility-context="world"]');
if (await worldUtilityForMaterial.getByRole('button', { name: '灯光调整', exact: true }).count()
  || await worldUtilityForMaterial.getByRole('button', { name: '方案模式', exact: true }).count()) {
  throw new Error('World Utility must expose one 配色工具 entry; Light and Scheme are internal color-tool modes.');
}
await worldUtilityForMaterial.getByRole('button', { name: '配色工具', exact: true }).click();
await page.waitForSelector('.color-tool-surface-panel');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="color-tool"]');
await page.waitForTimeout(260);

const materialPanel = page.locator('.color-tool-surface-panel');
const materialPanelBox = await materialPanel.boundingBox();
if (!materialPanelBox || materialPanelBox.width < 392 || materialPanelBox.width > 408) {
  throw new Error('Material palette panel should stay near 400px wide. width=' + materialPanelBox?.width);
}
if (materialPanelBox.height > 720) {
  throw new Error('Material palette surface panel should fit the 1080p left context safe region. height=' + materialPanelBox.height);
}
if ((await materialPanel.getAttribute('data-material-page')) !== 'surface') {
  throw new Error('Material palette should enter on Surface page.');
}
if ((await materialPanel.getAttribute('data-material-preset-type')) !== '灰泥 / 土'
  || (await materialPanel.getAttribute('data-material-preset-family')) !== 'plaster-earth'
  || (await materialPanel.getAttribute('data-material-preset-name')) !== '素灰墙') {
  throw new Error('Material palette prototype should enter with the seeded plaster/earth preset.');
}

const schemeSelector = materialPanel.getByRole('button', { name: '打开材质方案库', exact: true });
if ((await schemeSelector.count()) !== 1) {
  throw new Error('Surface should expose one current material-scheme selector.');
}
for (const text of ['方案', '灰泥 / 土', '素灰墙']) {
  if ((await schemeSelector.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('Scheme navigation row missing: ' + text);
  }
}
const schemeSelectorBox = await schemeSelector.boundingBox();
if (!schemeSelectorBox || schemeSelectorBox.height > 40) {
  throw new Error('Scheme navigation row should stay compact. height=' + schemeSelectorBox?.height);
}
const schemeStyle = await schemeSelector.evaluate((node) => getComputedStyle(node));
if (schemeStyle.borderTopWidth !== '0px') {
  throw new Error('Scheme navigation must remain borderless by default.');
}

const colorStrip = materialPanel.locator('.material-color-strip');
const metallicColorItems = materialPanel.locator('.material-color-strip__item');
if ((await colorStrip.count()) !== 1 || (await metallicColorItems.count()) !== 3) {
  throw new Error('Metallic workflow should expose one shared Color Strip with exactly three colors.');
}
const metallicLabels = ['主色', '发光', '夜间发光'];
for (let index = 0; index < metallicLabels.length; index += 1) {
  if ((await metallicColorItems.nth(index).getByText(metallicLabels[index], { exact: true }).count()) !== 1) {
    throw new Error('Metallic Color Strip order mismatch at ' + index + ': expected ' + metallicLabels[index]);
  }
}
if (await materialPanel.locator('[data-material-field="SpecularColor"]').count()) {
  throw new Error('SpecularColor must be hidden entirely in default Metallic workflow.');
}
if ((await materialPanel.locator('.material-color-strip__item-meta').filter({ hasText: 'HDR' }).count()) !== 2) {
  throw new Error('Emission and Night Emission should expose two HDR markers.');
}
for (const item of await metallicColorItems.all()) {
  const style = await item.evaluate((node) => getComputedStyle(node));
  if (style.borderTopWidth !== '0px' || style.borderRightWidth !== '0px' || style.borderBottomWidth !== '0px') {
    throw new Error('Color Strip items must not behave like independent bordered cards.');
  }
}

const materialSectionTitles = materialPanel.locator('.left-context-panel__section-title');
for (const requiredSection of ['颜色', '材质属性']) {
  if ((await materialSectionTitles.filter({ hasText: requiredSection }).count()) !== 1) {
    throw new Error('Material Surface section missing: ' + requiredSection);
  }
}
if (await materialSectionTitles.filter({ hasText: '贴图' }).count()) {
  throw new Error('PBR and Texture should remain merged into Material Properties.');
}
for (const retired of ['高光反射', 'Alpha 裁剪', '裁剪阈值']) {
  if (await materialPanel.getByText(retired, { exact: true }).count()) {
    throw new Error('Retired Surface control should not be visible: ' + retired);
  }
}

for (const field of [
  'BaseColor',
  'EmissionColor',
  'NightEmissionColor',
  'Flags.SpecularSetup',
  'Metallic',
  'Smoothness',
  'Occlusion',
  'TextureTiling',
  'TextureBlendSharpness',
]) {
  if ((await materialPanel.locator('[data-material-field="' + field + '"]').count()) !== 1) {
    throw new Error('Material palette field mapping missing: ' + field);
  }
}

const workflowField = materialPanel.locator('[data-material-field="Flags.SpecularSetup"]');
const workflowControl = workflowField.locator('.material-workflow-control');
const workflowBox = await workflowControl.boundingBox();
const metallicFieldBox = await materialPanel.locator('[data-material-field="Metallic"] .ui-numeric-slider-field').boundingBox();
if (!workflowBox || !metallicFieldBox) throw new Error('Material workflow and slider geometry must be measurable.');
if (Math.abs(workflowBox.x - metallicFieldBox.x) > 2 || Math.abs(workflowBox.width - metallicFieldBox.width) > 2) {
  throw new Error('Material workflow must share the same field column as sliders.');
}
const workflowStyle = await workflowControl.evaluate((node) => getComputedStyle(node));
if (workflowStyle.borderTopWidth !== '0px' || workflowStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
  throw new Error('Workflow should stay an inline radio-like parameter without a track.');
}
if ((await workflowControl.locator('.material-workflow-control__indicator').count()) !== 2) {
  throw new Error('Workflow should expose two explicit state dots.');
}

const surfaceFooter = materialPanel.locator('.color-tool-surface-footer');
for (const action of ['恢复默认', '复制参数', '粘贴参数']) {
  if ((await surfaceFooter.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('Surface footer action missing: ' + action);
  }
}
await surfaceFooter.getByRole('button', { name: '复制参数', exact: true }).click();
if ((await materialPanel.getAttribute('data-material-surface-clipboard')) !== 'ready') {
  throw new Error('Surface copy should populate structured tool clipboard.');
}
await page.screenshot({ path: outDir + '/color-tool-28-surface-parameters.png' });

await schemeSelector.click();
await page.waitForSelector('.material-preset-workspace');
await page.waitForTimeout(220);
if ((await materialPanel.getAttribute('data-material-page')) !== 'surface'
  || (await materialPanel.getAttribute('data-material-preset-workspace')) !== 'open') {
  throw new Error('Opening the Scheme Workspace must keep the left Surface parameter page mounted.');
}

const schemeWorkspace = page.locator('.material-preset-workspace');
const schemeWorkspaceBox = await schemeWorkspace.boundingBox();
const materialToolbar = page.locator('.color-tool-toolbar-cluster .tool-action-bar');
const materialToolbarBox = await materialToolbar.boundingBox();
if (!schemeWorkspaceBox || !materialToolbarBox) {
  throw new Error('Scheme Workspace and Material toolbar geometry must be measurable.');
}
const materialPanelRight = materialPanelBox.x + materialPanelBox.width;
if (schemeWorkspaceBox.x < materialPanelRight + 16) {
  throw new Error('Scheme Workspace must not overlap the persistent left Surface panel. gap=' + (schemeWorkspaceBox.x - materialPanelRight));
}
const workspaceCenter = schemeWorkspaceBox.x + schemeWorkspaceBox.width / 2;
if (Math.abs(workspaceCenter - 960) > 4) {
  throw new Error('Scheme Workspace should stay centered above the Material toolbar. center=' + workspaceCenter);
}
if (schemeWorkspaceBox.y + schemeWorkspaceBox.height > materialToolbarBox.y - 6) {
  throw new Error('Scheme Workspace must sit above the bottom Material toolbar without overlap.');
}

if ((await schemeWorkspace.getAttribute('data-material-preset-source')) !== 'all') {
  throw new Error('Scheme Workspace should enter with all sources visible.');
}
const sourceFilter = schemeWorkspace.locator('.material-preset-workspace__source-filter');
for (const sourceLabel of ['全部', '系统内置', '创意工坊', '我的方案']) {
  if ((await sourceFilter.getByRole('button', { name: sourceLabel, exact: true }).count()) !== 1) {
    throw new Error('Material source filter missing: ' + sourceLabel);
  }
}

const schemeRail = schemeWorkspace.locator('.material-preset-workspace__rail');
const materialWorkspaceHeaderPng = schemeWorkspace.locator('.workspace-title .ui-icon[data-ui-icon="palette"]');
const materialWorkspaceClosePng = schemeWorkspace.locator('.workspace-header .icon-button .ui-icon[data-ui-icon="x"]');
const materialFavoriteRail = schemeRail.locator('.workspace-primary-rail__favorite');
const materialRailPngIcons = schemeRail.locator('.workspace-primary-rail__page .ui-icon');
if ((await materialWorkspaceHeaderPng.count()) !== 1
  || (await materialWorkspaceClosePng.count()) !== 1
  || (await materialFavoriteRail.count()) !== 1
  || (await materialRailPngIcons.count()) !== 5) {
  throw new Error('Material Workspace must render header / close, favorite shortcut and the visible category page through UiIcon.');
}
const materialWorkspaceMask = await materialWorkspaceHeaderPng.evaluate((node) => {
  const style = getComputedStyle(node);
  return style.maskImage || style.webkitMaskImage || '';
});
if (!materialWorkspaceMask.includes('/assets/ui/icons/palette.png')) {
  throw new Error('Material Workspace UiIcon must consume the committed PNG runtime asset. mask=' + materialWorkspaceMask);
}
for (const category of ['全部', '木材', '石材', '金属', '砖瓦']) {
  if ((await schemeRail.getByRole('button', { name: category, exact: true }).count()) !== 1) {
    throw new Error('Material family rail first page missing: ' + category);
  }
}
if ((await schemeRail.locator('.workspace-rail-pager button').count()) !== 2) {
  throw new Error('Expanded Material Family rail should use two category pages.');
}
await schemeRail.getByRole('button', { name: '切换到第 2 组材质分类', exact: true }).click();
await page.waitForTimeout(100);
if ((await schemeWorkspace.getAttribute('data-material-category-page')) !== '2') {
  throw new Error('Material Family rail should expose its second page.');
}
for (const category of ['灰泥 / 土', '布料', '玻璃', '漆饰', '其他']) {
  if ((await schemeRail.getByRole('button', { name: category, exact: true }).count()) !== 1) {
    throw new Error('Material family rail second page missing: ' + category);
  }
}
await schemeRail.getByRole('button', { name: '切换到第 1 组材质分类', exact: true }).click();
await page.waitForTimeout(100);

if (!(await schemeWorkspace.evaluate((node) => node.classList.contains('workspace--catalog')))
  || (await schemeWorkspace.evaluate((node) => node.classList.contains('workspace--design')))) {
  throw new Error('Material Scheme must consume workspace--catalog directly instead of inheriting workspace--design.');
}
const materialRailItemBox = await schemeRail.getByRole('button', { name: '金属', exact: true }).boundingBox();
const materialActiveRailPager = schemeRail.locator('.workspace-rail-pager button.is-active span');
const materialRailPagerBox = await materialActiveRailPager.boundingBox();
if (!materialRailItemBox || !materialRailPagerBox
  || Math.abs(materialRailItemBox.height - buildingRailItemBox.height) > 1
  || Math.abs(materialRailPagerBox.width - buildingRailPagerBox.width) > 1
  || Math.abs(materialRailPagerBox.height - buildingRailPagerBox.height) > 1) {
  throw new Error('Design and Material Rail geometry must come from the same catalog contract. materialItem=' + JSON.stringify(materialRailItemBox));
}
const materialRailPagerGap = materialRailItemBox.x - (materialRailPagerBox.x + materialRailPagerBox.width);
if (materialRailPagerGap < 12 || Math.abs(materialRailPagerGap - buildingRailPagerGap) > 3) {
  throw new Error('Material Rail must share the widened Pager→Selected gutter with Design. materialGap=' + materialRailPagerGap + ' buildingGap=' + buildingRailPagerGap);
}
await schemeRail.getByRole('button', { name: '金属', exact: true }).click();
await page.waitForTimeout(100);
const materialSelectedRailItem = schemeRail.getByRole('button', { name: '金属', exact: true });
const materialSelectionColor = await materialSelectedRailItem.evaluate((node) => getComputedStyle(node, '::before').backgroundColor);
const materialPagerColor = await materialActiveRailPager.evaluate((node) => getComputedStyle(node).backgroundColor);
if (!materialSelectionColor || !materialPagerColor
  || materialSelectionColor === materialPagerColor
  || materialPagerColor !== buildingPagerColor) {
  throw new Error('Material Rail Pager must use the same neutral page tone as Design and remain distinct from warm selection.');
}
await page.screenshot({ path: outDir + '/color-tool-29a-rail-neutral-pagination.png' });
await schemeRail.getByRole('button', { name: '全部', exact: true }).click();
await page.waitForTimeout(80);

for (const action of ['保存配色', '粘贴配色']) {
  if ((await schemeWorkspace.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('Material Scheme Workspace action missing: ' + action);
  }
}
if (await schemeWorkspace.getByRole('button', { name: '粘贴配色', exact: true }).isDisabled()) {
  throw new Error('Scheme Workspace paste action should consume the Surface clipboard copied before opening.');
}
if ((await schemeWorkspace.locator('.material-preset-workspace__card').count()) !== 6) {
  throw new Error('All-sources first page should use the Compact 3x2 Workspace card pool.');
}
if ((await schemeWorkspace.locator('.workspace-item-card').count()) !== 6) {
  throw new Error('Every Material Scheme Card should consume the shared WorkspaceItemCard primitive.');
}
if (await schemeWorkspace.locator('.workspace-item-card__preview').count()) {
  throw new Error('Material Scheme Cards must not render placeholder preview images.');
}
if (await schemeWorkspace.locator('.material-preset-workspace__card-swatches').count()) {
  throw new Error('Scheme Cards must not regress to the four-color swatch strip.');
}
const materialColorLines = schemeWorkspace.locator('.material-preset-workspace__color-line');
if ((await materialColorLines.count()) !== 6) {
  throw new Error('Each Scheme Card should expose exactly one subtle BaseColor accent line.');
}
const colorLineBox = await materialColorLines.first().boundingBox();
if (!colorLineBox || colorLineBox.width < 24 || colorLineBox.width > 32 || colorLineBox.height > 4) {
  throw new Error('Material BaseColor must remain a thin accent line, not a preview block. box=' + JSON.stringify(colorLineBox));
}
const sourceBadges = schemeWorkspace.locator('.workspace-item-card__source.is-compact');
if ((await sourceBadges.count()) !== 6) {
  throw new Error('Every visible Material Scheme Card must identify its source through the shared Compact badge.');
}
if ((await schemeWorkspace.locator('.material-preset-workspace__card>.workspace-item-menu-trigger').count()) !== 6) {
  throw new Error('Every visible Material Scheme Card must expose a permanent shared action menu trigger.');
}
if ((await schemeWorkspace.locator('.workspace-item-card__favorite-star').count()) < 1) {
  throw new Error('Favorited Material Cards must show a star after the name.');
}
const firstSourceBadge = sourceBadges.first();
const firstSourceBadgeInMeta = await firstSourceBadge.evaluate(node => node.parentElement?.classList.contains('material-preset-workspace__card-meta') ?? false);
if (!firstSourceBadgeInMeta) {
  throw new Error('Material source badge must remain owned by the Compact Card metadata line rather than returning to the title row.');
}
const firstMaterialCardBox = await schemeWorkspace.locator('.workspace-item-card').first().boundingBox();
if (!firstMaterialCardBox || Math.abs(firstMaterialCardBox.height - 64) > 1) {
  throw new Error('Material Scheme Card must match shared WorkspaceItemCard 64px height. box=' + JSON.stringify(firstMaterialCardBox));
}
const firstMaterialCardStyle = await schemeWorkspace.locator('.workspace-item-card').first().evaluate((node) => getComputedStyle(node));
if (firstMaterialCardStyle.borderTopWidth !== '0px') {
  throw new Error('Shared WorkspaceItemCard must remain borderless by default.');
}
if ((await schemeWorkspace.locator('.material-preset-workspace__pager button').count()) !== 2) {
  throw new Error('All source presets should produce a two-page Workspace pager.');
}
await page.screenshot({ path: outDir + '/color-tool-29-scheme-workspace-families.png' });

await sourceFilter.getByRole('button', { name: '创意工坊', exact: true }).click();
await page.waitForTimeout(100);
if ((await schemeWorkspace.getAttribute('data-material-preset-source')) !== 'workshop') {
  throw new Error('Workshop source filter should expose workshop state.');
}
if ((await schemeWorkspace.locator('.material-preset-workspace__card').count()) !== 3) {
  throw new Error('Workshop filter should expose the three demo workshop schemes.');
}
await page.screenshot({ path: outDir + '/color-tool-29b-scheme-workshop.png' });

await sourceFilter.getByRole('button', { name: '系统内置', exact: true }).click();
await schemeRail.getByRole('button', { name: '木材', exact: true }).click();
await page.waitForTimeout(100);
if ((await schemeWorkspace.locator('.material-preset-workspace__card').count()) !== 3) {
  throw new Error('System + Wood family filters should expose three schemes.');
}
await schemeWorkspace.getByRole('button', { name: '应用材质方案 木材 · 深胡桃', exact: true }).click();
await page.waitForTimeout(100);
if ((await materialPanel.getAttribute('data-material-preset-type')) !== '木材'
  || (await materialPanel.getAttribute('data-material-preset-family')) !== 'wood'
  || (await materialPanel.getAttribute('data-material-preset-name')) !== '深胡桃') {
  throw new Error('Applying a central Workspace scheme should live-update the left Surface panel.');
}
if ((await schemeWorkspace.count()) !== 1) {
  throw new Error('Applying a scheme should keep the central Workspace open for comparison.');
}
await page.screenshot({ path: outDir + '/color-tool-30-scheme-live-apply.png' });

await materialPanel.getByRole('button', { name: '光滑度增大', exact: true }).click();
await page.waitForTimeout(80);
if ((await materialPanel.getAttribute('data-material-preset-type')) !== '自定义'
  || (await materialPanel.getAttribute('data-material-preset-family')) !== 'custom'
  || (await materialPanel.getAttribute('data-material-preset-name')) !== '未保存') {
  throw new Error('Manual edits should mark the applied preset as Custom / Unsaved.');
}

await sourceFilter.getByRole('button', { name: '我的方案', exact: true }).click();
await schemeRail.getByRole('button', { name: '金属', exact: true }).click();
await page.waitForTimeout(100);
if ((await schemeWorkspace.getAttribute('data-material-preset-source')) !== 'mine'
  || (await schemeWorkspace.getAttribute('data-material-preset-category')) !== 'metal') {
  throw new Error('My Schemes should preserve the selected Material Family filter before saving.');
}
if ((await schemeWorkspace.getByText('还没有保存的我的方案', { exact: true }).count()) !== 1) {
  throw new Error('My Schemes should show an empty state before the first save.');
}

await schemeWorkspace.getByRole('button', { name: '保存配色', exact: true }).click();
await page.waitForSelector('.ui-dialog');
const saveDialog = page.locator('.ui-dialog');
if ((await saveDialog.getByRole('heading', { name: '保存配色', exact: true }).count()) !== 1) {
  throw new Error('Save Material Scheme should use the shared metadata dialog.');
}
const saveFamilyGrid = saveDialog.locator('.ui-dialog-choice-grid');
if ((await saveFamilyGrid.getByRole('radio').count()) !== 9) {
  throw new Error('Save Material Scheme should expose all nine Material Families as a flat grid.');
}
if (await saveDialog.locator('.ui-dialog-choice-trigger').count()) {
  throw new Error('Material Family selection should not use a dropdown when all families fit in the dialog.');
}
if ((await saveFamilyGrid.getByRole('radio', { name: '金属', exact: true }).getAttribute('aria-checked')) !== 'true') {
  throw new Error('Save Material Scheme should default to the currently selected Rail family instead of CurrentFamily.');
}
for (const familyName of ['木材', '石材', '金属', '砖瓦', '灰泥 / 土', '布料', '玻璃', '漆饰', '其他']) {
  if ((await saveFamilyGrid.getByRole('radio', { name: familyName, exact: true }).count()) !== 1) {
    throw new Error('Save Material Family grid missing: ' + familyName);
  }
}
const saveName = saveDialog.getByRole('textbox');
await saveName.fill('城墙暖灰');
await saveFamilyGrid.getByRole('radio', { name: '石材', exact: true }).click();
await page.screenshot({ path: outDir + '/color-tool-31-save-family-grid.png' });
await saveDialog.getByRole('button', { name: '保存', exact: true }).click();
await page.waitForSelector('.ui-dialog', { state: 'detached' });
await page.waitForTimeout(120);

if ((await materialPanel.getAttribute('data-material-preset-name')) !== '城墙暖灰'
  || (await materialPanel.getAttribute('data-material-preset-type')) !== '石材'
  || (await materialPanel.getAttribute('data-material-preset-family')) !== 'stone') {
  throw new Error('Save dialog should persist the custom name and chosen Material Family.');
}
if ((await schemeWorkspace.getAttribute('data-material-preset-source')) !== 'mine'
  || (await schemeWorkspace.getAttribute('data-material-preset-category')) !== 'stone') {
  throw new Error('Saving a scheme should navigate the Workspace to My Schemes + chosen Material Family.');
}
if ((await schemeWorkspace.getByRole('button', { name: '应用材质方案 石材 · 城墙暖灰', exact: true }).count()) !== 1) {
  throw new Error('Saved scheme should stay visible after the Workspace navigates to its family.');
}

const savedMaterialCard = schemeWorkspace.locator('.material-preset-workspace__card').filter({ hasText: '城墙暖灰' });
const savedMaterialSource = savedMaterialCard.locator('.workspace-item-card__source.is-compact.is-user');
if ((await savedMaterialSource.count()) !== 1) {
  throw new Error('My Scheme source must use the shared Compact user badge.');
}
const savedMaterialMenuTrigger = savedMaterialCard.getByRole('button', { name: '方案操作 城墙暖灰', exact: true });
if (!(await savedMaterialMenuTrigger.evaluate(node => node.classList.contains('workspace-item-menu-trigger') && node.classList.contains('is-compact')))) {
  throw new Error('My Scheme management action must use the shared Compact menu trigger.');
}
const [savedMaterialCardBox, savedMaterialTriggerBox, savedMaterialSourceBox] = await Promise.all([
  savedMaterialCard.boundingBox(),
  savedMaterialMenuTrigger.boundingBox(),
  savedMaterialSource.boundingBox(),
]);
if (!savedMaterialCardBox || !savedMaterialTriggerBox || !savedMaterialSourceBox
  || savedMaterialTriggerBox.y >= savedMaterialSourceBox.y
  || Math.abs((savedMaterialCardBox.x + savedMaterialCardBox.width) - (savedMaterialTriggerBox.x + savedMaterialTriggerBox.width)) > 12
  || Math.abs((savedMaterialTriggerBox.x + savedMaterialTriggerBox.width) - (savedMaterialSourceBox.x + savedMaterialSourceBox.width)) > 12) {
  throw new Error('Compact Card must use a two-line right column: action trigger on top, source badge directly below.');
}
await schemeWorkspace.getByRole('button', { name: '应用材质方案 石材 · 城墙暖灰', exact: true }).hover();
await page.waitForTimeout(540);
const materialHoverCard = page.locator('.ui-hover-card[data-ready="true"]');
if ((await materialHoverCard.count()) !== 1
  || (await materialHoverCard.getByText('材质分类', { exact: true }).count()) !== 1
  || (await materialHoverCard.getByText('石材', { exact: true }).count()) !== 1
  || (await materialHoverCard.getByText('工作流', { exact: true }).count()) !== 1) {
  throw new Error('Material Preset Workspace must use the shared rich Hover Card.');
}
await page.screenshot({ path: outDir + '/hover-card-material-preset.png' });
await schemeWorkspace.getByRole('button', { name: '方案操作 城墙暖灰', exact: true }).click();
await page.waitForSelector('.material-preset-workspace__card-menu');
let presetMenu = schemeWorkspace.locator('.material-preset-workspace__card-menu');
if (!(await presetMenu.evaluate(node => node.classList.contains('workspace-item-menu') && node.classList.contains('is-compact')))) {
  throw new Error('My Scheme popover must reuse the shared Compact Workspace Item Menu.');
}
for (const menuAction of ['收藏', '编辑', '复制参数', '删除']) {
  if ((await presetMenu.getByRole('menuitem', { name: menuAction, exact: true }).count()) !== 1) {
    throw new Error('My Scheme menu missing action: ' + menuAction);
  }
}
for (const retiredAction of ['重命名', '移动分类…']) {
  if (await presetMenu.getByRole('menuitem', { name: retiredAction, exact: true }).count()) {
    throw new Error('Retired My Scheme action should not remain: ' + retiredAction);
  }
}
if (await presetMenu.getByRole('option').count()) {
  throw new Error('My Scheme main menu must not inline Material Family choices.');
}
await page.screenshot({ path: outDir + '/color-tool-32-mine-edit-menu.png' });

await presetMenu.getByRole('menuitem', { name: '编辑', exact: true }).click();
await page.waitForSelector('.ui-dialog');
const editDialog = page.locator('.ui-dialog');
if ((await editDialog.getByRole('heading', { name: '编辑方案', exact: true }).count()) !== 1) {
  throw new Error('My Scheme Edit should reuse the metadata dialog.');
}
const editFamilyGrid = editDialog.locator('.ui-dialog-choice-grid');
if ((await editFamilyGrid.getByRole('radio').count()) !== 9) {
  throw new Error('Edit Material Scheme should expose all nine Material Families as a flat grid.');
}
await editDialog.getByRole('textbox').fill('城墙暖灰二号');
await editFamilyGrid.getByRole('radio', { name: '玻璃', exact: true }).click();
await page.screenshot({ path: outDir + '/color-tool-32b-edit-family-grid.png' });
await editDialog.getByRole('button', { name: '保存修改', exact: true }).click();
await page.waitForSelector('.ui-dialog', { state: 'detached' });
await page.waitForTimeout(120);

if ((await materialPanel.getAttribute('data-material-preset-name')) !== '城墙暖灰二号'
  || (await materialPanel.getAttribute('data-material-preset-family')) !== 'glass') {
  throw new Error('Edit should update both selected My Scheme name and Material Family.');
}
if ((await schemeWorkspace.getAttribute('data-material-preset-source')) !== 'mine'
  || (await schemeWorkspace.getAttribute('data-material-preset-category')) !== 'glass'
  || (await schemeWorkspace.getAttribute('data-material-category-page')) !== '2') {
  throw new Error('Editing a scheme into Glass should navigate to the second Rail page and Glass filter.');
}
if ((await schemeRail.getByRole('button', { name: '玻璃', exact: true }).getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Edited Material Family should become the selected Rail filter.');
}
if ((await schemeWorkspace.getByRole('button', { name: '应用材质方案 玻璃 · 城墙暖灰二号', exact: true }).count()) !== 1) {
  throw new Error('Edited scheme should remain visible in its new family.');
}
if ((await schemeWorkspace.getAttribute('data-material-highlight-preset')) !== 'custom-1') {
  throw new Error('Edited scheme should receive local reveal feedback instead of a global move toast.');
}

await schemeRail.getByRole('button', { name: '切换到第 1 组材质分类', exact: true }).click();
await page.waitForTimeout(80);
const draggableScheme = schemeWorkspace.getByRole('button', { name: '应用材质方案 玻璃 · 城墙暖灰二号', exact: true });
const woodDropTarget = schemeRail.getByRole('button', { name: '木材', exact: true });
await draggableScheme.dragTo(woodDropTarget);
await page.waitForTimeout(140);

if ((await schemeWorkspace.getAttribute('data-material-preset-category')) !== 'wood'
  || (await schemeWorkspace.getAttribute('data-material-category-page')) !== '1') {
  throw new Error('Successful Drag Move should select the target Material Family and its Rail page.');
}
if ((await woodDropTarget.getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Successful Drag Move should visibly select the target Rail category.');
}
if ((await schemeWorkspace.getByRole('button', { name: '应用材质方案 木材 · 城墙暖灰二号', exact: true }).count()) !== 1) {
  throw new Error('Dragged My Scheme should remain visible after switching to the target family.');
}
if (await page.getByRole('button', { name: '撤销', exact: true }).count()) {
  throw new Error('Material Family move should not create a global Undo toast.');
}
if ((await schemeWorkspace.getAttribute('data-material-highlight-preset')) !== 'custom-1') {
  throw new Error('Drag Move should use local Card reveal feedback.');
}
await page.screenshot({ path: outDir + '/color-tool-33-drag-move-selects-family.png' });

await schemeWorkspace.getByRole('button', { name: '应用材质方案 木材 · 城墙暖灰二号', exact: true }).hover();
await schemeWorkspace.getByRole('button', { name: '方案操作 城墙暖灰二号', exact: true }).click();
await page.waitForSelector('.material-preset-workspace__card-menu');
presetMenu = schemeWorkspace.locator('.material-preset-workspace__card-menu');
await presetMenu.getByRole('menuitem', { name: '复制参数', exact: true }).click();
if ((await materialPanel.getAttribute('data-material-surface-clipboard')) !== 'ready') {
  throw new Error('Copy Parameters from My Scheme should populate the shared Surface clipboard.');
}

await schemeWorkspace.getByRole('button', { name: '粘贴配色', exact: true }).click();
await page.waitForTimeout(80);
if ((await materialPanel.getAttribute('data-material-preset-name')) !== '未保存') {
  throw new Error('Pasting Surface parameters from the Workspace should return CurrentScheme to unsaved custom.');
}

await schemeWorkspace.getByRole('button', { name: '应用材质方案 木材 · 城墙暖灰二号', exact: true }).hover();
await schemeWorkspace.getByRole('button', { name: '方案操作 城墙暖灰二号', exact: true }).click();
await page.waitForSelector('.material-preset-workspace__card-menu');
await schemeWorkspace.locator('.material-preset-workspace__card-menu').getByRole('menuitem', { name: '删除', exact: true }).click();
await page.waitForSelector('.ui-dialog');
const deleteDialog = page.locator('.ui-dialog');
await deleteDialog.getByRole('button', { name: '删除', exact: true }).click();
await page.waitForSelector('.ui-dialog', { state: 'detached' });
await page.waitForTimeout(80);
if (await schemeWorkspace.getByRole('button', { name: /城墙暖灰二号/ }).count()) {
  throw new Error('Deleted My Scheme should disappear from the catalog.');
}

await schemeWorkspace.getByRole('button', { name: '关闭材质方案工作区', exact: true }).click();
await page.waitForSelector('.material-preset-workspace', { state: 'detached' });
await page.waitForTimeout(80);
if ((await materialPanel.getAttribute('data-material-page')) !== 'surface') {
  throw new Error('Closing the central Scheme Workspace should leave Surface parameters open.');
}

await materialPanel.getByRole('button', { name: '高光', exact: true }).click();
await page.waitForTimeout(100);
if ((await materialPanel.getAttribute('data-material-workflow')) !== 'specular') {
  throw new Error('Specular workflow should map to Flags.SpecularSetup.');
}
if (await materialPanel.locator('[data-material-field="Metallic"]').count()) {
  throw new Error('Metallic should hide in Specular workflow.');
}
const specularItems = materialPanel.locator('.material-color-strip__item');
if ((await specularItems.count()) !== 4) {
  throw new Error('Specular workflow should expand the Color Strip to four colors.');
}
const specularLabels = ['主色', '发光', '夜间发光', '高光'];
for (let index = 0; index < specularLabels.length; index += 1) {
  if ((await specularItems.nth(index).getByText(specularLabels[index], { exact: true }).count()) !== 1) {
    throw new Error('Specular Color Strip order mismatch at ' + index + ': expected ' + specularLabels[index]);
  }
}
if ((await materialPanel.locator('[data-material-field="SpecularColor"]').count()) !== 1) {
  throw new Error('SpecularColor should appear only in Specular workflow and stay last.');
}
await materialPanel.getByRole('button', { name: '调整主色', exact: true }).click();
await page.waitForTimeout(220);
const baseEditor = materialPanel.locator('.material-color-editor[data-color-editor-target="BaseColor"]');
if ((await materialPanel.locator('.left-context-panel__back-button .ui-icon[data-ui-icon="arrow-left"]').count()) !== 1) {
  throw new Error('LeftContextPanel back action must use the PNG UiIcon pilot asset.');
}
if ((await baseEditor.getAttribute('data-color-numeric-mode')) !== 'rgb') {
  throw new Error('Color Editor should default to RGB numeric mode.');
}
for (const channel of ['R', 'G', 'B']) {
  if ((await baseEditor.locator('[data-color-channel="' + channel + '"]').count()) !== 1) {
    throw new Error('RGB mode missing channel ' + channel);
  }
}
const baseHex = baseEditor.getByRole('textbox', { name: '十六进制颜色', exact: true });
await baseHex.fill('#C7AA78');
await baseHex.press('Enter');
await baseEditor.getByRole('button', { name: 'HSV', exact: true }).click();
await page.waitForTimeout(80);
if ((await baseEditor.getAttribute('data-color-numeric-mode')) !== 'hsv') {
  throw new Error('Color Editor should switch to HSV numeric mode.');
}
for (const channel of ['H', 'S', 'V']) {
  if ((await baseEditor.locator('[data-color-channel="' + channel + '"]').count()) !== 1) {
    throw new Error('HSV mode missing channel ' + channel);
  }
}
const colorFooter = materialPanel.locator('.color-tool-surface-footer');
await colorFooter.getByRole('button', { name: '复制颜色', exact: true }).click();
if ((await materialPanel.getAttribute('data-material-color-clipboard')) !== 'ready') {
  throw new Error('Color copy should populate structured color clipboard.');
}
await page.screenshot({ path: outDir + '/color-tool-32-base-color-hsv.png' });

await materialPanel.getByRole('button', { name: '返回表面参数', exact: true }).click();
await page.waitForTimeout(220);
await materialPanel.getByRole('button', { name: '调整发光', exact: true }).click();
await page.waitForTimeout(220);
const emissionEditor = materialPanel.locator('.material-color-editor[data-color-editor-target="EmissionColor"]');
if ((await emissionEditor.getAttribute('data-color-editor-hdr')) !== 'true'
  || (await emissionEditor.locator('[data-color-adapter="EmissionColor.Intensity"]').count()) !== 1) {
  throw new Error('EmissionColor must use HDR editor with intensity.');
}
await page.screenshot({ path: outDir + '/color-tool-33-emission-hdr-rgb.png' });

await materialPanel.getByRole('button', { name: '返回表面参数', exact: true }).click();
await page.waitForTimeout(220);
await materialPanel.getByRole('button', { name: '调整夜间发光', exact: true }).click();
await page.waitForTimeout(220);
const nightEditor = materialPanel.locator('.material-color-editor[data-color-editor-target="NightEmissionColor"]');
if ((await nightEditor.getAttribute('data-color-editor-hdr')) !== 'true'
  || (await nightEditor.locator('[data-color-adapter="NightEmissionColor.Intensity"]').count()) !== 1) {
  throw new Error('NightEmissionColor must use HDR editor with intensity.');
}
await page.screenshot({ path: outDir + '/color-tool-34-night-emission-hdr.png' });

await materialPanel.getByRole('button', { name: '返回表面参数', exact: true }).click();
await page.waitForTimeout(220);
const materialBar = page.locator('.color-tool-toolbar-cluster .tool-action-bar');
const colorToolPngModeIcons = materialBar.locator('.placement-action-bar__button--mode .ui-icon');
if ((await colorToolPngModeIcons.count()) !== 3
  || (await materialBar.locator('.placement-action-bar__button--mode svg').count()) !== 0) {
  throw new Error('ColorToolDock mode icons must use PNG UiIcon assets during the pilot.');
}
const colorToolModeIconIds = await colorToolPngModeIcons.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-ui-icon')));
if (colorToolModeIconIds.join(',') !== 'layers-3,lightbulb,palette') {
  throw new Error('ColorToolDock PNG icon ids drifted: ' + colorToolModeIconIds.join(','));
}
for (const modeLabel of ['表面模式', '灯光模式', '方案模式']) {
  if ((await materialBar.getByRole('button', { name: modeLabel, exact: true }).count()) !== 1) {
    throw new Error('配色工具 should expose internal mode: ' + modeLabel);
  }
}

// Lighting is an internal mode of the same Material Palette Tool.
await materialBar.getByRole('button', { name: '灯光模式', exact: true }).click();
await page.waitForSelector('.light-adjustment-panel');
await page.waitForSelector('.color-tool-surface-panel', { state: 'detached' });
await page.waitForTimeout(160);

const lightPanel = page.locator('.light-adjustment-panel');
if ((await lightPanel.locator('.left-context-panel__heading-icon .ui-icon[data-ui-icon="lightbulb"]').count()) !== 1
  || (await lightPanel.locator('.left-context-panel__header .icon-button .ui-icon[data-ui-icon="x"]').count()) !== 1) {
  throw new Error('Lighting LeftContextPanel must use PNG heading and close icons during the pilot.');
}
if ((await page.locator('.color-tool-toolbar-cluster').count()) !== 1
  || (await page.locator('.context-utility-toolbar[data-utility-context="color-tool"]').count()) !== 1) {
  throw new Error('Switching to Lighting must keep the same color-tool dock and utility context.');
}
if ((await lightPanel.getAttribute('data-light-adjustment-selected')) !== 'none'
  || (await lightPanel.getAttribute('data-light-adjustment-page')) !== 'parameters') {
  throw new Error('Lighting mode should enter with no selected scene light.');
}
if ((await page.locator('.workspace').count()) !== 0) {
  throw new Error('Lighting mode must not create a central Workspace.');
}
if ((await lightPanel.locator('.left-context-panel__footer').count()) !== 0) {
  throw new Error('Lighting mode should not add a footer or preset actions.');
}
if ((await page.locator('.light-adjustment-handle').count()) !== 4) {
  throw new Error('Lighting prototype should expose four selectable scene light handles.');
}
if ((await lightPanel.getByText('选择一盏场景灯光', { exact: true }).count()) !== 1) {
  throw new Error('Lighting mode should explain scene selection before a light is selected.');
}
await page.screenshot({ path: outDir + '/color-tool-35-lighting-mode-empty.png' });

await page.getByRole('button', { name: '选择灯光 城门灯笼 03', exact: true }).click();
await page.waitForTimeout(120);
if ((await lightPanel.getAttribute('data-light-adjustment-selected')) !== 'gate-lantern-03') {
  throw new Error('Clicking a scene light should bind that light to the left panel.');
}
if ((await lightPanel.getByText('城门灯笼 03', { exact: true }).count()) !== 1) {
  throw new Error('Selected scene light name should appear in the panel header.');
}
for (const label of ['亮度', '范围']) {
  if ((await lightPanel.getByText(label, { exact: true }).count()) < 1) {
    throw new Error('Selected Light panel missing parameter: ' + label);
  }
}
if ((await lightPanel.getByRole('button', { name: '调整灯光颜色', exact: true }).count()) !== 1) {
  throw new Error('Selected Light panel should expose HDR color editing.');
}
const lightColorField = lightPanel.locator('.ui-color-parameter-field[data-color-parameter-hdr="true"]');
if ((await lightColorField.count()) !== 1) {
  throw new Error('Light parameters should consume the shared HDR ColorParameterField.');
}
const lightColorControl = lightColorField.locator('.ui-color-parameter-field__control');
const lightColorPreview = lightColorControl.locator('.ui-color-parameter-field__preview');
const lightColorFill = lightColorControl.locator('.ui-color-parameter-field__fill');
const lightColorMeta = lightColorControl.locator('.ui-color-parameter-field__meta');
const lightHdrBadge = lightColorControl.locator('.ui-color-parameter-field__hdr');
if ((await lightHdrBadge.getByText('HDR', { exact: true }).count()) !== 1) {
  throw new Error('HDR status must remain readable in the shared color field.');
}
const lightColorControlBox = await lightColorControl.boundingBox();
const lightColorPreviewBox = await lightColorPreview.boundingBox();
const lightColorMetaBox = await lightColorMeta.boundingBox();
const firstLightNumericField = lightPanel.locator('.ui-numeric-slider-field').first();
const firstLightNumericBox = await firstLightNumericField.boundingBox();
const lightHdrBadgeBox = await lightHdrBadge.boundingBox();
const lightColorFillOpacity = Number(await lightColorFill.evaluate((node) => getComputedStyle(node).opacity));
const lightHdrFontSize = Number.parseFloat(await lightHdrBadge.evaluate((node) => getComputedStyle(node).fontSize));
if (!lightColorControlBox || !lightColorPreviewBox || !lightColorMetaBox || !firstLightNumericBox || !lightHdrBadgeBox
  || Math.abs(lightColorControlBox.x - firstLightNumericBox.x) > 1
  || Math.abs(lightColorControlBox.width - firstLightNumericBox.width) > 1) {
  throw new Error('Shared ColorParameterField must align with NumericSliderField. color=' + JSON.stringify(lightColorControlBox) + ' slider=' + JSON.stringify(firstLightNumericBox));
}
const previewRatio = lightColorPreviewBox.width / lightColorControlBox.width;
if (lightColorPreviewBox.height < 16
  || lightColorPreviewBox.height > 20
  || previewRatio < 0.68
  || previewRatio > 0.86
  || lightColorFillOpacity > 0.76
  || lightHdrFontSize < 9.5) {
  throw new Error('Shared Light color field visual contract regressed.');
}
if (lightHdrBadgeBox.x < lightColorMetaBox.x
  || lightHdrBadgeBox.x + lightHdrBadgeBox.width > lightColorMetaBox.x + lightColorMetaBox.width) {
  throw new Error('HDR label must stay in the neutral meta area.');
}
await page.screenshot({ path: outDir + '/color-tool-36-lighting-selected.png' });

await lightPanel.getByRole('button', { name: '调整灯光颜色', exact: true }).click();
await page.waitForTimeout(120);
const lightColorEditor = lightPanel.locator('.shared-color-editor[data-color-editor-target="LightColor"]');
if ((await lightPanel.getAttribute('data-light-adjustment-page')) !== 'color'
  || (await lightColorEditor.getAttribute('data-color-editor-hdr')) !== 'true'
  || (await lightColorEditor.locator('[data-color-adapter="LightColor.Intensity"]').count()) !== 1) {
  throw new Error('Lighting mode must retain the shared HDR Color Editor.');
}
await page.screenshot({ path: outDir + '/color-tool-37-lighting-hdr-editor.png' });

// Scheme is the third mode in the same color tool.
await materialBar.getByRole('button', { name: '方案模式', exact: true }).click();
await page.waitForSelector('.building-scheme-panel');
await page.waitForSelector('.light-adjustment-panel', { state: 'detached' });
await page.waitForTimeout(160);

const buildingSchemePanel = page.locator('.building-scheme-panel');
if ((await buildingSchemePanel.locator('.left-context-panel__heading-icon .ui-icon[data-ui-icon="palette"]').count()) !== 1) {
  throw new Error('Scheme LeftContextPanel heading must use PNG UiIcon during the pilot.');
}
if ((await page.locator('.color-tool-toolbar-cluster').count()) !== 1
  || (await page.locator('.context-utility-toolbar[data-utility-context="color-tool"]').count()) !== 1) {
  throw new Error('Scheme mode must remain inside the same color-tool shell.');
}
if ((await buildingSchemePanel.getAttribute('data-building-selected')) !== 'none') {
  throw new Error('Scheme mode should enter without a selected building.');
}
if ((await page.locator('.building-scheme-workspace').count()) !== 0) {
  throw new Error('Building Scheme Workspace must stay closed until a building scheme selector is opened.');
}
if ((await page.locator('.building-scheme-handle').count()) !== 4) {
  throw new Error('Scheme mode prototype should expose four selectable building handles.');
}
if ((await buildingSchemePanel.getByText('选择一栋场景建筑', { exact: true }).count()) !== 1) {
  throw new Error('Scheme mode should explain building selection before a building is selected.');
}
await page.screenshot({ path: outDir + '/color-tool-38-scheme-mode-empty.png' });

await page.getByRole('button', { name: '选择建筑 重檐楼阁 03', exact: true }).click();
await page.waitForTimeout(100);
if ((await buildingSchemePanel.getAttribute('data-building-selected')) !== 'tower-03'
  || (await buildingSchemePanel.getAttribute('data-building-scheme-name')) !== '江南素雅') {
  throw new Error('Selecting a building should bind its current appearance to the left panel.');
}
if ((await buildingSchemePanel.getByRole('button', { name: '打开建筑配色方案', exact: true }).count()) !== 1
  || (await buildingSchemePanel.getByText('做旧程度', { exact: true }).count()) !== 1) {
  throw new Error('Selected building should expose Scheme and Weathering.');
}
await page.screenshot({ path: outDir + '/color-tool-39-scheme-building-panel.png' });

await buildingSchemePanel.getByRole('button', { name: '打开建筑配色方案', exact: true }).click();
await page.waitForSelector('.building-scheme-workspace');
await page.waitForTimeout(120);
const buildingSchemeWorkspace = page.locator('.building-scheme-workspace');
if (!(await buildingSchemeWorkspace.evaluate((node) => node.classList.contains('workspace--catalog')))
  || (await buildingSchemePanel.count()) !== 1) {
  throw new Error('Scheme mode Workspace must reuse Catalog and coexist with Building Appearance.');
}
const buildingStyleRail = buildingSchemeWorkspace.locator('.building-scheme-workspace__rail');
if ((await buildingStyleRail.locator('.workspace-primary-rail__favorite').count()) !== 1) {
  throw new Error('Building Scheme rail must expose the shared favorite shortcut.');
}
for (const styleLabel of ['全部', '素雅', '沉稳', '明快', '华丽']) {
  if ((await buildingStyleRail.getByRole('button', { name: styleLabel, exact: true }).count()) !== 1) {
    throw new Error('Building Scheme style rail first page missing: ' + styleLabel);
  }
}
if ((await buildingStyleRail.locator('.workspace-rail-pager button').count()) !== 2) {
  throw new Error('Building Scheme style rail must paginate after adding Favorite.');
}
await buildingStyleRail.getByRole('button', { name: '切换到第 2 组配色风格', exact: true }).click();
await page.waitForTimeout(80);
for (const styleLabel of ['自然', '其他']) {
  if ((await buildingStyleRail.getByRole('button', { name: styleLabel, exact: true }).count()) !== 1) {
    throw new Error('Building Scheme style rail second page missing: ' + styleLabel);
  }
}
await buildingStyleRail.getByRole('button', { name: '切换到第 1 组配色风格', exact: true }).click();
await page.waitForTimeout(80);
const buildingSourceFilter = buildingSchemeWorkspace.locator('.building-scheme-workspace__source-filter');
for (const sourceLabel of ['全部', '系统内置', '创意工坊', '玩家方案']) {
  if ((await buildingSourceFilter.getByRole('button', { name: sourceLabel, exact: true }).count()) !== 1) {
    throw new Error('Building Scheme source filter missing: ' + sourceLabel);
  }
}
if ((await buildingSchemeWorkspace.locator('.workspace-item-card').count()) !== 6
  || await buildingSchemeWorkspace.locator('.workspace-item-card__preview').count()) {
  throw new Error('Building Scheme first page must reuse the Compact 3×2 card family without fake thumbnails.');
}
if ((await buildingSchemeWorkspace.locator('.building-scheme-workspace__card>.workspace-item-menu-trigger').count()) !== 6) {
  throw new Error('Every visible Building Scheme Card must expose the permanent shared action menu trigger.');
}
if ((await buildingSchemeWorkspace.locator('.workspace-item-card__favorite-star').count()) < 1) {
  throw new Error('Favorited Building Scheme Cards must show a star after the name.');
}
if ((await buildingSchemeWorkspace.getByRole('button', { name: '应用建筑配色方案 江南素雅', exact: true }).getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Current building scheme should be selected.');
}
await page.screenshot({ path: outDir + '/color-tool-40-scheme-workspace.png' });

const currentBuildingSchemeCard = buildingSchemeWorkspace.getByRole('button', { name: '应用建筑配色方案 江南素雅', exact: true });
await currentBuildingSchemeCard.hover();
await page.waitForTimeout(540);
const buildingSchemeHoverCard = page.locator('.ui-hover-card[data-ready="true"]');
if ((await buildingSchemeHoverCard.count()) !== 1
  || (await buildingSchemeHoverCard.getByText('来源', { exact: true }).count()) !== 1
  || (await buildingSchemeHoverCard.getByText('风格', { exact: true }).count()) !== 1
  || (await buildingSchemeHoverCard.getByText('素雅', { exact: true }).count()) !== 1) {
  throw new Error('Building Scheme Workspace must use the shared rich Hover Card.');
}
await page.screenshot({ path: outDir + '/hover-card-building-scheme.png' });

await buildingSchemeWorkspace.getByRole('button', { name: '应用建筑配色方案 皇家朱金', exact: true }).click();
await page.waitForTimeout(90);
if ((await buildingSchemePanel.getAttribute('data-building-scheme-name')) !== '皇家朱金'
  || (await buildingSchemeWorkspace.count()) !== 1) {
  throw new Error('Applying a building scheme should update the left panel while keeping the Workspace open.');
}
await page.getByRole('button', { name: '选择建筑 临街客栈 07', exact: true }).click();
await page.waitForTimeout(90);
if ((await buildingSchemePanel.getAttribute('data-building-selected')) !== 'inn-07'
  || (await buildingSchemePanel.getAttribute('data-building-scheme-name')) !== '墨瓦沉木'
  || (await buildingSchemeWorkspace.count()) !== 1) {
  throw new Error('Selecting another building should rebind Panel and Workspace without leaving Scheme mode.');
}
await page.screenshot({ path: outDir + '/color-tool-41-scheme-rebind.png' });

await buildingSourceFilter.getByRole('button', { name: '创意工坊', exact: true }).click();
await buildingStyleRail.getByRole('button', { name: '切换到第 2 组配色风格', exact: true }).click();
await buildingStyleRail.getByRole('button', { name: '自然', exact: true }).click();
await page.waitForTimeout(80);
if ((await buildingSchemeWorkspace.locator('.workspace-item-card').count()) !== 1
  || (await buildingSchemeWorkspace.getByRole('button', { name: '应用建筑配色方案 秋庭暖木', exact: true }).count()) !== 1) {
  throw new Error('Scheme mode source × style filters should combine correctly.');
}
await page.screenshot({ path: outDir + '/color-tool-42-scheme-filter.png' });

await buildingSchemeWorkspace.getByRole('button', { name: '关闭建筑配色方案工作区', exact: true }).click();
await page.waitForSelector('.building-scheme-workspace', { state: 'detached' });

// Switching modes does not leave the color tool.
await materialBar.getByRole('button', { name: '表面模式', exact: true }).click();
await page.waitForSelector('.color-tool-surface-panel');
await page.waitForSelector('.building-scheme-panel', { state: 'detached' });
if ((await page.locator('.color-tool-toolbar-cluster').count()) !== 1) {
  throw new Error('Returning to Surface should keep the same color-tool dock.');
}
await page.screenshot({ path: outDir + '/color-tool-43-return-surface-mode.png' });

await materialBar.getByRole('button', { name: '完成配色', exact: true }).click();
await page.waitForSelector('.color-tool-toolbar-cluster', { state: 'detached' });
await page.waitForSelector('.context-utility-toolbar[data-utility-context="world"]');
await page.waitForTimeout(160);
await page.screenshot({ path: outDir + '/color-tool-44-return-gameplay.png' });

// Loading is a first-class outer screen: keep one deterministic 62% review state.
await open('loading', '.loading-space');
const loadingTip = page.locator('.loading-space__tip');
await loadingTip.focus();
const loadingFocusColor = await loadingTip.evaluate(node => getComputedStyle(node).outlineColor);
if (loadingFocusColor !== 'rgb(209, 180, 122)') {
  throw new Error('Loading tip Focus must consume the current Brass Text focus token. color=' + loadingFocusColor);
}
const loadingProgress = page.locator('.loading-space__track i');
const loadingProgressStyle = await loadingProgress.evaluate(node => {
  const style = getComputedStyle(node);
  return { backgroundImage: style.backgroundImage, backgroundColor: style.backgroundColor, boxShadow: style.boxShadow };
});
if (loadingProgressStyle.backgroundImage !== 'none') {
  throw new Error('Loading progress must not depend on a CSS Gradient. image=' + loadingProgressStyle.backgroundImage);
}
if (loadingProgressStyle.boxShadow !== 'none') {
  throw new Error('Loading progress must not depend on a Web-only Glow. shadow=' + loadingProgressStyle.boxShadow);
}
if (loadingProgressStyle.backgroundColor !== 'rgb(197, 164, 105)') {
  throw new Error('Loading progress must consume the current Brass High solid fill. color=' + loadingProgressStyle.backgroundColor);
}
if ((await page.locator('.loading-space__status b').textContent())?.trim() !== '62%') {
  throw new Error('Loading review state must remain deterministic at 62%.');
}
await page.screenshot({ path: outDir + '/loading-space.png' });

await browser.close();
