# Gameplay HUD 视觉基线

本规范记录 Gameplay HUD 的当前稳定构图与视觉层级。Palette / 材质母版以 `Documentation/Wanhu 烟墨熟铜视觉材质规范.md` 为权威来源。

## 1. 目标

- 世界画面始终是视觉主体；
- Top HUD、Context、Workspace、Dock、Utility 看起来属于同一套烟墨熟铜系统；
- 不用不同 Hue 区分模块；
- 角色身份通过 Surface Tier、Density、Elevation、信息密度和状态语法表达。

## 2. 1920×1080 稳定槽位

- 左上：Compass HUD；
- 顶部中央：Top Shell；
- 右上：System Menu / Notification Zone；
- 左下：Context / Tool Parameter / 未来 Selection Inspector；
- 中下：Main Dock / Workspace / Placement Action Bar；
- 右下：Operation Hints + World Utility。

外围 Safe Edge 默认 `16px`；同级独立 Surface 常用约 `12px` 间距。

## 3. Top Shell

### Persistent Status Row

左：

- 当前天气；
- 季节；
- 游戏时间。

中：固定四个 Icon + Number Quick Entry：

- 人口 → 城市；
- 金钱 → 经济；
- 贸易值 → 库存；
- 军事值 → 军事。

顶部四项只负责摘要与快捷打开，不拥有 Selected / Active。

右：模拟速度图标 `0 / 1 / 2 / 4`。模拟暂停不等于 Pause Menu。

### Control Tray

正式顺序：

`Camera / Weather │ 城市 / 经济 / 库存 / 政策 / 军事 │ Information Views`

- 只显示图标；
- Tooltip 提供名称；
- Control Tray 才拥有 Management Selected；
- Control Tray 的 Active 状态线使用真实子元素 / VisualElement，不依赖 `::before` / `::after`；
- Tool 中隐藏 Control Tray，只保留 Persistent Status Row。

Top Shell 使用偏轻的 Smoked Graphite；Persistent Status 比 Control Tray 更稳定，但两层不换 Hue。

## 4. Compass / System Zone

Compass：

- 约 `76×76px`；
- 中文东南西北；
- 北向熟铜；
- 不做复杂风水罗盘纹样。

System Menu：

- Ambient Surface；
- 默认低存在感；
- Hover 才提亮；
- 与模拟暂停严格区分。

## 5. 左下 Context Surface

Environment / Camera 共用左下槽位：

- 左 / 下 `16px`；
- Camera 约 `360px`；
- Environment 约 `400px`；
- 最大高度约 `720px`；
- 内容超高只滚 Body；
- Header 使用 Bare Icon + Title；
- 与 Workspace 当前互斥。

### 视觉身份

Context 必须直接继承烟墨熟铜母版：

- 与 Workspace 同 Hue；
- 视觉重量更轻，但不能透到被世界植被染绿；
- Header 比 Body 轻微提亮；
- Body 保证参数稳定阅读；
- Section 只用间距和弱 Rule，不堆 Card；
- Weather Preset 默认不形成一排持续 Box；
- 大量 Slider 保持中性，熟铜集中在 Current / Focus / Dragging。

左下 Context 的目标不是“小型绿色玻璃”，而是：

> **Workspace 同材质家族中的轻量仪器面板。**

## 6. Main Dock / Bottom Command

三类 Toolbar：

- Main Dock = L；
- Placement Action Bar = M；
- World Utility = S。

共享 Hue、Edge、Hover / Active、Divider、Tooltip；尺寸、Density、Shadow 建立层级。

### Main Dock

模式：

- 设计；
- 蓝图。

设计分类：

`道路 / 桥梁 / 建筑 / 台基 / 城墙 / 围墙 / 装饰 / 树木`

默认允许没有分类 Selected。只有玩家明确进入某分类 / Workspace 时才显示当前状态。

Main Dock 使用稳定 Work Surface；Active 使用弱熟铜 Tone + 状态线，不整块高饱和填金。

### World Utility

Ambient Surface，右下常驻；Toggle On 才持续显示熟铜状态，Undo / Redo 等 One-shot Action 不保留 Selected。

### Operation Hints

Ambient / Tertiary 视觉重量；只显示输入提示，不承担可点击动作。

## 7. Design Workspace

Workspace 是当前 Work Surface 视觉锚点：

- 约 `1240×370px`；
- Header 更轻；
- Body 更稳；
- Smoked Graphite / Paper / Brass；
- Asset Card 默认轻量；
- 不做黑色桌面窗口或绿色玻璃。

详细规则见 `Documentation/Workspace World-first Glass视觉规范.md`。

## 8. Placement Tool

稳定职责：

- 左：Placement Context / 参数；
- 中下：Placement Action Bar；
- 右下：World Utility。

Building / Road / 后续 Wall / Bridge 都进入同一 Placement Context 骨架。

Placement Context 与 Environment 属于同一 Context / Work 材质家族，不为不同工具复制面板皮肤。

## 9. Surface 层级关系

- Top / Utility：Ambient；
- Environment / Camera：Context；
- Workspace / Main Dock / Placement 主控：Work；
- Management / Pause：Blocking；
- Inspector / Popover：Elevated。

所有层级来自同一 Smoked Graphite Hue。

## 10. 昼夜 Review

重要 Gameplay 视觉修改至少检查：

- 白天 Gameplay；
- 白天 Context；
- 白天 Workspace；
- 夜晚 Gameplay；
- 夜晚 Context；
- 夜晚 Workspace。

重点确认：

- Surface 是否仍属同一家族；
- Environment 是否被植被染绿；
- Workspace 是否稳定但不过黑；
- 熟铜是否只出现在状态与主操作；
- Paper / Muted 是否保持稳定读取。
