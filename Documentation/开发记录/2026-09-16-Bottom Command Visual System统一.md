# 2026-09-16 Bottom Command Visual System 统一

## 背景

Gameplay 底部已经形成三类稳定 Toolbar：Main Dock、Placement Action Bar、World Utility Toolbar。此前三者虽然都使用 HUD Token，但分别维护背景、边界、按钮尺寸、Selected 状态线和分隔线，视觉逐渐漂移：Placement 偏“按钮盒子”，World Utility 更轻，Main Dock 左侧 `设计 / 蓝图` 又像独立嵌套控件。

这会增加后续 Unity UI Toolkit 复刻成本，因为同一种视觉意图需要被翻译成多份 USS。

## 本次调整

建立统一 **Bottom Command Visual System**：

- Main Dock = L 档；
- Placement Action Bar = M 档；
- World Utility Toolbar = S 档。

统一：

- Surface 材质；
- Border；
- 14px 外框圆角；
- Button Hover；
- 暖金 Active Tone；
- 分隔线；
- Tooltip；
- 底部横向 Toolbar 的顶部 Active Line。

层级只通过高度、点击区、内容密度和 Shadow Tier 表达。

当前 1080p 基线：

- Main Dock：76px；
- Placement Action Bar：68px，46×46 控件，20px 图标；
- World Utility：56px，42×42 控件，20px 图标。

Placement 删除了逐按钮透明 Border 和额外径向金色 Surface，完成按钮改为 Toolbar 内部暖金 Tone，不再像单独网页 Primary Button。Main Dock `设计 / 蓝图` 删除独立内层卡片背景，但保留竖向一级 Selector 的左侧状态线。

## 代码整理

视觉 Token 集中在：

`src/gameplay/gameplay-hud-layout.css`

新增共享 Surface Class：

`src/gameplay/bottom-command-system.css`

共享类：

- `.bottom-command-surface`
- `.bottom-command-surface--lg`
- `.bottom-command-surface--md`
- `.bottom-command-surface--sm`

三类 Consumer 只负责自身内部布局：

- Main Dock：`src/gameplay-refine.css`
- Placement：`src/tools/placement/placement-action-bar.css`
- World Utility：`src/gameplay/world-utility-toolbar.css`

React 组件显式挂载共享 Surface / Tier class，避免只靠三个 CSS 文件复制相同声明。

## Unity UI Toolkit 意义

这套结构可以直接翻译为共享 USS 契约：

```text
BottomCommandSurface
├ Size Tier Class
└ Command Groups
```

正式 Unity 不需要复制三套外壳 USS；可以共享 Surface、Button State、Divider 与 Tooltip 状态类，只由不同 UXML / C# Consumer 提供内容与尺寸 Tier。

Web 的 Gradient / Shadow / Blur 只代表目标视觉，Unity 可使用 USS Tint、共享 9-slice、Shadow Sprite 或 Overlay VisualElement 实现。

正式规范：`Documentation/Bottom Command Visual System设计规范.md`。

## Review

本次代码调整通过 Build 与 1920×1080 Visual Review，并实际检查：

- Normal Gameplay / Main Dock；
- Blueprint Main Dock；
- Building Placement；
- Road Placement；
- Design Workspace 回归。

审图结果：三类底部 Command Surface 已形成明显的同一家族关系；Placement 不再出现独立的“按钮盒子”美术，World Utility 的 Selected Line 与其它底部控制条方向一致，Main Dock 左侧模式区也不再像额外嵌套面板。
