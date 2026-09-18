# UI Motion System 设计规范

## 1. 目标

《万户天工》的 UI 动效用于表达 **空间归属、任务切换和状态反馈**，不是装饰性动画。

正式基线来自 Contextual Bottom Utility 已验证的交互：

> 旧内容先淡出并向自己的锚点收起 → 隐藏状态下 Rebind → 新内容从锚点淡入回位。

业务状态立即生效；旧画面可以短暂保留用于 Exit Motion，但不得继续接收输入。

## 2. Motion Token

正式只保留四档时长：

- Fast：`100ms`，退出、Press、极短反馈；
- Control：`120ms`，Hover、Selected、Tab、内容 Crossfade；
- Surface：`160ms`，Toolbar、Context、Workspace、Dialog；
- Space：`200ms`，Management / 大型空间。

附加：

- Tooltip Delay：约 `320ms`；
- Small Distance：`4px`；
- Medium Distance：`8px`；
- Large Distance：`12px`。

正式 Token 位于 `src/ui/ui-motion-system.css`；React / TypeScript 时间常量位于 `src/ui/motion.ts`。

## 3. Presence 状态

共享 Presentation State：

```text
entering
steady
exiting
hidden
```

规则：

- Business State 不等待动画；
- Exit 开始立即禁用 Pointer / Interaction；
- Exit 完成后才卸载旧 Visual；
- Enter 阶段可以暂时禁用输入，进入 steady 后恢复；
- Reduced Motion 下直接收敛到最终状态。

## 4. 空间方向

### Bottom Surface

Main Dock / Workspace / Placement Action Bar / Context Utility：

- Enter：Fade + `Y +8 → 0`；
- Exit：Fade + `Y 0 → +8`。

### Left Surface

Camera / Environment / Placement Context：

- Enter：Fade + `X -8 → 0`；
- Exit：Fade + `X 0 → -8`。

### Top Surface

Control Tray / Top Popover：

- Enter：Fade + `Y -4 → 0`；
- Exit：Fade + `Y 0 → -4`。

### Center Surface

Pause / Dialog / Management：

- Enter：Fade + `Y +6~8 → 0`；
- Exit：Fade + `Y 0 → +6~8`。

大型 Surface 不使用明显 Scale / Overshoot / Bounce。

## 5. Tool Handoff

Workspace → Tool：

1. Gameplay State 立即进入 Tool；
2. Workspace / Main Dock / Control Tray 进入 Fast Exit；
3. Context Utility 同时执行 World → Tool Definition Swap；
4. 约 100ms 后 Tool UI 开始 Surface Enter；
5. Placement Context 从左侧进入；
6. Placement Action Bar 从底部进入。

Tool → Workspace 反向执行。

Width / Height 不做插值；Context Utility 在隐藏阶段直接切换 Width。

## 6. Blocking / Elevated

### Management

- Scrim：Control Fade；
- Panel：Space Enter，Fast Exit；
- Management 一级域切换时 Root 不重新开关，只让 Body 做 Control 级 Crossfade；
- Topic Header 颜色跟随数据状态切换，不做大幅位移动画。

### Pause

- World Dim / Atmosphere：Control Fade；
- Command Surface：Surface Enter / Fast Exit；
- Pause → Save / Settings：旧 Surface 先退出，再进入 Secondary View；
- 返回 Pause 反向。

### Dialog

- Backdrop：Control Fade；
- Panel：Surface Center Motion；
- Confirm / Cancel 后先进入 Exit，再卸载；
- Exit 时 Keyboard / Pointer Interaction 必须立即停止；
- Warning / Danger 不使用 Shake / Pulse。

## 7. Control Motion

- Hover：Control；
- Press：最多 1px 位移，Fast；
- Selected / Active Line：Control；
- Slider / Toggle 的值变化不做弹跳；
- Tooltip 只做 Fade + 2~4px Translate。

## 8. 禁止

- 大型 Surface 动画 Width / Height；
- 整页横向 Carousel 飞入；
- 大量 stagger 列表逐项飞入；
- Overshoot / Bounce；
- Danger Shake；
- Hover 位移超过 1px；
- 动态动画 Blur Radius；
- 用动画延迟业务状态；
- 每个组件自行发明时长 / Ease。

## 9. Unity UI Toolkit

推荐：

```text
Business State
      ↓
UITransitionController
      ↓
Presence Class
      ↓
USS opacity / translate transition
```

建议 Preset：

- BottomSurface；
- LeftSurface；
- TopSurface；
- CenterSurface；
- CrossFade。

C# 负责：

- Class 切换；
- PickingMode；
- 延迟隐藏；
- Rebind 时机；
- Focus 交还。

USS 负责：

- Opacity；
- Translate；
- Duration；
- Ease。

不要建立复杂 Timeline 动画框架。

## 10. 当前 Web 实现

共享：

- `src/ui/motion.ts`
- `src/ui/ui-motion-system.css`

已接入：

- Main Menu / New Game / Load / Settings / Loading / Gameplay 全局 Screen Crossfade；
- Main Dock；
- Design Workspace；
- Top Control Tray；
- Camera / Environment Context Open / Close + 同壳内容 Crossfade；
- Building / Road Placement Context；
- Placement Action Bar；
- Context Utility Swap；
- Management Open / Close + Body Rebind；
- Pause Open / Close + Secondary View Handoff；
- Dialog Open / Close；
- Toast 时长开始消费共享 Motion Token。

高频组件的 Hover / Pager / Inspector / Operation Hint 时长也已开始消费共享 Motion Token。

后续新增 UI 默认必须先选择 Motion Preset，而不是写新的局部 keyframe。页面级 Flow 统一使用轻 Crossfade + 4px Enter，不使用横向 App 式滑页。
