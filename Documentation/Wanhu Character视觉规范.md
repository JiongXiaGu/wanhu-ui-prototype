# Wanhu Character 视觉规范

本规范建立在 Wanhu Mist Glass、Contrast / Identity 与 Edge / Elevation 之上。目标不是继续改变玻璃材质，而是在稳定的现代 UI 基础上加入少量属于《万户天工》的识别语言。

## 核心原则

1. **90% 现代功能性，10% 古代营造语汇。** 特色来源于梁架、榫点、台基与构件接合关系的抽象，不直接使用云纹、回纹、牌匾、卷轴等传统装饰。
2. **结构先于装饰。** 所有特色元素必须能够解释成“信息分组、当前状态、构件接合、操作承托”，不能只是贴花。
3. **Old Gold 只落在受力点 / 当前状态 / 连接点。** 不形成大面积金边或金色纹样。
4. **不重新引入完整外框。** Character Pass 必须服从 Edge & Elevation v1，不能把 Workspace / Dock / Utility 再框起来。
5. **不改变既定几何。** Top HUD、Workspace 280px、Asset Card / Preview 64px、Main Dock 尺寸与交互保持不变。
6. **UI Toolkit 可直接重建。** Web 原型里的短梁、节点、基座都应能用普通 `VisualElement` 实现，不依赖复杂 SVG 或 Web-only 特效。

## 正式第一批角色

### Top HUD：信息节点

顶部状态栏保留信息仪表身份，但不再像通用资源表：

- 天气 / 时间区域使用一条极短 Old Gold 梁线 + 末端节点作为起始锚点；
- 资源组之间取消贯穿高度的长 Divider，改用 10–12px 的短结构接缝；
- 数字仍然是主要阅读对象，特色线条不得抢过资源数值；
- 不改变资源组宽度与 Top HUD 既定高度。

### Workspace：梁头标题 + 构件接合筛选

Workspace 的识别重点放在标题与筛选状态：

- Title 下方使用 28–36px 的短梁 + 节点；
- Context Filter Active 不使用常规长下划线，改成小型 L 形接合标记；
- Active 背景仍保持极弱，只负责状态承托；
- Card 本身不增加传统装饰，避免资产浏览区产生噪声。

### Main Dock：台基式 Active

Main Dock 的 Active 状态使用“落在基座上”的语法：

- Active Item 下方出现一段 28–36px 的短基座线；
- 中心放置一个 3–4px 的节点，表达接合 / 落位；
- 暖金 Surface 只在底部轻微聚集，不使用完整 pill；
- Active Icon / Label 仍由 Contrast System 负责主要可读性。

Mode Rail 可以使用同一家族的短连接线，但视觉权重必须低于主 Category Active。

## 动画语言

Character 动画统一为“接合 / 落位”，不是网页式上浮：

- Short Beam：从左向右展开；
- L-joint：从左下展开；
- Dock Base：从中心向两侧展开；
- Joint Node：轻微 scale-in；
- 推荐时长 120–180ms；
- `prefers-reduced-motion` 时关闭这些装饰动画。

## 禁止项

不得引入：

- 大面积传统纹样；
- 云纹 / 回纹连续边框；
- 仿木纹、仿金属浮雕；
- 大型牌匾式标题；
- 大面积金色填充；
- 所有 UI 都加 Character Marker；
- 为“古风”牺牲文字与图标可读性。

Utility / Operation Hint 默认不增加 Character 装饰，因为辅助层应保持安静。

## Unity UI Toolkit 落地

建议映射：

- Short Beam：1px `VisualElement` + 3px Joint Node；
- L-joint：两个窄 `VisualElement` 组成直角；
- Dock Base：水平 `VisualElement` + 中央 Joint Node；
- 动画：对 width / opacity / scale 做 120–180ms 过渡；
- 所有 Character 元素 `PickingMode.Ignore`；
- 不额外申请 Blur，不改变现有 Surface / Elevation 结构。

## Review 门槛

每次修改至少检查：

- 普通 Gameplay 白天 / 夜晚；
- Workspace 打开白天 / 夜晚；
- 天气锚点不干扰天气与时间读取；
- 资源短接缝不会重新形成“表格感”；
- Workspace 标题短梁清楚但不成为装饰主角；
- Filter Active 明确且不再像 Web Tab；
- Main Dock Active 能被读成“承托 / 落位”，不是普通 pill；
- Utility / Hint 继续保持无 Character 装饰；
- 所有既定几何和 Edge & Elevation 规则保持不变。
