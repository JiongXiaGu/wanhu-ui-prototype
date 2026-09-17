# Wanhu Edge 与 Elevation 实验

本实验用于验证《万户天工》Gameplay UI 是否应该继续使用统一白色 1px 外框。实验建立在 Wanhu Mist Glass、Wanhu HUD Glass 与 Contrast / Identity 之上，不改变布局、尺寸、交互和透明度体系。

## 问题

当前 Top HUD、Workspace、Main Dock、Utility 与 Inspector 虽然已经拥有不同的 Surface 色温和实度，但大量 Surface 仍然使用近似的完整白色轮廓。完整白框会把不同职责重新拉回到“同一种玻璃盒子”的视觉读取中，也会产生明显的 Web / CSS Box 感。

实验目标是把结构表达从“统一白框”转为：

`Surface Tone + Directional Highlight + Dark Contour + Elevation Shadow`

## 光向

统一假想光源来自左上方：

- Top / Left：只允许弱纸白或中性高光；
- Bottom / Right：使用更暗的轮廓；
- Shadow 向下外扩；
- Old Gold 不承担结构外框，只表达 Active / Focus / Current。

## A / B / C

### A — 当前基准

不增加任何实验覆盖，保留现有完整浅色轮廓。A 只作为视觉基准，不代表最终方向。

### B — Directional Edge

保留 1px 结构边缘，但四边不再同色：

- Top：最亮；
- Left：次亮；
- Right：暗；
- Bottom：最暗；
- 各 Surface 使用与职责相符的 Shadow。

目标是让玻璃拥有明确光向，同时继续保留比较稳定的几何轮廓。

### C — Borderless Large Surface

大面积 Surface 的结构 Border 变为透明，主要使用：

- Surface Tone；
- 顶部 Inset Highlight；
- 底部暗化；
- 外部 Shadow。

适用于 Top HUD、Workspace、Main Dock、Utility、Operation Hint、System Menu。

Elevated Inspector 是例外：即使在 C 中仍保留 Directional Contour，因为它会覆盖 Workspace 等底层 UI，需要明确高度。

## 角色化 Elevation

- Utility / Hint：最弱 Shadow；
- Top HUD：弱到中等 Shadow；
- Workspace：中等、较柔的悬浮 Shadow；
- Main Dock：中等但更贴地、更有基座感；
- Inspector：最大、最柔，并保留明确 Contour。

Shadow 不允许成为发光效果，不使用暖金 Glow 作为层级手段。

## Unity UI Toolkit 映射

正式 Unity 实现不要求 Web CSS 的 `box-shadow` 像素级复刻。

优先映射：

- `border-top-color` / `border-left-color` → 亮边；
- `border-right-color` / `border-bottom-color` → 暗边；
- 大 Surface 可以继续保留 1px Border Width，但通过透明颜色实现 Borderless，避免布局变化；
- Shadow 若 USS / 当前 Unity 版本能力不足，使用独立 Shadow VisualElement、9-slice 阴影贴图或共享材质实现；
- 不为 Shadow 新建第二条 Blur 链；
- Scene Blur 仍遵循 Single Scene Blur Source；
- Inspector 仍不依赖 UI-over-UI Blur。

因此本实验验证的是**光向、边缘语义和高度关系**，而不是浏览器特效本身。

## Review 场景

每个 Variant 同时检查：

- Top HUD；
- Workspace；
- Main Dock；
- Utility / Operation Hint；
- Asset Inspector；
- 白天；
- 夜晚。

截图使用同一桥梁 Workspace + Asset Inspector 组合，确保不同层级同时出现在一帧内。

## 收敛原则

最终方案不要求所有角色选同一个 Variant。允许按职责混合，例如：

- Top HUD：Directional Edge；
- Workspace：Directional / Borderless 之间；
- Main Dock：Borderless；
- Utility：Borderless；
- Inspector：Directional Edge。

最终选择必须首先减少“白色框中框”，其次保持白天 / 夜晚可读性，再考虑材质表现。
