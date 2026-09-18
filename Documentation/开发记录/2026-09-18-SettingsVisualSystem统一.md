# 2026-09-18 Settings Visual System 统一

本轮把 Settings 从近乎 edge-to-edge 的黑色页面迁入正式 Smoked Graphite Blocking System，并收束数值控件、Select / Toggle、按键绑定与安全确认的视觉所有权。

## Surface

第一版曾尝试 1180×850 中央 Blocking Surface；真实截图复核后撤回该空间形态。Settings 与 Save / Load 都是长时 Global Space，不应被误做成 Pause 风格的中央窗口。

最终规则：

- World / Menu Context → Blocking Backdrop → **Full-screen Settings Global Surface**；
- 不使用外框、18px 外圆角或浮窗 Shadow；
- Header / Tabs / Footer 横跨全屏，正文保持约 940px 稳定阅读宽度；
- 世界继续低频可见，但 Settings Surface 自身保持足够中性 Graphite Tint；
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
