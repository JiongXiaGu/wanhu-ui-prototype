# Unity UI Toolkit 迁移准备清单

本清单用于 Web Prototype 后续继续迭代期间控制迁移成本。目标不是把 React 提前改写成 Unity，而是确保每个新增设计都能解释成稳定的 UXML / USS / C# / Asset / URP 方案。

## 1. 迁移结论

当前整体可行性：**高**。

当前最值得保留的是：

- `GameplayUiState` 与明确 Space / Tool / Management / Pause 状态；
- 配置驱动 Workspace / Management / Context Utility；
- Shared Control / Surface / Dialog；
- Motion Presence Grammar；
- 1920×1080 设计基准；
- Mouse / Keyboard / Focus / Esc 的显式交互规则。

不直接迁移的是 React DOM 和 Web CSS 特效实现。

## 2. 每个新 UI 必须回答

1. UXML 层级是什么？
2. 哪些视觉属于共享 USS？
3. C# 谁拥有状态？
4. 数据量是否需要 ListView / Pool？
5. 图片属于 Sprite / Texture / RenderTexture / VectorImage 哪一种？
6. 是否依赖 Scene Blur / URP？
7. Motion 使用哪个 Preset？
8. Mouse / Keyboard / Gamepad Focus 怎么走？
9. 是否存在 Web-only 实现？它的 Unity 等价物是什么？

回答不清楚时，不继续扩写复杂 Web-only 代码。

## 3. Runtime CSS Guard

兼容性判断以《Unity 6.6视觉能力与回退规范》的 **6000.6.2f1 实测基线**为准。

### 立即硬禁止

- `:has()`；
- 新组件自己新增 `backdrop-filter` Owner；
- `transition:.16s ease` 这类未声明属性且脱离 Motion Token 的 shorthand；
- 对 `backdrop-filter` / Blur Radius 做必要交互动画；
- 大型 Surface Width / Height 动画；
- 依赖 DOM 当前形状推断业务状态。

### 新设计不得依赖

以下能力在 Web 可以暂时存在历史实现，但**新设计不能把它们作为视觉成立的必要条件**：

- `linear-gradient()` / `radial-gradient()`；
- CSS `box-shadow`，特别是 inset / spread / 多层复合阴影；
- `brightness()` / `saturate()`；
- `rgb(var(...))` / `rgba(var(...))`；
- 对 CSS Variable 做数学组合后才得到最终颜色或几何；
- 只有 Blur 开启时才可读的半透明 Surface。

### 可继续使用，但必须有 Unity 映射

- CSS Grid：只用于原型排版，布局必须可拆成 Flex/UXML Row + Column；
- `::before / ::after`：纯装饰可保留；有结构语义时迁成真实节点；
- Web-only Gradient：迁移为明确 Tint / Overlay / 小型纹理 / Sprite / Painter2D；
- Web-only Shadow：迁移为 Edge / 层级 / 9-slice / Shadow Element / 经实测的 drop-shadow；
- Web-only Filter：迁移为 Tint / Overlay / Material / 共享自定义 Filter；
- Browser API：只能属于 Web Adapter。

### 当前审计阶段

配色 / Surface / Control 仍在并行治理，因此兼容工作分两阶段：

**阶段 A：现在**
- `audit:unity` 统计 Gradient、box-shadow、brightness、saturate、变量组合与 Backdrop Transition；
- 这些新增指标先输出 Warning / Telemetry；
- 不因为历史存量阻塞正在进行的视觉整理；
- AI 不得因为“CI 目前只是 Warning”而继续扩散这些能力。

**阶段 B：视觉治理收敛后**
- 全仓盘点存量；
- 明确必须删除 / 可以降级 / 纯 Web Enhancement / 已有 Unity 等价物；
- 冻结 Baseline；
- 将可量化项目升级为 Ratchet Guard：历史值只减不增，新文件不得引入。

Unity 6.7 升级后另做 Capability Revalidation；在实测完成前不提前解除 6.6 Guard。

## 4. 已完成的迁移准备

- Dialog 不依赖 UI-over-UI Blur；
- Pause Panel 不依赖自身 Blur；
- Motion 已统一到 Opacity + Translate；
- Bottom Utility 使用固定 Host + Definition Rebind；
- Management Topic 只改变 Accent，不复制整页 Theme；
- Text / Number Dialog 已消费共享 TextInput；
- Design Workspace 内容池改成显式 Flex Rows；
- Design Workspace 单页 Marker 已改成真实 Element；
- Runtime CSS `:has()` 已退出；
- CI 增加 Migration Audit。

## 5. Icon Pipeline

正式规范：`Documentation/UI图标资产管线.md`。

当前已经完成 Web Runtime PNG 化：

```text
固定 SVG Source Master
        ↓
104 × 64×64 white RGBA PNG
        ↓
UiIconId + Manifest
      ↙             ↘
Web Runtime          Unity Runtime
PNG Alpha Mask       Sprite + Tint
```

稳定规则：

- 104 个 Source SVG 与 104 个 Runtime PNG 已提交仓库；
- Source Generator 固定为 `lucide-react@1.47.0` + `sharp@0.35.4`；
- Standard UiIcon Stroke = 1.7，已通过 PNG Pilot 的 GitHub UI Review 与人工截图审查；
- Web Runtime 使用 `UiIcon / runtime-icons.generated.tsx`，实际渲染 committed PNG，不再生成 Lucide inline SVG；
- `src/` 直接 import `lucide-react` 已被 CI 禁止；
- 历史 `LucideIcon` 类型名已被 CI 禁止；
- Canonical Asset Contract 是 `UiIconId`；命名 Component 只属于 Web 兼容 Adapter；
- Unity 直接复制 `public/assets/ui/icons/*.png`，不再重新 Rasterize；
- 状态颜色使用 Web `currentColor` / Unity Tint；
- Pager / Selected Line / Divider / Toggle / Slider 等结构元素不进入 UiIcon Pipeline。

Build 在正式编译前执行 `npm run icons:check`，校验 Manifest、104 对 SVG/PNG、64×64、Alpha、Generated Adapter 与 License。

## 6. 第一批 Unity Vertical Slice

建议先迁：

1. Gameplay Top Shell；
2. Main Dock；
3. Design Workspace；
4. Context Utility；
5. Building Placement Context + Action Bar；
6. Shared Dialog；
7. Motion Controller；
8. Runtime Tooltip。

这一条链能同时验证：

- UXML / USS 架构；
- Input System；
- Focus；
- Motion；
- Tool State；
- Icon Asset；
- Shared Blur；
- 1080p / 1440p / 4K 缩放。

Vertical Slice 通过后再迁 Settings / Archive / Management。

## 7. 数据量策略

- 固定 4×2 Workspace Asset：固定 Slot / Pool，不需要 ListView；
- Save / Resident 等长列表：ListView / MultiColumnListView；
- Management 少量固定 Section：普通 VisualElement；
- 实时 Preview：按可见数量管理 RenderTexture。

## 8. Unity 6 官方能力基线

以 Unity 6 Runtime UI Toolkit 为基线：

- UI Toolkit 使用 retained-mode Visual Tree；
- UXML 负责结构，USS 负责样式，C# 负责行为；
- USS 支持 `opacity / translate / scale / transition`；
- Input System Package 可通过 UI Toolkit Runtime Event System 接入；
- `ListView` 支持 make/bind/unbind 与虚拟化；
- `VectorImage` 是 UI Toolkit 的矢量图资产类型；SVG Authoring / Import 通过 Vector Graphics SVG Importer。

迁移实现前仍应按项目实际 Unity 版本复核 API。

## 9. CI Gate

默认：

```text
npm run icons:check
        ↓
npm run audit:unity
        ↓
npm run build
```

Audit Failure 必须先修复。

Audit Warning 属于已知可迁移债务，不要求阻塞 Web UI 设计，但不得无理由持续增长。


## 10. Terrain Edit Vertical Slice

Terrain Edit 是迁移前非常有价值的第二类 Tool 验证，因为它不是 Asset Placement。

Web → Unity 映射：

```text
GameplayUiState.tool = terrain-edit
  → TerrainToolController

TerrainEditTool Left Context
  → TerrainContext.uxml

ToolActionBar
  → Shared ToolActionBar.uxml / USS

Terrain Context Utility Definition
  → UtilityToolbarHost.Rebind(Terrain)

Terrain Brush Preview DOM
  → 不迁 UI Toolkit
  → TerrainBrushRenderer / Decal / Procedural Mesh / DebugDraw
```

约束：

- UI Toolkit 不负责真实 Terrain 修改；
- Brush Ring / Falloff / Invalid Area 是 World Visualization；
- Terrain UI 参数只绑定 Controller 数据；
- Undo / Redo 进入正式 Terrain Command History；
- ToolOrigin 由 UI State / Tool Controller 持有，不通过 VisualTree 推断；
- `BuildingTerrainMode` 与 `TerrainEditMode` 必须保持不同类型，避免建筑基底处理和世界地形编辑混淆。


## 11. Legacy CSS Ownership Leakage

迁移前不仅检查 Web-only API，也必须检查旧 Selector 是否仍命中新组件。

已修复案例：

- 旧 `tool-overlay.css` 把 `.parameter-row` 强制成五列；
- 新 `RuntimeParameterRow` 实际只有 `Label + NumericSliderField` 两个直接 Child；
- 浏览器仍为不存在的第 3–5 列保留空间，造成 Terrain / Placement 参数右侧大块空白。

正式规则：

- 已退出组件结构的 CSS 文件直接退出 Runtime import；
- Legacy Class 从 DOM 删除，不作为兼容钩子长期保留；
- Shared Control 的结构 Owner 必须显式声明关键 Layout，不依赖“旧规则刚好没命中”；
- UI Review 对 Building / Road / Terrain 同时测量 NumericSliderField 是否填满 ParameterRow。


## 12. Tree Placement Vertical Slice

树木放置继续复用现有 Tool Space，不建立新的 Web-only 空间模型。

```text
GameplayUiState.tool = tree-placement
  → TreePlacementController
Tree Left Context → TreePlacementContext.uxml
ToolActionBar → Brush / Single Definition
Tree Context Utility → UtilityToolbarHost.Rebind(Tree)
Brush / Selected Tree Preview DOM → TreePlacementWorldRenderer / Selection Gizmo
```

- 一个 Tree Species 最多 4 个 Variant，并以单行 4 Slot 映射 UXML；
- Variant 只表示树形差异，不承载 Season / Growth / LOD；
- Brush 参数只保留 Radius / Density / Scale Randomness；
- Single 只暴露统一 Scale，不做 XYZ 非等比缩放；
- 单棵放置与已有单棵编辑共用同一个 Single Mode；
- Undo / Redo 进入正式 World Command History；
- 树木避让建筑 / 道路属于 World Placement Query，不由 UI Toolkit 实现。


## 13. City Wall Workspace

城墙 Workspace 继续复用共享 Design Workspace，不迁移旧独立 `CityWallSelectionWorkspace` Shell。

正式数据关系：

```text
CityWallSystem
  └ CityWallModule
       ├ SystemId
       ├ Category
       ├ ModuleId
       └ ToolType
```

UI Toolkit 映射：

- Primary Rail → `CityWallSystem`；
- Context Filter → `CityWallModuleCategory`；
- 4×2 Content Pool → 当前过滤后的 `CityWallModule`；
- Asset Inspector → 体系 / 构件类型 / 营造方式；
- 水门属于 Gate Opening Module，不新增一级 Filter；
- 墙高、门洞尺寸、楼梯宽高与坡度属于后续 Tool Controller，不进入 Workspace Card 枚举。

后续四类 Tool 可以分别映射 Path / Embedded Module / Wall Attachment / Walkway Transition，但不得反向污染 Workspace 信息层级。


## 14. City Wall Construction Tool

城墙体系不使用一个万能 Tool Controller。四种构件拥有独立业务 Tool，但共享 UI Primitive 与 Surface。

当前 `city-wall-construction` 的正式输入模式：

```text
Range
  → Drag Rect
  → 4 Points + Closed Path
  → Outside = Front / Inside = Back

Fixed Width
  → Fixed Wall Thickness
  → Orthogonal Point Extension
  → L / U / Closed Outline
  → FacingSide = Left / Right for open paths
```

正式数据目标：

```text
CityWallPath
├ Points[]
├ Closed
├ WallThickness
├ WallHeight
├ Facing
└ TerrainAlignment
```

UI Toolkit 映射：

```text
CityWallConstructionOverlay
  → PlacementContextPanel / LeftContextPanel

CityWallConstructionDock
  → Range / Fixed Width Action Definition

City Wall Utility
  → ContextUtilityToolbar Definition

Range / Fixed Width Preview DOM
  → 不迁 UI Toolkit
  → CityWallWorldRenderer
```

约束：

- UI Toolkit 不负责真实城墙路径生成；
- 不使用道路式 Smart Polyline / Straight / Curve 作为城墙主模式；
- Range 的 Front 自动朝 Polygon 外部，不显示 Facing Flip；
- Fixed Width 开放 Path 使用相对路径方向的 Left / Right Facing；
- 正反面是 Front / Back 语义，不是 North / East / South / West；
- Wall Height / Thickness / Terrain Relation / Base Treatment 属于 Construction Controller；
- Wall Top Line / Node Display 只属于 Visualization State，不进入 World Command History；
- Workspace 的 `toolType` 决定进入哪套独立 ToolOverlay；
- 四套 Tool 可以有不同 Mode / Workflow Step / 附加窗口，但不得复制 Shared Surface / Control CSS。



## 15. City Wall Gate Tool

`city-wall-gate` 是独立于城墙主体的第二套业务 Tool。

正式 Controller：

```text
CityWallGateController
├ PlacementMode = Free / WallConnected
├ OpeningWidth
├ OpeningHeight
├ BuildingDepth
├ Transform
├ FrontBackFacing
└ WallConnections[]
```

UI Toolkit：

```text
CityWallGateOverlay
  → PlacementContextPanel / LeftContextPanel

CityWallGateDock
  → Free / Wall Connected Action Definition

Gate Utility
  → UtilityToolbarHost.Rebind(Free | Connected)

Gate Preview DOM
  → 不迁 UI Toolkit
  → CityWallGateWorldRenderer
```

约束：

- Gate 可以脱离 Wall 独立存在；
- Wall Connected 不允许 UI 自由 Rotate，Transform Direction 由 World Query / Wall Anchor 决定；
- Facing Flip 是语义状态，不等于 Rotate 180°；
- Gate Building Depth 不受 Wall Thickness 强制约束；
- Gate Left Context 只绑定可编辑尺寸参数；模式、Facing、连接状态和墙体元数据由 Tool State / World Visualization 表达，不复制为常驻只读 UI；
- Wall Snap 是 Connected Mode 的工具规则，不做 Toggle；
- Opening Clearance / Wall Connection Anchor 属于 World Visualization；
- 不依赖 Mesh Boolean 作为核心数据关系。


## 16. City Wall Access Stair Tool

`city-wall-access-stair` 第一版是独立 Free Placement Tool。

Controller：

```text
CityWallAccessStairController
├ Width
├ Height
├ Length
├ Position
├ Rotation
└ Reversed
```

UI Toolkit：

```text
CityWallAccessStairOverlay
  → PlacementContextPanel / LeftContextPanel

CityWallAccessStairDock
  → Quick Actions only, no Mode Group

Access Stair Utility
  → Grid / Clearance / History

Stair Preview DOM
  → 不迁 UI Toolkit
  → CityWallAccessStairWorldRenderer
```

约束：

- 第一版不做 Wall Snap / Terrain Query；
- 不做 Auto Height / Auto Length / Target Slope；
- Left Context 只绑定 Width / Height / Length；
- Slope / Step Count 可以作为 World System 派生数据，但不常驻 UI；
- High / Low Reverse 是明确玩家操作；
- Stair Clearance 属于 World Visualization。


## 17. City Wall Transition Stair Tool

`city-wall-transition-stair` 第一版是独立 Free Placement Tool。

Controller：

```text
CityWallTransitionStairController
├ Width
├ HeightDelta
├ Length
├ Position
├ Rotation
└ Reversed
```

UI Toolkit：

```text
CityWallTransitionStairOverlay
  → PlacementContextPanel / LeftContextPanel

CityWallTransitionStairDock
  → Quick Actions only, no Mode Group

Transition Stair Utility
  → Grid / Clearance / History

Transition Stair Preview DOM
  → 不迁 UI Toolkit
  → CityWallTransitionStairWorldRenderer
```

约束：

- 第一版不做 Walkway Anchor / Wall Query；
- 不做 Auto Height Delta / Auto Length / Target Slope；
- Left Context 只绑定 Width / HeightDelta / Length；
- Low / High Platform 仅是 World Preview 语义，不代表已经建立自动连接；
- Slope / Step Count 可以作为 World System 派生数据，但不常驻 UI；
- High / Low Reverse 是明确玩家操作。


## 18. Color Tool / Surface Mode

`color-tool` 从 Gameplay World Utility 的“配色工具”进入唯一 Color Tool Space。

Controller 数据：

```text
ColorToolController
├ Mode = Surface
├ CurrentScheme
├ MaterialSlotValue Draft
├ SurfaceClipboard
├ ColorClipboard
└ MaterialPresetLibrary
```

Surface UI：

```text
Scheme Navigation Row
└ Label + Type · SchemeName + Chevron

Shared Color Strip
├ BaseColor
├ SpecularColor
├ EmissionColor HDR
└ NightEmissionColor HDR

Material Properties
├ Metallic (Metallic workflow only)
├ Smoothness
├ Occlusion
├ TextureTiling
└ TextureBlendSharpness

Workflow Inline Choice
└ ● Metallic / ○ Specular
```

不再暴露：

- SpecularHighlightsOff；
- AlphaClip；
- AlphaClipThreshold；
- TextureSetDefinition / MappingSpace / Offset / Rotation。

Material UI：

```text
Left Host
├ SurfacePage
└ ColorEditorPage

Center Work Surface
└ MaterialPresetWorkspace

Bottom
└ ColorToolDock
```

约束：

- Surface / ColorEditor 共用 Left Context Shell；方案浏览使用 Color Tool 内部的中央 Work Surface，不建立第二个业务状态；
- Scheme Selector 绑定 CurrentScheme；
- 手动 Edit / Paste 统一把 CurrentScheme 标记为 Custom / Unsaved；
- Apply Preset 恢复对应 SchemeId / Type / Name；
- Preset Library 的用户自定义项正式 Unity 应持久化到玩家数据；
- Scheme Navigation 是左侧参数页的轻量入口；点击后打开中央 MaterialPresetWorkspace；
- MaterialPresetWorkspace 使用显式 2×3 Flex Rows + Pager，位于 Bottom ToolActionBar 上方；
- Color Strip 使用一个父 VisualElement + 四个等宽 Item；父节点拥有共享边界，Item 不拥有独立完整边框；
- Metallic 下不挂载 SpecularColor；Specular 下挂载在 Color Strip 最后一位；
- Specular Workflow 下 Metallic Field 直接隐藏但 Controller 值不销毁；
- PBR / Texture 统一挂载在一个 MaterialProperties Section 内，只使用 Spacing Group；
- Workflow 不使用 Segmented Track，使用两个无容器 Choice + 显式状态点；
- Color Editor Numeric Area 使用 RGB / HSV Rebind，同一时刻只挂一组通道；
- HDR Color Editor 绑定 EmissionColor / NightEmissionColor；
- HDR Intensity 是编辑 Adapter，最终重新合成为 HDR Color，不增加 Runtime 持久字段；
- Surface / Color Clipboard 由 Controller 持有，不依赖系统剪贴板；
- Surface / Color / Preset 页面切换只使用 Opacity + Translate；
- 连续颜色拖动正式 Unity 用 BeginEdit / Preview / Commit 合并成一次 Undo Transaction。

