# 2026-09-16 Design Workspace 资产卡可读性优化

本轮继续优化 Design Workspace 的资产选择体验，目标是把“预览图 + 名称”提升为同等重要的一级识别信息，同时保留 `4 × 2 / 8 项` 的浏览密度。

## 调整

- Design Workspace 从约 `1120 × 338px` 放大到约 `1240 × 370px`；
- Primary Rail 继续保持约 `146px`，新增空间主要分配给 Content Grid；
- Item Card 调整到约 `255 × 100px`；
- Preview 从 `72 × 72px` 提升到 `84 × 84px`，继续严格保持 `1:1`；
- Item 名称从约 `11.2px` 提升到约 `14.2px / 600`，允许最多两行；
- 次级属性提升到约 `10.5px`；
- Card 默认 Surface 进一步减弱，避免 Workspace 放大后出现明显的网页卡片矩阵感；
- 阅读层级固定为 `预览图 → 名称 → 属性`。

## 不变量

- Content Grid 继续保持 `4 列 × 2 行 = 8 项 / 页`；
- 左侧 Rail 继续支持最多 6 个汉字；
- 道路 / 桥梁 / 城墙等长条对象仍使用方形 Preview Window，由具体缩略图构图适配；
- 不把 Workspace 改成图片在上、文字在下的大型商城式 Gallery；
- Design Workspace 仍是工具型 Asset Browser，世界画面继续作为视觉主体。

## Review

`capture-design-workspace-review.mjs` 增加以下自动检查：

- Workspace 约 `1240 × 370px`；
- Card 宽度至少约 `245px`、高度约 `100px`；
- Preview 约 `84 × 84px` 且严格 `1:1`；
- Item 名称约 `14.2px`；
- Item 属性约 `10.5px`；
- 继续验证 `4 × 2 / 8 项` 布局。
