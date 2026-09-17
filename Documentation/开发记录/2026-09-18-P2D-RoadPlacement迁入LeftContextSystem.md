# P2-D Road Placement 迁入 Left Context System

日期：2026-09-18

## 目标

将 Road Placement 从独立 Tool Panel 外壳迁入统一 `Left Context System`，并把 Placement 家族的公共接入方式固定下来，使后续 Wall / Bridge / City Wall / River / Platform 等工具扩展业务内容，而不是复制一套面板外壳与皮肤。

## 本次调整

### Placement 家族统一入口

新增：

- `src/tools/placement/PlacementContextPanel.tsx`
- `src/tools/placement/placement-context-panel.css`

`PlacementContextPanel` 是 Placement Tool 进入 `LeftContextPanel` 的薄适配层，统一承担：

- Placement Context 的 Left Context Shell 接入；
- Header / Close / Body 结构；
- Placement 家族公共 class；
- 屏幕定位、宽度、最大高度与 Body 滚动几何。

它不拥有道路、建筑等工具业务逻辑。

### Building Placement

Building Placement 改为通过 `PlacementContextPanel` 接入 Left Context System。

`building-placement.css` 删除 Placement 外层几何与 Body 滚动规则，只保留：

- 地形状态摘要；
- 调整模式内容；
- 建筑业务控件间距与切换动画。

### Road Placement

Road Placement 删除自有：

- Panel Surface；
- Border / Radius / Shadow / Blur；
- Header；
- Close Button；
- Body Scroll Shell；
- 参数行专属皮肤；
- Section 标题专属骨架。

Road 现在使用：

- `PlacementContextPanel`：Placement 家族统一入口；
- `LeftContextSection`：模式摘要与道路参数分区；
- `RuntimeParameterRow`：道路宽度、相对标高、曲线平滑；
- 中央 `PlacementActionBar`：智能曲线 / 曲线 / 直线、反转方向、完成、取消。

因此 Road CSS 只剩道路模式说明、长度 / 坡度 / 节点摘要等业务内容样式。

## 职责边界

统一后的稳定关系：

```text
Left Context System
└─ PlacementContextPanel
   ├─ Building Placement business content
   ├─ Road Placement business content
   ├─ Wall Placement business content（后续）
   └─ Bridge Placement business content（后续）

PlacementActionBar
└─ 当前 Placement Tool 的模式 / 高频动作 / 完成取消
```

具体工具不得重新拥有 Shell / Header / Surface / Shared Control Skin。

## Review

`capture-left-context-system-review.mjs` 已扩展 Road Placement 检查：

- Building / Road 都必须拥有 `left-context-panel` 与 `placement-context-panel`；
- 两者不得伪装成 Camera / Environment 的 `gameplay-context-panel`；
- Building / Road Header 高度与 Placement Context 宽度一致；
- Road 必须使用 `LeftContextSection`；
- Road 参数必须使用共享 `RuntimeParameterRow`；
- Placement Context 不允许增加 Footer 与中央 Action Bar 重复职责；
- 切换 Road 为直线模式后，Context 状态同步，曲线平滑参数消失。

## 后续扩展规则

新增 Wall / Bridge / City Wall / River / Platform Placement 时，默认从 `PlacementContextPanel + LeftContextSection + shared Controls + PlacementActionBar` 开始，只新增业务内容。除非 Left Context System 本身需要新的全局能力，否则不新增工具专属 Panel Shell 或 Panel Skin。
