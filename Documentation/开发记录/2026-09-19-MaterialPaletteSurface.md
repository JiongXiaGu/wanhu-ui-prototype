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
