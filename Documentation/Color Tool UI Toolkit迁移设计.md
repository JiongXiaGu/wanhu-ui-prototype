# Color Tool 与 Unity UI Toolkit / USS 迁移设计

> 目的：在 Web Prototype 完成信息架构验证后，为正式 Unity UI Toolkit 迁移冻结 Color Tool 的代码职责、UXML 层级、USS 所有权与 C# 状态边界。
>
> Web 当前仍是 React + CSS；本文描述的是**正式 Unity 目标结构**。不要机械翻译 DOM / CSS。

---

## 1. 核心设计结论

右下 World Utility 只有一个入口：

```text
配色工具
```

进入后只有一个顶层 Tool：

```text
ColorTool
├ Surface
├ Lighting
└ Scheme
```

三个模式不是三个独立 Tool。

```text
ColorToolMode.Surface
ColorToolMode.Lighting
ColorToolMode.Scheme
```

切换模式时：

- Color Tool 不退出；
- Bottom Dock 不销毁；
- Gameplay Tool Space 不切换；
- 只替换左侧 Mode Content；
- Scheme 模式按需打开中央 Catalog Workspace。

这是正式 Unity 架构，不应回退成三个独立 World Tool。

---

## 2. Web Prototype 当前目录

当前 Web 已整理为：

```text
src/tools/color-tool/
├ ColorTool.tsx
├ ColorToolDock.tsx
└ modes/
   ├ surface/
   │  ├ SurfaceModeOverlay.tsx
   │  ├ MaterialPresetWorkspace.tsx
   │  ├ surface-mode.css
   │  └ material-preset-workspace.css
   │
   ├ lighting/
   │  ├ LightingModeOverlay.tsx
   │  └ lighting-mode.css
   │
   └ scheme/
      ├ SchemeModeOverlay.tsx
      ├ BuildingSchemeWorkspace.tsx
      ├ scheme-mode.css
      └ building-scheme-workspace.css

src/ui/
├ LeftContextPanel.tsx
├ Controls.tsx
└ color/
   ├ ColorParameterField.tsx
   └ ColorEditorPage.tsx

src/workspace/
├ workspace-catalog.css
└ workspace-world-first-glass.css
```

旧目录：

```text
src/tools/material-palette/
src/tools/light-adjustment/
src/tools/building-scheme/
```

已经退役，不应重新使用。

---

## 3. 代码职责

### 3.1 ColorTool

Web：`ColorTool.tsx`

Unity：`ColorToolController.cs`

只负责：

- 当前 `ColorToolMode`；
- 模式切换；
- Mode Controller 生命周期；
- Color Tool Dock；
- 整个工具的进入 / 完成 / 取消。

不负责：

- Surface 材质参数；
- Light 数据；
- Building Scheme 数据；
- Workspace Filter；
- Shared Control 视觉。

正式状态：

```text
GameplayUiState
└ ActiveTool = ColorTool

ColorToolState
└ Mode = Surface | Lighting | Scheme
```

---

### 3.2 Surface Mode

Web：`modes/surface/SurfaceModeOverlay.tsx`

Unity：

```text
SurfaceModeController.cs
SurfaceModePanel.uxml
SurfaceMode.uss
```

职责：

- 当前选中 Surface / Material Slot；
- MaterialSurfaceDraft；
- Metallic / Specular Workflow；
- Base / Emission / Night Emission / Specular Color Binding；
- Surface Clipboard；
- 打开 Material Preset Workspace。

不负责：

- Workspace 基础布局；
- Color Editor 通用逻辑；
- Numeric Slider 通用视觉；
- Color Tool Dock。

Material Preset Workspace 是 **Surface Mode 内部资源浏览器**，不是顶层 Gameplay Workspace。

---

### 3.3 Lighting Mode

Web：`modes/lighting/LightingModeOverlay.tsx`

Unity：

```text
LightingModeController.cs
LightingModePanel.uxml
LightingMode.uss
```

职责：

- SelectedLightId；
- HDR Color；
- HDR Intensity；
- Intensity Scale；
- Range Scale。

正式数据：

```text
SceneLightDefinition
├ BaseColor
├ BaseIntensity
└ BaseRange

SceneLightAdjustment
├ Color
├ HdrColorIntensity
├ IntensityScale
└ RangeScale
```

Web 中的固定屏幕 Light Handle 只用于交互验证。

Unity 必须替换为：

```text
Pointer / Raycast
→ Light Selection Proxy / Entity
→ SelectedLightId
```

---

### 3.4 Scheme Mode

Web：`modes/scheme/SchemeModeOverlay.tsx`

Unity：

```text
SchemeModeController.cs
BuildingAppearancePanel.uxml
SchemeMode.uss
```

职责：

- SelectedBuildingId；
- BuildingAppearance；
- Weathering；
- 当前 BuildingColorSchemeId；
- 打开 Building Scheme Workspace。

数据分层：

```text
MaterialPreset
      ↓
BuildingColorScheme
      ↓
BuildingAppearance
```

建筑实例只保存：

```text
BuildingId
ColorSchemeId
Weathering
```

不要把整套 Material 参数复制到每一栋 Building Instance。

---

## 4. Shared UI 与业务 UI 的边界

### Shared UI 不拥有业务数据

以下组件只负责显示 / 输入：

```text
LeftContextPanel
NumericSliderField
ColorParameterField
SharedColorEditor
CatalogWorkspace
WorkspacePrimaryRail
WorkspaceItemCard
ContentPager
Dialog
Tooltip
```

它们不能知道：

- BuildingId；
- LightId；
- MaterialPresetId；
- SchemeId；
- ECS Entity；
- GameContent 数据来源。

Controller / Presenter 负责 Bind。

---

## 5. USS 所有权

正式 Unity 不应按页面复制 USS。

推荐分层：

```text
Runtime/UI/
├ Core/
│  ├ WanhuThemeTokens.uss
│  ├ UISurface.uss
│  ├ UIControls.uss
│  └ UIMotion.uss
│
├ Shared/
│  ├ LeftContextPanel.uss
│  ├ WorkspaceBase.uss
│  ├ WorkspaceCatalog.uss
│  ├ WorkspaceItemCard.uss
│  ├ ColorParameterField.uss
│  ├ SharedColorEditor.uss
│  └ Dialog.uss
│
└ ColorTool/
   ├ ColorTool.uss
   └ Modes/
      ├ SurfaceMode.uss
      ├ MaterialPresetWorkspace.uss
      ├ LightingMode.uss
      ├ SchemeMode.uss
      └ BuildingSchemeWorkspace.uss
```

---

## 6. 当前 Web CSS → Unity USS 映射

| Web 当前 Owner | Unity 目标 Owner | 职责 |
|---|---|---|
| `wanhu-theme-tokens.css` | `WanhuThemeTokens.uss` | 颜色、Radius、透明度、Tone Token |
| `ui-control-system.css` | `UIControls.uss` | Button、Slider、Value Field、Parameter Row |
| `ui/color/color-parameter-field.css` | `ColorParameterField.uss` | 共享颜色参数入口；Mode 不得覆盖 |
| `wanhu-surface-system.css` | `UISurface.uss` + Blur Service | Surface Tint / Border / Depth |
| `ui-motion-system.css` | `UIMotion.uss` + Transition Controller | Opacity / Translate / Presence |
| `workspace.css` | `WorkspaceBase.uss` | 通用 Workspace Shell |
| `workspace/workspace-catalog.css` | `WorkspaceCatalog.uss` | Rail / Filter / 4×2 / Pager 几何 |
| `workspace-world-first-glass.css` | Shared Workspace Skin | Catalog 前景视觉 |
| `surface-mode.css` | `SurfaceMode.uss` | Surface Mode 专属排版 |
| `material-preset-workspace.css` | `MaterialPresetWorkspace.uss` | Material Preset Card / Drag Modifier |
| `lighting-mode.css` | `LightingMode.uss` | Light Selection / Mode Modifier |
| `scheme-mode.css` | `SchemeMode.uss` | Building Selection / Appearance Panel |
| `building-scheme-workspace.css` | `BuildingSchemeWorkspace.uss` | Building Scheme Card Modifier |

### 禁止

Mode USS 不得重新定义：

- Workspace Primary Rail 基础尺寸；
- Workspace Context Filter 基础尺寸；
- Workspace Content Pager；
- NumericSliderField；
- Shared ColorParameterField；
- LeftContextPanel Surface；
- 全局 Radius / Accent / Motion。

Mode USS 只允许写业务 Modifier。

---

## 7. Catalog Workspace

Material Preset Workspace 与 Building Scheme Workspace 必须共享：

```text
CatalogWorkspace
├ Header
├ PrimaryRail
│  ├ RailPager
│  └ CategoryItems
└ Catalog
   ├ ContextFilter
   ├ ContentRows
   │  └ WorkspaceItemCard
   └ ContentPager
```

当前设计：

- 1920×1080 为设计基准；
- 4×2 Card；
- 每页最多 8 项；
- Rail 与 Source Filter 是正交维度；
- Rail Page Indicator 与 Category Selected 使用不同视觉语义；
- Material Preset 的 Category Selected 竖线与 Source Selected 横线使用真实子元素 / VisualElement，不依赖 `::before` / `::after`；
- Catalog Geometry 只有一个 Owner。

### Unity 建议

固定容量目录不必上 ListView。

可使用：

```text
2 个 Row VisualElement
×
4 个 Pooled Card
```

只有以后数据量 / 可见项显著扩大时再考虑 ListView。

---

## 8. Left Context Panel

三个模式都共享同一个左侧 Surface Shell：

```text
LeftContextPanel
├ Header
│  ├ Icon
│  ├ Title
│  ├ Subtitle
│  ├ Back(optional)
│  └ Close
├ Body
└ Footer(optional)
```

差异：

### Surface

- 参数多；
- 有 Footer Clipboard Actions；
- 可进入 Color Editor；
- 可打开 Material Preset Workspace。

### Lighting

- 无 Footer；
- 只显示 Color / Intensity / Range；
- 不打开 Workspace。

### Scheme

- 无 Footer；
- 当前 Scheme + Weathering；
- 可打开 Building Scheme Workspace。

不要为三个模式复制三套 Panel Shell USS。

---

## 9. Color Field / Editor

正式保持两层：

```text
ColorParameterField
→ 负责当前颜色预览和进入编辑

SharedColorEditor
→ 负责真正编辑 Color
```

### ColorParameterField

```text
ParameterRow
├ Label
└ Control
   ├ ColorPreview
   └ Meta
      ├ HDR(optional)
      └ Chevron
```

### SharedColorEditor

```text
SV
Hue
HEX
RGB / HSV
Alpha(optional)
HDR Intensity(optional)
```

Binding Definition 决定：

- HDR；
- Alpha；
- Intensity Label；
- Intensity Range。

Material Emission 与 Light Color 不应复制编辑器。

---

## 10. UXML 建议

### ColorTool.uxml

```text
ColorToolRoot
├ ModeHost
└ ColorToolDock
```

ModeHost 每次只显示一个 Mode Root。

### SurfaceModePanel.uxml

```text
LeftContextPanel
└ SurfaceParameters
```

### LightingModePanel.uxml

```text
LeftContextPanel
└ LightingParameters
   ├ ColorParameterField
   ├ NumericSliderField(IntensityScale)
   └ NumericSliderField(RangeScale)
```

### SchemeModePanel.uxml

```text
LeftContextPanel
└ AppearanceParameters
   ├ SchemeSelector
   └ NumericSliderField(Weathering)
```

---

## 11. C# Controller 建议

```text
ColorToolController
├ ColorToolMode CurrentMode
├ SurfaceModeController
├ LightingModeController
├ SchemeModeController
└ ColorToolView
```

切换：

```text
SetMode(mode)
→ deactivate current mode input
→ bind next controller
→ update classes / view visibility
→ keep ColorToolDock alive
```

不要：

- 为每个模式重新创建整个 UIDocument；
- 从 VisualTree 查询“当前显示哪个 Panel”来推断 Mode；
- 让 USS 控制业务状态。

---

## 12. Selection Controller

Surface / Light / Building 的世界拾取逻辑必须和 UI 分离。

建议：

```text
ColorToolSelectionService
├ SurfaceSelectionAdapter
├ LightSelectionAdapter
└ BuildingSelectionAdapter
```

输入结果：

```text
SelectionChanged<TId>
```

Mode Controller 再根据 Id 查询业务数据。

这样 Web Prototype 的屏幕 Handle 不会污染正式数据架构。

---

## 13. Game Data 与 UI Draft

### Surface

编辑中的参数适合 Draft：

```text
MaterialSurfaceDraft
```

### Lighting

小参数量可直接使用 Adjustment Model；若正式游戏需要 Cancel 回滚，则进入 Tool 时创建 Snapshot / Draft。

### Scheme

Apply Scheme 是否立即写入正式数据，需要根据游戏 Undo / Transaction 体系决定。

推荐：

```text
ColorToolTransaction
├ Begin
├ Preview
├ Commit
└ Cancel
```

底部“完成配色 / 取消配色”最终应映射 Transaction，而不是只关闭 UI。

Web 目前主要验证交互，没有实现完整游戏 Transaction。

---

## 14. Motion

大型 Surface：

- 只动画 Opacity / Translate；
- 不动画 Width / Height；
- 100 / 120 / 160 / 200ms 继续使用现有 Motion Grammar。

Mode 切换：

- Dock 不动；
- 左 Panel 内容可做 100–160ms Fade / Translate；
- Scheme Workspace 单独 Presence；
- Business State 不等待动画完成。

---

## 15. Blur / Glass

Web 的 Blur 不是 USS 迁移目标。

Unity：

```text
URP Shared Blur Service
→ scene blur result
→ UIDocument Surface Tint
```

USS 只负责：

- Tint；
- Border；
- Opacity；
- Overlay；
- 9-slice / Sprite。

Color Tool Mode 不拥有独立 Blur Pass。

---

## 16. 图标

正式规则见：`Documentation/UI图标资产管线.md`。

Color Tool 不拥有独立图标技术路线，直接消费项目共享 `UiIconId`。

目标：

```text
SVG Source Master
        ↓
64×64 white PNG
        ↓
UiIconId
      ↙      ↘
Web          Unity
PNG Mask     Sprite + Tint
```

例如：

```text
UiIconId.ColorToolSurface
UiIconId.ColorToolLighting
UiIconId.ColorToolScheme
UiIconId.Back
UiIconId.Close
```

Color Tool Controller / UXML 不依赖 Lucide 名称、React Component 或 Web SVG DOM。

当前 Web 已完成 PNG Pilot 与 Runtime 迁移：ColorToolDock / LeftContextPanel / Material Workspace 等均由共享 `UiIcon` / PNG Adapter 消费 committed PNG；Unity 可直接复用同一批资产。

---

## 17. 不迁移到 Unity 的 Web 内容

明确丢弃：

- React Component 生命周期；
- CSS DOM specificity 技巧；
- 浏览器 PointerCapture 实现细节；
- Web fixed-position Scene Handles；
- `getBoundingClientRect`；
- CSS filter / backdrop-filter 实现；
- Lucide React Runtime；
- GitHub Review 专用 data-* 属性；
- Playwright Selector。

保留的是：

- 信息架构；
- 状态边界；
- UXML 层级；
- USS 视觉职责；
- Motion Grammar；
- 输入行为；
- 参数范围；
- Workspace 筛选规则。

---

## 18. 推荐 Unity 文件结构

```text
Runtime/UI/
├ Core/
│  ├ WanhuThemeTokens.uss
│  ├ UISurface.uss
│  ├ UIControls.uss
│  └ UIMotion.uss
│
├ Shared/
│  ├ LeftContextPanel/
│  ├ Workspace/
│  ├ Controls/
│  ├ Color/
│  ├ Dialog/
│  └ Tooltip/
│
└ Tools/
   └ ColorTool/
      ├ ColorToolController.cs
      ├ ColorToolState.cs
      ├ ColorTool.uxml
      ├ ColorTool.uss
      ├ ColorToolDock.uxml
      └ Modes/
         ├ Surface/
         ├ Lighting/
         └ Scheme/
```

Data / ECS 不放在 UI 目录：

```text
Runtime/Core
Runtime/Buildings
Runtime/Rendering
Runtime/GameContent
```

UI Controller 只引用稳定接口 / DTO / Request，不持有渲染实现。

---

## 19. 迁移顺序

### Phase 1 — Shared Foundation

先迁：

1. Theme Tokens；
2. UISurface；
3. UIControls；
4. Motion；
5. LeftContextPanel；
6. NumericSliderField；
7. ColorParameterField；
8. SharedColorEditor。

### Phase 2 — Catalog

迁：

1. WorkspaceBase；
2. WorkspaceCatalog；
3. PrimaryRail；
4. WorkspaceItemCard；
5. Pager。

先用静态 Demo Data 验证 1920×1080。

### Phase 3 — Color Tool Shell

迁：

1. ColorToolController；
2. ColorToolDock；
3. 三 Mode Presence。

### Phase 4 — Modes

顺序建议：

1. Lighting（最小）；
2. Scheme；
3. Surface（参数最多）。

### Phase 5 — Real Data

最后接：

- Surface Picking；
- Light Picking；
- Building Picking；
- Material Preset Library；
- Building Scheme Library；
- Undo / Transaction。

不要一开始同时迁 UI + ECS + Picking + Rendering。

---

## 20. Web Migration Guard

当前 Web 的 `npm run audit:unity` 已增加：

- 旧 `material-palette / light-adjustment / building-scheme` Tool 目录禁止重新出现；
- 旧 MaterialPalette State Identifier 禁止重新出现；
- Color Tool Mode CSS 不允许重新拥有 Catalog 基础几何；
- Runtime `:has()` 禁止；
- 新 Backdrop Owner 禁止；
- 隐式 Transition 禁止。

它不是 Unity 编译器，但用于阻止 Web Prototype 在迁移前重新积累明显结构债务。

---

## 21. Unity Migration Readiness Review（2026-09-20）

### 已准备完成

- 顶层只保留一个 `ColorTool`，Runtime Tool Id 为 `color-tool`；内部 Mode 固定为 `surface / lighting / scheme`；
- `ColorToolDock` 在三个 Mode 间保持挂载，不再恢复独立 `light-adjustment / building-scheme` Tool；
- Surface 方案浏览正式使用 `MaterialPresetWorkspace`；旧 `MaterialSchemeWorkspace` Web 重命名残留已退出 Runtime；
- `LeftContextPanel / NumericSliderField / ColorParameterField / SharedColorEditor / Catalog Workspace / PrimaryRail / WorkspaceItemCard / Pager` 的共享层不持有 BuildingId、LightId、MaterialPresetId、SchemeId、ECS Entity 或 GameContent 业务来源；
- Catalog 基础几何归 `WorkspaceCatalog`，Surface/Control/Color Field 分别有独立共享 Owner，Mode CSS 只保留业务 Modifier；
- Migration Audit 会阻止旧 Color Tool 目录、旧 State Identifier、Catalog 几何回流、Mode CSS 重写共享 Numeric/Color/LeftContext Surface，以及 ColorParameterField 样式未进入 Runtime cascade。

### 仍需迁移时处理

- CSS Grid：迁为 UXML + Flex Row/Column；固定容量 Catalog 继续使用显式 Row Pool；
- pseudo-element：纯装饰可用真实子 Element / Sprite；有状态语义的 Marker 必须是真实 VisualElement；
- `backdrop-filter`：替换为共享 URP Blur Service + USS Tint；
- CSS `filter`：替换为 Image Tint / Overlay / Material；
- Web Pointer / Drag / Wheel 行为：用 UI Toolkit PointerEvent / NavigationEvent 与 New Input System 重新绑定；
- PNG Icon：直接复制 `public/assets/ui/icons/*.png`，建立 Unity IconId → Sprite / Sprite Atlas 映射；SVG 仅保留 Source Master。

### Web-only 可丢弃

- React lifecycle / Hook 组织方式；
- HTML DragEvent 与 PointerCapture 细节；
- `window / document / getBoundingClientRect`；
- 固定百分比 Scene Handle 与浏览器定位代码；
- Lucide React Runtime；
- Playwright selector、Review `data-*` 与 GitHub Artifact 生成逻辑。

### 尚未解决的风险

- 正式 Unity 的 `ColorToolTransaction` 仍需接入项目 Undo/Redo，明确 Begin / Preview / Commit / Cancel；
- Surface / Light / Building Selection 仍需由 Unity World Picking / ECS Adapter 实现，不能照搬 Web Scene Handle；
- Blur、VectorImage 与大量图标的最终性能需要在 Unity Vertical Slice 实测；
- 全仓仍存在可追踪的 Grid / pseudo-element / filter / Browser API 债务；它们已有替代路径，不作为 Color Tool 开始迁移的阻塞项。

**Readiness：结构已达到可以开始正式 Unity UI Toolkit 迁移的标准。** 下一阶段应按 Shared Foundation → Catalog → Color Tool Shell → 三 Mode → Real Data 顺序实现，而不是继续扩展 Web 功能。

---
## 22. 最终设计原则

迁移时判断一段样式 / 代码应该放在哪里，只问三个问题：

1. **这是全项目视觉规则吗？**
   - 放 Core / Shared USS。

2. **这是可复用 UI 结构吗？**
   - 放 Shared UXML + Controller。

3. **这是 Surface / Lighting / Scheme 的业务差异吗？**
   - 放 Mode Controller / Mode USS。

如果一个 Mode USS 开始定义 Slider、Workspace Rail、Panel Surface，本质上就是职责泄漏，应立即退回共享层。
