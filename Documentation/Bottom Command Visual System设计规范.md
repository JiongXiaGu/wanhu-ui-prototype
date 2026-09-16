# Bottom Command Visual System 设计规范

Bottom Command Visual System 统一 Gameplay 下方三类持续操作面：

- **Main Dock**：大号（L），负责“要建造 / 浏览什么”；
- **Placement Action Bar**：中号（M），负责当前 Tool 的模式、快捷动作与完成 / 取消；
- **World Utility Toolbar**：小号（S），负责跨 Workspace / Tool 的世界级辅助能力。

三者不是三套独立美术。它们必须使用同一套 Tint 色相、边界、圆角、Hover、Active、分隔线与 Tooltip 语言；尺寸、内容密度、阴影与固定的透明度 Tier 用于表达职责层级。

## 1. 核心原则

玩家应一眼理解为同一套底部控制系统：

```text
Main Dock                L  主入口
Placement Action Bar     M  当前任务主控
World Utility Toolbar    S  全局辅助工具
```

禁止通过为不同 Toolbar 单独发明材质、金色渐变、按钮描边、圆角或 Selected 方向来制造层级。

层级主要依赖：

- 高度；
- 点击区尺寸；
- 信息密度；
- Shadow 强弱；
- 是否常驻文字；
- Surface Transparency Tier。

透明度差异表达“任务强度”，不是三套材质：低干扰辅助能力允许更多世界画面透入，当前任务主控保持更稳定的 Work Surface。

## 2. 1080p 尺寸基线

### L：Main Dock

- 高：`76px`；
- 宽：当前约 `940px`；
- 分类图标：约 `21px`；
- 允许图标 + 两字分类名；
- 是 Gameplay / Workspace 的主建造入口；
- 使用较轻的 Work Surface，当前 Web 约 `.82–.85` Alpha。

### M：Placement Action Bar

- 高：`68px`；
- 图标按钮点击区：`46 × 46px`；
- 图标：约 `20px`；
- 宽度由当前 Tool 的 Mode / Quick Action 数量自然决定；
- Building / Road / 后续 Bridge / Wall 等共用同一外壳；
- 使用更稳定的 Work Surface，当前 Web 约 `.85–.88` Alpha。

### S：World Utility Toolbar

- 高：`56px`；
- 图标按钮点击区：`42 × 42px`；
- 图标：约 `20px`；
- 右下常驻，仅承载跨工具世界能力；
- 使用 Ambient Surface，当前 Web 约 `.68–.74` Alpha。

不要为了让三者等宽或等高而破坏职责层级。

## 3. 共享材质

三档 Surface 使用同一视觉家族：

- 黛墨 / 深青灰 Tint；
- `14px` 外框圆角；
- 约 `10px` 控件圆角；
- 同一细弱边界；
- 同一 Hover Tone；
- 同一暖金 Active Tone；
- 同一分隔线色；
- 同一 Tooltip 材质。

L / M / S 可以使用不同固定 Alpha 和 Shadow Tier，但不得切换色相或复制三套 USS / CSS 材质。Transparency Tier 必须来自共享 Token，不允许组件各自硬编码一组随机透明度。

Web 当前代码：

- Token：`src/gameplay/gameplay-hud-layout.css`
- 共享 Surface Class：`src/gameplay/bottom-command-system.css`
- Main Dock 内部：`src/gameplay-refine.css`
- Placement 内部：`src/tools/placement/placement-action-bar.css`
- World Utility 内部：`src/gameplay/world-utility-toolbar.css`

## 4. Button 状态语言

### Default

默认按钮不绘制明显独立 Box：

- 透明背景；
- 中性灰绿图标；
- 不绘制常驻边框。

Toolbar 应首先被理解为“一个 Surface 上的一组操作”，而不是很多独立 Card 拼接。

### Hover

- 使用统一极弱浅色 Tone；
- 图标提升到浅纸灰；
- 不增加描边。

### Active / Toggle On

- 暖金图标；
- 极弱暖金背景 Tone；
- `2px` 状态线。

底部横向 Command Surface 的状态线统一位于按钮**顶部**，视觉上朝向它所控制的世界 / 内容。

Main Dock 左侧 `设计 / 蓝图` 是竖向一级 Mode Selector，保留左侧短金线作为方向性例外。

### Disabled

- 仅降低亮度 / 对比；
- 不增加说明文字；
- 原因需要解释时使用 Tooltip。

## 5. Quick Action 与 Primary Action

Quick Action 是 One-shot：

- 不使用持续 Selected；
- 执行后不改变当前 Mode；
- 与 World Utility 的普通 One-shot Action 使用同一种中性按钮样式。

Placement 的“完成”是当前任务唯一 Primary：

- 暖金图标；
- 比 Active Mode 略强的暖金 Tone；
- 不使用突兀的粗金框 / 网页式 Primary Button。

“取消”保持中性，不使用危险红；取消当前建造不是危险 / 不可逆操作。

## 6. 分组与节奏

模式组、快捷动作组、Commit 组使用同一种细竖分隔线：

- 高约 `24px`；
- 透明度弱；
- 主要靠间距和分组建立节奏。

Placement 不应因为组多就使用特别高或特别宽的分隔线；World Utility 也不应使用另一套分隔规则。

## 7. Tooltip

底部纯图标控件共享 Tooltip 视觉：

- 深墨 Surface；
- 约 `10px` 圆角；
- 字号约 `9px`；
- Hover 延迟约 `320–400ms`；
- 不可交互；
- 用于名称、快捷键和必要的一句解释。

正式 Unity 使用共享 Runtime Tooltip Controller，不依赖 Web `data-tooltip` 实现。

## 8. Unity UI Toolkit 映射

正式 Unity 推荐把这套系统实现成共享 USS 契约，而不是为三个 Toolbar 各复制一套样式。

概念结构：

```text
BottomCommandSurface
├ Size Tier: L / M / S
├ Surface Tier: Work / Ambient
└ Content
   ├ CommandGroup
   │  ├ CommandButton
   │  └ ActiveLine
   ├ Divider
   └ ...
```

建议共享 USS Class 概念：

```text
.bottom-command-surface
.bottom-command-surface--lg
.bottom-command-surface--md
.bottom-command-surface--sm
.ui-surface--work
.ui-surface--ambient
.command-button
.command-button--active
.command-button--primary
.command-divider
```

状态由 C# 添加 / 移除 Class，不从 VisualTree 外观反推业务状态。

Web 中的渐变、`box-shadow`、`backdrop-filter` 只表达目标视觉。Unity 可以使用：

- USS 背景色 / Tint / Opacity；
- 共享 9-slice Surface / Shadow Sprite；
- 轻量 Overlay VisualElement；
- ActiveLine 子 VisualElement；
- 统一 Tooltip Controller。

不要给 Main Dock、Placement、World Utility 创建三份几乎相同的 USS 或三套独立材质。

## 9. 扩展规则

以后新增 Bridge Placement、City Wall Placement、Platform Placement 等 Tool：

- 复用 M 档 Placement Action Bar；
- 只配置 ModeGroup / QuickAction / Commit，不重做外壳美术；
- 详细数值继续放左侧 Tool Parameter Panel；
- Grid / Undo 等跨工具能力继续留在 S 档 World Utility。

如果未来需要新的底部 Toolbar，先判断它属于 L / M / S 哪一档；只有现有层级无法表达职责时才新增尺寸 Tier。透明度优先从 Ambient / Context / Work / Blocking 中选择，不为新 Toolbar 新增独立 Alpha 体系。
