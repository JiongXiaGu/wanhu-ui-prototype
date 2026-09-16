import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

function parseAlpha(color) {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return 1;
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  return parts.length >= 4 && Number.isFinite(parts[3]) ? parts[3] : 1;
}

async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function openEnvironment(variant, hour) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'weather');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.gameplay-context-panel--weather');

  if ((await page.getByRole('slider', { name: '日内时间' }).count()) === 0) {
    await page.getByRole('button', { name: '场景模拟', exact: true }).click();
    await page.waitForSelector('[aria-label="日内时间"]');
  }

  await setRangeValue(page.getByRole('slider', { name: '日内时间' }), hour);
  await page.waitForFunction(
    (night) => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === (night ? 'night' : 'day'),
    hour >= 18 || hour < 6,
  );
  await page.locator('.gameplay-screen').evaluate((node, nextVariant) => node.setAttribute('data-glass-study', nextVariant), variant);
  await page.waitForTimeout(120);
}

async function captureEnvironment(variant, period, hour) {
  await openEnvironment(variant, hour);
  const panel = page.locator('.gameplay-context-panel--weather');
  const visual = await panel.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      backgroundColor: style.backgroundColor,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      borderColor: style.borderTopColor,
    };
  });
  await page.screenshot({ path: `${outDir}/40-glass-${variant}-environment-${period}.png` });
  return visual;
}

async function captureWorkspace(variant, period, hour) {
  await openEnvironment(variant, hour);
  await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });

  const categoryRow = page.locator('.command-bar .category-row');
  await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
  const workspace = page.locator('.workspace--design[data-design-category="building"]');
  await workspace.waitFor();
  await page.locator('.gameplay-screen').evaluate((node, nextVariant) => node.setAttribute('data-glass-study', nextVariant), variant);
  await page.waitForTimeout(120);

  const visual = await workspace.evaluate((node) => {
    const style = getComputedStyle(node);
    const body = node.querySelector('.workspace-body');
    const bodyStyle = body ? getComputedStyle(body) : null;
    return {
      backgroundColor: style.backgroundColor,
      bodyBackgroundColor: bodyStyle?.backgroundColor ?? '',
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      borderColor: style.borderTopColor,
    };
  });
  await page.screenshot({ path: `${outDir}/40-glass-${variant}-workspace-${period}.png` });
  return visual;
}

const variants = ['a', 'b', 'c'];
const metrics = {};

for (const variant of variants) {
  metrics[variant] = {
    environmentDay: await captureEnvironment(variant, 'day', 14.5),
    environmentNight: await captureEnvironment(variant, 'night', 22),
    workspaceDay: await captureWorkspace(variant, 'day', 14.5),
    workspaceNight: await captureWorkspace(variant, 'night', 22),
  };
}

const environmentAlphas = variants.map((variant) => parseAlpha(metrics[variant].environmentDay.backgroundColor));
if (!(environmentAlphas[0] > environmentAlphas[1] && environmentAlphas[1] > environmentAlphas[2])) {
  throw new Error(`Environment study must progressively reduce surface alpha. values=${environmentAlphas.join(', ')}`);
}

const workspaceBodyAlphas = variants.map((variant) => parseAlpha(metrics[variant].workspaceDay.bodyBackgroundColor));
if (!(workspaceBodyAlphas[0] > workspaceBodyAlphas[1] && workspaceBodyAlphas[1] > workspaceBodyAlphas[2])) {
  throw new Error(`Workspace study must progressively reduce body alpha. values=${workspaceBodyAlphas.join(', ')}`);
}

for (const variant of variants) {
  const environmentBlur = metrics[variant].environmentDay.backdropFilter;
  const workspaceBlur = metrics[variant].workspaceDay.backdropFilter;
  if (!environmentBlur || environmentBlur === 'none') throw new Error(`Environment ${variant} must retain blur.`);
  if (!workspaceBlur || workspaceBlur === 'none') throw new Error(`Workspace ${variant} must retain blur.`);
}

await browser.close();
