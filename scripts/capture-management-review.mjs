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
  await page.waitForTimeout(180);
}

await open('gameplay', '.gameplay-top-navigation');
const topShellBox = await page.locator('.gameplay-top-shell').boundingBox();
if (!topShellBox) throw new Error('Unified gameplay top shell must be visible.');
if (Math.abs((topShellBox.x + topShellBox.width / 2) - 960) > 2) throw new Error('Top shell must remain centered.');
if (topShellBox.height < 90 || topShellBox.height > 94) throw new Error(`Top shell must keep the compact overlapped proportion. height=${topShellBox.height}`);
if ((await page.locator('.city-management-rail').count()) !== 0) throw new Error('Legacy left Management Rail must not be rendered.');
if ((await page.locator('.quick-controls').count()) !== 0) throw new Error('Legacy standalone Quick Controls must not be rendered.');
if ((await page.locator('.gameplay-navigation-hud').count()) !== 0) throw new Error('The old minimap-style Navigation HUD must not return.');

const statusBox = await page.locator('.gameplay-top-status').boundingBox();
const resourceBox = await page.locator('.gameplay-top-status__resources').boundingBox();
const navBox = await page.locator('.gameplay-top-navigation').boundingBox();
if (!statusBox || !resourceBox || !navBox) throw new Error('Both top shell rows must be measurable.');
if (statusBox.width < 920 || statusBox.width > 960) throw new Error(`Status row must stay near 940px. width=${statusBox.width}`);
if (Math.abs((resourceBox.x + resourceBox.width / 2) - 960) > 2) throw new Error('Resources must remain geometrically centered.');
if (navBox.width < 392 || navBox.width > 408) throw new Error(`Control tray should stay near the ~400px baseline. width=${navBox.width}`);
const rowOverlap = (statusBox.y + statusBox.height) - navBox.y;
if (rowOverlap < 1 || rowOverlap > 3) throw new Error(`Top shell rows should overlap by about 2px. overlap=${rowOverlap}`);
if ((await page.locator('.gameplay-top-navigation__scene > button').count()) !== 2) throw new Error('Left scene group must expose exactly Camera and Environment.');
if ((await page.locator('.gameplay-top-navigation__management > button').count()) !== 5) throw new Error('Top management must expose exactly five primary domains.');
if ((await page.locator('.gameplay-top-navigation__view > button').count()) !== 1) throw new Error('Information Views must occupy the right side of the tray.');

const compassHud = page.locator('.gameplay-compass-hud');
const compassBox = await compassHud.boundingBox();
if (!compassBox || Math.abs(compassBox.x - 16) > 2 || Math.abs(compassBox.y - 16) > 2) throw new Error('Compass HUD must own the 16px upper-left screen slot.');
if (compassBox.width < 74 || compassBox.width > 78 || compassBox.height < 74 || compassBox.height > 78) {
  throw new Error(`Compass HUD should remain a compact ~76px circular instrument. box=${JSON.stringify(compassBox)}`);
}
const compassLabels = (await compassHud.locator('.gameplay-compass-hud__cardinal').allTextContents()).map((text) => text.trim()).sort().join('');
if (![...'东西北南'].every((label) => compassLabels.includes(label))) throw new Error(`Compass HUD must expose all four Chinese cardinal directions. labels=${compassLabels}`);
if ((await compassHud.evaluate((node) => getComputedStyle(node).pointerEvents)) !== 'none') throw new Error('Compass HUD must not intercept world input.');

const menuButton = page.getByRole('button', { name: '菜单', exact: true });
const menuBox = await menuButton.boundingBox();
if (!menuBox || Math.abs((1920 - (menuBox.x + menuBox.width)) - 16) > 2 || Math.abs(menuBox.y - 16) > 2) {
  throw new Error('Pause menu must be a separate low-emphasis control in the upper-right safe corner.');
}
if (menuBox.width < 44 || menuBox.width > 48) throw new Error('System menu button should remain near 46px.');

const speedControls = page.locator('.gameplay-top-status__time-controls');
if ((await speedControls.getByRole('button').count()) !== 4) throw new Error('Status row must own four simulation speed controls.');
await speedControls.getByRole('button', { name: '暂停时间', exact: true }).click();
if (!(await speedControls.getByRole('button', { name: '暂停时间', exact: true }).getAttribute('class'))?.includes('is-active')) throw new Error('Simulation pause must be a real speed state.');
await speedControls.getByRole('button', { name: '正常速度', exact: true }).click();

const mainDock = page.locator('.command-bar');
const modeRail = mainDock.locator('.mode-rail');
const categoryRow = mainDock.locator('.category-row');
if ((await modeRail.getByRole('button').count()) !== 2) throw new Error('Main Dock must expose Design and Blueprint modes.');
if ((await categoryRow.getByRole('button').count()) !== 8) throw new Error('Design mode must expose eight categories.');
if ((await categoryRow.locator('button[aria-pressed="true"]').count()) !== 0) throw new Error('Main Dock must start with no selected category.');
await modeRail.getByRole('button', { name: '蓝图', exact: true }).click();
if ((await categoryRow.getByRole('button').count()) !== 9) throw new Error('Blueprint mode must expose nine categories.');
if ((await categoryRow.locator('button[aria-pressed="true"]').count()) !== 0) throw new Error('Switching modes must not invent a selected category.');
await page.screenshot({ path: `${outDir}/02a2-gameplay-blueprint-dock.png` });
await modeRail.getByRole('button', { name: '设计', exact: true }).click();

const environmentButton = page.getByRole('button', { name: '环境控制', exact: true });
const cameraButton = page.getByRole('button', { name: '相机', exact: true });
await environmentButton.click();
await page.waitForSelector('.gameplay-context-panel--weather');
await page.waitForTimeout(220);
const environmentPanel = page.locator('.gameplay-context-panel--weather');
const environmentBox = await environmentPanel.boundingBox();
const commandBox = await mainDock.boundingBox();
if (!environmentBox || !commandBox) throw new Error('Environment context panel and Main Dock must be measurable.');
if (Math.abs(environmentBox.x - 16) > 2) throw new Error('Environment context panel must align to the 16px left safe edge.');
if (Math.abs((1080 - (environmentBox.y + environmentBox.height)) - 16) > 2) throw new Error('Environment context panel must share the 16px bottom anchor used by placement tool panels.');
if (environmentBox.height > 722) throw new Error(`Environment context panel must stay within two-thirds of the 1080p canvas. height=${environmentBox.height}`);
if (!(environmentBox.x + environmentBox.width < commandBox.x - 12)) throw new Error('Lower-left context panels must not overlap the centered Main Dock.');
if ((await environmentPanel.getAttribute('class'))?.includes('gameplay-left-context-surface') !== true) throw new Error('Environment must use the shared lower-left context-surface shell.');
await environmentButton.click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });

await cameraButton.click();
await page.waitForSelector('.gameplay-context-panel--camera');
await page.waitForTimeout(220);
const cameraBox = await page.locator('.gameplay-context-panel--camera').boundingBox();
if (!cameraBox || Math.abs(cameraBox.x - 16) > 2) throw new Error('Camera context panel must use the same lower-left slot.');
if (Math.abs((1080 - (cameraBox.y + cameraBox.height)) - 16) > 2) throw new Error('Camera context panel must use the same bottom-safe anchor.');
if (cameraBox.height > 722) throw new Error('Camera context panel must respect the shared two-thirds-height cap.');
await cameraButton.click();
await page.waitForSelector('.gameplay-context-panel--camera', { state: 'detached' });

// Workspace and the lower-left context surface are mutually exclusive.
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
if ((await page.locator('.gameplay-top-navigation').count()) !== 1) throw new Error('Workspace must keep the top control tray.');
await environmentButton.click();
await page.waitForSelector('.gameplay-context-panel--weather');
await page.waitForSelector('.workspace--building', { state: 'detached' });
if ((await categoryRow.locator('button[aria-pressed="true"]').count()) !== 0) throw new Error('Opening a context panel must close Workspace and clear its launcher selection.');
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
if ((await categoryRow.getByRole('button', { name: '建筑', exact: true }).getAttribute('aria-pressed')) !== 'true') throw new Error('Opening Workspace must close the context panel and select the explicit launcher.');
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building', { state: 'detached' });

// Escape dismisses the current lower-left context surface before any global action.
await environmentButton.click();
await page.waitForSelector('.gameplay-context-panel--weather');
await page.keyboard.press('Escape');
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
if ((await page.locator('.pause-command-surface').count()) !== 0) throw new Error('Escape should dismiss the context panel without opening Pause.');

const worldTools = page.locator('.world-utility-toolbar');
const worldToolsBox = await worldTools.boundingBox();
const hintsBox = await page.locator('.gameplay-operation-hints').boundingBox();
const normalCommandBox = await mainDock.boundingBox();
if (!worldToolsBox || !hintsBox || !normalCommandBox) throw new Error('Gameplay bottom modules must all be measurable.');
if (Math.abs((1920 - (worldToolsBox.x + worldToolsBox.width)) - 16) > 2) throw new Error('World Utility Toolbar must keep the 16px right safe edge.');
if (Math.abs((1080 - (worldToolsBox.y + worldToolsBox.height)) - 16) > 2) throw new Error('World Utility Toolbar must keep the 16px bottom safe edge.');
if (Math.abs((normalCommandBox.x + normalCommandBox.width / 2) - 960) > 2) throw new Error('Main Dock must remain centered.');
const utilityHintGap = worldToolsBox.y - (hintsBox.y + hintsBox.height);
if (utilityHintGap < 10 || utilityHintGap > 14) throw new Error('Operation Hints must remain 12px above World Utility Toolbar.');

const gridSnap = worldTools.getByRole('button', { name: '网格吸附', exact: true });
await page.screenshot({ path: `${outDir}/02a-gameplay-top-shell.png` });
await gridSnap.click();
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
await page.locator('.building-card').first().click();
await page.waitForSelector('.building-placement-prototype');
if ((await page.locator('.gameplay-context-panel').count()) !== 0) throw new Error('Tool space must not retain Camera/Environment context panels.');
if ((await page.locator('.gameplay-top-navigation').count()) !== 0) throw new Error('Tool space must hide the secondary top control tray.');
if ((await page.getByRole('button', { name: '菜单', exact: true }).count()) !== 1) throw new Error('The global system-menu button should remain available in Tool space.');
const toolCompass = page.locator('.gameplay-compass-hud');
if ((await toolCompass.count()) !== 1 || !(await toolCompass.getAttribute('class'))?.includes('is-build-mode')) throw new Error('Placement tools should keep the compass and strengthen its build-mode presentation.');
const toolWorldTools = page.locator('.world-utility-toolbar');
if ((await toolWorldTools.getByRole('button', { name: '网格吸附', exact: true }).getAttribute('aria-pressed')) !== 'false') throw new Error('Global grid state must persist into Building Placement.');
if ((await page.locator('.placement-utility-strip').count()) !== 0) throw new Error('Building Placement must not duplicate grid/history utilities.');

const buildingActionBar = page.locator('.building-placement-toolbar-cluster .placement-action-bar');
const buildingActionBarBox = await buildingActionBar.boundingBox();
if (!buildingActionBarBox || buildingActionBarBox.height < 68 || buildingActionBarBox.height > 72) throw new Error('Building Placement must use the shared ~70px action bar.');
if (Math.abs((buildingActionBarBox.x + buildingActionBarBox.width / 2) - 960) > 2) throw new Error('Building Placement action bar must remain centered.');
if ((await buildingActionBar.locator('.placement-action-bar__button--mode').count()) !== 7) throw new Error('Building Placement must expose seven icon mode controls including the disabled facade slot.');
if ((await buildingActionBar.locator('.placement-action-bar__button--mode[aria-pressed="true"]').count()) !== 2) throw new Error('Building Placement must expose one active terrain mode and one active adjustment mode.');
if ((await buildingActionBar.locator('.placement-action-bar__button--quick').count()) !== 3) throw new Error('Building Placement must expose rotate-left, rotate-right and mirror quick actions.');
for (const label of ['逆时针旋转', '顺时针旋转', '镜像建筑', '完成', '取消']) {
  if ((await buildingActionBar.getByRole('button', { name: label, exact: true }).count()) !== 1) throw new Error(`Building Placement action missing: ${label}`);
}
if ((await buildingActionBar.locator('button').filter({ hasText: /平|填|高|位|层|顶|面|完成|取消/ }).count()) !== 0) throw new Error('Placement Action Bar should be icon-first instead of persistent text buttons.');
await page.screenshot({ path: `${outDir}/02e-building-placement-action-bar.png` });

// Road placement uses the same action-bar shell, but owns road-specific modes and parameters.
await open('workspace-road', '.workspace[data-design-category="road"]');
await page.locator('.design-item-card').first().click();
await page.waitForSelector('.road-placement-prototype');
const roadActionBar = page.locator('.road-placement-toolbar-cluster .placement-action-bar');
const roadActionBarBox = await roadActionBar.boundingBox();
if (!roadActionBarBox || roadActionBarBox.height < 68 || roadActionBarBox.height > 72) throw new Error('Road Placement must reuse the shared action-bar geometry.');
if (Math.abs((roadActionBarBox.x + roadActionBarBox.width / 2) - 960) > 2) throw new Error('Road Placement action bar must remain centered.');
if ((await roadActionBar.locator('.placement-action-bar__button--mode').count()) !== 3) throw new Error('Road Placement must expose exactly three draw modes.');
if ((await roadActionBar.locator('.placement-action-bar__button--mode[aria-pressed="true"]').count()) !== 1) throw new Error('Road draw modes must behave as one exclusive selector.');
for (const label of ['智能曲线', '曲线', '直线', '反转道路方向', '完成', '取消']) {
  if ((await roadActionBar.getByRole('button', { name: label, exact: true }).count()) !== 1) throw new Error(`Road Placement action missing: ${label}`);
}
await page.screenshot({ path: `${outDir}/02f-road-placement-smart.png` });
await roadActionBar.getByRole('button', { name: '曲线', exact: true }).click();
if ((await roadActionBar.getByRole('button', { name: '曲线', exact: true }).getAttribute('aria-pressed')) !== 'true') throw new Error('Road curve mode must become selected.');
if ((await page.locator('.road-placement-prototype').getAttribute('data-road-mode')) !== 'curve') throw new Error('Road parameter panel must follow the selected draw mode.');
await roadActionBar.getByRole('button', { name: '反转道路方向', exact: true }).click();
if ((await roadActionBar.getByRole('button', { name: '反转道路方向', exact: true }).getAttribute('aria-pressed')) !== null) throw new Error('Road quick actions must remain one-shot actions, not toggles.');
await page.screenshot({ path: `${outDir}/02g-road-placement-curve.png` });
await roadActionBar.getByRole('button', { name: '完成', exact: true }).click();
await page.waitForSelector('.workspace[data-design-category="road"]');

await open('gameplay', '.gameplay-top-navigation');
await page.getByRole('button', { name: '经济', exact: true }).click();
await page.waitForSelector('.management-space--finance');
if ((await page.locator('.gameplay-top-navigation').count()) !== 1) throw new Error('Management Space must retain the top control tray.');
for (const selector of ['.command-bar', '.world-utility-toolbar', '.gameplay-operation-hints', '.gameplay-context-panel', '.gameplay-compass-hud']) {
  if ((await page.locator(selector).count()) !== 0) throw new Error(`${selector} must not remain visible in Management Space.`);
}
await page.screenshot({ path: `${outDir}/02b-finance-top-navigation.png` });
await page.getByRole('button', { name: '政策', exact: true }).click();
await page.waitForSelector('.management-space--policy');
await page.screenshot({ path: `${outDir}/02b2-policy-top-navigation.png` });
await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });

await page.getByRole('button', { name: '信息视图', exact: true }).click();
await page.waitForSelector('.gameplay-top-map-panel');
const mapPanelBox = await page.locator('.gameplay-top-map-panel').boundingBox();
const navAfterManagement = await page.locator('.gameplay-top-navigation').boundingBox();
if (!mapPanelBox || !navAfterManagement || Math.abs((mapPanelBox.x + mapPanelBox.width) - (navAfterManagement.x + navAfterManagement.width)) > 3) {
  throw new Error('Information Views palette should align beneath the tray right-side launcher.');
}
await page.screenshot({ path: `${outDir}/02c-information-views-top.png` });
await page.getByRole('button', { name: '地价', exact: true }).click();
await page.waitForSelector('.map-view-layer--land-value');
await page.screenshot({ path: `${outDir}/02d-land-value-view.png` });

await browser.close();