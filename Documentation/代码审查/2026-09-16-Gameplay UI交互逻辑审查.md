# 2026-09-16 Gameplay UI 交互逻辑审查

## 审查目标

本轮不以新增页面为目标，而是统一 Gameplay 中“按钮打开什么、再次点击如何处理、哪些界面能够共存、Esc 先关闭谁”的交互规则，并清理已经互相覆盖的旧布局样式。

## 结论

Gameplay 不应把所有 Button 都理解成同一种交互。正式实现按以下四类区分：

### 1. Surface Launcher / 界面入口

点击后打开一个可见 Surface；再次点击同一个入口应关闭自己；点击同组其它入口应切换到目标 Surface。

当前包括：

- 城市 / 经济 / 政策 / 军事 / 宫殿；
- Camera / Weather；
- Main Dock 中会打开 Workspace 的“建筑”；
- Information Views Palette 入口。

规则：

- 同入口：Open → Close；
- 同组兄弟入口：A → B；
- 入口的 Active 状态只表示它所拥有的 Surface 当前可见；
- Surface 的关闭按钮、再次点击入口和 Esc 最终都修改同一份集中状态，不维护互相独立的局部布尔值。

### 2. Exclusive Selector / 单选状态

表示当前模式或当前选项，点击当前项后继续保持选中，不因为再次点击而取消。

当前包括：

- 时间速度：暂停 / 正常 / 加速 / 高速；
- Settings 一级分类；
- Segmented Control；
- Building Placement 的平 / 填 / 高与位 / 层 / 顶 / 面；
- Workspace 内部分类和筛选。

这类控件不能套用 Surface Launcher 的“再次点击关闭”规则。

### 3. Toggle Setting / 开关状态

明确表达 On / Off，再次点击切换布尔值。

当前包括：

- 网格吸附；
- 网格显示；
- Settings Toggle。

### 4. One-shot Action / 一次性动作

点击执行一次行为，不保留 Active 状态。

当前包括：

- Undo / Redo；
- Restore；
- 完成 / 取消；
- 普通 Confirm Action。

## Gameplay Surface 共存关系

### Normal Gameplay

常驻：

- Gameplay Top Shell 两层；
- Main Dock；
- World Utility Toolbar；
- Operation Hints。

Camera / Weather 是轻量场景 Flyout，可以覆盖在 Normal Gameplay 之上。

### Building Workspace

Workspace 是浏览内容的轻量工作空间，不再视为需要隐藏全部顶部入口的模式。

保持：

- Top Status Row；
- Top Control Tray；
- Main Dock；
- World Utility Toolbar；
- Operation Hints；
- 已打开的 Camera / Weather Flyout。

因此玩家可以在浏览建筑时继续切换城市管理入口，或查看 / 调整 Camera 与 Weather。

再次点击 Main Dock 的“建筑”应关闭 Building Workspace；Workspace 自己的关闭按钮也回到相同状态。

### Management Space

Management 是阻挡世界交互的重 Surface。

打开 Management 时：

- 关闭 Workspace；
- 关闭 Camera / Weather；
- 关闭 Information View Palette；
- 地图视图回默认；
- 隐藏 Main Dock、World Utility、Operation Hints；
- Top Control Tray 保留，用于一级管理域切换和再次点击当前域关闭。

### Tool / Building Placement

Tool 是当前编辑任务的强上下文。

进入 Tool 时：

- 隐藏 Top Control Tray；
- 隐藏 Main Dock；
- 关闭 Camera / Weather；
- 保留 Top Status Row；
- 保留 World Utility Toolbar；
- 使用 Tool 自己的 Bottom Dock 与 Operation Hints。

完成 / 取消 Building Placement 后返回 Building Workspace，而不是直接丢回 Normal Gameplay。

### Pause

Pause 的优先级最高，暂停期间世界操作 Surface 不继续接受输入。

## Esc 关闭顺序

Gameplay 的顶层关闭顺序集中在 `GameplayScreen`，避免每个面板各挂一个互相竞争的 `window.keydown`。

当前顺序：

1. 全局 Dialog / Safe Confirmation（由 DialogSystem capture-phase 优先处理）；
2. Camera / Weather Flyout；
3. Information View Palette；
4. Tool；
5. Workspace；
6. Management；
7. 非默认 Map View；
8. 无局部 Surface 时进入 Pause Menu。

Workspace Search 等局部输入允许先消费自己的 Esc，再由外层处理下一次 Esc。

Pause 内部继续使用：

- Pause Save / Settings → Esc 回 Pause Menu；
- Pause Menu → Esc 恢复游戏。

## 本轮发现并修复的问题

### 右侧 Flyout 顶部留空

根因不是 `right-edge-flyout.css` 本身，而是旧 `gameplay-context-unified.css` 在后续加载时重新写入 `top:72px`、`right:14px` 与旧宽度，覆盖新规则。

处理：

- RightEdgeFlyout 当前几何只由自己的组件 CSS 维护；
- 删除旧 Context CSS 中重复的 Camera / Weather Flyout 几何块；
- Camera / Weather 现在 `top:0; right:0`，直接贴合屏幕上 / 右边缘。

这也说明后续 CSS Cleanup 应继续遵守“一个组件只有一个几何所有者”。

### Workspace 打开后顶部菜单消失

旧逻辑把 Control Tray 仅绑定到 Gameplay / Management Space。

处理：

- Building Workspace 现在继续显示 Top Control Tray；
- Workspace 不再自动清除 Camera / Weather Flyout；
- Tool 仍隐藏 Control Tray，维持任务专注。

### Launcher 的 Toggle 逻辑分散

旧逻辑同时存在：

- HUD 组件内手工 `current === target ? none : target`；
- Reducer 内单向 Set；
- Information View Palette 的组件局部 state；
- Building Workspace 的特殊 Toggle。

处理：

- `mapPanelOpen` 进入 `GameplayUiState`；
- Surface Launcher 的开关语义集中到 reducer；
- HUD 只派发“用户点击了哪个入口”，不自己决定业务状态；
- Management / Flyout / Workspace / Information Palette 均拥有一致的再次点击关闭语义。

### Management Esc 重复所有权

ManagementSpace 原本自行监听全局 Esc；Gameplay 顶层也需要处理其它 Surface，容易形成多个 window listener 竞争。

处理：

- ManagementSpace 删除独立 Escape listener；
- Gameplay Surface 栈统一由 GameplayScreen 处理；
- Dialog 与 Pause 等更高优先级空间仍保留各自明确的输入所有权。

## 代码边界

当前推荐继续保持：

- `ui-state.ts`：业务状态、互斥 / 共存和 Launcher Toggle；
- `GameplayScreen.tsx`：空间组合、可见性、Gameplay 级 Escape 栈；
- `GameplayHUD.tsx`：渲染 Top Shell 和派发入口意图，不保存业务型局部 Surface state；
- 组件 CSS：内部视觉；
- `gameplay-hud-layout.css`：外围 HUD 几何；
- `right-edge-flyout.css`：RightEdgeFlyout 自己的几何与视觉；
- 不再让 `gameplay-context-unified.css` 重复拥有 Camera / Weather 几何。

## 后续审查重点

本轮优先完成 Gameplay Surface 层。Settings / Dialog 当前已有独立且较完整的键盘与安全确认逻辑，本轮没有为了统一而强行重写。

后续继续 Cleanup 时建议：

1. 将可复用的 Launcher / Selector / Toggle / Action 语义写入组件规范；
2. 检查旧 `hud-group` / `quick-controls` 等已经退出运行路径的 CSS 是否可完全删除；
3. 最终 Unity UI Toolkit 中把这里的 Surface Stack / Esc Priority 做成显式控制器，而不是依赖 VisualTree 查询；
4. 为 Camera / Weather / Information Views / Workspace / Management 建立同一套输入导航与 Gamepad Focus 恢复策略。
