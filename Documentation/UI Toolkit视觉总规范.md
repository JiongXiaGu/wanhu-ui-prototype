# UI Toolkit 视觉总规范

这是 Unity UI Toolkit 制作与迁移的视觉阅读入口。它说明当前界面应当如何被理解、哪些页面可以类比、哪些差异必须保留；不是要求把已有页面重新设计一次。

本仓库是 React / TypeScript / CSS 原型，目标运行时是 Unity 6.6 + URP + UI Toolkit。这里负责把 Web 视觉权威、设计语义和迁移依据整理清楚，不在本仓库实施或镜像维护正式 Unity USS；Unity 制作 AI 根据这些稳定依据完成 UXML / USS / Player 实现。

长期配色、Surface、Control 与 Feature CSS 的分阶段治理见 [Web 配色与样式治理长期方案](<Web 配色与样式治理长期方案.md>)。这里对 CSS 的审查是 USS 迁移依据，不表示已经审查或运行了正式 Unity 工程的 USS。

## 先确定依据，不从形容词猜颜色

具体实现以代码为准。配色与材质值集中见 [烟墨熟铜视觉材质规范](<Wanhu 烟墨熟铜视觉材质规范.md>)；字体档位见 [Typography 与 Icon](<UI Typography与Icon尺寸规范.md>)；版本能力见 [Unity 6.6 视觉能力与回退规范](<Unity 6.6视觉能力与回退规范.md>)。本文件不再维护另一张独立色卡。

判断一个元素的外观，应按以下顺序追踪：

1. 在真实组件中确认元素、类、父级、状态和昼夜作用域，不能只搜索到一个同名选择器就停止。
2. 从 `src/main.tsx` 确认样式实际加载顺序；同属性还要比较选择器优先级、继承、变量作用域、伪元素和行内值。
3. 读取 Theme 的原值，以及 Surface / Controls / 组件前景样式如何消费它。一个存在的 Token 不等于每个元素都使用它。
4. 在目标页面检查 Computed Style，并打开对应完整截图。没有运行条件时，明确结论只是源码推导，不报告为实际渲染验收。

`styles.css` 开头的 `--paper`、`--gold`、`--workspace` 是历史基础变量；`--wanhu-color-*`、`--wanhu-surface-*` 及其实际 Consumer 才是当前共享语义的入口。两组变量并非全部一一重定向，仍有局部旧消费者。不能把第一张表直接复制进 Unity，也不能声称旧值已经从全仓库清除。

`src/review/styles/` 中的 Study、历史截图、旧 Pass 注释和 `var(--token, fallback)` 的 fallback 不是正式颜色的独立权威。截图中的某个像素则是背景、Alpha、渐变、滤镜和前景共同作用的结果，不是一个可直接反推的 Theme Token。

## 整体观感

《万户天工》的 UI 是世界画面之上的现代东方城市建造与管理界面。大型工作区使用低饱和烟墨灰，阅读层使用暖纸色浅字，熟铜用于被选择的状态和关键推进动作。视觉重量来自面板密度、少量渐变、轮廓、投影、排版与真实游戏内容，而不是木纹、卷轴、祥云和满屏金边。

“纸”指文字的暖白色温，不是浅色宣纸底板；“熟铜”指低饱和的状态语言，不是写实金属贴图；“石质、仪器感”也不要求添加石纹、铆钉、刻度盘或工业装饰。正文是浅字深底，不是纸上的黑色墨字。

界面不能被概括为一块不透明黑色软件窗口，也不能被概括为全部高度透明的玻璃。当前顶部常驻 HUD 保留轻、略冷的烟灰玻璃配方，Workspace 与参数面板更中性、更稳，全屏空间和 Modal 则明显压住背景。它们属于同一家族，但不是完全相同的 RGB 或 Alpha。

不规定未经测量的“90% 灰、8% 白、2% 金”面积比例，也不把“阅读稳定性 85%”当成可计算指标。实际判断是世界是否仍可感知、当前任务是否清楚、正文是否稳定可读、强调是否有语义。

## 不要混淆三种层级

| 体系 | 用途 | 当前约定 |
| --- | --- | --- |
| Surface Family | 表面承担何种阅读和操作任务 | Ambient / Context / Work / Blocking / Elevated |
| 全局 Overlay | 哪些内容覆盖哪些 UI | 普通 UI < Hover < Notification < Modal |
| Gameplay 主空间优先级 | 哪个任务占有操作与退出流程 | Pause > Tool > Workspace > Management > Gameplay |

Surface Family 不是一条必须逐级增加 Alpha 的公式，也不是实际 z-index 列表。Tooltip 与 Rich Hover Card 共用 Hover 层，不是两个相互覆盖的层级。Dialog 同时具有 Elevated 的视觉和 Blocking 的交互语义。

## 已形成的页面家族

| 家族 | 主要视觉与构图 | 不应误迁移成 |
| --- | --- | --- |
| Gameplay HUD | 顶部紧凑状态与图标入口，四角辅助信息，世界中央留给城市 | 铺满屏幕的统计 Dashboard |
| Main Dock / Secondary Action Bar | 中下横向工具基座；图标先于短标签 | 一排普通表单按钮或手机菜单 |
| Left Context / Tool Parameter | 左下窄面板，裸图标标题，两列表单，Body 内滚动 | 每个参数套独立玻璃 Card |
| Catalog Workspace | 中下横向浏览空间，标题、左 Rail、顶部筛选、内容与分页 | 常驻右侧详情栏或无边界大图库 |
| Settings / Load / Save / New Game / Workshop Publisher | 共用全屏 Global Space 材质、Header / Footer，保留各自信息架构 | 把全屏页面塞进小型确认弹窗 |
| Pause | 独立阻塞空间，背景弱化与中央无颗粒 Command Surface 分离 | 给所有小弹窗共用的几何模板 |
| Management | 中央高密度阅读面板，专题色局限于 Header / 数据 | 每个专题一整套不同颜色的皮肤 |
| Hover / Popover / Dialog | 按只读、可交互、阻塞三种职责区分 | 一个通用浮层承担所有交互 |

Gameplay 外围 Safe Edge 通常为 16px，同级约 12px 间隔。Main Dock 与常规双层 Utility 同高 84px、底边 16px；Workspace / Operation Hints 消费 112px Bottom HUD Safe Offset。这些是既有布局，不是本轮建议重新调整的数值。

## Catalog：统一外壳，不抹平内容差异

### Design 资产条目

Design Workspace 基线约 1240×280，4 列×2 行。条目约 64px 高，左侧 64×64 方形 Preview，右侧名称和关键属性。名称承担主要辨识，Preview 辅助；不能把所有资源一律改成图大字小的商城卡片。

Design Asset Card 是一次性 Action Button。Hover、Focus、Pressed 是真实按钮状态，但点击进入工具不应留下伪造的持续 Selected。适用于材料/方案的选择态，不能机械套到所有 Design 条目。

### MaterialPreset / BuildingScheme

保持文字、颜色信息为主的 Compact Card，每页 **3 列×2 行，共 6 Slot**，条目约 64px 高。正面只保留名称、收藏星、色条/色组、一级分类和来源；表面质感等次级参数进入 Hover，不继续堆在第二行。

它们没有缩略图是已确认的设计，不是美术缺失。来源 Badge 跟随信息行，`···` 在右侧居中；不要为了与蓝图“统一”而补一套图片目录，也不要从 Design 机械复制 4×2 密度。

### Blueprint

Blueprint Workspace 基线约 1240×330，每页 4×1 张 Media Card，Preview 保持 4:3。图片覆盖 Card，底部暗渐变只承载名称和名称后的收藏星；来源 Badge 在左上，常驻 `···` 在右上。占地/尺寸、造价、构件、规模和说明进入 Rich Hover / 详情，卡片右下不再常驻占地。

Blueprint 的图片主导构图与 Design 的名称主导构图都属于同一 Catalog 家族。统一的是 Surface、状态、Badge、菜单和分页，不是强迫所有 Card 使用相同比例、尺寸、密度或阅读顺序。

Workshop Publisher 不属于 Catalog Workspace。它是作者侧全屏内容管理空间，复用 Global Space 家族；Blueprint Workspace 只保留浏览入口和进入 Publisher 的动作。多个“我的蓝图”可以组成一个 Workshop Content，不能为了发布管理在 Blueprint Workspace 右侧继续扩常驻管理栏。

### 来源、收藏与分页

MaterialPreset / BuildingScheme / Blueprint 的 System / Workshop / User 来源均保留菜单入口，菜单项按能力裁剪。收藏不要求条目可编辑；只有具有管理能力的用户资源提供对应编辑/删除。BuildingScheme 不因此虚构尚未实现的编辑功能。普通 Design Action Card 不因这条规则自动新增资源管理菜单。

左 Rail 提供收藏快捷筛选；已收藏名称后显示低权重熟铜星。来源 Badge 的低饱和蓝灰、暖灰等是来源信息，不是 Hover / Selected，也不能推广为整页主题。来源与菜单保持常驻但低权重，避免四角都堆文字。

Rail 分类 Selected 使用熟铜；Rail 当前页使用 Paper White 竖线，Content 当前页使用 Paper White 横线，其他页为灰点。单页仍保留方向正确的 Marker。分页与内容选择必须分得清，不能全部画金线。

## 控件与状态

普通 Hover 采用中性提亮；Selected / On 是持续状态；Focus 是独立可见轮廓，允许与 Selected 同时存在；Pressed 只是短暂反馈。Primary 表达推进，Cancel / Close / 完成即时编辑工具等不应仅因文字看起来重要就全部染金。危险与警告遵守材质规范的独立语义。

Numeric Parameter 保持 Label + Field 两列。Field 自己包含减号、Slider、加号、ValueButton；ValueButton 打开共享输入 Dialog，不恢复常驻输入框。Standard / Compact 是共享密度选项，不由每个工具重新定义滑块、步进器和字号。

普通 Slider 默认进度是浅中性灰，Thumb 为暖纸色，Focus 才切熟铜；一屏参数不应全部像正在被操作。Toggle 是一条 Track 和一个 Thumb，不恢复中间凹槽。可见图形与命中区分离，不能通过缩小命中区或文字解决拥挤。

弹出菜单的普通鼠标 Hover 不应额外出现选中边框；键盘 Focus 必须仍然可见。迁移时需区分鼠标 Hover、键盘 Highlight 和真实 Focus，不能简单删除所有焦点轮廓。当前共享 Select 的局部实现差异见本轮样式审查，不把旧组合选择器推广为新规范。

## 字体、图标与圆角

共享字号为 11 / 12 / 13 / 14 / 16 / 18px，语义以 Typography 文档为准；主要文字 Noto Sans SC，品牌标题保留 Noto Serif SC。数字优先稳定宽度。字体离线资源、Font Asset、Fallback 与 Player 观感仍需迁移验证。

必须区别共享档位与具体 Consumer 的最终值：

| 当前局部实现 | 来源 | 如何处理 |
| --- | --- | --- |
| Design Workspace 标题消费 Panel Title，即 16px；并非全都 18px | 最后段加载的 `wanhu-icon-led-header.css` | 复刻当前页时保留并核对，不能只读 Workspace Token |
| Design Card 标题 14.2px、Meta 10.5px | `workspace.css` 的共享 Card 规则 | 属于局部实现，不推广为所有控件字号 |
| Rich Hover 标题 15px、部分辅助字 10.2 / 10.5 / 10.6px | `hover-overlay.css` | 当前尚未全部收敛到共享档位，不宣称全局已统一 |
| Blueprint 名称 13.5px、独立图片遮罩与文本阴影 | `blueprint-workspace.css` | Media 内容变体，不用于普通表单 |

新增控件继续使用共享档位。发现现存例外时，先记录与对应页面核对；文档整理不等于批准顺手改字体或扩大面板。

普通图标使用 SVG Source Master → committed 64×64 PNG → UiIconId；显示尺寸 14 / 16 / 18 / 20 / 24px。不要将聊天里的 Emoji 或运行时 Lucide SVG 当正式资产。标题图标是裸图标，不再包图标底板。

圆角是尺度家族，不是单一常数：常用控件 8 / 10px，Rich Hover 14px，Workspace / Context 18px；共享 Modal 有自己的 12px Token。边缘可见程度随表面角色变化，不给每个面板套完整亮边。

## 底部命令与工具空间

Main Dock 固定 880×84。左 Mode Rail 为设计/蓝图上下两行，每行约 68×30，18px 图标在左、11px 文字在右；右侧 Category 是 24px 图标在上、11px 文字在下。Mode Active 不加状态线，Category Active 保留顶部短线，二者不能画成同一级按钮。

Secondary Action Bar 总高 84，带文字按钮 76×64，图标 24、下方标签 11。右下 Utility 保持纯图标，通过两行语义和分组留白区分主对象动作、开关与历史操作；不要把相同按钮再堆到中下栏。

Blueprint Photography 复用左 Context、中下 Action Bar、右下 Hints，中央静态 4:3 取景框只验证构图。Editor 是共用 Modal 材质的专用内容布局，不是另一套皮肤。重新拍摄只改变 Preview，不反推蓝图对象内容。

## Hover 与 Modal

Tooltip 负责简短解释，默认延迟 320ms；Rich Hover Card 负责对象详情，默认 460ms；框架关闭延迟 90ms。键盘 Focus 与相邻目标热切换走框架规则，不再每页复制延迟。

Catalog Rich Hover 固定在当前条目上方、水平居中，与 Anchor 留约 12px，做 Safe Edge / Clamp，不随条目内鼠标漂移。Hover 不接收 Pointer，不放可操作按钮；可交互内容使用 Popover。Modal 打开清理 Hover。

Rich Hover 不是加大版黑色 Tooltip：当前使用较亮灰底、内部暗遮蔽、浅细轮廓和投影。Modal 则是高不透明近黑 Backdrop 加独立烟墨 Panel；Backdrop 不是纯黑，Panel 不加颗粒、不再增加自身 Blur。完整 RGBA 和结构见材质规范。

## 动效与 Unity 落地

Motion 表达空间归属：底部内容向下收、左面板向左收、顶部内容向上收，中央窗口轻微下沉。共享时长 Fast / Control / Surface / Space 为 100 / 120 / 160 / 200ms，距离档位 4 / 8 / 12px。业务状态立即生效，退出开始停止输入，隐藏时再重绑内容；不动画大面板 Width / Height，不插值 Blur Radius，不用弹跳与扫光。

Theme → Surface → Controls → Shared Component → Feature 是职责关系，不是 `main.tsx` 的逐行导入顺序。迁移时按职责收敛 USS，不复制 Web 历史覆盖链。UXML 保持结构，USS 表达视觉与状态，C# 管理数据、Focus、Presence 和输入；结构状态线、Pager 与遮蔽层使用真实 VisualElement。

Unity 6.6 原生滤镜优先验证；共享 URP 场景 Blur 是有需要时的回退，不再是强制前提。当前 Dialog 不模糊后方 UI 是项目选择，不是“引擎不能”。原生 drop-shadow 也不能逐字替代 CSS 多重 box-shadow 的 inset / spread。

## 交付判断

新增或迁移页面至少对照同一家族的完整页面，检查常态、Hover、Focus、Selected/On、Disabled、菜单与 Modal，以及亮背景、夜景和缩放。颜色检查必须包含 Tint / Overlay / Filter / 前景，不只比较 HEX。

源码扫描、构建成功、截图已下载、截图已实际打开和 Unity Player 验证是不同事实，应分别报告。没有看到图，就不报告视觉已验收；没有运行 Unity，就不报告 USS、字体或性能已验收。

当前基线和已发现的文档/代码差异见 [视觉语言与样式权威审查](<代码审查/2026-09-24-视觉语言与样式权威审查.md>)。本轮总规范描述已有设计，不授权重新换肤或重做业务流程。
