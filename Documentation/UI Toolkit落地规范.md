# UI Toolkit 落地规范

## 1. 最终目标

《万户天工》正式游戏 UI 的最终实现平台是 **Unity UI Toolkit**。

本仓库中的 React / TypeScript / CSS 页面不是最终产品代码，而是用于：

- 验证 UI 美术语言；
- 验证构图、尺寸和空间关系；
- 验证信息架构与交互流程；
- 快速比较不同视觉方案；
- 通过固定 1920 × 1080 场景和 Visual Review 做持续美术审查；
- 为 Unity UI Toolkit 的正式 UXML / USS / C# 实现提供稳定参考。

因此，后续任何设计决策都必须优先回答：

> 这个界面在 Unity UI Toolkit 中如何落地？

网页实现方式本身不构成最终技术约束。

## 2. 权威来源

项目按以下优先级理解：

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
- 选中 / Hover / Disabled / Focus 等状态；
- 页面、Workspace、Tool、Flyout、Pause 等空间切换；
- 滚轮、分页、搜索、快捷键等交互语义；
- 动效的方向、节奏与大致时长；
- 图片、预览、材质、模糊等效果应该呈现出的视觉结果。

Web Prototype **不要求**以下内容与 Unity 1:1 技术对应：

- CSS Grid 的具体写法；
- `linear-gradient` / `radial-gradient` 的具体实现；
- `box-shadow`；
- `filter`；
- `backdrop-filter`；
- `::before` / `::after`；
- CSS `@keyframes`；
- 浏览器原生 Tooltip；
- 浏览器 DOM 结构本身。

这些只用于快速表达视觉。正式 Unity 实现应换成适合 UI Toolkit 的结构。

## 4. 何时必须修改网页方案

只有当问题影响最终游戏的设计或交互时，才应修改 Web Prototype。

需要修改网页的情况：

- 布局结构在 UI Toolkit 中明显不合理；
- 交互流程不适合鼠标、键盘或手柄；
- 大量内容依赖无限滚动而不适合正式游戏；
- 状态关系会导致 Unity 侧数据所有权混乱；
- 视觉效果必须依赖不可接受的运行时成本才能成立；
- Web 方案掩盖了正式实现中必须解决的信息架构问题。

不需要为了迁移而修改网页的情况：

- CSS 渐变在 Unity 中需要改成 Sprite / VisualElement；
- Web 阴影在 Unity 中需要改成 9-slice；
- Hover 提亮在 Unity 中需要改成 Tint / Overlay；
- Web 动效需要改成 USS Transition / C#；
- Web Blur 需要改成 URP 渲染能力；
- CSS Grid 可以通过嵌套 Flex 重建同样构图。

原则：

> **设计合理但技术实现不同，不属于需要重设计。**

## 5. UI Toolkit 基础实现约束

### 5.1 布局

正式 Unity UI 优先使用：

- UXML 表达稳定层级；
- USS 表达视觉和基本布局；
- Flex Row / Column 组合替代 Web CSS Grid；
- 固定槽位 / Pool 处理数量有限但重复的内容；
- ListView 只用于确实需要大量连续列表和虚拟化的场景。

不要为了复刻网页 DOM，而创建没有语义价值的 VisualElement 层级。

### 5.2 固定设计基准

当前 Web Prototype 的 `1920 × 1080` 是正式 UI 的设计基准。

Unity 应使用统一 PanelSettings 缩放策略支持：

- 1920 × 1080；
- 2560 × 1440；
- 3840 × 2160；
- 其它常见宽高比。

不要把 4K 适配理解为把所有 USS 数字手工翻倍。

### 5.3 状态驱动

Unity 正式实现应继续保持当前已经验证的状态模型：

- Gameplay；
- Workspace；
- Tool；
- Pause；
- Right Edge Flyout；
- Archive；
- Settings。

视觉状态由明确状态驱动，不依赖查询 VisualTree 当前长什么样来推断业务状态。

结构变更、界面打开与关闭、工具模式变化都应有明确的数据所有者。

## 6. 视觉效果的 Unity 对应方案

### 6.1 Surface / Tone

Web 中的大量渐变和轻微 Tone 仍可作为视觉参考。

Unity 优先使用：

- 半透明背景色；
- 独立 Overlay VisualElement；
- 小型共享渐变纹理；
- 9-slice Sprite；
- Tint / Opacity；
- 必要时 Painter2D / 自定义 Mesh。

不要为了视觉丰富而给每个小控件配置独立复杂材质。

### 6.2 Soft Glow

暖金或青墨的弱环境光建议做成共享视觉组件，例如：

`SoftGlow`

可以由：

- 透明 Sprite；
- VisualElement + Tint；
- 或极少量专用自定义绘制

实现。

不要在每个面板复制一套独立 Shader。

### 6.3 Shadow

Web `box-shadow` 只表示美术意图。

Unity 中：

- 大型重要 Surface 可使用共享 9-slice Shadow Sprite；
- 小型控件通常不需要真实阴影；
- 优先靠 Tone、边界和层级关系建立深度。

### 6.4 Hover 图片提亮

Web 的 `brightness / saturate` 不作为 Unity 技术要求。

Unity 可用：

- Image Tint；
- 轻量 Overlay；
- Selected / Hover 状态类；
- 必要时替换 Sprite 或预览材质参数。

### 6.5 伪元素

Web `::before / ::after` 在正式 Unity 中应转化成有明确职责的子 VisualElement，例如：

```text
CategoryItem
├ ActiveLine
├ Icon
└ Label
```

伪元素只能是 Web 原型快捷表达，不能成为 Unity 结构设计依据。

## 7. Blur 统一策略

正式游戏计划使用 **URP 全屏 Blur Pass** 作为统一场景模糊能力。

因此 Web Prototype 可以继续使用 `backdrop-filter` 或其它方式表达目标视觉，但必须遵守：

- Blur 是场景级 / 全屏级渲染能力，不是每个 VisualElement 自己实现的效果；
- UI 面板只声明自己是否需要 Blur 背景层，不负责执行模糊算法；
- Pause、Settings、Archive 等需要明显背景压制的空间可以共享同一 Blur 服务；
- 普通 Gameplay 小面板尽量只用透明 Surface + Tone，不滥用 Blur；
- 模糊半径、降采样、性能档位应统一管理；
- 不允许每个面板建立独立 RenderTexture Blur 链路。

建议 Unity 最终形成类似：

```text
Scene
↓
URP Fullscreen Blur Pass
↓
Blurred Scene Texture / Fullscreen Result
↓
UI Toolkit Panel
```

具体实现以后以 Unity 项目的 URP 架构为准，本仓库只记录视觉需求和使用边界。

## 8. 图片与 RenderTexture

以下内容优先使用真实游戏资产：

- 建筑缩略图；
- 世界预设；
- Game Group 城市截图；
- Archive Preview；
- 需要实时展示的建筑预览。

允许使用：

- Texture2D；
- Sprite；
- RenderTexture；
- VectorImage。

实时 RenderTexture 必须按可见数量控制更新，不为不可见的大量 Card 持续渲染。

Building Workspace 当前只有 6 个可见 Card，非常适合将来做有限预览资源池。

## 9. 动效规范

Web 动效表达的是节奏，不是技术实现。

正式 Unity 优先使用：

- Opacity；
- Translate；
- Scale；
- USS Transition；
- 必要时 C# 驱动过渡。

常规建议：

- Hover：约 100 ms；
- Tab / Selected：约 120～160 ms；
- Workspace / Flyout：约 160～220 ms；
- 分组分页：约 160～200 ms；
- Tooltip：约 400 ms 延迟出现。

避免频繁动画 Width / Height / Layout Position，避免为了视觉效果持续触发布局重算。

## 10. Tooltip

Web Prototype 中现有 `title` / `data-tooltip` 只是临时表达。

Unity Runtime 必须建立正式共享 Tooltip 系统，例如：

`GameplayTooltipController`

职责：

- PointerEnter / PointerLeave；
- 约 400 ms Delay；
- Tooltip Layer；
- 屏幕边缘修正；
- 鼠标 / 键盘 / 手柄模式差异；
- 文本内容与快捷键显示。

Tooltip 不得成为完成基础操作所必须的信息来源。

## 11. 输入与滚轮

Web Prototype 验证的是输入语义。

Unity 最终应使用新的 Input System，并由 UI Toolkit Runtime 接收对应事件。

Workspace 当前已确认：

- Primary Rail 滚轮翻分类组；
- Content Grid 滚轮翻内容组；
- 一次有效手势只翻一组；
- 分页视觉始终保留；
- 滚轮只是快捷输入；
- Primary Rail 与 Context Filter 是独立筛选维度。

最终 Unity 实现应继续支持鼠标、键盘和手柄导航，不把功能绑定死在浏览器式鼠标交互上。

## 12. 推荐公共组件

Unity 正式实现优先建立以下共享组件：

- `GameButton`
- `IconButton`
- `SegmentedControl`
- `ParameterSlider`
- `RuntimeTooltipController`
- `KeycapDisplay`
- `PagedContentView<T>`
- `PagedCategoryRail<T>`
- `SurfaceFrame`
- `SoftGlow`

这些组件应共享：

- 状态类名；
- Input 行为；
- Tooltip；
- Disabled / Hover / Selected 规则；
- 视觉 Token。

不要把整个 UI 抽象成一个万能组件。

## 13. 后续 Web 设计规则

以后继续修改 Web Prototype 时，每个新增的重要 UI 都应至少明确：

1. Unity 中对应的 VisualElement 层级是什么；
2. 哪部分由 USS 完成；
3. 哪部分由 C# 状态 / 事件完成；
4. 是否需要 Sprite / Texture / RenderTexture；
5. 是否依赖 URP 全屏效果；
6. 是否需要 Pool / ListView；
7. 鼠标、键盘、手柄如何操作。

如果视觉效果无法直接用 UI Toolkit 原语实现，但能通过统一 Sprite、RenderTexture、Painter2D、Mesh 或 URP 能力合理实现，则可以继续保留该视觉设计。

不要因为 Web CSS 写起来方便，而新增无法解释 Unity 落地方式的核心交互或结构。

## 14. 当前 Web 是否需要返工

当前结论：**不需要因为迁移问题大规模返工现有 Web Prototype。**

当前网页继续承担美术与交互参考职责。

后续只在以下情况下回头修改现有页面：

- 发现结构或交互本身不适合 Unity；
- 正式 UI Toolkit 实现暴露出新的信息架构问题；
- 某视觉效果需要不可接受的性能成本；
- 用户明确调整设计方向。

纯实现差异不作为返工理由。

## 15. 相关文档

- `Documentation/项目概览.md`
- `Documentation/UI设计原则.md`
- `Documentation/UI空间与状态架构.md`
- `Documentation/组件设计规范.md`
- `Documentation/代码审查/2026-09-15-UI Toolkit迁移可行性审查.md`
- `Documentation/工作交接.md`
