# 2026-09-18 Load / Archive Global Surface 统一

本轮不改读档的信息架构，只迁移 Archive 的视觉系统与共享控件。

## 保留

- 全屏 Global Space；
- 左侧游戏组 / 右侧组内存档；
- Save / Load 共用 SaveEntryCard；
- 类型筛选、兼容状态与 Footer 职责。

## 调整

- 删除 Archive 自己硬编码的 gameplay city 背景图；
- Load / Save 继承父级 Main Menu / Gameplay 当前世界；
- Root / Header / Footer 迁入 Smoked Graphite Global Surface；
- Header 改普通 UI Typography；
- 删除“12组”等低价值数量统计；
- Group / Save Card 默认减少完整 Box 感，Selected 保留 2px Brass 状态线；
- 提升 7–8px 元数据的可读性；
- Auto / Manual / Quick 改为统一中性 metadata；
- 过时 / 不兼容只在兼容状态上使用暖色 / Cinnabar；
- 隐藏过时存档正式改用共享 ToggleSwitch；
- 删除 ui-control-system 中 Archive Toggle Compatibility Bridge；
- 删除 archive-info-refine.css，把正式 Archive 规则收回 archive-panel.css；
- 重命名 / 删除文档与当前统一 Dialog System 对齐。
