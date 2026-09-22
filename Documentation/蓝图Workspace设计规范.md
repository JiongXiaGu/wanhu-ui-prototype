# 蓝图 Workspace 设计规范

蓝图 Workspace 用于浏览和选择一整套可复用的城市组合。它与 Design Workspace 共享 Catalog Workspace 外壳，但 Card 的主要任务不是阅读构件名称，而是快速判断“这套组合最终看起来是什么样”。

## 入口与分类

Main Dock 的蓝图模式固定提供：

`全部 / 民居 / 商业 / 工坊 / 管理 / 科学 / 信仰 / 军事 / 宫殿`

切换到蓝图模式时不自动打开 Workspace；玩家明确点击一个分类后，进入同一个 Blueprint Workspace。再次点击当前分类、关闭按钮或 Esc 都关闭 Workspace 并清空当前分类。

`dockMode=blueprint` 且 `dockCategory` 属于蓝图分类时，`workspace=blueprint`。

## 共享框架

Blueprint Workspace 继续消费现有 Catalog Workspace：

`Header + Primary Rail + Context Filter + Content Stage + Pager`

共享部分继续由以下 Owner 持有：

- `workspace.css`：Workspace Shell 与基础结构；
- `workspace/workspace-catalog.css`：紧凑 Catalog 的 Header / Rail / Filter / Content / Pager Geometry；
- `workspace/workspace-world-first-glass.css` 与 `wanhu-surface-system.css`：Workspace 视觉和材质；
- `src/ui/hover/`：Rich Hover 生命周期和定位。

Blueprint 不复制新的 Workspace Shell，也不建立独立 Tooltip / Inspector。

## Primary Rail

蓝图左 Rail 固定表达规模，不重复 Main Dock 已经提供的业务类别：

- 全部
- 小型
- 中型
- 大型

规模是 Blueprint 数据属性，不从占地数字临时推断。切换规模会回到第一页，并清理当前 Rich Hover。

当前只需要一组 4 项，因此 Rail 保留共享单页中性 Pager Marker，不新增第二套分页结构。

## Context Filter

顶部筛选表达来源：

`全部 / 系统内置 / 创意工坊 / 我的蓝图`

Main Dock Category、规模 Rail、来源 Filter 是三个正交维度：

- Category：这套蓝图属于什么用途；
- Size：整体规模；
- Source：蓝图来自哪里。

筛选结果变化时 Content Pager 回到第一页。

## Image-first Card

Blueprint Card 是 Shared WorkspaceItemCard 的业务 Variant，但 Composition 与 Design Asset Card 不同。

Design Card 主要表达“构件是什么”；Blueprint Card 主要表达“整套组合看起来是什么样”。

1080p 当前基线：

- Workspace：约 `1240 × 280px`；
- Content：每页 `4 × 1`；
- Blueprint Card：约 `142px` 高；
- Preview：覆盖整张 Card；
- Card 底部使用暗渐变保证文字阅读；
- 左下：蓝图名称；
- 右下：占地；
- 右上：只有创意工坊 / 我的蓝图显示来源 Badge；系统内置不重复显示来源。

Card 不在图片之外再增加大块文本区，不恢复 Design Card 的“64×64 Preview + 文字列”。

第一版 Web Prototype 暂时使用现有 Gameplay 场景图的不同裁切验证构图和信息层级。这些图片不是最终蓝图截图资产。正式资源应由 Blueprint Preview Capture 统一生成，保持稳定俯视角、焦距、主体居中、光照和输出比例。

## Card 状态

Blueprint Card 仍是 Action Button：

- Default：图片承担第一视觉层级；
- Hover：示例图轻微提亮，不位移整张 Card；
- Focus：使用共享左侧短状态线；
- Pressed：极轻缩放反馈；
- 不保存持续 Selected。

当前 Web V1 只完成浏览与选择入口。点击 Card 会给出蓝图放置尚未接入的提示，不伪造放置状态。真实 Blueprint Placement Preview / Confirm / Cancel 属于后续 Blueprint Tool。

## Rich Hover

Blueprint Card 继续使用全局 Rich Hover，并遵守 Catalog Workspace 的固定定位规则：

- 固定在当前 Card 上方；
- 水平居中；
- Anchor Gap 约 12px；
- Pointer Ignore；
- 同一 Card 内不随鼠标漂移；
- 相邻 Card 热切换；
- Safe Edge / Clamp。

Hover 内容用于承载 Card 上故意省略的详细信息：

- 占地；
- 构件数量；
- 预计造价；
- 规模；
- 一段简短说明。

Card 本身不因为这些信息重新变回文字列表。

## 原型数据

当前 Blueprint Workspace 数据只用于验证信息架构，包含：

- Category；
- Size；
- Source；
- Footprint；
- ObjectCount；
- EstimatedCost；
- Description；
- Preview Asset / Crop。

正式 Unity 数据应由 Blueprint Definition / Catalog 提供。UI 不拥有真实建造对象列表、库存扣除、碰撞验证或放置生命周期。

## Unity UI Toolkit 映射

建议结构：

`BlueprintWorkspace.uxml`
- Shared Workspace Header
- Shared Primary Rail
- Shared Context Filter
- Blueprint Card Row
- Shared Pager

`BlueprintCard.uxml`
- Preview VisualElement
- Shade Overlay
- Optional Source Badge
- Caption Row
- Shared Focus State Line

Web 的 `background-image / background-position` 只用于原型验证；Unity 侧 Preview 应绑定正式 Texture2D / RenderTexture 资产。

Blueprint Workspace Controller 只负责 Category / Size / Source / Page 与 Card Definition 绑定，不直接控制世界放置。真实放置由后续 Blueprint Placement Controller 接管。
