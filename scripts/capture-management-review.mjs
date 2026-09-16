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
const topShellCenter = topShellBox.x + topShellBox.width / 2;
if (Math.abs(topShellCenter - 960) > 2) throw new Error(`Top shell must be centered. center=${topShellCenter.toFixed(1)}`);
if (topShellBox.x < 0 || topShellBox.x + topShellBox.width > 1920) throw new Error('Top shell must not be clipped.');
if (topShellBox.height < 90 || topShellBox.height > 94) throw new Error(`Normal gameplay top shell must keep the compact overlapped 56+38 proportion. height=${topShellBox.height}`);
if ((await page.locator('.city-management-rail').count()) !== 0) throw new Error('Legacy left Management Rail must not be rendered.');
if ((await page.locator('.quick-controls').count()) !== 0) throw new Error('Legacy standalone Quick Controls must not be rendered.');

const statusBox = await page.locator('.gameplay-top-status').boundingBox();
const resourceBox = await page.locator('.gameplay-top-status__resources').boundingBox();
const navBox = await page.locator('.gameplay-top-navigation').boundingBox();
if (!statusBox || !resourceBox || !navBox) throw new Error('Both top shell rows and centered resources must be visible.');
if (statusBox.width < 920 || statusBox.width > 960) throw new Error(`Persistent status row must stay near the 940px baseline. width=${statusBox.width}`);
if (statusBox.height < 54 || statusBox.height > 58) throw new Error(`Persistent status row must stay near the 56px baseline. height=${statusBox.height}`);
if (Math.abs((resourceBox.x + resourceBox.width / 2) - 960) > 2) throw new Error('Resources must remain visually centered in the status row.');
if (navBox.width < 468 || navBox.width > 492) throw new Error(`Control tray must stay near the compact 480px baseline. width=${navBox.width}`);
if (navBox.height < 36 || navBox.height > 40) throw new Error(`Control tray must stay near the 38px baseline. height=${navBox.height}`);
const rowOverlap = (statusBox.y + statusBox.height) - navBox.y;
if (rowOverlap < 1 || rowOverlap > 3) throw new Error(`Top shell rows should overlap by about 2px to avoid a bright seam. overlap=${rowOverlap}`);
if ((await page.locator('.gameplay-top-navigation__management > button').count()) !== 5) throw new Error('Top management must expose exactly five primary domains.');
if ((await page.locator('.gameplay-top-navigation__management > button > span').count()) !== 0) throw new Error('Primary management navigation must remain icon-only.');
if ((await page.locator('.gameplay-top-navigation__scene > button').count()) !== 3) throw new Error('Control tray must expose camera, weather and menu scene tools.');
const firstNavIcon = await page.locator('.gameplay-top-navigation__button svg').first().boundingBox();
if (!firstNavIcon || firstNavIcon.width < 17 || firstNavIcon.width > 20) throw new Error('Top navigation icons must remain readable at roughly 18px.');

const speedControls = page.locator('.gameplay-top-status__time-controls');
if ((await speedControls.getByRole('button').count()) !== 4) throw new Error('Status row must own four simulation speed controls.');
if ((await speedControls.locator('button').filter({ hasText: /×|x|X|倍/ }).count()) !== 0) throw new Error('Simulation speed controls must be icon-only.');
await speedControls.getByRole('button', { name: '暂停时间', exact: true }).click();
if (!(await speedControls.getByRole('button', { name: '暂停时间', exact: true }).getAttribute('class'))?.includes('is-active')) throw new Error('Simulation pause must be a real speed state.');
await speedControls.getByRole('button', { name: '正常速度', exact: true }).click();

// Scene launchers toggle their flyouts, and flyouts use the same 16px screen-safe edge as the HUD.
const weatherButton = page.getByRole('button', { name: '天气控制', exact: true });
await weatherButton.click();
await page.waitForSelector('.right-edge-flyout--weather');
await page.waitForTimeout(260);
const weatherBox = await page.locator('.right-edge-flyout--weather').boundingBox();
if (!weatherBox || Math.abs(weatherBox.y - 16) > 2) throw new Error(`Weather flyout must keep the 16px top safe edge. y=${weatherBox?.y}`);
if (!weatherBox || Math.abs((1920 - (weatherBox.x + weatherBox.width)) - 16) > 2) throw new Error('Weather flyout must keep the 16px right safe edge.');
await weatherButton.click();
await page.waitForSelector('.right-edge-flyout--weather', { state: 'detached' });

const cameraButton = page.getByRole('button', { name: '相机', exact: true });
await cameraButton.click();
await page.waitForSelector('.right-edge-flyout--camera');
await page.waitForTimeout(260);
const cameraBox = await page.locator('.right-edge-flyout--camera').boundingBox();
if (!cameraBox || Math.abs(cameraBox.y - 16) > 2) throw new Error(`Camera flyout must keep the 16px top safe edge. y=${cameraBox?.y}`);
if (!cameraBox || Math.abs((1920 - (cameraBox.x + cameraBox.width)) - 16) > 2) throw new Error('Camera flyout must keep the 16px right safe edge.');

// Building Workspace coexists with the top control tray and lightweight camera/weather panels.
await page.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
if ((await page.locator('.gameplay-top-navigation').count()) !== 1) throw new Error('Building Workspace must keep the top control tray visible.');
if ((await page.locator('.right-edge-flyout--camera').count()) !== 1) throw new Error('Opening Building Workspace must not close Camera/Weather flyouts.');
await cameraButton.click();
await page.waitForSelector('.right-edge-flyout--camera', { state: 'detached' });
if ((await page.locator('.workspace--building').count()) !== 1) throw new Error('Closing a scene flyout must not close Building Workspace.');

// Re-clicking the same launcher closes the surface it owns.
await page.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building', { state: 'detached' });
await page.getByRole('button', { name: '城市', exact: true }).click();
await page.waitForSelector('.management-space--city');
await page.getByRole('button', { name: '城市', exact: true }).click();
await page.waitForSelector('.management-space--city', { state: 'detached' });

// Escape closes the most local surface first: flyout -> workspace -> normal gameplay.
await page.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
await weatherButton.click();
await page.waitForSelector('.right-edge-flyout--weather');
await page.keyboard.press('Escape');
await page.waitForSelector('.right-edge-flyout--weather', { state: 'detached' });
if ((await page.locator('.workspace--building').count()) !== 1) throw new Error('First Escape should close the flyout while leaving Workspace open.');
await page.keyboard.press('Escape');
await page.waitForSelector('.workspace--building', { state: 'detached' });

const worldTools = page.locator('.world-utility-toolbar');
if ((await worldTools.count()) !== 1) throw new Error('Normal Gameplay must show one persistent World Utility Toolbar.');
const worldToolsBox = await worldTools.boundingBox();
const commandBox = await page.locator('.command-bar').boundingBox();
const hintsBox = await page.locator('.gameplay-operation-hints').boundingBox();
if (!worldToolsBox || !commandBox || !hintsBox) throw new Error('Gameplay bottom modules must all be measurable.');
if (Math.abs((1920 - (worldToolsBox.x + worldToolsBox.width)) - 16) > 2) throw new Error('World Utility Toolbar must keep the 16px right safe edge.');
if (Math.abs((1080 - (worldToolsBox.y + worldToolsBox.height)) - 16) > 2) throw new Error('World Utility Toolbar must keep the 16px bottom safe edge.');
if (worldToolsBox.height < 54 || worldToolsBox.height > 58) throw new Error(`World Utility Toolbar must stay near the 56px action height. height=${worldToolsBox.height}`);
if (Math.abs((commandBox.x + commandBox.width / 2) - 960) > 2) throw new Error('Main Dock must remain centered.');
if (commandBox.width < 920 || commandBox.width > 960) throw new Error(`Main Dock must stay near the shared 940px core width. width=${commandBox.width}`);
if (commandBox.height < 74 || commandBox.height > 78) throw new Error(`Main Dock must stay near the compact 76px height. height=${commandBox.height}`);
const dockUtilityGap = worldToolsBox.x - (commandBox.x + commandBox.width);
if (dockUtilityGap < 12 || dockUtilityGap > 20) throw new Error(`Main Dock and World Utility Toolbar should keep a small intentional gap. gap=${dockUtilityGap}`);
if (Math.abs((1920 - (hintsBox.x + hintsBox.width)) - 16) > 2) throw new Error('Operation Hints must align to the same 16px right safe edge.');
const utilityHintGap = worldToolsBox.y - (hintsBox.y + hintsBox.height);
if (utilityHintGap < 10 || utilityHintGap > 14) throw new Error(`Operation Hints must remain 12px above World Utility Toolbar. gap=${utilityHintGap}`);
const firstWorldToolIcon = await worldTools.locator('.world-utility-toolbar__button svg').first().boundingBox();
if (!firstWorldToolIcon || firstWorldToolIcon.width < 19 || firstWorldToolIcon.width > 22) throw new Error('World Utility icons must remain around 20px.');
if ((await worldTools.getByRole('button').count()) < 10) throw new Error('World Utility Toolbar should expose the complete global tool set.');

const mainDockRadius = Number.parseFloat(await page.locator('.command-bar').evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
const worldToolsRadius = Number.parseFloat(await worldTools.evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
const hintsRadius = Number.parseFloat(await page.locator('.gameplay-operation-hints').evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
if (mainDockRadius < 12 || worldToolsRadius < 12 || hintsRadius < 12) throw new Error('Bottom HUD surfaces must share the rounded 14px visual family.');

const gridSnap = worldTools.getByRole('button', { name: '网格吸附', exact: true });
if ((await gridSnap.getAttribute('aria-pressed')) !== 'true') throw new Error('Grid snap should start enabled globally.');
await page.screenshot({ path: `${outDir}/02a-gameplay-top-shell.png` });

// Global grid settings persist when the player enters Building Placement.
await gridSnap.click();
if ((await gridSnap.getAttribute('aria-pressed')) !== 'false') throw new Error('Grid snap toggle must update from the global toolbar.');
await page.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
await page.locator('.building-card').first().click();
await page.waitForSelector('.building-placement-prototype');
const toolWorldTools = page.locator('.world-utility-toolbar');
if ((await toolWorldTools.count()) !== 1) throw new Error('World Utility Toolbar must persist into Building Placement.');
if ((await toolWorldTools.getByRole('button', { name: '网格吸附', exact: true }).getAttribute('aria-pressed')) !== 'false') {
  throw new Error('Global grid snap state must persist into Building Placement.');
}
if ((await page.locator('.placement-utility-strip').count()) !== 0) throw new Error('Building Placement must not duplicate grid/history utility controls.');

await open('gameplay', '.gameplay-top-navigation');

// Complex management systems stay blocking, while the shared five-domain navigation remains available.
await page.getByRole('button', { name: '经济', exact: true }).click();
await page.waitForSelector('.management-space--finance');
await page.waitForTimeout(140);
if ((await page.locator('.gameplay-top-navigation').count()) !== 1) throw new Error('Top management navigation must remain visible in Management Space.');
if ((await page.locator('.management-space__tabs').count()) !== 0) throw new Error('Management Space must not repeat the top-level category navigation internally.');
for (const selector of ['.command-bar', '.world-utility-toolbar', '.gameplay-operation-hints']) {
  if ((await page.locator(selector).count()) !== 0) throw new Error(`${selector} must not remain visible in Management Space.`);
}
const managementBox = await page.locator('.management-space__panel').boundingBox();
if (!managementBox) throw new Error('Management Space panel must be visible.');
if (managementBox.width < 1200 || managementBox.height < 700) throw new Error('Management Space must remain a large central workspace.');
if (managementBox.x < 0 || managementBox.y < 114 || managementBox.x + managementBox.width > 1920 || managementBox.y + managementBox.height > 1080) {
  throw new Error('Management Space must fit below the unified top shell inside the 1920x1080 canvas.');
}
await page.screenshot({ path: `${outDir}/02b-finance-top-navigation.png` });

await page.getByRole('button', { name: '政策', exact: true }).click();
await page.waitForSelector('.management-space--policy');
await page.waitForTimeout(100);
await page.screenshot({ path: `${outDir}/02b2-policy-top-navigation.png` });
await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });
await page.waitForSelector('.gameplay-top-navigation');

// Information-view launcher also toggles its transient palette.
await page.getByRole('button', { name: '信息视图', exact: true }).click();
await page.waitForSelector('.gameplay-top-map-panel');
await page.getByRole('button', { name: '信息视图', exact: true }).click();
await page.waitForSelector('.gameplay-top-map-panel', { state: 'detached' });
await page.getByRole('button', { name: '信息视图', exact: true }).click();
await page.waitForSelector('.gameplay-top-map-panel');
await page.waitForTimeout(100);
await page.screenshot({ path: `${outDir}/02c-information-views-top.png` });
await page.getByRole('button', { name: '地价', exact: true }).click();
await page.waitForSelector('.map-view-layer--land-value');
await page.waitForTimeout(160);
if ((await page.locator('.gameplay-top-map-panel').count()) !== 0) throw new Error('Information View palette should collapse after choosing a map layer.');
await page.screenshot({ path: `${outDir}/02d-land-value-view.png` });

// Workspace keeps the shared top tray; Tool hides it to protect the active editing task.
await open('workspace-building', '.workspace');
if ((await page.locator('.gameplay-top-shell').count()) !== 1) throw new Error('Workspace must retain the persistent top status shell.');
if ((await page.locator('.gameplay-top-navigation').count()) !== 1) throw new Error('Building Workspace must retain the top control tray.');
if ((await page.locator('.command-bar').count()) !== 1) throw new Error('Building Workspace must retain the Main Dock.');
if ((await page.locator('.world-utility-toolbar').count()) !== 1) throw new Error('Building Workspace must retain global world utilities.');
const workspaceRadius = Number.parseFloat(await page.locator('.workspace--building').evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
if (workspaceRadius < 16) throw new Error('Workspace must use the larger rounded context-surface family.');

await open('building-position', '.tool-overlay');
if ((await page.locator('.gameplay-top-shell').count()) !== 1) throw new Error('Building Placement must retain the persistent top status shell.');
if ((await page.locator('.gameplay-top-navigation').count()) !== 0) throw new Error('Secondary top control tray must be hidden while Building Placement is active.');
if ((await page.locator('.command-bar').count()) !== 0) throw new Error('Main Dock must be hidden while Building Placement is active.');
if ((await page.locator('.building-placement-toolbar-cluster').count()) !== 1) throw new Error('Building Placement must use its dedicated primary tool toolbar.');
if ((await page.locator('.world-utility-toolbar').count()) !== 1) throw new Error('Building Placement must retain the global World Utility Toolbar.');
if ((await page.locator('.placement-utility-strip').count()) !== 0) throw new Error('Grid/history controls must exist only in the global toolbar.');

const placementDock = page.locator('.building-placement-toolbar-cluster .tool-bottom-cluster__primary');
const placementDockBox = await placementDock.boundingBox();
if (!placementDockBox) throw new Error('Building Placement primary dock must be measurable.');
if (Math.abs((placementDockBox.x + placementDockBox.width / 2) - 960) > 2) throw new Error('Building Placement primary dock must remain centered.');
if (placementDockBox.height < 64 || placementDockBox.height > 68) throw new Error(`Building Placement primary dock must stay near 66px. height=${placementDockBox.height}`);
const placementModeBox = await placementDock.locator('.bp-mode-action').first().boundingBox();
if (!placementModeBox || placementModeBox.width < 46 || placementModeBox.height < 46) throw new Error('Building Placement mode buttons must use the larger primary-control hit target.');
const placementCompleteBox = await placementDock.locator('.bp-submit--complete').boundingBox();
if (!placementCompleteBox || placementCompleteBox.height < 46 || placementCompleteBox.width < 88) throw new Error('Building Placement complete action must be visually prominent.');
const placementDockRadius = Number.parseFloat(await placementDock.evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
if (placementDockRadius < 12) throw new Error('Building Placement primary dock must use the shared rounded HUD family.');
if ((await placementDock.locator('.bp-terrain-group .bp-mode-action[aria-pressed="true"]').count()) !== 1) throw new Error('Terrain mode must expose one selected control semantically.');
if ((await placementDock.locator('.bp-adjustment-group .bp-mode-action[aria-pressed="true"]').count()) !== 1) throw new Error('Adjustment mode must expose one selected control semantically.');

await page.screenshot({ path: `${outDir}/02e-building-placement-top-shell.png` });

await browser.close();
