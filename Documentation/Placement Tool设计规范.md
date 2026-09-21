# Placement Tool 设计规范

Placement Tool 是 Design Workspace 中选择具体资产后进入的世界编辑阶段。当前原型已经覆盖 Building Placement 与 Road Placement，并要求后续桥梁、城墙、围墙等工具优先复用相同的空间和交互语言。

## 1. 核心职责分离

Placement Tool 固定分成三类 UI：

- **左侧 Placement Context**：当前工具的详细参数、数值、Slider、Segmented Control、状态摘要；属于统一 `Left Context System`；
- **中下 Placement Action Bar**：模式切换、高频 One-shot Quick Action、完成 / 取消；
- **右下 Context Utility Toolbar**：固定槽位，按当前 Tool Context 切换辅助能力；Gameplay / Workspace 显示 World Utility，Placement 显示 Tool Utility。

不要把详细参数塞进 Placement Action Bar，也不要把当前任务的完成 / 取消塞进 Context Utility Toolbar。

玩家认知应保持：

```text
左侧：这个模式具体怎么调
中下：我现在在做什么 / 立即执行什么
右下：当前上下文有哪些辅助编辑能力
```

## 2. Placement Action Bar

共享组件：

- `src/tools/ToolActionBar.tsx`：所有 Tool 的共享模式 / 快捷 / Commit Shell；
- `src/tools/placement/PlacementActionBar.tsx`：Placement 适配层，固定提供完成 + 取消；
- `src/tools/placement/placement-action-bar.css`：共享 M 档 Geometry / State。

Placement Action Bar 是共享 `ToolActionBar` 的 Placement Adapter，并属于 `Bottom Command Visual System` 的 **M 档**。完整材质、状态与 Unity UI Toolkit 映射规则见 `Documentation/Bottom Command Visual System设计规范.md`。

稳定结构：

```text
ModeGroup [│ Secondary ModeGroup] [│ QuickActionGroup] │ CommitGroup
```

Action Bar 外壳约 `68px` 高，固定屏幕下方居中；宽度由当前 Tool 的按钮数量自然决定，不要求所有工具等宽。

### Mode Button

- 图标优先，不常驻显示 `平 / 填 / 高 / 位 / 层 / 顶 / 面` 等开发占位文字；
- 使用 Tooltip / ARIA Label 提供完整中文名称；
- 属于 Exclusive Selector；
- 同一 ModeGroup 中保持一个有效 Active；
- Active 使用弱暖金 Tone + 顶部细金状态线；
- 切换 Mode 可以改变左侧 Placement Context 内容。

### Quick Action

- 图标按钮；
- 属于 One-shot Action，不使用 `aria-pressed`，不留下持续 Selected；
- 点击后执行一次，并保持玩家当前 Mode 不变；
- 只放高频即时动作，不放 Slider / 数值参数；
- 视觉上与 Context Utility 的普通 One-shot Action 使用同一中性按钮语言。

典型能力：旋转、镜像、反转方向、回退控制点等。

### Commit Group

所有 Placement Tool 固定在 Action Bar 最右侧：

- 完成：Primary，使用暖金图标与轻暖金 Tone，不使用突兀粗金框；
- 取消：Secondary，中性视觉。

目前使用图标 + Tooltip，不常驻绘制文字标签。

## 3. Building Placement

Building Placement 只回答“建筑在哪里”，正式 Intent：

```text
BuildingPlacementIntent
├ new
└ move
```

New 从 Design Workspace 进入，Move 从 Building Selection 进入。两者共享同一套 Placement Context、Action Bar、World Preview、地形 / 道路 / 碰撞校验和 Building Utility；不会维护第二套 Move Controller。

左侧承载地形关系（平衡挖填 / 只填不挖 / 手动标高）和固定的位置参数（自由 / 道路吸附 / 网格、旋转角度、吸附距离）。中下只保留地形 ModeGroup + 旋转 / 镜像 Quick Action + 完成 / 取消。位置不再作为“调整对象”模式，因为整个 Placement Session 本身就是位置操作。

New 完成后未来创建正式 Building Entity；Move 完成后只提交原建筑的 Placement / Transform 数据，不通过 Destroy + Create 重建对象。Move 必须保留原建筑身份及岗位、居民、库存、经营统计、配色等引用。取消 Move 丢弃 Draft 并保持 Original 不变。

楼身 / 屋顶 / 立面已经移出 Placement，进入独立 Building Edit Tool。Building Edit 与 Placement 只共享 Left Context、ToolActionBar 和建筑参数控件 Primitive，不共享业务 Session。

Move / Edit 从 Selection 进入时 ToolOrigin 为 Selection，结束后恢复同一 entityId；New 仍返回对应 Design Workspace。

## 4. Road Placement

道路资产现已连接 Road Placement Tool，并已迁入统一 `Left Context System`。

左侧 Placement Context 当前验证：

- 当前绘制模式摘要；
- 道路宽度；
- 相对标高；
- 曲线平滑（直线模式不显示）；
- 预估长度 / 坡度 / 节点等轻量状态。

Action Bar 只有一个道路绘制 ModeGroup：

- 智能曲线；
- 曲线；
- 直线。

三者属于同一个 Exclusive Selector，默认智能曲线。绘制模式仍由中央 Placement Action Bar 持有，左侧 Context 只消费当前模式并展示对应业务参数。

当前 Quick Action：

- 反转道路方向。

后续如果真实道路系统需要，可以继续加入“撤回当前控制点 / 翻转道路侧 / 高程方向”等 One-shot Action，但不要把低频配置继续堆进中下 Action Bar。

完成 / 取消 Road Placement 后由 `ToolOrigin` 返回进入前的 Design Workspace；当前正常路径为 `设计 → 道路`。

## 5. Placement Context 与 Left Context System

### Legacy ToolOverlay 已退役

旧 `src/tool-overlay.css` 的五列 ParameterRow、旧 Header、Segment、Icon Strip 皮肤已经退出 Runtime。

正式 Tool 参数链只有：

```text
RuntimeParameterRow
├ Label
└ NumericSliderField
   ├ Step -
   ├ Slider
   ├ Step +
   └ ValueButton
```

Left Context 明确拥有两列外层布局：`Label | minmax(0,1fr) Field`。Building / Road 只能通过 `placement-parameter-controls.css` 调整 Label / Stepper / Value 尺寸 Token，不得恢复五列外层 Grid。



Placement Tool 的左侧参数区不是一套独立 Tool Panel 系统，而是 `Left Context System` 的 Placement 分支。

共享所有权固定为：

- `src/ui/LeftContextPanel.tsx`：全局 Left Context Shell、Header、Section、可选 Footer；
- `src/gameplay/gameplay-context-panel.css`：Left Context Shell、Header、Section、共享参数控件与 Segmented Control 的结构 / 几何；
- `src/tools/placement/PlacementContextPanel.tsx`：Placement 家族进入 Left Context System 的统一适配入口；
- `src/tools/placement/placement-context-panel.css`：Placement Context 的统一屏幕定位、宽度、最大高度与 Body 滚动几何；
- `src/ui/wanhu-surface-system.css`：所有 Left Context Root / Header / Body / Footer 的唯一材质 Owner 与日夜表现。

Building / Road / Wall / Bridge 等具体工具只拥有自己的业务内容和业务节奏。具体工具 CSS **不得重新定义** 以下内容：

- 外层 Surface 背景、边框、阴影、模糊与圆角；
- Header 高度、标题结构、图标结构与关闭按钮皮肤；
- Body 的公共滚动与 Placement Context 外层几何；
- `RuntimeParameterRow`、Slider、Stepper、Segmented Control 的公共皮肤；
- Placement 模式切换、完成 / 取消等中央 Action Bar 职责。

新工具的默认骨架应直接从以下结构开始：

```text
PlacementContextPanel
└─ LeftContextPanel
   ├─ Shared Header
   └─ Shared Body
      ├─ LeftContextSection：状态 / 模式摘要
      └─ LeftContextSection：工具业务参数

PlacementActionBar
├─ ModeGroup
├─ QuickActionGroup（可选）
└─ CommitGroup
```

因此后续桥梁、城墙、围墙、河道、台基等工具新增时，应优先增加自己的 Context 内容与参数配置，而不是新增一份 `XXXPlacementPanel` 外壳或 `XXXPlacement` 专属面板皮肤。

1080p 当前 Placement Context 空间规则：

- `left:16px / bottom:16px`；
- 宽度由 `placement-context-panel.css` 统一管理；
- Smoked Graphite Context Surface；
- 18px 大面板圆角；
- Header + Body；
- 参数内容可以滚动，Header 保持稳定；
- Placement Context 默认不使用 Footer，避免与中央 Placement Action Bar 重复职责。

## 6. Context Utility 不变量

右下角不再在所有状态下常驻完整 World Utility。正式结构为一个稳定的 **Context Utility Host**：

```text
Gameplay / Workspace
→ World Utility

Building Placement
→ Building Utility

Road Placement
→ Road Utility

Future Bridge / Wall / Platform
→ 对应 Tool Utility Definition
```

进入 Placement Tool 后，以下世界级入口退出：

- 地图解锁；
- 编辑区域；
- 地形编辑；
- 配色工具；
- 范围复制 / 范围移动。

Placement 继续保留所有工具共享的：

- Grid Snap；
- Grid Visible；
- Undo / Redo。

并在中间插入 Tool-specific One-shot Action：

- Building：对齐最近道路 / 校准建筑基底；
- Road：拉直当前道路段 / 连接最近道路节点；
- Bridge / Wall 等后续通过 Definition 增加，不复制新的 Toolbar Shell。

Context Utility 是 Bottom Command Visual System 的 **S 档**，与 Placement 使用同一 Surface / Hover / Active / Divider 语言，仅内容定义与宽度随 Tool Context 切换。

### 切换动画

Tool Context 切换时不动画 Width：

1. 旧 Toolbar：约 `100ms`，Opacity `1 → 0` + `translateY(0 → 6px)`；
2. Hidden 状态下直接替换 Definition 与 Width；
3. 新 Toolbar：约 `140ms`，Opacity `0 → 1` + `translateY(6px → 0)`。

退出 / 进入阶段立即阻断 Pointer Input，避免透明旧按钮仍可点击。

正式 Unity UI Toolkit 应使用一个固定 Host + 一个复用 Toolbar，通过 USS Class / C# Rebind 完成切换，不常驻多份 Building / Road / Bridge Toolbar。

## 7. Tool Handoff Motion

Workspace → Placement：

- Workspace / Main Dock / Control Tray 先用 Fast Exit 收起；
- Tool 业务状态立即成立；
- 约 100ms 后 Placement Context 从左侧进入；
- Placement Action Bar 从底部进入；
- Context Utility 同期完成 World → Tool Definition Swap。

Placement → Workspace 反向执行。

该流程映射 Unity UI Toolkit 的 Presence Class，不允许用业务延迟等待动画结束。

## 8. 输入与语义

交互类型不能混用：

- ModeGroup：Exclusive Selector；
- Quick Action：One-shot Action；
- 完成 / 取消：One-shot Commit Action；
- Grid Snap / Grid Visible：跨 Context Toggle Setting；
- Tool-specific Utility：One-shot Action，不残留 Selected。

Action Bar 的 Quick Action 不得因为执行一次动作就改变当前 Mode。

## 9. 视觉基线

1080p 当前原型基线：

- Action Bar 高约 `68px`；
- Icon Button 约 `46 × 46px`；
- Icon 约 `20px`；
- Action Bar 圆角 `14px`；
- 左侧 Placement Context 圆角 `18px`；
- 默认 Button 不绘制明显独立 Box；
- Active 使用收敛暖金 Tone + 顶部 `2px` 状态线；
- Quick Action 默认中性灰白；
- 完成是唯一明显 Primary，但仍保持 Toolbar 图标按钮语言；
- 取消不使用强烈危险红；
- 分隔线高约 `24px`，与 Context Utility 共用视觉规则。

Action Bar 是当前任务主控，其视觉权重高于 Context Utility，但不通过另一套材质表达。Main Dock / Placement / Context Utility 分别对应 Bottom Command Visual System 的 L / M / S 三档。

## 10. 验收要求

Placement Tool 相关改动至少检查：

- Building / Road 都必须通过 `PlacementContextPanel` 进入同一个 `Left Context System`；
- Building / Road 的 Header 几何、Placement Context 宽度与共享参数控件一致；
- 具体 Tool CSS 不重新拥有 Shell / Header / Surface / 公共 Control 皮肤；
- Building / Road 两种不同 Tool 都能复用同一 Action Bar；
- Action Bar 居中且几何稳定；
- Building 两组 Mode 分别只有一个 Active；
- Road 三种绘制方式只有一个 Active；
- Road 切换为直线模式时左侧 Context 应响应状态并隐藏曲线平滑参数；
- Quick Action 不拥有 Toggle / Selected 状态；
- Building 旋转 / 镜像存在；
- Road 反转方向存在；
- 详细参数仍留在左侧 Context；
- Placement Context 不增加 Footer 与中央 Action Bar 重复模式/提交职责；
- Tool 中 Control Tray / Main Dock / Scene Context Surface 不回归；
- Tool 中完整 World Utility 不再保留；右下固定槽位切换为对应 Context Utility；
- Building / Road Tool Utility 必须隐藏地图解锁 / 区域 / 地形 / 配色等世界级入口；
- Grid Snap / Grid Visible / Undo / Redo 跨 Tool Context 保留；
- Placement / Context Utility 的 Surface、按钮 Hover、Active Tone、状态线方向与分隔节奏保持同一视觉家族；
- 完成后返回对应 Design Workspace。


## 11. World Tool 与 ToolOrigin

Placement Tool 不是 Tool Space 的唯一来源。地形编辑属于 **World Tool**：

```text
Gameplay / Workspace
  ↓ World Utility
Terrain Edit Tool
```

因此 Tool 退出不能继续通过 `if road else building` 猜返回位置。

正式状态：

```text
ToolOrigin
├ gameplay
├ design-workspace(category)
└ selection(kind + entityId)
```

进入任何 Tool 时先捕获 Origin，`EXIT_TOOL` 只消费 Origin 恢复空间。

- Building New / Road：通常来自 Design Workspace；
- Building Move / Edit：来自 Selection，退出后恢复同一对象；
- Terrain Edit：通常来自 Gameplay；如果在 Workspace 中点击右下地形编辑，则退出后恢复原 Workspace；
- Future Bridge / Wall / Platform / Shortcut：统一复用同一 Origin 机制。

Terrain Edit 的专用规则见 `Documentation/地形编辑工具设计规范.md`。
