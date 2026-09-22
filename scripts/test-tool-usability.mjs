import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { stripTypeScriptTypes } from 'node:module';
import sharp from 'sharp';
import { CUSTOM_ICON_PATHS, renderCustomIcon } from './icons/custom-icon-sources.mjs';

// CI 使用 Node 22；只剥离这个纯几何模块的类型，不依赖 typescript 包的编译器 API 导出形态。
const source = await readFile('src/ui/hover/hover-placement.ts', 'utf8');
const compiled = stripTypeScriptTypes(source, { mode: 'strip' });
const { placeHoverSurface } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const bounds = { width: 1920, height: 1080 };
const workspace = { left: 420, top: 650, width: 1080, height: 310 };
const size = { width: 320, height: 230 };
const intersects = (a, b) => a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
let checks = 0;
for (const left of [440, 700, 1000, 1270]) {
  for (const top of [730, 850]) {
    const anchor = { left, top, width: 180, height: 64 };
    const placed = placeHoverSurface({ kind: 'card', anchor, size, bounds, workspace, placementMode: 'workspace-edge' });
    assert.equal(placed.placement, 'top');
    assert(!intersects({ ...placed, ...size }, workspace), '整张目录都必须避让，而不是只避让当前条目');
    assert(placed.left >= 16 && placed.top >= 16 && placed.left + size.width <= 1904 && placed.top + size.height <= 1064);
    checks++;
  }
}
const highWorkspace = { left: 700, top: 24, width: 640, height: 750 };
const fallback = placeHoverSurface({ kind: 'card', anchor: { left: 720, top: 250, width: 120, height: 64 }, size, bounds, workspace: highWorkspace, placementMode: 'workspace-edge' });
assert(!intersects({ ...fallback, ...size }, highWorkspace), '上方放不下时应选择目录外侧');
checks++;
const attachedAnchor = { left: 440, top: 730, width: 180, height: 64 };
const attached = placeHoverSurface({ kind: 'card', anchor: attachedAnchor, size, bounds, workspace, placementMode: 'anchor' });
assert.equal(attached.placement, 'right', 'Anchor 模式优先贴在条目右侧');
assert(!intersects({ ...attached, ...size }, attachedAnchor), 'Anchor 模式不能遮住当前条目');
assert(intersects({ ...attached, ...size }, workspace), 'Anchor 模式允许在目录内部贴近条目，而不是强制跳到 Workspace 上方');
checks++;
for (const anchor of [{ left: 16, top: 16, width: 30, height: 30 }, { left: 1870, top: 1000, width: 30, height: 30 }]) {
  const result = placeHoverSurface({ kind: 'card', anchor, size, bounds });
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
const secondaryActionCss = await readFile('src/tools/secondary-action-bar.css', 'utf8');
const placementActionCss = await readFile('src/tools/placement/placement-action-bar.css', 'utf8');
const toolActionSource = await readFile('src/tools/ToolActionBar.tsx', 'utf8');
const mainSource = await readFile('src/main.tsx', 'utf8');
const terrainCss = await readFile('src/tools/terrain-edit/terrain-edit.css', 'utf8');
const treeCss = await readFile('src/tools/tree-placement/tree-placement.css', 'utf8');
const selectionCss = await readFile('src/selection/building-selection.css', 'utf8');
const mainDockCss = await readFile('src/gameplay/main-dock.css', 'utf8');
const commandBarSource = await readFile('src/gameplay/CommandBar.tsx', 'utf8');
const legacyStyles = await readFile('src/styles.css', 'utf8');
const workspaceCss = await readFile('src/workspace.css', 'utf8');
const operationHintsCss = await readFile('src/gameplay/operation-hints.css', 'utf8');
const uiVisualCss = await readFile('src/ui/ui-visual-system.css', 'utf8');
const migrationAudit = await readFile('scripts/audit-unity-migration.mjs', 'utf8');
const hoverOverlaySource = await readFile('src/ui/hover/HoverOverlay.tsx', 'utf8');
const hoverCss = await readFile('src/ui/hover/hover-overlay.css', 'utf8');
const toolActionSourceForHover = await readFile('src/tools/ToolActionBar.tsx', 'utf8');
const utilitySourceForHover = await readFile('src/gameplay/ContextUtilityToolbar.tsx', 'utf8');
const gameplayHudSourceForHover = await readFile('src/gameplay/GameplayHUD.tsx', 'utf8');
const designWorkspaceSourceForHover = await readFile('src/workspace/DesignWorkspace.tsx', 'utf8');
const materialWorkspaceSourceForHover = await readFile('src/tools/color-tool/modes/surface/MaterialPresetWorkspace.tsx', 'utf8');
const buildingSchemeWorkspaceSourceForHover = await readFile('src/tools/color-tool/modes/scheme/BuildingSchemeWorkspace.tsx', 'utf8');
const buildingParameters = await readFile('src/tools/building-common/BuildingParameterSections.tsx', 'utf8');
const hudLayoutCss = await readFile('src/gameplay/gameplay-hud-layout.css', 'utf8');

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
assert(mainSource.includes("import './tools/secondary-action-bar.css';"), 'Secondary Action Bar 必须拥有独立共享样式入口');
assert(toolActionSource.includes('secondary-action-bar') && toolActionSource.includes('size={24}'), 'ToolActionBar 必须挂载共享 Secondary Action Bar 并使用 24px 图标');
assert(secondaryActionCss.includes('height:var(--secondary-action-bar-height,84px)') && secondaryActionCss.includes('height:var(--secondary-action-control-height,64px)'), '所有二级中下栏必须统一 84px / 64px Geometry');
assert(secondaryActionCss.includes('flex-direction:column') && secondaryActionCss.includes('font-size:var(--secondary-action-label-size,11px)'), 'Secondary Action Bar 必须使用上图标下文字且文字为 11px');
assert(secondaryActionCss.includes('width:var(--secondary-action-button-width,76px)') && secondaryActionCss.includes('var(--secondary-action-icon-size,24px)'), 'Secondary Action Bar 必须使用 76px 按钮与 24px 主图标');
assert(!placementActionCss.includes('placement-action-bar__button--labeled') && !placementActionCss.includes('height:60px'), 'Placement 不得再维护第二套按钮 Geometry');
assert(!terrainCss.includes('terrain-edit-toolbar-cluster{') && !treeCss.includes('tree-placement-toolbar-cluster{'), 'Terrain / Tree 不得私有维护中下栏屏幕锚点');
assert(!selectionCss.includes('building-selection-action-cluster{') && !selectionCss.includes('building-selection-secondary-action-bar{height:'), 'Building Selection 不得私有维护中下栏 Geometry');
assert(mainSource.includes("import './gameplay/main-dock.css';"), 'Main Dock 必须拥有独立共享样式入口');
assert(hudLayoutCss.includes('--hud-core-width:880px') && hudLayoutCss.includes('--main-dock-control-height:64px'), 'Main Dock 必须固定 880×84 并共享 64px 内部控制高度');
assert(hudLayoutCss.includes('--main-dock-mode-width:76px') && hudLayoutCss.includes('--main-dock-mode-button-width:68px') && hudLayoutCss.includes('--main-dock-mode-button-height:30px'), 'Main Dock Mode Rail 必须使用 76px Rail 与 68×30px 双行按钮');
assert(commandBarSource.includes('Pencil') && commandBarSource.includes('ScrollText') && commandBarSource.includes('main-dock__mode-button'), '设计 / 蓝图必须使用带图标的独立 Mode Rail');
assert(commandBarSource.includes('<Icon size={18} />'), '设计 / 蓝图 Mode 图标必须使用 18px');
assert(commandBarSource.includes('key={mode}') && commandBarSource.includes('main-dock__category-button'), '分类内容切换必须只重挂 Category Strip');
assert(mainDockCss.includes('--main-dock-category-icon-size,24px') && mainDockCss.includes('--main-dock-label-size,11px'), 'Main Dock 分类必须使用 24px 图标 + 11px 文字');
assert(mainDockCss.includes('.main-dock__mode-switch') && mainDockCss.includes('flex-direction:column') && mainDockCss.includes('--main-dock-mode-button-width,68px'), '设计 / 蓝图必须使用上下两行 Mode Rail');
assert(mainDockCss.includes('.main-dock__mode-button') && mainDockCss.includes('flex-direction:row') && mainDockCss.includes('--main-dock-mode-button-height,30px'), 'Mode Rail 单行必须为图标左 / 文字右的 68×30px 横向按钮');
assert(!commandBarSource.includes('<i className="main-dock__state-line" aria-hidden="true" />\n              <Icon size={20}'), '设计 / 蓝图 Mode 不得再挂底部 State Line');
assert(!mainDockCss.includes('.main-dock__mode-button .main-dock__state-line') && mainDockCss.includes('.main-dock__category-button .main-dock__state-line'), '只删除 Mode 底线，Category 顶部状态线必须保留');
assert(!legacyStyles.includes('.command-bar{position:absolute'), '旧 Main Dock Geometry 不得继续散落在 styles.css');
assert(!legacyStyles.includes('/* Workspace base geometry.') && !legacyStyles.includes('.segment{'), 'styles.css 不得继续持有 Workspace / Segment 业务 Geometry');
assert(workspaceCss.includes('position:absolute') && workspaceCss.includes('display:flex') && workspaceCss.includes('flex-direction:column'), 'Workspace Shell 结构必须由 workspace.css 自己持有');
assert(mainSource.includes("import './gameplay/operation-hints.css';") && !mainSource.includes('operation-hints-refined.css') && !mainSource.includes("import './operation-hints.css';"), 'Operation Hints 必须只有一个正式 Runtime 样式入口');
const operationHintsRootRule = operationHintsCss.match(/\.gameplay-operation-hints\s*\{([^}]*)\}/s)?.[1] ?? '';
assert(!operationHintsRootRule.includes('backdrop-filter') && !operationHintsRootRule.includes('box-shadow:') && !operationHintsRootRule.includes('background:'), 'Operation Hints Root 不得持有 Surface 材质');
assert(!uiVisualCss.includes('.gameplay-screen .workspace,') && !uiVisualCss.includes('.bottom-command-surface{'), 'ui-visual-system 不得重复持有 Gameplay Surface 材质');
assert(!mainDockCss.includes('display:grid') && mainDockCss.includes('display:flex') && mainDockCss.includes('flex:1 1 0'), 'Main Dock Category Strip 必须使用 Flex 而不是新增长期 Grid 债务');
assert(migrationAudit.includes('SHARED_CONTROL_INTERNAL_OWNER_FILES') && migrationAudit.includes('SHARED_SURFACE_MATERIAL_OWNER_FILES'), 'Unity migration audit 必须包含 Shared Control / Surface Ownership Guard');
assert(hoverOverlaySource.includes('HoverOverlayProvider') && hoverOverlaySource.includes('HoverOverlayHost') && hoverOverlaySource.includes("kind === 'tooltip'") && hoverOverlaySource.includes("kind === 'card'"), 'Global Hover Framework 必须同时支持 Tooltip / Hover Card');
assert(hoverOverlaySource.includes('if (dialog) clear()') && hoverOverlaySource.includes("event.key === 'Escape'"), 'Hover Framework 必须在 Modal / Escape 时清理');
assert(hoverCss.includes('--ui-layer-hover,180') && hoverCss.includes('pointer-events:none'), 'Hover Overlay 必须位于全局 Hover Layer 且不截断底层 Pointer');
assert(!toolActionSourceForHover.includes('data-tooltip=') && toolActionSourceForHover.includes('hover.bind'), 'Secondary Action Bar 必须迁移到全局 Tooltip');
assert(!utilitySourceForHover.includes('data-tooltip=') && utilitySourceForHover.includes('hover.bind'), 'Context Utility 必须迁移到全局 Tooltip');
assert(!gameplayHudSourceForHover.includes('data-tooltip=') && gameplayHudSourceForHover.includes('hover.bind'), 'Top HUD Tooltip 必须迁移到全局 Tooltip');
assert(!designWorkspaceSourceForHover.includes('AssetInspector') && designWorkspaceSourceForHover.includes("kind: 'card'") && designWorkspaceSourceForHover.includes('hover.bind'), 'Design Workspace 必须使用通用 Hover Card');
assert(materialWorkspaceSourceForHover.includes("kind: 'card'") && materialWorkspaceSourceForHover.includes('hover.bind'), 'Material Preset Workspace 必须使用通用 Hover Card');
assert(buildingSchemeWorkspaceSourceForHover.includes("kind: 'card'") && buildingSchemeWorkspaceSourceForHover.includes('hover.bind'), 'Building Scheme Workspace 必须使用通用 Hover Card');
assert(hoverOverlaySource.includes('placementMode?: HoverCardPlacementMode') && hoverOverlaySource.includes("placementMode ?? 'anchor'"), 'Hover Card 必须由框架统一持有显式 Placement Mode，默认 Anchor');
assert(designWorkspaceSourceForHover.includes("placementMode: 'workspace-edge'") && materialWorkspaceSourceForHover.includes("placementMode: 'workspace-edge'"), 'Design / Material Workspace 保留显式 Workspace Edge 模式');
assert(buildingSchemeWorkspaceSourceForHover.includes("placementMode: 'anchor'"), 'Building Scheme Hover Card 必须使用条目锚定模式');
assert(hoverOverlaySource.includes('looksLikeShortcut') && hoverOverlaySource.includes('detailIsShortcut'), 'Tooltip label adapter 必须区分快捷键与普通描述');

checks += 54;

// Bottom HUD Safe Line：Main Dock 与双层 Utility 只做空间校准，不改功能分组。
const gameplayScreen = await readFile('src/gameplay/GameplayScreen.tsx', 'utf8');
const operationHintsSource = await readFile('src/gameplay/GameplayOperationHints.tsx', 'utf8');
const selectionActionBarSource = await readFile('src/selection/BuildingSelectionActionBar.tsx', 'utf8');
assert(hudLayoutCss.includes('--hud-bottom-panel-height:84px'), 'Main Dock 与双层 Utility 必须共用 84px 高度');
assert(!hudLayoutCss.includes('--hud-main-dock-lift'), '统一同高后不得继续抬高 Main Dock');
assert(hudLayoutCss.includes('bottom:var(--hud-edge);'), 'Main Dock 与 Utility 必须共用 16px 底边');
assert(hudLayoutCss.includes('--hud-bottom-safe-line:calc(var(--hud-edge) + var(--hud-bottom-panel-height))'), 'Bottom HUD Safe Line 必须由统一底部面板高度定义');
const utilityCss = await readFile('src/gameplay/context-utility-toolbar.css', 'utf8');
assert(utilityCss.includes('--placement-utility-button-size,36px') && utilityCss.includes('.is-placement-stacked .context-utility-toolbar__button'), '84px World / Placement 双层 Utility 必须共用 36px 命中区');
assert(hudLayoutCss.includes('--hud-bottom-safe-offset:calc(var(--hud-bottom-safe-line) + var(--hud-gap-md))'), 'Workspace / Hints 必须消费统一安全间距');
assert(hudLayoutCss.includes('.gameplay-screen--workspace.has-world-utility-stack .workspace'), 'Workspace 必须有双层 Utility 安全线覆盖');
assert(gameplayScreen.includes("(space === 'gameplay' || space === 'workspace')"), 'Workspace 打开时 World Utility 必须继续保持双层');
assert(gameplayScreen.includes("{!state.paused && (") && !gameplayScreen.includes("state.selection === null && state.tool !== 'terrain-edit'"), 'Operation Hints 必须由 Gameplay 非 Pause 常驻 Host 挂载，Feature 不得自行隐藏');
for (const context of ['building-selection', 'building-scheme', 'tree-brush', 'tree-single', 'color-surface', 'color-lighting', 'color-scheme', 'context-weather', 'management-']) {
  assert(operationHintsSource.includes(context), 'Operation Hints Resolver 缺少上下文: ' + context);
}
assert(selectionActionBarSource.includes('ToolActionBar') && selectionActionBarSource.includes('quickActionPresentation="icon-label"'), 'Building Selection 必须消费共享 Secondary ToolActionBar 家族');
assert(hudLayoutCss.includes('--placement-main-bar-height:var(--hud-bottom-panel-height)'), 'Placement Main Bar 必须复用 84px Bottom HUD 高度');
assert(hudLayoutCss.includes('--placement-utility-height:var(--hud-bottom-panel-height)'), 'Placement Utility 必须复用 84px Bottom HUD 高度');
assert(utilityCss.includes('.is-placement-stacked'), 'Placement Utility 必须拥有显式双层 Variant');
assert(utilityCss.includes('.is-placement-stacked .context-utility-toolbar__row[data-utility-row="2"]{justify-content:flex-end}'), 'Placement 第二行必须固定右对齐');
assert(hudLayoutCss.includes('.context-utility-toolbar.is-placement-stacked') && hudLayoutCss.includes('width:auto;'), 'Placement Utility 必须按内容自适应宽度，不能继续使用固定工具宽度');
const utilitySource = await readFile('src/gameplay/ContextUtilityToolbar.tsx', 'utf8');
assert(utilitySource.includes("layout: 'placement-stacked'"), 'Placement 行语义必须由 Definition 表达');
assert(utilitySource.includes('data-utility-row-role={row.role}'), 'Runtime 必须输出显式 Utility 行语义');
assert(utilitySource.includes('data-utility-item-count={visibleItemCount}'), 'Runtime 必须输出每行可见图标数，供结构审查');
assert(utilitySource.includes("id: 'building-support'") && utilitySource.includes("id: 'building-align-road'") && utilitySource.includes("id: 'building-calibrate-footprint'"), '建筑对齐道路 / 校准基底必须属于第二行 support 定义');
const buildingDock = await readFile('src/tools/building-placement/BuildingPlacementDock.tsx', 'utf8');
assert(!buildingDock.includes('quickActions') && !buildingDock.includes('RotateCcw'), '建筑旋转/镜像必须移出中下 Placement Main Bar');
const roadDock = await readFile('src/tools/road-placement/RoadPlacementDock.tsx', 'utf8');
assert(!roadDock.includes('quickActions') && !roadDock.includes('reverse-direction'), '道路对象动作必须移出中下 Placement Main Bar');
checks += 30;

// 本轮明确排除的内容必须保持原样；后续用户批准相应模块的新任务时可调整阶段保护。
const unchanged = {
  'src/gameplay/inventory-management.css': 'c9d332c653c9fea61c918fb1dbb74af9782b7d83',
  'src/gameplay/management-panel-skin.css': '9904b60f85b1d6a95cc8e639a5fdc9ffaf196970',
  'src/tools/color-tool/modes/surface/material-preset-workspace.css': 'f86a5ffe2fd50d8def4e5012e8a45d7ca2d0c92d',
};
for (const [file, sha] of Object.entries(unchanged)) {
  assert.equal(execFileSync('git', ['hash-object', file], { encoding: 'utf8' }).trim(), sha, file + ': 超出本轮已批准范围');
  checks++;
}
console.log(`Tool usability checks: PASS (${checks} geometry / custom icon / scope checks).`);
