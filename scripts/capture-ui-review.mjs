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
await page.screenshot({ path: outDir + '/city-wall-15-construction-range.png' });

await wallBar.getByRole('button', { name: '定宽延伸', exact: true }).click();
await page.waitForTimeout(140);
if ((await wallPanel.getAttribute('data-wall-construction-mode')) !== 'fixed-width') {
  throw new Error('City wall construction panel should expose fixed-width mode.');
}
if ((await wallPanel.getAttribute('data-wall-facing')) !== 'right') {
  throw new Error('Fixed-width mode should default Front to path right side.');
}
if ((await wallBar.getByRole('button', { name: '交换正反面', exact: true }).count()) !== 1) {
  throw new Error('Fixed-width mode must expose facing flip.');
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

await wallBar.getByRole('button', { name: '交换正反面', exact: true }).click();
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
for (const action of ['城门左转', '城门右转', '交换正反面', '完成城墙门洞放置', '取消城墙门洞放置']) {
  if ((await gateBar.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall gate free action missing: ' + action);
  }
}

const gateFreeUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-gate-free"]');
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
for (const retiredAction of ['城门左转', '城门右转']) {
  if (await gateBar.getByRole('button', { name: retiredAction, exact: true }).count()) {
    throw new Error('Wall-connected gate should hide free rotation action: ' + retiredAction);
  }
}
if ((await gateBar.getByRole('button', { name: '交换正反面', exact: true }).count()) !== 1) {
  throw new Error('Wall-connected gate should retain semantic facing flip.');
}

const gateConnectedUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-gate-connected"]');
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
await page.screenshot({ path: outDir + '/city-wall-gate-19-connected.png' });

await gateBar.getByRole('button', { name: '交换正反面', exact: true }).click();
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
for (const action of ['登城梯左转', '登城梯右转', '交换上下端', '完成登城梯放置', '取消登城梯放置']) {
  if ((await accessStairBar.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall access stair action missing: ' + action);
  }
}

const accessStairUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-access-stair"]');
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
await page.screenshot({ path: outDir + '/city-wall-access-stair-22-free.png' });

await accessStairBar.getByRole('button', { name: '登城梯右转', exact: true }).click();
await accessStairBar.getByRole('button', { name: '交换上下端', exact: true }).click();
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
for (const action of ['高差楼梯左转', '高差楼梯右转', '交换上下端', '完成高差楼梯放置', '取消高差楼梯放置']) {
  if ((await transitionStairBar.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('City wall transition stair action missing: ' + action);
  }
}

const transitionStairUtility = page.locator('.context-utility-toolbar[data-utility-context="city-wall-transition-stair"]');
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
await page.screenshot({ path: outDir + '/city-wall-transition-stair-25-free.png' });

await transitionStairBar.getByRole('button', { name: '高差楼梯右转', exact: true }).click();
await transitionStairBar.getByRole('button', { name: '交换上下端', exact: true }).click();
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



await open('gameplay', '.context-utility-toolbar[data-utility-context="world"]');
const worldUtilityForMaterial = page.locator('.context-utility-toolbar[data-utility-context="world"]');
await worldUtilityForMaterial.getByRole('button', { name: '配色工具', exact: true }).click();
await page.waitForSelector('.material-palette-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="material-palette"]');
await page.waitForTimeout(260);

const materialPanel = page.locator('.material-palette-prototype');
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
if ((await materialPanel.getAttribute('data-material-scheme-type')) !== '墙面'
  || (await materialPanel.getAttribute('data-material-scheme-name')) !== '素灰墙') {
  throw new Error('Material palette prototype should enter with the seeded wall preset.');
}

const schemeSelector = materialPanel.getByRole('button', { name: '打开材质方案库', exact: true });
if ((await schemeSelector.count()) !== 1) {
  throw new Error('Surface should expose one current material-scheme selector.');
}
for (const text of ['墙面', '素灰墙']) {
  if ((await schemeSelector.getByText(text, { exact: true }).count()) !== 1) {
    throw new Error('Scheme selector missing single-line content: ' + text);
  }
}
if (await schemeSelector.getByText('当前方案', { exact: true }).count()) {
  throw new Error('Scheme selector must not restore the old three-line stack.');
}
if (await schemeSelector.locator('.material-scheme-selector__swatches').count()) {
  throw new Error('Scheme selector must not duplicate the four-color swatch strip.');
}
const schemeSelectorBox = await schemeSelector.boundingBox();
if (!schemeSelectorBox || schemeSelectorBox.height > 44) {
  throw new Error('Scheme selector should stay compact and single-line. height=' + schemeSelectorBox?.height);
}

const colorCards = materialPanel.locator('.material-color-card');
if ((await colorCards.count()) !== 4) {
  throw new Error('Surface should show exactly four color cards.');
}
const expectedCardLabels = ['主色', '高光', '发光', '夜间发光'];
const colorCardBoxes = [];
for (let index = 0; index < expectedCardLabels.length; index += 1) {
  const label = expectedCardLabels[index];
  const card = colorCards.nth(index);
  if ((await card.getByText(label, { exact: true }).count()) !== 1) {
    throw new Error('Color card order mismatch at ' + index + ': expected ' + label);
  }
  const box = await card.boundingBox();
  if (!box) throw new Error('Color card geometry missing at ' + index);
  colorCardBoxes.push(box);
}
const firstCardY = colorCardBoxes[0].y;
const firstCardWidth = colorCardBoxes[0].width;
for (const [index, box] of colorCardBoxes.entries()) {
  if (Math.abs(box.y - firstCardY) > 2) {
    throw new Error('All four Surface color cards must stay on one row. index=' + index + ', y=' + box.y);
  }
  if (Math.abs(box.width - firstCardWidth) > 2) {
    throw new Error('4x1 Surface color cards should share equal width. index=' + index + ', width=' + box.width);
  }
}
if (!(await materialPanel.getByRole('button', { name: '调整高光', exact: true }).isDisabled())) {
  throw new Error('Specular color card should remain visible but inactive in Metallic workflow.');
}
if ((await materialPanel.locator('.material-color-card__badge').filter({ hasText: 'HDR' }).count()) !== 2) {
  throw new Error('Emission and Night Emission cards should expose two HDR badges.');
}
if (await materialPanel.locator('.material-color-card').filter({ hasText: /#[0-9A-Fa-f]{6}/ }).count()) {
  throw new Error('Surface color cards should not display HEX values.');
}

for (const retired of ['高光反射', 'Alpha 裁剪', '裁剪阈值']) {
  if (await materialPanel.getByText(retired, { exact: true }).count()) {
    throw new Error('Retired Surface control should not be visible: ' + retired);
  }
}
for (const retiredField of ['Flags.SpecularHighlightsOff', 'Flags.AlphaClip', 'AlphaClipThreshold']) {
  if (await materialPanel.locator('[data-material-field="' + retiredField + '"]').count()) {
    throw new Error('Retired Surface field mapping should be removed: ' + retiredField);
  }
}

for (const field of [
  'BaseColor',
  'SpecularColor',
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
const textureSectionBox = await materialPanel.locator('.material-palette-texture').boundingBox();
const workflowBottomBox = await materialPanel.locator('.material-palette-workflow-bottom').boundingBox();
if (!textureSectionBox || !workflowBottomBox || workflowBottomBox.y <= textureSectionBox.y) {
  throw new Error('Workflow selector should live at the bottom after Texture controls.');
}

const surfaceFooter = materialPanel.locator('.material-palette-footer');
for (const action of ['恢复默认', '复制参数', '粘贴参数']) {
  if ((await surfaceFooter.getByRole('button', { name: action, exact: true }).count()) !== 1) {
    throw new Error('Surface footer action missing: ' + action);
  }
}
await surfaceFooter.getByRole('button', { name: '复制参数', exact: true }).click();
if ((await materialPanel.getAttribute('data-material-surface-clipboard')) !== 'ready') {
  throw new Error('Surface copy should populate structured tool clipboard.');
}
await page.screenshot({ path: outDir + '/material-palette-28-surface-scheme-cards.png' });

await schemeSelector.click();
await page.waitForTimeout(220);
if ((await materialPanel.getAttribute('data-material-page')) !== 'preset-library') {
  throw new Error('Scheme selector should open the material preset library page.');
}
for (const filter of ['全部', '木头', '瓦片', '墙面', '自定义']) {
  if ((await materialPanel.getByRole('button', { name: filter, exact: true }).count()) !== 1) {
    throw new Error('Material preset filter missing: ' + filter);
  }
}
for (const preset of ['应用方案 木头 · 深胡桃', '应用方案 瓦片 · 青灰瓦', '应用方案 墙面 · 素灰墙']) {
  if ((await materialPanel.getByRole('button', { name: preset, exact: true }).count()) !== 1) {
    throw new Error('Builtin material preset missing: ' + preset);
  }
}
await page.screenshot({ path: outDir + '/material-palette-29-preset-library.png' });

await materialPanel.getByRole('button', { name: '应用方案 木头 · 深胡桃', exact: true }).click();
await page.waitForTimeout(220);
if ((await materialPanel.getAttribute('data-material-page')) !== 'surface'
  || (await materialPanel.getAttribute('data-material-scheme-type')) !== '木头'
  || (await materialPanel.getAttribute('data-material-scheme-name')) !== '深胡桃') {
  throw new Error('Applying a builtin preset should return to Surface and update current scheme.');
}

await materialPanel.getByRole('button', { name: '光滑度增大', exact: true }).click();
await page.waitForTimeout(80);
if ((await materialPanel.getAttribute('data-material-scheme-type')) !== '自定义'
  || (await materialPanel.getAttribute('data-material-scheme-name')) !== '未保存') {
  throw new Error('Manual numeric edits must change the current scheme to Custom.');
}
await page.screenshot({ path: outDir + '/material-palette-30-custom-after-edit.png' });

await materialPanel.getByRole('button', { name: '打开材质方案库', exact: true }).click();
await page.waitForTimeout(220);
await materialPanel.getByRole('button', { name: '保存当前为自定义方案', exact: true }).click();
await page.waitForTimeout(100);
if ((await materialPanel.getAttribute('data-material-scheme-type')) !== '自定义'
  || (await materialPanel.getAttribute('data-material-scheme-name')) !== '我的配色 01') {
  throw new Error('Saving current parameters should create and select a named custom preset.');
}
if ((await materialPanel.getByRole('button', { name: '应用方案 自定义 · 我的配色 01', exact: true }).count()) !== 1
  || (await materialPanel.getByRole('button', { name: '删除自定义方案 我的配色 01', exact: true }).count()) !== 1) {
  throw new Error('Saved custom preset should be visible and deletable in the library.');
}
await materialPanel.getByRole('button', { name: '删除自定义方案 我的配色 01', exact: true }).click();
await page.waitForTimeout(80);
if (await materialPanel.getByRole('button', { name: '应用方案 自定义 · 我的配色 01', exact: true }).count()) {
  throw new Error('Deleted custom preset should leave the library.');
}
await materialPanel.getByRole('button', { name: '返回表面参数', exact: true }).click();
await page.waitForTimeout(220);

await materialPanel.getByRole('button', { name: '高光', exact: true }).click();
await page.waitForTimeout(100);
if ((await materialPanel.getAttribute('data-material-workflow')) !== 'specular') {
  throw new Error('Specular workflow should map to Flags.SpecularSetup.');
}
if (await materialPanel.locator('[data-material-field="Metallic"]').count()) {
  throw new Error('Metallic should hide in Specular workflow.');
}
if (await materialPanel.getByRole('button', { name: '调整高光', exact: true }).isDisabled()) {
  throw new Error('Specular color card should enable in Specular workflow.');
}

await materialPanel.getByRole('button', { name: '调整主色', exact: true }).click();
await page.waitForTimeout(220);
const baseEditor = materialPanel.locator('.material-color-editor[data-color-editor-target="BaseColor"]');
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
const colorFooter = materialPanel.locator('.material-palette-footer');
await colorFooter.getByRole('button', { name: '复制颜色', exact: true }).click();
if ((await materialPanel.getAttribute('data-material-color-clipboard')) !== 'ready') {
  throw new Error('Color copy should populate structured color clipboard.');
}
await page.screenshot({ path: outDir + '/material-palette-31-base-color-hsv.png' });

await materialPanel.getByRole('button', { name: '返回表面参数', exact: true }).click();
await page.waitForTimeout(220);
await materialPanel.getByRole('button', { name: '调整发光颜色', exact: true }).click();
await page.waitForTimeout(220);
const emissionEditor = materialPanel.locator('.material-color-editor[data-color-editor-target="EmissionColor"]');
if ((await emissionEditor.getAttribute('data-color-editor-hdr')) !== 'true'
  || (await emissionEditor.locator('[data-color-adapter="EmissionColor.Intensity"]').count()) !== 1) {
  throw new Error('EmissionColor must use HDR editor with intensity.');
}
await page.screenshot({ path: outDir + '/material-palette-32-emission-hdr-rgb.png' });

await materialPanel.getByRole('button', { name: '返回表面参数', exact: true }).click();
await page.waitForTimeout(220);
await materialPanel.getByRole('button', { name: '调整夜间发光', exact: true }).click();
await page.waitForTimeout(220);
const nightEditor = materialPanel.locator('.material-color-editor[data-color-editor-target="NightEmissionColor"]');
if ((await nightEditor.getAttribute('data-color-editor-hdr')) !== 'true'
  || (await nightEditor.locator('[data-color-adapter="NightEmissionColor.Intensity"]').count()) !== 1) {
  throw new Error('NightEmissionColor must use HDR editor with intensity.');
}
await page.screenshot({ path: outDir + '/material-palette-33-night-emission-hdr.png' });

await materialPanel.getByRole('button', { name: '返回表面参数', exact: true }).click();
await page.waitForTimeout(220);
const materialBar = page.locator('.material-palette-toolbar-cluster .tool-action-bar');
await materialBar.getByRole('button', { name: '完成配色', exact: true }).click();
await page.waitForSelector('.material-palette-prototype', { state: 'detached' });
await page.waitForSelector('.context-utility-toolbar[data-utility-context="world"]');
await page.waitForTimeout(180);
await page.screenshot({ path: outDir + '/material-palette-34-return-gameplay.png' });

await browser.close();
