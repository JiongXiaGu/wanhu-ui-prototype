# 2026-09-16 Building Placement 主控栏与样式所有权整理

## 本轮目标

继续统一 Gameplay HUD 的美术层级，同时明确 Building Placement 中央底部操作栏是当前放置任务的主控，不应与右下 World Utility Toolbar 处于同等甚至更弱的视觉权重。

## 结果

### Building Placement 主控栏

中央 Tool Bottom Dock 升级为当前任务的 Primary Control：

- Dock 高度约 `66px`；
- `平 / 填 / 高` 与 `位 / 层 / 顶 / 面` 模式按钮约 `48 × 48px`；
- `完成 / 取消` 高度约 `48px`；
- `完成` 宽度约 `90px+`，保持最明确的主动作层级；
- Dock 使用 Primary Surface、`14px` 圆角和统一 Gameplay HUD 阴影；
- 选中模式继续使用克制暖金 Tone，不使用大面积高饱和金底。

层级关系因此明确为：当前 Tool 主控 > World Utility 全局辅助 > Operation Hints 只读提示。

### 交互语义

Building Placement 的模式按钮是 Exclusive Selector，而不是普通 Toggle：

- 地形处理方式始终恰好有一个 selected；
- 建筑调整对象始终恰好有一个 selected；
- Web 原型通过 `aria-pressed` 明确状态；
- 最终 Unity UI Toolkit 应使用显式 selected class / state，不通过 VisualTree 反推业务状态。

### CSS / 样式所有权整理

本轮删除 `src/gameplay/gameplay-context-unified.css`。

此前该文件曾作为后加载 Override 层同时覆盖 Building Placement、Operation Hints、旧 HUD 几何，造成一个组件存在多个视觉 / 几何所有者，已经实际导致过 Right Edge Flyout 样式被旧规则覆盖的问题。

现在：

- Building Placement → `src/tools/building-placement/building-placement.css`；
- Gameplay 外围位置与 Token → `src/gameplay/gameplay-hud-layout.css`；
- World Utility → `src/gameplay/world-utility-toolbar.css`；
- Operation Hints → `src/gameplay/operation-hints-refined.css`；
- Right Edge Flyout → `src/gameplay/right-edge-flyout.css`。

原则继续保持：一个组件只有一个明确的内部视觉所有者；外围跨组件几何只由 Gameplay Layout 层管理。

## Review 约束

Visual Review 增加以下自动约束：

- Building Placement 主控 Dock 保持屏幕几何居中；
- 高度约 `66px`；
- 模式按钮点击目标不少于约 `46 × 46px`；
- `完成`保持明显主动作尺寸；
- Dock 使用统一圆角家族；
- 地形模式与调整对象分别只能有一个 `aria-pressed=true`；
- Building Placement 不重新创建 Grid / Undo 等 World Utility 副本。

同时继续回归检查 Normal Gameplay、Workspace、Top Shell、Camera / Weather 等既有状态，避免主控栏调整破坏其它 Gameplay HUD。
