# Design Workspace 设计规范

Design Workspace 是 Gameplay `设计` 模式下八个一级建造入口共享的内容浏览框架。它解决“选择具体构件 / 类型”的问题，不负责具体放置、绘制或编辑规则；真正的建造输入由进入后的 Tool 接管。

## 入口与空间关系

Main Dock 设计模式固定为：

`道路 / 桥梁 / 建筑 / 台基 / 城墙 / 围墙 / 装饰 / 树木`

玩家点击任一分类后：

```text
Main Dock Design Category
→ Design Workspace
→ 选择具体 Item
→ 对应 Tool
```

Design Workspace 是同一个 Workspace Surface，不为八类内容复制八套组件。切换设计分类时直接替换 Workspace Definition 与内容，不先关闭再打开另一块面板。

再次点击当前 Main Dock 分类、Workspace 关闭按钮或 Esc，均关闭 Workspace 并清空 `dockCategory`。Main Dock 在玩家没有明确选择分类时保持无 Selected，不保存或恢复“设计模式上一次分类”。

## 通用框架

统一结构：

`Header + Primary Rail + Context Filter + Search + Content Grid + Pager`

- Header：当前一级设计类别标题与关闭按钮；
- Primary Rail：当前类别的主要子类型；
- Context Filter：与 Primary Rail 正交的第二筛选维度；
- Search：只过滤当前 Definition 的内容；
- Content Grid：每组 `4 × 2 = 8` 项；
- Pager：无数字的点 / 短线分页，可用滚轮整组切换。

Web 原型由 `DesignWorkspace.tsx` 实现；类别、筛选和 Item 数据由 `design-workspace-model.ts` 提供。最终 Unity UI Toolkit 应保持相同的配置驱动结构，不为道路、桥梁、城墙等复制完整 UXML 树。

## Primary Rail

Primary Rail 当前为约 `146px` 的稳定槽位，必须支持 **最多 6 个汉字**的常规分类名称，例如：

- `高倾角城墙`
- `水生植物`
- `街市摆件`
- `全部桥梁`

常规名称不换行；超过 6 个汉字才允许截断并通过 Tooltip 提供完整名称。

每页最多显示 6 个 Rail 项；超过 6 个时使用左侧组分页 / 滚轮切换。Rail 内的 `全部道路 / 全部建筑 / 全部城墙` 等是正常 Filter，不做特殊入口样式。

打开 Workspace 后，Primary Rail 与 Context Filter 都必须有一个真实有效的筛选状态。默认 `全部…` / `全部` 可以 Selected，因为它们描述当前内容集合；这和 Main Dock “没有明确选择就不 Selected”是不同语义。

## 当前八类原型配置

- 道路：全部道路 / 土路 / 砂石路 / 石板路 / 砖路 / 官道；宽度作为 Context Filter；
- 桥梁：全部桥梁 / 木桥 / 石桥 / 拱桥 / 廊桥 / 浮桥；尺寸 / 宽水面作为 Context Filter；
- 建筑：沿用建筑形制 Rail，屋顶形制作为 Context Filter；
- 台基：全部台基 / 单层台基 / 多层台基 / 须弥座 / 月台 / 踏道；层数 / 宫殿 / 寺观作为 Context Filter；
- 城墙：全部城墙 / 夯土城墙 / 包砖城墙 / 高倾角城墙 / 城门段 / 马面角楼；地形作为 Context Filter；
- 围墙：全部围墙 / 夯土围墙 / 青砖围墙 / 白墙 / 花墙 / 院门；高度 / 园林作为 Context Filter；
- 装饰：全部装饰 / 灯具 / 旗幡 / 石雕 / 水景 / 街市摆件；场景用途作为 Context Filter；
- 树木：全部树木 / 乔木 / 果树 / 竹类 / 花木 / 水生植物；季相 / 水岸作为 Context Filter。

这些内容是信息架构与交互原型数据，具体历史类型、造价和游戏参数后续由各系统正式数据替换；共享 Workspace 框架不因数据替换而变化。

## Item Card

所有设计类别共用一种 Item Card 结构：

```text
1:1 预览图 | 名称
           | 一条关键属性
```

Content Grid 固定为 `4 列 × 2 行`，每页最多显示 8 项。1920×1080 基线下 Design Workspace 约 `1240 × 370px`，用于让名称保持主要识别信息，同时保留足够的资产视觉预览。

Item Card 约 `255 × 100px`。预览窗口从此前 `84 × 84px` 收到约 `64 × 64px`，严格保持 `1:1`，避免图片压缩文字区域。道路、桥梁、城墙等长条对象仍使用方形预览窗口，但可以通过单独的缩略图构图、`background-position` 或正式资产渲染方式适配，不改变 Card 外部比例。

名称是主要识别信息，1080p 基线约 `14.2px / 600`，允许最多两行，不因为少数长名称重新缩小字号；关键属性约 `10.5px`，保持明显次级层级。默认阅读顺序应为：**名称 / 预览图 → 属性**。

Asset Card 是 **Action Button**，不是 Toggle / Exclusive Selector。它只有 `Default / Hover / Focus / Pressed / Disabled` 等按钮状态，不保留点击后的 Selected，也不使用 `aria-pressed`。点击 Item 表示“使用这个资产 / 进入对应 Tool”；如果某类 Tool 尚未接入，也不为了视觉反馈伪造持续 Selected 状态。

Card 默认 Surface 很轻，不形成八块明显矩形；Hover / Focus 使用弱 Tone 与细暖金状态，Pressed 只短暂反馈点击。

建筑 Item 当前已经连接 Building Placement Tool。其它设计类别现阶段先完成 Workspace 浏览、筛选和显式选择；后续道路、桥梁、台基、城墙、围墙、装饰、树木分别连接自己的 Tool，不在 Workspace 内混入 Tool 参数。

## Asset Inspector

Design Workspace 的资产详情使用共享 **Asset Inspector**，不是每个系统各做一套 Building / Road / Wall Tooltip。

### 职责

Asset Inspector 用于在玩家点击前提供决策摘要，例如：

- 尺寸 / 占地 / 宽度；
- 价格 / 造价；
- 材料或关键规格；
- 一段简短说明；
- 后续需要时可插入图片、Tag、警告或其它只读内容块。

它不承担确认、购买、放置、参数修改等操作，内部不放可点击按钮。

### 尺寸与 Composition

Inspector 外层是**无业务内容的自适应容器**。实际宽高由 Children 的自然布局结果决定；框架只提供边界：

- `min-width: 240px`；
- `max-width: 380px`；
- `min-height: 90px`；
- `max-height: 320px`；
- Gameplay Safe Edge：`16px`；
- 与 Anchor 的默认间距：`12px`。

因此以后可以自由组合：

`Title / Image / Fact Grid / Cost / Tags / Description / Warning`

不应为了新增图片或多行文字去改 Inspector 外层固定尺寸。内容超过 Max Height 时应优先做信息降级 / 截断，而不是在 Hover Inspector 内加入需要鼠标操作的 ScrollView。

### 触发与生命周期

- 鼠标第一次 Hover Asset Button：约 `280ms` 后显示；
- Inspector 已打开后，在相邻资产间移动：立即替换内容，不重复首个延迟；
- 鼠标离开资产区域后短延迟关闭；
- Keyboard / Gamepad Focus：立即显示同一 Inspector；
- Focus / Hover 离开资产按钮后关闭；
- Inspector 本身 `pointer-events: none`，Unity 对应 `pickingMode = Ignore`，不能抢走资产按钮的 Hover；
- Card 点击进入 Tool 前立即清理 Inspector。

### 定位

Inspector 根据内容实际尺寸与 Anchor 位置动态定位，优先顺序为：右侧 → 左侧 → 下方 → 上方，并在最终位置 Clamp 到 Gameplay 的 `16px` Safe Edge。

Web Prototype 使用 Card `getBoundingClientRect()`、Inspector 自身实际尺寸和 Gameplay 逻辑画布缩放换算；最终 Unity UI Toolkit 使用 `worldBound / resolvedStyle` 完成同类定位。不要假定 Inspector 固定宽高后硬编码一个位置。

### 当前实现

共享框架位于：

- `src/ui/asset-inspector/AssetInspector.tsx`：生命周期、Hover / Focus Controller、Intrinsic Size 定位；
- `src/ui/asset-inspector/asset-inspector.css`：Surface 与 Min / Max Size Contract。

`DesignWorkspace` 只是其中一个 Consumer：它负责提供当前资产的标题、尺寸、原型造价、规格和说明 Children。以后 Blueprint、单位、物品等如果需要同类只读 Hover 详情，应优先复用这一框架。

## 状态与交互不变量

- `workspace='design'` 表示共享设计目录空间；
- `dockMode='design'` 且 `dockCategory` 为八类之一时才能拥有 Design Workspace；
- 同一个 Main Dock 分类再次点击 → Workspace 关闭、`dockCategory=null`；
- A 分类打开时点击 B 分类 → 保持一个 Workspace Surface，直接切换 Definition；
- 关闭 Workspace → Main Dock 分类取消 Selected；
- Asset Card 本身不保存 Selected；
- Hover / Focus Inspector 只提供只读详情，不改变 GameplayUiState；
- Camera / Weather 可以和 Design Workspace 共存；
- Top Shell、World Utility Toolbar、Main Dock 在 Design Workspace 中继续保留；
- 进入具体 Tool 后 Main Dock / Control Tray 按 Tool 空间规则隐藏；
- Building Placement 完成或取消后返回 `设计 → 建筑` Design Workspace，因为此时玩家仍处于明确的建筑任务上下文。

## 代码所有权

- `src/workspace/DesignWorkspace.tsx`：共享 Workspace 行为、资产按钮与当前 Design Inspector 内容组合；
- `src/workspace/design-workspace-model.ts`：八类 Definition 与原型数据；
- `src/workspace/design-workspace.css`：Design Workspace 专属 Rail / Asset Button 视觉；
- `src/ui/asset-inspector/AssetInspector.tsx`：跨系统 Asset Inspector 框架；
- `src/ui/asset-inspector/asset-inspector.css`：Asset Inspector 通用视觉与尺寸边界；
- `src/workspace.css`：Workspace 通用壳、Header、筛选、分页等基础样式；
- `src/app/ui-state.ts`：Workspace / Main Dock 全局状态与切换逻辑；
- `src/gameplay/GameplayScreen.tsx`：把当前 Definition 接入 Gameplay 空间。

不要重新创建 `RoadWorkspace / BridgeWorkspace / CityWallWorkspace` 等仅复制相同壳层的组件；也不要为每种资产复制独立 Inspector 外壳。只有当某一类别出现真正不同的稳定交互结构时，才抽取类别专用子组件。
