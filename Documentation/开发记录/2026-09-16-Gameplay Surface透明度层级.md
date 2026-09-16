# 2026-09-16 Gameplay Surface透明度层级

## 目标

把 Gameplay 中原本接近同一透明度的 Glass Surface 改成按任务强度分层，让世界画面更明显地进入 UI 材质，同时保持文字、图标和交互控件的固定可读性。

## 规则

正式采用四档 Surface Transparency Hierarchy：

- `Ambient`：约 `.66–.74`，常驻低干扰辅助 HUD；
- `Context`：约 `.76–.82`，临时观察 / 调整；
- `Work`：约 `.82–.88`，当前浏览或任务操作；
- `Blocking`：约 `.92–.94`，需要明显压住世界的重空间。

只改变 Surface 背景 Tint / Alpha，不对整个组件设置统一 `opacity`；文字、图标、Border、Selected / Active 保持独立对比度。

昼夜共用同一套 Tier，不增加 Night Theme。

## 当前映射

- Top Status：Work；
- Top Control Tray：Context；
- Camera / Weather：Context；
- Workspace Header：Context；
- Workspace Body：Work；
- Main Dock：较轻 Work；
- Placement Action Bar：Work；
- Building / Road Tool Parameter：Work；
- World Utility：Ambient；
- Compass / System Menu：Ambient 方向；
- Management / Pause / Settings / Archive：Blocking 语义，后续按重空间统一整理。

Bottom Command L / M / S 继续属于同一材质家族，只通过共享 Token 使用不同固定 Alpha 与 Shadow Tier，不复制三套材质。

## 实现

- `src/gameplay/gameplay-hud-layout.css`：增加 `Ambient / Context / Work / Blocking` Token 与 Bottom Command L / M / S Surface Token；
- `src/gameplay/bottom-command-system.css`：L / M / S 从各自共享 Token 读取背景；
- `src/gameplay/gameplay-context-panel.css`：Camera / Weather 改用 Context Tier，并保持独立文字 / 控件对比；
- `src/gameplay-refine.css`：Workspace 外壳保持共享 Blur / Border，Header 使用 Context，Body 使用 Work。

## Visual Review

1920×1080 Review 已检查：

- 白天 Gameplay；
- 夜晚 Gameplay；
- 白天天气面板；
- 夜晚天气面板；
- Design Workspace；
- Building Placement。

审图结论：

- 白天 Main Dock / Top Tray 比原先更轻，世界画面成为更明确的视觉主体；
- 夜景中 Surface 仍保持稳定黛墨 / 玉青色调，没有和世界一起黑下去；
- Weather 在夜景灯火背景上能读到环境色，但背景细节没有穿透到文字层；
- Workspace Header 比 Body 更轻，资产浏览区仍具备足够稳定的阅读底；
- Tool Parameter 保持 Work Tier，没有错误套用 Weather 的 Context 透明度；
- World Utility 的 Ambient Alpha 更低，但按钮、Active 金色和分组仍可辨认。

因此本轮不回调数值，作为当前 Gameplay Surface 基线。

## Unity UI Toolkit 边界

正式 Unity 建议映射为共享 USS Class：

```text
.ui-surface--ambient
.ui-surface--context
.ui-surface--work
.ui-surface--blocking
```

Surface 只负责 Tint / Opacity / Border；Blur 继续由共享 URP Blur Service / Fullscreen Pass 提供，不为每个 Panel 建独立 RenderTexture。
