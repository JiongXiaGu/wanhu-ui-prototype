# Gameplay 空间模型

## 决策

Gameplay UI 按四个互斥或优先级明确的 Space 组织：

- Gameplay
- Workspace
- Tool
- Pause

## 结构

### Gameplay

`HUD + Utility Toolbar + Main Dock`

### Workspace

`Workspace + Main Dock`

Utility Toolbar 隐藏，避免 Workspace 与 Dock 之间形成无意义空层。

### Tool

`ToolOverlay + Tool Bottom Dock + GameplayOperationHints`

Main Dock 与 Utility Toolbar 隐藏。

### Pause

`Pause Layer + Pause Menu / Save / Settings`

Pause 是全局空间，不是普通 Modal。

## 优先级

```text
Pause > Tool > Workspace > Gameplay
```

`src/app/ui-state.ts` 的 `selectGameplaySpace` 负责体现这个优先级。

## 原因

如果所有界面都按“弹窗叠加”处理，会出现：

- HUD、Dock、Tool、Workspace 相互遮挡；
- Esc 行为难以定义；
- 同时显示多个同级交互入口；
- 视觉层级无法稳定。

空间模型明确后，每个状态只保留与当前任务相关的 UI。

## 辅助空间

Camera / Weather 属于 Right Edge Flyout，不升级为独立 Gameplay Space。Flyout 可以在部分 Gameplay / Tool 状态上方出现，但必须遵守局部互斥规则，例如 Tool + Flyout 时隐藏 OperationHints。
