# Building Placement New / Move 收敛

本轮将上一阶段临时的 `place / move / edit` 三态拆成两个正式职责。

- Building Placement：`BuildingPlacementIntent = new | move`。New 与 Move 共用地形、位置、吸附、旋转、Utility 和未来 Placement Validation。
- Building Edit：独立 `tool = building-edit`，只处理楼身、屋顶与未来立面。
- Move 从 Selection 进入，ToolOrigin 保留 selection；退出恢复同一 Building entityId。
- New 仍从 Design Workspace 进入并返回 Workspace。
- Web 只验证 Session / UI 结构；Unity 正式 Move 应保存 Original + Draft，确认后更新原实体位置，取消只丢弃 Draft，不销毁重建建筑。

建筑参数的通用字段抽到 `building-common/BuildingParameterSections.tsx`，Placement 和 Edit 共享控件 Primitive，但业务 Controller 分离。
