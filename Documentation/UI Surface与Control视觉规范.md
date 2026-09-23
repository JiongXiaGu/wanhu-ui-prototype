# UI Surface 与 Control 视觉规范

本文件维护跨空间表面、控件和动作的组合语义。视觉入口见 [UI Toolkit 视觉总规范](<UI Toolkit视觉总规范.md>)；所有精确颜色与背景配方见 [烟墨熟铜视觉材质规范](<Wanhu 烟墨熟铜视觉材质规范.md>)；基础控件内部结构见 `UI基础Control视觉规范.md`。

## Surface 角色

| Family | 职责 | 主要 Consumer |
| --- | --- | --- |
| Ambient | 低干扰常驻辅助 | System Menu、World Utility、Operation Hints 等 |
| Context | 临时观察、调参和局部信息 | Camera、Environment、左侧 Context |
| Work | 持续浏览与执行任务 | Catalog Workspace、Main Dock、Secondary Action Bar |
| Blocking | 明显压住世界的完整任务 | Management、Pause、Settings、Archive |
| Elevated | 覆盖其他 UI 的表面 | Hover、Popover、Dialog |

这些是任务角色，不是统一 Alpha 阶梯、固定 RGB 或全局 z-index 顺序。Dialog 可同时是 Elevated 外观与 Blocking 交互。Context 与 Work 属于同一低饱和烟墨家族，不要求字面上完全相同色相。

表面重量来自面积、底色、叠层、前景、投影和内容密度。不能只降低 Alpha 就称为“轻量”。常态半透明放在材质背景，不能把整个父节点连文字一起变淡。

## 圆角与边缘

常用尺度包括小型选项 8px、普通控件/Tooltip 10px、Rich Hover 14px、Workspace/Context 18px；Modal 另有共享 12px Token。Card 与命令栏保留组件的具体几何，不能给全项目批量套同一圆角。

边缘是轮廓，不是金色装饰框。大工作区使用弱边、渐变与阴影；Hover 等浮层可保留更清楚的浅边及内部遮蔽。实际 Edge / Shadow 必须沿当前加载链核对，旧 Elevation Pass 不是所有属性的最后所有者。

## Blur 与背景弱化

Context / Work 的基础阅读来自自身 Tint，Blur 只弱化背景细节。Global Space、Pause 和 Management 分别保留自己的场景弱化与面板结构，不假定全都使用同一种滤镜。

Unity 6.6 原生效果与回退见 `Unity 6.6视觉能力与回退规范.md`。优先验证共享 Surface 配方驱动的原生效果；共享 URP Scene Blur 是需要时的回退，不再强制所有表面使用自研 Pass。不能把本项目不使用某种 Blur 写成引擎不支持。

不为按钮、列表行和每个 Panel 各建一套私有 Blur。Dialog Backdrop / Panel 当前不加 Blur、Panel 无 Noise；Pause Panel 自身无 Blur，但 Pause 场景层仍有弱化滤镜。低画质应至少保持 Tint 与可读前景。

## Button 与状态

Secondary 用于返回、取消和普通流程动作；Utility 用于低频辅助操作；Primary 表达当前任务推进。它们共享中性 Hover、独立 Focus 和禁用反馈，Primary 允许弱熟铜 Surface 与强调前景，但不使用厚金边。

Selected / On 是持续状态，Pressed 是短暂反馈，Focus 是输入目标。不得为了让 Action Card“看起来有反馈”而留下假的 Selected，也不能删除 Focus 来消除普通 Hover 的边框。

警告与危险通过共享 Dialog Tone 表达：Warning 使用熟铜 Header Tint 和细线；Danger 使用朱砂 Header Tint 和细线。Body 保持中性，不能整张窗口染色。

## Segmented、Toggle 与参数

Segmented 适用于少量 2–5 项互斥模式，不替代一级导航、一次性动作、On/Off Toggle 或大量天气/分类目录。外壳是弱控件床，选项默认透明，Hover 中性、Active 弱熟铜；不额外加粗金框。

Numeric Parameter 使用 Label + Field 两列；Field 的 Stepper、Slider 和 ValueButton 尺寸由 Standard / Compact 共享密度决定。ValueButton 打开共享输入 Dialog。Slider 默认中性进度，Focus 使用熟铜；Toggle 保留普通 Track + Thumb。长内容由正确区域滚动，不靠缩小字体处理。

## 全屏与底部命令栏

Settings / New Game / Load / Save 共用 `global-space-footer`，弱分隔、统一按钮家族，不形成额外的大黑条。允许 Settings 右側留白，不为对称虚构按钮。

Main Dock / Secondary Action Bar / World Utility 是 L / M / S 命令家族，材质不同于表单字段。共享尺寸与排列见 `Bottom Command Visual System设计规范.md` 和 Typography 规范；Mode 与 Category 不使用完全相同的按钮排列。

## 管理专题与目录内容色

Management 的 Topic Accent 只进入 Header、Bare Icon、图表或数据强调；Root / Body / Section 仍使用统一烟墨材质，交互状态仍使用共享 Controls。来源 Badge、收藏星和配色预览亦是内容语义，不建立另一套 Hover / Focus。

Compact 与 Media Catalog Card 共享 Badge、菜单、分页和状态语言，但保留文本/图片主导的差异。不要以“少 Card”删除资源目录，也不要以“统一”给文字方案强加缩略图。

## 样式和 Unity 所有权

Theme 持有语义值，Surface 持有完整背景与滤镜，Controls 持有内部结构与状态，Shared Component 持有公共布局，Feature 持有内容和必要业务差异。这是职责关系，不是 CSS 的实际加载顺序。

迁移时可按 UISurface、UIControls、BottomCommand、FullscreenActions 等职责组织 USS，但不是要求凭这些名称创建一套与现有框架并行的新系统。UXML 用真实元素表达状态线、Pager 和遮蔽层；C# 提供状态、Focus、输入和生命周期。不要复制层层历史 CSS Override 到正式 USS。
