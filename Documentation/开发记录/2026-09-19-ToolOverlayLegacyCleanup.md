# 2026-09-19 ToolOverlay Legacy Cleanup

## 问题

Terrain 参数面板出现右侧大片空白。

根因不是 Terrain 400px 面板，也不是 NumericSliderField 自身宽度，而是旧 `tool-overlay.css` 仍命中新 `RuntimeParameterRow`：

```text
旧 CSS：Label | - | Slider | + | Value
新 DOM：Label | NumericSliderField
```

旧五列 Grid 为不存在的列继续保留宽度，NumericSliderField 被塞进第二个 30px Column 后发生 Overflow，形成视觉空白。

## 清理

- `src/tool-overlay.css` 退出 Runtime import；
- PlacementContextPanel 删除 legacy `tool-overlay / tool-body` class；
- TerrainEditTool 删除 legacy `tool-overlay` class；
- Left Context 显式声明 ParameterRow 两列布局；
- NumericSliderField 显式 `width:100%; min-width:0`；
- placement-parameter-controls.css 不再依赖 `.tool-overlay` 祖先；
- UI Review 新增 Terrain / Building / Road Parameter Width 断言与截图。

## Unity 映射

这次清理让 Web 结构重新与未来 UXML 一致：

```text
ParameterRow VisualElement
├ Label
└ NumericSliderField (flex-grow:1)
```

不再需要解释历史五列 Web CSS。


## Guard 复核

第一次清理后 Migration Audit 继续发现：

- `src/styles.css` 仍有更早期的全局 `.tool-overlay / .tool-body`；
- 同文件仍有全局五列 `.parameter-row`；
- `src/ui/ui-visual-system.css` 仍有 ToolOverlay 材质 selector。

这些也已清除。旧 `.segment` Base 暂不在本轮重写，避免把参数布局修复扩大成所有 SegmentedControl 的视觉重构；后续 Control Ownership Cleanup 再单独迁入 `ui-control-system.css`。
