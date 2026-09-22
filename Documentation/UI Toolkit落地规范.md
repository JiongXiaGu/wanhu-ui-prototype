# UI Toolkit 落地规范

最终运行时基线为 **Unity 6.6 + URP + UI Toolkit**。Web Prototype 继续服务美术、比例、信息架构和交互验证；不将 React DOM 或 CSS 逐字翻译成 Unity 产品架构。

本轮只升级视觉基线与迁移前提，不改变 GameplayUiState、空间优先级、工具数据所有权和已确认的玩家流程。

## 实现权威与版本

具体实现以代码和测试为准；正式文档记录稳定契约。版本能力应先查对应 Unity 官方资料，再在项目安装的 6000.6 补丁版 Player 上验证。

原生 `backdrop-filter`、`filter: drop-shadow(...)`、适用的渲染条件和回退决策统一见 `Documentation/Unity 6.6视觉能力与回退规范.md`。历史记录中的“UI Toolkit 无法模糊后方 UI”“阴影必须全部使用图片”“所有 Blur 必须定制 URP Pass”不再作为当前能力限制。

原生能力不表示 Web 与 USS 所有语法完全等价，也不表示已测得性能收益。

## UXML / USS / C# 分工

UXML 持有稳定结构；USS 持有布局、前景与材质语义、伪状态和 Transition；C# 持有业务状态、数据绑定、事件、Focus、Presence 生命周期与输入屏蔽。Gameplay 的 Persistent Operation Hints 必须是稳定 UXML Host，由 C# Context Resolver 更新 ViewModel，不由各 Feature 自行创建 / 删除。

不通过 Visual Tree 查询结果推断业务状态，不把 DOM 顺序作为 ToolOrigin 或选中状态的事实来源。状态由 Controller 提供，视觉类由该状态派生。

布局以 Flex-friendly 行列为主。固定容量目录使用明确 Row / Slot，较长列表使用池化或 ListView / MultiColumnListView。浏览器 Grid、伪元素、Mask 和剪贴板 API 只能停留在原型实现或 Web Adapter 层，并明确 Unity 等价物。

## 样式所有权

| 层级 | 职责 | 不允许承担 |
| --- | --- | --- |
| Theme / Typography | 色彩、字号、图标档位、公共尺寸 | 页面局部排版 |
| Surface | 背景 Tint、滤镜完整配方、阴影和表面重量 | Slider / Toggle 的内部结构 |
| Controls | 控件内部尺寸、Hover / Selected / Focus / Disabled | 独立业务皮肤 |
| Shared Component | Workspace / Context / Dialog 等结构和比例 | 每个页面重新定义公共状态 |
| Feature | 内容布局、字段、可见状态和必要差异 | 覆盖公共控件基础字号与材质 |

修改在现有所有者中完成，不新增最后加载的补丁皮肤。迁移时不复制历史 CSS 的层层覆盖；一个属性必须有明确的最终所有者。局部例外通过语义变量或组件 Variant 表达，不使用泛化的 `aside button` 等选择器污染其他组件。

本轮 Archive 基础规则与后续覆盖在原文件内收敛；Management Skin 不再重新定义 Inventory 的内部样式。其余既有 CSS 债务需结合审查继续处理，不宣称整个仓库已完全清理。

## 文字、图标和缩放

正式档位见 `Documentation/UI Typography与Icon尺寸规范.md`：紧凑标签 / 元信息 11px，按钮 / 工具正文 12px，持续阅读 13px，分组 14px，Context 标题 16px，Workspace 标题 18px。

同一语义共用同一档位。不要用缩小字号、transform scale 或缩小命中区解决内容拥挤；先检查字段、换行、宽度与正确滚动区域。数字采用稳定宽度与一致单位规则。

保持 1920×1080 设计参考。Unity 使用统一 PanelSettings 缩放策略，需在实际 Player 检查 1080p、1440p、4K 和不同宽高比；不维护另一套数值全部翻倍的 4K USS。浏览器缩放测试仅验证 Web 逻辑画布，不替代 Unity DPI 和字体渲染检查。

Noto Sans SC 继续用于主要界面，品牌标题保留 Noto Serif SC。Unity 迁移需固定授权字体文件、字重、Font Asset、中文 fallback 与字符覆盖，不能假设浏览器字体和 Unity 自动一致。

普通 Icon 使用 `UiIconId → 64×64 PNG → Sprite + Tint`。SVG 只作 Source Master，Lucide 只允许出现在 Source Generator，不重新接入 src Runtime。图标显示档位仍为 14 / 16 / 18 / 20 / 24px。Pager / Selected Line / Divider / Toggle / Slider 属于结构元素，不进入图标资源管线。

## Surface、滤镜和回退

全部 Surface 使用中性或略暖 Smoked Graphite，Paper White 负责阅读，Aged Brass 负责状态。Context、Work、Blocking、Elevated 通过密度与层级区分，不靠蓝绿换色。圆角继续采用 8 / 10 / 14 / 18px 的既有层级。

可读性由背景 Tint 和前景对比保证，Blur 不承担基础可读性。半透明材质不能通过父节点整体 opacity 让文字一起变淡。Context / Work 的正文区域比 Header 更稳，不为每个 Section 添加新的玻璃 Card。

Unity 6.6 下优先验证共享 Surface 配方驱动的原生滤镜；不是每个 Panel 再分配一套自定义 Blur RenderTexture。原生效果若不满足目标成本或特定世界采样需求，才选择共享 Scene Blur / URP Pass 作为回退。低画质至少保持 Tint + 边缘的无 Blur 路径。

Dialog / Pause Panel 目前不增加 UI-over-UI Blur，不恢复颗粒磨砂。这是保留已确认的美术和成本选择，而非声称引擎不支持。原生 drop-shadow 不等价于 CSS box-shadow 的 inset / spread；需要内高光、复杂材质或可控离线阴影时，仍可使用边缘节点、9-slice、纹理或自定义绘制。

昼夜共用 Palette，只允许调整 Surface 自身密度和轻微明度。不得让植被背景把正文区域染成墨绿，也不得夜晚切换为独立蓝色主题。

## 共享控件

普通按钮 Hover 使用中性提亮，Selected / On 使用熟铜，Focus 使用独立轮廓并允许与 Selected 同时存在。边框空间事先预留，焦点切换不改变外部布局。

Numeric Parameter 的稳定结构：

```text
RuntimeParameterRow
├ Label
└ NumericSliderField
   ├ Decrease
   ├ Slider
   ├ Increase
   └ ValueButton
```

外层只有两列，Field 填满剩余宽度。NumericSliderField 只允许共享 `standard / compact` 两种 density：Standard 用于 Settings、Building Selection / Appearance 等普通阅读面板（Stepper 30、Value 68）；Compact 用于 Placement / Road / Terrain 等高密度工具（Stepper 28、Value 58）。Feature 不直接覆写 Slider 高度、Stepper 或 ValueButton 宽度。ValueButton 打开共享输入弹窗，不恢复常驻输入框。

Toggle 保留一条普通 Track 与一个 Thumb，不恢复中间凹槽。可见图形与命中区分离；禁用时仍可辨认原本的值。

可滚动区域统一使用 `ui-scroll-region` 语义类；Web 的 6px Scrollbar、Thumb / Hover Tone 由 `ui-control-system.css` 持有，Settings、LeftContextPanel 等 Feature 只声明 `overflow` 与可用高度。Unity 迁移时该语义映射到共享 ScrollView / Scroller USS，不复制 Settings 私有滚动条。

ColorParameterField 仍采用 Label + Button，其中包含 ColorPreview 和可选 HDR / Chevron 元信息。实际颜色编辑由 SharedColorEditor 负责，RGB / HSV 同时只挂载一组通道；HDR Intensity 是编辑 Adapter，最终合成为颜色值，不扩大 Runtime 持久字段。

连续颜色拖动按 BeginEdit / Preview / Commit 汇总为一次 Undo Transaction，Clipboard 由 Controller 持有，不依赖系统剪贴板。

## 空间、输入和 Motion

优先级保持 `Pause > Tool > Workspace > Management > Gameplay`。输入使用 New Input System，世界操作和 UI 操作不能在同一次输入里重复消费。

Main Dock、Placement Action Bar、Context Utility 仍是同一个 L / M / S 家族。右下只有一个 Utility Host，随 World / Selection / Placement Definition 重绑；Width 在隐藏阶段切换，不做 Layout Animation。真实 Placement 的 Definition 明确声明两行：Action Row 与 Toggle / History / optional Danger Row；两行语义由数据定义和稳定 UXML 容器表达，不通过元素 ID 或 USS 位置猜测。中下 Placement Main Action Bar 只持有主模式与完成/取消。

Presence 仍为 entering / steady / exiting / hidden。业务状态立即生效，退出开始即关闭 Pointer / Keyboard Interaction；C# 控制 PickingMode、延迟隐藏、Focus 交还和 Rebind，USS 表达 opacity / translate。

共享时长：Fast 100ms、Control 120ms、Surface 160ms、Space 200ms。Tooltip Delay 约 320ms，细节按 Motion 规范。禁止大型 Surface Width / Height 动画、明显 Bounce、大量 stagger 和 Blur Radius 插值。原生 backdrop-filter 的 Transition 不作为当前实现路径。

Workspace 的 Primary Rail 与 Context Filter 是独立维度；Rail 滚轮翻分类组，Content 滚轮翻内容组，一次有效手势只翻一组。分页仍可通过鼠标、键盘和手柄操作，滚轮不是唯一入口。

Tooltip 统一处理延迟、位置、屏幕边缘修正与快捷键文案，不使用浏览器原生 Tooltip 作为最终方案，不让完成基础操作依赖悬停说明。

## World 与 UI 的边界

Terrain Brush、道路与城墙路径、Gate / Stair Clearance、树木预览和真实配色材质属于 World Controller / Renderer / Command History。Web 中对应的 DOM 预览不迁入 UI Toolkit。

UI 只绑定参数、状态与命令。ToolOrigin、开放城墙路径 Facing、Gate 的独立放置和连接、楼梯高低反向等既有语义不得由此次视觉升级改写。具体行为遵守对应工具文档与当前代码。

实时 Preview 需要时使用受限数量的 RenderTexture，按可见 Slot 分配与复用；不要为全部资产长期维护实时预览。现有固定 4×2 Workspace 目录适合 Slot / Pool，存档和居民等长列表使用虚拟化。

## 迁移门槛

每个新增 UI 需说明 UXML 层级、USS 所有者、C# 状态拥有者、Asset / Filter 需求、Pool / ListView 策略、Motion Preset 和键鼠 / 手柄 Focus。

Runtime CSS 禁止 :has()。新私有 backdrop-filter、未声明属性的 Transition、大型尺寸动画以及业务状态依赖 DOM 都应阻止继续扩写。已有浏览器特性可以在映射明确时保留，不为纯实现差异大规模重做已经确认的 UI。

第一条 Unity 验证链继续采用 Top Shell → Main Dock → Design Workspace → Context Utility → Building Placement → Shared Dialog / Tooltip / Motion，再覆盖 Settings / Archive / Management 与其他 Tool。

Web Build、UI Review、实际审图与 Unity Player 验收是不同证据。当前仓库能验证前者；后者需在真正的 Unity 6.6 工程验证字体、输入、URP 配置、原生滤镜、批次、性能和焦点。


## Placement Bottom Command Architecture V2

真实 Placement 页统一使用同一底部空间契约：

- 中下 Placement Main Action Bar：只承担放置主模式、完成与退出；高度 84px，bottom=16px。模式与流程动作使用 20px 图标 + 12px 短中文文字，额外高度用于 60px 操作命中区和呼吸感，不放大图标。
- 右下 Placement Utility：高度 84px，bottom=16px，固定两行。第一行只放 Primary Object Action；第二行放 Toggle / Secondary Action / History / 可选 Danger。
- Utility 两行均为 36px，按钮 36×36，行间距 4px，上下 padding 4px，图标 20px。
- Undo / Redo 固定在第二行相邻 History Group；Danger 只有存在真实删除/拆除能力时才挂载，并固定第二行最右。没有业务能力时不显示 Disabled Trash。
- Building 第一行只保留旋转左 / 旋转右 / 镜像；对齐道路 / 校准基底下移第二行。Road、城墙 / Gate / Stair 的主要对象变换保持第一行。
- Tree 的刷子 / 单棵属于中下主模式；单棵对象存在时，移动 / 旋转在右下第一行，删除在第二行最右 Danger；刷子或对象不存在时这些组直接隐藏。
- Terrain Edit、Color Tool、Building Selection 等非 Placement 空间不机械套用此规则。

ContextUtilityToolbar 的 Definition 自身持有 layout + rows + role + groups，不允许依靠按钮 ID 或 CSS DOM 顺序推断行职责。迁移到 UI Toolkit 时对应稳定 UXML Row 容器；业务状态由 Controller / ViewModel 提供。


### Placement Utility 紧凑布局不变量

所有真实 Placement 的右下 Utility 必须同时满足以下不变量：

- 高度固定 84px，两行均使用 36px 命中区，行间距 4px；
- 面板宽度由当前可见内容决定，不使用统一固定宽度；按钮少的工具必须自然缩短；
- 第二行整体向右对齐，右边缘与 Utility 内容区右边缘对齐；
- **第二行可见图标数量必须严格多于第一行**，这是所有 Placement 状态的硬性结构规则，而不是视觉建议；
- 第一行只放 Primary Object Action；第二行按“Toggle → Secondary Action → Undo / Redo → optional Danger”的顺序组织；
- Undo / Redo 固定相邻；Danger 若存在必须最右；没有真实危险动作时不显示占位或 Disabled Trash；
- Building Placement 第一行固定为左转 / 右转 / 镜像；对齐道路 / 校准基底下移到第二行，位于 Toggle 之后、Undo / Redo 之前；
- 状态切换后仍必须重新满足“第二行图标数 > 第一行”，例如 Tree Brush、Tree Single、City Wall Range / Fixed Width、Gate Free / Connected 都要独立验证。

Web Prototype 可以使用绝对定位元素的内容收缩验证该视觉结果；迁移 Unity UI Toolkit 时不得复制固定像素宽度，应由共享 Placement Utility Host 根据两行可见项的 preferred width 取较大值。行语义与图标计数来自 Definition / ViewModel，不从 USS 位置反推业务状态。


## Persistent Operation Hints Host

Gameplay Operation Hints 是 Gameplay 级常驻 HUD Host，不属于某一个 Tool 或 Feature。

稳定规则：

- 除 Pause 外，只要仍处于 Gameplay Screen，就必须恰好挂载一个 Operation Hints Host；
- World、Design Workspace、World Selection、Selection 内 Workspace、Terrain / Tree / Color / Placement Tool、Camera / Weather Context、Management 都只允许 Rebind Context，不允许自行隐藏 Host；
- Feature 不得通过 `selection === null`、`tool !== xxx`、`space !== management` 等条件决定 Operation Hints 是否存在；
- Context Resolver 优先级为 Tool → Selection Workspace → Selection → Design Workspace → Management → Context Panel → Information View → World Mode → Default World；
- Hints 只描述当前真实输入语义，不因为界面上存在按钮就虚构键盘快捷键；
- 右侧槽位与 Context Utility 共用 16px Safe Edge：Utility 存在时 Hints 位于其上方并保留约 12px 间距；没有 Utility 的 Management 中，Hints 直接落到底部 Safe Edge；
- Management Blocking Panel 仍为主要操作面，Hints 位于其右侧外部，不覆盖 Blocking Surface；
- Pause 会截断世界与二级界面输入，因此隐藏 Hints；恢复后按当前 Context 重新绑定。

当前已定义的 Context 包括 Default World / Demolition、Design Workspace、Building Selection / Building Scheme、Building / Road / Tree / City Wall / Gate / Stair Placement、Terrain 五模式、Color Surface / Lighting / Scheme、Camera / Weather、Information View 和 Management。

Unity UI Toolkit 迁移时保留单一稳定 UXML Host，由 Gameplay HUD Controller 提供 HintContext / rows ViewModel；切换 Context 只更新内容，不销毁再创建 Host，也不允许 Feature Controller 直接控制其 Display。
