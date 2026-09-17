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
      animationName: style.animationName,
      animationDuration: style.animationDuration,
      animationDelay: style.animationDelay,
    };
  }, part);
}

async function assertCharacterAnchors() {
  const weatherBeam = await pseudo('.gameplay-top-status__weather-state', '::after');
  const weatherLeft = Number.parseFloat(weatherBeam.left);
  if (
    weatherLeft > 8 ||
    weatherBeam.width < 30 ||
    weatherBeam.width > 36 ||
    weatherBeam.height < 6 ||
    weatherBeam.height > 8 ||
    !weatherBeam.backgroundImage.includes('radial-gradient') ||
    !weatherBeam.backgroundImage.includes('linear-gradient')
  ) {
    throw new Error(`Weather anchor must read as a compact beam-head joint at the information-group origin, not a text underline. visual=${JSON.stringify(weatherBeam)}`);
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
  await page.waitForTimeout(220);
  return { bridgeButton, workspace };
}

async function assertWorkspaceAndDockCharacter(bridgeButton, workspace) {
  const workspaceMotion = await workspace.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      animationName: style.animationName,
      animationDuration: style.animationDuration,
      transform: style.transform,
      opacity: style.opacity,
    };
  });
  if (!workspaceMotion.animationName.includes('wanhu-character-workspace-settle')) {
    throw new Error(`Workspace must use the shared settle motion. motion=${JSON.stringify(workspaceMotion)}`);
  }
  const duration = Number.parseFloat(workspaceMotion.animationDuration);
  if (duration < 0.12 || duration > 0.2) {
    throw new Error(`Workspace settle motion must remain within the 120–200ms restrained range. motion=${JSON.stringify(workspaceMotion)}`);
  }

  const workspaceBox = await workspace.boundingBox();
  if (!workspaceBox || Math.abs(workspaceBox.x + workspaceBox.width / 2 - 960) > 1.5) {
    throw new Error(`Workspace settle motion must preserve the existing 1920px-canvas center anchor. box=${JSON.stringify(workspaceBox)}`);
  }

  const titleBeam = await pseudo('.workspace--design .workspace-title', '::after');
  const titleLeft = Number.parseFloat(titleBeam.left);
  if (
    titleLeft > 4 ||
    titleBeam.width < 30 ||
    titleBeam.width > 36 ||
    titleBeam.height < 6 ||
    titleBeam.height > 8 ||
    !titleBeam.backgroundImage.includes('radial-gradient')
  ) {
    throw new Error(`Workspace title identity must anchor to the icon/start edge instead of becoming a title underline. visual=${JSON.stringify(titleBeam)}`);
  }

  const activeFilter = workspace.locator('.workspace-context-filter__scroll > button.is-active').first();
  const filterJoint = await activeFilter.evaluate((node) => {
    const style = getComputedStyle(node, '::after');
    return {
      width: Number.parseFloat(style.width),
      height: Number.parseFloat(style.height),
      left: style.left,
      borderLeftWidth: Number.parseFloat(style.borderLeftWidth),
      borderBottomWidth: Number.parseFloat(style.borderBottomWidth),
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
    };
  });
  if (
    filterJoint.width < 16 ||
    filterJoint.width > 20 ||
    filterJoint.height < 7 ||
    filterJoint.height > 9 ||
    filterJoint.borderLeftWidth < 1 ||
    filterJoint.borderBottomWidth < 2 ||
    !filterJoint.backgroundImage.includes('radial-gradient')
  ) {
    throw new Error(`Workspace active filter must expose a compact L-joint + joint node instead of a web-tab underline. visual=${JSON.stringify(filterJoint)}`);
  }

  const base = await bridgeButton.evaluate((node) => {
    const before = getComputedStyle(node, '::before');
    const after = getComputedStyle(node, '::after');
    return {
      beforeWidth: Number.parseFloat(before.width),
      beforeHeight: Number.parseFloat(before.height),
      beforeBottom: before.bottom,
      beforeBackground: before.backgroundColor,
      nodeWidth: Number.parseFloat(after.width),
      nodeHeight: Number.parseFloat(after.height),
      nodeBackground: after.backgroundColor,
    };
  });
  if (
    base.beforeWidth < 28 ||
    base.beforeWidth > 40 ||
    base.beforeHeight < 2 ||
    base.nodeWidth < 3 ||
    base.nodeWidth > 5 ||
    base.nodeHeight < 3 ||
    base.nodeHeight > 5
  ) {
    throw new Error(`Main Dock active item must use a compact platform base + central joint node. visual=${JSON.stringify(base)}`);
  }
}

async function assertReducedMotion() {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open('gameplay', '.gameplay-top-status');
  const weatherBeam = await pseudo('.gameplay-top-status__weather-state', '::after');
  if (weatherBeam.animationName !== 'none') {
    throw new Error(`Character markers must respect prefers-reduced-motion. weather=${JSON.stringify(weatherBeam)}`);
  }

  const { workspace } = await openBridgeWorkspace();
  const workspaceAnimation = await workspace.evaluate((node) => getComputedStyle(node).animationName);
  const titleBeam = await pseudo('.workspace--design .workspace-title', '::after');
  if (workspaceAnimation !== 'none' || titleBeam.animationName !== 'none') {
    throw new Error(`Workspace and its Character markers must disable decorative motion for reduced-motion users. workspace=${workspaceAnimation}, title=${JSON.stringify(titleBeam)}`);
  }

  await page.emulateMedia({ reducedMotion: 'no-preference' });
}

// Day — normal gameplay first, then the representative Work state.
await open('gameplay', '.gameplay-top-status');
await assertCharacterAnchors();
await page.screenshot({ path: `${outDir}/48-character-pass-gameplay-day.png` });
const dayWork = await openBridgeWorkspace();
await assertWorkspaceAndDockCharacter(dayWork.bridgeButton, dayWork.workspace);
await page.screenshot({ path: `${outDir}/48-character-pass-workspace-day.png` });

// Night — use the real Environment time control, then review the same two states.
await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await assertCharacterAnchors();
await page.screenshot({ path: `${outDir}/48-character-pass-gameplay-night.png` });
const nightWork = await openBridgeWorkspace();
await assertWorkspaceAndDockCharacter(nightWork.bridgeButton, nightWork.workspace);
await page.screenshot({ path: `${outDir}/48-character-pass-workspace-night.png` });

await assertReducedMotion();
await browser.close();
