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


## ColorParameterField 收敛

灯光参数页原先使用私有“小色块 + 外置 HDR + Chevron”，和亮度 / 范围 Slider 的控制列宽度不一致。

本轮新增共享：

```text
src/ui/color/ColorParameterField.tsx
```

并将基础视觉放入 `ui-control-system.css`。

稳定规则：

- Root 复用 `ui-parameter-row`；
- Label Column 与 Slider 完全共用；
- Color Bar 占满 NumericSliderField 的整个 Control Column；
- HDR Badge 与 Chevron 都位于颜色条内部；
- HDR=false 时 Badge 不渲染；
- Color Fill / Contrast Overlay / Meta 都是真实 Element；
- Light 私有 `.light-adjustment-color-row` 已删除。

UI Review 增加 BoundingBox 断言：Color Control 的 x / width 必须与亮度 NumericSliderField 一致，HDR Badge 必须位于 Color Bar 内。


## ColorParameterField 视觉权重弱化

共享 ColorParameterField 第一版虽然和 Slider Control Column 对齐，但整块 Control 被当前颜色铺满，导致浅暖色灯光在中性烟墨参数面板中成为最强视觉热点。

本轮保持组件结构与复用边界不变，只调整共享视觉：

- 外层 Control 改回中性烟墨 Surface；
- 当前颜色改为内部约 14px 高的长条 Preview；
- Preview 水平仍占据绝大多数 Control 宽度，保留“长颜色条”识别；
- Color Fill 默认 opacity 约 0.62，Hover 仅轻微提升到约 0.70；
- HDR Badge 与 Chevron 继续留在 Preview 内部，但降低 Border / Text 对比；
- 右侧 Contrast Overlay 继续保证浅色与深色都能读取状态；
- Light Tool 不新增任何私有覆盖，改动属于共享 ColorParameterField。

UI Review 新增断言：

- Outer Color Control 继续和 NumericSliderField x / width 对齐；
- Preview Height 必须低于 Control Height 的 70%；
- Preview Width 必须至少占 Control Width 的 90%；
- Color Fill opacity 不得超过 0.70；
- HDR Badge 必须完全位于 Preview Strip 内。


## ColorParameterField 简化重做

上一版继续弱化整块颜色后，虽然视觉焦点下降，但把 HDR 做成了过小的内部状态，实际 1080p Review 中可读性不足；同时“中性外壳 + 内嵌细条 + Contrast Overlay + 微型 Badge”层级过多。

本轮直接推翻该内部设计，保留共享组件 API，视觉重做为最简单的两段式：

```text
颜色   [ 长 Color Preview            ][ HDR  › ]
```

实现：

- 整个 ColorParameterField 仍与 NumericSliderField 的 Control Column 对齐；
- 外层是普通中性 Control；
- 左侧 Color Preview 高约 18px，承担颜色识别；
- 右侧 Meta 永远是中性背景，承担 HDR + Chevron；
- HDR 改为 10px 普通文字，不做微型 Badge；
- HDR=false 时只隐藏 HDR Text，不显示 SDR；
- 删除 Contrast Overlay；
- Color Fill 约 0.74 opacity + 轻降饱和，避免亮色抢戏。

实际下载 Actions 截图后再次人工检查：颜色仍清楚，但不再是面板第一视觉焦点；HDR 在 1080p 裁切视图中可直接读出。

UI Review 进一步约束：

- Preview 高度 16–20px；
- Preview 占 Control Width 约 68%–86%；
- Color Fill opacity ≤ 0.76；
- HDR font-size ≥ 9.5px；
- HDR 必须位于同一个 Control 的 Meta 区。
