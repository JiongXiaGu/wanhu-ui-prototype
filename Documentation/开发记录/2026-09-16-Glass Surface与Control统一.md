# 2026-09-16 Glass Surface 与 Control 统一

## 背景

Building Placement 左侧“放置方式”虽然已经是可交互 Segmented Control，但视觉过轻，静态状态更像一行文本标签。同时 Gameplay 的 Workspace / Context / Tool Panel Surface Alpha 偏高，Blur 虽然存在但几乎看不见，夜景下容易继续向纯黑靠近。

Settings / New Game / Load / Save 的 Footer Action 也还保留早期 `1px / 2px` Radius，与近期 Gameplay 的轻圆角体系不一致。

## 本次完成

### Gameplay Surface

- Primary / Secondary HUD Surface 降低不透明度；
- Gameplay Glass Panel 统一增加 Blur + 轻 Saturate / Brightness Lift；
- Workspace / Context Surface / Building Tool / Road Tool 使用同一 Glass 契约；
- Top Shell / Bottom Command 使用较轻的 Blur 档；
- 保留玉青 Tint，Blur 只负责环境色，不把可读性绑定到世界亮度。

### Segmented Control

统一：

- 10px 外壳 Radius；
- 8px Option Radius；
- 外壳弱 Border / Surface；
- Hover 可见 Tone；
- Active 暖金 Tone；
- 移除小型 Segmented 上重复的 Selected 金线。

覆盖 Building Placement、Camera / Weather、New Game 等已存在的 Segmented 场景。

### Full-screen Footer Action

Settings / New Game / Load / Save 统一：

- Footer 轻透明玉青 Surface + Blur；
- Primary / Secondary Action 使用 10px Radius；
- Utility Action 使用 8px Radius；
- 页面 CSS 只保留布局 / 尺寸差异，通用材质集中到共享 Visual System。

## 代码

新增：

`src/ui/ui-visual-system.css`

调整：

- `src/gameplay/gameplay-hud-layout.css`
- `src/fullscreen-actions.css`
- `src/main.tsx`
- `.github/workflows/visual-review.yml`
- `scripts/capture-visual-system-review.mjs`

正式规范：

- `Documentation/UI Surface与Control视觉规范.md`
- `Documentation/Bottom Command Visual System设计规范.md`

审查记录：

- `Documentation/代码审查/2026-09-16-Surface与Control视觉系统审查.md`

## Unity UI Toolkit

Web `backdrop-filter` 不作为 Unity 实现要求。

正式实现优先：

- 共享 Surface / Button / Segmented USS；
- C# 用语义 Class 驱动 Active / Disabled / Primary；
- Gameplay / 重空间共用 URP Blur Service；
- 面板自身只负责 Tint / Opacity / Border / Radius；
- 不为每个 Panel 建独立 RenderTexture Blur。

## Review

本轮 Build 与完整 1920×1080 Visual Review 通过，并人工检查：

- Building Placement Segmented；
- Camera Context；
- Design Workspace；
- Settings Footer；
- New Game Footer / Segmented；
- Load Footer；
- Save Footer。

结果：控件可点击感、面板材质层级和跨页面圆角语言均得到统一，没有发现布局回归。
