# 2026-09-20 Light Adjustment

## 目标

为场景灯光增加一个比 Material Palette 更轻的直接编辑工具。

用户明确边界：

- 选择场景 Light；
- 调整 HDR 颜色；
- 调整亮度 Scale；
- 调整范围 Scale；
- 不需要 Workspace / Preset Library / Catalog。

## 实现

### Tool State

新增：

```text
Tool = light-adjustment
ENTER_LIGHT_ADJUSTMENT
```

World Utility 增加“灯光调整”。

进入后：

- Tool Space；
- Main Dock 隐藏；
- Bottom Utility 不显示；
- 左下只显示 Light Adjustment Panel；
- World 中显示 Prototype Light Handles。

### Scene Selection

Web 用 4 个固定 Light Handle 模拟场景拾取。

点击 Light：

```text
SelectedLightId
→ 同一个 Panel Rebind
```

正式 Unity 改为场景 Picking / Raycast Adapter，不复用 Web 坐标。

### 参数

选中 Light 后只有：

- HDR Color；
- IntensityScale：0–3，Step 0.05；
- RangeScale：0.25–3，Step 0.05。

亮度 / 范围继续消费共享 NumericSliderField。

### Shared HDR Color Editor

原 MaterialPaletteOverlay 内的 ColorEditor 已抽到：

```text
src/ui/color/ColorEditorPage.tsx
```

Material Emission / Night Emission 与 Light Color 现在消费同一 Shared Color Editor。

Light Color：

- HDR = true；
- Adapter = LightColor.Intensity；
- Intensity Label = HDR 强度。

这为后续 Unity 建立 SharedColorEditor UXML / USS 提供稳定边界。

## 视觉

Light Selection Handle：

- 未选中：中性细圆环 + 小点；
- Selected：弱熟铜 Ring；
- Hover / Selected 才显示 Light Name；
- 使用真实 DOM Element，不新增结构性 pseudo-element。

Light Panel 继续消费 Shared Left Context Surface。

## 验收

UI Review 新增：

1. World Utility 灯光调整入口；
2. 无 Workspace / 无额外 Bottom Utility；
3. Empty Selection；
4. Scene Light Selection；
5. Selected Parameters；
6. Shared HDR Color Editor；
7. Intensity / Range Scale 实时更新；
8. Rebind 到另一 Light；
9. Exit 返回 World Utility。
