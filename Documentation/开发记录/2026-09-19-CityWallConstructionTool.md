# 2026-09-19 City Wall Construction Tool

本轮开始城墙四套独立 ToolOverlay 的第一套：城墙主体路径营造。

## 完成

- `Tool` 预留四种城墙业务 Tool；
- 城墙 Workspace 的 16 个模块增加 `toolType`；
- 城墙主体 Card 路由到 `city-wall-construction`；
- 新增 `CityWallConstructionOverlay`；
- 新增 `CityWallConstructionDock`；
- Draw Mode：智能折线 / 直线 / 曲线；
- Quick Action：反转城外方向；
- 左侧参数：墙高 / 地形关系 / 基底处理；
- 新增 City Wall Utility：Grid / Wall Top Line / Nodes / History；
- 新增三套城墙绘制 Operation Hints；
- 新增 World Path Preview；
- 门洞 / 登城梯 / 高差楼梯仍保持独立 ToolType，后续分别实现。

## 迁移约束

四套城墙 Tool 可以拥有完全不同的业务状态与附加窗口，但共享 Left Context / Placement Action Bar / Utility / Motion / Surface。禁止恢复旧 ToolOverlay CSS 壳。
