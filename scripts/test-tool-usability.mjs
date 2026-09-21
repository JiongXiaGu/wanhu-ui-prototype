import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { stripTypeScriptTypes } from 'node:module';
import sharp from 'sharp';
import { CUSTOM_ICON_PATHS, renderCustomIcon } from './icons/custom-icon-sources.mjs';

// CI 使用 Node 22；只剥离这个纯几何模块的类型，不依赖 typescript 包的编译器 API 导出形态。
const source = await readFile('src/ui/asset-inspector/inspector-placement.ts', 'utf8');
const compiled = stripTypeScriptTypes(source, { mode: 'strip' });
const { placeInspector } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const bounds = { width: 1920, height: 1080 };
const workspace = { left: 420, top: 650, width: 1080, height: 310 };
const size = { width: 320, height: 230 };
const intersects = (a, b) => a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
let checks = 0;
for (const left of [440, 700, 1000, 1270]) {
  for (const top of [730, 850]) {
    const anchor = { left, top, width: 180, height: 64 };
    const placed = placeInspector({ anchor, size, bounds, workspace });
    assert.equal(placed.placement, 'top');
    assert(!intersects({ ...placed, ...size }, workspace), '整张目录都必须避让，而不是只避让当前条目');
    assert(placed.left >= 16 && placed.top >= 16 && placed.left + size.width <= 1904 && placed.top + size.height <= 1064);
    checks++;
  }
}
const highWorkspace = { left: 700, top: 24, width: 640, height: 750 };
const fallback = placeInspector({ anchor: { left: 720, top: 250, width: 120, height: 64 }, size, bounds, workspace: highWorkspace });
assert(!intersects({ ...fallback, ...size }, highWorkspace), '上方放不下时应选择目录外侧');
checks++;
for (const anchor of [{ left: 16, top: 16, width: 30, height: 30 }, { left: 1870, top: 1000, width: 30, height: 30 }]) {
  const result = placeInspector({ anchor, size, bounds });
  assert(result.left >= 16 && result.top >= 16 && result.left + size.width <= 1904 && result.top + size.height <= 1064);
  checks++;
}

const manifest = JSON.parse(await readFile('public/assets/ui/icons/icon-manifest.json', 'utf8'));
for (const name of Object.keys(CUSTOM_ICON_PATHS)) {
  const icon = manifest.icons.find(entry => entry.sourceName === name);
  assert(icon && icon.origin === 'wanhu-authored', name + ': 自定义来源必须准确');
  assert.equal((await readFile(icon.sourceSvg, 'utf8')).trim(), renderCustomIcon(name));
  const { data, info } = await sharp(icon.png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 64); assert.equal(info.height, 64); assert.equal(info.channels, 4);
  let visible = 0; let transparent = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) { assert.equal(data[i], 255); assert.equal(data[i + 1], 255); assert.equal(data[i + 2], 255); visible++; }
    else transparent++;
  }
  assert(visible > 100 && transparent > 100, name + ': PNG 必须有真实图形及透明背景');
  checks++;
}

// Shared Control 收敛：Scrollbar 与 Numeric Slider 内部尺寸只能由 ui-control-system.css 持有。
const sharedControlsCss = await readFile('src/ui/ui-control-system.css', 'utf8');
const settingsCss = await readFile('src/settings/settings-panel.css', 'utf8');
const settingsPanel = await readFile('src/settings/SettingsPanel.tsx', 'utf8');
const leftContextPanel = await readFile('src/ui/LeftContextPanel.tsx', 'utf8');
const buildingInspector = await readFile('src/selection/BuildingSelectionInspector.tsx', 'utf8');
const schemeMode = await readFile('src/tools/color-tool/modes/scheme/SchemeModeOverlay.tsx', 'utf8');
const placementControls = await readFile('src/tools/placement/placement-parameter-controls.css', 'utf8');
const buildingParameters = await readFile('src/tools/building-common/BuildingParameterSections.tsx', 'utf8');

assert(sharedControlsCss.includes('.ui-scroll-region'), '共享控件必须持有 ui-scroll-region');
assert(sharedControlsCss.includes('.ui-numeric-slider-field.is-standard'), '共享控件必须定义 standard density');
assert(sharedControlsCss.includes('.ui-numeric-slider-field.is-compact'), '共享控件必须定义 compact density');
assert(!settingsCss.includes('::-webkit-scrollbar') && !settingsCss.includes('scrollbar-width'), 'Settings 不得私有重画 Scrollbar');
assert(!settingsCss.includes('.settings-numeric-field'), 'Settings 不得私有持有 NumericSlider 内部尺寸');
assert(settingsPanel.includes('settings-list ui-scroll-region'), 'Settings List 必须消费共享 Scrollbar');
assert(settingsPanel.includes('density="standard"'), 'Settings Slider 必须使用 standard density');
assert(leftContextPanel.includes('left-context-panel__body ui-scroll-region'), 'LeftContextPanel Body 必须消费共享 Scrollbar');
assert(buildingInspector.includes('density="standard"'), 'Building Selection 做旧程度必须与 Settings 共用 standard density');
assert(schemeMode.includes('density="standard"'), 'Building Scheme 做旧程度必须使用 standard density');
assert(buildingParameters.includes('density="compact"'), 'Placement 参数必须显式使用 compact density');
assert(!placementControls.includes('--ui-parameter-step-size') && !placementControls.includes('--ui-parameter-value-width'), 'Placement Feature 不得持有 Slider 内部列尺寸');
assert(!placementControls.includes('.ui-slider{height:28px}'), 'Placement Feature 不得持有 Slider 内部高度');
checks += 13;

// Bottom HUD Safe Line：Main Dock 与双层 Utility 只做空间校准，不改功能分组。
const hudLayoutCss = await readFile('src/gameplay/gameplay-hud-layout.css', 'utf8');
const gameplayScreen = await readFile('src/gameplay/GameplayScreen.tsx', 'utf8');
assert(hudLayoutCss.includes('--hud-bottom-panel-height:84px'), 'Main Dock 与双层 Utility 必须共用 84px 高度');
assert(!hudLayoutCss.includes('--hud-main-dock-lift'), '统一同高后不得继续抬高 Main Dock');
assert(hudLayoutCss.includes('bottom:var(--hud-edge);'), 'Main Dock 与 Utility 必须共用 16px 底边');
assert(hudLayoutCss.includes('--hud-bottom-safe-line:calc(var(--hud-edge) + var(--hud-bottom-panel-height))'), 'Bottom HUD Safe Line 必须由统一底部面板高度定义');
const utilityCss = await readFile('src/gameplay/context-utility-toolbar.css', 'utf8');
assert(utilityCss.includes('is-world-stacked .context-utility-toolbar__button{width:36px;height:36px;flex-basis:36px}'), '84px 双层 Utility 必须使用 36px 命中区');
assert(hudLayoutCss.includes('--hud-bottom-safe-offset:calc(var(--hud-bottom-safe-line) + var(--hud-gap-md))'), 'Workspace / Hints 必须消费统一安全间距');
assert(hudLayoutCss.includes('.gameplay-screen--workspace.has-world-utility-stack .workspace'), 'Workspace 必须有双层 Utility 安全线覆盖');
assert(gameplayScreen.includes("(space === 'gameplay' || space === 'workspace')"), 'Workspace 打开时 World Utility 必须继续保持双层');
checks += 8;

// 本轮明确排除的内容必须保持原样；后续用户批准相应模块的新任务时可调整阶段保护。
const unchanged = {
  'src/gameplay/inventory-management.css': 'c9d332c653c9fea61c918fb1dbb74af9782b7d83',
  'src/gameplay/management-panel-skin.css': '9904b60f85b1d6a95cc8e639a5fdc9ffaf196970',
  'src/tools/color-tool/modes/surface/MaterialPresetWorkspace.tsx': '6556da71c0cca9c1998bceb9bc1bf3ba4db5bf63',
  'src/tools/color-tool/modes/surface/material-preset-workspace.css': 'f86a5ffe2fd50d8def4e5012e8a45d7ca2d0c92d',
  'src/ui/wanhu-theme-tokens.css': '32bdd58af0467d1badab585ba149dfc625cd9c47',
};
for (const [file, sha] of Object.entries(unchanged)) {
  assert.equal(execFileSync('git', ['hash-object', file], { encoding: 'utf8' }).trim(), sha, file + ': 超出本轮已批准范围');
  checks++;
}
console.log(`Tool usability checks: PASS (${checks} geometry / custom icon / scope checks).`);
