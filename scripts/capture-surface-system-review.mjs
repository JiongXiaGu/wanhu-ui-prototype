import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

function rgbaNumbers(value) {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return [];
  return match[1].split(',').map((part) => Number.parseFloat(part.trim()));
}

function sameColor(a, b) {
  const aa = rgbaNumbers(a);
  const bb = rgbaNumbers(b);
  if (aa.length < 3 || bb.length < 3) return false;
  const length = Math.max(aa.length, bb.length, 4);
  for (let i = 0; i < length; i += 1) {
    const av = i < aa.length ? aa[i] : 1;
    const bv = i < bb.length ? bb[i] : 1;
    if (Math.abs(av - bv) > 0.005) return false;
  }
  return true;
}

async function assertNoRetiredRuntimeSheets() {
  const hrefs = await page.evaluate(() => Array.from(document.styleSheets).map((sheet) => sheet.href || ''));
  for (const retired of ['wanhu-workspace-integration.css', 'wanhu-tonal-texture.css']) {
    if (hrefs.some((href) => href.includes(retired))) throw new Error(`Retired stylesheet is still loaded: ${retired}`);
  }
}

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function openEnvironment(hour) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'weather');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.gameplay-context-panel--weather');
  if ((await page.getByRole('slider', { name: '日内时间' }).count()) === 0) {
    await page.getByRole('button', { name: '场景模拟', exact: true }).click();
  }
  await page.waitForSelector('[aria-label="日内时间"]');
  await setRangeValue(page.getByRole('slider', { name: '日内时间' }), hour);
  const period = hour >= 18 || hour < 6 ? 'night' : 'day';
  await page.waitForFunction(
    (nextPeriod) => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === nextPeriod,
    period,
  );
  await page.waitForTimeout(100);
}

async function assertEnvironment(period) {
  const values = await page.locator('.gameplay-context-panel--weather').evaluate((node) => {
    const screen = document.querySelector('.gameplay-screen');
    const screenStyle = screen ? getComputedStyle(screen) : null;
    const style = getComputedStyle(node);
    return {
      expected: screenStyle?.getPropertyValue('--wanhu-surface-context-bg').trim() || '',
      actual: style.backgroundColor,
      image: style.backgroundImage,
      filter: style.backdropFilter || style.webkitBackdropFilter,
    };
  });
  if (!sameColor(values.expected, values.actual)) {
    throw new Error(`${period} Environment must consume --wanhu-surface-context-bg. expected=${values.expected} actual=${values.actual}`);
  }
  if (!values.image.includes('glass-noise-soft')) throw new Error(`${period} Environment must retain shared material noise.`);
  if (!values.filter || values.filter === 'none') throw new Error(`${period} Environment must retain Context blur.`);
}

async function openWorkspace(hour) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'gameplay');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  if (hour >= 18 || hour < 6) {
    await page.getByRole('button', { name: '环境控制', exact: true }).click();
    await page.waitForSelector('.gameplay-context-panel--weather');
    await page.getByRole('button', { name: '场景模拟', exact: true }).click();
    await setRangeValue(page.getByRole('slider', { name: '日内时间' }), hour);
    await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
    await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  }
  await page.locator('.command-bar .category-row').getByRole('button', { name: '桥梁', exact: true }).click();
  await page.waitForSelector('.workspace--design[data-design-category="bridge"]');
  await page.waitForTimeout(100);
}

async function assertWorkspace(period) {
  const values = await page.locator('.workspace--design').evaluate((node) => {
    const screen = document.querySelector('.gameplay-screen');
    const screenStyle = screen ? getComputedStyle(screen) : null;
    const style = getComputedStyle(node);
    const body = node.querySelector('.workspace-body');
    const bodyStyle = body ? getComputedStyle(body) : null;
    return {
      expectedShell: screenStyle?.getPropertyValue('--wanhu-surface-work-sheet-bg').trim() || '',
      expectedBody: screenStyle?.getPropertyValue('--wanhu-surface-work-body-overlay').trim() || '',
      actualShell: style.backgroundColor,
      actualBody: bodyStyle?.backgroundColor || '',
      image: style.backgroundImage,
      filter: style.backdropFilter || style.webkitBackdropFilter,
    };
  });
  if (!sameColor(values.expectedShell, values.actualShell)) {
    throw new Error(`${period} Workspace shell must consume --wanhu-surface-work-sheet-bg. expected=${values.expectedShell} actual=${values.actualShell}`);
  }
  if (!sameColor(values.expectedBody, values.actualBody)) {
    throw new Error(`${period} Workspace body must consume --wanhu-surface-work-body-overlay. expected=${values.expectedBody} actual=${values.actualBody}`);
  }
  if (!values.image.includes('glass-noise-soft')) throw new Error(`${period} Workspace must retain shared material noise.`);
  if (!values.filter || values.filter === 'none') throw new Error(`${period} Workspace must retain Work blur.`);
}

await openEnvironment(14.5);
await assertNoRetiredRuntimeSheets();
await assertEnvironment('day');
await page.screenshot({ path: `${outDir}/55-surface-system-environment-day.png` });

await openEnvironment(22);
await assertEnvironment('night');
await page.screenshot({ path: `${outDir}/55-surface-system-environment-night.png` });

await openWorkspace(14.5);
await assertWorkspace('day');
await page.screenshot({ path: `${outDir}/55-surface-system-workspace-day.png` });

await openWorkspace(22);
await assertWorkspace('night');
await page.screenshot({ path: `${outDir}/55-surface-system-workspace-night.png` });

await browser.close();
