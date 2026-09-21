# Bottom HUD 统一 84px

本轮继续验证更轻的底部 HUD 比例。

- Main Dock：84px 高，bottom=16px；
- 双层 World Utility：84px 高，bottom=16px；
- 两者同高、同底边；
- Utility 两行各 36px 命中区，图标仍 20px；
- Stacked Surface 使用 4px 上下 padding + 4px 行间距；
- Bottom HUD Safe Line = 16 + 84 = 100px；
- Workspace / Operation Hints Safe Offset = 100 + 12 = 112px；
- Design Workspace 打开时双层 Utility 继续存在；
- Tool / Building Selection 的单行 Utility 不受影响。

这次仍只调整 HUD Geometry，不改按钮顺序和业务语义。
