# AGENTS.md

这是所有 AI / Agent 接手 wanhu-ui-prototype 的入口。先理解现有项目，再修改；代码是具体实现权威，Documentation 记录设计与契约。

## 开始工作前

核对远端最新 main，不用聊天记忆覆盖当前代码。依次阅读：

1. `Documentation/工作交接.md`
2. `Documentation/项目概览.md`
3. `Documentation/UI设计原则.md`
4. `Documentation/Wanhu 烟墨熟铜视觉材质规范.md`
5. `Documentation/UI空间与状态架构.md`
6. `Documentation/UI Toolkit落地规范.md`
7. `Documentation/Unity 6.6视觉能力与回退规范.md`
8. `Documentation/UI Motion System设计规范.md`
9. `Documentation/Unity UI Toolkit迁移准备清单.md`
10. `Documentation/UI图标资产管线.md`、`Documentation/UI Typography与Icon尺寸规范.md`
11. `Documentation/工具辨识与局部布局.md`
12. `Documentation/世界对象选中系统.md`
13. 当前任务涉及的组件规范和代码。

目标运行时已确定为 Unity 6.6 + URP UI Toolkit。涉及原生 Blur / Shadow 的版本能力，以《Unity 6.6视觉能力与回退规范》为准；不得用历史文档中的“不能模糊 UI”限制新设计，也不得把支持某能力写成已经完成 Unity 实测。

## 已确认的设计边界

- 材质方案和建筑配色方案的文字列表是有意设计，保留现有结构；不增加缩略图，不改为视觉目录，也不将其记录为待补的美术欠缺。
- 库存和管理页暂缓优化，包括资源图标与详情面板；除非用户另行批准，不混入工具和设置布局任务。
- Gameplay 二级中下栏统一使用 Secondary Bottom Action Bar：84px 总高；带文字按钮 76×64px；24px 图标在上、11px 短标签在下，图标为第一视觉层级。Building Selection、Terrain、Color 与全部 Placement 必须复用同一 Primitive；Mode / Quick / Complete / Cancel 不得各自使用另一套横排 Geometry。右下 Utility 继续保持纯图标。
- 所有当前 Catalog Workspace 的 Rich Hover 固定显示在当前 Card 上方并水平居中；Feature 不声明私有定位模式。`workspace-edge` 只保留为框架级特殊能力，未来确有完整目录避让需求时才允许显式启用。不新增常驻详情栏。Settings 只调整内部表单比例，不推翻全屏空间和输入流程。
- 世界对象选中属于 Gameplay Selection，不新增 Selection Tool。V1 只实现 Building Consumer；UI State 只持有 kind + entityId，经营数据由 Selection Presenter / ViewModel 提供。
- Building Selection 中下主操作为“移动 / 配色(toggle) / 关闭”，不提供单独“编辑建筑”。配色直接开关 Selection 内 BuildingSchemeWorkspace，不进入顶层 Color Tool；右下只保留聚焦 / Undo / Redo / 移除，移除必须使用共享危险确认 Dialog。Building Move 与 Building New 共用 Building Placement（intent=new|move）。
- World Utility 保持两行：第一行固定地图解锁 / 区域 / 地形 / 配色，第二行放网格 / 范围动作 / Undo / Redo / 批量摧毁。普通 Gameplay 与 Design Workspace 都保持双层；Main Dock 与双层 Utility 统一为 84px 高、bottom=16px，同高同底边。真实 Placement 同样使用 84px 中下主栏 + 84px 右下双层 Utility：第一行只放 Primary Object Action，第二行按 Toggle / Secondary Action / History / optional Danger 组织；Placement Utility 宽度必须随可见内容收缩、第二行固定右对齐，并且每个真实 Placement 状态都必须满足“第二行可见图标数严格多于第一行”。Terrain / Color / Building Selection 不机械套用 Placement 结构。Workspace / Operation Hints 统一消费 112px Bottom HUD Safe Offset。
- Operation Hints 是 Gameplay 常驻 HUD Host：除 Pause 外，World / Workspace / Selection / Selection Workspace / Tool / Context / Management 都必须保持恰好一个 Host，只允许按 Context Rebind，不允许 Feature 通过 selection/tool/space 条件自行隐藏。

## 开发与交付

- Web 用于美术、构图、信息架构与交互验证，不把 React / CSS 当最终产品架构。
- 默认直接提交 main，不建临时分支，不强制推送或部署 Vercel。
- 局部 Button / Toggle / Slider / ColorParameterField / Surface 可以做源码级组件 Review，提高中间迭代速度。
- 组件截图不能冒充真实 React 页面、正式 PNG 图标、世界背景、Workspace / HUD 布局或真实交互已验收。
- 重要 UI 修改正式交付必须由 GitHub Actions Build 与 UI Review 验证；下载截图 Artifact，实际打开关键完整页面检查后再交付。
- 先执行 icons:check、audit:scale、audit:unity、相关单元检查和 build。当前 Build 工作流包含这些步骤；环境不能本地运行时，应明确以对应 Actions 日志为依据。
- 全局 Typography / Surface / Controls 修改需检查 Settings / Archive / Management / Workspace / Tool / Dialog、昼夜和缩放；不要只看一个目标页面。
- 现有矩阵未覆盖受影响状态时，同轮扩展截图脚本；不为单个局部试验机械增加大量截图。
- 截图或构建发现问题，继续修复、重跑并复查，不能只报 Action Success。
- 交付说明实际 main SHA、对应 Build / UI Review、实际审图范围和关键截图。Web Review 不等于 Unity Player 验收。
- 文档与代码同轮同步；纯文档变更不需要为了绿色状态重跑 UI Review。

## 迁移护栏

- Runtime CSS 禁止 :has()；不通过 DOM 查询推断业务状态。浮层的展示坐标测量与业务状态区分。
- 不新增私有 backdrop-filter 所有者；新需求归共享 Surface / 6.6 原生效果与回退契约。
- Transition 必须写明确属性并消费共享 Motion Token。大型 Surface 不动画 Width / Height，不插值 Blur Radius；Business State 不等待动画。
- 新布局必须能说明 UXML / Flex 行列映射；有结构语义的状态线、Pager Marker、Overlay 优先真实元素。
- 图标 SVG 只为 Source Master；64×64 PNG 是 Web / Unity 共用 Runtime Asset。src 禁止依赖 lucide-react 或 LucideIcon。
- 新图标加入 Source List 后执行 icons:build / icons:check；自定义来源显式标记为 wanhu-authored，不能冒用 Lucide 来源；重要视觉变化仍需正式 UI Review。
- 1080p 共享文字：Metadata / Caption 11px，Label / Body 12px，Reading 13px，Subheading 14px，Panel / Workspace Title 16 / 18px。图标仍为 14 / 16 / 18 / 20 / 24px。
- Feature 不重写共享控件基础字号与状态。Numeric Slider 内部尺寸只通过 shared `standard / compact` density 选择；Scrollbar 统一消费 `ui-scroll-region`，Feature 只负责 overflow / max-height。禁止用更小文字、transform scale 或额外空白列掩盖布局问题。
- Hover 中性提亮，Selected / On 熟铜，Focus 独立轮廓；选中与焦点必须可以并存。
- Top Control Tray 的 Geometry 唯一 Owner 是 `src/gameplay/gameplay-top-shell.css`：400×38、`84 / 1 / flexible / 1 / 44` 单行 Grid、2 / 5 / 1 三组按钮。`wanhu-surface-system.css` 只持有其 Surface / 状态材质；迁移 Tooltip 或清理 USS 时不得连带删除 Control Tray Geometry。
- 不新增末尾美化覆盖文件；在 Theme、Surface、Control 或对应组件的现有所有者中修改。

正式文档记录稳定职责、边界、生命周期、不变量与 Unity 映射，不重复实现。阶段性记录放在 Documentation/开发记录，不创建额外 _AI 文档层。


### Secondary Action Bar 护栏

- `src/tools/secondary-action-bar.css` 是二级中下栏 Geometry / visual hierarchy 的唯一共享所有者；
- Placement Feature 只保留 Placement 语义，不得重新定义按钮高度 / 宽度 / 横纵排列；
- Terrain / Tree / Selection Feature CSS 不得私有维护中下栏 Screen Anchor；
- 正式 UI Review 至少覆盖 Terrain、Color、Building Selection、Building Placement、Road、Tree、City Wall，并验证 84px 高、24px 图标、Icon Top / Label Bottom 和文字不截断。


### Main Dock V2 护栏

- 一级 Main Dock 固定 880×84px，设计 / 蓝图切换不得改变外层宽高；
- 设计 / 蓝图必须使用独立上下双行 Mode Rail：Rail 约 76px 宽；单行约 68×30px；18px 图标在左、11px 文字在右；不得与右侧 Category 使用同一种“图标上 / 文字下”按钮语言；
- Category 使用 24px 图标 + 11px 标签、64px 内部高度；设计 8 项、蓝图 9 项；
- Mode Active 不使用横线，只使用熟铜图标 / 文字与弱背景；Category Active 保留顶部短 State Line，避免一级模式与分类同质化；
- `src/gameplay/main-dock.css` 是 Main Dock 内部 Geometry / visual hierarchy 的唯一权威；`styles.css` / `gameplay-refine.css` 不得恢复旧 `.command-bar` / `.mode-rail` / `.category-row` Geometry；
- 正式 UI Review 必须分别截图并检查 Design 与 Blueprint 两态，验证 880×84、双行 Mode Rail、68×30 Mode、18px Mode 图标、分类 8/9 项、24px 分类图标、11px 标签和 Mode 切换不跳宽。


### Global Hover Surface 护栏

- UI Tooltip / Hover Card 必须使用 `src/ui/hover/` 全局框架；Feature 不得新增 `data-tooltip + ::after`、原生 `title` Tooltip 或私有 Portal；
- Tooltip 用于简短控件解释；Hover Card 用于详细对象阅读；可交互浮层另建 Popover，不向 Hover Card 塞按钮；
- 全局层级为普通 UI < Hover < Notification < Modal；Modal 打开必须清空 Hover；
- Hover Surface 必须 `pointer-events:none` / UIToolkit `PickingMode.Ignore`；
- Catalog Workspace Rich Hover 必须锚定条目 Element、不跟随鼠标位置，并统一固定为当前 Card 上方（Top + Anchor Gap，水平居中）；当前 Feature 不得自行声明 `workspace-edge`，该模式仅作为未来特殊布局的框架能力保留；
- Hover 定位与 Delay 只允许由 Hover Framework 持有，Feature 只提交 HoverDefinition。
