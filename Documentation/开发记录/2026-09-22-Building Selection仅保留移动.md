# Building Selection 取消 Edit 入口

当前 Building Selection 的对象操作正式收敛为：

- 移动：进入 Building Placement，intent=move；
- 关闭：CLEAR_SELECTION。

删除“编辑建筑”入口、building-edit Tool、AdjustmentMode 状态与对应 Review 场景。原因是 Selection 底部的“移动 / 编辑”在当前产品语义上重复，保留两个入口会增加判断成本。

新建与移动继续共用 Building Placement；移动必须保留原建筑 identity，正式 Unity 使用 Original + Draft 并提交原实体 Placement。楼身 / 屋顶等结构编辑暂不作为 Selection 能力存在，后续如重新引入，需有清晰且不同于“移动”的玩家任务再单独设计。
