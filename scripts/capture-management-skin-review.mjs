import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

const openGameplay = async () => {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'gameplay');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.gameplay-top-navigation');
};

async function assertManagementSurface(label) {
  const values = await page.locator('.management-space__panel').evaluate((node) => {
    const style = getComputedStyle(node);
    const icon = node.querySelector('.management-space__heading-icon');
    const iconStyle = icon ? getComputedStyle(icon) : null;
    const header = node.querySelector('.management-space__header');
    const headerBox = header?.getBoundingClientRect();
    return {
      background: style.backgroundColor,
      image: style.backgroundImage,
      filter: style.backdropFilter || style.webkitBackdropFilter,
      radius: style.borderRadius,
      iconBackground: iconStyle?.backgroundColor || '',
      iconBorder: iconStyle?.borderTopWidth || '',
      headerHeight: headerBox?.height || 0,
    };
  });
  if (!values.image.includes('glass-noise-soft')) throw new Error(`${label} Management Surface must use shared noise.`);
  if (!values.filter || values.filter === 'none') throw new Error(`${label} Management Surface must use shared blur.`);
  if (Number.parseFloat(values.radius) < 12) throw new Error(`${label} Management Surface must use the unified rounded shell.`);
  if (values.iconBackground !== 'rgba(0, 0, 0, 0)') throw new Error(`${label} management heading icon must stay bare.`);
  if (Number.parseFloat(values.iconBorder) !== 0) throw new Error(`${label} management heading icon must not render as a chip.`);
  if (values.headerHeight < 62 || values.headerHeight > 66) throw new Error(`${label} management header should remain near 64px.`);
}

await openGameplay();
for (const item of [
  ['城市', 'city', '57-management-city.png'],
  ['经济', 'finance', '57-management-finance.png'],
  ['库存', 'inventory', '57-management-inventory.png'],
  ['军事', 'military', '57-management-military.png'],
]) {
  const [label, view, shot] = item;
  await page.getByRole('button', { name: label, exact: true }).click();
  await page.waitForSelector(`.management-space--${view}`);
  await page.waitForTimeout(120);
  await assertManagementSurface(label);
  await page.screenshot({ path: `${outDir}/${shot}` });
}

await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });
await page.getByRole('button', { name: '相机', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--camera');
await page.waitForTimeout(120);
const camera = await page.locator('.gameplay-context-panel--camera').evaluate((node) => {
  const section = node.querySelector('.gameplay-context-panel__section');
  const segment = node.querySelector('.segment');
  const sectionStyle = section ? getComputedStyle(section) : null;
  const segmentStyle = segment ? getComputedStyle(segment) : null;
  return {
    sectionBackground: sectionStyle?.backgroundColor || '',
    segmentBorder: segmentStyle?.borderTopWidth || '',
    segmentBackground: segmentStyle?.backgroundColor || '',
  };
});
if (camera.sectionBackground !== 'rgba(0, 0, 0, 0)') throw new Error('Camera sections must float directly on the Context Surface.');
if (Number.parseFloat(camera.segmentBorder) !== 0) throw new Error('Camera segmented control must use the open, borderless hierarchy.');
if (camera.segmentBackground !== 'rgba(0, 0, 0, 0)') throw new Error('Camera segmented control shell must stay transparent.');
await page.screenshot({ path: `${outDir}/57-camera-context-unified.png` });

await browser.close();
