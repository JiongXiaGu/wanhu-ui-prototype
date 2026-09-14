# UI 空间与状态架构

## 1. 顶层 Screen

原型当前顶层 Screen：

- `menu`
- `newGame`
- `load`
- `settings`
- `gameplay`

顶层 Screen 由 `src/App.tsx` 管理。

## 2. Gameplay Space

Gameplay 内部不是用大量互相独立的 Modal 叠加，而是按空间职责切换。

### Gameplay

默认经营状态。

组成：

- Gameplay HUD
- Quick Controls
- Utility Toolbar
- Main Dock

### Workspace

用于浏览和选择内容，例如建筑目录。

组成：

- Workspace
- Main Dock

进入 Workspace 后隐藏 Utility Toolbar，避免 Workspace 与 Dock 之间出现无意义空层。

### Tool

用于进入具体编辑工具，例如 Building Placement。

组成：

- ToolOverlay
- Tool Bottom Dock
- GameplayOperationHints

进入 Tool 后隐藏 Main Dock 与 Utility Toolbar。

### Pause

Pause 是全局 UI Space，不是普通 Modal。

组成：

- Pause Menu
- Pause Save
- Pause Settings

世界仍作为背景存在，但明显压暗，并可使用轻微 Blur。

## 3. Right Edge Flyout

Camera / Weather 共用屏幕右侧槽位。

规则：

- 从屏幕右侧滑入；
- 不锚定到触发按钮；
- Camera 与 Weather 互斥；
- Tool 状态中打开 Flyout 时，GameplayOperationHints 隐藏，而不是向屏幕中心移动；
- Right Edge Flyout 是辅助空间，不应升级成主要全屏界面。

## 4. Global Management Space

Archive 与 Settings 属于全屏全局管理空间。

### Archive

Load 模式结构：

`Game Group → Save Timeline → Save Preview`

Game Group 代表玩家从一次“新建游戏”开始的一整场游戏；Save 是这个 Game Group 内部的历史节点。

Save 模式进入 Archive Space 时，当前 Game Group 固定，不允许把当前城市保存进其他游戏组。

### Settings

Settings 在 Main Menu 与 Pause 中复用同一组件和同一视觉系统。

分类：

- 显示
- 图形
- 音频
- 操作
- 游戏

不为 Main Menu 和 Pause 分别维护两套 Settings。

## 5. Gameplay 状态模型

`src/app/ui-state.ts` 是 Gameplay UI 状态的集中入口。

核心状态包括：

- `workspace`
- `tool`
- `flyout`
- `paused`
- `pauseView`
- `speed`
- `activeCategory`
- `terrainMode`
- `adjustmentMode`
- `gridSnap`
- `gridVisible`
- `canUndo`
- `canRedo`

空间优先级：

1. Pause
2. Tool
3. Workspace
4. Gameplay

即：

```text
paused = true            → Pause
else tool != none        → Tool
else workspace != none   → Workspace
else                     → Gameplay
```

## 6. Building Placement 模式

### 地形关系

- `平`：balanced-earthwork，平衡挖填；
- `填`：fill-only，只允许填方；
- `高`：manual-elevation，手动标高。

### 调整对象

- `位`：position，位置；
- `层`：massing，楼身 / 体量；
- `顶`：roof，屋顶；
- `面`：facade，立面，当前保留为未完成 / Disabled 状态。

左侧 ToolOverlay 内容根据当前调整对象改变，而不是同时显示全部参数。

`高` 模式会在当前参数区域上方增加手动标高相关内容。

## 7. Building Placement Dock

Dock 分两层：

上层 Utility：

- 网格吸附
- 网格显示
- 撤销
- 重做

下层 Main：

- `平 / 填 / 高`
- `位 / 层 / 顶 / 面`
- 完成
- 取消

网格吸附和网格显示是 Toggle；撤销 / 重做是历史操作；完成 / 取消属于当前放置任务。

取消未提交放置不是危险操作，因此不使用强烈 Destructive Red。

## 8. GameplayOperationHints

OperationHints 位于右下，是轻量 Shortcut Rail。

职责：

- 显示当前调整模式；
- 显示当前最重要输入；
- 显示旋转、反转、撤销、重做、取消等快捷键。

它不承担教程长文。

最终 Unity 实现中，按键文字应来自实际 Input System 绑定，并支持 Keyboard/Mouse 与 Gamepad 动态切换；Web 原型只使用代表性 Keycap。

## 9. Esc 优先级

原则：先关闭更局部的空间，再关闭更全局的空间。

当前主要规则：

- Pause Save / Pause Settings → Esc 返回 Pause Menu；
- Pause Menu → Esc 恢复游戏；
- 局部 Flyout / Tool 子层应优先于更宽泛菜单关闭。

新增 UI Space 时必须继续遵守这个优先级，不要让 Esc 行为互相竞争。

## 10. Review Scenario

`src/app/scenarios.ts` 提供确定性的 UI Bootstrap，用于视觉评审，不依赖人工点击流程。

Review Scenario 是测试入口，不是业务路由。

新增重要 UI 状态时，应同步增加 Review Scenario 和 Playwright 截图场景。
