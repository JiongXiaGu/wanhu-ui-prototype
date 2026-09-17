# Wanhu Character 视觉规范

本规范建立在 Wanhu Mist Glass、Contrast / Identity 与 Edge / Elevation 之上。目标不是继续改变玻璃材质，而是在稳定的现代 UI 基础上加入少量属于《万户天工》的识别语言。

## 核心原则

1. **90% 现代功能性，10% 古代营造语汇。** 特色来源于梁架、榫点、台基与构件接合关系的抽象，不直接使用云纹、回纹、牌匾、卷轴等传统装饰。
2. **结构先于装饰。** Character 元素必须参与信息分组、边缘承托、当前状态或连接关系，不能只是贴在文字旁边的装饰符号。
3. **Character 优先嵌入 Panel / Header 的边缘，不围绕文字画符号。** 标题与标签应保持干净，避免短梁退化成标题下划线或 Web Tab Indicator。
4. **80% 中性结构线，20% Old Gold 节点。** 梁本身以浅纸灰 / 中性结构线表达，Old Gold 主要落在受力点、当前状态与连接节点，不形成大面积金边。
5. **不重新引入完整外框。** Character Pass 必须服从 Edge & Elevation，不能把 Workspace / Dock / Utility 再框起来。
6. **不改变既定几何。** Top HUD、Workspace 280px、Asset Card / Preview 64px、Main Dock 尺寸与交互保持不变。
7. **UI Toolkit 可直接重建。** Web 原型中的短梁、节点、基座都应能用普通 `VisualElement` 实现，不依赖复杂 SVG 或 Web-only 特效。

## Character 角色

当前只保留四种结构角色：

- **Anchor**：信息区域 / Surface 的起点；
- **Beam**：当前工作空间的结构承托；
- **Joint Node**：当前构件 / 当前状态的连接节点；
- **Base**：Main Dock Active 的台基承托。

不要为单个页面临时发明新的 Character 符号。

## Top HUD：Edge Anchor

顶部状态栏保留信息仪表身份，但 Character 不再直接画在“晴”或其它文字下面。

正式规则：

- Weather / Time 仍作为 Top HUD 的信息起点；
- Character Anchor 改为嵌入 `gameplay-top-status` 左上边缘的一段 **8–16px 中性短梁 + 2–3px Old Gold Joint Node**；
- 天气图标 / 文字可以保留轻暖色，但不承担 Character 线条；
- 资源组之间继续使用 10–12px 的短结构接缝，不恢复贯穿高度 Divider；
- 数字仍是最主要阅读对象；
- 不改变 Top HUD 高度、资源槽宽度或几何中心。

目标是让玩家感到“HUD 从这里起架”，而不是“晴被选中了”。

## Workspace：Header Edge Beam

Workspace 的 Character 重点来自 Header / Surface 的结构边缘，而不是标题文字本身。

正式规则：

- `workspace-title` 只保留 Icon + Title，不再放短梁、L 角或标题下划线；
- 在 `workspace-header` 顶边、标题起点附近嵌入一段 **24–36px 中性短梁 + 2–3px Old Gold Joint Node**；
- Beam 与 Header 外缘形成同一结构关系，不贯穿整条 Header；
- Character Beam 必须弱于标题文字，只承担“当前工作空间已落位”的识别；
- Asset Card 不增加 Character 装饰。

## Workspace Filter：Single Joint Node

Context Filter 不再使用长下划线，也不再使用 L-joint。

Active 只由三层共同表达：

- 字体提亮；
- 极弱暖金 Surface；
- 一个 3–4px 的 Joint Node。

Joint Node 优先位于文字左侧 / 控件结构起点，不在文字下方形成第二条 Tab Indicator。

Filter 是二级选择，它的视觉权重必须低于 Workspace Header Beam 和 Main Dock Base。

## Main Dock：Platform Base

Main Dock 的 Active 状态继续使用已经复核通过的“落在基座上”语法，本轮不改：

- Active Item 下方一段约 28–36px 的短基座线；
- 中心 3–4px Joint Node；
- 暖金 Surface 只在底部轻微聚集；
- 不使用完整 pill；
- Active Icon / Label 由 Contrast System 负责主要可读性。

Mode Rail 可使用同一家族的短连接线，但视觉权重必须低于主 Category Active。

## 动画语言

Character 动画统一为“接合 / 落位”，不是网页式上浮：

- Edge Beam：沿边缘展开；
- Filter Joint Node：轻微 scale-in；
- Dock Base：从中心向两侧展开；
- Workspace 打开时只使用 `opacity + Y 4–6px` 的轻微落位，不 Scale 整个 Surface；
- Workspace 内部 Character Marker 可以比 Surface 晚约 40ms 出现，形成“面板到位 → 构件接合”的顺序；
- 推荐时长 120–180ms；
- `prefers-reduced-motion` 时关闭这些装饰动画。

## 禁止项

不得引入：

- 大面积传统纹样；
- 云纹 / 回纹连续边框；
- 仿木纹、仿金属浮雕；
- 大型牌匾式标题；
- 大面积金色填充；
- 标题下的装饰性金色短线；
- Filter 的常规长下划线或 L-joint；
- 所有 UI 都加 Character Marker；
- 为“古风”牺牲文字与图标可读性。

Utility / Operation Hint 默认不增加 Character 装饰，因为辅助层应保持安静。

## Unity UI Toolkit 落地

建议映射：

- Edge Anchor / Beam：贴在 Surface / Header 边缘的 1px `VisualElement` + 3px Joint Node；
- Filter Joint Node：独立 3–4px `VisualElement`，不依赖 Border 绘制复杂符号；
- Dock Base：水平 `VisualElement` + 中央 Joint Node；
- Workspace 落位：只对根容器做 opacity / translateY，保留原有屏幕锚定与几何；
- Character Element 全部 `PickingMode.Ignore`；
- 不额外申请 Blur，不改变现有 Surface / Elevation 结构。

## Review 门槛

每次修改至少检查：

- 普通 Gameplay 白天 / 夜晚；
- Workspace 打开白天 / 夜晚；
- 天气文字下方不存在 Character 下划线；
- Top HUD Anchor 与外壳边缘是一体的，不抢天气 / 时间读取；
- 资源短接缝不会重新形成“表格感”；
- Workspace 标题文字保持干净，Beam 明确属于 Header Edge；
- Filter Active 只有小节点，不重新变成 Tab Underline / L-joint；
- Main Dock Active 保持已经复核的台基承托；
- Workspace 打开动效不 Scale、不改变既定中心锚点；
- Utility / Hint 继续保持无 Character 装饰；
- 所有既定几何和 Edge & Elevation 规则保持不变。
