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


## 逻辑修正：范围 / 定宽延伸

第一版使用“智能折线 / 直线 / 曲线”，复核旧城墙方案后确认这仍然过于道路化，已整体撤回。

修正后：

- Range：拖矩形，一次生成四边墙，外部自动 Front；
- Fixed Width：指定墙厚连续延伸，可形成 L / U / 闭合轮廓；
- 新增 Wall Thickness；
- Fixed Width 开放 Path 支持 Front / Back 交换；
- North / East / South / West 正面语义正式退出；
- World Preview 从单线 Path 改成有厚度矩形 / L Shape；
- UI Review 明确禁止旧三种道路式模式回归。
