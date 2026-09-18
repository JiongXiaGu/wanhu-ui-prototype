# 2026-09-18 Settings Visual System 统一

本轮把 Settings 从近乎 edge-to-edge 的黑色页面迁入正式 Smoked Graphite Blocking System，并收束数值控件、Select / Toggle、按键绑定与安全确认的视觉所有权。

## Surface

- World / Menu Context → Blocking Backdrop → 1180×850 Settings Command Surface；
- 18px Radius；
- 世界继续可见，不再由 Settings Root 覆盖 94%～96% 的黑色 Surface；
- Material Owner：`wanhu-theme-tokens.css → wanhu-surface-system.css`。

## Controls

- 新增 `NumericSliderField = − / Slider / + / Value`；
- `RuntimeParameterRow` 改为组合 NumericSliderField；
- Settings 连续参数同样组合 NumericSliderField；
- 删除 Settings 专用 `ui-select--settings / ui-slider--settings / ui-toggle--settings` 视觉分支；
- Slider Default Progress 改为中性，Focus / Dragging才进入熟铜；
- 新增共享 `InputBindingField`，按键绑定页面只保留表格 Geometry。

## Dialog

- 删除 Settings 私有 `settings-safe-layer / settings-safe-dialog`；
- 15 秒显示回滚规则保留，视觉直接使用全局 `DialogSystem.timed`。

## Review

新增 `capture-settings-system-review.mjs`：Menu Settings、Graphics、Audio、Controls、Safe Timed Dialog、Pause Day / Night。
