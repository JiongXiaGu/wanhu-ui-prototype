# 2026-09-19 City Wall Workspace

本轮只重做城墙目录，不进入城墙营造 Tool。

## 完成

- 城墙 Workspace 从“构件/地形分类”重构为 `Wall System → Module Category → Module`；
- 左侧 Primary Rail：所有 / 小倾斜角 / 高倾斜角 / 临水 / 山地；
- 顶部 Filter：全部 / 城墙 / 门洞 / 登城梯 / 高差楼梯；
- 水门不再独立成一级分类，归入门洞具体模块；
- 四套体系各提供四类示例构件，共 16 个模块；
- Shared Asset Inspector 对城墙改用“所属体系 / 构件类型 / 营造方式”；
- Card 仍然是 Action Button，但本轮不进入四套 Tool；
- UI Review 增加体系切换、类别筛选与临水水门归类验证。

## 旧 Unity 方案保留的领域信息

旧 `CityWallSelectionContracts` 中的 System / Module / ConstructionMode 结构继续作为领域参考；旧独立 Workspace Shell 与视觉实现不迁回 Web Prototype。

旧 Tool 参数确认：

- 城墙：城外正面 / 墙高 / 整体找平 / 随地形；
- 门洞：城门纵深 / 门洞净宽 / 门洞净高；
- 登城梯：楼梯宽度 / 楼梯高度 / 目标坡度；
- 高差楼梯：楼梯宽度 / 楼梯高差 / 目标坡度。
