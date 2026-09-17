# P1-A Workspace 与 Environment 统一 Surface 收束

## 目标

本轮不重新设计 Workspace / Environment 的构图或交互，而是把已经通过视觉审查的正式材质从历史 Pass 覆盖链中抽出，建立清晰的皮肤所有权：

`Theme Tokens → Surface System → Component Geometry / Interaction`

目标是降低 CSS import 顺序对最终皮肤的隐式影响，并为后续 Top HUD、Control Tray、Main Dock、Management 等区域继续迁移提供稳定基线。

## 本轮正式结构

### Theme Tokens

新增：`src/ui/wanhu-theme-tokens.css`

负责稳定的全局语义值：

- Graphite / Ink：冷黛黑与石墨；
- Paper：主 / 次 / 三级文字；
- Brass：熟铜、Highlight、Soft；
- Cinnabar：异常状态预留；
- Shared Noise；
- Context Surface Recipe；
- Work Surface Recipe；
- Context / Work 内部常用 Control Tone。

组件 CSS 不应再复制一套自己的 Surface RGB / Alpha / Blur / Shadow。

### Surface System

新增：`src/ui/wanhu-surface-system.css`

P1-A 先正式接管两种已验证 Surface：

- Environment → `Context Surface`；
- Design Workspace → `Work Sheet + Work Body Overlay`。

Surface System 负责：

- Surface Tint / Alpha；
- Noise；
- Blur / Saturation / Brightness；
- Structural Edge；
- Shadow / Elevation；
- Header / Footer 的基础材质关系；
- Workspace Rail / Catalog / Card 默认材质层级。

Component CSS 继续负责尺寸、布局、排版与组件自己的交互结构。

## 保留的正式视觉基线

### Environment / Context

白天：

- Surface：`rgba(23,29,31,.82)`；
- Filter：`blur(15px) saturate(.92) brightness(.98)`。

夜晚：

- Surface：`rgba(26,32,34,.84)`；
- Filter：`blur(15px) saturate(.90) brightness(1.0)`。

仍保留 soft noise，不恢复旧灰白 Mist Glass。

### Workspace / Work

白天：

- Shell：`rgba(24,30,32,.56)`；
- Body smoke overlay：`rgba(14,20,22,.34)`；
- Filter：`blur(20px) saturate(.92) brightness(.985)`。

夜晚：

- Shell：`rgba(27,33,35,.58)`；
- Body smoke overlay：`rgba(15,21,23,.36)`；
- Filter：`blur(20px) saturate(.90) brightness(1.0)`。

Rail / Catalog / Card 默认保持开放，不恢复“大块近黑应用窗口”。

## 退出正式 Runtime 的历史文件

删除：

- `src/ui/wanhu-workspace-integration.css`；
- `src/ui/wanhu-tonal-texture.css`。

原 Workspace Integration 的正式视觉值已经进入 Theme / Surface System；texture retention 也由 Surface Recipe 自己负责，不再需要单独后置覆盖。

A/B/C Glass Study 的材质应用逻辑迁入 `src/review/styles/glass-study.css`，只在 `?study=glass` 时加载，不再依赖生产 CSS 提供测试兼容层。

## Component CSS 职责调整

`workspace-world-first-glass.css`：

- 保留 Workspace-specific geometry；
- Rail / Filter / Search / Asset Card / Pager 的组件交互；
- 不再拥有正式 Shell / Body Surface Recipe。

`weather-mist-glass.css`：

- 保留天气预设、参数行、Slider、Stepper、Footer / Mode Control 的组件视觉；
- 不再拥有 Context Surface 的背景 / Blur / Shadow / Night Material。

## Regression Guard

新增：`scripts/capture-surface-system-review.mjs`

自动检查：

- 正式 Runtime 不再加载 `wanhu-workspace-integration.css` / `wanhu-tonal-texture.css`；
- Environment 实际 computed background 来自 `--wanhu-surface-context-bg`；
- Workspace Shell / Body 实际 computed background 来自 Work Surface Tokens；
- Workspace / Environment 均保留统一 noise；
- Context / Work Blur 均存在；
- 白天 / 夜晚四种状态均截图。

## 尚未完成的 P1 工作

P1-A 只完成 Workspace + Environment 的正式所有权迁移。以下仍属于后续清理对象：

- `wanhu-hud-glass.css`；
- `wanhu-contrast-identity.css`；
- `wanhu-tonal-hud-roles.css`；
- `wanhu-tonal-material.css` 内仍存在早期 Workspace / Environment 兼容声明，当前已被正式 Surface System 后置接管，后续应随其他 HUD 迁移一起删除；
- Top HUD / Control Tray / Main Dock / Utility / Operation Hint / System Menu 尚未全部改为消费统一 Surface Recipe；
- Management / Pause / Settings 等 Blocking / Elevated Surface 仍待接入。

## 下一阶段建议

P1-B 优先迁移常驻 Gameplay HUD：

`Top Status → Control Tray → Main Dock → World Utility / Operation Hint / System Menu`

目标仍是先保持画面稳定，再删除 `HUD Glass / Tonal HUD Roles / Contrast` 等历史覆盖层。等皮肤所有权真正唯一后，再做一次全局小幅美术校准，届时修改 Theme / Surface Token 就可以系统性影响所有 Surface，而不再逐组件追覆盖链。
