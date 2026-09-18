# Placement Tool 设计规范

Placement Tool 是 Design Workspace 中选择具体资产后进入的世界编辑阶段。当前原型已经覆盖 Building Placement 与 Road Placement，并要求后续桥梁、城墙、围墙等工具优先复用相同的空间和交互语言。

## 1. 核心职责分离

Placement Tool 固定分成三类 UI：

- **左侧 Placement Context**：当前工具的详细参数、数值、Slider、Segmented Control、状态摘要；属于统一 `Left Context System`；
- **中下 Placement Action Bar**：模式切换、高频 One-shot Quick Action、完成 / 取消；
- **右下 World Utility Toolbar**：跨工具全局能力，例如 Grid Snap / Grid Visible / Undo / Redo。

不要把详细参数塞进 Placement Action Bar，也不要把当前任务的完成 / 取消塞进 World Utility Toolbar。

玩家认知应保持：

```text
左侧：这个模式具体怎么调
中下：我现在在做什么 / 立即执行什么
右下：全局怎么辅助编辑世界
```

## 2. Placement Action Bar

共享组件：

- `src/tools/placement/PlacementActionBar.tsx`
- `src/tools/placement/placement-action-bar.css`

Placement Action Bar 是 `Bottom Command Visual System` 的 **M 档**。完整材质、状态与 Unity UI Toolkit 映射规则见 `Documentation/Bottom Command Visual System设计规范.md`。

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
- 视觉上与 World Utility 的普通 One-shot Action 使用同一中性按钮语言。

典型能力：旋转、镜像、反转方向、回退控制点等。

### Commit Group

所有 Placement Tool 固定在 Action Bar 最右侧：

- 完成：Primary，使用暖金图标与轻暖金 Tone，不使用突兀粗金框；
- 取消：Secondary，中性视觉。

目前使用图标 + Tooltip，不常驻绘制文字标签。

## 3. Building Placement

左侧 Placement Context 继续承载：

- 地形状态摘要；
- 位置参数；
- 体量 / 楼身参数；
- 屋顶参数；
- 未来立面参数。

Action Bar 当前包含两组 Mode：

### 地形关系

- 平衡挖填；
- 只填不挖；
- 手动标高。

### 调整对象

- 位置调整；
- 楼身调整；
- 屋顶调整；
- 立面调整（当前 Disabled）。

### Quick Actions

- 逆时针旋转；
- 顺时针旋转；
- 镜像建筑。

旋转 / 镜像不改变当前调整对象。例如处于屋顶调整时执行旋转，执行后仍保持屋顶调整。

完成 / 取消 Building Placement 后返回 `设计 → 建筑` Design Workspace。

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

完成 / 取消 Road Placement 后返回 `设计 → 道路` Design Workspace。

## 5. Placement Context 与 Left Context System

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

## 6. World Utility 不变量

Placement Tool 中仍保留右下 World Utility Toolbar：

- Grid Snap；
- Grid Visible；
- Undo / Redo；
- 以及其它跨工具世界级辅助能力。

这些状态进入 Tool 时不重置，也不在具体 Building / Road Tool 内复制一份。

World Utility 是 Bottom Command Visual System 的 **S 档**，与 Placement 使用同一 Surface / Hover / Active / Divider 语言，仅尺寸与阴影层级更低。

## 7. 输入与语义

交互类型不能混用：

- ModeGroup：Exclusive Selector；
- Quick Action：One-shot Action；
- 完成 / 取消：One-shot Commit Action；
- Grid Snap / Grid Visible：全局 Toggle Setting。

Action Bar 的 Quick Action 不得因为执行一次动作就改变当前 Mode。

## 8. 视觉基线

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
- 分隔线高约 `24px`，与 World Utility 共用视觉规则。

Action Bar 是当前任务主控，其视觉权重高于 World Utility，但不通过另一套材质表达。Main Dock / Placement / World Utility 分别对应 Bottom Command Visual System 的 L / M / S 三档。

## 9. Review 要求

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
- World Utility 与 Compass 继续保留；
- Placement / World Utility 的 Surface、按钮 Hover、Active Tone、状态线方向与分隔节奏保持同一视觉家族；
- 完成后返回对应 Design Workspace。
