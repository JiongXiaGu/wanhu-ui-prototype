# 2026-09-16 Asset Inspector 框架

## 背景

Design Workspace 已经统一为道路、桥梁、建筑、台基、城墙、围墙、装饰、树木八类内容共享的资产浏览框架。此前 Item Card 使用较大的 `84 × 84px` 预览，并保留过一段类似 Selected / Toggle 的视觉语义；同时详细尺寸、价格、说明等信息没有统一的 Hover / Focus 详情层。

本轮目标是把 Item Card 明确为“选择资产并进入 Tool”的 Action Button，并建立一个以后可被 Design Workspace、Blueprint、单位、物品等复用的只读 Asset Inspector。

## 决策

### Asset Card

- Item Card 是 Action Button，不是 Toggle / Exclusive Selector；
- 不使用 `aria-pressed`，点击后不保留持续 Selected；
- 状态只保留 `Default / Hover / Focus / Pressed / Disabled`；
- 预览从约 `84 × 84px` 收到约 `64 × 64px`，继续保持 `1:1`；
- 名称仍保持约 `14.2px / 600`，最多两行；
- 属性约 `10.5px`；
- Workspace 继续使用 `4 × 2 = 8` 项 / 页。

这样让名称获得更稳定的横向空间，也避免图片在 Asset Card 内占据过高视觉权重。

### Asset Inspector

新增跨系统共享的 `AssetInspectorPopover` 与 `useAssetInspector<T>`。

Inspector 外层不拥有建筑 / 道路 / 城墙等业务字段，只负责：

- Anchor 定位；
- Safe Edge；
- Intrinsic Size 约束；
- Hover / Focus 生命周期；
- Surface / Shadow / Radius；
- 内容切换时的稳定显示。

实际内容由 Consumer 通过 Children 组合。当前 Design Workspace 提供：标题、分类 / 规格、尺寸、原型造价、简短说明；以后允许加入图片、Tag、Warning 等内容块，不需要修改 Inspector 外壳。

尺寸约束：

- `min-width: 240px`；
- `max-width: 380px`；
- `min-height: 90px`；
- `max-height: 320px`；
- Anchor Gap：`12px`；
- Gameplay Safe Edge：`16px`。

实际宽高由 Children 自然布局决定。Hover Inspector 不加入需要鼠标交互的 ScrollView；如果内容超过上限，应优先做信息摘要 / 截断，把完整信息留给正式详情或 Tool。

### 生命周期

- 第一次 Pointer Hover 延迟约 `280ms`；
- Inspector 已经出现时，从一个 Asset 移到另一个 Asset 立即替换内容，不重复首个延迟；
- Pointer 离开 Asset 后约 `90ms` 关闭；
- Keyboard / Gamepad Focus 立即显示；
- Inspector 本身 `pointer-events: none`；Unity 对应 `pickingMode = Ignore`；
- 点击资产进入 Tool 前清理 Inspector。

### 定位

定位根据 Anchor 与 Inspector **实际尺寸**计算，而不是假设固定 `300 × 180`：

`右侧 → 左侧 → 下方 → 上方`

选择溢出最少的位置，再 Clamp 到 `16px` Safe Edge。Web Prototype 同时处理 Gameplay 逻辑画布缩放；Unity UI Toolkit 应使用 `worldBound / resolvedStyle` 取得对应几何。

## 代码

- `src/ui/asset-inspector/AssetInspector.tsx`
- `src/ui/asset-inspector/asset-inspector.css`
- `src/workspace/DesignWorkspace.tsx`
- `src/workspace/design-workspace.css`
- `scripts/capture-design-workspace-review.mjs`

正式设计约束同步记录在 `Documentation/Design Workspace设计规范.md`。

## 复核

Visual Review 新增：

- Asset Card 必须是真实 `button`；
- Asset Card 不得包含 `aria-pressed`；
- Preview 约 `64 × 64px` 且保持 `1:1`；
- 名称 / 属性字号保持主次层级；
- Pointer Hover 延迟显示 Inspector；
- Inspector 打开后切换相邻 Asset 立即更新；
- Keyboard Focus 立即显示 Inspector；
- Inspector 使用 Intrinsic Size，但保持 `240–380px` 宽与 `90–320px` 高约束；
- Inspector 不参与 Pointer Picking，并保持 Gameplay `16px` Safe Edge；
- 普通 Gameplay、其它 Design Workspace 与 Building Placement 做回归检查。
