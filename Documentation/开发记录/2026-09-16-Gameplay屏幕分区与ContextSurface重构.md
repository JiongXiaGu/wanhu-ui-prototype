# Gameplay 屏幕分区与 Context Surface 重构

本轮将 Gameplay 从“Top Shell + 右侧 Flyout + 底部工具”的局部拼接方式，进一步整理为稳定的屏幕槽位体系。

## 目标

- 让每类信息有长期稳定的位置语义；
- 为以后选中建筑 / 居民、城市小地图、事件提醒预留明确空间；
- 避免 Camera / Weather 与 Workspace 同时占据大面积画面；
- 把 Pause Menu 从场景工具中分离出来；
- 删除已经退出运行路径的旧 UI 组件。

## 最终分区

- 左上：Navigation HUD，当前用城市缩略图 + 指南针验证构图；
- 顶部中央：Top Shell；
- 右上：低存在感 System Menu，未来保留 Notification / Objective；
- 左下：Context Surface；
- 中下：Main Dock / Workspace / Tool Dock；
- 右下：Operation Hints + World Utility Toolbar。

外围遵守 16px Safe Edge，同级 Surface 常用 12px 间距。

## Top Shell 调整

Control Tray 从：

`Information Views │ 五个管理域 │ Camera / Weather / Menu`

调整为：

`Camera / Weather │ 五个管理域 │ Information Views`

Menu 不再属于 Control Tray，改为屏幕右上独立 System Menu Button。

## Context Surface

旧 Right Edge Flyout 被删除。Camera / Weather 迁移到左下共享 Context Surface。

当前：

- Camera 约 360px 宽；
- Weather 约 400px 宽；
- 高度内容驱动，最大约 50vh；
- 位于 Main Dock 上方约 12px；
- Camera / Weather 互斥；
- Design Workspace 与 Context Surface 双向互斥。

后续 Selection Inspector 可以复用同一屏幕槽位，但是否与 Workspace 共存需要结合真实对象选择流程单独验证。

## Navigation / Notification 预留

左上 Navigation HUD 目前只是视觉 / 空间原型，正式实现应使用实际小地图数据或 RenderTexture，不把当前背景截图裁切当作最终方案。

右上除 System Menu 外不再放场景参数面板，空出的区域保留给：

- 城市事件；
- 待处理提醒；
- 教学 / 当前目标；
- 建筑完成、居民事件等被动信息。

形成“左侧玩家主动查看，右侧游戏主动通知”的空间语义。

## 状态重构

`GameplayUiState` 中：

- `flyout` 更名为 `contextPanel`；
- `SET_FLYOUT` 更名为 `SET_CONTEXT_PANEL`；
- Camera / Weather、Workspace、Management、Map Palette、Tool 的互斥关系集中在 reducer。

Esc 退栈顺序更新为：

`Context Surface → Information Palette → Tool → Workspace → Management → Map View → Pause`

## 代码清理

删除：

- `src/gameplay/RightEdgeFlyout.tsx`
- `src/gameplay/right-edge-flyout.css`
- `src/gameplay/QuickControls.tsx`
- `src/gameplay/CityManagementRail.tsx`

新增：

- `src/gameplay/GameplayContextPanel.tsx`
- `src/gameplay/gameplay-context-panel.css`
- `src/gameplay/GameplayCornerHud.tsx`
- `src/gameplay/gameplay-corner-hud.css`

## Review

Visual Review 新增 / 更新检查：

- Navigation HUD 左上 16px Safe Edge；
- System Menu 右上 16px Safe Edge；
- Control Tray 新顺序与约 400px 宽度；
- Camera / Weather 左下 Context Surface；
- Context Surface 最大约半屏；
- Context Surface 与 Workspace 双向互斥；
- Tool / Management 中 Context Surface 的清理；
- Information Views 改为右侧入口并从右侧展开；
- 原有 Main Dock / World Utility / Building Placement 状态回归。
