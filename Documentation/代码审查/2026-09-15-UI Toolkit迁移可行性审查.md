# UI Toolkit 迁移可行性审查

本审查针对当前 `wanhu-ui-prototype` Web 原型，目标不是判断“UI Toolkit 能不能做游戏 UI”，而是判断当前已经确定的视觉、布局、交互能否可靠迁移到《万户天工》的 Unity 6 Runtime UI Toolkit，并提前识别不应继续依赖的 Web-only 实现。

## 一、结论

### 总体结论

当前原型的 **功能架构与交互模型高度适合 UI Toolkit**，但当前 Web CSS 中有一批视觉实现不能直接翻译为 USS。

建议把迁移理解为：

- **交互 / 状态架构：约 90% 可保留；**
- **布局结构：约 75% 可保留语义，但需要从 CSS Grid 改为 Flex / 嵌套容器；**
- **基础视觉：约 80% 可保留；**
- **Web 特效 CSS：不能直接照搬，应重做实现；**
- **整体设计无需推翻。**

真正需要解决的是“实现语言不同”，而不是“设计方向不适合 Unity”。

### 风险等级

- **A — 直接迁移**：UXML + USS + 常规 C# 即可。
- **B — 可迁移，但要换实现方式**：视觉不变，但不能照搬 Web CSS。
- **C — 建议迁移前调整设计实现**：照搬会导致高成本、性能差或维护复杂。
- **D — 需要专用渲染方案**：RenderTexture、Painter2D、MeshGenerationContext、URP Pass 等。

当前没有必须判定为“设计不可实现”的核心 UI。

---

# 二、最重要的 Web → UI Toolkit 差异

## 1. CSS Grid：当前最大结构风险

当前 Web 原型多处使用：

- `display: grid`；
- `grid-template-columns`；
- `grid-template-rows`；
- `grid-column`；
- `grid-row`。

Unity UI Toolkit 的布局核心是 Yoga Flexbox 子集，不能把 CSS Grid 原样翻译为 USS。

### 改法

不要改变最终构图，改成嵌套 Flex：

```text
Web Grid 3 × 2

→ Unity
ContentColumn
  Row0
    Card0 Card1 Card2
  Row1
    Card3 Card4 Card5
```

Settings 两列：

```text
SettingsGroups
  LeftColumn
  RightColumn
```

Archive 三列：

```text
ArchiveBody (row)
  GameGroupColumn
  TimelineColumn
  PreviewColumn
```

### 结论

**B。** 设计无需调整，但以后 Web 原型不应依赖复杂 CSS Grid 才能成立。

---

## 2. `gap`

当前 CSS 广泛使用 `gap`。

UI Toolkit 不应依赖 Web `gap` 语法完成布局间距。

### 改法

使用：

- 子元素 `margin-right / margin-bottom`；
- 容器 `padding`；
- 可复用 USS spacing class。

### 结论

**A/B。** 很容易替换，但迁移时需要系统处理。

---

## 3. `::before / ::after`

当前 Web 原型大量使用伪元素完成：

- Selected 金线；
- 顶部高光；
- 卡片覆盖层；
- 细分隔线；
- 缩略图暗角；
- Pager 连接线。

UI Toolkit USS 支持状态伪类，但不能依赖 Web 的 `::before / ::after` 生成匿名视觉节点。

### 改法

所有有语义价值的伪元素改成真实子节点：

```text
Button
  ActiveLine
  Icon
  Label
```

```text
CardThumb
  Image
  ShadeOverlay
  BottomLine
```

### 结论

**B。** 视觉完全可以保留，但 UXML 层级会比 Web 多一些。

以后 Web Prototype 如果目标是 1:1 UI Toolkit 落地，建议尽量使用真实 DOM 子节点模拟，而不是大量伪元素。

---

## 4. CSS 渐变

当前大量使用：

- `linear-gradient(...)`；
- `radial-gradient(...)`；
- 多层背景渐变。

这是当前迁移成本最大的视觉来源之一。

### UI Toolkit 建议实现

按复杂度分层：

#### 普通线性 Tone

使用极小的 PNG / Sprite 渐变资产，配合 Tint 与 9-slice。

#### Surface 内高光 / 金色顶部线

使用：

- 1px / 2px VisualElement；
- 半透明颜色；
- 简单背景图。

不需要自定义绘制。

#### 柔和 Radial Glow

推荐准备统一的软圆光 PNG：

```text
UI_SoftGlow_Gold
UI_SoftGlow_Jade
UI_Vignette
```

通过绝对定位、缩放、Tint、Opacity 复用。

#### 动态复杂渐变

只有真正必要时才使用 `generateVisualContent / Painter2D / MeshGenerationContext`。

### 结论

**B。** 视觉可以保留，但不能继续把复杂 CSS gradient 当成免费能力。

---

## 5. `backdrop-filter: blur(...)`

当前 Settings、Workspace 等 Surface 使用了 Web 的背景模糊。

UI Toolkit 没有 CSS `backdrop-filter` 的直接等价物。

### 推荐方案

正式 Unity UI 默认：

```text
半透明深墨 Surface
+ 弱噪声/材质图
+ 内高光
+ 世界画面压暗
```

这已经能保留大部分当前气质。

只有 Pause / 全屏系统空间如果确实需要真实背景模糊，再考虑：

- URP 专用 Blur Pass；
- 低分辨率世界 RenderTexture；
- 一次性全屏 Blur，而不是每块 Panel 各自模糊。

### 结论

**C/D。** 不建议按 Web 设计逐面板复制实时 blur。

当前视觉语言应该把 Blur 视为“可选增强”，不能作为界面成立的前提。

---

## 6. `box-shadow`

当前大量 Surface/Card 使用 Web box shadow。

UI Toolkit 不应按 CSS box-shadow 思路逐项实现。

### 推荐替代

- 大 Surface：共享 9-slice Shadow Sprite；
- 小控件：直接取消阴影，依靠明度差；
- 重点浮层：Shadow VisualElement 放在主体后面；
- 只保留少数层级的阴影，不对每个 Card 生成阴影。

### 结论

**B。** 可以达到相同层级感，但需要资产化。

---

## 7. `filter: brightness / saturate`

Workspace 缩略图 Hover 等 Web 实现使用亮度、饱和度 filter。

UI Toolkit 不应依赖该类 CSS filter。

### 替代

- Image Tint；
- 半透明 Hover Overlay；
- Selected 时增加暖金 Overlay；
- 必要时换图；
- 少量真正需要特殊色彩处理的动态图像再使用材质/RenderTexture。

### 结论

**B。** 不影响设计。

---

## 8. CSS Keyframes

当前 Web 有：

- Workspace page enter；
- Settings content enter；
- Search enter；
- Tool mode enter 等。

UI Toolkit 的推荐路径是 USS Transition + `translate / opacity / scale`，而不是照搬 CSS `@keyframes`。

### 推荐

```text
Before:
opacity = 0
translate = (4px, 0)

After class/state:
opacity = 1
translate = (0, 0)
```

频繁移动元素使用 `UsageHints.DynamicTransform`；有大量一起移动的子元素时考虑 `GroupTransform`。

### 结论

**B。** 现有动效语言适合 UI Toolkit，只需改实现。

---

## 9. Layout Animation

Web Prototype 中有 Search `72px → 184px` 的宽度展开。

UI Toolkit 可以动画 width，但这会触发布局计算。

### 建议

低频单控件可接受，但正式版优先：

- 预留固定宽度；
- Input 用 opacity + translate 出现；
- 或直接状态切换，不做宽度动画。

### 结论

**B。** 不是不能做，而是不要把 Layout Animation 当默认动效。

---

## 10. Tooltip

Web 原型中还有 `title` 和 `data-tooltip`。

Runtime UI Toolkit 自带的 Editor Tooltip 机制不能直接作为游戏 Runtime Tooltip 使用。

### 正式实现

需要自己的：

`GameplayTooltipController`

建议职责：

- PointerEnter / PointerLeave；
- 延迟约 400ms；
- 全局 TooltipLayer；
- 基于元素 worldBound 定位；
- 自动避免超出屏幕；
- InputSystem 切换到手柄时改为 Focus Tooltip 或 Help 行为。

### 结论

**B。** 必须自己实现，但非常标准。

---

## 11. 图标

当前 React 使用 Lucide SVG Component。

Unity 中不能直接照搬 React Icon。

### 推荐

正式 UI Icon Library 做成统一资产：

- 首选：统一尺寸单色 Sprite / Texture Atlas；
- 可评估 UI Toolkit VectorImage，但不要让游戏核心 UI 强依赖预览性质的外部 Vector Graphics 工作流；
- 图标使用 Tint 变色；
- Active / Disabled 不保存多份图，只改 Tint。

### 结论

**A/B。** 需要一次性资产转换。

---

# 三、逐界面迁移审查

## Main Menu

**等级：A/B**

结构非常适合 UI Toolkit：

```text
MainMenuRoot
  BackgroundImage
  Shade
  Brand
  MenuList
```

按钮、Hover、Selected、Toast 都是常规能力。

需要替换：

- 背景渐变 Shade → 半透明 VisualElement / Gradient Sprite；
- Web Shadow → 资产化阴影或删除。

**建议：基本不改设计。**

---

## New Game

**等级：A/B**

左步骤 Rail + Preset Card 是典型 Flex 布局。

真实地图预览图可用 `Image`，以后可直接接 Texture/Sprite/RenderTexture。

风险：

- 不要用 CSS Grid 实现 Preset；
- Preset 用一个 Row 容器，或 wrap Flex；
- 后续如果 Preset 很多，可用分页 Pool，不建议无限实例化。

**建议：重做 New Game 时直接按 UXML-friendly 结构设计。**

---

## Gameplay HUD

**等级：A**

资源、日期、天气、城市信息都是普通 Label / VisualElement。

这是最容易迁移的部分之一。

**建议：可直接作为第一批 Unity 实现。**

---

## Quick Controls

**等级：A**

相机 / 天气 / 时间速度 / Pause 都是普通 Button + State。

手柄支持可以通过 Input System Action + Navigation Event 补充。

**建议：直接迁移。**

---

## Utility Toolbar

**等级：A**

Icon Cell、Separator、Disabled、Active 都容易实现。

Tooltip 需要共享 Runtime TooltipController。

**建议：直接迁移。**

---

## Main Dock / Command Bar

**等级：A**

Mode Rail + Category Row 完全适合横向 Flex。

目前 Web 中 `display: contents` 不需要迁移；Unity 直接构造正确层级即可。

**建议：直接迁移。**

---

## Building Workspace

**等级：A/B**

这是之前看起来很 Web，但经过最近几轮设计后反而已经非常适合 UI Toolkit。

当前结构：

- Primary Rail：每组固定 5 项；
- Context Filter：纯文字；
- Content：每组固定 3 × 2 = 6 项；
- 无无限滚动；
- Pager 固定容量；
- WheelEvent 翻组。

这非常适合做成“固定数量 Element Pool”，根本不需要复杂虚拟列表。

### 推荐 Unity 结构

```text
BuildingWorkspace
  Header
  Body (row)
    PrimaryRail
      CategoryPager
      CategorySlot0..4
    Catalog
      ContextFilter
      ContentRows
        Row0: Card0 Card1 Card2
        Row1: Card3 Card4 Card5
      ContentPager
```

### Wheel

UI Toolkit Runtime 支持 `WheelEvent`，可以在 PrimaryRail / ContentArea 注册回调。

复用当前逻辑：

- `delta.y` 累积阈值；
- 220ms 左右锁定；
- StopPropagation，防止外层重复处理；
- 鼠标所在区域决定切分类组还是内容组。

### 缩略图

使用 `Image`，固定宽高。

如果需要从 Atlas / 大图裁切，可使用 `Image.sourceRect`；最终真实建筑预览也可以直接使用 Texture 或 RenderTexture。

### 主要改造

- CSS 3×2 Grid → 两个 Flex Row；
- Pager 连接线伪元素 → 真实子元素；
- 图片 Hover filter → Tint / Overlay。

**结论：当前 Workspace 已经是整个项目里最适合 UI Toolkit 的复杂页面之一。**

---

## BuildingPlacementOverlay

**等级：A/B**

功能结构非常适合 UI Toolkit，而且原始 Unity 包本身已经存在过这一套语义。

参数行：

```text
Label | Minus | Track | Plus | Value
```

可以用自定义 `BuildingParameterField : VisualElement`。

建议不要全部使用 Unity 默认 Slider 外观；使用 VisualElement Track + Thumb 或对标准 Slider 内部结构统一换皮。

TerrainSummary、SegmentRow、ModeParameters 都可直接组件化。

风险主要来自：

- 当前 CSS 背景渐变；
- Hover Tone；
- Box Shadow；
- 模式切换 Keyframe。

这些全部属于视觉实现层，而不是结构问题。

**建议：高可行。**

---

## BuildingPlacementDock

**等级：A**

固定按钮组是 UI Toolkit 的优势场景。

建议自定义：

- `IconAction`；
- `ModeAction`；
- `SubmitAction`。

Active 使用 class：

```text
is-active
is-disabled
is-primary
```

不要依赖 Web pseudo-element。

**建议：直接迁移。**

---

## GameplayOperationHints

**等级：A**

本质是：

- Context Row；
- 若干 Keycap Row；
- Footer shortcuts。

完全适合 UI Toolkit。

最终 Input Binding 应从 Input System 读取，不要保留 Web Prototype 的固定字符串。

**建议：直接迁移。**

---

## Camera / Weather Right Edge Flyout

**等级：A/B**

右侧 Flyout 本身非常适合 UI Toolkit：

```text
position:absolute;
right:0;
translate: ...;
```

打开/关闭使用 `translate + opacity` Transition，并设置 `UsageHints.DynamicTransform`。

ParameterRow / SegmentedControl 与 Settings / Placement 共用组件。

风险：

- Web 的渐变 Surface；
- Shadow；
- 如果未来继续增加 blur。

**建议：保留当前设计，重做 Surface 渲染方式。**

---

## Pause Layer

**等级：A/B/C**

Pause 命令本身完全简单。

真正问题是背景氛围：

- Web 可随意 blur / shade；
- UI Toolkit 没有每元素 backdrop blur。

### 推荐

默认：

```text
World
↓
全屏半透明深色 Shade
↓
Pause Menu
```

如果最终确实需要 Blur，只做一个全屏世界 Blur Pass，不做 Panel Blur。

Pause → Save / Settings 切换成全屏 Global Space 也很适合 UI Toolkit。

**结论：命令 A；Blur C/D。**

---

## Settings Space

**等级：B**

功能没有困难，但当前 Web 是最依赖 Web CSS 美术能力的页面之一。

问题：

- CSS Grid；
- 多层 radial / linear gradient；
- backdrop-filter；
- box-shadow；
- `::before / ::after`；
- Keyframe；
- 部分 width 动效。

### 推荐 Unity 结构

```text
SettingsRoot (column)
  Header
  Tabs
  Content
    GroupsRow
      GroupColumn0
      GroupColumn1
  Footer
```

Settings Group 内部使用普通 Flex Column。

### Ambient Tone

当前通过 radial-gradient 随 Active Tab 移动。

Unity 推荐改成：

```text
SoftGlowImage
```

一个软金光 PNG，绝对定位，切换 Tab 时改变 `translate` / `left`。

这样比动态 Gradient 更容易控制，并且性能更明确。

### Slider / Toggle / Select

全部高可行。

Select 可用 DropdownField / 自定义 Popup。
Toggle 建议自己换皮。
Binding 使用 Input System Rebinding。

**结论：设计可保留，但需要进行一次专门的“USS 化”。**

---

## Archive / Load / Save

**等级：A/B**

三栏结构完全可以用 Flex Row。

### Game Group

如果游戏组很少，普通 Element Pool 即可。

如果长期可能非常多，推荐 `ListView`，固定高度 Card 可以获得更好的虚拟化性能。

### Save Timeline

每个 Save Node 用固定高度 Item。

可以：

- 少量时普通 VisualElement 列表；
- 很多时 ListView FixedHeight。

时间轴竖线不要用 CSS pseudo-element，放真实 `RailLine` 子元素。

### Preview

Image + Labels，完全直接。

RenderTexture 也可以作为 Image / background 使用，适合未来动态存档截图或建筑预览。

### 风险

仍然是 Tone / Gradient / Shadow，不是交互。

**结论：非常可行。**

---

## Loading Layer

**等级：A**

全屏遮罩 + Label + Progress / Animation。

可直接迁移。

---

# 四、当前 Web 设计中应立即停止继续扩散的实现方式

从现在开始 Web Prototype 应进入一个 **UI Toolkit Compatibility Profile**。

## 禁止继续增加

### 1. 新 CSS Grid

除非只是原型临时结构，最终必须能明确拆成 Flex 行列。

### 2. 新 `backdrop-filter`

UI 的成立不能依赖 Blur。

### 3. 新 `box-shadow`

阴影要么删除，要么明确未来对应哪个 Shadow Sprite。

### 4. 新复杂多层 CSS Gradient

如果视觉确实需要，Web 中也应该把它概念化为：

- SoftGlow；
- Vignette；
- TopHighlight；
- SurfaceTexture。

未来 Unity 用图片资产替换。

### 5. 新 `::before / ::after` 视觉结构

影响设计的重要视觉节点应该改成真实元素。

### 6. 新 `filter: brightness/saturate/blur`

优先使用 Overlay / Tint 思路。

### 7. 新 CSS Keyframe 依赖

动效只设计为：

- Opacity；
- Translate；
- Scale；
- 少量 Color。

这些最容易迁移。

---

# 五、建议新增的 Unity 公共组件

为了避免正式 Unity 项目里每个界面重复造轮子，建议先建立以下 Runtime UI Toolkit 基础组件。

## 1. `GameButton`

统一：

- Normal；
- Hover；
- Active；
- Disabled；
- Selected。

## 2. `IconButton`

支持：

- Sprite / VectorImage；
- Tint；
- Tooltip Key；
- Toggle State。

## 3. `SegmentedControl`

Settings、Camera、Weather、BuildingPlacement 共用。

## 4. `ParameterSlider`

支持：

- Label；
- Value；
- Min / Max；
- Step；
- Track；
- 鼠标拖动；
- 手柄调整。

## 5. `RuntimeTooltipController`

全局单例/服务。

## 6. `KeycapDisplay`

由 Input System Binding 动态生成。

## 7. `PagedContentView<T>`

Building / Wall / CityWall / Bridge / Decoration Workspace 共用。

职责：

- 固定 Page Size；
- Element Pool；
- Prev / Next；
- WheelEvent；
- Pager Indicator；
- Search / Filter 后回第一页。

## 8. `PagedCategoryRail<T>`

职责：

- 固定 5 个 Category Slot；
- 竖向分页刻度；
- WheelEvent；
- 不自动改变 Filter。

## 9. `SurfaceFrame`

不要让每个页面自己模仿 box-shadow / gradient。

统一组合：

```text
Shadow(optional)
Surface Background
Noise/Texture(optional)
Top Highlight(optional)
Content
```

## 10. `SoftGlow`

共享软光图片元素，代替 Web radial-gradient。

---

# 六、图形资产策略

Web Prototype 当前大量视觉依赖 CSS。

Unity 正式版应该把视觉分为：

## USS 负责

- Layout；
- Color；
- Opacity；
- Font；
- Border；
- Radius；
- Translate / Scale；
- Transition；
- Tint。

## Sprite / Texture 负责

- Soft Shadow；
- Soft Glow；
- Noise；
- Complex Gradient；
- Surface Material；
- Vignette；
- 特殊分隔纹理。

## Painter2D / MeshGenerationContext 负责

只用于真正动态的：

- 特殊曲线；
- 图表；
- 自定义动态形状；
- 复杂进度图；
- 不能用简单 VisualElement 完成的程序化几何。

不要为了还原 CSS 而给普通 Panel 写 Custom Mesh。

---

# 七、分辨率与缩放

Web 目前在 `App.tsx` 中手动把 1920×1080 Canvas 按窗口尺寸统一缩放。

Unity 不需要自己做这一层 Transform。

建议 PanelSettings：

```text
Scale Mode: Scale With Screen Size
Reference Resolution: 1920 × 1080
Screen Match Mode: Match Width Or Height
```

Match 参数根据最终超宽屏策略再确定。

UI 内的设计尺寸继续按照 1920×1080 参考坐标即可。

### 4K

4K 不需要把 UXML 数值全部翻倍。

PanelSettings 负责整体比例，图形资产准备足够分辨率即可。

---

# 八、性能建议

## 动画

优先使用：

- opacity；
- translate；
- scale。

对频繁动画元素设置 `UsageHints.DynamicTransform`。

容器整体移动且内部子项多时评估 `UsageHints.GroupTransform`。

避免高频动画：

- width；
- height；
- left/top 布局；
- 大量 AddToClassList / RemoveFromClassList。

## 大型列表

如果内容很多：

- Archive Game Group / Save History 可用 ListView FixedHeight；
- Workspace 当前固定分页只维护 6 个 Card，不需要 ListView；
- 不同时实例化数百个建筑 Card。

## RenderTexture

建筑预览 / 城市存档截图可以直接使用 RenderTexture，但要管理：

- 创建生命周期；
- 分辨率；
- 缓存；
- 失效恢复；
- 不要给每个不可见 Card 长期维持一张实时 RenderTexture。

---

# 九、推荐 Unity 层级架构

建议 Runtime 只建立少量清晰 Layer：

```text
UIDocument / Root

GameplayLayer
  HUD
  QuickControls
  UtilityToolbar
  MainDock

WorkspaceLayer
  BuildingWorkspace
  WallWorkspace
  ...

ToolLayer
  ToolOverlay
  ToolDock
  OperationHints

FlyoutLayer
  CameraFlyout
  WeatherFlyout

PauseLayer
  PauseMenu

GlobalSpaceLayer
  Archive
  Settings
  NewGame

TooltipLayer
  RuntimeTooltip
```

绝大多数状态只需要：

- `DisplayStyle.None / Flex`；
- Add/Remove class；
- Presenter 绑定数据。

不建议每个小 UI 都独立 UIDocument。

多个大型 Space 可以使用 UXML Template 复用，但保持一个统一 PanelSettings。

---

# 十、推荐迁移顺序

## 第一批：直接迁移，建立基础设施

1. PanelSettings / Theme；
2. Gameplay HUD；
3. Quick Controls；
4. Utility Toolbar；
5. Main Dock；
6. Pause Menu；
7. OperationHints。

目的：先验证尺寸、字体、Icon、Button、Tooltip、InputSystem、Theme。

## 第二批：Workspace + Tool

1. PagedCategoryRail；
2. PagedContentView；
3. Building Workspace；
4. BuildingPlacementOverlay；
5. BuildingPlacementDock。

这批完成后，可以验证绝大部分核心游戏 UI 技术路径。

## 第三批：全屏复杂空间

1. Settings；
2. Archive；
3. New Game。

重点解决 Flex 重构、Surface Assets 与大型列表。

## 第四批：视觉增强

最后才实现：

- SoftGlow；
- Shadow；
- Noise；
- Scene Blur（如果最终仍需要）；
- RenderTexture 动态预览。

不要在第一轮迁移就追求 1:1 Web 特效。

---

# 十一、最终判断

当前项目不需要因为 UI Toolkit 限制重新设计全部 UI。

需要改变的是 **Web Prototype 的技术约束**：

> 以后 Web 负责快速看视觉和交互，但任何新设计都必须能解释成 UXML + Flex + Sprite/Texture + Transition + C# 状态。

目前真正需要重新解释实现的主要只有：

1. CSS Grid；
2. CSS Gradient；
3. backdrop blur；
4. box-shadow；
5. filter；
6. pseudo-element；
7. keyframe；
8. runtime tooltip。

其余核心系统——Workspace 分页、滚轮翻组、ToolOverlay、Dock、OperationHints、Flyout、Pause、Archive、Settings、Main Menu——均可可靠落地到 Runtime UI Toolkit。

建议从下一轮 Web 修改开始正式启用 **UI Toolkit Compatibility Profile**，并在每次重要 UI Review 时增加一项：

> “这个视觉节点在 UXML / USS / C# 中对应什么？”

如果没有简单答案，就在 Web 阶段先重新设计实现，而不是把债务留到 Unity 正式迁移阶段。
