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

Camera / Environment 已迁移到左下共享 Context Surface。Design Workspace 与该 Context Surface 当前互斥：

- Workspace 打开时点击 Camera / Environment → 关闭 Workspace、清空 `dockCategory`、打开 Context Surface；
- Context Surface 打开时点击设计分类 → 关闭 Context Surface、打开 Design Workspace。

这样下半屏只保留一个主要内容 Surface，避免环境 / 相机参数面板和资产目录同时争抢空间。

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

### 1080p 几何基线

当前 1920×1080 基线：

- Workspace 约 `1240 × 280px`；
- Header 约 `50px`；
- Primary Rail 约 `146px` 宽；
- Rail 每项约 `29px` 高，每组最多 7 项；
- Context Filter 约 `34px` 高；
- Content Grid 固定 4 列 × 2 行；
- Asset Item 固定约 `64px` 高；
- Preview 固定 `64 × 64px`，与 Item 左边和上下边完全贴合；
- Bottom Pager 约 `18px` 高，并始终保留视觉锚点。

Workspace 的目标是紧凑资产浏览器，不是大型图库面板。缩略图只负责快速识别，资产名称与关键属性负责主要阅读。

## Primary Rail

Primary Rail 当前约 `146px`，必须支持最多 **6 个汉字**的常规分类名称，例如：

- `高倾角城墙`
- `水生植物`
- `街市摆件`

常规名称不换行；超过 6 个汉字才允许截断，并通过 Tooltip 提供完整名称。

每组最多显示 **7 个 Rail 项**；超过 7 个时使用左侧组分页 / 滚轮切换。第一项通用筛选统一显示 **`所有`**，不再拼接 `全部道路 / 全部桥梁 / 全部建筑` 等业务文案，减少重复并方便本地化。

打开 Workspace 后，Primary Rail 与 Context Filter 都必须有一个真实有效筛选状态。默认 `所有` / `全部` 可以 Selected，因为它们描述当前内容集合；这和 Main Dock “没有明确选择就不 Selected”是不同语义。

Rail Pager 使用固定视觉槽位，并与 Category Selected 使用不同视觉语义：

- Category Selected：继续使用熟铜色短竖线，表达“当前选择”；
- Rail Pager：只使用中性灰圆点，表达“当前分类页”，不使用熟铜长竖线；
- 只有一组分类时不隐藏槽位，显示一个低对比中性灰小圆点；
- 多组分类时当前页约 `5×5px` 中性亮灰点，其它页约 `3×3px` 暗灰点；
- Pager 与 Selected 保持现有几何位置，不为了规避重叠额外拆左右 Lane；
- Pager Marker 与 Rail Item Selection Line 之间必须保留至少约 `12px` 的可见水平间隔；当前共享 Catalog 基线通过 `PrimaryRailContent padding-left:22px` + `Pager width:8px` 达成；
- Shared Catalog 必须显式重置历史 `.workspace-body aside button` 的 `flex / padding`，避免旧全局 CSS 把 Pager 再次推向 Selected Line；
- 切换分类或筛选不能因为 Pager 整体出现 / 消失而改变 Rail 内部几何；
- Pager Marker 使用真实 DOM / VisualElement；最终 UI Toolkit 由 C# 更新 Marker 数量与 Active 状态。

## 当前八类原型配置

- 道路：所有 / 土路 / 砂石路 / 石板路 / 砖路 / 官道；宽度作为 Context Filter；
- 桥梁：所有 / 木桥 / 石桥 / 拱桥 / 廊桥 / 浮桥；尺寸 / 宽水面作为 Context Filter；
- 建筑：所有 / 塔 / 殿 / 楼阁 / 屋舍 / 门 / 廊榭 / 亭 / 牌坊 / 特殊；屋顶形制作为 Context Filter；
- 台基：所有 / 单层台基 / 多层台基 / 须弥座 / 月台 / 踏道；层数 / 宫殿 / 寺观作为 Context Filter；
- 城墙：所有 / 夯土城墙 / 包砖城墙 / 高倾角城墙 / 城门段 / 马面角楼；地形作为 Context Filter；
- 围墙：所有 / 夯土围墙 / 青砖围墙 / 白墙 / 花墙 / 院门；高度 / 园林作为 Context Filter；
- 装饰：所有 / 灯具 / 旗幡 / 石雕 / 水景 / 街市摆件；场景用途作为 Context Filter；
- 树木：所有 / 乔木 / 果树 / 竹类 / 花木 / 水生植物；季相 / 水岸作为 Context Filter。

这些内容是信息架构与交互原型数据，具体历史类型、造价和游戏参数后续由各系统正式数据替换；共享 Workspace 框架不因数据替换而变化。

## Item Card

所有设计类别共用一种 Item Card：

```text
64×64 Preview | 名称
              | 一条关键属性
```

Content Grid 固定为 `4 列 × 2 行`，每页最多显示 8 项。

Asset Item 高度固定约 `64px`，Preview 同样固定为 `64 × 64px`。Preview 完全占据 Item 左侧高度，并与 Item 左边、上边、下边贴合；Item 不再额外为图片保留上下 Padding。这样图片是识别辅助，而文字仍然是主要信息。

Preview 严格保持 `1:1`。道路、桥梁、城墙等长条对象仍使用方形预览窗口，但可以通过独立缩略图构图、`background-position` 或正式资产渲染方式适配，不改变 Item 外部比例。

名称是主要识别信息，1080p 基线约 `14.2px / 600`，允许最多两行；关键属性约 `10.5px`。默认阅读顺序是：**名称 → Preview → 属性**。属性文字必须低于名称一级，但不能灰到需要费力辨认。

Asset Card 是 **Action Button**，不是 Toggle / Exclusive Selector。它只有 `Default / Hover / Focus / Pressed / Disabled` 等按钮状态，不保留点击后的 Selected，也不使用 `aria-pressed`。点击 Item 表示“使用这个资产 / 进入对应 Tool”；如果某类 Tool 尚未接入，也不为了视觉反馈伪造持续 Selected。

状态视觉：

- Default：近乎无框，只保留极弱 Surface；
- Hover：Surface 和文字轻微提亮，Preview 恢复少量亮度 / 饱和度；不位移、不缩放、不出现暖金状态线；
- Keyboard / Gamepad Focus：才允许显示克制的 `2px` 暖金短线；
- Pressed：短暂使用极弱暖金 Tone，不形成持续 Selected。

建筑 Item 当前已经连接 Building Placement Tool。其它设计类别先完成 Workspace 浏览、筛选和显式选择；后续道路、桥梁、台基、城墙、围墙、装饰、树木分别连接自己的 Tool，不在 Workspace 内混入 Tool 参数。

## Content Pager

Content Pager 永远保留稳定视觉槽位，不因为筛选结果只有一页而整个消失：

- 只有一页时显示低对比短横线 `━`，不可交互；
- 多页时显示“当前长横线 + 其它点”；
- 筛选、搜索导致页数变化时，Pager 的中心位置、高度和所在行不变化，只改变 Marker 数量与状态；
- Marker 切换可以做约 `140–180ms` 的宽度、Opacity、Tone 过渡；
- 当前页才允许使用旧金，其它页保持中性灰；
- 最终 UI Toolkit 使用持久 Pager 容器和复用 Marker VisualElement，不通过重新创建整块 Footer 改变布局。

Pager 是浏览状态指示器，不是新的 Footer Surface。

## Rich Hover Card

Design Workspace 的资产详情使用全局 **Rich Hover Card**，不是每个系统各做一套 Building / Road / Wall Tooltip。

### 职责

Rich Hover Card 用于玩家点击前的决策摘要，例如：

- 尺寸 / 占地 / 宽度；
- 价格 / 造价；
- 材料或关键规格；
- 一段简短说明；
- 后续需要时可插入图片、Tag、警告或其它只读内容块。

它不承担确认、购买、放置、参数修改等操作，内部不放可点击按钮。

注意：**Rich Hover Card 与 Gameplay 左下 Context Surface 是两种不同层级。** Hover Card 是绑定 Asset Card 的短时悬浮详情；Context Surface 是屏幕级稳定槽位，用于 Camera / Environment / Selection Inspector。

### 尺寸与 Composition

Hover Card 外层是无业务状态的自适应容器。实际宽高由内容自然布局决定；框架只提供边界：

- `min-width: 240px`；
- `max-width: 380px`；
- `min-height: 90px`；
- `max-height: 340px`；
- Gameplay Safe Edge：`16px`；
- Anchor Gap：`12px`。

因此以后可以自由组合：

`Title / Image / Fact Grid / Cost / Tags / Description / Warning`

不应为了新增图片或多行文字去改 Hover Card 外层固定尺寸。内容超过 Max Height 时优先信息降级 / 截断，而不是在 Hover Card 内加入需要鼠标操作的 ScrollView。

### 视觉层级

Hover Card 必须明显高于 Workspace Surface，而不是与 Workspace 混成一块：

- 背景更深、更实；
- 使用清晰但克制的浅纸细边；
- 阴影比 Workspace 内部 Item 更明显；
- 顶部可使用极弱暖金内高光；
- 不使用粗金边、箭头或仿古装饰。

### 触发与生命周期

- 第一次 Hover Asset Button：约 `460ms` 后显示；
- Hover Card 已打开后在相邻资产间移动：立即替换内容；
- 离开资产区域后短延迟关闭；
- Keyboard / Gamepad Focus：立即显示；
- Focus / Hover 离开 Asset Button 后关闭；
- Hover Card `pointer-events:none`，Unity 对应 `pickingMode=Ignore`；
- Card 点击进入 Tool 前立即清理 Hover。

### 定位

Hover Card 根据内容实际尺寸与 Anchor 位置动态定位。Catalog Workspace 固定显示在当前 Asset Card 上方，并以 Card 水平中心对齐；只做 Safe Edge / Clamp，不再在右 / 左 / 上 / 下之间跳转。允许覆盖相邻目录条目，但不得覆盖当前 Anchor。

Web Prototype 使用 `getBoundingClientRect()` 与 Inspector 实际尺寸；最终 Unity UI Toolkit 使用 `worldBound / resolvedStyle` 完成同类定位。不要假定固定宽高后硬编码位置。

### 当前实现

共享框架：

- `src/ui/hover/HoverOverlay.tsx`：Hover / Focus 生命周期、Delay、热切换、全局 Overlay Host；
- `src/ui/hover/hover-placement.ts`：Anchor / Safe Edge / HUD 避让的纯几何定位；
- `src/ui/hover/hover-overlay.css`：Tooltip / Hover Card 的共享 Surface 与尺寸边界。

`DesignWorkspace` 只是 Consumer：提供当前资产的 `HoverCardDefinition`，包含标题、尺寸、原型造价、规格和说明；不自行计算位置。以后 Blueprint、单位、物品等需要同类只读 Hover 详情时继续复用同一框架。

## 状态与交互不变量

- `workspace='design'` 表示共享设计目录空间；
- `dockMode='design'` 且 `dockCategory` 为八类之一时才能拥有 Design Workspace；
- 同一个 Main Dock 分类再次点击 → Workspace 关闭、`dockCategory=null`；
- A 分类打开时点击 B 分类 → 保持一个 Workspace Surface，直接切换 Definition；
- 关闭 Workspace → Main Dock 分类取消 Selected；
- Asset Card 不保存 Selected；
- Hover / Focus Rich Hover Card 只提供只读详情，不改变 GameplayUiState；
- 打开 Camera / Environment Context Surface → Design Workspace 关闭并清空分类；
- 打开 Design Workspace → Camera / Environment Context Surface 关闭；
- Top Shell、Navigation HUD、World Utility Toolbar、Main Dock 在 Design Workspace 中继续保留；
- 进入具体 Tool 后 Main Dock / Control Tray 按 Tool 空间规则隐藏；
- Building Placement 完成或取消后返回 `设计 → 建筑` Design Workspace。

## 代码所有权

- `src/workspace/DesignWorkspace.tsx`：共享 Workspace 行为、Asset Button 与 HoverCardDefinition 内容组合；
- `src/workspace/design-workspace-model.ts`：八类 Definition 与原型数据；
- `src/workspace.css`：Workspace 通用壳与基础样式；
- `src/workspace/workspace-catalog.css`：共享 `workspace--catalog` 几何、Primary Rail、Rail Pager、Context Filter、4×2 Content 与稳定 Pager 槽位；
- `src/workspace/design-workspace.css`：只保留 Design Workspace Host 宽度等业务特例；
- `src/workspace/workspace-world-first-glass.css`：Workspace World-first Glass 材质与状态视觉；
- `src/ui/hover/HoverOverlay.tsx` / `hover-placement.ts` / `hover-overlay.css`：跨系统 Tooltip / Rich Hover Card 框架；
- `src/app/ui-state.ts`：Workspace / Main Dock / Context Surface 全局状态与切换逻辑；
- `src/gameplay/GameplayScreen.tsx`：把当前 Definition 接入 Gameplay 空间。

不要重新创建 `RoadWorkspace / BridgeWorkspace / CityWallWorkspace` 等只复制相同壳层的组件；也不要为每种资产复制独立 Hover Card 外壳。只有某一类别出现真正不同的稳定交互结构时，才抽取类别专用子组件。


## Shared WorkspaceItemCard

Design Workspace 的资产卡现在是共享 Workspace Card 母版，不再由建筑 / 材质各自复制视觉样式。

Web Prototype：

- .workspace-item-card：共享 Card Surface / Hover / Focus / Pressed；
- .workspace-item-card__preview：可选 Preview 槽；资产目录使用固定 64×64 / 1:1，业务没有真实图像时允许省略；
- .workspace-item-card__copy：共享文本布局；
- .workspace-item-card__title / __meta：共享 Typography；
- .workspace-item-card__state-line：真实元素，供 Focus / Current 等语义状态使用；
- design-item-card 只保留业务识别与兼容选择器，不再拥有独立 Card 皮肤；
- MaterialSchemeWorkspace 同样消费这一母版，但当前不使用 Preview 槽，只在 Meta 行使用细 BaseColor Accent；

Unity UI Toolkit：

- 建议建立共享 WorkspaceItemCard UXML / USS；
- Building / Road / Wall / Material Scheme 等目录通过 Modifier 或绑定数据表达业务差异；
- 不复制一套“看起来类似”的 USS。
