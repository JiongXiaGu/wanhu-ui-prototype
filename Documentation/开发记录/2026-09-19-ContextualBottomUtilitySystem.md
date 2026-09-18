# 2026-09-19 Contextual Bottom Utility System

本轮把右下 World Utility 从“所有 Tool 都完整常驻”改为真正的上下文辅助槽。

## 结构

```text
Gameplay / Workspace → World Utility
Building Placement   → Building Utility
Road Placement       → Road Utility
```

只保留一个 `ContextUtilityToolbar` Host。Tool 切换时重绑 Definition，不同时挂载多份 Toolbar。

## 当前 Definition

World：

- 地图解锁 / 编辑区域 / 地形编辑 / 配色工具；
- Grid Snap / Grid Visible / 范围复制 / 范围移动；
- Undo / Redo。

Building：

- Grid Snap / Grid Visible；
- 对齐最近道路 / 校准建筑基底；
- Undo / Redo。

Road：

- Grid Snap / Grid Visible；
- 拉直当前道路段 / 连接最近道路节点；
- Undo / Redo。

进入 Placement 后，世界级地图 / 区域 / 地形 / 配色 / 范围复制 / 范围移动不再显示。

## Animation

- Exit：100ms，Opacity 1→0 + TranslateY 0→6px；
- Hidden 时切换 Definition 与 Width；
- Enter：约 140ms，Opacity 0→1 + TranslateY 6px→0；
- 不动画 Width；
- Exit / Enter 阶段按钮禁用，避免透明旧按钮继续响应。

这套行为可直接映射 Unity UI Toolkit：固定 Host、C# Rebind、USS opacity/translate transition。

## 代码

- 新增 `src/gameplay/ContextUtilityToolbar.tsx`；
- 新增 `src/gameplay/context-utility-toolbar.css`；
- `CommandBar.tsx` 只保留 Main Dock；
- `GameplayScreen.tsx` 根据 `GameplayUiState.tool` 驱动 Context Utility；
- 旧 `world-utility-toolbar.css` 退出正式运行结构。

## 验证

Visual Review 自动化已退出默认流程。本轮要求 Build 成功，并检查 Tool Context / Pointer / 状态所有权。
