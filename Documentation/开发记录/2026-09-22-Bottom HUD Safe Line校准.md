# Bottom HUD Safe Line 与双层 Utility 对齐

本轮不改变 World Utility 的按钮分组，只解决双层 Utility 与 Main Dock / Workspace 的空间关系。

- Main Dock：76px 高，bottom 从 16px 调到 30px；
- World Utility：104px 高，bottom 保持 16px；
- 两者视觉中心都位于距底约 68px；
- --hud-bottom-safe-line = edge + stacked utility height = 120px；
- --hud-bottom-safe-offset = safe line + 12px = 132px；
- Workspace / Operation Hints 消费同一安全偏移；
- Design Workspace 打开时 World Utility 继续保持双层，不因目录出现而降为单行；
- Tool / Building Selection 的 Context Utility 仍保持单行。

这属于 HUD Geometry Contract，不改变业务状态或功能入口。Unity 迁移时对应一个共享 Bottom HUD Safe Area，而不是为 Workspace / Hints 分别写魔法数字。
