# 2026-09-26 W3 Typography / Text Layout Parity 收尾审查

本审查基于 main `d9aa9255d522c0743b4f38bc98e154bf6a340d80`。W3.1–W3.5 的 Runtime 视觉已通过对应 Targeted Review，并在 main 完成 Build + Core / HUD / Dialog / Readability / Tools / Selection 全量回归。

## 结论

W3 可以正式结束。本阶段解决的是“真实 Consumer 的文字布局 / 阅读层级 / Unity 映射是否稳定”，不是追求所有源码字号都统一成同一个数字。

## 已完成

- W3.1：建立 Computed Style / Range text rect / Control center / Icon-Text / Canvas TextMetrics 基线；1080p 与 4K 归一化几何一致。
- W3.2：16px Left Context / Design Workspace 标题采用 24px 固定标题盒 + 垂直居中，中心偏移由约 -0.63px 收敛到 0px。
- W3.3：Building / Road Placement 参数标签与 Building / Terrain 指标统一到 11 / 12px。
- W3.4：New Game 地图筛选与 ValueButton 使用 12px；Feature 私有 Start 字号退役，由共享 Global Space Button 持有最终字号。
- W3.5：New Game 地图描述使用 Reading 13px，Facts 值使用 Body 12px，“开局方案”使用 Subheading 14px；410px 右栏在 1080p 无新增滚动，Facts 无截断。

## 最终审计

- Hardcoded px font-size：96
- Token-backed font-size：211
- Fonts below 10px：6
- Typography floor violations (<9.5px)：0
- Allowed symbolic text below floor：2

## 剩余 6 个 <10px

1. `gameplay-corner-hud.css` 8px：Compass 通用方位字，象征 / 仪表标记，允许。
2. `gameplay-corner-hud.css` 9px：Compass South，同上，允许。
3. `pause-layer.css` 9.5px：Pause Heading 辅助副标题；留待 Pause 专项。
4. `city-management.css` 9.5px：Management Task 状态字；Management / Inventory 按既有决策暂缓优化。
5. `placement-parameter-controls.css` 9.5px：`.bp-segment-row.ui-labeled-control-row>span` 当前无真实 Consumer，属于死 selector。
6. `terrain-edit.css` 9.5px：`.terrain-edit-note` 当前无 TSX Consumer，属于死 selector。

## 后续工作方式

- A Scope / Measure：只读定界，一个用户可感知意图、一个模块、一个验收组。
- B Implement：一次完成 1–3 个 Runtime 文件，最多 1 个匹配 Review。
- C Review / Closeout：一次 Targeted Review，人工看 1–3 张关键图，合入 main；main Gate 只做事件点检查。

避免两个极端：一两个 selector 就拆一轮 PR / Actions；或把两个以上视觉意图、多个模块塞进同一批。

## 下一阶段

不再继续 W3 Typography 专项。后续恢复正常 UI / Unity 迁移准备工作；只有真实页面再次出现可见文字问题时，才在对应模块内处理。