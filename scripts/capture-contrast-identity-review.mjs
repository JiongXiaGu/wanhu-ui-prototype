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

function rgb(value) {
  const match = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function luma(value) {
  const c = rgb(value);
  if (!c) return 0;
  return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
}

async function colorOf(selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor();
  return locator.evaluate((node) => getComputedStyle(node).color);
}

async function bgOf(selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor();
  return locator.evaluate((node) => getComputedStyle(node).backgroundColor);
}

async function expectReadable(selector, label, minLuma) {
  const value = await colorOf(selector);
  if (luma(value) < minLuma) throw new Error(`${label} foreground is too dim. color=${value} luma=${luma(value)}`);
}

async function openBridgeWorkspace() {
  const dock = page.locator('.command-bar');
  await dock.locator('.category-row').getByRole('button', { name: '桥梁', exact: true }).click();
  const workspace = page.locator('.workspace--design[data-design-category="bridge"]');
  await workspace.waitFor();
  await page.waitForTimeout(140);
  return workspace;
}

async function inspectIdentity(prefix) {
  const workspace = page.locator('.workspace--design[data-design-category="bridge"]');
  await workspace.waitFor();

  await expectReadable('.gameplay-top-status__resources b', `${prefix} Top resource value`, 220);
  await expectReadable('.gameplay-top-status__resources small', `${prefix} Top resource label`, 165);
  await expectReadable('.gameplay-top-navigation__button', `${prefix} Secondary HUD icon`, 155);
  await expectReadable('.command-bar .category-row button', `${prefix} Dock default action`, 155);
  await expectReadable('.workspace--design .workspace-title b', `${prefix} Workspace title`, 220);
  await expectReadable('.workspace--design .workspace-context-filter__scroll > button', `${prefix} Workspace filter`, 155);
  await expectReadable('.workspace--design .design-item-card span', `${prefix} Workspace metadata`, 165);
  await expectReadable('.gameplay-operation-hints .operation-hints__description', `${prefix} Operation hint`, 145);

  const top = rgb(await bgOf('.gameplay-top-status'));
  const work = rgb(await bgOf('.workspace--design .workspace-body'));
  const dock = rgb(await bgOf('.command-bar'));
  const utility = rgb(await bgOf('.world-utility-toolbar'));
  if (!top || !work || !dock || !utility) throw new Error(`${prefix} role surfaces must expose measurable colors.`);

  if ((top[2] - top[0]) < 3) throw new Error(`${prefix} Top HUD should keep a slight cool mineral bias. bg=${top}`);
  if ((work[0] - work[2]) < 4) throw new Error(`${prefix} Workspace should keep a slight warm limestone bias. bg=${work}`);
  if (Math.abs(dock[0] - dock[2]) > 5) throw new Error(`${prefix} Dock should remain neutral rather than inheriting HUD/Workspace hue. bg=${dock}`);

  const activeDock = page.locator('.command-bar .category-row button.is-active').first();
  const activeDockImage = await activeDock.evaluate((node) => getComputedStyle(node).backgroundImage);
  if (!activeDockImage || activeDockImage === 'none') throw new Error(`${prefix} Dock active state needs a full surface treatment.`);

  const activeFilter = workspace.locator('.workspace-context-filter__scroll > button.is-active').first();
  const activeFilterImage = await activeFilter.evaluate((node) => getComputedStyle(node).backgroundImage);
  if (!activeFilterImage || activeFilterImage === 'none') throw new Error(`${prefix} Workspace active filter needs a surface treatment.`);
}

await open('gameplay', '.gameplay-top-status');
await openBridgeWorkspace();
await inspectIdentity('Day');
await page.screenshot({ path: `${outDir}/45-contrast-identity-day.png` });

await open('weather', '.gameplay-context-panel--weather');
await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForSelector('[aria-label="日内时间"]');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await openBridgeWorkspace();
await inspectIdentity('Night');
await page.screenshot({ path: `${outDir}/46-contrast-identity-night.png` });

await browser.close();
