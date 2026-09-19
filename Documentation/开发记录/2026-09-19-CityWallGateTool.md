# 2026-09-19 City Wall Gate Tool

本轮实现城墙四套独立 ToolOverlay 的第二套：`city-wall-gate`。

## 完成

- 门洞 Card 正式路由到 `city-wall-gate`；
- 新增 Free / Wall Connected 两种 Placement Mode；
- 三个核心参数：Opening Width / Opening Height / Building Depth；
- Free 支持左转 / 右转 / Facing Flip；
- Wall Connected 自动接管方向，隐藏自由旋转；
- Wall Connected 保留 Facing Flip；
- Free Utility：Grid Snap / Grid Visible / Clearance / History；
- Connected Utility：Grid Visible / Wall Connection Anchors / Clearance / History；
- Free Preview 表达独立城门 Building Volume；
- Connected Preview 表达 Thick Wall + Gate Volume + 两侧连接 Anchor；
- Gate Building Depth 保持玩家设置，不被 Wall Thickness 覆盖；
- Operation Hints 对两种模式独立 Rebind；
- GitHub Actions UI Review 增加 Free / Connected / Facing Flip / Return Workspace 流程。

## 稳定结论

城门是独立世界构件，不以“已有城墙 Boolean 挖洞”为存在前提。Wall Connection 是可选关系。
