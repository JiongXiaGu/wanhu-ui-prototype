import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

const url = new URL(baseUrl);
url.searchParams.set('review', 'gameplay');
await page.goto(url.toString(), { waitUntil: 'networkidle' });
await page.waitForSelector('.gameplay-top-navigation');

const cameraButton = page.getByRole('button', { name: '相机', exact: true });
const environmentButton = page.getByRole('button', { name: '环境控制', exact: true });

await cameraButton.click();
const camera = page.locator('.gameplay-context-panel--camera');
await camera.waitFor();
if (!(await camera.getAttribute('class'))?.includes('left-context-panel')) throw new Error('Camera must consume the shared Left Context shell.');
if ((await camera.locator('> footer').count()) !== 1) throw new Error('Camera must use the shared Context footer.');
if ((await camera.locator('.gameplay-context-panel__body .segment').count()) !== 0) throw new Error('Camera mode selector must live in the footer, not the body.');
if ((await camera.locator('> footer .segment').count()) !== 1) throw new Error('Camera footer must contain one mode selector.');
const cameraHeaderHeight = await camera.locator('> header').evaluate((node) => getComputedStyle(node).height);
await camera.getByRole('button', { name: '规划', exact: true }).click();
if (Number(await camera.getByRole('slider', { name: '镜头高度', exact: true }).inputValue()) !== 62) throw new Error('Planning camera preset must apply its camera parameters.');
await page.screenshot({ path: `${outDir}/58-left-context-camera.png` });
await cameraButton.click();

await environmentButton.click();
const environment = page.locator('.gameplay-context-panel--weather');
await environment.waitFor();
if (!(await environment.getAttribute('class'))?.includes('left-context-panel')) throw new Error('Environment must consume the shared Left Context shell.');
if ((await environment.locator('> footer').count()) !== 1) throw new Error('Environment must use the shared Context footer.');
const environmentHeaderHeight = await environment.locator('> header').evaluate((node) => getComputedStyle(node).height);
if (cameraHeaderHeight !== environmentHeaderHeight) throw new Error('Camera and Environment must share header geometry.');
await page.screenshot({ path: `${outDir}/58-left-context-environment.png` });
await environmentButton.click();

const mainDock = page.locator('.command-bar');
await mainDock.locator('.category-row').getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--building');
await page.locator('.building-card').first().click();
const building = page.locator('.building-placement-prototype');
await building.waitFor();
if (!(await building.getAttribute('class'))?.includes('left-context-panel')) throw new Error('Building Placement must consume the shared Left Context shell.');
if ((await building.getAttribute('class'))?.includes('gameplay-context-panel')) throw new Error('Building Placement should not masquerade as an open Camera/Environment scene panel.');
if ((await building.locator('.gameplay-context-panel__heading-icon').count()) !== 1) throw new Error('Building Placement must use the shared icon-led header.');
if ((await building.locator('.ui-parameter-row').count()) < 2) throw new Error('Building Placement parameters must use shared RuntimeParameterRow controls.');
if ((await building.locator('> footer').count()) !== 0) throw new Error('Building Placement must not duplicate the central Action Bar with a Context footer.');
await page.screenshot({ path: `${outDir}/58-left-context-building.png` });

await browser.close();
