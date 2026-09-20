# Workspace World-first Glass 视觉规范

Design Workspace 是当前 Gameplay **Work Surface 的视觉锚点**。它的职责不是定义一套独立 Workspace 皮肤，而是提供“烟墨熟铜”材质在持续浏览 / 工作场景中的稳定样板。

基础 Palette、Surface Family、昼夜与材质规则以 `Documentation/Wanhu 烟墨熟铜视觉材质规范.md` 为准。

## 1. 核心身份

Workspace 应像覆盖在世界上的一块稳定烟墨工作玻璃：

- 中性略暖 Smoked Graphite；
- 世界仍可感知，但正文区域不被世界色彩污染；
- Header 比 Body 轻，Body 保证稳定阅读；
- 暖金只用于 Active / Current / Focus；
- 默认 Asset / Rail 不形成卡片海；
- Inspector 明显高于 Workspace，但仍属于同一 Hue 家族。

Workspace 不是：

- 纯黑桌面应用窗口；
- 绿色 / 蓝色玻璃；
- 多层 Card Dashboard；
- 依靠大量边框与 Glow 建立“高级感”的界面。

## 2. 信息架构与几何

共享结构保持：

`Header + Primary Rail + Context Filter + Search + 4×2 Content Grid + Pager`

1920×1080 参考：

- Workspace：约 `1240 × 370px`；
- Primary Rail：约 `146px`；
- 每页最多 8 项；
- Preview：约 `64 × 64px`；
- Asset Card：Action Button，不保留 Selected。

视觉皮肤不得通过改变这些已稳定的几何 / 行为契约来获得设计感。

## 3. Surface

### Root

- `18px` 大 Surface；
- Smoked Graphite；
- 弱 Edge + Shadow + 极弱 Noise；
- Root 只建立统一材质外轮廓。

### Header

- 接近 Context Tier；
- 与 Body 同 Hue；
- 比 Body 轻微更亮 / 更透；
- 不形成独立色条；
- Bare Icon + Title；
- 与 Body 只用弱 Rule 分隔。

### Body

- Work Tier；
- 比 Header 更稳；
- 保证 Rail / Filter / Asset Grid 阅读；
- 不使用纯黑；
- 世界背景不能把 Body 染成明显绿色。

## 4. Primary Rail

- 默认背景接近透明；
- 与 Content 只保留弱 Rule；
- 默认前景 Muted；
- Hover 使用极弱 Smoke Tone；
- Active 使用熟铜文字 / Icon + 左侧短状态线 + 极弱暖金 Tone；
- Rail Page Indicator 只使用中性灰点，不能与 Active 的熟铜线共享强调色；
- 不整块填金；
- Icon 不因 Active 大幅移动 / 放大。

## 5. Context Filter / Search

Context Filter：

- 默认无 Button Box；
- Hover 提亮；
- Active 使用极弱暖金 Tone + 短状态线；
- 不使用长网页 Tab 下划线。

Search：

- 默认轻量；
- Hover / Editing 才显示更明确边界；
- 不成为第二个重工具条。

## 6. Asset Card

Asset Card 是动作入口，不是小面板。

Default：

- 极弱 Surface；
- 不持续画 Border；
- Preview 承担主要识别；
- Name = Paper；
- Meta = Muted。

Hover / Focus：

- Surface 提亮一档；
- 允许极轻 Shadow；
- 左侧出现克制熟铜状态线；
- Preview 只做轻微亮度 / Scale 反馈。

Pressed：

- 短暂暖金 Tone；
- 不留下 Selected；
- 不使用 Toggle 语义。

## 7. Pager

Content Pager 与 Rail Pager 不使用完全相同的 Active 语义：

- Content Pager：当前内容页可以继续使用熟铜，因为它不与同一区域的 Selection Line竞争；
- Rail Pager：默认暗灰小点，当前页使用中性亮灰圆点，Hover 只进一步提亮；
- Primary Rail 的熟铜短竖线只表示 Category Selected；
- 单页 Rail Marker 同样使用低对比灰色小圆点，不再显示类似 Selected 的竖线；
- Pager 不 Glow，不通过位移规避 Selected；依靠形状与 Tone 区分状态。

## 8. Inspector 关系

Asset Inspector：

- 比 Workspace Body 更实；
- 有更清楚的 Edge / Shadow；
- 使用 Local Occlusion 抑制底层 UI；
- 不申请第二次 UI Blur；
- 不换成独立黑 / 蓝 / 绿皮肤。

## 9. 昼夜

同一 Palette、同一 Hue。

夜晚只允许小幅修正 Surface Density / Edge，保证：

- Header 仍有世界感；
- Body 不融入夜景；
- Paper / Muted / Brass 对比关系稳定。

Visual Review 至少覆盖白天和 22:00 夜景 Workspace。

## 10. Web / Unity 所有权

Web：

- `src/workspace.css`：共享几何；
- `src/workspace/design-workspace.css`：业务布局；
- Workspace Surface 视觉最终应消费共享 Theme / Surface System，而不是继续复制独立色值。

Unity：

```text
WorkspaceRoot (.ui-surface--work)
├ Header (.ui-surface--context)
├ Body
│  ├ PrimaryRail
│  └ Catalog
└ AssetInspector (.ui-surface--elevated)
```

共享 URP Scene Blur 提供世界低频背景；USS 负责 Surface Tint、Edge、Noise、Typography 与状态。
