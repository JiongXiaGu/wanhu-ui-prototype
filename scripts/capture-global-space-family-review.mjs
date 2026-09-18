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
async function snapshotStyle(root) {
  return root.evaluate((node) => {
    const style = getComputedStyle(node);
    const header = node.querySelector('.global-space-header');
    const footer = node.querySelector('.global-space-footer');
    const heading = node.querySelector('.global-space-heading h1');
    const headerStyle = header ? getComputedStyle(header) : null;
    const footerStyle = footer ? getComputedStyle(footer) : null;
    const headingStyle = heading ? getComputedStyle(heading) : null;
    return {
      backgroundImage: style.backgroundImage,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter || '',
      color: style.color,
      headerBackground: headerStyle?.backgroundColor ?? '',
      headerRule: headerStyle?.borderBottomColor ?? '',
      footerBackground: footerStyle?.backgroundColor ?? '',
      footerImage: footerStyle?.backgroundImage ?? '',
      footerRule: footerStyle?.borderTopColor ?? '',
      headingFamily: headingStyle?.fontFamily ?? '',
      headingSize: headingStyle?.fontSize ?? '',
      headingWeight: headingStyle?.fontWeight ?? '',
      headingColor: headingStyle?.color ?? '',
    };
  });
}
function assertSame(label, a, b) {
  const fields = ['backgroundImage','backdropFilter','color','headerBackground','headerRule','footerBackground','footerImage','footerRule','headingFamily','headingSize','headingWeight','headingColor'];
  for (const field of fields) {
    if (a[field] !== b[field]) throw new Error(`${label} mismatch: ${field}\nA=${a[field]}\nB=${b[field]}`);
  }
}

await open('settings', '.settings-space.wanhu-global-space');
const settingsRoot = page.locator('.settings-space.wanhu-global-space');
const settingsStyle = await snapshotStyle(settingsRoot);
if ((await page.locator('.settings-blocking-backdrop').count()) !== 0) throw new Error('Settings must not keep a page-private backdrop layer.');
await page.screenshot({ path: `${outDir}/global-family-settings.png` });

await open('load', '.archive-space--load.wanhu-global-space');
const loadRoot = page.locator('.archive-space--load.wanhu-global-space');
const loadStyle = await snapshotStyle(loadRoot);
assertSame('Settings vs Load Global Space', settingsStyle, loadStyle);
await page.screenshot({ path: `${outDir}/global-family-load.png` });

await open('pause-settings', '.settings-space.wanhu-global-space');
const pauseSettingsStyle = await snapshotStyle(page.locator('.settings-space.wanhu-global-space'));
await page.screenshot({ path: `${outDir}/global-family-settings-pause-day.png` });

await open('pause-save', '.save-game-space.wanhu-global-space');
const saveStyle = await snapshotStyle(page.locator('.save-game-space.wanhu-global-space'));
assertSame('Pause Settings vs Save Global Space', pauseSettingsStyle, saveStyle);
await page.screenshot({ path: `${outDir}/global-family-save-day.png` });

// Night family comparison: Settings and Save must resolve the same night Global tokens.
await open('weather', '.gameplay-context-panel--weather');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.keyboard.press('Escape');
await page.waitForSelector('.pause-command-surface');

await page.getByRole('button', { name: '游戏设置', exact: true }).click();
await page.waitForSelector('.settings-space.wanhu-global-space');
const nightSettingsStyle = await snapshotStyle(page.locator('.settings-space.wanhu-global-space'));
await page.screenshot({ path: `${outDir}/global-family-settings-night.png` });
await page.getByRole('button', { name: '返回', exact: true }).click();
await page.waitForSelector('.pause-command-surface');

await page.getByRole('button', { name: '保存游戏', exact: true }).click();
await page.waitForSelector('.save-game-space.wanhu-global-space');
const nightSaveStyle = await snapshotStyle(page.locator('.save-game-space.wanhu-global-space'));
assertSame('Night Settings vs Save Global Space', nightSettingsStyle, nightSaveStyle);
await page.screenshot({ path: `${outDir}/global-family-save-night.png` });

await browser.close();
