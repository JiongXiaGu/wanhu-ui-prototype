import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });
const report = { referenceResolution: [1920, 1080], checks: [], runtimeErrors: [], screenshots: [], typographyMetrics: { samples: {}, scaleComparisons: [], fontFaces: [] } };
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', error => report.runtimeErrors.push(error.message));

async function settle() {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(260);
}
async function open(review, waitFor = '.game-canvas') {
  const url = new URL(baseUrl);
  url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(waitFor);
  await settle();
}
async function shot(name) {
  await page.mouse.move(1900, 20);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  report.screenshots.push(name);
}
async function assertFont(selector, minimum, label) {
  const rows = await page.locator(selector).evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    const style = getComputedStyle(element);
    return [{ text: element.textContent.trim(), fontSize: parseFloat(style.fontSize), color: style.color }];
  }));
  assert(rows.length > 0, `${label}: 未找到可见文字`);
  assert(rows.every(row => row.fontSize >= minimum), `${label}: ${JSON.stringify(rows)}`);
  report.checks.push({ label, minimum, rows });
}
async function assertNoTextOverflow(selector, label) {
  const rows = await page.locator(selector).evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    return [{ text: element.textContent.trim(), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }];
  }));
  assert(rows.length > 0, `${label}: 未找到可见内容`);
  const failures = rows.filter(row => row.scrollWidth > row.clientWidth + 1);
  assert.equal(failures.length, 0, `${label}: ${JSON.stringify(failures)}`);
  report.checks.push({ label, checked: rows.length, overflowCount: failures.length });
}

async function measureTypographySample(selector, label, index = 0) {
  const locator = page.locator(selector).nth(index);
  await locator.waitFor({ state: 'visible' });
  const sample = await locator.evaluate(element => {
    const canvas = element.closest('.game-canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    const scale = canvas && canvasRect ? canvasRect.width / canvas.clientWidth : 1;
    const elementRect = element.getBoundingClientRect();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      const value = walker.currentNode.textContent?.trim();
      if (value) textNodes.push(walker.currentNode);
    }
    if (!textNodes.length) throw new Error('No visible text nodes for typography sample: ' + element.className);
    let textRect = null;
    for (const node of textNodes) {
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        textRect = textRect
          ? {
              left: Math.min(textRect.left, rect.left),
              top: Math.min(textRect.top, rect.top),
              right: Math.max(textRect.right, rect.right),
              bottom: Math.max(textRect.bottom, rect.bottom),
            }
          : { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
      }
    }
    if (!textRect) throw new Error('No measurable text rect for typography sample: ' + element.className);
    const textElement = textNodes[0].parentElement ?? element;
    const style = getComputedStyle(textElement);
    const icon = element.querySelector('.ui-icon');
    const iconRect = icon?.getBoundingClientRect() ?? null;
    const text = textNodes.map(node => node.textContent?.trim() ?? '').filter(Boolean).join(' ');
    const context = document.createElement('canvas').getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const measured = context.measureText(text);
    const textCenterY = (textRect.top + textRect.bottom) / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;
    const normalized = value => Number((value / scale).toFixed(3));
    const lineHeight = style.lineHeight === 'normal' ? null : parseFloat(style.lineHeight);
    return {
      text,
      kind: {
        han: /[\u3400-\u9fff]/.test(text),
        latin: /[A-Za-z]/.test(text),
        digit: /\d/.test(text),
      },
      fontFamily: style.fontFamily,
      fontSize: parseFloat(style.fontSize),
      fontWeight: style.fontWeight,
      lineHeight,
      letterSpacing: style.letterSpacing === 'normal' ? 0 : parseFloat(style.letterSpacing),
      canvasScale: Number(scale.toFixed(4)),
      elementHeight: normalized(elementRect.height),
      textHeight: normalized(textRect.bottom - textRect.top),
      verticalOffset: normalized(textCenterY - elementCenterY),
      iconTextOffset: iconRect ? normalized((iconRect.top + iconRect.height / 2) - textCenterY) : null,
      actualAscent: Number(measured.actualBoundingBoxAscent.toFixed(3)),
      actualDescent: Number(measured.actualBoundingBoxDescent.toFixed(3)),
      fontBoundingAscent: Number((measured.fontBoundingBoxAscent ?? 0).toFixed(3)),
      fontBoundingDescent: Number((measured.fontBoundingBoxDescent ?? 0).toFixed(3)),
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      fontSetStatus: document.fonts.status,
      notoSansLoaded: [...document.fonts].some(face => face.family.replace(/["']/g, '') === 'Noto Sans SC' && face.status === 'loaded'),
      notoSerifLoaded: [...document.fonts].some(face => face.family.replace(/["']/g, '') === 'Noto Serif SC' && face.status === 'loaded'),
    };
  });
  report.checks.push({ label: `Typography metrics / ${label}`, ...sample });
  return sample;
}

async function collectTypographyMetrics(width, height, extended = false) {
  await page.setViewportSize({ width, height });
  const key = `${width}x${height}`;
  const samples = {};

  await open('gameplay', '.gameplay-top-navigation');
  samples.mainDockCategory = await measureTypographySample('.main-dock__category-button', `${key}/Main Dock Category`);
  samples.topHudResourceLabel = await measureTypographySample('.gameplay-top-resource-shortcut small', `${key}/Top HUD Resource Label`);
  samples.topHudResourceValue = await measureTypographySample('.gameplay-top-resource-shortcut b', `${key}/Top HUD Resource Value`);

  await open('terrain-edit', '.terrain-edit-prototype');
  samples.panelTitle = await measureTypographySample('.left-context-panel__title', `${key}/Panel Title`);
  samples.secondaryAction = await measureTypographySample('.secondary-action-bar .placement-action-bar__button--labeled', `${key}/Secondary Action`);
  samples.parameterLabel = await measureTypographySample('.runtime-parameter-row>span', `${key}/Parameter Label`);
  samples.parameterValue = await measureTypographySample('.runtime-parameter-row .ui-value-button', `${key}/Parameter Value`);

  await open('settings', '.settings-space');
  samples.settingsTab = await measureTypographySample('.settings-space__tabs button', `${key}/Settings Tab`);
  samples.settingsLabel = await measureTypographySample('.settings-row__label', `${key}/Settings Label`);
  samples.resolutionMixed = await measureTypographySample('[data-setting-id="resolution"] .ui-select__trigger', `${key}/Resolution Mixed`);
  await page.getByRole('button', { name: '操作', exact: true }).click();
  await settle();
  samples.bindingLatin = await measureTypographySample('.settings-binding-control .ui-binding-field', `${key}/Binding Latin`);

  if (extended) {
    await open('workspace-building', '.workspace--design');
    samples.designWorkspaceTitle = await measureTypographySample('.workspace-title', `${key}/Design Workspace Title`);
    samples.designCardTitle = await measureTypographySample('.workspace-item-card__title', `${key}/Design Card Fractional Title`);

    await open('workspace-blueprint-all', '.workspace--blueprint');
    samples.blueprintWorkspaceTitle = await measureTypographySample('.workspace-title', `${key}/Blueprint Workspace Title`);

    await open('load', '.archive-space--load');
    samples.archiveGroup = await measureTypographySample('.archive-group-card__title', `${key}/Archive Group`);
    samples.archiveSave = await measureTypographySample('.archive-save-card__title-row', `${key}/Archive Save`);
    samples.archiveDateMixed = await measureTypographySample('.archive-save-card__time-row>small', `${key}/Archive Date Mixed`);
  }

  report.typographyMetrics.samples[key] = samples;
  return samples;
}

function assertTypographyFontSize(sample, expected, label) {
  assert(Math.abs(sample.fontSize - expected) < .05, `${label}: expected ${expected}px, got ${sample.fontSize}px`);
}

try {
  // 固定真实页面及原有交付文件名，不用合成 DOM 冒充页面回归。
  await open('load', '.archive-space--load');
  await assertFont('.archive-save-type-tabs button', 12, '存档筛选字号');
  await assertFont('.archive-save-card__title-row b', 14, '存档名称字号');
  await assertFont('.archive-group-card__title b', 13, '城市分组名称字号');
  await assertNoTextOverflow('.archive-save-card__time-row>small', '存档日期标签不截断');
  const dateLabels = await page.locator('.archive-save-card__time-row>small').evaluateAll(elements => elements.map(element => ({
    text: element.textContent.trim(), whiteSpace: getComputedStyle(element).whiteSpace,
  })));
  assert(dateLabels.length && dateLabels.every(row => row.whiteSpace === 'nowrap'), '日期标签应保持单行，不缩小字号');
  report.checks.push({ label: '存档日期标签单行', rows: dateLabels });
  await shot('typography-decision-archive');

  const selectedGroup = page.locator('.archive-group-card.is-selected').first();
  await page.keyboard.press('Tab');
  await selectedGroup.focus();
  const focus = await selectedGroup.evaluate(element => {
    const style = getComputedStyle(element);
    return { selected: element.classList.contains('is-selected'), visible: element.matches(':focus-visible'), width: style.outlineWidth, style: style.outlineStyle };
  });
  assert(focus.selected && focus.visible && parseFloat(focus.width) >= 1 && focus.style !== 'none', '选中与键盘焦点必须同时可见');
  report.checks.push({ label: 'Selected + Focus', ...focus });
  await shot('readability-archive-selected-focus');

  const toggle = page.locator('.archive-hide-outdated .ui-toggle').first();
  const toggleBefore = await toggle.evaluate(element => ({ on: element.classList.contains('is-on'), width: element.getBoundingClientRect().width }));
  await toggle.click();
  await settle();
  const toggleAfter = await toggle.evaluate(element => ({ on: element.classList.contains('is-on'), width: element.getBoundingClientRect().width }));
  assert.notEqual(toggleBefore.on, toggleAfter.on, 'Toggle 必须实际改变状态');
  assert.equal(toggleBefore.width, toggleAfter.width, 'Toggle 状态变化不得改变命中尺寸');
  report.checks.push({ label: 'Toggle 真实状态切换', before: toggleBefore, after: toggleAfter });
  await shot('readability-archive-toggle-changed');

  await open('gameplay', '.gameplay-top-navigation');
  await page.getByRole('button', { name: '库存', exact: true }).evaluate((button) => button.click());
  await page.waitForSelector('.management-space--inventory');
  await settle();
  await assertFont('.inventory-resource-row:not(.inventory-resource-row--head)>b', 13, '库存资源名称');
  await assertFont('.inventory-resource-row>strong', 14, '库存总量');
  await assertNoTextOverflow('.inventory-resource-row>strong, .inventory-resource-row>em', '库存数字不截断');
  const statusHeader = await page.locator('.inventory-resource-row--head>span').last().evaluate(element => ({
    text: element.textContent.trim(), align: getComputedStyle(element).textAlign,
  }));
  assert.equal(statusHeader.align, 'left', '库存状态表头与状态内容必须同向对齐');
  report.checks.push({ label: '库存状态列对齐', ...statusHeader });
  await shot('typography-decision-inventory');
  await page.locator('.inventory-management__tabs button').nth(1).click();
  await settle();
  await shot('readability-inventory-warehouses');
  await page.locator('.inventory-management__tabs button').nth(2).click();
  await settle();
  await shot('readability-inventory-villages');

  await page.keyboard.press('Escape');
  await page.waitForSelector('.management-space', { state: 'detached' });
  await page.getByRole('button', { name: '城市', exact: true }).evaluate((button) => button.click());
  await page.waitForSelector('.management-space--city');
  await settle();
  await assertFont('.management-task-row>span b', 13, '城市任务正文');
  await assertFont('.management-task-row>span small', 12, '城市任务说明');
  await shot('typography-decision-management');

  for (const [scenario, name] of [
    ['menu', 'readability-main-menu'],
    ['new-game', 'readability-new-game'],
    ['settings', 'readability-settings'],
    ['loading', 'readability-loading'],
    ['pause', 'readability-pause'],
    ['pause-save', 'readability-save'],
    ['management-finance', 'readability-finance'],
  ]) {
    await open(scenario);
    if (scenario === 'menu') {
      const menuShade = page.locator('.main-menu-shade');
      const menuList = page.locator('.main-menu-list');
      const primaryRow = page.locator('.menu-row.is-primary').first();
      const activeLine = primaryRow.locator('.menu-row__active-line');
      assert.equal(await activeLine.count(), 1, 'Main Menu Primary 必须使用真实结构状态线');
      const [shadeStyle, primaryStyle, activeLineStyle, retiredPseudo, listDecoration] = await Promise.all([
        menuShade.evaluate(element => {
          const style = getComputedStyle(element);
          return { backgroundImage: style.backgroundImage, backgroundColor: style.backgroundColor };
        }),
        primaryRow.evaluate(element => {
          const style = getComputedStyle(element);
          return { backgroundImage: style.backgroundImage, backgroundColor: style.backgroundColor };
        }),
        activeLine.evaluate(element => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return { opacity: style.opacity, width: rect.width, height: rect.height, boxShadow: style.boxShadow };
        }),
        primaryRow.evaluate(element => {
          const style = getComputedStyle(element, '::before');
          return { content: style.content, boxShadow: style.boxShadow, backgroundImage: style.backgroundImage };
        }),
        menuList.evaluate(element => {
          const style = getComputedStyle(element, '::after');
          return { backgroundImage: style.backgroundImage, backgroundColor: style.backgroundColor };
        }),
      ]);
      assert(shadeStyle.backgroundImage.includes('main-menu-scrim.png'), 'Main Menu 必须使用 Web / Unity 共用 main-menu-scrim.png');
      assert(!shadeStyle.backgroundImage.includes('gradient'), 'Main Menu Shade 不得恢复 CSS Gradient');
      assert.equal(primaryStyle.backgroundImage, 'none', 'Main Menu Primary Row 不得依赖 Gradient');
      assert.notEqual(primaryStyle.backgroundColor, 'rgba(0, 0, 0, 0)', 'Main Menu Primary Row 必须有稳定纯色状态底');
      assert.equal(activeLineStyle.opacity, '1', 'Main Menu Primary 真实状态线必须可见');
      assert.equal(activeLineStyle.width, 2, 'Main Menu Primary 真实状态线必须保持 2px');
      assert.equal(activeLineStyle.boxShadow, 'none', 'Main Menu Primary 状态线不得依赖 Glow');
      assert(['none', 'normal'].includes(retiredPseudo.content), 'Main Menu Primary 不得继续生成 ::before 状态线');
      assert.equal(retiredPseudo.boxShadow, 'none', 'Main Menu Primary 退役伪元素不得保留 Glow');
      assert.equal(retiredPseudo.backgroundImage, 'none', 'Main Menu Primary 退役伪元素不得保留图像状态');
      assert.equal(listDecoration.backgroundImage, 'none', 'Main Menu 底部装饰线不得依赖 Gradient');
      report.checks.push({ label: 'Main Menu Unity 6.6 visual parity', shadeStyle, primaryStyle, activeLineStyle, retiredPseudo, listDecoration });
    }
    if (scenario === 'settings') {
      const activeTab = page.locator('.settings-space__tabs button.is-active').first();
      const indicator = activeTab.locator('.settings-space__tab-indicator');
      assert.equal(await indicator.count(), 1, 'Settings Active Tab 必须使用真实结构状态线');
      const indicatorStyle = await indicator.evaluate(element => {
        const style = getComputedStyle(element);
        return { opacity: style.opacity, height: style.height, transform: style.transform };
      });
      assert.equal(indicatorStyle.opacity, '1', 'Settings Active Tab 状态线必须可见');
      assert(parseFloat(indicatorStyle.height) >= 2, 'Settings Active Tab 状态线高度必须保持可辨识');
      report.checks.push({ label: 'Settings real active tab indicator', ...indicatorStyle });
    }
    if (scenario === 'loading') {
      const loading = page.locator('.loading-space');
      const [beforeStyle, afterStyle, shadeStyle, tipStyle, trackStyle, fillStyle] = await Promise.all([
        loading.evaluate(element => {
          const style = getComputedStyle(element, '::before');
          return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow };
        }),
        loading.evaluate(element => {
          const style = getComputedStyle(element, '::after');
          return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow };
        }),
        page.locator('.loading-space__shade').evaluate(element => {
          const style = getComputedStyle(element);
          return { backdropFilter: style.backdropFilter || style.webkitBackdropFilter || 'none', backgroundImage: style.backgroundImage };
        }),
        page.locator('.loading-space__tip').evaluate(element => {
          const style = getComputedStyle(element);
          return { textShadow: style.textShadow };
        }),
        page.locator('.loading-space__track').evaluate(element => {
          const style = getComputedStyle(element);
          return { boxShadow: style.boxShadow, borderWidth: style.borderTopWidth };
        }),
        page.locator('.loading-space__track i').evaluate(element => {
          const style = getComputedStyle(element);
          return { backgroundImage: style.backgroundImage, boxShadow: style.boxShadow, width: element.getBoundingClientRect().width };
        }),
      ]);
      assert(beforeStyle.backgroundImage.includes('loading-scrim.png'), 'Loading 必须使用 Web / Unity 共用 Scrim PNG');
      assert(!beforeStyle.backgroundImage.includes('gradient'), 'Loading Scrim 不得继续依赖 CSS Gradient');
      assert.equal(afterStyle.boxShadow, 'none', 'Loading 外层不得继续依赖 Inset box-shadow');
      assert.equal(shadeStyle.backdropFilter, 'none', 'Loading 不得拥有私有 backdrop-filter');
      assert.equal(shadeStyle.backgroundImage, 'none', 'Loading Shade 不得恢复 Web-only Gradient');
      assert.equal(tipStyle.textShadow, 'none', 'Loading Tip 不得依赖 text-shadow 保证可读性');
      assert.equal(trackStyle.boxShadow, 'none', 'Loading Progress Track 不得依赖 inset box-shadow');
      assert.notEqual(trackStyle.borderWidth, '0px', 'Loading Progress Track 必须使用可迁移实线边缘');
      assert.equal(fillStyle.backgroundImage, 'none', 'Loading Progress Fill 不得依赖 Gradient');
      assert.equal(fillStyle.boxShadow, 'none', 'Loading Progress Fill 不得依赖 Glow');
      assert(fillStyle.width > 0, 'Loading Review 必须显示真实进度');
      report.checks.push({ label: 'Loading Unity 6.6 visual parity', beforeStyle, afterStyle, shadeStyle, tipStyle, trackStyle, fillStyle });
    }
    await shot(name);
  }

  // Global Space Focus 必须独立于 Selected，统一消费当前 Brass Text focus token。
  await open('new-game', '.new-game-space');
  const newGameActiveFilter = page.locator('.new-game-map-filters button.is-active').first();
  await page.keyboard.press('Tab');
  await newGameActiveFilter.focus();
  const newGameFilterFocus = await newGameActiveFilter.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      selected: element.classList.contains('is-active'),
      visible: element.matches(':focus-visible'),
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
    };
  });
  assert(newGameFilterFocus.selected && newGameFilterFocus.visible, 'New Game 当前筛选与键盘 Focus 必须能同时存在');
  assert.equal(newGameFilterFocus.outlineColor, 'rgb(209, 180, 122)', 'New Game Focus 必须使用当前 Brass Text focus token');
  assert(parseFloat(newGameFilterFocus.outlineWidth) >= 1, 'New Game Focus 轮廓必须可见');
  report.checks.push({ label: 'New Game Selected + Focus', ...newGameFilterFocus });
  await shot('readability-new-game-focus');

  // Unity 6000.6 Visual Parity：正式 Web 视觉本身不依赖 Gradient / box-shadow。
  const unityCoreSegment = page.locator('.new-game-segmented>button.is-active').first();
  await page.keyboard.press('Tab');
  await unityCoreSegment.focus();
  const unityCoreSegmentState = await unityCoreSegment.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      selected: element.classList.contains('is-active'),
      focusVisible: element.matches(':focus-visible'),
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
    };
  });
  assert(unityCoreSegmentState.selected && unityCoreSegmentState.focusVisible, 'Unity Parity Segmented Selected 与 Focus 必须同时存在');
  assert.equal(unityCoreSegmentState.backgroundImage, 'none', '正式 Web 视觉必须关闭 Segmented gradient');
  assert.notEqual(unityCoreSegmentState.backgroundColor, 'rgba(0, 0, 0, 0)', 'Segmented 必须直接使用纯色 Selected');
  assert(parseFloat(unityCoreSegmentState.outlineWidth) >= 1, 'Segmented Focus 不能依赖 shadow');
  report.checks.push({ label: 'Unity Parity Segmented Selected + Focus', ...unityCoreSegmentState });
  await shot('readability-unity-core-segmented');

  await open('settings', '.settings-space');
  await page.getByRole('button', { name: '图形', exact: true }).click();
  const unityCoreSliderInput = page.getByRole('slider', { name: '渲染比例', exact: true });
  await page.keyboard.press('Tab');
  await unityCoreSliderInput.focus();
  const unityCoreSliderState = await page.locator('[data-setting-id="render-scale"] .ui-slider').evaluate(element => {
    const track = element.querySelector('.ui-slider__track');
    const fill = track?.querySelector('i');
    const thumb = element.querySelector('.ui-slider__thumb');
    const input = element.querySelector('input');
    if (!track || !fill || !thumb || !input) throw new Error('Unity Parity Slider structure missing.');
    const trackStyle = getComputedStyle(track);
    const fillStyle = getComputedStyle(fill);
    const thumbStyle = getComputedStyle(thumb);
    return {
      focusVisible: input.matches(':focus-visible'),
      fillBackgroundImage: fillStyle.backgroundImage,
      fillBackgroundColor: fillStyle.backgroundColor,
      trackBoxShadow: trackStyle.boxShadow,
      trackOutlineColor: trackStyle.outlineColor,
      trackOutlineWidth: trackStyle.outlineWidth,
      thumbBoxShadow: thumbStyle.boxShadow,
    };
  });
  assert(unityCoreSliderState.focusVisible, 'Unity Parity Slider input Focus 必须可见');
  assert.equal(unityCoreSliderState.fillBackgroundImage, 'none', '正式 Web 视觉必须关闭 Slider gradient');
  assert.notEqual(unityCoreSliderState.fillBackgroundColor, 'rgba(0, 0, 0, 0)', 'Slider Fill 必须直接使用纯色');
  assert.equal(unityCoreSliderState.trackBoxShadow, 'none', '正式 Web 视觉必须关闭 Slider track shadow');
  assert.equal(unityCoreSliderState.thumbBoxShadow, 'none', '正式 Web 视觉必须关闭 Slider thumb shadow');
  assert(parseFloat(unityCoreSliderState.trackOutlineWidth) >= 1, 'Slider Focus 必须有非 shadow 轮廓');
  report.checks.push({ label: 'Unity Parity Slider Fill + Focus', ...unityCoreSliderState });
  await shot('readability-unity-core-slider');

  // Slider Core Review 导航到 Settings；恢复 New Game 后继续既有地图卡 Selected + Focus 回归。
  await open('new-game', '.new-game-space');
  const selectedMapCard = page.locator('.new-game-map-card.is-selected').first();
  await selectedMapCard.focus();
  await settle();
  const newGameCardFocus = await selectedMapCard.evaluate(element => ({
    selected: element.classList.contains('is-selected'),
    visible: element.matches(':focus-visible'),
    borderColor: getComputedStyle(element).borderColor,
  }));
  assert(newGameCardFocus.selected && newGameCardFocus.visible, 'New Game 地图 Selected 与 Focus 必须同时可见');
  assert.equal(newGameCardFocus.borderColor, 'rgb(209, 180, 122)', 'New Game 地图 Focus 边缘必须使用 Control Focus');
  report.checks.push({ label: 'New Game Card Selected + Focus', ...newGameCardFocus });

  await open('pause-save', '.save-game-space');
  const saveRename = page.locator('.save-group-rename').first();
  await page.keyboard.press('Tab');
  await saveRename.focus();
  const saveFocus = await saveRename.evaluate(element => {
    const style = getComputedStyle(element);
    return { visible: element.matches(':focus-visible'), outlineColor: style.outlineColor, outlineWidth: style.outlineWidth };
  });
  assert(saveFocus.visible && parseFloat(saveFocus.outlineWidth) >= 1, 'Save utility Focus 必须可见');
  assert.equal(saveFocus.outlineColor, 'rgb(209, 180, 122)', 'Save utility Focus 必须使用当前 Brass Text focus token');
  report.checks.push({ label: 'Save Utility Focus', ...saveFocus });
  await shot('readability-save-focus');

  // Color Tool Focus Review：HEX / RGB / HSV 使用独立 Control Focus；Workspace Selected 与 Focus 可共存。
  await open('color-tool-surface', '.color-tool-surface-panel');
  await page.getByRole('button', { name: '调整主色', exact: true }).click();
  await page.waitForSelector('.material-color-editor');
  await settle();

  const hueStripState = await page.locator('.material-color-editor__hue-range').evaluate(element => ({
    backgroundImage: getComputedStyle(element).backgroundImage,
  }));
  assert(hueStripState.backgroundImage.includes('hue-strip.png'), 'Color Tool Hue 必须消费 Web / Unity 共用 hue-strip.png');
  assert(!hueStripState.backgroundImage.includes('linear-gradient'), 'Color Tool Hue 不得恢复 CSS Gradient');
  report.checks.push({ label: 'Color Tool shared Hue Strip asset', ...hueStripState });

  const colorHexInput = page.getByRole('textbox', { name: '十六进制颜色', exact: true });
  await page.keyboard.press('Tab');
  await colorHexInput.focus();
  const colorHexFocus = await colorHexInput.evaluate(element => {
    const style = getComputedStyle(element);
    return { visible: element.matches(':focus-visible'), outlineColor: style.outlineColor, outlineWidth: style.outlineWidth };
  });
  assert(colorHexFocus.visible && parseFloat(colorHexFocus.outlineWidth) >= 1, 'Color Tool HEX Focus 必须可见');
  assert.equal(colorHexFocus.outlineColor, 'rgb(209, 180, 122)', 'Color Tool HEX Focus 必须使用 Control Focus');
  report.checks.push({ label: 'Color Tool HEX Focus', ...colorHexFocus });

  const rgbValue = page.locator('[data-color-channel="R"] .ui-value-button').first();
  await page.keyboard.press('Tab');
  await rgbValue.focus();
  const rgbFocus = await rgbValue.evaluate(element => {
    const style = getComputedStyle(element);
    return { visible: element.matches(':focus-visible'), outlineColor: style.outlineColor, outlineWidth: style.outlineWidth };
  });
  assert(rgbFocus.visible && parseFloat(rgbFocus.outlineWidth) >= 1, 'Color Tool RGB Focus 必须可见');
  assert.equal(rgbFocus.outlineColor, 'rgb(209, 180, 122)', 'Color Tool RGB Focus 必须使用 Control Focus');
  report.checks.push({ label: 'Color Tool RGB Focus', ...rgbFocus });

  await page.getByRole('button', { name: 'HSV', exact: true }).click();
  await settle();
  const hsvValue = page.locator('[data-color-channel="H"] .ui-value-button').first();
  await page.keyboard.press('Tab');
  await hsvValue.focus();
  const hsvFocus = await hsvValue.evaluate(element => {
    const style = getComputedStyle(element);
    return { visible: element.matches(':focus-visible'), outlineColor: style.outlineColor, outlineWidth: style.outlineWidth };
  });
  assert(hsvFocus.visible && parseFloat(hsvFocus.outlineWidth) >= 1, 'Color Tool HSV Focus 必须可见');
  assert.equal(hsvFocus.outlineColor, 'rgb(209, 180, 122)', 'Color Tool HSV Focus 必须使用 Control Focus');
  report.checks.push({ label: 'Color Tool HSV Focus', ...hsvFocus });
  await shot('readability-color-tool-focus');

  await open('color-tool-surface', '.color-tool-surface-panel');
  await page.getByRole('button', { name: '打开材质方案库', exact: true }).click();
  await page.waitForSelector('.material-preset-workspace');
  await settle();

  const selectedMaterialFamily = page.locator('.material-preset-workspace__rail-list>button.is-active').first();
  await page.keyboard.press('Tab');
  await selectedMaterialFamily.focus();
  const materialFamilyFocus = await selectedMaterialFamily.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      selected: element.classList.contains('is-active') && element.getAttribute('aria-pressed') === 'true',
      visible: element.matches(':focus-visible'),
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
    };
  });
  assert(materialFamilyFocus.selected && materialFamilyFocus.visible, 'Material Family Selected 与 Focus 必须能同时存在');
  assert.equal(materialFamilyFocus.outlineColor, 'rgb(209, 180, 122)', 'Material Family Focus 必须使用 Control Focus');
  assert(parseFloat(materialFamilyFocus.outlineWidth) >= 1, 'Material Family Focus 轮廓必须可见');
  report.checks.push({ label: 'Material Family Selected + Focus', ...materialFamilyFocus });

  const selectedSchemeFilter = page.locator('.material-preset-workspace__source-filter .workspace-context-filter__scroll>button.is-active').first();
  await page.keyboard.press('Tab');
  await selectedSchemeFilter.focus();
  const schemeFilterFocus = await selectedSchemeFilter.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      selected: element.classList.contains('is-active') && element.getAttribute('aria-pressed') === 'true',
      visible: element.matches(':focus-visible'),
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
    };
  });
  assert(schemeFilterFocus.selected && schemeFilterFocus.visible, 'Scheme Filter Selected 与 Focus 必须能同时存在');
  assert.equal(schemeFilterFocus.outlineColor, 'rgb(209, 180, 122)', 'Scheme Filter Focus 必须使用 Control Focus');
  assert(parseFloat(schemeFilterFocus.outlineWidth) >= 1, 'Scheme Filter Focus 轮廓必须可见');
  report.checks.push({ label: 'Scheme Filter Selected + Focus', ...schemeFilterFocus });
  await shot('color-scheme-focus');

  // 当前 LeftContextPanel 不再附加已退役的裸 gameplay-context-panel 类。
  await open('camera', '.gameplay-context-panel--camera');
  await assertFont('.ui-numeric-slider-field>.ui-value-button', 11, '相机参数值可读性');
  await assertNoTextOverflow('.ui-numeric-slider-field>.ui-value-button', '相机参数值不截断');
  await shot('readability-camera-day');

  // 先进入真实场景模拟模式，再通过时间控件进入夜景；不修改 dataset 或伪造背景。
  await open('weather', '.gameplay-context-panel--weather');
  await page.getByRole('button', { name: '场景模拟', exact: true }).click();
  await settle();
  await shot('readability-weather-day');
  const timeSlider = page.getByRole('slider', { name: '日内时间', exact: true });
  await timeSlider.focus();
  await timeSlider.press('End');
  await page.waitForSelector('.gameplay-screen[data-time-of-day="night"]');
  await settle();
  report.checks.push({ label: '真实时间控件切换夜景', time: await timeSlider.inputValue() });
  await shot('readability-weather-night');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.gameplay-left-context-surface', { state: 'detached' });
  await page.getByRole('button', { name: '建筑', exact: true }).click();
  await page.waitForSelector('.workspace--catalog');
  await settle();
  await shot('readability-workspace-night');

  // W3.1 Typography Metrics Baseline：只测量现有真实 Consumer，不在本批修改正式 UI。
  const metrics1080 = await collectTypographyMetrics(1920, 1080, true);
  assertTypographyFontSize(metrics1080.mainDockCategory, 11, 'Main Dock Category');
  assertTypographyFontSize(metrics1080.secondaryAction, 11, 'Secondary Action');
  assertTypographyFontSize(metrics1080.settingsTab, 12, 'Settings Tab');
  assertTypographyFontSize(metrics1080.settingsLabel, 12, 'Settings Label');
  assertTypographyFontSize(metrics1080.archiveGroup, 13, 'Archive Group');
  assertTypographyFontSize(metrics1080.archiveSave, 14, 'Archive Save');
  assertTypographyFontSize(metrics1080.panelTitle, 16, 'Left Context Panel Title');
  assertTypographyFontSize(metrics1080.designWorkspaceTitle, 16, 'Design Workspace Title');
  assertTypographyFontSize(metrics1080.blueprintWorkspaceTitle, 18, 'Blueprint Workspace Title');
  assert(Math.abs(metrics1080.designCardTitle.fontSize - 14.2) < .05, 'W3.1 必须记录 Design Card 14.2px 历史例外，不在基线阶段偷偷改值');
  assert(metrics1080.resolutionMixed.kind.han && metrics1080.resolutionMixed.kind.digit, 'Resolution sample 必须覆盖中文 + 数字混排');
  assert(metrics1080.bindingLatin.kind.latin, 'Binding sample 必须覆盖 Latin / shortcut 字形');
  assert(metrics1080.parameterValue.kind.digit && metrics1080.parameterValue.kind.latin, 'Parameter value 必须覆盖数字 + 单位混排');
  report.typographyMetrics.fontFaces = [
    { family: 'Noto Sans SC', loaded: metrics1080.settingsLabel.notoSansLoaded },
    { family: 'Noto Serif SC', loaded: metrics1080.settingsLabel.notoSerifLoaded },
  ];

  const metrics4k = await collectTypographyMetrics(3840, 2160, false);
  for (const sampleKey of ['mainDockCategory','topHudResourceLabel','topHudResourceValue','panelTitle','secondaryAction','parameterLabel','parameterValue','settingsTab','settingsLabel','resolutionMixed','bindingLatin']) {
    const a = metrics1080[sampleKey];
    const b = metrics4k[sampleKey];
    const comparison = {
      sample: sampleKey,
      fontSize1080: a.fontSize,
      fontSize4k: b.fontSize,
      lineHeight1080: a.lineHeight,
      lineHeight4k: b.lineHeight,
      verticalOffset1080: a.verticalOffset,
      verticalOffset4k: b.verticalOffset,
      iconTextOffset1080: a.iconTextOffset,
      iconTextOffset4k: b.iconTextOffset,
      elementHeight1080: a.elementHeight,
      elementHeight4k: b.elementHeight,
    };
    assert(Math.abs(a.fontSize - b.fontSize) < .05, sampleKey + ': 4K 不得生成第二套字号');
    assert(Math.abs(a.elementHeight - b.elementHeight) < .2, sampleKey + ': 4K 归一化控件高度不得漂移');
    assert(Math.abs(a.verticalOffset - b.verticalOffset) < .2, sampleKey + ': 4K 归一化文字中心不得漂移');
    if (a.iconTextOffset !== null && b.iconTextOffset !== null) {
      assert(Math.abs(a.iconTextOffset - b.iconTextOffset) < .2, sampleKey + ': 4K Icon/Text 归一化对齐不得漂移');
    }
    report.typographyMetrics.scaleComparisons.push(comparison);
  }

  await open('camera', '.gameplay-context-panel--camera');
  await page.setViewportSize({ width: 3840, height: 2160 });
  await settle();
  const canvas = await page.locator('.game-canvas').boundingBox();
  assert(canvas && Math.abs(canvas.width - 3840) < 2 && Math.abs(canvas.height - 2160) < 2, '4K 应等比缩放同一逻辑画布');
  report.checks.push({ label: '4K 逻辑画布缩放', canvas });
  await shot('readability-camera-4k');
  assert.equal(report.runtimeErrors.length, 0, `Runtime errors: ${report.runtimeErrors.join('; ')}`);
  console.log('Readability / controls / typography metrics / day-night / 4K checks passed.');
} catch (error) {
  report.failure = String(error.stack || error);
  await page.screenshot({ path: `${outDir}/readability-failure.png` }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${outDir}/readability-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
