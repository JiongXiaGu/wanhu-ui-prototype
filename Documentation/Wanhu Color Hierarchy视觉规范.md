# Wanhu Color Hierarchy 视觉规范

本规范建立在 Mist Glass、Contrast / Identity、Edge / Elevation 与 Character Pass 之上。目标不是把界面做得更彩，而是解决大量浅纸白 / 灰信息处于同一视觉层级的问题。

## 核心原则

1. **Neutral 仍是主体。** 墨青 / 玉青玻璃、浅纸文字与灰绿辅助信息继续占大多数画面。
2. **颜色表达角色，不表达装饰。** 同一种色彩角色必须长期保持稳定语义。
3. **Paper 负责阅读。** 核心数值、正文和高优先级文字保持浅纸色，不把可读性让给彩色。
4. **Jade / Qing 负责分类与信息。** 青玉、青蓝用于普通功能重点、环境、数据、材质和类别识别。
5. **Old Gold 只负责 Current / Selected / Focus / Primary。** 不因为界面单调就把普通分类也刷成金色。
6. **Cinnabar 只负责 Warning / Danger / Urgent。** 本轮建立 Token，但不作为普通点缀使用。
7. **颜色不能成为唯一状态提示。** Selected / Warning 等状态仍需同时依赖明度、背景、节点、形状或图标。
8. **昼夜共用同一语义。** 夜景允许微调明度，但不改变 Jade / Qing / Gold / Cinnabar 的角色定义。

## 正式色彩角色

- Paper：`#E8E2D7`，主阅读层。
- Jade：`#86A393`，正常状态、生产、生态、普通功能分类。
- Qing：`#7895A6`，信息、观察、水、天气、数据。
- Old Gold：`#C9A55F`，当前、选中、焦点、Primary。
- Cinnabar：`#B56D5D`，警告、危险、异常、不可逆操作。

可按内容补充低饱和 Material Accent，例如 Earth / Timber / Stone / Water，但它们不能覆盖上述状态语义。

## Top HUD

资源条的主要阅读对象仍是数值：

- 钱粮 / 人口 / 木材 / 石料的 **Icon + Label** 可以使用低饱和分类色；
- 数值统一保持 Paper White；
- 资源色只帮助扫视定位，不建立“选中”语义；
- 时间控制的 Active 仍只使用 Old Gold。

## Environment / Weather

天气是最适合承担信息色彩的区域：

- 晴 / 云 / 雨 / 雪 / 雾的图标允许使用不同低饱和天气色；
- Weather Preset 的 **Selected 外框 / Surface 仍使用 Old Gold**；
- 天气参数使用 Qing；
- 风场使用 Jade；
- 时间与季节使用 Warm / Old-Gold-adjacent，但不能与 Selected 强度相同；
- Slider Shell、文字和数值保持 Neutral / Paper，只有已填充 Track 与少量标题承担组色。

## Design Workspace

Primary Rail 的普通分类允许使用低饱和类别色：

- Icon 是主要色彩载体；
- Label 可以跟随更弱的同色调；
- Hover 提亮但不切换成 Gold；
- Active 必须覆盖普通类别色并回到 Old Gold；
- Context Filter 仍属于 Selector，不额外建立彩色分类系统。

Asset Card 本轮不增加新颜色，避免目录主体噪声过高。

## Cinnabar 使用边界

朱砂色当前只预留给未来：

- 城市异常；
- 火灾 / 损坏；
- 财政严重异常；
- 删除 / 不可逆确认；
- 军事或治安紧急状态。

不得用于普通标题、装饰线、常规 Hover 或普通分类图标。

## Unity UI Toolkit 落地

建议把角色色定义为统一 USS Custom Property / Theme Token：

- `--wanhu-color-paper`
- `--wanhu-color-jade`
- `--wanhu-color-qing`
- `--wanhu-color-old-gold`
- `--wanhu-color-cinnabar`

普通材质分类色可以作为组件级 Token，但状态层必须覆盖材质层，例如：

`Selected > Warning > Category Accent > Neutral`

不要依赖 Web-only Blend / Filter 才能形成核心状态差异。

## Review 门槛

每轮颜色修改至少检查：

- 普通 Gameplay：资源数值仍是最高阅读层；
- Weather：天气类型可快速区分，但面板没有变成彩色控制台；
- Workspace：普通分类出现层次，Active 仍明确是 Old Gold；
- 夜景：Jade / Qing 不发荧光，Gold 不抢世界画面；
- Utility / Operation Hint 继续保持 Neutral；
- Cinnabar 未被拿来做普通装饰；
- 任何重要状态都不能只靠颜色识别。
