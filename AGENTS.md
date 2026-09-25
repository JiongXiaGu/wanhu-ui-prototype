# AGENTS.md

这是 AI / Agent 接手 wanhu-ui-prototype 的入口。先理解现有项目再修改；代码是具体实现权威，Documentation 记录意图、职责与契约。

## 开始工作前

核对远端最新 main，不用聊天记忆或旧 SHA 覆盖当前代码。依次阅读：

1. `Documentation/工作交接.md`
2. `Documentation/项目概览.md`
3. `Documentation/UI Toolkit视觉总规范.md`
4. 涉及配色 / Surface / Control / USS 迁移依据时读取 `Documentation/Web 配色与样式治理长期方案.md`
4. `Documentation/Wanhu 烟墨熟铜视觉材质规范.md`、`Documentation/UI设计原则.md`
5. `Documentation/UI空间与状态架构.md`
6. `Documentation/UI Toolkit落地规范.md`、`Documentation/Unity 6.6视觉能力与回退规范.md`
7. `Documentation/UI Motion System设计规范.md`
8. `Documentation/Unity UI Toolkit迁移准备清单.md`
9. `Documentation/UI图标资产管线.md`、`Documentation/UI Typography与Icon尺寸规范.md`
10. `Documentation/工具辨识与局部布局.md`、`Documentation/世界对象选中系统.md`
11. `Documentation/蓝图Workspace设计规范.md` 和当前任务对应组件规范与代码。

目标运行时为 Unity 6.6 + URP + UI Toolkit，但本仓库只治理 Web 视觉原型、设计权威和迁移依据，不在这里维护正式 Unity USS 镜像。Unity 制作 AI 负责后续 UXML / USS / Player 实现。引擎能力以 6.6 专项规范及官方对应版本为准；不使用历史“不能模糊 UI”限制新设计，也不把原生能力写成已经完成 Player 实测。

### Unity 6000.6.2f1 实测兼容基线

当前项目安装版本的实际验证结果优先于通用 Web CSS 能力和跨版本文档推断。设计与审查按以下顺序判断：**本项目 6000.6.2f1 实测 > 对应版本官方文档 > Web 浏览器实现**。

- Runtime 视觉不得新增对 `linear-gradient()` / `radial-gradient()` 的必要依赖；6000.6.2f1 当前会拒绝这类 USS 背景。Unity 6.7 已有渐变文档，但必须等项目升级并重新实测后才能解除限制。
- 不把 CSS `box-shadow`、Inset / Spread 或虚线边框当成 Unity 可逐字复刻能力；层级首先由纯色、透明度、实线边缘和结构承担。
- `brightness()` / `saturate()` 当前依赖项目自定义滤镜，不作为每个小控件可任意组合的基础状态语言。
- `backdrop-filter` 只允许共享 Surface 的静态能力；不动画 Blur Radius，不把它用于 World Space / 非 URP 的必要交互。
- USS 变量按最终语义 Token 使用；不依赖 `rgb(var(...))`、`rgba(var(...))` 或变量数学运算。
- 正式 Web Runtime 是 Unity 6000.6.2f1 最终美术的布局 / 视觉参考，不维护“Web 更华丽、Unity 再降级”的第二套正式美术。Web 与 Unity 可以使用不同实现技术，但正式视觉结果必须可等价复现。
- 对 Unity 6.6 无法直接等价实现的 Gradient / CSS box-shadow / browser-only filter，不继续作为正式 Web 美术增强长期保留；确有必要的效果应改为纯色 / Alpha / Border / 结构，或改用 Web / Unity 共用纹理、9-slice / Sprite / 共享绘制方案。
- 兼容审计进入视觉一致性阶段：先按文件与 Owner 输出存量并分类，再冻结“只减不增” Baseline；后续新增 UI 默认不得扩大 Unity 6.6 无法等价复现的正式视觉依赖。

## 取色与样式权威

必须读取 `src/main.tsx` 的实际导入顺序，再追踪 Theme / Surface / Controls / 组件前景的最终选择器、作用域与状态。`src/styles.css :root` 的旧 `--paper / --gold / --workspace` 不是当前共享 Palette；也不能假定旧变量已全部自动重定向。

精确共享值只由 `wanhu-theme-tokens.css` 持有，材质 Consumer 主要在 `wanhu-surface-system.css`；Hover、Card 等保留局部配方。Theme → Surface → Controls → Component 是职责图，不是实际 CSS 加载顺序。遇到晚加载的标题字号、局部前景与旧注释冲突，应追踪代码，不随意扩大成全局规则。

半透明底色、Body Overlay、Backdrop、Filter 与前景要一起检查。不能用截图单像素、Study 候选、fallback 字面值或未经测量的颜色面积比例充当正式 Token。当前各 Surface 属于同一家族，但不是完全相同 RGB 或 Alpha 阶梯。未实际看图时只报告源码审查。

## 已确认的设计边界

- 材质方案和建筑配色方案保留现有文字/颜色参数列表；不增加缩略图，不改视觉目录，不登记为美术欠缺。库存和管理页暂缓优化，包括资源图标与详情面板，未经批准不混入工具和设置任务。
- Catalog 共享外壳，不强迫 Card 相同比例。Design 是 4×2、64×64 Preview 的紧凑 Action 条目；Blueprint 是 4×1、4:3 的 Media Variant。Design / Blueprint Action Card 不保留点击后的假 Selected。
- MaterialPreset / BuildingScheme / Blueprint 的 System / Workshop / User 均保留常驻 `···`，菜单按来源和能力裁剪；收藏可用于只读条目，编辑/删除仅用于实际支持的用户资源。BuildingScheme 不虚构编辑管理能力。Media 来源左上、菜单右上，Compact 来源跟随内容行、菜单最右居中；已收藏名称后加低权重熟铜星，左 Rail 提供收藏快捷入口。
- Blueprint 左 Rail 保留规模全部/小型/中型/大型，收藏是独立快捷入口；顶部按全部/系统内置/创意工坊/我的蓝图筛选，右侧新建蓝图。创建经过 Photography → 4:3 Preview Editor → 我的蓝图。摄影复用 LeftContextPanel / ToolActionBar / GameplayOperationHints，只验证 Frame 与安全距离，不模拟拖动或滚轮世界运动；Preview 不拥有蓝图对象内容。真实 Blueprint Placement 未接入，不越界制作。
- Catalog Rich Hover 固定在当前 Card 上方并水平居中，Feature 不声明私有定位模式，不新增常驻详情栏。`workspace-edge` 仅保留框架级特殊能力，未来确有目录避让需求才显式启用。
- Rail Pager 当前页为 3×14 Paper White 竖线、其他页 3×3 灰点；Content 当前页为 14×3 Paper White 横线、其他页灰点；单页保留方向正确的白线。Pager 不使用熟铜，分类 Selected 使用熟铜，位置保持可辨间隔。
- Settings 只按任务调整内部表单，不推翻全屏空间、输入流程和公共样式。Dialog 与 Blueprint Editor 共用近黑高不透明 Backdrop / 烟墨 Modal Surface；Feature 不私有定义 Tint / Edge / Shadow / Blur。Pause 是独立 Screen Space，不机械套小型 Dialog 几何。
- 世界对象选中属于 Gameplay Selection，不新增 Selection Tool。当前 Building Consumer 的 UI State 只持有 kind + entityId，数据由 Presenter / ViewModel 提供。中下为移动/配色 Toggle/关闭，不提供单独编辑建筑；配色打开 Selection 内 BuildingSchemeWorkspace，不进入顶层 Color Tool。Building New / Move 共用 Placement intent=new|move。右下聚焦/Undo/Redo/移除；移除经过共享危险确认，实体生命周期交给游戏系统。
- Operation Hints 除 Pause 外始终恰好一个持久 Host，覆盖 World / Workspace / Selection / Tool / Context / Management；只按上下文重绑，Feature 不通过自己的状态条件删除 Host。

## 底部与顶部几何护栏

`src/tools/secondary-action-bar.css` 是二级中下栏几何与层级的唯一共享 Owner：总高 84px，带字按钮 76×64，24px 图标在上、11px 标签在下。Terrain / Color / Building Selection / 全部 Placement 复用同一 Primitive；Feature 不重定义排列、宽高或 Screen Anchor。右下 Utility 仍为纯图标。

Main Dock 固定 880×84，设计/蓝图切换不跳宽高。Mode Rail 约 76px，两个约 68×30 行，18px 图标在左、11px 字在右；Category 内高 64、24px 图标上/11px 字下，设计八项、蓝图九项。Mode Active 无状态线，Category 顶部短线保留。内部 Geometry 唯一 Owner 是 `src/gameplay/main-dock.css`，不从旧 command-bar / mode-rail 样式恢复另一套结构。

普通 World 与 Catalog 的右下 Utility 保持两行：第一行地图解锁/区域/地形/配色；第二行网格/范围动作/Undo/Redo/批量摧毁。Main Dock 与双行 Utility 同高 84、bottom=16；Workspace / Hints 消费 112px Bottom HUD Safe Offset。

真实 Placement 使用 84px 中下主栏 + 84px 右下双行 Utility：第一行 Primary Object Action，第二行 Toggle / Secondary / History / optional Danger；第二行可见图标数严格多于第一行、固定右对齐，宽度随内容收缩。中下只保留模式与流程操作。Terrain / Color / Building Selection 不机械套用数量规则。

Top Control Tray Geometry 唯一 Owner 为 `src/gameplay/gameplay-top-shell.css`：400×38、84 / 1 / flexible / 1 / 44 单行 Grid、2 / 5 / 1 分组。Surface System 只持有材质和状态。迁移 Hover、清理 USS 不得误删 Top Tray Geometry / Button Reset。

## Global Hover 护栏

UI Tooltip / Rich Hover Card 统一用 `src/ui/hover/`，不新增原生 title、data-tooltip + ::after 或私有 Portal。Tooltip 用于短解释，Card 用于只读对象详情，有按钮的内容使用 Popover。

默认 Tooltip 320ms、Card 460ms、关闭 90ms，由框架拥有延迟、定位、Focus、热切换和清理，Feature 只提交 Definition。层级为普通 UI < Hover < Notification < Modal；Modal 打开清理 Hover。Hover 使用 pointer-events:none / Unity PickingMode.Ignore，锚定条目而不追随鼠标。

## 迁移与维护护栏

Runtime CSS 禁止 :has()；不通过 DOM 查询推断业务状态。浮层坐标测量不等于业务状态来源。新布局必须说明 UXML / Flex 行列映射，结构状态线、Pager、Overlay 使用真实元素。

不新增私有 backdrop-filter Owner；原生效果及回退归共享 Surface 契约。Transition 明确列出属性并消费共享 Motion Token；大型 Surface 不动画 Width / Height，不插值 Blur Radius；业务立即生效，退出开始停用输入，隐藏时 Rebind。

SVG 仅作 Source Master，64×64 PNG 是 Web / Unity 共用 Runtime Asset，src 不依赖 lucide-react / LucideIcon。新图标先加入 Source List，执行 icons:build / icons:check；自定义来源标为 wanhu-authored，不冒用 Lucide 来源。

共享字号为 11 / 12 / 13 / 14 / 16 / 18，图标为 14 / 16 / 18 / 20 / 24。这是语义档位，不表示每个旧 Consumer 已收敛；实际例外见视觉总规范。Feature 不重写共享控件基础字号与状态。Numeric Slider 只选 standard / compact，Scrollbar 统一 ui-scroll-region；不以缩小字体、整体 scale 或空白列掩盖布局问题。

普通 Hover 中性提亮，Selected / On 熟铜，Focus 独立并可共存。修改在 Theme / Surface / Controls / 既有组件 Owner 中完成，不新增末尾美化覆盖文件。

## 开发与交付

Web 只验证美术、构图、信息和交互，不把 React / CSS 当最终游戏架构；但正式 Web 截图应尽量就是 Unity 6.6 的目标美术，不把明显不可迁移的浏览器效果当成正式视觉基线。

Unity 6.6 Visual Parity、共享美术、跨页面视觉治理默认使用 **模块分支 + Draft PR**，不直接并行写 main。一个 Feature PR 只能属于一个模块，建议 2–5 个 Runtime 文件、最多 1 个专项 Review 脚本，硬上限 6 个 Runtime 文件；跨模块必须继续拆分。PR 由 `check-pr-scope.mjs` 判定模块并只运行对应 Review Group；只有 main 才运行全量 UI Review。通过的模块 PR 由集成门串行合入 main，每次合入后等待 main 全量回归通过，再合下一项。普通纯文档或用户明确要求的独立小修仍可按任务决定是否直推 main。

先执行 icons:check、audit:scale、audit:visual、audit:unity、相关单元检查和 build。视觉治理 Guard 使用 Ratchet：已有旧色债务逐批清理，新文件不得扩散退役共享色。不能本地运行时说明实际使用的 Actions 日志，不声称本地测试成功。局部 Control / Surface 组件图不能冒充真实页面和交互验收。

重要 UI 修改须 Build + UI Review，并下载、实际打开关键完整截图；发现问题继续修复。Feature PR 只跑模块对应的 Targeted Review Group，避免一个小模块机械跑完整截图矩阵；main 集成后才运行 Core / HUD / Dialog / Readability / Tools / Selection 六组全量回归。全局改动覆盖 Settings / Archive / Management / Workspace / Tool / Dialog、昼夜与缩放；矩阵不足时补充受影响状态。

Main Dock 同时检查设计/蓝图两态；Secondary Bar 至少检查 Terrain / Color / Selection / Building / Road / Tree / City Wall 的结构和文字；Hover 同时检查多种 Catalog、边缘与 Modal 清理。交付报告实际 main SHA、对应 Actions、实际审图范围，关键图直接展示在回复中。Web 通过不等于 Unity Player 验证。

文档和代码同轮同步；纯文档变更不为绿色状态重跑 UI Review。正式文档记录稳定职责、边界、生命周期和不变量，不重复实现；阶段记录放 Documentation/开发记录，审查放带日期的 Documentation/代码审查，历史快照与当前入口隔离，不建 _AI 层。
