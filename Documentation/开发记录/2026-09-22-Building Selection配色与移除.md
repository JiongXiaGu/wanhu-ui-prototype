# Building Selection 配色与移除

本轮将 Building Selection 的对象操作整理为：

```text
左下 Inspector
├ 经营 / 状态
└ 外观参数
   ├ 配色方案
   └ 做旧程度

中下
移动 | 配色(toggle) | 关闭

右下
聚焦 | Undo | Redo | 移除
```

配色不再占用右下 Utility，也不进入顶层 Color Tool。中下“配色”和左侧“配色方案”行共同控制 Selection 内 BuildingSchemeWorkspace；应用方案后左侧名称实时更新，Esc 只关闭方案 Workspace。

移除复用统一 DialogSystem 的 danger confirm。Web Demo 确认后将对应 Building Hit Area 从可选择集合隐藏并清 Selection；这是交互 Fixture，不代表正式 ECS 删除策略。Unity 应由 Remove Building Command 处理建筑关联资源与引用。
