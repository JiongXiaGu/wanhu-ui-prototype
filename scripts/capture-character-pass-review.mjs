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
  await page.waitForTimeout(220);
}

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function pseudoContent(selector, part) {
  return page.locator(selector).first().evaluate((node, pseudoPart) => getComputedStyle(node, pseudoPart).content, part);
}

async function assertTopHudIdentity() {
  const beam = await pseudoContent('.gameplay-top-status', '::before');
  if (beam !== 'none') throw new Error(`Top HUD must not use a decorative edge beam. content=${beam}`);

  const weather = page.locator('.gameplay-top-status__weather-state').first();
  const icon = weather.locator('svg').first();
  const [weatherBox, iconBox] = await Promise.all([weather.boundingBox(), icon.boundingBox()]);
  if (!weatherBox || !iconBox || iconBox.width < 22 || iconBox.width > 28 || iconBox.height < 22 || iconBox.height > 28) {
    throw new Error(`Top HUD weather identity must be icon-led with a compact chip. weather=${JSON.stringify(weatherBox)}, icon=${JSON.stringify(iconBox)}`);
  }

  const resource = page.locator('.gameplay-top-status__resources > span').first();
  const resourceBorder = await resource.evaluate((node) => Number.parseFloat(getComputedStyle(node).borderRightWidth));
  const resourceJointHeight = await resource.evaluate((node) => Number.parseFloat(getComputedStyle(node, '::after').height));
  if (resourceBorder !== 0 || resourceJointHeight < 10 || resourceJointHeight > 14) {
    throw new Error(`Resource groups must keep short structural joints instead of full dividers. border=${resourceBorder}, jointHeight=${resourceJointHeight}`);
  }
}

async function assertContextHeader() {
  const header = page.locator('.gameplay-context-panel--weather > header');
  const icon = page.locator('.gameplay-context-panel--weather .gameplay-context-panel__heading-icon');
  const title = page.locator('.gameplay-context-panel--weather .gameplay-context-panel__title');
  const [headerBox, iconBox, titleStyle] = await Promise.all([
    header.boundingBox(),
    icon.boundingBox(),
    title.evaluate((node) => ({ fontSize: Number.parseFloat(getComputedStyle(node).fontSize), fontWeight: getComputedStyle(node).fontWeight })),
  ]);
  if (!headerBox || headerBox.height < 56 || headerBox.height > 60) {
    throw new Error(`Context header must keep its reviewed ~58px density. box=${JSON.stringify(headerBox)}`);
  }
  if (!iconBox || iconBox.width < 30 || iconBox.width > 34 || iconBox.height < 30 || iconBox.height > 34) {
    throw new Error(`Context header identity icon must use the 32px icon-led chip. box=${JSON.stringify(iconBox)}`);
  }
  if (titleStyle.fontSize < 14 || titleStyle.fontSize > 16) {
    throw new Error(`Context header title must use the shared title scale. style=${JSON.stringify(titleStyle)}`);
  }
}

async function openBridgeWorkspace() {
  const categoryRow = page.locator('.command-bar .category-row');
  const bridgeButton = categoryRow.getByRole('button', { name: '桥梁', exact: true });
  await bridgeButton.click();
  const workspace = page.locator('.workspace--design[data-design-category="bridge"]');
  await workspace.waitFor();
  await page.waitForTimeout(220);
  return { bridgeButton, workspace };
}

async function assertWorkspaceHeaderAndDock(bridgeButton, workspace) {
  const workspaceMotion = await workspace.evaluate((node) => {
    const style = getComputedStyle(node);
    return { animationName: style.animationName, animationDuration: style.animationDuration };
  });
  if (!workspaceMotion.animationName.includes('wanhu-character-workspace-settle')) {
    throw new Error(`Workspace must keep the restrained settle motion. motion=${JSON.stringify(workspaceMotion)}`);
  }
  const duration = Number.parseFloat(workspaceMotion.animationDuration);
  if (duration < 0.12 || duration > 0.2) {
    throw new Error(`Workspace settle motion must remain within 120–200ms. motion=${JSON.stringify(workspaceMotion)}`);
  }

  const workspaceBox = await workspace.boundingBox();
  if (!workspaceBox || Math.abs(workspaceBox.x + workspaceBox.width / 2 - 960) > 1.5) {
    throw new Error(`Workspace must preserve the 1920px canvas center anchor. box=${JSON.stringify(workspaceBox)}`);
  }

  const beam = await pseudoContent('.workspace--design .workspace-header', '::before');
  if (beam !== 'none') throw new Error(`Workspace header must not use a decorative beam marker. content=${beam}`);

  const header = workspace.locator('.workspace-header');
  const identityIcon = workspace.locator('.workspace-title > svg');
  const title = workspace.locator('.workspace-title > b');
  const [headerBox, iconBox, titleStyle] = await Promise.all([
    header.boundingBox(),
    identityIcon.boundingBox(),
    title.evaluate((node) => ({ fontSize: Number.parseFloat(getComputedStyle(node).fontSize), fontWeight: getComputedStyle(node).fontWeight })),
  ]);
  if (!headerBox || headerBox.height < 48 || headerBox.height > 52) {
    throw new Error(`Workspace must preserve its compact ~50px browsing header. box=${JSON.stringify(headerBox)}`);
  }
  if (!iconBox || iconBox.width < 28 || iconBox.width > 32 || iconBox.height < 28 || iconBox.height > 32) {
    throw new Error(`Workspace identity icon must use the compact ~30px icon-led chip. box=${JSON.stringify(iconBox)}`);
  }
  if (titleStyle.fontSize < 14 || titleStyle.fontSize > 16) {
    throw new Error(`Workspace title must share the Context title scale. style=${JSON.stringify(titleStyle)}`);
  }

  const activeFilter = workspace.locator('.workspace-context-filter__scroll > button.is-active').first();
  const filterNode = await activeFilter.evaluate((node) => {
    const style = getComputedStyle(node, '::after');
    return { width: Number.parseFloat(style.width), height: Number.parseFloat(style.height), backgroundImage: style.backgroundImage };
  });
  if (filterNode.width < 3 || filterNode.width > 5 || filterNode.height < 3 || filterNode.height > 5 || filterNode.backgroundImage !== 'none') {
    throw new Error(`Workspace filter should keep one compact state node. visual=${JSON.stringify(filterNode)}`);
  }

  const base = await bridgeButton.evaluate((node) => {
    const before = getComputedStyle(node, '::before');
    const after = getComputedStyle(node, '::after');
    return {
      beforeWidth: Number.parseFloat(before.width),
      beforeHeight: Number.parseFloat(before.height),
      nodeWidth: Number.parseFloat(after.width),
      nodeHeight: Number.parseFloat(after.height),
    };
  });
  if (base.beforeWidth < 28 || base.beforeWidth > 40 || base.beforeHeight < 2 || base.nodeWidth < 3 || base.nodeWidth > 5 || base.nodeHeight < 3 || base.nodeHeight > 5) {
    throw new Error(`Main Dock active item must preserve the compact platform base + central node. visual=${JSON.stringify(base)}`);
  }
}

async function assertReducedMotion() {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open('gameplay', '.gameplay-top-status');
  await assertTopHudIdentity();
  const { workspace } = await openBridgeWorkspace();
  const workspaceAnimation = await workspace.evaluate((node) => getComputedStyle(node).animationName);
  const filterAnimation = await workspace.locator('.workspace-context-filter__scroll > button.is-active').first()
    .evaluate((node) => getComputedStyle(node, '::after').animationName);
  if (workspaceAnimation !== 'none' || filterAnimation !== 'none') {
    throw new Error(`Workspace decorative motion must respect reduced motion. workspace=${workspaceAnimation}, filter=${filterAnimation}`);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
}

await open('gameplay', '.gameplay-top-status');
await assertTopHudIdentity();
await page.screenshot({ path: `${outDir}/51-icon-led-gameplay-day.png` });

await open('weather', '.gameplay-context-panel--weather');
await assertContextHeader();
await page.screenshot({ path: `${outDir}/51-icon-led-weather-day.png` });

await open('gameplay', '.gameplay-top-status');
const dayWork = await openBridgeWorkspace();
await assertWorkspaceHeaderAndDock(dayWork.bridgeButton, dayWork.workspace);
await page.screenshot({ path: `${outDir}/51-icon-led-workspace-day.png` });

await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await assertContextHeader();
await page.screenshot({ path: `${outDir}/51-icon-led-weather-night.png` });
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await assertTopHudIdentity();
const nightWork = await openBridgeWorkspace();
await assertWorkspaceHeaderAndDock(nightWork.bridgeButton, nightWork.workspace);
await page.screenshot({ path: `${outDir}/51-icon-led-workspace-night.png` });

await assertReducedMotion();
await browser.close();
