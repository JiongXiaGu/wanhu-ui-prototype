# UI 空间与状态架构

## 1. 顶层 Screen

原型当前顶层 Screen：

- `menu`
- `newGame`
- `load`
- `settings`
- `loading`
- `gameplay`

顶层 Screen 由 `src/App.tsx` 管理。

## 2. Gameplay 空间优先级

Gameplay 不使用大量彼此独立的 Modal 叠加，而是按任务职责切换明确的 UI Space。

当前优先级：

1. Pause
2. Tool
3. Workspace
4. Management
5. Gameplay

空间判断：

```text
paused = true             → Pause
else tool != none         → Tool
else workspace != none    → Workspace
else management != none   → Management
else                      → Gameplay
```

除了这些主 Space，还存在几个稳定的 HUD 槽位：

- 左上：Navigation HUD；
- 顶部中央：Gameplay Top Shell；
- 右上：低存在感 System Menu，以及未来 Notification / Objective Stack；
- 左下：Context Surface；
- 中下：Main Dock / Workspace / Tool Dock；
- 右下：Operation Hints + World Utility Toolbar。

Gameplay 外围 HUD 默认遵守 `16px` Safe Edge；同级 Surface 常用间距为 `12px`。这些稳定几何 Token 由 `src/gameplay/gameplay-hud-layout.css` 集中维护。

## 3. Normal Gameplay

默认经营状态显示：

- 左上 Navigation HUD；
- Gameplay Top Shell 两层；
- 右上独立 System Menu；
- Main Dock；
- World Utility Toolbar；
- Operation Hints；
- 按需出现的左下 Context Surface。

世界画面始终是视觉主体；常驻 HUD 只承担持续状态、主入口和必要世界工具。

## 4. Gameplay Top Shell

Gameplay Top Shell 位于屏幕顶部中央，是状态与一级入口的核心控制岛。

### 4.1 Persistent Status Row

第一层约 `940 × 56px`，采用固定左右槽 + 几何居中的资源槽：

- 左：当前天气状态 + 季节 / 时间；
- 中：钱粮 / 人口 / 木材 / 石料；
- 右：模拟时间速度。

资源槽必须保持屏幕几何中心，不能因为左右内容数量变化而偏移。

时间速度使用纯图标：

- 暂停时间；
- 正常速度；
- 加速；
- 高速。

`speed` 支持 `0 / 1 / 2 / 4`，其中 `0` 是模拟暂停，不等于打开 Pause Menu。

左侧天气只表达当前世界状态，不承担 Weather Control 的入口职责。

### 4.2 Control Tray

第二层是挂接在 Persistent Status Row 下方的紧凑纯图标托盘，当前约 `400 × 38px`。

正式顺序：

`Camera / Weather │ 城市 / 经济 / 政策 / 军事 / 宫殿 │ Information Views`

语义固定为：

- 左：场景观察 / 调整；
- 中：城市管理；
- 右：数据观察。

Menu 不再属于 Control Tray。

视觉与交互规则：

- 一级入口常驻只显示图标；
- Hover 约 280～400ms 后显示 Tooltip；
- Selected 使用弱暖金 Tone 与细金线；
- 每个图标入口保留明确 ARIA Label；
- Top Shell 两层轻微重叠约 2px，避免浏览器缩放 / DPR 产生亮色接缝；
- Control Tray 在 Normal Gameplay、Workspace、Management 中保留；
- Tool 中隐藏 Control Tray，只保留 Persistent Status Row。

五个一级管理域当前为：

`城市 / 经济 / 政策 / 军事 / 宫殿`

当前内容映射仍处于重构期：城市→City、经济→Finance、政策→Policy、军事→Military、宫殿→Governance；旧户籍、商贸、治理等内容后续进入对应一级域内部重新组织。

## 5. 左上 Navigation HUD

左上角保留独立 Navigation HUD 槽位，不把导航信息塞进 Top Shell。

当前 Web Prototype 使用低存在感城市缩略图 + 指南针 / 北向提示验证构图；正式游戏可替换为真正的城市小地图、简化道路水系图或其它导航 RenderTexture。

规则：

- 位置遵守 `16px` 左 / 上 Safe Edge；
- 默认存在感低于 Top Shell；
- 不承载复杂管理参数；
- Normal Gameplay、Workspace、Tool 中可保留；
- Management / Pause 等重空间中隐藏；
- 指南针可以整合进小地图，不需要与小地图重复占据两个独立大 Surface。

## 6. 右上 System / Notification Zone

右上不再放 Camera / Weather 大面板。

当前仅常驻一个独立的低存在感 **System Menu Button**：

- 约 `46 × 46px`；
- `16px` 右 / 上 Safe Edge；
- 半透明深墨 Surface；
- 默认较弱，Hover 才明显提亮；
- 点击进入 Pause Menu。

该按钮与“暂停模拟时间”严格区分：模拟暂停属于 Top Shell 时间控制；System Menu 打开 Save / Settings / Main Menu 等全局系统空间。

右上剩余区域明确预留给未来：

- Notification；
- 待处理事件；
- 当前目标 / 教学目标；
- 城市异常提醒；
- 建筑完成 / 居民事件等被动信息。

原则是：**左侧负责玩家主动查看的上下文，右侧负责游戏主动推送的信息。**

## 7. Context Surface（左下上下文面板）

旧 `RightEdgeFlyout` 已退出运行结构。Camera / Weather 统一进入左下 **Context Surface** 槽位。

当前 Consumer：

- Camera；
- Weather Control。

未来可继续复用同一位置规范：

- Selection Inspector：选中建筑 / 居民 / 道路 / 地块详情；
- 其它场景级只读或轻参数面板。

### 7.1 几何规则

- 左侧距屏幕 `16px`；
- 底部位于 Main Dock 上方约 `12px`；
- Camera 当前约 `360px` 宽；
- Weather 当前约 `400px` 宽；
- 高度由内容决定，但最大约 `50vh`；
- 内容超过可用高度时由面板内部滚动，而不是继续侵入顶部 / 底部其它稳定槽位。

### 7.2 互斥规则

Camera / Weather 是同一个 Context Surface 的不同内容，彼此互斥：

- 点击当前入口 → 关闭；
- 点击另一个入口 → 原位替换内容。

Context Surface 与 Design Workspace 当前也互斥：

```text
Workspace 打开
→ 点击 Camera / Weather
→ Workspace 关闭并清空 Main Dock 当前分类
→ Context Surface 打开
```

反向同理：

```text
Context Surface 打开
→ 点击 Main Dock 设计分类
→ Context Surface 关闭
→ Design Workspace 打开
```

这是为了避免同屏出现两块竞争下半屏的内容面板。

Tool / Management / Pause 打开时 Context Surface 关闭。

### 7.3 Selection Inspector 预留

未来选中世界中的建筑 / 居民等对象时，推荐采用双层表达：

- 世界 Anchor：只显示名称、状态图标、警告等极轻信息，用于指向“选中了谁”；
- 左下 Selection Inspector：承载完整详情与动作。

Selection Inspector 是否在 Design Workspace 打开时压缩成 Compact Summary，待实现对象选择系统时再验证；不要现在用 Camera / Weather 的互斥规则机械限制未来 Selection Inspector。

## 8. Information Views

Information Views 属于“观察城市”，不是“管理城市”。

当前：

- 默认；
- 地价；
- 人口；
- 商业；
- 道路；
- 治安；
- 水利。

规则：

- 入口位于 Control Tray **最右侧**；
- 再次点击图层入口关闭 Palette；
- Palette 从右侧图层按钮下方展开并与该侧对齐；
- 选择具体图层后 Palette 自动收起；
- 打开 Palette 时关闭 Camera / Weather Context Surface；
- 主要信息表现发生在世界地图，不将 Palette 扩展成复杂管理面板；
- 后续地图效果应逐步贴合真实街区、建筑、道路、服务覆盖等游戏数据。

## 9. Management Space

复杂系统进入中央大型阻挡式 Management Space，不进入 Context Surface。

组成：

- Gameplay Top Shell 两层保留；
- 世界作为压暗 / 轻模糊背景；
- 中央大型 Management Surface；
- 右上 System Menu 仍可作为全局系统入口。

进入 Management 后隐藏：

- Navigation HUD；
- Main Dock；
- World Utility Toolbar；
- Operation Hints；
- Context Surface。

Management Surface 不重复顶部五个一级管理入口，只允许当前系统自己的二级内容。

同一个一级入口是 Surface Launcher：

- 第一次点击打开；
- 再次点击当前入口关闭；
- 已经打开其他 Management View 时点击新入口直接切换。

关闭后回 Normal Gameplay，不恢复此前已经退出的 Workspace / Tool / Context Surface。

## 10. Workspace

Workspace 用于浏览和选择具体内容，例如 Design Workspace。

组成：

- Navigation HUD；
- Gameplay Top Shell 两层；
- Workspace；
- Main Dock；
- World Utility Toolbar；
- Operation Hints；
- 右上 System Menu。

Design Workspace 打开时仍可访问 Camera / Weather 入口，但点击它们会先关闭 Workspace，再打开左下 Context Surface。

Workspace 不是重管理空间，因此世界仍保持可见，不做 Management 那样的大面积遮挡。

## 11. Main Dock

Main Dock 负责“要建造 / 浏览什么”，World Utility Toolbar 负责“如何辅助编辑世界”，两者职责严格分离。

Main Dock 当前结构：

`模式选择器 + 当前模式分类带`

### 设计模式

`道路 / 桥梁 / 建筑 / 台基 / 城墙 / 围墙 / 装饰 / 树木`

八类全部进入同一个配置驱动 Design Workspace。

### 蓝图模式

`全部 / 民居 / 商业 / 工坊 / 管理 / 科学 / 信仰 / 军事 / 宫殿`

Blueprint Workspace 尚未实现，不复制空壳占位。

状态原则：

- `dockMode` 默认 `design`；
- `dockCategory` 默认 `null`；
- 没有玩家明确点击时不强制 Selected；
- 切换设计 / 蓝图清空 `dockCategory`；
- 不分别记忆两个模式上一次分类；
- 同一个设计分类再次点击关闭 Workspace 并清空分类；
- 已打开 Design Workspace 时点击另一设计分类，直接替换同一个 Workspace 的 Definition。

Normal Gameplay / Workspace 保留 Main Dock；Tool / Management / Pause 隐藏。

## 12. Design Workspace

正式细则见 `Documentation/Design Workspace设计规范.md`。

稳定结构：

`Header + Primary Rail + Context Filter + Search + 4×2 Content Grid + Pager`

关键不变量：

- 八类设计内容共享一个 Workspace 壳；
- Primary Rail 约 `146px`，第一项统一显示 `所有`，每组最多 7 项；
- Content Grid 每页 8 项；
- Asset Card 是 Action Button，不是 Toggle；
- Hover / Focus 详情使用共享 Asset Inspector；
- Asset Inspector 是独立浮层，与这里的屏幕级 Context Surface 不是同一个概念。

## 13. Tool

Tool 用于具体编辑任务，例如 Building Placement。

组成：

- Navigation HUD；
- Persistent Status Row；
- ToolOverlay；
- Tool Bottom Dock；
- World Utility Toolbar；
- Operation Hints；
- 右上 System Menu。

进入 Tool 后隐藏：

- Control Tray；
- Main Dock；
- Workspace；
- Context Surface；
- Information View Palette；
- Management Space。

ToolOverlay / Tool Dock 只拥有当前任务专用参数和动作；全局 Grid / Undo 等继续由 World Utility Toolbar 提供。

Building Placement 完成或取消后返回 `设计 → 建筑` Design Workspace，因为玩家仍处于明确的建筑任务上下文。

## 14. World Utility Toolbar

右下角 World Utility Toolbar 是跨分类、跨 Workspace / Tool 的全局世界辅助工具条。

当前包含：

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

- Normal Gameplay / Workspace / Tool 中保留；
- Management / Pause 中隐藏；
- 位于右下 `16px` Safe Edge；
- Operation Hints 位于其上方约 `12px`；
- 不放完成 / 取消 / 确认放置等任务流程动作；
- 不放建造分类；
- `gridSnap` / `gridVisible` 是全局状态，进入 Tool 不重置。

## 15. GameplayOperationHints

Operation Hints 是右下轻量输入说明，不是工具栏。

职责：

- 显示当前重要输入；
- 显示当前 Tool / Adjustment 上下文；
- 显示旋转、反转、撤销、取消等代表性快捷键。

它不承担教程长文，也不承载可点击工具。

最终 Unity 中快捷键文字应来自 New Input System 实际绑定，并随 Keyboard/Mouse / Gamepad 动态切换。

## 16. Pause

Pause 是全局 UI Space，不是普通 Modal。

入口：

- 屏幕右上独立 System Menu；
- 无局部 Surface 时按 Esc。

Pause 内包括：

- Pause Menu；
- Pause Save；
- Pause Settings。

世界仍作为压暗 / Blur 背景存在。Pause 中隐藏 Navigation HUD、Context Surface、Main Dock、World Utility Toolbar、Operation Hints 和 System Menu 自身。

## 17. Gameplay 状态模型

`src/app/ui-state.ts` 是 Gameplay UI 状态的集中入口。

核心空间状态：

- `workspace`
- `tool`
- `contextPanel`
- `management`
- `mapView`
- `mapPanelOpen`
- `paused`
- `pauseView`

Main Dock：

- `dockMode`
- `dockCategory`

其它状态：

- `speed`
- `terrainMode`
- `adjustmentMode`
- `gridSnap`
- `gridVisible`
- `canUndo`
- `canRedo`

正式 Unity 实现继续使用显式状态驱动 VisualElement 显隐；不要通过当前 VisualTree 是否存在反推业务状态。

### 17.1 交互语义分类

**Surface Launcher**：拥有一个可见 Surface；同入口再次点击关闭，同组入口切换。例如 Management、Camera、Weather、Design Workspace、Information View Palette。

**Exclusive Selector**：表示当前模式；再次点击当前项保持选中。例如时间速度、Settings Tab、Building Placement 模式。

**Toggle Setting**：明确 On / Off，例如 Grid Snap / Grid Visible。

**One-shot Action**：执行一次，不保留 Active，例如 Asset Card、Undo / Redo、完成 / 取消。

Surface Launcher 的互斥 / 共存必须集中在 reducer，不由视觉组件各自维护互相冲突的业务 Boolean。

### 17.2 当前关键互斥

- 打开 Design Workspace → 关闭 Context Surface；
- 打开 Camera / Weather Context Surface → 关闭 Design Workspace，并清空对应 Main Dock 分类；
- Camera / Weather 彼此互斥；
- 打开 Management → 关闭 Workspace / Tool / Context Surface / Information Palette，MapView 回默认；
- 打开 Information Palette / 非默认 MapView → 关闭 Context Surface；
- 进入 Tool → 关闭 Workspace / Management / Context Surface / Information Palette，MapView 回默认；
- Pause → 清理 Management / Context Surface / Information Palette / MapView 等局部状态。

## 18. Building Placement

### 地形模式

- `平`：balanced-earthwork；
- `填`：fill-only；
- `高`：manual-elevation。

### 调整对象

- `位`：position；
- `层`：massing；
- `顶`：roof；
- `面`：facade，当前 Disabled / 未完成。

中央 Tool Dock 只保留：

`平 / 填 / 高 │ 位 / 层 / 顶 / 面 │ 完成 / 取消`

网格吸附 / 网格显示 / Undo / Redo 不在 Tool Dock 重复，继续使用 World Utility Toolbar。

## 19. Esc 优先级

原则：先退出更局部的 Surface，再退出更全局的 Space。

Gameplay 当前顺序：

1. Dialog / Safe Confirmation 由 DialogSystem capture-phase 处理；
2. Context Surface（Camera / Weather）；
3. Information View Palette；
4. Tool；
5. Workspace；
6. Management；
7. 非默认 Map View；
8. 没有局部 Surface 时打开 Pause Menu。

Workspace Search 等更局部输入允许先消费自己的第一次 Esc；外层不能在同一次按键里顺带关闭 Workspace。

Pause 内部：

- Pause Save / Settings → Esc 返回 Pause Menu；
- Pause Menu → Esc 恢复游戏。

新增 UI Space 时继续集中输入所有权，不要新增多个彼此竞争的 `window.keydown`。

## 20. Archive / Settings

Archive 与 Settings 属于顶层全局管理空间，不属于 Gameplay Context Surface。

Archive：

`Game Group → Save Timeline → Save Preview`

Settings 在 Main Menu 与 Pause 复用同一组件与视觉系统，分类：

`显示 / 图形 / 音频 / 操作 / 游戏`

普通设置即时生效 / 保存；危险显示设置使用 Safe Confirmation。

## 21. Review Scenario

`src/app/scenarios.ts` 提供确定性的 Review Bootstrap，只用于测试，不是业务路由。

Gameplay Visual Review 至少覆盖：

- Normal Gameplay：左上 Navigation HUD、双层 Top Shell、右上 System Menu、Main Dock、右下 World Utility；
- Top Row 资源保持几何居中；
- Control Tray 顺序固定为 `Camera / Weather │ 五个管理域 │ Information Views`；
- System Menu 独立于 Control Tray，并位于 16px 右上 Safe Edge；
- Camera / Weather 共用左下 Context Surface；
- Context Surface 高度不超过约半屏，并位于 Main Dock 上方；
- Camera / Weather 重复点击关闭，彼此切换；
- Context Surface 与 Design Workspace 双向互斥；
- Design Workspace 保留 Top Control Tray / Navigation HUD / Main Dock / World Utility；
- Information Views 从 Control Tray 最右侧打开并右对齐；
- Management 保留 Top Shell，隐藏 Navigation HUD / Main Dock / Context Surface / World Utility；
- Tool 只保留 Persistent Status Row，保留 Navigation HUD / System Menu / World Utility，并隐藏 Control Tray / Main Dock / Context Surface；
- 全局 Grid 状态进入 Building Placement 后保持；
- Esc 按 Context Surface → Palette → Tool → Workspace → Management → Map View → Pause 的局部到全局顺序退栈。
