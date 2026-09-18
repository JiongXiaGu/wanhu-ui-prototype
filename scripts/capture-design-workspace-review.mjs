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

async function waitForStableLayout() {
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function measureCompactAssetRow(card) {
  let lastMeasurement = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await waitForStableLayout();
    const cardBox = await card.boundingBox();
    const previewBox = await card.locator('.card-thumb').boundingBox();
    lastMeasurement = { cardBox, previewBox };
    const cardValid = cardBox && cardBox.width >= 245 && cardBox.height >= 63 && cardBox.height <= 65;
    const previewValid = previewBox
      && Math.abs(previewBox.width - previewBox.height) <= 1
      && previewBox.width >= 63 && previewBox.width <= 65;
    const flush = cardBox && previewBox
      && Math.abs(previewBox.x - cardBox.x) <= 1
      && Math.abs(previewBox.y - cardBox.y) <= 1
      && Math.abs(previewBox.height - cardBox.height) <= 1;
    if (cardValid && previewValid && flush) return lastMeasurement;
    await page.waitForTimeout(70);
  }
  return lastMeasurement;
}

async function assertPersistentPagerSlot(workspace, label) {
  const contentPager = workspace.locator('.workspace-content-pager');
  if ((await contentPager.count()) === 0) {
    const singleContentMarker = await workspace.locator('.workspace-catalog').evaluate((node) => {
      const style = getComputedStyle(node, '::after');
      return { content: style.content, width: Number.parseFloat(style.width), height: Number.parseFloat(style.height) };
    });
    if (singleContentMarker.content === 'none' || singleContentMarker.width < 16 || singleContentMarker.height < 2) {
      throw new Error(`${label} single-page content pager must keep a visible horizontal dash slot.`);
    }
  } else if ((await contentPager.locator('button').count()) < 1) {
    throw new Error(`${label} multi-page content pager must expose at least one marker.`);
  }

  const railPager = workspace.locator('.workspace-rail-pager');
  if ((await railPager.count()) === 0) {
    const singleRailMarker = await workspace.locator('.workspace-primary-rail__content').evaluate((node) => {
      const style = getComputedStyle(node, '::before');
      return { content: style.content, width: Number.parseFloat(style.width), height: Number.parseFloat(style.height) };
    });
    if (singleRailMarker.content === 'none' || singleRailMarker.width < 2 || singleRailMarker.height < 13) {
      throw new Error(`${label} single-group rail pager must keep a visible vertical dash slot.`);
    }
  } else if ((await railPager.locator('button').count()) < 1) {
    throw new Error(`${label} multi-group rail pager must expose at least one marker.`);
  }
}

const designCategories = [
  ['road', '道路'],
  ['bridge', '桥梁'],
  ['building', '建筑'],
  ['platform', '台基'],
  ['city-wall', '城墙'],
  ['wall', '围墙'],
  ['decoration', '装饰'],
  ['tree', '树木'],
];

await open('gameplay', '.command-bar');
const dock = page.locator('.command-bar');
const categoryRow = dock.locator('.category-row');

for (const [id, label] of designCategories) {
  await categoryRow.getByRole('button', { name: label, exact: true }).click();
  const workspace = page.locator(`.workspace--design[data-design-category="${id}"]`);
  await workspace.waitFor();
  await waitForStableLayout();

  const title = (await workspace.locator('.workspace-title b').textContent())?.trim();
  if (title !== label) throw new Error(`Design Workspace title mismatch for ${label}: ${title}`);
  if ((await categoryRow.getByRole('button', { name: label, exact: true }).getAttribute('aria-pressed')) !== 'true') {
    throw new Error(`Main Dock should show ${label} as the explicit active launcher while its Workspace is open.`);
  }

  const workspaceBox = await workspace.boundingBox();
  if (!workspaceBox || workspaceBox.width < 1230 || workspaceBox.width > 1250) {
    throw new Error(`${label} Workspace should stay near the 1240px asset-browser width. width=${workspaceBox?.width}`);
  }
  if (!workspaceBox || workspaceBox.height < 276 || workspaceBox.height > 284) {
    throw new Error(`${label} Workspace should stay near the compact 280px browsing height. height=${workspaceBox?.height}`);
  }

  const headerBox = await workspace.locator('.workspace-header').boundingBox();
  if (!headerBox || headerBox.height < 48 || headerBox.height > 52) {
    throw new Error(`${label} Workspace header should stay near 50px. height=${headerBox?.height}`);
  }

  const rail = workspace.locator('.workspace-primary-rail');
  const railBox = await rail.boundingBox();
  if (!railBox || railBox.width < 140) throw new Error(`${label} rail must reserve enough width for six Chinese characters.`);

  const railLabels = await workspace.locator('.workspace-primary-rail__page > button span').allTextContents();
  if (!railLabels.length) throw new Error(`${label} Workspace must expose at least one primary rail category.`);
  if (railLabels.length > 7) throw new Error(`${label} Workspace rail must show at most seven categories per group. count=${railLabels.length}`);
  if (railLabels[0]?.trim() !== '所有') throw new Error(`${label} Workspace first primary filter should use the shared two-character label “所有”.`);
  for (const railLabel of railLabels) {
    if (Array.from(railLabel.trim()).length > 6) throw new Error(`${label} rail label exceeds the six-character contract: ${railLabel}`);
  }

  const firstRailButtonBox = await workspace.locator('.workspace-primary-rail__page > button').first().boundingBox();
  if (!firstRailButtonBox || firstRailButtonBox.height < 28 || firstRailButtonBox.height > 30) {
    throw new Error(`${label} rail rows should stay near the compact 29px baseline. height=${firstRailButtonBox?.height}`);
  }

  if ((await workspace.locator('.workspace-primary-rail__page > button[aria-pressed="true"]').count()) !== 1) {
    throw new Error(`${label} Workspace must expose exactly one active primary filter.`);
  }
  if ((await workspace.locator('.workspace-context-filter__scroll > button[aria-pressed="true"]').count()) !== 1) {
    throw new Error(`${label} Workspace must expose exactly one active context filter.`);
  }

  await assertPersistentPagerSlot(workspace, label);

  const cards = workspace.locator('.design-item-card');
  const cardCount = await cards.count();
  if (cardCount < 1 || cardCount > 8) throw new Error(`${label} Workspace must show between one and eight items on a page. count=${cardCount}`);

  const firstCard = cards.first();
  const { cardBox: firstCardBox, previewBox } = await measureCompactAssetRow(firstCard);
  if (!firstCardBox || firstCardBox.width < 245 || firstCardBox.height < 63 || firstCardBox.height > 65) {
    throw new Error(`${label} item cards should use the compact ~255x64 asset-row proportion. box=${JSON.stringify(firstCardBox)}`);
  }
  if ((await firstCard.evaluate((node) => node.tagName)) !== 'BUTTON') throw new Error(`${label} asset entries must be real action buttons.`);
  if ((await firstCard.getAttribute('aria-pressed')) !== null) throw new Error(`${label} asset buttons must not expose toggle/selected aria-pressed semantics.`);
  if (!previewBox || Math.abs(previewBox.width - previewBox.height) > 1) {
    throw new Error(`${label} item previews must remain square. size=${previewBox?.width}x${previewBox?.height}`);
  }
  if (previewBox.width < 63 || previewBox.width > 65) throw new Error(`${label} item previews should remain at the 64px baseline.`);
  if (Math.abs(previewBox.x - firstCardBox.x) > 1 || Math.abs(previewBox.y - firstCardBox.y) > 1 || Math.abs(previewBox.height - firstCardBox.height) > 1) {
    throw new Error(`${label} preview must sit flush against the card's left edge and match the 64px card height. card=${JSON.stringify(firstCardBox)} preview=${JSON.stringify(previewBox)}`);
  }

  const titleFontSize = Number.parseFloat(await firstCard.locator('b').evaluate((element) => getComputedStyle(element).fontSize));
  const metaFontSize = Number.parseFloat(await firstCard.locator('span').evaluate((element) => getComputedStyle(element).fontSize));
  if (titleFontSize < 13.8 || titleFontSize > 14.6) throw new Error(`${label} item names should stay near the 14.2px primary-text baseline. size=${titleFontSize}`);
  if (metaFontSize < 10.2 || metaFontSize > 10.8) throw new Error(`${label} item metadata should stay near the 10.5px secondary-text baseline. size=${metaFontSize}`);

  await firstCard.hover();
  await page.waitForTimeout(80);
  const hoverTransform = await firstCard.evaluate((node) => getComputedStyle(node).transform);
  if (hoverTransform !== 'none') throw new Error(`${label} asset hover should not lift or scale the row. transform=${hoverTransform}`);

  if (id === 'road' || id === 'bridge') {
    if (cardCount !== 8) throw new Error(`${label} prototype should fill one complete eight-item page.`);
    const boxes = await Promise.all(Array.from({ length: 5 }, (_, index) => cards.nth(index).boundingBox()));
    if (boxes.some((box) => !box)) throw new Error(`${label} first five cards must be measurable.`);
    const [first, second, third, fourth, fifth] = boxes;
    if (Math.max(first.y, second.y, third.y, fourth.y) - Math.min(first.y, second.y, third.y, fourth.y) > 2) {
      throw new Error(`${label} first four cards must occupy the first row.`);
    }
    if (!(first.x < second.x && second.x < third.x && third.x < fourth.x)) throw new Error(`${label} first row must contain four columns.`);
    if (fifth.y <= first.y + 50) throw new Error(`${label} fifth card must begin the second row.`);
  }

  if (id === 'bridge') {
    const firstName = (await firstCard.locator('b').textContent())?.trim();
    await firstCard.hover();
    await page.waitForTimeout(340);
    const inspector = page.locator('.asset-inspector-popover');
    await inspector.waitFor();
    const inspectorBox = await inspector.boundingBox();
    if (!inspectorBox) throw new Error('Asset Inspector must be measurable.');
    if (inspectorBox.width < 240 || inspectorBox.width > 382) throw new Error(`Asset Inspector must size intrinsically inside its width constraints. width=${inspectorBox.width}`);
    if (inspectorBox.height < 90 || inspectorBox.height > 322) throw new Error(`Asset Inspector must size intrinsically inside its height constraints. height=${inspectorBox.height}`);
    if (inspectorBox.x < 14 || inspectorBox.y < 14 || inspectorBox.x + inspectorBox.width > 1906 || inspectorBox.y + inspectorBox.height > 1066) {
      throw new Error('Asset Inspector must respect the 16px gameplay safe edge.');
    }
    if ((await inspector.evaluate((node) => getComputedStyle(node).pointerEvents)) !== 'none') throw new Error('Hover Inspector must ignore pointer picking.');
    const inspectorVisual = await inspector.evaluate((node) => {
      const style = getComputedStyle(node);
      return { boxShadow: style.boxShadow, borderColor: style.borderTopColor };
    });
    if (inspectorVisual.boxShadow === 'none') throw new Error('Asset Inspector must keep a distinct elevated shadow above Workspace surfaces.');
    if (!inspectorVisual.borderColor || inspectorVisual.borderColor === 'rgba(0, 0, 0, 0)') throw new Error('Asset Inspector must keep a visible edge separate from Workspace surfaces.');
    const inspectorText = (await inspector.textContent()) ?? '';
    for (const required of ['尺寸', '造价', '规格']) {
      if (!inspectorText.includes(required)) throw new Error(`Asset Inspector missing required summary field: ${required}`);
    }
    if (firstName && !inspectorText.includes(firstName)) throw new Error('Asset Inspector must identify the hovered asset.');

    const secondCard = cards.nth(1);
    const secondName = (await secondCard.locator('b').textContent())?.trim();
    await secondCard.hover();
    await page.waitForTimeout(90);
    if (secondName && !((await inspector.textContent()) ?? '').includes(secondName)) {
      throw new Error('Once open, Asset Inspector should switch adjacent card content without repeating the initial hover delay.');
    }

    await page.screenshot({ path: `${outDir}/03-design-bridge-inspector.png` });
    await workspace.locator('.workspace-title').hover();
    await page.waitForTimeout(140);
    if ((await page.locator('.asset-inspector-popover').count()) !== 0) throw new Error('Asset Inspector must dismiss after leaving asset buttons.');
  }

  if (id === 'road' || id === 'bridge' || id === 'building' || id === 'city-wall') {
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${outDir}/03-design-${id}.png` });
  }

  await categoryRow.getByRole('button', { name: label, exact: true }).click();
  await workspace.waitFor({ state: 'detached' });
  if ((await categoryRow.locator('button[aria-pressed="true"]').count()) !== 0) {
    throw new Error(`Re-clicking ${label} must close its Workspace and clear Main Dock selection.`);
  }
}

// Switching between design launchers should replace Workspace content in-place instead of forcing an intermediate close.
await categoryRow.getByRole('button', { name: '道路', exact: true }).click();
await page.waitForSelector('.workspace--design[data-design-category="road"]');
await categoryRow.getByRole('button', { name: '桥梁', exact: true }).click();
await page.waitForSelector('.workspace--design[data-design-category="bridge"]');
if ((await page.locator('.workspace--design').count()) !== 1) throw new Error('Switching design categories must keep exactly one shared Design Workspace surface.');
if ((await categoryRow.getByRole('button', { name: '道路', exact: true }).getAttribute('aria-pressed')) !== 'false') throw new Error('Previous design launcher must clear when switching categories.');
if ((await categoryRow.getByRole('button', { name: '桥梁', exact: true }).getAttribute('aria-pressed')) !== 'true') throw new Error('Target design launcher must become active immediately.');

// Keyboard focus exposes the same Inspector immediately; asset cards remain one-shot actions.
const focusedBridgeCard = page.locator('.design-item-card').first();
await focusedBridgeCard.focus();
await page.waitForSelector('.asset-inspector-popover');
if ((await focusedBridgeCard.getAttribute('aria-describedby')) !== 'design-asset-inspector') throw new Error('Focused asset button should reference the shared Inspector.');
await page.locator('.workspace-context-filter__scroll button').first().focus();
await page.waitForTimeout(140);
if ((await page.locator('.asset-inspector-popover').count()) !== 0) throw new Error('Asset Inspector must dismiss when keyboard focus leaves asset buttons.');
if ((await page.locator('.workspace-search, .workspace-search__trigger, .workspace-search__field').count()) !== 0) throw new Error('Design Workspace search has been removed from the formal prototype.');

// Building keeps the same shared framework but its content item enters the dedicated placement Tool.
await categoryRow.getByRole('button', { name: '建筑', exact: true }).click();
await page.waitForSelector('.workspace--design[data-design-category="building"]');
const buildingCard = page.locator('.design-item-card').first();
if ((await buildingCard.getAttribute('aria-pressed')) !== null) throw new Error('Building asset cards must be action buttons, not toggles.');
await buildingCard.click();
await page.waitForSelector('.building-placement-prototype');
await page.keyboard.press('Escape');
await page.waitForSelector('.workspace--design[data-design-category="building"]');
if ((await categoryRow.getByRole('button', { name: '建筑', exact: true }).getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Exiting Building Placement must return to Design Workspace / Building context.');
}

await browser.close();
