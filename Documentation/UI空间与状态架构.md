# UI 空间与状态架构

## 1. 顶层 Screen

当前顶层 Screen：

- `menu`
- `newGame`
- `load`
- `settings`
- `loading`
- `gameplay`

由 `src/App.tsx` 管理。

## 2. Gameplay 主空间

Gameplay 不使用大量彼此独立的 Modal 叠加，而是按任务职责切换明确 Space。

优先级：

1. Pause
2. Tool
3. Workspace
4. Management
5. Gameplay

判断：

```text
paused = true             → Pause
else tool != none         → Tool
else workspace != none    → Workspace
else management != none   → Management
else                      → Gameplay
```

稳定 HUD 槽位：

- 左上：Compass HUD；
- 顶部中央：Gameplay Top Shell；
- 右上：System Menu + 未来 Notification / Objective；
- 左下：Context Surface；
- 中下：Main Dock / Workspace / Tool Dock；
- 右下：Operation Hints + Context Utility Toolbar；World / Building / Road / Terrain 根据当前 Tool Context 换内容。

外围 HUD 默认 `16px` Safe Edge；同级 Surface 常用约 `12px` 间距。几何 Token 由 `src/gameplay/gameplay-hud-layout.css` 集中维护。

## 3. Normal Gameplay

默认经营状态显示：

- Compass HUD；
- Top Shell 两层；
- 右上 System Menu；
- Main Dock；
- World Utility Toolbar；
- Operation Hints；
- 按需出现的 Context Surface。

世界画面始终是视觉主体。

## 4. Gameplay Top Shell

Top Shell 是持续状态与一级入口的核心控制岛。

### 4.1 Persistent Status Row

第一层采用固定左右槽 + 几何居中的 Metric Shortcut 槽。

左：

- 当前天气；
- 季节；
- 游戏时间。

中：四个 **Icon + Number** Metric Shortcut：

```text
人口     → 城市
金钱     → 经济
贸易值   → 库存
军事值   → 军事
```

规则：

- 四项只承担摘要与快捷打开；
- 不显示常驻名称文字；
- 不维护 `is-active` / Selected；
- 不和下方主导航同步绘制第二份 Selected；
- Hover Tooltip 解释指标和跳转目标；
- 点击后打开目标 Management；
- 真正的当前 Management 状态只由第二层 Control Tray 表达；
- 四项整体保持屏幕几何中心。

右：模拟时间速度纯图标：

- `0` 暂停模拟；
- `1` 正常；
- `2` 加速；
- `4` 高速。

模拟暂停不等于 Pause Menu。

天气只表达当前世界状态，不是 Weather Control 入口。

### 4.2 Control Tray

第二层是真正的一级 Launcher：

```text
Camera / Weather │ 城市 / 经济 / 库存 / 政策 / 军事 │ Information Views
```

语义：

- 左：场景观察 / 调整；
- 中：城市管理主导航；
- 右：世界数据观察。

规则：

- 常驻只显示图标；
- Hover 约 280–400ms 后显示 Tooltip；
- 当前入口使用弱熟铜 Tone / 状态线；
- 每个入口保留明确 ARIA Label；
- Top Shell 两层轻微重叠，避免缩放 / DPR 白色接缝；
- Gameplay / Workspace / Management 中保留；
- Tool 中隐藏 Control Tray，只保留第一层状态行。

### 4.3 Top Metric Shortcut 与主导航的关系

Top Metric Shortcut 是 **Quick Entry**，Control Tray 是 **Primary Navigation**。

因此不建立额外同步状态：

```text
点击顶部“人口”
→ management = city
→ 城市 Management 打开
→ Control Tray 的“城市”自然根据 management 状态显示 Selected
→ 顶部“人口”本身仍保持普通快捷项外观
```

同理适用于金钱 / 贸易值 / 军事值。

## 5. Compass HUD

左上只保留简化 Compass，不放常驻小地图。

基线：

- 约 `76×76px`；
- 16px 左 / 上 Safe Edge；
- 中文 `东 / 南 / 西 / 北`；
- 北向熟铜强调；
- 只包含方向环、刻度、南北轴和指针；
- 不复制真实风水罗盘、八卦和复杂纹样；
- `pointer-events:none`。

Gameplay / Workspace / Tool 中保留；Management / Pause 隐藏。

正式 Unity 绑定真实 Camera Heading。

## 6. 右上 System / Notification Zone

System Menu Button：

- 约 `46×46px`；
- 16px 右 / 上 Safe Edge；
- 低存在感 Graphite Glass；
- Hover 才明显提亮；
- 点击进入 Pause。

它与“暂停模拟时间”严格区分。

其余空间预留：

- Notification；
- Pending Event；
- Objective / Tutorial Goal；
- 城市异常；
- 建筑完成 / 居民事件等被动信息。

原则：**左侧负责玩家主动查看的上下文，右侧负责游戏主动推送的信息。**

## 7. Context Surface

Camera / Weather 统一进入左下 Context Surface。

当前 Consumer：

- Camera；
- Weather Control。

未来：

- Selection Inspector；
- 其它场景级轻参数 / 详情。

### 7.1 Geometry

- 左 `16px`；
- 底 `16px`；
- Camera 约 `360px`；
- Weather 约 `400px`；
- 最大高度 `720px`；
- 内容过高只滚 Body；
- Header 和屏幕锚点保持稳定。

Header 使用 Bare Icon + Title。Environment 图标略大于标题，但不绘制 Icon Chip / Button Surface。

### 7.2 Mutual Exclusion

Camera / Weather 同槽互斥：

- 当前入口再次点击 → Close；
- 点击另一入口 → 原位替换。

Context Surface 与 Design Workspace 当前互斥：

```text
Workspace → Camera / Weather
=> 关闭 Workspace + 清 Main Dock 分类
=> 打开 Context
```

反向同理。

Tool / Management / Pause 打开时关闭 Context Surface。

### 7.3 World Selection

World Selection 已进入 Gameplay 层，不是独立 Tool。第一批 Consumer 为 Building，UI State 只持有 kind + entityId。

- 世界 Anchor：Hover 中性纸灰，Selected 弱熟铜轮廓；Unity 正式改由 World Selection Renderer。
- 左下 Inspector：复用 LeftContextPanel，Selection 不重复 Header Close。
- 中下 Selection Action Bar：Building 为移动 / 配色(toggle) / 关闭。
- 左下 Inspector：除经营信息外显示当前配色方案与做旧程度；方案行与中下配色按钮共用入口。
- 右下 Context Utility：Building Selection 为聚焦 / Undo / Redo / 移除；移除必须二次确认。
- Top Shell / Control Tray 保留；Main Dock 在 Selection 存在时收起。
- 点击另一建筑原位 Rebind；空地 / Esc / 关闭统一 CLEAR_SELECTION。
- Camera / Weather / Management / Workspace 清 Selection；Pause 只隐藏 UI、不丢 Selection。
- Selection → Move 使用 Selection ToolOrigin，退出后恢复同一对象；建筑单独配色是 Selection 内 Workspace，不进入 Color Tool。

详见 `Documentation/世界对象选中系统.md`。

## 8. Information Views

Information Views 属于观察城市，不是管理城市。

当前：

- 默认；
- 地价；
- 人口；
- 商业；
- 道路；
- 治安；
- 水利。

规则：

- 入口位于 Control Tray 最右；
- 再次点击图层入口关闭 Palette；
- Palette 从入口下方展开；
- 选择具体图层后 Palette 自动收起；
- 打开 Palette 时关闭 Context Surface；
- 主要信息表现发生在世界地图。

## 9. Management Space

复杂系统进入中央 Blocking Management Space。

当前一级导航五域：

```text
城市 / 经济 / 库存 / 政策 / 军事
```

规则：

- Top Shell 两层保留；
- 世界压暗 / 弱 Blur 后仍可见；
- Compass / Main Dock / World Utility / Context / Operation Hints 隐藏；
- Control Tray 直接切换五个一级域；
- Management 内不重复一级 Tab；
- 当前入口再次点击、Close、Esc 都关闭 Management。

`ManagementView` 当前仍保留 `population / commerce / governance` 等内部细分类型；这些是原型内容与未来内部导航储备，不属于一级 Control Tray。

### 9.1 Inventory

库存负责物资存储与供应关系。

三个页面：

**总览**

- 城市 + 周边村庄资源汇总；
- 总量 / 城市 / 村庄 / 日变化 / 状态；
- 商货总值作为顶部“贸易值”的摘要。

**城市仓库**

- 仓库名 / 地区 / 用途；
- 容量 / 占用；
- 日入库 / 日出库；
- 实际储存资源和占比。

**周边村庄**

- 每个村庄只表达一种专项资源；
- 储量 / 日产；
- 距离 / 路线；
- 目标城市仓库；
- 运输状态。

## 10. Main Dock / Workspace

Main Dock = 模式选择器 + 当前模式分类带。

模式：

- 设计；
- 蓝图。

设计分类：

`道路 / 桥梁 / 建筑 / 台基 / 城墙 / 围墙 / 装饰 / 树木`

蓝图分类：

`全部 / 民居 / 商业 / 工坊 / 管理 / 科学 / 信仰 / 军事 / 宫殿`

状态：

- 默认 `dockMode=design`；
- `dockCategory=null`；
- 切换设计 / 蓝图清空分类；
- 不记忆两个模式上一次分类；
- 只有玩家明确点击分类才 Selected；
- 设计八类进入同一个 Design Workspace；
- 当前分类再次点击 / Close / Esc 关闭 Workspace 并清分类；
- Workspace 打开时点击另一个设计分类直接替换 Definition。

Blueprint Workspace 尚未实现。

### Design Workspace

共享结构：

`Header + Primary Rail + Context Filter + Search + 4×2 Content Grid + Pager`

稳定基线：

- Workspace 约 `1240×370`；
- Primary Rail 约 `146px`；
- 8 Item / Page；
- Preview `64×64`；
- Asset Card 是 Action Button；
- Header 更轻，Body 稳定阅读；
- 当前正式材质为烟熏 Graphite Glass；
- Header 为 Bare Icon + Title；
- 不恢复梁头、Icon Chip、完整白框或大面积纯黑窗口。

## 11. Placement Tool

稳定职责：

- 左：Tool Parameter Panel；
- 中下：Placement Action Bar；
- 右下：World Utility。

Building Placement：

- Intent：New / Move，共用一套 Placement；
- Terrain Mode：平衡挖填 / 只填不挖 / 手动标高；
- 固定位置参数：自由 / 道路吸附 / 网格、旋转、吸附距离；
- Quick Action：旋转 / 镜像；
- 完成 / 取消。

Road：

- 智能曲线 / 曲线 / 直线；
- 反转道路方向；
- 完成 / 取消。

Grid / Undo / Redo 不复制进 Tool。

## 11. Tool Space

Tool 高于 Workspace / Management，打开后：

- Top Persistent Status Row 保留；
- Control Tray 收起；
- Main Dock / Workspace 收起；
- 左下使用共享 Left Context Shell；
- 中下使用共享 ToolActionBar；
- 右下 Context Utility 根据 Tool Definition Rebind；
- Operation Hints 跟随 Tool / Mode；
- Compass 保留。

当前 Tool：

- Building Placement（New / Move）；
- Road Placement；
- Terrain Edit World Tool；
- Material Palette（内部含 Surface / Lighting / Scheme 三模式）。

### 11.1 ToolOrigin

每次进入 Tool 都记录来源：

- `gameplay`；
- `design-workspace(category)`。

退出时只恢复 Origin，不根据 Tool 类型猜目标空间。

### 11.2 Terrain Edit

Terrain Edit 从 World Utility 的“地形编辑”直接进入，不需要选择资产。

模式：

`抬高 / 降低 / 整平 / 平滑 / 坡面`

UI 只负责参数与状态；真实 Terrain Raycast / Brush / Height Modify / Undo Command / Brush Ring 属于 Unity World Tool Controller。

详细规范：`Documentation/地形编辑工具设计规范.md`。

### 11.3 Color Tool 三模式

右下 World Utility 的“配色工具”只进入一个顶层 Tool：

```text
Tool = color-tool
```

底部 ColorToolDock 在整个配色流程中保持挂载，并切换：

```text
surface  → 表面模式
lighting → 灯光模式
scheme   → 方案模式
```

其中 Scheme 模式允许“左侧 Building Appearance Panel + 中央 BuildingSchemeWorkspace”共存；Lighting 模式只显示 Scene Light Selection + 左侧 Light Panel，不创建 Workspace。

稳定规则：

- Lighting / Scheme 不是独立 World Tool；
- World Utility 不增加“灯光调整 / 方案模式”两个入口；
- 切换三个模式不退出 `color-tool`；
- 中央 Scheme Workspace 是配色工具内部 Work Surface，不写入顶层 `Workspace=design`；
- 正式设计见 `Documentation/灯光调整工具设计规范.md` 与 `Documentation/建筑配色方案模式设计规范.md`。

## 12. World Utility

普通主游玩状态使用两行 World Utility，仍然只有一个 Host：

```text
第一行：地图解锁 / 区域编辑 / 地形编辑 / 配色工具
第二行：网格吸附 / 网格显示 / 范围复制 / 范围移动 │ Undo / Redo │ 批量摧毁
```

第一行是世界模式 / 编辑入口，视觉层级略高；第二行是辅助与一次性动作。批量摧毁位于第二行最右，使用 Danger Tone，并作为 Toggle 进入批量摧毁模式。

批量摧毁 V1 只验证 UI 状态与输入互斥：激活后普通建筑 Selection 暂时退出，Operation Hints 改为框选 / 追加 / 排除 / 确认 / Esc；再次点击或 Esc 退出。Web Prototype 不伪造真实范围查询和 ECS 删除，正式 Unity 由 World Demolition Controller / Command History 处理框选、过滤、确认与建筑生命周期。

双层布局只用于普通 Gameplay。Workspace、Building Selection 与各 Tool 的 Context Utility 继续保持单行，以免所有状态都变厚。

Gameplay / Workspace / Tool 中保留 Utility Host；Management / Pause 隐藏。

## 13. Launcher 类型

### Surface Launcher

- Camera / Weather；
- Control Tray Management 主域；
- Main Dock 分类；
- Information Views Palette。

规则：当前入口再次点击关闭；同组入口切换；Close / Esc 与 Launcher 修改同一份 State。

### Quick Entry

顶部 Metric Shortcut：

- 只打开目标；
- 不 Toggle 自己的视觉 Selected；
- 不维护第二份导航状态。

### Exclusive Selector

- Speed；
- Main Dock 设计 / 蓝图；
- Placement Mode；
- Settings Tab。

### Toggle

- Grid Snap；
- Grid Visible。

### One-shot Action

- Asset Card；
- Undo / Redo；
- Quick Action；
- 完成 / 取消。

不要混用这些交互语义。

## 14. Esc 优先级

1. Dialog / Safe Confirmation；
2. Context Surface；
3. Information Views Palette；
4. Tool；
5. Workspace；
6. Management；
7. 非默认 Map View；
8. Pause Menu。

更局部输入控件（例如 Workspace Search）可先消费自己的第一次 Esc。

## 15. Surface / Skin 所有权

Gameplay 当前视觉基线：冷黛黑 / Paper / 熟铜。

后续正式所有权目标：

```text
Theme Tokens
→ Surface System
→ Control System
→ Component Geometry
```

Runtime 不应依赖历史 A/B/C Study。

Review Study 放在：

- `src/review/styles/glass-study.css`
- `src/review/styles/edge-elevation-study.css`

只由 Review URL 动态加载，不加入正常 Runtime cascade。

详见：`Documentation/代码审查/2026-09-17-统一皮肤与可维护性审查.md`。
