# Bottom HUD 统一 96px

本轮继续保留右下双层 World Utility，但取消上一版“Main Dock 抬高 14px”的做法。

稳定几何：

- Main Dock：96px 高，bottom=16px；
- 双层 World Utility：96px 高，bottom=16px；
- 两者同高、同底边；
- Utility 两行仍保留 42px 命中按钮，Stacked Surface 使用 4px 上下 padding + 2px 行间距；
- Bottom HUD Safe Line = 16 + 96 = 112px；
- Workspace / Operation Hints Safe Offset = 112 + 12 = 124px；
- Design Workspace 打开时双层 Utility 继续存在；
- Tool / Building Selection 的单行 Utility 不受影响。

这次只调整 HUD Geometry，不改按钮顺序、工具语义和业务状态。
