# UI 空间与状态架构

## 1. 顶层 Screen

原型当前顶层 Screen：

- `menu`
- `newGame`
- `load`
- `settings`
- `gameplay`

顶层 Screen 由 `src/App.tsx` 管理。

## 2. Gameplay 内部 Space

Gameplay 内部不使用大量互相独立的 Modal 叠加，而是按任务职责切换明确的 UI Space。

当前空间优先级：

1. Pause
2. Tool
3. Workspace
4. Management
5. Gameplay

### Gameplay

默认经营状态。

组成：

- Global HUD；
- Quick Controls；
- City Management Rail；
- Information Views；
- Utility Toolbar；
- Main Dock；
- 轻量 Operation Hints。

City Management Rail 只属于 Normal Gameplay，不是永久覆盖在所有状态上的 HUD。

### Management

用于财政、户籍、政策、商贸、治理、军务等复杂城市系统。

Management 是 **阻挡世界交互的中央大型管理空间**，不是 Right Edge Flyout。

组成：

- Global HUD 保留并弱化；
- 世界画面作为压暗 / 轻模糊背景；
- 中央大型 Management Surface；
- Management 内部 Tab 在 `概况 / 户籍 / 财政 / 政策 / 商贸 / 治理 / 军务` 之间切换。

进入 Management 后隐藏：

- City Management Rail；
- Quick Controls；
- Information View Palette；
- Utility Toolbar；
- Main Dock；
- GameplayOperationHints；
- Right Edge Flyout。

关闭 Management 后回到 Normal Gameplay，不恢复其它 Workspace / Tool。

设计原则：逻辑上阻挡世界操作，但视觉上不完全抹掉城市；玩家仍应感知自己是在管理当前城市，而不是进入独立 Web Dashboard。

### Workspace

用于浏览和选择内容，例如建筑目录。

组成：

- Global HUD；
- Quick Controls；
- Workspace；
- Main Dock；
- 轻量 Operation Hints。

进入 Workspace 后隐藏：

- City Management Rail；
- Information View Palette；
- Utility Toolbar。

这样建筑浏览与城市管理入口不会同时争抢左侧空间。

### Tool

用于进入具体编辑工具，例如 Building Placement。

组成：

- Global HUD；
- Quick Controls；
- ToolOverlay；
- Tool Bottom Dock；
- GameplayOperationHints。

进入 Tool 后隐藏：

- City Management Rail；
- Main Dock；
- Utility Toolbar；
- Information View Palette；
- Management Space。

ToolOverlay 与 Tool Bottom Dock 独占当前工具所需的左侧和底部交互区，避免与城市管理 Launcher 竞争。

### Pause

Pause 是全局 UI Space，不是普通 Modal。

组成：

- Pause Menu；
- Pause Save；
- Pause Settings。

世界仍作为背景存在，但明显压暗，并可使用轻微 Blur。

## 3. Right Edge Flyout

Right Edge Flyout 只服务轻量、场景上下文相关的快速工具。

当前：

- Camera；
- Weather。

规则：

- 从屏幕右侧滑入；
- 不锚定到触发按钮；
- Camera 与 Weather 互斥；
- 不承载财政、政策、军务等复杂管理系统；
- Tool 状态中打开 Flyout 时，GameplayOperationHints 保持既定遮挡规则；
- Flyout 是辅助空间，不升级为大型统计 / 管理 Workspace。

判断标准：如果一个功能需要多级 Tab、较宽表格、趋势图、多个管理参数或后续明显会扩展，应进入 Management / Workspace，而不是继续加宽 Flyout。

## 4. Information Views

Information Views 属于“观察城市”，不属于“管理城市”。

当前包括：

- 默认；
- 地价；
- 人口；
- 商业；
- 道路；
- 治安；
- 水利。

规则：

- 从 City Management Rail 底部的独立入口打开轻量 Palette；
- 选择后主要变化发生在世界地图，而不是打开大型面板；
- 与 Management Space、Workspace、Tool 互斥；
- 后续数据表现应逐步贴合街区、建筑、道路和覆盖范围，不长期停留在纯装饰性全屏渐变。

## 5. Global Management Space

Archive 与 Settings 属于顶层全局管理空间，与 Gameplay 内部的 Management Space 不同。

### Archive

Load 模式结构：

`Game Group → Save Timeline → Save Preview`

Game Group 代表玩家从一次“新建游戏”开始的一整场游戏；Save 是这个 Game Group 内部的历史节点。

Save 模式进入 Archive Space 时，当前 Game Group 固定，不允许把当前城市保存进其他游戏组。

### Settings

Settings 在 Main Menu 与 Pause 中复用同一组件和同一视觉系统。

分类：

- 显示
- 图形
- 音频
- 操作
- 游戏

不为 Main Menu 和 Pause 分别维护两套 Settings。

## 6. Gameplay 状态模型

`src/app/ui-state.ts` 是 Gameplay UI 状态的集中入口。

核心空间状态：

- `workspace`
- `tool`
- `flyout`
- `management`
- `mapView`
- `paused`
- `pauseView`

其它运行状态：

- `speed`
- `activeCategory`
- `terrainMode`
- `adjustmentMode`
- `gridSnap`
- `gridVisible`
- `canUndo`
- `canRedo`

空间判断：

```text
paused = true             → Pause
else tool != none         → Tool
else workspace != none    → Workspace
else management != none   → Management
else                      → Gameplay
```

重要互斥：

- 打开 Management → 关闭 Flyout、MapView，并退出 Workspace / Tool；
- 进入 Workspace / Tool → Management 回到 `none`；
- 打开 Camera / Weather → Management 回到 `none`，MapView 回默认；
- 打开非默认 MapView → Management 与 Flyout 关闭；
- Pause → Management / Flyout / MapView 清理为安全状态。

正式 Unity 实现必须继续以显式状态驱动 VisualElement 显隐，不通过当前 VisualTree 的存在与否反推业务状态。

## 7. Building Placement 模式

### 地形关系

- `平`：balanced-earthwork，平衡挖填；
- `填`：fill-only，只允许填方；
- `高`：manual-elevation，手动标高。

### 调整对象

- `位`：position，位置；
- `层`：massing，楼身 / 体量；
- `顶`：roof，屋顶；
- `面`：facade，当前保留为未完成 / Disabled 状态。

左侧 ToolOverlay 内容根据当前调整对象改变，而不是同时显示全部参数。

`高` 模式会在当前参数区域上方增加手动标高相关内容。

## 8. Building Placement Dock

Dock 分两层：

上层 Utility：

- 网格吸附；
- 网格显示；
- 撤销；
- 重做。

下层 Main：

- `平 / 填 / 高`；
- `位 / 层 / 顶 / 面`；
- 完成；
- 取消。

网格吸附和网格显示是 Toggle；撤销 / 重做是历史操作；完成 / 取消属于当前放置任务。

取消未提交放置不是危险操作，因此不使用强烈 Destructive Red。

## 9. GameplayOperationHints

OperationHints 位于右下，是轻量 Shortcut Rail。

职责：

- 显示当前调整模式；
- 显示当前最重要输入；
- 显示旋转、反转、撤销、重做、取消等快捷键。

它不承担教程长文。

Management Space 中不显示 OperationHints，因为玩家此时不操作世界。

最终 Unity 实现中，按键文字应来自实际 Input System 绑定，并支持 Keyboard/Mouse 与 Gamepad 动态切换；Web 原型只使用代表性 Keycap。

## 10. Esc 优先级

原则：先关闭更局部的空间，再关闭更全局的空间。

当前主要规则：

- Management Space → Esc 返回 Normal Gameplay；
- Pause Save / Pause Settings → Esc 返回 Pause Menu；
- Pause Menu → Esc 恢复游戏；
- 局部 Flyout / Tool 子层应优先于更宽泛菜单关闭。

新增 UI Space 时必须继续遵守这个优先级，不要让 Esc 行为互相竞争。

## 11. Review Scenario

`src/app/scenarios.ts` 提供确定性的 UI Bootstrap，用于视觉评审，不依赖人工点击流程。

Review Scenario 是测试入口，不是业务路由。

新增重要 UI 状态时，应同步增加 Review Scenario 和 Playwright 截图场景。

Management Space 至少应持续覆盖：

- Normal Gameplay Launcher；
- Finance Management Space；
- 一个非 Finance 的 Management Tab；
- Information Views；
- Workspace 不显示 Management Rail；
- Building Placement 不显示 Management Rail / Main Dock。
