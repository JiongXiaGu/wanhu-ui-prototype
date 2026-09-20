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
