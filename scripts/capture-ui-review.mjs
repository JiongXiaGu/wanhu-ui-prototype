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
  if (await page.locator('.gameplay-operation-hints').count()) {
    throw new Error(`${label}: terrain tool should not keep the persistent text-heavy operation-hints panel.`);
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
  if (await page.locator('.gameplay-operation-hints').count()) throw new Error(label + ': persistent operation hints should be hidden.');

  if (mode === 'brush') {
    if ((await panel.getByRole('button', { name: '随机混合四种树形', exact: true }).count()) !== 1) throw new Error(label + ': random mix missing.');
    if ((await page.locator('.tree-brush-preview').count()) !== 1) throw new Error(label + ': brush preview missing.');
  } else {
    if (await panel.getByRole('button', { name: '随机混合四种树形', exact: true }).count()) throw new Error(label + ': single mode must use a concrete variant.');
    if ((await page.locator('.tree-single-preview').count()) !== 1) throw new Error(label + ': single preview missing.');
    for (const action of ['移动选中树木', '逆时针旋转', '顺时针旋转', '删除选中树木']) {
      if ((await bar.getByRole('button', { name: action, exact: true }).count()) !== 1) throw new Error(label + ': single action missing ' + action);
    }
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
await page.waitForTimeout(340);
const cityWallInspector = page.locator('#design-asset-inspector');
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
for (const text of ['墙体参数', '墙高', '地形关系', '基底处理', '自动计算']) {
  if ((await wallPanel.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('City wall construction panel missing: ' + text);
  }
}
await assertParameterFieldFillsRow('.city-wall-construction-prototype', 'city wall construction');

const wallBar = page.locator('.city-wall-construction-toolbar-cluster .tool-action-bar');
for (const mode of ['智能折线', '直线', '曲线']) {
  if ((await wallBar.getByRole('button', { name: mode, exact: true }).count()) !== 1) {
    throw new Error('City wall construction mode missing: ' + mode);
  }
}
for (const action of ['反转城外方向', '完成城墙营造', '取消城墙营造']) {
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
if ((await page.locator('.city-wall-path-preview').count()) !== 1) {
  throw new Error('City wall construction needs one world path preview.');
}
if ((await page.getByText('城墙 · 智能折线', { exact: true }).count()) !== 1) {
  throw new Error('City wall construction operation hints should match smart polyline mode.');
}
await page.screenshot({ path: outDir + '/city-wall-15-construction-smart.png' });

await wallBar.getByRole('button', { name: '曲线', exact: true }).click();
await wallBar.getByRole('button', { name: '反转城外方向', exact: true }).click();
await page.waitForTimeout(140);
if ((await wallPanel.getAttribute('data-wall-draw-mode')) !== 'curve') {
  throw new Error('City wall construction panel should expose curve mode.');
}
if ((await wallPanel.getAttribute('data-wall-outside')) !== 'left') {
  throw new Error('City wall outside side should flip to left.');
}
if ((await page.getByText('城墙 · 曲线', { exact: true }).count()) !== 1) {
  throw new Error('City wall operation hints should rebind to curve mode.');
}

await wallUtility.getByRole('button', { name: '墙顶线', exact: true }).click();
await page.waitForTimeout(100);
if (await page.locator('.city-wall-path-preview__top-line').count()) {
  throw new Error('Wall top-line toggle should hide the world preview line.');
}
await page.screenshot({ path: outDir + '/city-wall-16-construction-curve.png' });

await wallBar.getByRole('button', { name: '完成城墙营造', exact: true }).click();
await page.waitForSelector('.city-wall-construction-prototype', { state: 'detached' });
await page.waitForSelector('.workspace[data-design-category="city-wall"]');
await page.waitForTimeout(180);
await page.screenshot({ path: outDir + '/city-wall-17-return-workspace.png' });

await browser.close();
