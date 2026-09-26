# 2026-09-26 Unity Vertical Slice Web Prep 收尾审查

本审查基于 main `99b1e0f9b5254b41ed26ffcba0ce80ee89ae22ad`。

## 结论

第一条 Unity Vertical Slice 的 Web Prep 已完成。继续在 Web 仓库重写 VS2–VS8 不会显著降低 Unity 落地成本，反而会制造第二轮结构漂移。

真正需要改 Runtime 的只有 VS1 Gameplay Top Shell。

## VS1 实际改动

- Top Status：Grid → Flex，190 / flexible / 190；
- Control Tray：Grid → Flex，84 / 1 / flexible / 1 / 44；
- Button 居中：Grid / place-items → Flex center；
- Top Tray UiIcon 固定 `flex:0 0 18px`，避免共享 16px Icon Basis 在 Flex 主轴压缩；
- React Group / Separator / Active Line 不变。

迁移审计：

- 全仓 CSS Grid：118 → 112；
- Top Shell 单文件 Grid：11 → 5；
- 剩余 Top Shell 文件内 Grid 属于 Map Panel / Management 局部内容，不是 Top Shell 主结构；
- Visual Governance Ratchet：PASS；
- Migration Guard：PASS。

验收：

- PR #49 Build：通过；
- PR #49 HUD + Tools Targeted Review：通过；
- main `99b1e0f9...` Build + 六组 UI Review：通过；
- 已实际查看 1080p 日间 Top Shell 与 Active Control Tray 完整截图；
- 400×38 Tray、940×56 Status、2 / 5 / 1 按钮、1×18 Separator、18px Icon、Focus / Active / Tooltip 均保持。

## VS2–VS8 Web Prep Ready

### VS2 Main Dock

已经是稳定 Flex Shell：

- ModeSwitch；
- 真实 Divider；
- CategoryStrip；
- Mode 只切换 Category Definition；
- 设计 / 蓝图 880×84 Geometry 已有 Review。

无需继续改 Web Runtime。

### VS3 Design Workspace

已经显式构造 `contentRows = [0..3] + [4..7]`，DOM 是真实 `workspace-content-row`，对应固定 2×4 Slot Pool。

无需继续改 Web Runtime。

### VS4 Context Utility

已经由 `UtilityDefinition { layout, rows, role, groups }` 驱动，稳定 Host 只 Rebind Definition；Placement 两行职责已有专项 Review。

无需继续改 Web Runtime。

### VS5 Building Placement

Building Overlay 复用 Shared PlacementContextPanel / LeftContextPanel，Dock 复用 PlacementActionBar / ToolActionBar，Utility 复用统一 Host。

无需继续改 Web Runtime。

### VS6 Shared Dialog

Confirm / Input / Choice / Number / Binding / Timed Request 已统一；TextInput / SelectControl 共用；Focus / Esc / Enter 有专项 Dialog Review。

无需继续改 Web Runtime。

### VS7 Motion

`usePresence` 已有 entering / steady / exiting / hidden，业务状态先行，CSS 只用 opacity / translate；Reduced Motion、延迟卸载、禁用输入规则明确。

无需继续改 Web Runtime。

### VS8 Runtime Tooltip

已有单一 HoverOverlay Host、Definition、Timer、Focus / Pointer 生命周期、Placement / Safe Clamp 与 Modal suppression。

无需继续改 Web Runtime。

## Vertical Slice 之后

真实 Unity 工程需要验证，而 Web 无法替代：

- PanelSettings；
- 1080p / 1440p / 4K / 宽高比；
- Noto Sans SC / Noto Serif SC Font Asset + fallback；
- Input System 与 Gamepad Focus；
- Sprite + Tint 图标；
- 原生 Filter / Shared Surface / URP 回退；
- PickingMode 与 Presence 生命周期；
- Tooltip / Dialog Overlay；
- Tool Controller / World Renderer / Command History。

Settings / Archive / Management 的 Web 结构不需要预先重做：

- Settings：固定 Section + Shared Controls；
- Archive：单组可达 32 个 Save，Unity 使用 ListView 虚拟化；
- Management：固定 Section 用普通 VisualElement，Inventory 等长列表局部使用 ListView。

因此下一步应转入真实 Unity 6.6 工程，而不是继续扩大 Web 迁移重构。