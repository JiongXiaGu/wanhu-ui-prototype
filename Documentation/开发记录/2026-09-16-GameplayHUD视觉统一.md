# 2026-09-16 Gameplay HUD 视觉统一

本轮在 World Utility Toolbar 职责稳定后，继续统一 Gameplay HUD 的外边距、Surface 层级和右下工具美术。

## 修改

- 新增 `src/gameplay/gameplay-hud-layout.css`，集中维护 Gameplay 外围 HUD 几何；
- 1920×1080 基准改为左右 / 底部 `24px` 安全边距，Top Shell 顶部 `16px`；
- Main Dock 调整为约 `940px` 核心宽度，与顶部主状态栏形成统一尺度；
- Workspace、Building Placement Overlay、Tool Bottom Dock 使用同一安全边距基准；
- World Utility Toolbar 保持右下独立 Surface，提升图标可读性并强化三组结构；
- 网格吸附 / 网格显示的 Toggle On 使用持续弱暖金状态，Action 不保留选中态；
- Operation Hints 进一步弱化为 Tertiary Surface，并把普通游玩文案收敛为“操作提示 / 旋转 / 移动 / 缩放 / 菜单”；
- Main Dock / World Utility Toolbar / Operation Hints 分别使用 Primary / Secondary / Tertiary 的视觉重量；
- 删除 `gameplay-refine.css` 中已经退出职责的旧 Compact Utility Toolbar 样式，避免世界工具同时受两套 CSS 控制。

## Review 约束

`capture-management-review.mjs` 增加：

- World Utility Toolbar 必须保持 `24px` 右 / 下安全边距；
- Operation Hints 与 World Utility Toolbar 右边缘一致，并保持约 `12px` 间距；
- Main Dock 保持中心对齐和约 `940px` 核心宽度；
- Main Dock 与右下 World Utility Toolbar 保持小而明确的分离间距；
- World Utility 图标维持约 `20px`；
- Building Workspace / Building Placement 继续保留全局 World Utility Toolbar。

## 复核

- Build 通过；
- Visual Review 通过；
- 已实际检查 Normal Gameplay、Building Workspace、Building Placement 的 1920×1080 截图；
- 当前 Main Dock 与 World Utility Toolbar 底边统一，右下工具和 Operation Hints 层级清晰，没有重叠；
- Building Placement 中左侧 ToolOverlay、中央 Tool Bottom Dock、右下 World Utility Toolbar 的空间职责仍然清楚。
