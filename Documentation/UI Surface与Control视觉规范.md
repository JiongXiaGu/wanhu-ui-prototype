# UI Surface 与 Control 视觉规范

本规范定义《万户天工》UI Prototype 中可长期复用的 Surface、Blur、圆角、Segmented Control 与页面 Action Button 视觉语言。目标不是让所有控件长得完全一样，而是让相同语义使用同一套视觉契约，并能直接映射到最终 Unity UI Toolkit 的 UXML / USS / C# 结构。

## 1. 总原则

UI 不使用“纯黑不透明盒子”覆盖世界，也不把 Blur 当作唯一的可读性来源。

稳定原则：

- Surface 自己必须带有黛墨 / 玉青色调；
- 世界画面只作为经过弱化、模糊后的环境信息透入；
- 白天与夜晚都应保持相近的文字对比度和结构识别；
- Surface 透明度按任务强度分层，不按单个页面随意取值；
- 暖金只用于 Selected / On / Focus / Primary；
- 圆角属于层级语法，不是装饰；
- 同一语义控件不得在不同页面自行发明另一套 Hover / Active / Radius；
- Web `backdrop-filter` 只是目标视觉表达，最终 Unity 不按每个 VisualElement 分别执行 Blur。

一句话标准：

> 面板应像一层带自身色调的半透明玉墨玻璃，而不是一块黑色遮罩，也不是一块完全依赖背景亮度的透明玻璃。

## 2. 圆角层级

当前 1080p 基线采用四个常用层级：

- `8px`：Segmented Control 内部选项、小型辅助 Icon Action；
- `10px`：普通 Button、Segmented Control 外壳、Tooltip、小型输入控件；
- `14px`：Command Surface、Top Shell 等中型 HUD Surface；
- `18px`：Workspace、Context Surface、Tool Parameter Panel 等大型面板。

不要因为“统一圆角”把所有 Card、列表行、图片预览都强制改成同一个 Radius。Asset Card、列表 Card 的形态仍由内容密度和信息结构决定；这里统一的是可复用 Control / Surface 语法。

## 3. Gameplay Glass Surface

### 3.1 使用场景

Gameplay Glass Surface 用于仍应让玩家感知世界画面的 HUD / 面板：

- Top Shell；
- Main Dock / Placement Action Bar / World Utility；
- Design Workspace；
- Camera / Weather Context Surface；
- Building / Road Tool Parameter Panel；
- Information View Palette；
- 后续 Selection Inspector。

这些 Surface 不应完全遮断世界画面。

### 3.2 Surface Transparency Hierarchy

Gameplay 不再以“所有面板接近同一 Alpha”为目标。透明度由任务强度决定：越接近世界观察越透明，越接近集中操作越稳定。

当前四档语义：

| Tier | 语义 | Web 参考 Alpha | 当前 Consumer |
| --- | --- | --- | --- |
| Ambient | 常驻、低干扰辅助 HUD | 约 `.66–.74` | Compass、System Menu、World Utility、Operation Hints |
| Context | 临时观察 / 调整，不阻断世界 | 约 `.76–.82` | Camera / Weather、Top Control Tray、Workspace Header |
| Work | 玩家正在浏览或执行任务 | 约 `.82–.88` | Top Status、Main Dock、Workspace Body、Tool Parameter、Placement Action Bar |
| Blocking | 需要明显压住世界的重空间 | 约 `.92–.94` | Management、Pause、Settings、Archive 等重空间 |

当前 Gameplay Token 位于 `src/gameplay/gameplay-hud-layout.css`：

```text
--hud-surface-ambient-*
--hud-surface-context-*
--hud-surface-work-*
--hud-surface-blocking-*
```

稳定规则：

- 只降低 Surface 背景 Alpha，不给整个组件设置统一 `opacity`；
- Text / Icon / Border / Active 状态保持自己的固定对比度；
- 子控件仍可使用极弱独立 Tone，避免背景细节直接穿入交互控件；
- 同一 Surface 内允许按职责拆层，例如 Workspace Header = Context、Body = Work；
- 不为单个页面重新发明一套透明度数值。

这些数值是 Web Prototype 的视觉参考，不是 Unity Shader 参数合同。

### 3.3 夜晚规则

夜景不使用独立 Night Theme，也不根据世界亮度动态修改 Surface Tier。

夜间稳定性依赖：

1. 固定的 Ambient / Context / Work / Blocking Surface Tint；
2. 被 Blur 后的低频世界颜色；
3. 轻微 Brightness Lift；
4. 固定文字 / Icon 对比度；
5. 弱内高光与 Border。

禁止因为进入夜晚就额外降低 Alpha；如果某个固定 Tier 在昼夜之一失去可读性，应调整该 Tier 本身，而不是增加日夜两套 UI Token。

Blur 负责环境感，不负责基础可读性。

## 4. Blur 使用边界

### Gameplay 小面板

可以表现轻度局部玻璃感，但 Blur 强度应克制，不让背景细节穿透到文字层。透明度越低的 Context / Ambient Surface 可以比高 Alpha Work Surface 多保留一点环境感，但仍共享少量 Blur Tier，不为每个面板单独定 Blur 算法。

### Pause / Settings / Archive / Management 等重空间

更适合使用场景级统一 Blur / Dim 服务，让整个世界背景先被弱化，再绘制 UI Surface。

### 禁止

- 每个 Button 自己 Blur；
- 每个 Panel 建独立 RenderTexture；
- 同屏多个不同半径的实时 Blur 链；
- 用 Blur 替代 Surface Tint。

## 5. Segmented Control

Segmented Control 表示**局部范围内的互斥选择**。

适合：

- Building Placement：自由 / 道路吸附 / 网格；
- Weather：跟随世界 / 场景模拟；
- Camera：经营 / 规划 / 摄影；
- New Game：低配 / 造景 / 完整；
- 其它 2～5 项、同层级、互斥的参数模式。

不适合：

- One-shot Action；
- 页面主导航；
- 大量分类浏览；
- On / Off Toggle；
- 需要独立详细参数的复杂模式入口。

### 5.1 视觉结构

```text
SegmentedControl
├ Option
├ Option Active
└ Option
```

外壳必须首先让玩家看出“这是一整组可点击控件”：

- `10px` 外壳圆角；
- 有非常弱的 Surface + Border；
- 内部 `3px` 左右 Padding / Gap；
- Option 默认透明；
- Hover 出现明显但克制的浅色 Tone；
- Active 使用暖金 Tone + 暖金文字 / Icon；
- Option 使用 `8px` 圆角；
- 不需要再叠加额外金线，否则小控件会变得过度装饰。

### 5.2 交互语义

- 任意时刻通常保持一个有效 Active；
- 再点当前 Active 不取消选择；
- Keyboard / Gamepad Focus 必须可进入各 Option；
- Active 是状态，不是“一次点击反馈”。

## 6. Button 视觉语义

### Secondary Action

用于返回、取消、普通次级流程：

- `10px` Radius；
- 弱 Border；
- 极弱深色 / 浅色 Tone；
- Hover 提升文字和 Border；
- 不使用暖金常驻填充。

### Primary Action

用于当前页面唯一主要推进动作，例如：

- 新建游戏“开始营造”；
- 保存游戏“保存存档”；
- Placement “完成”。

规则：

- 暖金只比 Secondary 强一档；
- 可以使用弱暖金 Surface；
- 允许一条极细结构性暖金状态线；
- 不使用厚金边、大面积发光或高饱和黄色。

### Utility Action

例如：

- 恢复默认；
- 重命名存档组；
- 删除存档组；
- 其它低频辅助动作。

默认不需要永久 Button Box，只在 Hover 时出现轻 Tone；通常使用 `8px` Radius。

## 7. Full-screen Action Footer

Settings / New Game / Load / Save 统一使用 `global-space-footer` 语义。

Footer 本身：

- 允许轻度半透明玉青 Surface；
- 约 `12px` Blur；
- 顶部只有弱分隔线；
- 不形成独立的大黑条；
- 按页面内容宽度对齐 Action，而不是所有按钮堆到同一角。

共用：

- `.global-space-primary`；
- `.global-space-secondary`；
- Utility Action 语义。

Settings / New Game / Load / Save 不允许再次复制一套 `border-radius:1px / 2px` 的底部按钮美术。

## 8. Bottom Command Visual System 的关系

Gameplay 底部 Main Dock / Placement / World Utility 继续遵循：

`Documentation/Bottom Command Visual System设计规范.md`

本规范提供更高层的通用 Surface / Control 规则；Bottom Command 规范提供 L / M / S 三档 Toolbar 的专用尺寸与状态方向。

三档仍然属于同一视觉家族，但允许按照任务强度映射不同透明度：

- Main Dock：较轻 Work；
- Placement Action Bar：更稳定的 Work；
- World Utility：Ambient。

它们仍共享 Tint 色相、Border、Radius、Hover、Active、Divider、Tooltip，不得因为 Alpha 不同演变成三套材质。

## 9. Web 代码权威位置

当前视觉集中入口：

- `src/ui/ui-visual-system.css`：通用 Surface / Segmented / Full-screen Button；
- `src/gameplay/gameplay-hud-layout.css`：Gameplay Geometry + Surface / Blur Token；
- `src/gameplay/bottom-command-system.css`：Bottom Command Surface；
- `src/fullscreen-actions.css`：Settings / New Game / Load / Save Footer 的布局与语义分组。

组件自己的 CSS 仍可定义内部布局，但不要重新定义已有的全局视觉契约。

## 10. Unity UI Toolkit 映射

正式 Unity 建议建立共享 USS Visual System，而不是按页面复制样式。

建议概念 Class：

```text
.ui-surface
.ui-surface--glass
.ui-surface--ambient
.ui-surface--context
.ui-surface--work
.ui-surface--blocking
.ui-radius-sm
.ui-radius-md
.ui-radius-lg

.ui-segmented
.ui-segmented__option
.ui-segmented__option--active

.ui-button
.ui-button--primary
.ui-button--secondary
.ui-button--utility
```

UXML 示例：

```text
SegmentedControl
├ OptionButton
├ OptionButton
└ OptionButton
```

Active / Disabled / Focus 由 C# 明确添加 / 移除 USS Class，不通过查询当前颜色反推状态。

### Blur

UI Toolkit 本身不需要复刻 Web `backdrop-filter`。

推荐架构：

```text
World Camera
↓
URP Shared Blur Service / Fullscreen Pass
↓
可供 UI 使用的统一弱化背景结果
↓
UI Toolkit Panel
  └ Surface VisualElement（Tier / Tint / Opacity / Border）
```

关键点：

- Blur Service 是共享场景级能力；
- Surface 只声明视觉层级和 Tint，不拥有独立 Blur 算法；
- 同屏多个 Surface 可以共享同一 Blur 结果；
- 不为每个面板创建 RenderTexture 链；
- 昼夜可读性由固定 Surface Tier 和文本对比保证，而不是动态依赖世界亮度。

## 11. 审查清单

新增或修改 UI 时检查：

- 这是 Ambient / Context / Work / Blocking 哪一档 Surface？
- 是否已经有对应共享 USS / CSS 契约？
- 是否错误使用整个组件 `opacity` 导致文字和控件一起变淡？
- 是否又出现 `1px / 2px` 的临时按钮圆角？
- Hover 时玩家是否能明确判断它可点击？
- Active 与 Hover 是否有清楚但克制的差异？
- 夜景下 Surface 是否仍有稳定色调与结构边界？
- Blur 是否只是环境点缀，而不是可读性前提？
- 是否能直接说明 Unity 中对应的 UXML / USS / C# 状态？
- 是否因为 Web 写法方便而复制了另一套视觉系统？
