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
  await page.waitForTimeout(160);
}

async function toggleVisual(locator) {
  return locator.evaluate((button) => {
    const hit = getComputedStyle(button);
    const track = button.querySelector('i');
    if (!track) throw new Error('Toggle track missing');
    const trackStyle = getComputedStyle(track);
    const before = getComputedStyle(track, '::before');
    const thumb = getComputedStyle(track, '::after');
    return {
      hitWidth: hit.width,
      hitHeight: hit.height,
      hitOpacity: hit.opacity,
      trackWidth: trackStyle.width,
      trackHeight: trackStyle.height,
      trackRadius: trackStyle.borderRadius,
      trackBackground: trackStyle.backgroundColor,
      trackBackgroundImage: trackStyle.backgroundImage,
      trackBorder: trackStyle.borderColor,
      trackShadow: trackStyle.boxShadow,
      beforeContent: before.content,
      thumbWidth: thumb.width,
      thumbHeight: thumb.height,
      thumbLeft: thumb.left,
      thumbRadius: thumb.borderRadius,
      thumbBackground: thumb.backgroundColor,
      thumbBackgroundImage: thumb.backgroundImage,
    };
  });
}

function assertBaseGeometry(label, visual) {
  if (visual.hitWidth !== '52px' || visual.hitHeight !== '32px') throw new Error(`${label} hit area must remain 52x32. visual=${JSON.stringify(visual)}`);
  if (visual.trackWidth !== '38px' || visual.trackHeight !== '20px' || visual.trackRadius !== '10px') throw new Error(`${label} track must remain 38x20 / 10px. visual=${JSON.stringify(visual)}`);
  if (visual.thumbWidth !== '14px' || visual.thumbHeight !== '14px') throw new Error(`${label} thumb must be 14x14. visual=${JSON.stringify(visual)}`);
  if (visual.trackBackgroundImage !== 'none' || visual.thumbBackgroundImage !== 'none') throw new Error(`${label} must use plain solid Track / Thumb without decorative gradients.`);
  if (visual.beforeContent !== 'none' && visual.beforeContent !== 'normal') throw new Error(`${label} must not render the old center groove. content=${visual.beforeContent}`);
}

function assertSameVisual(label, a, b, fields) {
  for (const field of fields) {
    if (a[field] !== b[field]) throw new Error(`${label} mismatch on ${field}: A=${a[field]} B=${b[field]}`);
  }
}

// Settings contains both Off and On states side by side.
await open('settings', '.settings-space');
await page.getByRole('button', { name: '图形', exact: true }).click();
const offToggle = page.locator('[data-setting-id="frame-generation"] .ui-toggle');
const onToggle = page.locator('[data-setting-id="low-latency"] .ui-toggle');
await offToggle.waitFor();
await onToggle.waitFor();
if ((await offToggle.getAttribute('aria-pressed')) !== 'false' || (await onToggle.getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Graphics Settings must expose real Off / On Toggle states.');
}
const offVisual = await toggleVisual(offToggle);
const onVisual = await toggleVisual(onToggle);
assertBaseGeometry('Settings Off Toggle', offVisual);
assertBaseGeometry('Settings On Toggle', onVisual);
if (offVisual.thumbLeft !== '3px' || onVisual.thumbLeft !== '21px') throw new Error(`Toggle thumb positions invalid. off=${offVisual.thumbLeft} on=${onVisual.thumbLeft}`);
if (offVisual.trackBackground === onVisual.trackBackground || offVisual.thumbBackground === onVisual.thumbBackground) throw new Error('On state must be visually distinct from neutral Off state.');
await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
let reachedToggle = false;
for (let index = 0; index < 40; index += 1) {
  await page.keyboard.press('Tab');
  reachedToggle = await onToggle.evaluate((node) => document.activeElement === node);
  if (reachedToggle) break;
}
if (!reachedToggle) throw new Error('Keyboard Tab navigation must be able to reach the shared Toggle.');
const focusVisual = await toggleVisual(onToggle);
if (focusVisual.trackShadow === 'none') throw new Error('Keyboard Focus must add a restrained focus ring.');
await page.screenshot({ path: `${outDir}/toggle-settings-on-off.png` });

// Disabled state through the real Settings dependency.
await page.locator('[data-setting-id="super-resolution"] .ui-select__trigger').click();
await page.getByRole('option', { name: 'FSR · 质量', exact: true }).click();
if (!(await offToggle.isDisabled())) throw new Error('Frame Generation Toggle must disable when DLSS is not selected.');
const disabledVisual = await toggleVisual(offToggle);
if (!(Number(disabledVisual.hitOpacity) < 0.5)) throw new Error(`Disabled Toggle must visibly attenuate. opacity=${disabledVisual.hitOpacity}`);
await page.screenshot({ path: `${outDir}/toggle-settings-disabled.png` });

// Load must use exactly the same Off / On primitive.
await open('load', '.archive-space--load');
const loadToggle = page.locator('.archive-hide-outdated .ui-toggle');
const loadOff = await toggleVisual(loadToggle);
assertBaseGeometry('Load Off Toggle', loadOff);
assertSameVisual('Settings vs Load Off Toggle', offVisual, loadOff, ['hitWidth','hitHeight','trackWidth','trackHeight','trackRadius','trackBackground','trackBorder','thumbWidth','thumbHeight','thumbLeft','thumbBackground']);
await loadToggle.click();
if ((await loadToggle.getAttribute('aria-pressed')) !== 'true') throw new Error('Load Toggle must switch On.');
const loadOn = await toggleVisual(loadToggle);
assertSameVisual('Settings vs Load On Toggle', onVisual, loadOn, ['trackWidth','trackHeight','trackRadius','trackBackground','trackBorder','thumbWidth','thumbHeight','thumbLeft','thumbBackground']);
await page.screenshot({ path: `${outDir}/toggle-load-on.png` });

// Save must share the same primitive too.
await open('pause-save', '.save-game-space');
const saveToggle = page.locator('.archive-hide-outdated .ui-toggle');
const saveOff = await toggleVisual(saveToggle);
assertBaseGeometry('Save Off Toggle', saveOff);
assertSameVisual('Settings vs Save Off Toggle', offVisual, saveOff, ['hitWidth','hitHeight','trackWidth','trackHeight','trackRadius','trackBackground','trackBorder','thumbWidth','thumbHeight','thumbLeft','thumbBackground']);
await page.screenshot({ path: `${outDir}/toggle-save-off.png` });

await browser.close();
