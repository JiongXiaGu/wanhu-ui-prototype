# 2026-09-16 Gameplay HUD 美术统一

本轮目标是在不改变已确认空间职责的前提下，把 Gameplay Top Shell、Main Dock、World Utility Toolbar、Operation Hints、Building Workspace、Camera / Weather Flyout 与 Building Placement Context 统一成同一套现代东方 HUD 视觉语言。

## 统一内容

- Gameplay 外围安全边距固定为 `16px`；Camera / Weather Flyout 也使用 `top/right = 16px`，不再贴屏幕边缘。
- `gameplay-hud-layout.css` 新增统一 Radius、Surface、Border、Shadow、Text、Accent Token。
- Radius 分为三档：小控件 `10px`、常规 HUD `14px`、大 Context Surface `18px`。
- Main Dock 高度由 `82px` 收紧到 `76px`，继续保持约 `940px` 核心宽度。
- World Utility Toolbar 高度收紧到 `56px`，和 Main Dock 使用相同色系但更轻的 Secondary Surface。
- Operation Hints 保持独立并降为 Tertiary Surface，不与 World Utility 合并。
- Building Workspace 使用 `18px` 大 Surface 圆角，Card / Thumb 改为中小圆角，减少此前顶部圆、底部方的割裂。
- Camera / Weather Flyout 使用 `18px` 圆角与完整悬浮边框；不再采用贴边抽屉式硬切边。
- Building Placement Context Panel 与 Tool Bottom Dock 改用同一套 Primary / Secondary Surface Token。

## 代码整理

- `gameplay-refine.css` 删除已退出运行路径的旧 `hud-group / quick-controls` 美术覆盖，只保留 Main Dock、Workspace 与通用 Tool Dock 的 Gameplay Refinement。
- `gameplay-context-unified.css` 收束为 Building Placement Context 专用视觉，不再重复拥有 Camera / Weather、Operation Hints 或 Persistent HUD 的几何与美术。
- Right Edge Flyout 的外部几何继续只由 `right-edge-flyout.css` 自己维护。
- Visual Review 增加 16px Flyout Safe Edge、Main Dock 76px 高度、底部 HUD 圆角家族与 Workspace 18px 圆角检查。

## 不改变的架构

- Top Shell / Main Dock / World Utility / Operation Hints 的职责不变。
- Building Workspace 继续保留 Top Control Tray、Main Dock、World Utility 与场景 Flyout。
- Management 仍是阻挡世界交互的重 Surface。
- Tool 仍隐藏 Top Control Tray 与 Main Dock，并保留 Top Status + World Utility。
- Surface Launcher / Selector / Toggle / Action 四类交互语义沿用前一轮审查结论。
