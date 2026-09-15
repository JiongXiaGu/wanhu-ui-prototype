# Gameplay HUD 视觉基线

Gameplay HUD 的目标是让世界画面始终成为主体，同时让不同操作模块看起来属于同一套系统。

## 空间职责

- Gameplay Top Shell：城市持续状态、城市管理入口、信息视图入口、场景工具与时间控制；
- Main Dock：回答“我要建造什么”，只承载建造 / 内容分类；
- World Utility Toolbar：回答“我要如何编辑世界”，承载跨分类、跨 Tool 仍然成立的世界级工具；
- Operation Hints：只显示当前输入提示，不承担可点击操作；
- Tool Bottom Dock：只负责当前 Tool 的任务专用模式、参数、完成与取消。

World Utility Toolbar 与 Operation Hints 在空间上右对齐，但保持独立 Surface；进入 Building Placement 时不复制 Grid / Undo 等世界级工具。

## 1920×1080 外边距基线

Gameplay 外围 HUD 使用统一安全边距：

- 上 / 左 / 右 / 下：`16px`；
- 相邻独立 HUD 模块常用间距：`12px`；
- Main Dock 与 World Utility Toolbar 在 1920×1080 下保持约 `16px` 的水平间隔；
- Camera / Weather Right Edge Flyout 也使用 `16px` 顶部与右侧安全边距，不贴屏幕边缘。

Main Dock、Top Shell、Management Space 等核心操作结构跟随视觉中心；World Utility Toolbar、Operation Hints、Right Edge Flyout 等外围工具跟随 Viewport 边缘。超宽屏中外围工具允许移动到更外侧，不强制贴近视觉中心。

代码中的外围几何与视觉 Token 集中由 `src/gameplay/gameplay-hud-layout.css` 提供；组件 CSS 只维护自己内部排版、Surface 和状态，不允许多个文件重复拥有同一组件的外部几何。

## 视觉 Token

Gameplay HUD 统一使用同一套现代东方深墨 Surface，不再让顶部、底部、Workspace、World Utility 分别使用不同的黑灰材质。

### Radius

- `R1 = 10px`：小按钮、局部输入、Tooltip；
- `R2 = 14px`：Top Status、Main Dock、World Utility、Operation Hints、Tool Bottom Dock；
- `R3 = 18px`：Workspace、Camera / Weather Flyout、Building Placement Context Panel 等大 Surface。

同一级别 Surface 必须使用同一圆角家族；避免继续出现大量 `1px / 2px` 方角组件。

### Surface

- Primary：Top Status Row、Main Dock、大 Context Surface；
- Secondary：Top Control Tray、World Utility、Tool Bottom Dock；
- Tertiary：Operation Hints。

Primary 最实，Secondary 稍轻，Tertiary 最透明。边框统一使用低对比暖灰纸色；阴影用于悬浮关系，不制造厚重卡片感。

### 色彩与状态

- 主 Surface：深墨青 / 深青黑；
- 主文字：浅纸色；
- 次级文字与默认 Icon：低饱和灰绿；
- Selected / Toggle On / Focus：暖金；
- Hover：只轻微提亮背景与 Icon；
- Disabled：降低亮度与对比，不额外增加说明。

暖金只用于状态，不作为普通装饰边框。

## Gameplay Top Shell

Top Shell 保持两层，但职责明确分开。

第一层 **Status Row**：

- 左：天气状态 + 季节 / 时间；
- 中：钱粮 / 人口 / 木材 / 石料，必须保持几何居中；
- 右：模拟时间控制。

时间控制全部使用图标，不显示 `×1 / ×2 / ×4` 文本：

- Pause：暂停模拟；
- Play：正常速度；
- Chevrons：加速；
- Fast Forward：高速。

`speed` 仍使用 `0 / 1 / 2 / 4` 状态，其中 `0` 是模拟暂停，不等同于打开 Pause Menu。

第二层 **Control Tray** 按 `观察 / 管理 / 场景工具` 排列：

- 左：信息视图 / 图层；
- 中：城市 / 经济 / 政策 / 军事 / 宫殿；
- 右：相机 / 天气控制 / 菜单。

一级管理导航和场景入口继续使用纯图标，名称进入 Hover Tooltip / ARIA Label。现有 Management Space 内容暂不因一级分类缩并而大改；当前“经济”继续进入 Finance，“宫殿”暂接现有 Governance 内容，后续再重构内部信息架构。

### Top Shell 接缝

两层 Top Shell 不能使用两条明亮边框直接相接。Control Tray 必须轻微向上覆盖 Status Row，当前约 `2px`，并取消自身顶边框；连接处不得出现浏览器缩放或 DPR 变化时可见的亮白 seam。

当前 1920×1080 参考比例：

- Status Row：约 `940 × 56px`；
- Control Tray：约 `480 × 38px`；
- Control Tray 保持明显更窄、更紧凑，不作为第二条大导航栏。

### Weather Control

左侧 `晴 / 秋 · 14:30` 只表示当前世界状态，不作为控制入口。

Control Tray 右侧天气图标是玩家的天气控制入口，点击后打开 `Weather Right Edge Flyout`。天气控制继续属于场景级轻量工具，不进入 Management Space。

## Bottom HUD

Main Dock、World Utility Toolbar 与 Operation Hints 不合并成一个整屏底栏，但必须明显属于同一套设计系统。

### Main Dock

- 1920×1080 核心宽度约 `940px`；
- 高度约 `76px`；
- 使用 Primary Surface 与 `R2 = 14px`；
- 分类按钮圆角更小，只在 Hover / Selected 时出现局部 Tone；
- Selected 使用暖金 Icon / 文本与细金线，不使用整块高饱和金底。

### World Utility Toolbar

- 位于右下并跟随 Viewport 物理边缘；
- 高度约 `56px`；
- 使用 Secondary Surface 与 `R2 = 14px`；
- 当前分为世界编辑 / 编辑辅助 / 历史三组；
- 网格吸附 / 网格显示是 Toggle，启用时持续保留弱暖金状态；撤销 / 重做等 Action 不保留选中态。

### Operation Hints

Operation Hints 是 Tertiary Surface：

- 使用同样 `R2 = 14px`；
- 比 World Utility 更透明、更弱；
- 不与 World Utility 合并；
- 只显示当前输入提示，不承担教程长文或点击操作。

## Workspace

Building Workspace 是 Main Dock 上方展开的内容浏览 Surface，不是另一套独立美术系统。

- 使用 `R3 = 18px`；
- Surface 与 Top Status / Main Dock 同色系；
- Header、Primary Rail、Context Filter 只用弱分隔线建立层级；
- Building Card 使用中等圆角与轻 Tone，不恢复层层 Card 边框；
- 缩略图使用较小圆角，和外层 Card 有清楚层级；
- Workspace 与 Main Dock 保持 `12px` 垂直间距。

## Right Edge Flyout

Camera / Weather 是场景级轻量 Context Surface：

- 距顶部与右侧均 `16px`；
- 使用 `R3 = 18px`；
- 不贴边、不做抽屉式硬切边；
- Surface 与 Top Status 同一色系；
- 内部 Segment、参数按钮、数值框使用 R1 小圆角；
- Flyout 打开后仍允许保留 Workspace，并遵守统一 Surface Launcher Toggle 逻辑。

## Building Placement

Building Placement Context Panel 与任务 Dock 使用同一视觉家族：

- Context Panel 使用 Primary Surface + `R3 = 18px`；
- Tool Bottom Dock 使用 Secondary Surface + `R2 = 14px`；
- 内部参数仍保持扁平 Section，不重新堆 Card；
- 网格 / Undo 等全局能力继续由 World Utility Toolbar 持有。
