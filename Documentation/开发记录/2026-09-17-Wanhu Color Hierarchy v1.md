# 2026-09-17 Wanhu Color Hierarchy v1

## 背景

Gameplay 当前已经建立 Mist Glass、Contrast / Identity、Edge / Elevation 与 Character Pass，但大量普通信息仍集中在浅纸白 / 灰两个层级：Top HUD 资源、Environment 参数组、Design Workspace 分类在整屏尺度下容易粘成同一阅读层。

本轮不改布局、不改大材质，也不继续增加 Character 装饰，目标是建立稳定的色彩角色体系。

## 本轮修改

- 新增 `src/ui/wanhu-color-hierarchy.css`，集中定义 Paper / Jade / Qing / Old Gold / Cinnabar 角色；
- Top HUD：钱粮、人口、木材、石料仅让 Icon + Label 使用低饱和分类色，核心数值继续统一 Paper White；
- Environment：天气预设图标使用天气类型色；Selected 外框与状态仍使用 Old Gold；
- Environment 参数：天气参数使用 Qing，风场使用 Jade，时间与季节使用 Warm；Slider Shell、数值和主体文字保持 Neutral / Paper；
- Design Workspace：Primary Rail 的普通分类使用很弱的低饱和类别色，Active 覆盖回 Old Gold；
- Cinnabar 只建立 Token，暂不用于普通界面，后续仅服务 Warning / Danger / Urgent；
- Main Dock、World Utility、Operation Hint 本轮不加分类色，继续保持 Neutral。

## Review

新增 `scripts/capture-color-hierarchy-review.mjs` 并加入全套 Visual Review，自动验证：

- 五个色彩角色 Token 均存在且彼此不同；
- Top HUD 四类资源拥有不同低饱和 Accent，但数值颜色保持统一；
- Weather Preset 具备可区分天气色；
- Weather / Wind / Time 三个参数组拥有不同信息色角色；
- Workspace 普通分类存在层次，Active / Filter 仍与普通类别色分离。

人工审图覆盖：

- 普通 Gameplay 白天；
- Environment 白天；
- Design Workspace 白天；
- Environment 夜晚。

人工结论：当前强度可保留。Weather 是色彩最明显的区域，但仍然以玻璃 Surface 与 Paper 文字为主体；Top HUD 的资源色只辅助扫视，不抢数值；Workspace 的类别色比 Weather 更弱，Active Gold 仍是第一状态焦点；夜景中 Qing / Jade 没有荧光感。Utility / Operation Hint 未受到本轮影响。

## 稳定规则

后续不要把这轮理解为“可以给更多 UI 上色”。稳定语义应保持：

`Paper = 阅读 / Jade & Qing = 分类与信息 / Old Gold = 当前与选中 / Cinnabar = 异常与危险`

若需要继续增加色彩，应优先寻找新的信息语义，而不是增加装饰面积。
