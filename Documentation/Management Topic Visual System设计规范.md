# Management Topic Visual System 设计规范

## 1. 目标

Management 的多个专题页面共享同一个 Blocking Workspace，不再全部使用无差别黑色 Header，也不允许每个页面重新发明整套 Theme。

正式方向：

> **统一 Smoked Graphite Body + 轻量 Topic Header Accent。**

## 2. 共享底盘

所有 Management 页面必须共享：

- 中性 Smoked Graphite Root / Body；
- Paper Primary / Secondary / Muted；
- 同一 Edge / Rule / Shadow；
- 同一 KPI / Section / Row 层级；
- 同一 Hover / Focus / Selected 行为；
- 同一昼夜 Palette。

Topic 不允许改变基础 Surface Hue。

## 3. Topic 分类

| Topic | 页面 | Header Accent |
| --- | --- | --- |
| overview | 城市概况 | Warm Stone / 暖石色 |
| civic | 户籍民生 | Muted Clay / 柔和陶土 |
| economy | 财政税赋、商贸物流 | Aged Brass / 熟铜经济色 |
| resource | 库存仓储 | Muted Olive / 灰橄榄 |
| governance | 政令政策、城市治理 | Muted Slate / 灰蓝石板 |
| defense | 军务 | Muted Cinnabar / 弱朱砂 |

颜色都必须低饱和，不使用纯黄、纯绿、纯蓝或纯红。

## 4. Header

Header 负责专题识别：

- 使用 Topic Tint 的极弱横向渐变；
- 顶部约 2px Topic Accent Line；
- Bare Icon 使用 Topic Accent；
- 标题仍然使用 Paper Primary；
- Close 保持中性；
- 不使用 Icon Chip、彩色实心块、粗边框。

## 5. Body

Body 必须保持中性。

Topic Accent 可以用于：

- KPI Delta；
- 当前专题的主要图表；
- 非交互数据强调；
- 轻量状态值。

Topic Accent 不用于：

- 普通正文；
- 大面积 Card；
- Button 默认态；
- Toggle / Focus / Selected 的通用状态。

## 6. 图表

图表主色从 Topic Accent 派生：

- 城市总览柱图跟随 overview；
- 财政收入跟随 economy，支出改为中性 Graphite / Paper Gray，不再使用旧青绿色；
- 库存容量 / 路线数据跟随 resource；
- 治理 / 军务等 Overview 图表跟随各自 Topic。

同一图表的对比序列优先使用 Neutral Paper Gray，而不是继续增加第二、第三分类色。

## 7. 代码所有权

```text
management-registry.ts
  └ 页面 → Topic 映射
        ↓
wanhu-theme-tokens.css
  └ Topic Accent / Tint / Management Surface Token
        ↓
wanhu-surface-system.css
  └ Management Root Material
        ↓
management-panel-skin.css
  └ Header / KPI / Chart Topic Consumption
        ↓
ManagementSpace.tsx
  └ data-management-topic / Topic Class
```

页面组件不得自己写专题色。

## 8. Unity UI Toolkit

建议正式实现：

- Management Root 挂统一 `management-space`；
- 按专题附加 `management-topic--economy` 等 Class；
- USS 通过 Class 切换少量 Accent Variable；
- Body Surface USS 不切换；
- 图表 Painter / Mesh 从相同 Topic Accent 配置读取颜色。

## 9. 验收

- Build 必须通过；
- 每个 Management Section 必须有明确 Topic 映射；
- Root / Body 不能因为 Topic 改变基础 Graphite Hue；
- Header 需要能区分 Topic，但不能成为高饱和彩色大条；
- Finance 的旧青绿支出色退出正式 Palette；
- Inventory 数据 Accent 跟随 Resource Topic；
- Focus / Selected 等交互状态不能被 Topic 色覆盖。
