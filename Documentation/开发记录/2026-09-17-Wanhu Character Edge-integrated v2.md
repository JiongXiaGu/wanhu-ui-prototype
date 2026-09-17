# 2026-09-17 Wanhu Character Edge-integrated v2

本轮针对 Character Pass v1 的三处“贴在文字附近的金色符号”做结构化收敛，不修改 Mist Glass、Edge & Elevation 或既定几何。

## 调整

- Top HUD：移除天气文字下方短梁，把 Anchor 改为嵌入 Top Status 左上边缘的中性短梁 + Old Gold 节点；
- Workspace：移除标题周围 Character Marker，把 Beam 移到 Header 顶部结构边缘；
- Context Filter：移除 L-joint / 下划线，只保留字体提亮、极弱 Surface 与单个 Joint Node；
- Main Dock：保留已复核的台基式 Active，不继续增加装饰；
- Character 颜色关系改为“中性结构线为主、Old Gold 只落节点”。

## Review

临时分支 `tmp-character-edge-integrated-v2` 完成 Build 与完整 Visual Review，自动断言覆盖：

- 天气文字不再存在 Character 下划线；
- Top HUD Character Anchor 位于 Surface Edge；
- Workspace 标题文字保持干净，Beam 位于 Header Edge；
- Filter Active 不再使用 L-joint / 长下划线；
- Main Dock 台基尺寸保持不变；
- Workspace 继续保持 1920 画布中心锚点与 120–200ms 落位动效；
- `prefers-reduced-motion` 正确关闭装饰动画。

人工检查白天 / 夜晚 Gameplay 与 Workspace 四张关键截图后：

- 三处原有“像后贴上去的金色符号”已经消失；
- Top HUD 与 Workspace 的 Character 现在归属于 Surface / Header 边缘，不再干扰文字阅读；
- Filter Active 的识别强度明显低于 Workspace Header 与 Main Dock，层级更合理；
- 夜景没有出现 Old Gold 过亮或结构线发光的问题；
- Utility / Operation Hint 未增加 Character 装饰。

后续 Character 扩展继续遵循“先结构、后装饰；先边缘、后文字附近”的约束，不因为需要识别度而重复添加短金线。
