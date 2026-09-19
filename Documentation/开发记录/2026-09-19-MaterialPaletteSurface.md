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
