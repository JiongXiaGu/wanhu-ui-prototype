# Workspace World-first Glass 视觉规范

本规范记录 Design Workspace 当前稳定的视觉母版。目标不是让 Workspace 复制 Environment 面板的具体外观，而是让两者共享同一种 Gameplay 世界优先视觉语言，并能直接映射到 Unity UI Toolkit。

## 1. 核心原则

Workspace 属于玩家正在浏览资产并准备进入 Tool 的 **Work Surface**。世界场景仍然是画面主体，Workspace 负责组织信息，不承担插画装饰。

稳定原则：

- 世界提供主要色彩与美术内容；
- Workspace 使用中性石灰灰 / 雾面玻璃，不使用纯黑不透明大板；
- Header 与 Body 属于同一材质家族，不通过不同强调色硬切；
- Header 更接近 Context Tier，允许更多世界信息透入；
- Body 属于 Work Tier，保证 Rail / Filter / Asset Grid 的稳定阅读；
- 暖金只用于 Selected / Focus / 当前页等状态；
- 玉青只保留在少量语义 Icon，不大面积铺色；
- 默认 Asset Card 不形成明显盒子，Hover / Focus 才抬升；
- Asset Inspector 必须继续高于 Workspace Surface，不能和 Workspace 混成一层；
- Web Blur 只是目标视觉验证，基础可读性不能依赖 Blur。

一句话标准：

> Workspace 应像覆盖在世界上的一块稳定工作玻璃，而不是黑色资产浏览器，也不是由许多独立卡片拼成的网页面板。

## 2. 不改变的信息架构

视觉迁移不改变 Design Workspace 的共享结构：

`Header + Primary Rail + Context Filter + Search + 4×2 Content Grid + Pager`

现有几何基线继续有效：

- 1920×1080：约 `1240 × 370px`；
- Primary Rail：约 `146px`；
- 每组最多 7 个 Rail Item；
- Content：4 列 × 2 行，每页最多 8 项；
- Asset Card：约 `255 × 100px`；
- Preview：约 `64 × 64px`，1:1；
- Asset Card 仍是 Action Button，不保留 Selected。

视觉皮肤不得通过改变这些几何和交互契约来获得“高级感”。

## 3. Surface 层级

### 3.1 Workspace Root

Workspace Root 使用大面板 `18px` 圆角语义，承担统一外轮廓、弱边缘高光、Shadow 与轻材质纹理。

Root 只定义材质家族，不意味着 Header / Body 使用相同 Alpha。

### 3.2 Header = Context Tier

Header 负责当前设计类别标题与关闭动作：

- 比 Body 更轻、更透；
- 不形成单独色条；
- 与 Body 只用弱 Rule 区分；
- 标题使用 Paper White；
- 类别 Icon 使用低饱和玉灰 / 玉青；
- Close 默认弱，Hover 才增加 Tone。

### 3.3 Body = Work Tier

Body 是稳定资产阅读区：

- 比 Header 更实；
- 使用同色相中性石灰灰；
- 不用纯黑；
- Rail / Filter / Card 只在 Body 之上增加非常弱的局部 Tone；
- 不给整个 Workspace 设置 `opacity`。

## 4. Primary Rail

Primary Rail 是一级筛选器，不应表现成一根独立深色侧栏。

规则：

- 默认背景接近透明；
- 与 Content 只保留弱分隔线；
- 默认文字为 Muted；
- Hover 使用极弱浅色 Surface；
- Active 使用暖金文字 / 左侧 `2px` 状态线与极弱暖金渐隐 Tone；
- Active 不使用整块暖金填充；
- Icon 不因 Active 大幅放大或位移。

这样 Rail 保持清晰，但不会和 Main Dock、资产内容争视觉焦点。

## 5. Context Filter 与 Search

Context Filter 采用轻量 Tab 语义：

- 默认无独立 Button Box；
- Hover 提亮文字；
- Active 使用 Paper / 暖金文字与 `2px` 下状态线；
- 不使用高饱和色块。

Search 属于 Utility Action：

- 关闭状态尽量无框；
- Hover / Editing 才显示弱 Tone 与边界；
- Search 不应成为 Workspace 顶部第二个重控件区。

## 6. Asset Card

Asset Card 是动作入口，不是小面板。

默认：

- 极弱 Surface；
- 无持续 Border；
- 预览图承担主要资产识别；
- 名称使用 Paper White；
- Meta 使用 Muted。

Hover / Focus：

- Surface 提亮一档；
- 允许轻 Shadow / 1px 级材质高光；
- 左侧出现克制暖金状态线；
- Preview 只做极轻亮度 / Scale 反馈。

Pressed：

- 短暂暖金 Tone；
- 不留下 Selected 状态；
- 不使用 `aria-pressed`。

Card 圆角当前使用约 `10px`，比 Workspace Root 低一级。

## 7. Pager

Pager 属于最低视觉层级：

- 默认使用低对比灰点 / 短线；
- Hover 提亮；
- Current Page 使用暖金；
- 不使用 Glow。

## 8. Asset Inspector 的层级关系

Asset Inspector 不跟随 Workspace 一起变浅。

它是悬浮决策摘要，应继续：

- 比 Workspace Body 更深、更实；
- 有清楚但克制的 Edge；
- 使用更明显 Shadow；
- 与 Hovered Asset 形成空间上的“浮层”关系；
- `pointer-events:none` / Unity `pickingMode=Ignore`。

Workspace 变成雾面玻璃后，Inspector 的层级差反而更重要。

## 9. 昼夜

Workspace 不建立独立 Night Theme。

白天和夜晚共享同一套材质语法；夜景只允许对同一 Surface Token 做很小的明度 / 密度补偿，保证：

- Header 仍能感知世界；
- Body 不融进黑暗背景；
- Paper / Muted / Gold 对比关系不变化；
- 不因夜晚额外增加彩色装饰。

Visual Review 必须同时保留至少一个白天 Design Workspace 场景和一个 22:00 夜景 Workspace 场景。

## 10. Unity UI Toolkit 映射

最终 Unity 建议结构保持普通 VisualElement：

```text
WorkspaceRoot (.ui-surface--work)
├ Header (.ui-surface--context)
├ Body
│  ├ PrimaryRail
│  └ Catalog
│     ├ ContextFilter
│     ├ ContentGrid
│     └ Pager
└ AssetInspector (独立悬浮层)
```

可直接由 USS 实现：

- `background-color`；
- `border-*`；
- `border-radius`；
- `color`；
- Margin / Padding / Flex / Grid 对应布局；
- Hover / Focus / Active 通过明确 Class 管理。

`glass-noise-soft.png` 只是极弱材质纹理，可以保留或在 Unity 中由共享材质替代；它不是界面内容资产。

Web `backdrop-filter` 不映射成每个 VisualElement 独立 Blur。Unity 使用共享 URP Blur Service / Fullscreen Pass，再由 Workspace Surface 声明自己的 Tint / Alpha Tier。

## 11. Web 代码位置

- `src/workspace.css`：Workspace 基础几何与共享壳；
- `src/workspace/design-workspace.css`：Design Workspace Rail / Asset Card 几何与内容布局；
- `src/workspace/workspace-world-first-glass.css`：World-first Glass 视觉母版；
- `src/workspace/DesignWorkspace.tsx`：共享行为，不因视觉换皮复制组件；
- `src/ui/asset-inspector/*`：独立 Asset Inspector。

新的视觉调整优先修改 `workspace-world-first-glass.css`，不要重新把颜色和状态复制回每个业务类别。