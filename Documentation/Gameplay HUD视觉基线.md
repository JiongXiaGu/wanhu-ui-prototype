# Gameplay HUD 视觉基线

Gameplay HUD 的目标是让世界画面始终成为主体，同时让不同操作模块看起来属于同一套系统。

## 空间职责

- Gameplay Top Shell：城市持续状态、城市管理入口、信息视图入口；
- Main Dock：回答“我要建造什么”，只承载建造 / 内容分类；
- World Utility Toolbar：回答“我要如何编辑世界”，承载跨分类、跨 Tool 仍然成立的世界级工具；
- Operation Hints：只显示当前输入提示，不承担可点击操作；
- Tool Bottom Dock：只负责当前 Tool 的任务专用模式、参数、完成与取消。

World Utility Toolbar 与 Operation Hints 在空间上右对齐，但保持独立 Surface；进入 Building Placement 时不复制 Grid / Undo 等世界级工具。

## 1920×1080 外边距基线

Gameplay 外围 HUD 使用统一安全边距：

- 左 / 右 / 下：`24px`；
- 顶部 Top Shell：`16px`；
- 相邻独立 HUD 模块常用间距：`12px`；
- Main Dock 与 World Utility Toolbar 在 1920×1080 下保持约 `16px` 的水平间隔。

Main Dock、Top Shell、Management Space 等核心操作结构跟随视觉中心；World Utility Toolbar、Operation Hints 等外围工具跟随 Viewport 边缘。超宽屏中外围工具允许移动到更外侧，不强制贴近视觉中心。

代码中的外围几何统一由 `src/gameplay/gameplay-hud-layout.css` 管理，组件 CSS 只维护内部排版和视觉状态，避免各组件自行维护 `18 / 20 / 22 / 24px` 等近似边距。

## Surface 层级

HUD 不通过增加装饰来制造层级，而通过 Surface 重量区分职责：

1. **Primary Surface**：Top Status Row、Main Dock。背景最实、边界与阴影最清晰；
2. **Secondary Surface**：Management Navigation Row、World Utility Toolbar、Tool Bottom Dock。比 Primary 更轻；
3. **Tertiary Surface**：Operation Hints。透明度最高、几乎无阴影，明确是只读辅助信息。

暖金只用于 Selected / Toggle On / Focus，不让所有边框、图标和标题同时发金。

## World Utility Toolbar

当前分为三组：

- 世界编辑：地图解锁 / 区域编辑 / 地形编辑 / 配色；
- 编辑辅助：网格吸附 / 网格显示 / 范围复制 / 范围移动；
- 历史：撤销 / 重做。

分组只使用弱分隔线，不增加常驻组标题。按钮保持图标优先，Hover Tooltip 提供名称。

网格吸附 / 网格显示是 Toggle：启用时持续保留弱暖金状态；撤销 / 重做等 Action 不保留选中态。

## Operation Hints

Operation Hints 是只读快捷键提示，不与 World Utility Toolbar 合并。

- Normal Gameplay 标题只显示“操作提示”；
- Tool 状态标题显示当前任务，如“建筑放置 / 体量调整 / 屋顶调整”；
- 描述尽量使用短动词，如“旋转 / 移动 / 缩放 / 菜单”；
- 不承担教程长文。
