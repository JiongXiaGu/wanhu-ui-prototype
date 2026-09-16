# 2026-09-16 Gameplay 指南针与左下 Context 锚点

本轮继续收敛 Gameplay 稳定屏幕分区。

## 改动

- 左上旧城市缩略图 / 小地图原型退出运行构图，改为约 `76×76px` 的独立 Compass HUD；
- Compass 使用中文 `东 / 南 / 西 / 北`，北向暖金强调，Building Placement 中增强南北轴清晰度；
- Compass 不参与世界输入，后续正式 Unity 绑定真实相机水平朝向；
- 左下 Camera / Weather 继续共用 Context Surface，但统一改为直接锚定 `16px` 左 / 下 Safe Edge；
- 左下完整 Context Surface 最大高度提高为 `720px`，即 1080p 逻辑画布约 2/3；超过时只滚动 Body；
- Context Surface 增加通用 `gameplay-left-context-surface` 几何类，后续 Selection Inspector 等左下长面板复用同一锚点规则；
- Camera / Weather 与 Design Workspace 的互斥逻辑保持不变；
- Visual Review 新增 Compass 四向、左上 Safe Edge、建造态增强、Context Surface 底部锚点与 2/3 高度上限检查。

## 设计原因

城市建造玩法主要从高机位观察，尤其中国古代建筑对南北轴、院落朝向、宫殿和祠庙布局高度敏感，因此左上常驻信息优先使用指南针而不是局部小地图。

Camera / Weather 当前宽度最多约 400px，而居中 Main Dock 在 1920×1080 基线约从 x=490 开始，两者不存在横向冲突，因此没有必要为了 Main Dock 把左下 Context Surface 整体上抬，造成明显无意义空白。
