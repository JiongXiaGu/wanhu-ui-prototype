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
