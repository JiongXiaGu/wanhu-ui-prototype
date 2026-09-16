# 2026-09-16 Placement Action Bar 与道路放置原型

## 背景

Building Placement 原中下主控使用 `平 / 填 / 高 │ 位 / 层 / 顶 / 面 │ 完成 / 取消` 文字占位。继续扩展道路、桥梁、城墙后，如果每个 Tool 各自维护一套底部条，会出现视觉、状态语义和代码重复。

本轮明确：详细参数属于左侧 Tool Parameter Panel；中下区域只承担模式切换、高频 One-shot Quick Action 与完成 / 取消；右下 World Utility 继续承担 Grid / Undo 等跨工具状态。

## 实现

新增共享：

- `src/tools/placement/PlacementActionBar.tsx`
- `src/tools/placement/placement-action-bar.css`

Building Placement 已迁移到共享 Action Bar：

- 图标化地形模式：平衡挖填 / 只填不挖 / 手动标高；
- 图标化调整对象：位置 / 楼身 / 屋顶 / 立面（Disabled）；
- Quick Actions：逆时针旋转 / 顺时针旋转 / 镜像；
- 完成 / 取消改为固定右侧图标组；
- 删除旧 `.bp-mode-action / .bp-submit / tool-bottom-cluster__primary` 等退出运行路径的 CSS。

新增 Road Placement：

- `src/tools/road-placement/RoadPlacementOverlay.tsx`
- `src/tools/road-placement/RoadPlacementDock.tsx`
- `src/tools/road-placement/road-placement.css`
- 道路 Design Workspace Item 现在进入 Road Placement；
- 绘制模式：智能曲线 / 曲线 / 直线；
- Quick Action：反转道路方向；
- 左侧面板验证道路宽度 / 相对标高 / 曲线平滑等参数；
- 完成 / 取消后返回 `设计 → 道路` Workspace。

状态层新增 `road-placement`、`RoadDrawMode` 与对应 reducer Action；Operation Hints 增加道路绘制上下文。

## 交互结论

Placement Action Bar 的三个语义固定为：

- Mode → Exclusive Selector，会改变当前模式 / 左参数面板内容；
- Quick Action → One-shot Action，只执行一次，不改变当前模式；
- Commit → 完成 / 取消当前 Tool。

不要把详细参数迁进中下 Action Bar，也不要把完成 / 取消、旋转、镜像等任务动作迁入 World Utility。

## Review

Build 通过。

Visual Review 新增并通过：

- Building Placement 共享 Action Bar 居中 / 约 70px 高；
- Building 两组 Mode 各有一个 Active；
- Building 旋转 / 镜像为 One-shot；
- Road Placement 复用相同外壳；
- Road 智能曲线 / 曲线 / 直线为互斥模式；
- Road 反转方向为 One-shot；
- Road 模式切换同步更新左侧参数面板；
- 完成道路放置返回 Road Design Workspace；
- Gameplay / Workspace / Management 等回归状态未被破坏。

正式规则见 `Documentation/Placement Tool设计规范.md`。
