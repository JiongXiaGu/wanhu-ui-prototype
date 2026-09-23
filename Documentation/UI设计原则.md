# UI 设计原则

本文件记录长期设计判断，不替代当前样式值。视觉阅读入口见 [UI Toolkit 视觉总规范](<UI Toolkit视觉总规范.md>)，精确 Palette 与材质配方见 [烟墨熟铜视觉材质规范](<Wanhu 烟墨熟铜视觉材质规范.md>)。

## 信息做减法，层级做加法

常驻 UI 只显示当前任务需要的操作、内容和反馈。简洁不等于平淡：用排版、明暗、留白、真实缩略图、少量材质与状态动效建立层级，不靠增加解释小字和嵌套边框填满空间。

判断一段内容是否必要：玩家不看它是否仍可正确操作？是否只是复述标题？是否在同屏重复？是否仅第一次理解功能时有用？没有新决策、状态或反馈的 Preview / Summary / Statistics 区域应删除，而不是为了视觉对称保留。

同一空间通常保留任务身份、可操作内容、必要反馈三层常驻信息。错误、冲突、危险结果、不可用原因等会影响当前决定的内容允许显示；背景知识和低频解释进入 Tooltip、详情或帮助。

## 世界优先与空间秩序

Gameplay 保留世界作为主体，下半屏避免多个主要浏览/参数面板互相争抢空间。当前 Workspace 与 Camera / Environment Context 的互斥、进入 Tool 后竞争 HUD 收起、返回来源的规则由 UI State 负责，不由 CSS 可见性临时推导。

留白是构图的一部分，不因为右侧空着就添加没有操作价值的栏。能用对齐、间距和弱 Tone 分组时，不给每个 Section 再套一个 Card。

“少 Card”不是禁止资源卡片。Design 的紧凑资产条目、Material / BuildingScheme 的文字参数条目、Blueprint 的 4:3 Media Card 都是正式内容结构。应禁止的是无语义套盒，不是删除已经完成的目录系统。不同内容有不同阅读顺序，不强制图片永远大于名称。

## 东方气质的来源

整体是现代东方城市模拟游戏界面，不是仿古皮肤或软件 Dashboard。烟墨表面、暖纸浅字、熟铜状态与古代城市内容共同建立身份。

不添加云纹、竹叶、回纹、木纹、卷轴、粗金边、装饰编号或只为气氛存在的英文眉题。纸、石、铜是色温与重量的比喻，不是必须画出来的纹理。品牌标题可保留衬线字，日常操作不使用难读书法字。

允许极弱渐变、轻轮廓、共享微弱 Noise、投影和真实游戏图像。是否用 Noise / Blur 服从对应材质 Recipe；Dialog 与 Pause Panel 不重新添加颗粒磨砂。

## 色彩与交互必须有语义

默认文字与图标保持暖纸/中性灰；普通 Hover 中性提亮；Selected / Current / On 使用熟铜；Focus 独立可见且可与 Selected 并存。熟铜不能只是“这里可以点击”的标记，也不要求同屏只允许一个真实 Selected——独立筛选维度可以各有当前状态。

主动作强调推进，普通 Close / Cancel 保持次级。Warning 使用已定义的熟铜警告配方，Danger 使用朱砂危险配方，不能把一切提示都涂红。收藏星、来源 Badge 和管理专题色属于明确的信息语义，不扩散为整页主题。

Surface 角色、Overlay 绘制层与操作空间优先级必须分开理解。“同一烟墨家族”不要求所有表面相同 RGB，也不要求 Context、Work、Blocking 按名称逐级增加透明度或暗度。

## 文字与图标

共享字号以 `UI Typography与Icon尺寸规范.md` 和 Theme Token 为准：元信息/紧凑标签 11px，普通操作与工具正文 12px，持续阅读 13px，分组 14px，Panel / Workspace 标题档位 16 / 18px。局部 Consumer 的实际差异由视觉总规范说明，不再用旧的 9 / 9.5 / 10px 表作为新控件目标。

不要通过缩小文字、整体 transform scale 或命中区来解决拥挤。优先调整字段、单位、换行、可用宽度和正确滚动区域。数字格式与宽度保持稳定。

普通图标走 SVG Source Master → 64×64 PNG Runtime 管线；显示尺寸与命中区分离。标题使用裸图标，不恢复图标底板。Main Dock 的 Mode 与 Category 必须在排列和尺寸上有层级差异。

## 共享 Hover

Tooltip 与 Rich Hover Card 已由 `src/ui/hover/` 实现，不再描述为未来待建组件。Tooltip 解释控件；Rich Hover 承载对象只读详情；有按钮的内容使用 Popover。

框架默认 Tooltip 延迟 320ms、Rich Hover 460ms、关闭延迟 90ms；Focus 与热切换由框架统一处理。Catalog 详情锚定当前 Card 上方并水平居中，不跟随鼠标漂移。Hover 层在普通 UI 之上、Notification / Modal 之下，忽略 Pointer；Modal 打开时清理。

说明应补充操作，而不能成为完成基本操作的必经步骤。不恢复浏览器原生 title、每个 Feature 私有 Portal 或 `data-tooltip + ::after`。

## 动效与可维护性

动效表达工具响应与空间归属，不做技能特效。使用共享时长和方向，旧内容退出、隐藏时重绑、新内容进入。业务状态不等待动画，退出开始即禁用交互。大型面板不动画 Width / Height，不插值 Blur Radius，不做大幅弹跳、扫光或逐项飞入。

Theme / Surface / Controls / Shared Component / Feature 各自维护职责；不复制另一套页面皮肤，不追加全局美化覆盖文件。Web CSS 只是原型实现，正式 USS 不复制历史覆盖债务。

## 修改前后的检查

确认信息不重复、当前任务清楚、空间没有被无意义内容填满，Card 与状态符合真实业务语义，弱文字没有被误画成 Disabled。检查材质完整配方及最终 Consumer，而不是只读第一处色值。

涉及全局视觉时对照 Settings、Archive、Management、Workspace、Tool、Dialog、昼夜与缩放。构建成功不代表审图，Web 通过不代表 Unity Player 已验证。仅整理文档时，不借机修改 UI 或扩大业务范围。
