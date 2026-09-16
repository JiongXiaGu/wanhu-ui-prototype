# 2026-09-16 Design Workspace 共享目录框架

本轮把原先只服务“建筑”的 Workspace Browser 泛化为设计模式八个一级建造类别共享的 `DesignWorkspace`。

## 目标

- 道路、桥梁、建筑、台基、城墙、围墙、装饰、树木都能从 Main Dock 打开实际内容；
- 不复制八套 Workspace 组件；
- 左侧 Primary Rail 常规支持最多 6 个汉字；
- Main Dock 保持“玩家没选就不 Selected”的规则；
- Workspace 内部 Filter 仍有真实默认状态，例如 `全部道路 / 全部`；
- Building Placement 原有工作流继续可用。

## 实现

新增：

- `src/workspace/DesignWorkspace.tsx`
- `src/workspace/design-workspace-model.ts`
- `src/workspace/design-workspace.css`
- `scripts/capture-design-workspace-review.mjs`

删除旧的 `src/workspace/BuildingWorkspace.tsx`，建筑数据迁移到共享 Definition。

`GameplayUiState.workspace` 从类别专用的 `building` 收束为通用 `design`；八个 Design Dock Category 都进入同一个 Workspace。切换设计分类时只替换 Definition；再次点击当前分类、关闭按钮或 Esc 都关闭 Workspace 并清空 Main Dock 分类。

当前只有建筑 Item 继续进入 Building Placement；其它七类先完成共享目录、Rail、Context Filter、搜索、分页和 Item 选择，为后续各自 Tool 留出清晰边界。

## Review

Visual Review 新增专用脚本，覆盖：

- 八个设计类别都能打开共享 Workspace；
- Workspace 标题与 Main Dock 入口一致；
- Primary Rail 槽位宽度不小于约 140px；
- 当前可见 Rail 标签不超过 6 个汉字；
- Primary Rail / Context Filter 各只有一个有效 Selected；
- 同入口再次点击会关闭并清除 Main Dock Selected；
- 道路 → 桥梁直接切换时只存在一个 Workspace Surface；
- 建筑 Item 进入 Building Placement，Esc 后返回 `设计 → 建筑`。

实际截图重点复核道路、桥梁、建筑、城墙，并回归普通 Gameplay 与 Building Placement。