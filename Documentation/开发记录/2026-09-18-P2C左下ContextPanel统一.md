# P2-C 左下 Context Panel 统一

日期：2026-09-18

## 目标

把 Camera、Environment、Building Placement 统一为同一套左下 Context Panel 结构与控件语言，为后续 Road / Wall / Bridge / Terrain 等工具参数面板提供固定骨架。

## 结构规则

统一骨架：

- Header：裸图标 + 标题 + 可选副标题 + 关闭按钮。
- Body：开放式 Section，不使用灰卡套灰卡。
- Footer：可选。用于恢复动作 + 当前模式切换。
- Camera / Environment 使用 Footer；Building Placement 不使用 Footer，避免与中央 Placement Action Bar 重复职责。

## Camera

- `经营 / 规划 / 摄影` 从 Body 顶部移到底部 Footer。
- 三种模式变成真实镜头预设，而不是只切换字符串：
  - 经营：60° / 42 m / 38°
  - 规划：52° / 62 m / 52°
  - 摄影：45° / 28 m / 24°
- 恢复默认同时回到经营模式。

## Environment

- 继续保留天气预设、天气参数、风场、时间与季节。
- Header / Footer / Parameter Row / Segmented Control 不再拥有 Environment 专属版本，改用共享 Context Panel 语言。
- Environment CSS 只保留天气预设、世界摘要和时间/季节等专属内容。

## Building Placement

- 使用共享 `LeftContextPanel` Shell。
- Header 改成与 Camera / Environment 相同的裸图标标题结构。
- `RuntimeParameterRow` 与 `SegmentedControl` 直接吃共享 Context Control Skin。
- 左下 Panel 只负责地形状态与当前调整参数。
- 中央 Placement Action Bar 继续负责模式切换、旋转、完成、取消等主要动作。

## 所有权

- `src/ui/LeftContextPanel.tsx`：共享 Shell / Section / Footer 结构。
- `src/gameplay/gameplay-context-panel.css`：左下 Context Panel 几何、Header、Section、Footer 与共享参数控件样式。
- `src/ui/wanhu-surface-system.css`：Camera / Environment 的 Context Surface 材质。
- Building Placement 不再维护独立材质，直接消费同一套 Context Surface Token。
- `weather-mist-glass.css`：只保留天气专属内容。
- `building-placement.css`：只保留建筑工具专属内容。
- `camera-context-skin.css` 退休。

## 后续

下一批工具面板优先直接复用 `LeftContextPanel`，不新增独立 Shell / Header / Parameter Row 皮肤。
