# 蓝图 Workspace 设计规范

蓝图 Workspace 浏览可复用的城市组合，与 Design 共用 Catalog 外壳。Design 主要说明“构件是什么”，Blueprint 的 Media Card 主要说明“整套组合看起来怎样”。共享样式不要求二者相同比例或阅读顺序。

## 入口与筛选

Main Dock 蓝图模式分类为 `全部 / 民居 / 商业 / 工坊 / 管理 / 科学 / 信仰 / 军事 / 宫殿`。切到蓝图模式不自动打开目录；明确点击分类后进入同一个 BlueprintWorkspace。再次点击当前分类、关闭按钮或 Esc 关闭目录并清空分类。

目录结构为 `Header + Primary Rail + Context Filter + Content Stage + Pager`。Main Dock Category 表示用途；Rail 的 `全部 / 小型 / 中型 / 大型` 表示数据中声明的规模；顶部 `全部 / 系统内置 / 创意工坊 / 我的蓝图` 表示来源。规模不从占地数字临时猜测。

Rail 顶部保留原有“收藏”按钮外观，但交互语义是独立可开关筛选：重复点击可开启/关闭 `favoriteOnly`。它与规模和来源筛选正交组合，开启/关闭收藏不会改写当前规模，切换规模也不会隐式关闭收藏。收藏不是第五种资源来源；收藏按钮的 On 状态可与规模 Selected 同时成立。

筛选改变时回到第一页，清理 Hover。Rail 单页仍保留 Paper White 竖线，Content 单页保留 Paper White 横线；多页为当前方向线 + 其余灰点。单页与多页 Content Pager 占用同一 Pager Lane 高度，因此从 4 Card 满页切到 1 Card / 稀疏结果时，Source Filter、Content Stage、Card 起点和 Pager 的几何位置保持不变。Pager 不使用熟铜；分类 Selected 才使用熟铜语义。

## Media Card

1080p 基线为 Workspace 约 1240×330，每页 4×1 张 4:3 Card。Preview 覆盖 Card，并通过整张预览的统一透明度压暗来保证文字可读；不再叠加底部大面积实色 Scrim，避免 Unity 6.6 兼容实现形成明显矩形黑带。名称与名称后的收藏星直接叠在 Preview 上，不在图片外另加大块文字区。占地/尺寸已退到 Rich Hover / 详情，右下不再常驻这项信息。

所有来源均显示左上 Source Badge，右上常驻 `···` 操作入口。名称后星不额外占用图片四角。来源 Badge、星和菜单的公共样式由 `src/workspace.css` 持有；业务图片、遮罩和 Caption 由 `src/workspace/blueprint-workspace.css` 持有。

来源 Badge 与菜单在默认状态保持低权重，Hover / Focus 才进一步提亮。当前 Media Badge 背景为 `rgba(17,23,20,.74)`、边缘纸色 .055，菜单 Trigger 默认 opacity .56；这些是组件 Chrome 的局部值，不是共享面板 Palette。

Card 是 Action Button：默认图片为主，Hover / Focus 提亮 Preview；整张 Card 不因 Hover 位移，Preview 可以保留已有的轻微缩放；Focus 使用共享状态线，Pressed 短暂反馈，不保存持续 Selected。

Web 示例仍是 Gameplay 场景图的不同裁切，用于构图验证，不是最终蓝图截图资产。正式 Preview 由对应 Capture / 资源系统提供，不能把裁切参数误认为真实蓝图对象内容。

## 所有来源的操作菜单

System / Workshop / mine 都有常驻入口，默认可“收藏 / 取消收藏”。菜单是否有入口与资源是否可编辑是两件事。

只有 `source=mine` 的当前用户蓝图增加“编辑 / 删除”。系统和创意工坊定义保持只读，但这不妨碍保存本地收藏元数据。不要恢复“只有我的蓝图显示菜单”的旧规则。

编辑打开 Blueprint Editor，可修改名称、分类并重新拍摄；规模、占地、构件数量和预计造价来自蓝图内容数据，只读。删除必须经过共享 Danger Confirm，只删除 Definition / Template，不反向移除已放在城市里的对象。

Card 点击后的真实 Blueprint Placement Preview / Confirm / Cancel 仍未接入，不能为演示外观而伪造完成的放置系统。

## 新建与摄影

来源栏右侧是“新建蓝图”。稳定流程为：

`Blueprint Workspace → Photography Tool → 完成摄影 → Blueprint Editor → 保存到我的蓝图 → 返回 Workspace`

摄影使用 `tool=blueprint-photography`，记录 `blueprint-workspace(category)` ToolOrigin。普通目录、Main Dock 和竞争 HUD 收起，复用标准 Tool Space：左侧 LeftContextPanel；中下 ToolActionBar；右下 GameplayOperationHints；中央为 4:3 Frame 与可选构图线。

左面板约 360px，包含 FOV / 镜头高度 / 俯视角度和预览规格。中下栏使用共享 84px 结构，操作为恢复镜头、构图线、完成、取消；Hints 使用 Enter / G / R / Esc。构图线默认关闭。

Web 只验证比例与安全距离：1080p Frame 最大约 900×675，Top Safe 96px、Bottom Safe 116px、左右约 392px。没有拖动世界、滚轮缩放 Preview 或参数驱动真实 Camera 的实现，不重新制作独立摄影软件式 Header / Footer。

完成摄影只产生 Preview Capture，不直接存入 Catalog。取消普通新建摄影恢复原 Workspace；从 Editor 发起重拍时取消应恢复原 Editor Draft。

摄影只拥有 `previewAsset / previewPosition / previewSize`。Blueprint ObjectRefs、Bounds、Footprint、规模和构件列表来自内容/Capture 数据，不能从镜头里看到了什么反推。

## Blueprint Editor

Editor 是专用内容布局，但共用 `ui-modal-backdrop` / `ui-modal-surface` 材质：近黑高不透明遮罩、烟墨 Panel、无颗粒、无额外 Blur。不得另定义一套背景、边缘和投影。

左侧 4:3 Preview，右侧名称/分类与只读 Facts；提供重新拍摄及取消/保存动作。重拍保留 Metadata Draft，不丢弃已输入的名称与分类。重新拍摄动作依附 Preview 的已有布局，具体位置以当前 Editor 组件为准。

从全部入口新建时，Editor 给出可修改的默认分类，保存必须属于真实业务类别；all 永远只是筛选项。保存后来源固定 mine。

Web Custom Catalog 暂由 GameplayScreen 持有；正式 Unity 应由 BlueprintCatalog / BlueprintDefinition 和 Create / Update / Delete Command 持有。Workspace 只发请求和消费结果，不成为蓝图数据权威。

## Rich Hover

复用 `src/ui/hover/`：固定条目上方、水平居中、约 12px Gap，Safe Edge / Clamp，忽略 Pointer，相邻条目热切换，不随同一 Card 内鼠标漂移。

占地、构件数、预计造价、规模和说明进入 Hover，不为这些信息扩展常驻 Caption。Hover 无可交互按钮；资源动作留在菜单。生命周期与默认延迟由全局框架负责。

## Unity 映射与所有权

| Owner | 职责 |
| --- | --- |
| `src/workspace.css` | Workspace 基础结构、共享 Card Chrome、Badge / Favorite / Menu |
| `src/workspace/workspace-catalog.css` | Header / Rail / Filter / Pager 公共几何 |
| `src/workspace/workspace-world-first-glass.css` | Catalog 前景与状态语言 |
| `src/ui/wanhu-surface-system.css` | Workspace 和 Modal 的完整材质 |
| `src/workspace/blueprint-workspace.css` | Media 比例、Preview / Shade / Caption |
| `src/ui/hover/` | 全局只读详情与定位 |

UXML 复用 Catalog Header / Rail / Filter / Pager；Media Card 使用 Preview、Source Badge、Caption、Favorite、Focus Line 和 Item Menu 子结构。Preview 在 Unity 绑定 Texture2D / RenderTexture 资产，不照抄浏览器背景裁切充当正式资源管线。

Controller 持有分类、规模、来源、收藏筛选、分页与菜单状态；用户收藏由正式 Catalog/User Metadata 层持久化。当前 Web 收藏只是 UI 会话内状态验证。UI 不直接拥有库存扣除、碰撞、建造对象列表和放置生命周期。
