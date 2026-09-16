# 2026-09-16 Surface 与 Control 视觉系统审查

## 审查目标

本次审查针对近期 Gameplay 与全屏流程中出现的视觉不一致问题，重点检查：

- Building Placement 的 Segmented Control 是否有明确可点击感；
- Gameplay 面板是否过度依赖接近纯黑的不透明 Surface；
- Blur / 半透明 Surface 在白天和夜晚是否有稳定策略；
- Settings / New Game / Load / Save 的底部按钮是否仍使用旧的 `1px / 2px` 临时圆角；
- 相同语义是否在多个 CSS 文件中重复维护；
- 当前方案是否能合理映射到 Unity UI Toolkit / USS。

## 1. 发现：Segmented Control 可点击感不足

### 现象

Building Placement 的“自由 / 道路吸附 / 网格”此前主要依赖文字颜色和极弱背景，外壳 Surface、Option Hover 与 Active 的差距过小。

这导致静态截图中更像三段只读 Label，而不是一个互斥选择控件。

同类实现还分散在：

- `tool-overlay.css` 的 `.segment`；
- `building-placement.css` 的 `.bp-segment`；
- `gameplay-context-panel.css` 的 `.segment`；
- `new-game-space.css` 的 `.new-game-segmented`。

### 处理

建立共享 Segmented 视觉契约：

- 外壳 `10px` Radius；
- 内部 Option `8px` Radius；
- 外壳拥有可辨认的弱 Surface + Border；
- Hover 明确提亮；
- Active 使用弱暖金填充；
- 移除小型 Segmented 上额外的 Selected 金线。

组件业务逻辑保持不变，仅统一视觉语义。

## 2. 发现：Gameplay Panel Alpha 过高，Blur 很难被看见

### 现象

原 Gameplay Primary Surface 常见 Alpha 约 `.945–.955`，即使存在 `backdrop-filter: blur(...)`，世界画面也几乎无法透入。

结果是：

- 白天看起来像纯黑 / 深灰盒子；
- 夜晚场景下会进一步失去材质层级；
- Blur 实际存在但视觉收益很小；
- 不同面板之间主要靠纯色深浅区分。

### 处理

Gameplay HUD Token 改成更明确的“Tint + Blur”关系：

- Primary Surface Alpha 约 `.875–.90`；
- Secondary Surface Alpha 约 `.835–.86`；
- Primary Blur 约 `14px`；
- Soft HUD Blur 约 `11–12px`；
- Blur 增加轻微 `saturate(.86~.88)` 与 `brightness(1.04~1.05)`；
- Surface 仍保留自己的玉青 / 深灰色调。

重点不是让面板更透明，而是让背景只以低频环境色存在。

### 夜晚结论

夜晚不能继续降低 Surface Alpha。UI 可读性必须主要由 Surface Tint、文字颜色、Border 和轻内高光保证；Blur 只提供环境感。

## 3. 发现：Full-screen Footer Action 仍保留旧式小圆角

### 现象

Settings / New Game / Load / Save 的 Footer 已共享 `global-space-footer` 结构，但历史 CSS 中仍存在：

- `.global-space-primary / secondary` 的 `1px / 2px` Radius；
- 各页面 Back Button 的单独视觉覆盖；
- New Game / Archive 辅助 Icon Button 的旧式方角。

这与近期 Gameplay 中形成的 `8 / 10 / 14 / 18px` 圆角家族明显不一致。

### 处理

统一：

- Full-screen Primary / Secondary Action：`10px` Radius；
- Utility Action：`8px` Radius；
- Footer 使用轻玉青半透明 Surface + 约 `12px` Blur；
- Settings / New Game / Load / Save 只维护自己的布局和尺寸差异，不再复制底部 Button 材质。

## 4. 发现：视觉规则重复定义

### 典型重复

`archive-panel.css`、`fullscreen-actions.css`、`settings-panel.css`、`new-game-space.css` 曾分别定义 Footer Action 的 Border、Background、Radius、Hover。

Gameplay 的 `.segment` / `.bp-segment` / `.new-game-segmented` 也存在类似问题。

### 当前整理

新增：

`src/ui/ui-visual-system.css`

它成为以下通用视觉的最终有效入口：

- Gameplay Glass Surface 的共享 Blur 契约；
- Segmented Control；
- Full-screen Footer Surface；
- Full-screen Primary / Secondary / Utility Action；
- 常用 Control Radius。

`src/fullscreen-actions.css` 现在主要保留：

- 页面 Footer 对齐；
- Group 布局；
- Page-specific Action 尺寸；
- Utility Action 的语义差异。

Bottom Command Visual System 仍独立存在，因为它拥有 L / M / S 三档 Toolbar 的专用几何与状态线规则，但其基础圆角 / Blur 语言与本次通用系统保持一致。

## 5. 仍存在的历史 CSS

审查中确认仓库仍有少量旧选择器保留 `1px / 2px / 3px` Radius 或已退出运行结构的样式，例如：

- `archive-panel.css` 中部分 Card / Badge 的旧圆角；
- `styles.css` 中早期 Prototype 通用类；
- `city-management.css` 中已退出运行树的旧 Management Rail 样式；
- 个别 Legacy Tool 控件。

这些不应机械地一次全部改圆，因为：

- Card / Badge 不一定应与 Button 共用同一 Radius；
- 一部分是已退出运行路径的旧样式；
- 大范围无语义替换容易制造回归。

建议规则：

> 当前运行中的共享 Control 先归一；历史 Card / Legacy Selector 在对应模块下一次结构重构时按语义迁移或删除。

## 6. Blur 架构审查

Web 当前使用 `backdrop-filter` 仅用于快速验证目标视觉。

最终 Unity UI Toolkit 不建议为每个 Panel 分别实现 Blur。

推荐：

```text
Scene / World Camera
↓
统一 URP Blur Service / Fullscreen Pass
↓
共享弱化世界结果
↓
UI Toolkit Surface（Tint / Opacity / Border）
```

优点：

- 多个 Gameplay Panel 共享同一模糊结果；
- 不创建多份 RenderTexture 链；
- Blur 质量 / 性能档位统一管理；
- Panel USS 只处理 Tint、Opacity、Border、Radius；
- 夜景下 UI 明度不与世界亮度直接绑定。

## 7. Unity UI Toolkit 复刻建议

不要按当前 React Component 数量创建同等数量的独立 USS。

建议建立：

- `UISurface.uss`：Surface / Glass / Radius Tier；
- `UIControls.uss`：Button / Segmented / Toggle / Focus；
- `BottomCommand.uss`：L / M / S Command 专用 Tier；
- `FullscreenActions.uss`：Footer 布局语义；
- `RuntimeTooltipController`：共享 Tooltip；
- `GameplayBlurService`：URP Blur 的统一控制入口。

C# 只操作语义 Class，例如：

- `is-active`；
- `is-disabled`；
- `is-primary`；
- `surface-glass`；
- `size-md`。

不要在业务组件 C# 中直接散落颜色和 Radius 数值。

## 8. Review 结果

本轮新增自动检查并实际审图：

- Building Placement Segmented Control 外壳与 Option 圆角、Active Tone；
- Building Placement Panel Blur；
- Camera Context Surface Blur；
- Settings Footer Blur / 返回 Button Radius；
- New Game Footer Primary / Secondary + Segmented；
- Load Footer Button；
- Save Footer 四类 Action。

Build 与 Visual Review 均通过。

人工审图结论：

- Building Placement 的 Segmented Control 已明显更像可点击的互斥控件；
- Gameplay Workspace / Context / Tool Panel 从“纯黑块”转为更清晰的玉青玻璃层级；
- 背景依旧只作为弱环境信息，不影响参数阅读；
- Settings / New Game / Load / Save Footer Button 已进入同一轻圆角家族；
- 没有发现新增遮挡、尺寸跳变或状态语义回归。

## 9. 后续建议

1. 夜景背景资产可用后，增加一组固定 Night Gameplay Review，验证 Surface Tint 在极暗世界中的稳定性；
2. 下一次整理 Archive 时删除被共享 Visual System 覆盖的旧 Footer Button 声明；
3. 下一次清理 `styles.css` 时移除不再运行的早期 Gameplay / Tool CSS；
4. Unity 正式实现优先先建立共享 Surface / Control USS，再制作具体业务面板。
