# 2026-09-19 Material Palette Surface Tool

本轮建立右下“配色工具”的第一阶段 Vertical Slice。

## 完成

- World Utility “配色工具”正式进入 `material-palette` Tool；
- 中下建立 Surface / Lighting / Palette 三模式；
- Surface 可用，Lighting / Palette 暂时 disabled；
- Surface 左侧直接按 MaterialSlotValue / MaterialSlotFlags 语义绑定；
- 四个 Color 字段全部保留；
- SpecularSetup 由 Metallic / Specular Workflow 控制；
- SpecularHighlightsOff 使用玩家正语义“高光反射”反向映射；
- AlphaClip 使用 Toggle，并条件显示 Threshold；
- PBR 参数：Metallic / Smoothness / Occlusion；
- Texture UI 只保留 Tiling / Blend Sharpness；
- Context Utility 第一阶段只保留 Undo / Redo；
- Material Tool 不显示 Gameplay Operation Hints；
- UI Review 覆盖 Launcher → Metallic → Specular + Alpha → Complete → Gameplay。

## 暂不实现

- Lighting Mode 内容；
- Palette Mode 内容；
- TextureSetDefinition；
- TextureMappingSpace；
- TextureOffset；
- TextureRotationRadians；
- 材质吸取 / 应用范围。


## Workflow 控件视觉收束

原 Surface Workflow 直接复用共享 Filled SegmentedControl，Active 金属块视觉过重。

已改为 Material 专用控件：

- 弱圆角 Neutral Track；
- 金属 / 高光两项不使用大面积 Fill；
- Active 文字轻提亮；
- Active 底部使用短熟铜 Selection Line；
- 使用真实 Indicator Element，便于 Unity UI Toolkit 映射；
- 不修改其它页面的共享 SegmentedControl。


## Workflow 第二次视觉收束

短下划线方案仍然过于接近网页 Tab，与 Surface 面板的圆角输入框 / Slider / Toggle 语言不统一。

已进一步改成 Compact Neutral Selector：

- 宽度约 160px，不再铺满参数区域；
- 高度约 28px；
- 使用弱中性圆角 Track；
- 两项之间只有极弱中性分隔；
- Active 使用 Paper White 文字 + 4px 熟铜状态点；
- Active 只有极弱熟铜 Tint；
- 删除下划线 Selection Line；
- 与下方 Metallic 行保持普通参数间距。


## Workflow 第三次几何修正

Compact 160px 方案仍然产生 Field Column 断裂：Workflow 使用自定义 92px Label + 10px Gap，而 NumericSliderField 使用共享 78px Label + 6px Gap，导致左边界不一致；同时 Selector 总宽度由内容逻辑决定。

已修正：

- Workflow Row 直接使用共享 `ui-parameter-row` 两列结构；
- Workflow Control `width:100%`，吃满 Field Column；
- 左边界与 Metallic / Smoothness / Occlusion 的 NumericSliderField 对齐；
- Workflow 总宽度与 NumericSliderField 一致；
- 2 个按钮各 50%，以后 N 个按钮只等分内部空间，不改变控件总宽度；
- 保留 Neutral Track + 小熟铜状态点视觉。


## 共享 Color Editor 二级页

Surface Color Row 不再使用浏览器原生 Color Input 直接编辑。

新增同一 Left Context Host 内的二级页：

- BaseColor → Standard + Alpha；
- EmissionColor → HDR + Intensity；
- NightEmissionColor → HDR + Intensity；
- SpecularColor → Standard；
- Surface ↔ Color Editor 使用 12px Translate + Opacity；
- Header Back 返回 Surface，Close 仍退出整个 Material Tool；
- Color Editor 提供 SV / Hue / Hex / Reset；
- HDR Intensity 是 UI Adapter，不新增 Runtime 持久字段；
- NightEmissionColor 在产品定义中升级为 HDR，Unity Inspector 元数据后续需同步。


## Surface Footer / Workflow / 精确颜色编辑

本轮继续收束 Material Palette：

- Workflow 从 PBR 参数区移动到 Surface Body 最底部；
- Metallic 模式隐藏 SpecularColor；Specular 模式隐藏 Metallic；隐藏值不清空；
- PlacementContextPanel 正式支持透传 Left Context Footer；
- Surface Footer：恢复默认 / 复制参数 / 粘贴参数；
- Surface Clipboard 保存完整 Draft，包括隐藏工作流值与 HDR Adapter；
- Color Editor Footer：恢复默认 / 复制颜色 / 粘贴颜色；
- Color Clipboard 保存 Hex / Alpha? / HDR / Intensity?，支持 Standard/HDR 跨类型粘贴；
- Color Editor 增加常驻 HEX；
- 精确数值区增加 RGB / HSV 模式切换；
- RGB 使用 0–255；HSV 使用 H 0–360° / S,V 0–100%；
- 不同时显示 RGB+HSV 六条 Slider，避免 400px 面板过长；
- Clipboard 为 Tool Session 状态，不依赖 Web Clipboard API，方便迁 Unity Controller。


## 方案驱动 Surface / 2×2 Color Cards

Surface 首页进一步从参数表单收束成材质方案编辑器：

- 顶部新增当前方案卡：类型 / 名称 / 四色缩略；
- 新增 Preset Library 二级页；
- 内置木头·深胡桃 / 瓦片·青灰瓦 / 墙面·素灰墙；
- 方案库支持筛选、应用、保存当前为自定义、删除自定义；
- 自定义方案当前只存 Tool Session；
- 任意手动编辑参数 / 颜色 / Workflow / Paste 后，当前方案切到“自定义 · 未保存”；
- 颜色入口改成固定 2×2 卡片：
  - 第一行：主色 / 高光颜色；
  - 第二行：发光颜色 / 夜间发光；
- Surface Color Card 不再显示 HEX；
- 高光颜色在 Metallic 下保留 Card 位置但禁用，Specular 下启用；
- 删除 Surface 的高光反射 / Alpha 裁剪 / AlphaClipThreshold UI；
- Metallic 在 Specular Workflow 下直接隐藏，隐藏值仍保留。


## 方案入口与颜色卡几何收束

顶部方案入口从信息卡进一步收束为单行选择器：

- 结构固定为“类别 Tag + 方案名 + 进入箭头”；
- 删除“当前方案”提示行；
- 删除顶部四色缩略，避免和颜色区重复；
- 控件高度约 40px，不再使用三行文字堆叠。

颜色区从 2×2 改成 4×1：

- 顺序固定：主色 / 高光 / 发光 / 夜间发光；
- 四张 Card 必须同一行、等宽；
- Surface 使用短标签；Color Editor 仍使用完整字段标题；
- UI Review 直接测量四卡的 Y 与 Width，避免后续回退到两行。


## Surface 去卡片化重构

4×1 独立 Color Card 仍然导致 Surface 充满小盒子，本轮进一步减少视觉容器：

- 方案入口从有边框 Selector 收成行式导航：方案 + 类型·名称 + 箭头；
- 默认无完整边框/背景，只在 Hover / Focus 时轻提亮；
- 四张独立 Color Card 合并为一个共享 Color Strip；
- Color Strip 父节点拥有共享边界，四个 Item 不再各自拥有完整边框；
- 色块成为每列的主要视觉面积，HDR 只保留轻量 metadata；
- “表面 / 贴图”合并为单一“材质属性” Section；
- PBR 与 Texture 只靠间距分组，不再使用两个强 Section 标题；
- Material Surface 内部的 Stepper / Value 默认边框进一步弱化，Hover / Focus 才回升；
- Workflow 去掉完整 Track，改成 Active 实点 / Inactive 空心点的 Inline Choice。

## 材质方案迁出 Left Context

方案浏览已从左侧二级页迁出，改成 Material Tool 内部的中央 Workspace：

- 左侧 Surface 参数始终保持；
- 点击“方案”后，在中下 ToolActionBar 上方打开 MaterialSchemeWorkspace；
- Workspace 使用与 Design Workspace 相同的 Work Surface 家族；
- 系统方案 / 我的方案两页；
- 系统方案使用分类 Rail + 2×3 Card Pool + Pager；
- Web Demo 暂放 9 个演示预设验证两页分页；
- Apply 后 Workspace 保持打开，左侧参数实时刷新；
- 我的方案支持保存当前 / 应用 / 删除；
- 自定义方案仍只在 Web Tool Session 内保存；
- 默认 Metallic 下 SpecularColor 完全隐藏；
- Specular 工作流颜色顺序固定为 Base / Emission / NightEmission / Specular。


## 材质方案卡改为结果预览

原中央 MaterialSchemeWorkspace Card 直接展示 Base / Emission / NightEmission / Specular 四色拼条，并常驻“工作流 · 光滑数值 · 铺贴数值”。多数系统方案的发光与夜间发光为黑色，导致卡片的大部分面积没有区分度。

本轮改为：

- 删除四色拼条；
- Card 左侧使用单个大材质样片，BaseColor 为主色；
- Web 样片用固定受光 + 极弱木头 / 瓦片 / 墙面类型纹理表达材质感；
- 右侧只保留类型、名称和粗糙 / 哑光 / 偏哑光 / 光滑；
- 不显示“中等纹理”等纹理粒度文字；
- 不常驻显示 Smoothness / TextureTiling 数值；
- 正式 Unity 可把同一 Preview 槽替换成预生成 MaterialPresetThumbnail，不改变卡片信息架构。


## 材质方案与 Design Workspace 统一

上一轮横向材质样片虽然替代了四色条，但 Material Scheme Card 仍自己维护 72×50 Preview、3×2 Card Pool、Border 与 Typography，视觉上脱离建筑 Workspace。

本轮改为直接复用 Design Workspace 母版：

- 抽出共享 WorkspaceItemCard 到 workspace.css；
- DesignWorkspace 与 MaterialSchemeWorkspace 同时使用同一 Card Surface / Typography / Hover / Focus；
- 状态线改为真实元素，便于后续映射 Unity UI Toolkit；
- 材质 Preview 改为 64×64、1:1；
- Material Scheme 改为 4×2，每页 8 项；
- 9 个系统方案第一页 8 个、第二页 1 个；
- 卡片信息收成“名称 / 类型 · 质感”两层；
- Material 只保留 Current、材质样片纹理、删除自定义方案等业务差异；
- Workspace Rail / Card Grid 继续消费 Design Workspace 共享几何，不再维护独立 920px / 3 列布局。


## 材质方案缩略图进一步收束为细色线

对 1:1 材质样片进行实际截图复核后，确认当前 Web Demo 没有真实材质贴图 / Thumbnail 时，纯色方块和 CSS 模拟纹理都会制造低质量占位视觉，反而削弱方案名称的识别。

本轮继续收束：

- 删除 Material Scheme Card 的 64×64 Preview；
- 删除 CSS 模拟木纹 / 瓦纹 / 墙面纹理与固定受光；
- WorkspaceItemCard 保持共享，但 Preview 槽对 Material 为空；
- Card 第一行只保留方案名；
- 第二行改为 38×3px BaseColor 细线 + “类型 · 质感”；
- BaseColor 只作为低权重辅助信息，不再作为主视觉；
- Current 状态继续使用左侧熟铜状态线，避免和 BaseColor 语义冲突；
- UI Review 增加断言：Material Card 不得出现 Preview / 四色条，色彩表达必须保持细线级别。


## 材质方案升级为来源资源库

本轮继续让 MaterialSchemeWorkspace 向建筑 Workspace 的资源目录结构靠拢，不再使用“系统方案 / 我的方案”两页切换。

结构调整：

- 左侧 Rail 继续固定为全部 / 木头 / 瓦片 / 墙面；
- 顶部改为来源筛选：全部 / 系统内置 / 创意工坊 / 我的方案；
- 来源筛选和左侧材质分类组合生效；
- 右上新增“保存配色 / 粘贴配色”；
- 保存配色直接读取左侧当前 Surface Draft，并写入“我的方案”；
- 粘贴配色复用现有 Surface Clipboard，不建立第二套 Clipboard；
- 保存方案保留当前材质类别，避免自定义方案无法被左侧类型 Rail 筛选；
- 增加 3 个创意工坊演示方案用于验证来源筛选，正式 Unity 后续替换为 Workshop / Mod 数据源；
- Card 第二行增加来源 Badge，并继续保留极弱 BaseColor 细线和“类型 · 质感”；
- 我的方案仍支持删除；
- UI Review 增加来源筛选、组合筛选、Workspace Action、来源 Badge、保存 / 粘贴 / 删除完整流程。


## 我的方案命名、重命名与分类整理

本轮完成材质资源库的玩家方案管理闭环：

- 保存配色不再自动落名，改用共享“名称 + 分类”Dialog；
- 保存时可选择木头 / 瓦片 / 墙面，默认继承 CurrentCategory；
- 增加我的方案名称去重验证；
- 我的方案 Card 增加 Hover / Focus 管理菜单；
- 管理菜单支持重命名、移动到、复制参数、删除；
- 移动分类同时支持菜单和拖到左侧 Rail；
- 全部只作为 Filter，不允许成为 Drop Target；
- 系统内置 / 创意工坊保持只读，不出现编辑菜单；
- Move 统一由 Overlay Command 更新数据，Drag 与 Menu 不各写一套状态；
- 移动后 Toast 提供“撤销”动作；
- 复制参数复用现有 Surface Clipboard；
- 删除使用共享 Confirm Dialog；
- Dialog System 新增通用 ChoiceInput Dialog，用于“文本 + 单选分类”表单；
- Toast System 增加可选 Action，用于撤销等短生命周期操作。


## Material Family 分类体系定型

材质方案分类从“木头 / 瓦片 / 墙面”升级为真正的 Material Family：

- wood / stone / metal / masonry / plaster-earth / fabric / glass / lacquer / other；
- 中文显示：木材 / 石材 / 金属 / 砖瓦 / 灰泥 / 土 / 布料 / 玻璃 / 漆饰 / 其他；
- “全部”只作为 Filter；
- 左 Rail 使用两页分类 Pager；
- 原木头方案迁到 wood，瓦片迁到 masonry，墙面迁到 plaster-earth；
- MaterialPreset 数据字段由 type 改为 family；
- CurrentCategory 改为 CurrentFamily；
- 左侧当前方案显示 Family 中文名。

Card 信息架构同步调整：

- 来源 Badge 从第二行移到第一行右上；
- 第二行只保留 BaseColor 细线 + Family · Finish；
- 我的方案菜单的分类按钮从一级菜单移除；
- 一级菜单改为“重命名 / 移动分类… / 复制参数 / 删除”；
- “移动分类…”进入独立二级可滚动 Family Picker；
- Save Dialog 的分类从横向 Radio 改为 Dropdown；
- Drag Drop 只处理当前 Rail 页可见 Family，跨页移动使用 Picker。


## 保存 / 编辑 / 拖拽流程收敛

对 Material Family、保存 Dialog、我的方案菜单与 Drag Drop 再次做交互审查后，删除了不必要的操作层级：

- 9 个 Material Family 在 Save / Edit Dialog 中改为 3×3 平铺，不再使用 Dropdown；
- Save 与 Edit 共用 ChoiceInput Metadata Dialog；
- 我的方案菜单从“重命名 / 移动分类… / 复制参数 / 删除”收敛为“编辑 / 复制参数 / 删除”；
- Edit 一次可同时修改 Name + Family；
- Overlay 的 rename / move 两套回调合并为 UpdatePresetMetadata；
- Drag Move 继续只改 Family，但成功后自动切换 Rail Page + Family Filter + Content Page；
- Edit 修改 Family 同样自动导航到目标分类；
- 移动操作删除 Undo Toast；
- 使用局部 Card Reveal Highlight 作为完成反馈；
- 保存新方案同样自动进入我的方案 + 新 Family，并定位新 Card；
- Source Filter 在 Edit / Drag Move 时保持不变。
