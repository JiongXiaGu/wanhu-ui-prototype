# Wanhu UI Contrast 与 Identity 视觉规范

本规范建立在 Wanhu Mist Glass 与 Wanhu HUD Glass 之上，解决“统一后过灰、文字图标过弱、所有 Surface 过于相似”的问题。目标不是增加更多主题色，而是在同一材质家族内建立清楚的角色身份。

## 核心原则

1. **统一不等于相同。** Environment、Workspace、HUD、Dock、Utility、Inspector 使用同一家族，但不使用完全相同的色温、实度与 Active 语法。
2. **Foreground 优先于 Glass。** 文字和图标必须先满足读取，再决定 Surface 透明度。
3. **角色差异依靠轻微色温与状态语法。** 不建立明显蓝/绿/红皮肤，不让世界场景失去主视觉地位。
4. **Old Gold 只承担状态和关键操作。** 默认内容仍以 Paper White / Neutral Gray 为主。
5. **不靠额外 Blur 制造层级。** Unity UI Toolkit 最终实现仍使用共享 Scene Blur；UI-over-UI 不假设可再次模糊。

## 角色身份

### Persistent HUD

顶部资源与时间状态属于信息层，采用略冷的矿物灰：

- 主数值使用 Paper White；
- 次级标签与图标比旧版提高一个对比等级；
- 天气、当前时间控制等关键状态允许 Old Gold；
- 第二排导航比第一排更轻，但不可灰到与背景融为一体。

### Workspace

Workspace 属于浏览 / Work 层，采用略暖的石灰灰：

- Header 比 Body 稍轻；
- Body 稍实，保证卡片和筛选稳定读取；
- Filter Active 使用“微弱暖金 Surface + 短金线”，不只靠一条线；
- Card 默认仍保持轻量，Hover / Focus 才出现暖色响应；
- Pager 默认标记必须清楚可见。

### Main Dock

Main Dock 属于高频操作基座，保持中性、比 Persistent HUD 更稳：

- 默认图标与文字比 Utility 更亮；
- Active 使用完整的低强度暖金 Surface + 状态线；
- 不靠大面积金色填充；
- 不使用顶部 HUD 的轻薄表现。

### Utility / Hint

Utility、Operation Hint、System Menu 属于辅助层：

- Surface 最轻；
- 默认前景仍须可读；
- Operation Hint 小字不得因为 Surface 透明而低于读取阈值；
- 仅 Primary binding 使用更亮 Old Gold。

### Elevated Inspector

Inspector 延续 Elevated Glass：

- 不依赖 UI-over-UI Blur；
- 通过更实 Surface、Local Occlusion、Edge 与 Shadow 建立高度；
- 不继承 Workspace 的暖色背景，只保持同一 Neutral Family。

## 颜色温度

允许的角色色温差是轻微的：

- Top HUD：`B > R`，形成轻微冷矿物感；
- Workspace：`R > B`，形成轻微暖石灰感；
- Main Dock：`R ≈ B`，保持中性基座；
- Utility：保持中性偏冷，但强度最低。

这种差异不应被玩家读成“不同主题色”，只用于让不同职责的 Surface 在整体画面中形成身份。

## 前景对比

正式基线：

- Primary / numeric：接近 `#F4F0E8`；
- Secondary：约 `#C7C3BB`；
- Muted：约 `#A9AAA5`；
- Faint 只用于真正低优先级内容，不用于常驻 HUD 主标签；
- 默认图标不与 Faint Text 共用最低亮度；
- Hover / Focus 至少提高一个明显对比等级。

## Review 门槛

重要修改必须检查：

- 白天 HUD + Workspace；
- 夜晚 HUD + Workspace；
- Top HUD 数值、标签、Secondary Navigation 图标可读；
- Main Dock 默认动作与 Active 状态可区分；
- Workspace Title / Filter / Card Meta / Pager 可读；
- Operation Hint 小字可读；
- Top HUD、Workspace、Dock 的色温关系仍然成立；
- 不修改既定几何与交互规则。
