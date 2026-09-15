# 2026-09-16 World Utility Toolbar 重构

## 背景

Gameplay 原先的 Utility Toolbar 悬浮在 Main Dock 上方，视觉上形成额外工具岛；进入 Building Placement 后又出现一套局部的网格吸附、网格显示、撤销、重做，导致同一类世界级工具在不同模式中重复出现，也容易让玩家误以为 Grid 设置会随 Tool 切换而重置。

本轮将这类跨分类、跨 Tool 仍然成立的能力正式收束为 **World Utility Toolbar / 世界工具栏**。

## 本轮修改

- World Utility Toolbar 固定到右下角，和 Operation Hints 保持对齐但不合并为同一 Surface；
- 工具栏当前包含：地图解锁、区域编辑、地形编辑、配色工具、网格吸附、网格显示、范围复制、范围移动、撤销、重做；
- 网格吸附与网格显示直接使用 `GameplayUiState` 中的全局状态；
- World Utility Toolbar 在 Normal Gameplay、Building Workspace、Building Placement 中保持存在；
- Management / Pause 不显示 World Utility Toolbar；
- Building Placement Dock 删除原有局部 Grid / Undo Utility Strip，只保留 `平 / 填 / 高`、`位 / 层 / 顶 / 面`、完成、取消；
- Main Dock 继续只负责“建造什么”，World Utility Toolbar 负责“如何编辑世界”，Operation Hints 只负责输入说明。

## 状态验证

Visual Review 增加以下约束：

- Normal Gameplay 的 World Utility Toolbar 必须位于右下，不与 Main Dock 或 Operation Hints 重叠；
- 在 Normal Gameplay 关闭“网格吸附”后进入 Building Placement，状态必须继续保持关闭；
- Building Workspace 与 Building Placement 都必须保留 World Utility Toolbar；
- Building Placement 不得再出现 `.placement-utility-strip` 局部副本；
- Management Space 中 World Utility Toolbar 必须隐藏。

## 复核结果

- Build 通过；
- Visual Review 通过；
- 已实际检查 1920×1080 的 Normal Gameplay、Building Workspace、Building Placement 截图；
- 当前右下工具栏与 Operation Hints 分层成立，Main Dock 保持独立；
- Building Placement 中没有重复 Grid / Undo 工具，三套空间职责已经分开。

后续优先继续调整 Main Dock 自身的比例与美术，不把 World Utility Toolbar 再合并回 Main Dock。
