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

- Gameplay Top Shell；
- World Utility Toolbar；
- Main Dock；
- 轻量 Operation Hints。

Gameplay Top Shell 是顶部唯一主控制岛，由两层组成：

1. **Persistent Status Row**：左侧天气 / 时间，中间资源，右侧模拟时间控制；
2. **Control Tray**：左侧 Information Views，中间五个一级管理域，右侧 Camera / Weather / Menu。

一级管理域收束为：

`城市 / 经济 / 政策 / 军事 / 宫殿`

此前独立的左侧 City Management Rail 与右上 Quick Controls 不再作为运行时结构显示。管理入口、Information Views 入口和轻量场景入口统一收束到顶部，减少左右两侧零散 UI 岛。

Control Tray 不常驻显示文字标签；中文名称由 Hover Tooltip 和 ARIA Label 提供。第二层宽度小于 Persistent Status Row，作为挂接在主状态栏下方的附属命令托盘。

World Utility Toolbar 位于右下，是独立于 Main Dock 与 Operation Hints 的全局世界编辑工具条。它只承载跨分类、跨工具仍可能使用的世界级辅助能力，不承载“完成 / 取消 / 确认放置”等当前任务流程按钮。

### Management

复杂城市系统进入**中央大型阻挡式 Management Space**，不是 Right Edge Flyout。

组成：

- Gameplay Top Shell 保留；
- 顶部 Control Tray 保留并负责一级系统切换；
- 世界画面作为压暗 / 轻模糊背景；
- 中央大型 Management Surface。

Management Surface **不重复一级管理导航**。一级系统切换只发生在 Gameplay Top Shell 的五个管理域；Management Surface 内部只允许当前系统自己的二级内容与局部 Tab。

当前一级映射暂时为：

- 城市 → 现有城市概况内容；
- 经济 → 现有 Finance 内容；
- 政策 → 现有 Policy 内容；
- 军事 → 现有 Military 内容；
- 宫殿 → 暂接现有 Governance 内容。

这是当前导航重构阶段的临时映射。户籍、商贸、治理等内容不会删除，后续在对应一级域内部重新组织。

进入 Management 后隐藏：

- World Utility Toolbar；
- Main Dock；
- GameplayOperationHints；
- Right Edge Flyout。

同一个一级管理入口是 **Surface Launcher**：第一次点击打开，处于打开状态时再次点击同一个入口关闭；点击其它一级管理入口则直接切换到目标 Management View。

关闭 Management 后回到 Normal Gameplay，不恢复此前已经退出的 Workspace / Tool。

设计原则：逻辑上阻挡世界操作，但视觉上不完全抹掉城市；玩家仍应感知自己是在管理当前城市，而不是进入独立 Web Dashboard。

### Workspace

用于浏览和选择内容，例如建筑目录。

组成：

- Gameplay Top Shell 两层；
- Workspace；
- Main Dock；
- World Utility Toolbar；
- 轻量 Operation Hints；
- 可选的 Camera / Weather Right Edge Flyout。

Workspace 是浏览内容的轻量工作空间，不需要为了打开建筑目录而把整个顶部控制系统撤走。玩家浏览建筑时仍可访问 Information Views、一级城市管理入口、Camera、Weather 和 Menu。

World Utility Toolbar 继续保留，因为网格、撤销 / 重做和其它世界级辅助能力属于全局编辑状态，不因为打开建筑目录而被重置。

Main Dock 中会打开 Workspace 的分类入口同样采用 Surface Launcher 语义。当前“建筑”第一次点击打开 Building Workspace，再次点击“建筑”关闭；Workspace 自己的关闭按钮也回到相同状态。

Camera / Weather Flyout 可以与 Workspace 共存。打开或关闭轻量 Flyout 不应顺带关闭 Building Workspace；打开 Workspace 也不应清理已经打开的 Camera / Weather Flyout。

### Tool

用于进入具体编辑工具，例如 Building Placement。

组成：

- Gameplay Top Shell 的 Persistent Status Row；
- ToolOverlay；
- Tool Bottom Dock；
- World Utility Toolbar；
- GameplayOperationHints。

进入 Tool 后隐藏：

- Control Tray；
- Main Dock；
- Information View Palette；
- Management Space。

进入 Tool 时关闭 Camera / Weather 等轻量 Flyout，让当前编辑任务获得明确的输入所有权。

ToolOverlay 与 Tool Bottom Dock 只拥有**当前任务专用**参数与动作；World Utility Toolbar 继续保留全局辅助能力。Tool 不得重新创建一份“网格吸附 / 网格显示 / 撤销 / 重做”的局部副本。

完成或取消 Building Placement 后返回 Building Workspace，而不是直接丢回 Normal Gameplay。

### Pause

Pause 是全局 UI Space，不是普通 Modal。

组成：

- Pause Menu；
- Pause Save；
- Pause Settings。

世界仍作为背景存在，但明显压暗，并可使用轻微 Blur。Pause 中隐藏 World Utility Toolbar 与 Operation Hints。

## 3. Gameplay Top Shell

Gameplay Top Shell 是 Gameplay 内持续存在的顶部控制结构。

### Persistent Status Row

第一层采用固定左右槽 + 真正居中的资源槽：

- 左：天气状态、季节 / 时间；
- 中：钱粮、人口、木材、石料；
- 右：暂停时间 / 正常速度 / 加速 / 高速。

资源必须保持几何居中，不能因为左右按钮数量变化而偏移。

时间速度全部使用图标，不常驻显示 `×1 / ×2 / ×4`。`speed` 支持 `0 / 1 / 2 / 4`，其中 `0` 是真正的模拟暂停状态，不等于打开 Pause Menu。

左侧天气只表达当前天气状态，不承担 Weather Control 的入口职责。

### Control Tray

在 Normal Gameplay、Management Space 与 Workspace 中显示，按以下顺序分组：

`Information Views │ 城市 / 经济 / 政策 / 军事 / 宫殿 │ Camera / Weather / Menu`

语义固定为：

- 左：观察城市；
- 中：管理城市；
- 右：场景与系统入口。

正式视觉规则：

- 一级入口常驻只显示图标；
- Hover 约 280～400 ms 后显示中文 Tooltip；
- Selected 使用弱暖金 Tone 与底部细金线；
- 图标入口保留明确 ARIA Label；
- 第二层整体收窄并居中挂接在 Persistent Status Row 下方；
- 两层在视觉上允许轻微重叠，避免半透明边框产生亮色接缝。

点击复杂管理系统直接进入对应 Management Space；再次点击当前同一管理入口关闭。若已经处于其它 Management View，则直接切换，不经过内部重复一级菜单。

图层入口打开轻量 Information View Palette，再次点击图层入口关闭 Palette；选择具体地图图层后 Palette 自动收起。

Camera 与 Weather 是互斥 Flyout；点击当前已经打开的入口再次关闭，点击另一个则直接切换。

Menu 打开 Pause Space，不属于模拟速度的“暂停时间”。

## 4. World Utility Toolbar

World Utility Toolbar 是右下角的**全局世界编辑工具条**，与 Operation Hints 空间相邻但结构独立。

### 职责

它承载跨建造分类、跨 Workspace / Tool 都可能继续使用的辅助能力，例如：

- 地图解锁；
- 区域编辑；
- 地形编辑；
- 配色工具；
- 网格吸附；
- 网格显示；
- 范围复制；
- 范围移动；
- 撤销；
- 重做。

规则：

- Normal Gameplay、Workspace、Tool 中保留；
- Management 与 Pause 中隐藏；
- 位置固定在右下，Operation Hints 位于其上方，两者不合并为一个 Surface；
- 默认只显示图标，解释进入 Tooltip；
- 网格吸附 / 网格显示是 GameplayUiState 中的全局 Toggle，进入或退出 Building Placement 不重置；
- Undo / Redo 继续使用同一份全局历史状态；
- 不放当前任务的“完成 / 取消 / 确认”按钮；
- 不放“道路 / 建筑 / 园林”等建造分类，分类仍属于 Main Dock；
- Tool 若有专用旋转、体量、屋顶、提交等行为，由 Tool Bottom Dock 自己负责。

## 5. Main Dock

Main Dock 负责“玩家要进入哪一种建造 / 内容分类”，与 World Utility Toolbar 的“如何操作世界”严格分离。

当前分类：

- 全部；
- 道路；
- 桥梁；
- 运河；
- 城墙；
- 围墙；
- 建筑；
- 装饰。

Normal Gameplay 与 Workspace 保留 Main Dock；进入 Tool / Management 时隐藏。

普通分类本身属于 Selector；当某个分类同时拥有一个 Workspace Surface（当前为“建筑”）时，该分类入口同时承担 Launcher 语义：重复点击当前已经展开的 Workspace 分类应关闭该 Workspace，而不是重新打开一遍。

## 6. Right Edge Flyout

Right Edge Flyout 只服务轻量、场景上下文相关的快速工具。

当前：

- Camera；
- Weather Control。

规则：

- 入口位于 Gameplay Top Shell 的 Control Tray 右侧；
- Camera / Weather 互斥；
- 点击当前已经打开的同一入口再次关闭；
- Flyout 从屏幕右侧滑入，并直接贴合屏幕顶部与右侧，不额外保留一块无意义空白；
- Normal Gameplay 与 Workspace 中可以使用；
- Workspace 与 Flyout 可以共存；
- 打开 Management / Tool / Pause 时关闭 Flyout；
- 不承载财政、政策、军务等复杂管理系统；
- Flyout 是辅助空间，不升级为大型统计 / 管理 Workspace。

判断标准：如果一个功能需要多级 Tab、较宽表格、趋势图、多个管理参数或后续明显会扩展，应进入 Management / Workspace，而不是继续加宽 Flyout。

## 7. Information Views

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

- 从 Gameplay Top Shell Control Tray 最左侧的图层图标打开轻量 Palette；
- 图层入口再次点击关闭 Palette；
- Palette 在顶部导航下方出现，不再占用左侧独立工具栏；
- 选择图层后 Palette 收起，主要变化发生在世界地图；
- 打开 Management 时回到默认地图视图；
- Workspace 不强制清除当前地图视图；
- 后续数据表现应逐步贴合街区、建筑、道路和覆盖范围，不长期停留在纯装饰性全屏渐变。

## 8. Global Management Space

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

## 9. Gameplay 状态模型

`src/app/ui-state.ts` 是 Gameplay UI 状态的集中入口。

核心空间状态：

- `workspace`
- `tool`
- `flyout`
- `management`
- `mapView`
- `mapPanelOpen`
- `paused`
- `pauseView`

其它运行状态：

- `speed`：`0 / 1 / 2 / 4`；
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

### 交互语义分类

不要把所有 Button 都实现成同一种 Toggle。

**Surface Launcher**：拥有一个可见 Surface，同入口再次点击关闭，同组其它入口切换。例如 Management、Camera、Weather、Building Workspace、Information View Palette。

**Exclusive Selector**：表示当前模式，再次点击当前项保持选中。例如时间速度、Settings Tab、Segmented Control、Building Placement 模式。

**Toggle Setting**：明确 On / Off。例如 Grid Snap、Grid Visible、Settings Toggle。

**One-shot Action**：只执行一次，不保留 Active。例如 Undo / Redo、Restore、完成 / 取消。

Surface Launcher 的开关 / 互斥 / 共存关系应集中在 reducer，不由视觉组件各自维护业务布尔状态。`mapPanelOpen` 也因此进入 `GameplayUiState`，不再保存在 GameplayHUD 的局部 state。

### 重要互斥与共存

- 打开 Management → 关闭 Workspace / Tool / Flyout / Information Palette，MapView 回默认；
- Workspace → 保留 Top Control Tray、Main Dock、World Utility、Operation Hints，可与 Camera / Weather Flyout 共存；
- 打开 Camera / Weather → 两者互斥；关闭当前 Flyout 不影响 Workspace；
- 打开 Camera / Weather → 若当前是 Management，则退出 Management，并把 MapView 回默认；
- 进入 Tool → 退出 Workspace、关闭 Management / Flyout / Information Palette，MapView 回默认；
- 打开非默认 MapView → 关闭 Management 与 Flyout，但 Workspace 可以保留；
- Pause → Management / Flyout / MapView / Information Palette 清理为安全状态。

`gridSnap`、`gridVisible` 属于全局世界编辑设置。进入 Building Placement 时不得重置；Tool 只读取并使用当前值。

正式 Unity 实现必须继续以显式状态驱动 VisualElement 显隐，不通过当前 VisualTree 的存在与否反推业务状态。

## 10. Building Placement 模式

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

## 11. Building Placement Dock

Building Placement Dock 只保留当前放置任务专用控制：

- `平 / 填 / 高`；
- `位 / 层 / 顶 / 面`；
- 完成；
- 取消。

以下能力已经迁移到 World Utility Toolbar，不再在 Building Placement 内重复：

- 网格吸附；
- 网格显示；
- 撤销；
- 重做。

取消未提交放置不是危险操作，因此不使用强烈 Destructive Red。

## 12. GameplayOperationHints

OperationHints 位于右下，是轻量 Shortcut Rail，与 World Utility Toolbar 独立。

职责：

- 显示当前调整模式；
- 显示当前最重要输入；
- 显示旋转、反转、撤销、重做、取消等快捷键。

它不承担教程长文，也不承载可点击工具。World Utility Toolbar 位于其下方；两者对齐但不共享同一 Surface。

Management Space 中不显示 OperationHints，因为玩家此时不操作世界。

最终 Unity 实现中，按键文字应来自实际 Input System 绑定，并支持 Keyboard/Mouse 与 Gamepad 动态切换；Web 原型只使用代表性 Keycap。

## 13. Esc 优先级

原则：先关闭更局部的空间，再关闭更全局的空间，并且同一层级只允许一个明确的输入所有者。

Gameplay 顶层当前顺序：

1. 全局 Dialog / Safe Confirmation 先由 DialogSystem 捕获；
2. Camera / Weather Flyout；
3. Information View Palette；
4. Tool；
5. Workspace；
6. Management；
7. 非默认 Map View；
8. 没有局部 Surface 时打开 Pause Menu。

Workspace Search 等局部输入可以优先消费自己的第一次 Esc；外层不能在同一次按键里同时关闭 Workspace。

Pause 内部：

- Pause Save / Pause Settings → Esc 返回 Pause Menu；
- Pause Menu → Esc 恢复游戏。

新增 UI Space 时必须继续遵守这个优先级，不要让多个 `window.keydown` 监听器竞争同一个 Esc。Gameplay 的 Surface 栈优先集中在 `GameplayScreen`；Dialog 等真正更高优先级的系统使用明确的 capture-phase 输入所有权。

## 14. Review Scenario

`src/app/scenarios.ts` 提供确定性的 UI Bootstrap，用于视觉评审，不依赖人工点击流程。

Review Scenario 是测试入口，不是业务路由。

Gameplay 至少持续覆盖：

- Normal Gameplay 双层 Top Shell；
- 第一层资源几何居中；
- 第一层时间控制为纯图标的暂停 / 正常 / 加速 / 高速；
- 第二层顺序固定为 `图层 / 五个管理域 / Camera·Weather·Menu`；
- 两层保持约 2px 视觉重叠，避免亮色接缝；
- Camera / Weather Flyout 顶部直接贴屏幕边缘；
- Camera / Weather 入口重复点击可关闭；
- Building Workspace 保留 Top Control Tray；
- Building Workspace 可以与 Camera / Weather Flyout 共存；
- “建筑”入口重复点击可关闭 Building Workspace；
- 一级 Management 入口重复点击可关闭当前 Management Space；
- Information Views 入口重复点击可关闭 Palette；
- Esc 按 Flyout → Workspace 等由局部到全局的顺序退栈；
- Normal Gameplay 右下存在 World Utility Toolbar，且不与 Main Dock / Operation Hints 重叠；
- 网格吸附状态从 Gameplay 进入 Building Placement 后保持；
- Workspace 保留 World Utility Toolbar；
- Building Placement 保留 World Utility Toolbar，并且不再出现局部 Grid / Undo 副本；
- Economy / Policy Management Space + 顶部一级导航；
- Management Surface 内不存在重复一级 Tab；
- Information Views 从第二层最左侧图层入口展开；
- Building Placement 只保留顶部 Persistent Status Row，且 Main Dock / Control Tray 隐藏。
