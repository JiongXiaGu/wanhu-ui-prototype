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

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function pseudo(selector, part) {
  return page.locator(selector).first().evaluate((node, pseudoPart) => {
    const style = getComputedStyle(node, pseudoPart);
    return {
      content: style.content,
      width: Number.parseFloat(style.width),
      height: Number.parseFloat(style.height),
      left: style.left,
      right: style.right,
      top: style.top,
      bottom: style.bottom,
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
      borderLeftWidth: Number.parseFloat(style.borderLeftWidth),
      borderBottomWidth: Number.parseFloat(style.borderBottomWidth),
      opacity: Number.parseFloat(style.opacity),
    };
  }, part);
}

async function assertCharacterAnchors() {
  const weatherBeam = await pseudo('.gameplay-top-status__weather-state', '::after');
  if (weatherBeam.width < 32 || weatherBeam.height < 3 || !weatherBeam.backgroundImage.includes('gradient')) {
    throw new Error(`Weather anchor must expose the short beam + joint identity marker. visual=${JSON.stringify(weatherBeam)}`);
  }

  const resource = page.locator('.gameplay-top-status__resources > span').first();
  const resourceBorder = await resource.evaluate((node) => Number.parseFloat(getComputedStyle(node).borderRightWidth));
  const resourceJoint = await pseudo('.gameplay-top-status__resources > span', '::after');
  if (resourceBorder !== 0 || resourceJoint.height < 10 || resourceJoint.height > 14) {
    throw new Error(`Resource groups must use short structural joints instead of full dividers. border=${resourceBorder}, joint=${JSON.stringify(resourceJoint)}`);
  }
}

async function openBridgeWorkspace() {
  const categoryRow = page.locator('.command-bar .category-row');
  const bridgeButton = categoryRow.getByRole('button', { name: '桥梁', exact: true });
  await bridgeButton.click();
  const workspace = page.locator('.workspace--design[data-design-category="bridge"]');
  await workspace.waitFor();
  await page.waitForTimeout(120);
  return { bridgeButton, workspace };
}

async function assertWorkspaceAndDockCharacter(bridgeButton, workspace) {
  const titleBeam = await pseudo('.workspace--design .workspace-title', '::after');
  if (titleBeam.width < 32 || titleBeam.height < 3 || !titleBeam.backgroundImage.includes('gradient')) {
    throw new Error(`Workspace title must use the short beam-head marker. visual=${JSON.stringify(titleBeam)}`);
  }

  const activeFilter = workspace.locator('.workspace-context-filter__scroll > button.is-active').first();
  const filterJoint = await activeFilter.evaluate((node) => {
    const style = getComputedStyle(node, '::after');
    return {
      width: Number.parseFloat(style.width),
      height: Number.parseFloat(style.height),
      borderLeftWidth: Number.parseFloat(style.borderLeftWidth),
      borderBottomWidth: Number.parseFloat(style.borderBottomWidth),
      backgroundColor: style.backgroundColor,
    };
  });
  if (filterJoint.width < 13 || filterJoint.width > 17 || filterJoint.borderLeftWidth < 1 || filterJoint.borderBottomWidth < 2) {
    throw new Error(`Workspace active filter must use the compact L-joint marker instead of a web tab underline. visual=${JSON.stringify(filterJoint)}`);
  }

  const base = await bridgeButton.evaluate((node) => {
    const before = getComputedStyle(node, '::before');
    const after = getComputedStyle(node, '::after');
    return {
      beforeHeight: Number.parseFloat(before.height),
      beforeBottom: before.bottom,
      beforeBackground: before.backgroundColor,
      nodeWidth: Number.parseFloat(after.width),
      nodeHeight: Number.parseFloat(after.height),
      nodeBackground: after.backgroundColor,
    };
  });
  if (base.beforeHeight < 2 || base.nodeWidth < 3 || base.nodeWidth > 5 || base.nodeHeight < 3 || base.nodeHeight > 5) {
    throw new Error(`Main Dock active item must use a platform base + central joint node. visual=${JSON.stringify(base)}`);
  }
}

// Day — normal gameplay first, then the representative Work state.
await open('gameplay', '.gameplay-top-status');
await assertCharacterAnchors();
await page.screenshot({ path: `${outDir}/47-character-pass-gameplay-day.png` });
const dayWork = await openBridgeWorkspace();
await assertWorkspaceAndDockCharacter(dayWork.bridgeButton, dayWork.workspace);
await page.screenshot({ path: `${outDir}/47-character-pass-workspace-day.png` });

// Night — use the real Environment time control, then review the same two states.
await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await assertCharacterAnchors();
await page.screenshot({ path: `${outDir}/47-character-pass-gameplay-night.png` });
const nightWork = await openBridgeWorkspace();
await assertWorkspaceAndDockCharacter(nightWork.bridgeButton, nightWork.workspace);
await page.screenshot({ path: `${outDir}/47-character-pass-workspace-night.png` });

await browser.close();
