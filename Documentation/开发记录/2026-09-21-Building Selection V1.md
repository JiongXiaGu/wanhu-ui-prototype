# Building Selection V1

本轮建立通用 World Selection 骨架，并以 Building 为第一个 Consumer。实现世界点击选中、弱熟铜 Selected、左下 Building Inspector、中下移动 / 编辑 / 关闭、右下 building-selection Utility，以及 Selection → Move / Edit / Color Tool → 原 Selection 的返回链。

Web 背景上的矩形 Hit Area 和经营数值是交互 / 构图 Fixture，不是正式世界 Picking 或业务数据权威。Unity 迁移使用 ECS / GameObject 身份、Selection Controller 和 World Renderer。

Selection 属于 Gameplay；没有新增顶层 Space 或 Selection Tool。Camera / Weather / Management / Workspace 清 Selection，Pause 保留对象身份。
