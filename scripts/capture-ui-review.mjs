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

await open('gameplay', '.context-utility-toolbar[data-utility-context="world"]');
const worldUtility = page.locator('.context-utility-toolbar[data-utility-context="world"]');
await worldUtility.getByRole('button', { name: '地形编辑', exact: true }).click();
await page.waitForSelector('.terrain-edit-prototype');
await page.waitForSelector('.context-utility-toolbar[data-utility-context="terrain-edit"]');
await page.waitForTimeout(260);
await assertTerrainShell('raise');
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

await browser.close();
