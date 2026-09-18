# UI Toolkit 落地规范

## 1. 最终目标

《万户天工》正式游戏 UI 的最终实现平台是 **Unity UI Toolkit**。

本仓库中的 React / TypeScript / CSS 页面不是最终产品代码，而是用于：

- 验证 UI 美术语言；
- 验证构图、尺寸和空间关系；
- 验证信息架构与交互流程；
- 快速比较不同视觉方案；
- 通过固定 1920×1080 设计基准做持续美术审查；
- 为正式 UXML / USS / C# 提供稳定参考。

因此任何重要设计都必须能回答：

> 这个界面在 Unity UI Toolkit 中如何落地？

Web 实现方式本身不构成最终技术约束。

## 2. 权威来源

优先级：

1. Unity 正式项目中的运行时代码、UXML、USS 与实际游戏规则；
2. 本仓库 Documentation 中已经确认的长期 UI 设计、交互与跨模块契约；
3. Web Prototype 当前实现；
4. 临时截图、实验样式与开发过程记录。

Web Prototype 可以快速试错，但不能反过来迫使 Unity 使用不合理的实现方式。

## 3. Web Prototype 的职责边界

Web Prototype 负责表达：

- 页面构图；
- 元素相对位置；
- 信息优先级；
- 视觉层级；
- Selected / Hover / Disabled / Focus；
- Gameplay / Workspace / Tool / Management / Context Surface / Pause 等空间切换；
- 滚轮、分页、搜索、快捷键；
- 动效方向、节奏和大致时长；
- 图片、预览、材质、Blur 等目标视觉。

Web Prototype **不要求**以下内容与 Unity 1:1 对应：

- CSS Grid；
- `linear-gradient` / `radial-gradient`；
- `box-shadow`；
- `filter`；
- `backdrop-filter`；
- `::before / ::after`；
- CSS `@keyframes`；
- Web DOM 层级本身。

这些只用于快速表达视觉，正式 Unity 应换成合适的 UI Toolkit / URP 实现。

## 4. 何时必须修改 Web 方案

需要修改：

- 布局结构在 UI Toolkit 中明显不合理；
- 交互流程不适合鼠标 / 键盘 / 手柄；
- 大量内容依赖不受控无限滚动；
- 状态关系会造成 Unity 数据所有权混乱；
- 视觉效果必须依赖不可接受的运行时成本；
- Web 方案掩盖正式实现必须解决的信息架构问题。

不需要为了迁移修改：

- CSS 渐变需换成 Sprite / VisualElement；
- Web Shadow 需换成 9-slice；
- Hover 提亮需换成 Tint / Overlay；
- Web 动效需换成 USS Transition / C#；
- Web Blur 需换成 URP；
- CSS Grid 需用嵌套 Flex 重建。

原则：**设计合理但技术实现不同，不属于需要重设计。**

## 5. UI Toolkit 基础实现约束

### 5.1 布局

优先：

- UXML 表达稳定层级；
- USS 表达视觉和基本布局；
- Flex Row / Column 组合；
- 固定槽位 / Pool 处理有限重复内容；
- ListView 只用于确实需要大量列表和虚拟化的场景。

不要为了复刻网页 DOM 创建没有语义价值的 VisualElement 层级。

### 5.2 设计基准

Web Prototype 的 `1920 × 1080` 是正式 UI 设计基准。

Unity 应使用统一 PanelSettings 缩放策略支持 1080p / 1440p / 4K / 其它常见宽高比，而不是复制多套 USS 或手工翻倍数值。

### 5.3 状态驱动

正式 Unity 继续使用明确状态驱动：

- Gameplay；
- Workspace；
- Tool；
- Management；
- Context Surface；
- Information Views；
- Pause；
- Archive；
- Settings。

视觉状态由明确数据和 Class 驱动，不通过查询 VisualTree 当前长什么样来推断业务状态。

结构变更、界面开关、工具模式变化都必须有明确数据所有者。

## 6. 共享 USS 视觉系统

正式规则见：`Documentation/UI Surface与Control视觉规范.md`。

不要按页面复制一套 Button / Segmented / Surface 样式。建议至少建立：

```text
UISurface.uss
UIControls.uss
BottomCommand.uss
FullscreenActions.uss
```

概念 Class：

```text
.ui-surface
.ui-surface--glass
.ui-surface--primary
.ui-surface--secondary

.ui-button
.ui-button--primary
.ui-button--secondary
.ui-button--utility

.ui-segmented
.ui-segmented__option
.ui-segmented__option--active
```

C# 通过语义 Class 控制状态，例如 `is-active / is-disabled / is-primary`，不要在业务代码中散落颜色、Radius 和 Tint 数值。

### 6.1 Surface / Tone

Web 渐变和轻 Tone 是美术参考。

Unity 优先使用：

- 半透明背景色；
- Overlay VisualElement；
- 共享渐变纹理；
- 9-slice Sprite；
- Tint / Opacity；
- 必要时 Painter2D / 自定义 Mesh。

Surface 必须有自己的色调。不要依赖世界画面的亮度决定 UI 明暗，尤其是夜景。

### 6.2 Radius 层级

当前参考：

- 8px：小型 Option / Auxiliary Action；
- 10px：普通 Button / Segmented / Tooltip；
- 14px：中型 HUD / Bottom Command；
- 18px：Workspace / Context / Tool Parameter Panel。

正式 USS 可以按 PanelSettings 比例换算，但语义层级保持一致。

### 6.3 Segmented Control

用于 2–5 项局部互斥 Mode，例如 Camera、Weather、Building Placement、New Game。

推荐结构：

```text
SegmentedControl
├ OptionButton
├ OptionButton
└ OptionButton
```

外壳必须有可辨认的弱 Surface / Border，Option 必须拥有 Hover / Active 状态；不能只靠文字颜色让玩家猜它是否可点击。

### 6.4 Soft Glow

暖金或青墨弱环境光应做共享视觉能力，例如 `SoftGlow`：透明 Sprite / VisualElement Tint / 少量自定义绘制。

不要给每个 Panel 复制 Shader。

### 6.5 Shadow

Web `box-shadow` 只表示深度意图。

Unity：

- 大型重要 Surface 可用共享 9-slice Shadow Sprite；
- 小控件通常不需要真实 Shadow；
- 优先靠 Tone / Border / Layer 建立深度。

### 6.6 Hover 图片提亮

Web `brightness / saturate` 不是 Unity 技术要求。Unity 可用 Image Tint、Overlay、状态 Class 或预览材质参数。

### 6.7 Web 伪元素

`::before / ::after` 在 Unity 中应转换为有职责的子 VisualElement：

```text
CategoryItem
├ ActiveLine
├ Icon
└ Label
```

伪元素只是 Web 原型快捷表达。

## 7. Blur 统一策略

正式游戏使用 **共享 URP Blur Service / Fullscreen Pass** 作为场景模糊能力。

Web 可以继续用 `backdrop-filter` 表达视觉，但 Unity 必须遵守：

- Blur 是共享场景级渲染能力，不是每个 VisualElement 自己执行；
- Surface 只声明是否需要弱化世界背景，以及自己的 Tint / Opacity / Border；
- Pause / Settings / Archive / Management 等重空间可以使用更明显的 Scene Blur / Dim；
- Gameplay Workspace / Context / Tool Panel 可以表现轻度 Glass Blur，但仍共享同一 Blur 服务或低成本分档结果；
- Gameplay 小面板的可读性必须来自 Surface Tint，而不是 Blur；
- 模糊半径、降采样、质量档位集中管理；
- 不允许每个 Panel 建独立 RenderTexture Blur 链。

推荐架构：

```text
World Camera
↓
URP Shared Blur Service / Fullscreen Pass
↓
共享弱化世界结果
↓
UI Toolkit Panel
  └ Surface VisualElement（Tint / Opacity / Border）
```

### 夜景规则

夜晚世界变暗时，不通过继续降低 Panel Alpha 来获得“玻璃感”。Panel 自己保持稳定玉青 / 深灰 Tint，Blur 只提供低频环境色。这样白天和夜晚的文字对比与控件识别保持一致。

具体视觉基线见 `Documentation/UI Surface与Control视觉规范.md`。

## 8. 图片与 RenderTexture

以下优先使用真实游戏资产：

- 建筑 / 道路 / 桥梁缩略图；
- 世界预设；
- Game Group 城市截图；
- Archive Preview；
- 需要实时展示的建筑预览。

允许：Texture2D / Sprite / RenderTexture / VectorImage。

实时 RenderTexture 必须按可见数量控制更新，不为不可见 Card 持续渲染。

Design Workspace 当前每页 8 个可见 Asset，很适合有限预览池。

## 9. Bottom Command Visual System

正式规则：`Documentation/Bottom Command Visual System设计规范.md`。

Unity 不应为 Main Dock / Placement Action Bar / Context Utility 各复制一套 USS。

建议：

```text
BottomCommandSurface
├ SizeTier: L / M / S
└ CommandGroup
   ├ CommandButton
   ├ ActiveLine
   └ Divider
```

L / M / S 只决定尺寸和 Shadow Tier；Surface、Hover、Active、Divider、Tooltip 共用视觉契约。

### Context Utility Host

右下 S 档使用固定 `UtilityToolbarHost`，内容由当前 Tool Context 决定：

```text
Tool = none
→ World Utility Definition

Tool = building-placement
→ Building Utility Definition

Tool = road-placement
→ Road Utility Definition
```

正式 Unity 建议：

- 一个 Toolbar VisualElement 实例；
- C# Tool Controller / UI State 决定当前 Definition；
- 切换时先添加 `is-exiting`；
- 约 100ms 后 Rebind 子按钮并直接更新 Width；
- 添加 `is-entering`，下一帧移除该 Class；
- USS 只动画 `opacity / translate`，约 140ms；
- Exit / Enter 阶段设置 `picking-mode: Ignore` 或禁用输入；
- 不动画 Width / Height；
- 不同时常驻 World / Building / Road 三份 Toolbar。

## 10. 动效规范

正式规则见 `Documentation/UI Motion System设计规范.md`。

Unity 优先使用 Opacity / Translate / USS Transition；Scale 只保留给极小型 Elevated 反馈，不用于大型 Surface。

统一时长：

- Fast：100ms；
- Control：120ms；
- Surface：160ms；
- Space：200ms；
- Tooltip Delay：约 320ms。

正式 Unity 建议一个薄层 `UITransitionController` 管理 Presence Class、PickingMode、延迟隐藏和 Rebind 时机。

避免动画 Width / Height / Layout Position、Blur Radius、Bounce、Overshoot 和大幅横向飞入。

## 11. Tooltip

Unity Runtime 必须建立正式共享 Tooltip Controller，例如 `RuntimeTooltipController`。

职责：

- PointerEnter / PointerLeave；
- Delay；
- Tooltip Layer；
- 屏幕边缘修正；
- 鼠标 / 键盘 / 手柄差异；
- 名称、解释与快捷键。

Tooltip 不得成为完成基础操作所必须的信息来源。

## 12. 输入与滚轮

最终 Unity 使用 New Input System，由 UI Toolkit Runtime 接收对应事件。

Workspace 已确认：

- Primary Rail 滚轮翻分类组；
- Content Grid 滚轮翻内容组；
- 一次有效手势只翻一组；
- 分页视觉保留；
- 滚轮只是快捷输入；
- Primary Rail 与 Context Filter 是独立维度。

正式实现继续支持鼠标、键盘、手柄导航。

## 13. 推荐公共组件

优先建立：

- `GameButton`
- `IconButton`
- `SegmentedControl`
- `ParameterSlider`
- `RuntimeTooltipController`
- `KeycapDisplay`
- `PagedContentView<T>`
- `PagedCategoryRail<T>`
- `SurfaceFrame`
- `BottomCommandSurface`
- `SoftGlow`
- `GameplayBlurService`

这些共享状态类名、Input 行为、Tooltip、Disabled / Hover / Selected 规则和视觉 Token。

不要把整个 UI 抽象成万能组件。

## 14. 后续 Web 设计规则

每个新增重要 UI 至少明确：

1. Unity VisualElement 层级；
2. USS 负责什么；
3. C# 状态 / 事件负责什么；
4. 是否需要 Sprite / Texture / RenderTexture；
5. 是否依赖 URP 效果；
6. 是否需要 Pool / ListView；
7. 鼠标、键盘、手柄如何操作。

如果 Web 效果不能直接用 UI Toolkit 原语实现，但能通过统一 Sprite / RenderTexture / Painter2D / Mesh / URP 合理实现，可以保留设计。

不要因为 CSS 写起来方便新增无法解释 Unity 落地方式的核心交互或结构。

## 15. Web Prototype Compatibility Profile

Web Prototype 继续服务快速验证，但从现在起遵守迁移护栏：

- Runtime CSS 禁止 `:has()`；
- 新 Blur 需求不得直接新增组件级 `backdrop-filter` Owner；
- 新复杂布局优先使用能映射 UXML Flex 的 DOM 层级；
- 固定容量二维目录优先显式 Row / Column，而不是依赖 CSS Grid 才能成立；
- 结构性状态线 / Pager Marker 优先真实节点；
- Motion 必须消费共享 Motion Token；
- Browser API 只能停留在 Web Adapter 层，不拥有业务状态；
- Lucide SVG Component 只是 Source Icon，不是 Unity Runtime 依赖。

GitHub Build 在 TypeScript / Vite Build 前执行 `npm run audit:unity`。高风险模式会直接阻止 CI；其它可迁移但需换实现的 CSS 能力作为 Migration Debt 输出，不要求为了 Web 原型全部提前删除。

### 当前官方能力确认

当前目标以 Unity 6 Runtime UI Toolkit 为基线：

- UI Toolkit 是 retained-mode Runtime UI 系统，正式结构使用 UXML、样式使用 USS、行为使用 C#；
- USS 支持 `opacity / translate / scale / transition-*`，因此当前 Motion Grammar 可直接映射；
- Runtime 输入可配合 Input System Package 与 UI Toolkit Event System；
- 大数据列表使用 `ListView` 的 make/bind/unbind 与虚拟化；
- `VectorImage` 可作为 UI Toolkit 矢量资产类型，SVG 需要 Vector Graphics SVG Importer；项目仍将按实际性能和美术流程决定 Sprite Atlas 与 VectorImage 的使用比例。

详细 Migration Gate 见 `Documentation/Unity UI Toolkit迁移准备清单.md`。

## 16. 当前 Web 是否需要返工

当前结论：**不需要因为迁移问题大规模返工。**

后续只在以下情况回头修改：

- 结构 / 交互本身不适合 Unity；
- 正式 UI Toolkit 暴露新的信息架构问题；
- 某视觉效果成本不可接受；
- 用户明确调整设计方向。

纯实现差异不构成返工理由。

## 17. 相关文档

- `Documentation/项目概览.md`
- `Documentation/UI设计原则.md`
- `Documentation/UI Surface与Control视觉规范.md`
- `Documentation/UI空间与状态架构.md`
- `Documentation/Bottom Command Visual System设计规范.md`
- `Documentation/Placement Tool设计规范.md`
- `Documentation/Design Workspace设计规范.md`
- `Documentation/组件设计规范.md`
- `Documentation/代码审查/2026-09-15-UI Toolkit迁移可行性审查.md`
- `Documentation/代码审查/2026-09-19-UI Toolkit迁移准备审查.md`
- `Documentation/Unity UI Toolkit迁移准备清单.md`
- `Documentation/代码审查/2026-09-16-Surface与Control视觉系统审查.md`
- `Documentation/工作交接.md`
