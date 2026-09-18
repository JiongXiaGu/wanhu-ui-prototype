# Unity UI Toolkit 迁移准备清单

本清单用于 Web Prototype 后续继续迭代期间控制迁移成本。目标不是把 React 提前改写成 Unity，而是确保每个新增设计都能解释成稳定的 UXML / USS / C# / Asset / URP 方案。

## 1. 迁移结论

当前整体可行性：**高**。

当前最值得保留的是：

- `GameplayUiState` 与明确 Space / Tool / Management / Pause 状态；
- 配置驱动 Workspace / Management / Context Utility；
- Shared Control / Surface / Dialog；
- Motion Presence Grammar；
- 1920×1080 设计基准；
- Mouse / Keyboard / Focus / Esc 的显式交互规则。

不直接迁移的是 React DOM 和 Web CSS 特效实现。

## 2. 每个新 UI 必须回答

1. UXML 层级是什么？
2. 哪些视觉属于共享 USS？
3. C# 谁拥有状态？
4. 数据量是否需要 ListView / Pool？
5. 图片属于 Sprite / Texture / RenderTexture / VectorImage 哪一种？
6. 是否依赖 Scene Blur / URP？
7. Motion 使用哪个 Preset？
8. Mouse / Keyboard / Gamepad Focus 怎么走？
9. 是否存在 Web-only 实现？它的 Unity 等价物是什么？

回答不清楚时，不继续扩写复杂 Web-only 代码。

## 3. Runtime CSS Guard

### 直接禁止

- `:has()`；
- 新组件自己新增 `backdrop-filter`；
- `transition:.16s ease` 这类未声明属性且脱离 Motion Token 的 shorthand；
- 大型 Surface Width / Height 动画；
- 依赖 DOM 当前形状推断业务状态。

### 可继续使用，但必须有映射

- CSS Grid：只用于原型排版，布局必须可拆成 Flex/UXML Row + Column；
- `::before / ::after`：纯装饰可保留；有结构语义时迁成真实节点；
- Gradient：迁移为 Tint / 小型纹理 / Sprite / Painter2D；
- box-shadow：迁移为层级、9-slice 或 Shadow Element；
- filter：迁移为 Tint / Overlay / Material；
- Browser API：只能属于 Web Adapter。

## 4. 已完成的迁移准备

- Dialog 不依赖 UI-over-UI Blur；
- Pause Panel 不依赖自身 Blur；
- Motion 已统一到 Opacity + Translate；
- Bottom Utility 使用固定 Host + Definition Rebind；
- Management Topic 只改变 Accent，不复制整页 Theme；
- Text / Number Dialog 已消费共享 TextInput；
- Design Workspace 内容池改成显式 Flex Rows；
- Design Workspace 单页 Marker 已改成真实 Element；
- Runtime CSS `:has()` 已退出；
- CI 增加 Migration Audit。

## 5. Icon Pipeline

Web 当前使用 `lucide-react`，React Component 最终渲染 inline SVG。

正式 Unity：

```text
Lucide / 自研 SVG Source Master
        ↓
实际使用 Icon Manifest
        ↓
导出 / 导入
        ↓
Sprite Atlas 或 VectorImage
        ↓
USS / Image Tint 表达 Default / Hover / Active / Warning / Danger
```

规则：

- Unity Runtime 不依赖 Lucide React；
- 不为不同状态保存多份不同颜色 Icon；
- 单色 Icon 优先通过 Tint；
- 是否使用 VectorImage 逐类测试，不要求全项目统一使用 SVG Runtime；
- 复杂插画与缩略图不进入 Icon Pipeline。

## 6. 第一批 Unity Vertical Slice

建议先迁：

1. Gameplay Top Shell；
2. Main Dock；
3. Design Workspace；
4. Context Utility；
5. Building Placement Context + Action Bar；
6. Shared Dialog；
7. Motion Controller；
8. Runtime Tooltip。

这一条链能同时验证：

- UXML / USS 架构；
- Input System；
- Focus；
- Motion；
- Tool State；
- Icon Asset；
- Shared Blur；
- 1080p / 1440p / 4K 缩放。

Vertical Slice 通过后再迁 Settings / Archive / Management。

## 7. 数据量策略

- 固定 4×2 Workspace Asset：固定 Slot / Pool，不需要 ListView；
- Save / Resident 等长列表：ListView / MultiColumnListView；
- Management 少量固定 Section：普通 VisualElement；
- 实时 Preview：按可见数量管理 RenderTexture。

## 8. Unity 6 官方能力基线

以 Unity 6 Runtime UI Toolkit 为基线：

- UI Toolkit 使用 retained-mode Visual Tree；
- UXML 负责结构，USS 负责样式，C# 负责行为；
- USS 支持 `opacity / translate / scale / transition`；
- Input System Package 可通过 UI Toolkit Runtime Event System 接入；
- `ListView` 支持 make/bind/unbind 与虚拟化；
- `VectorImage` 是 UI Toolkit 的矢量图资产类型；SVG Authoring / Import 通过 Vector Graphics SVG Importer。

迁移实现前仍应按项目实际 Unity 版本复核 API。

## 9. CI Gate

默认：

```text
npm run audit:unity
        ↓
npm run build
```

Audit Failure 必须先修复。

Audit Warning 属于已知可迁移债务，不要求阻塞 Web UI 设计，但不得无理由持续增长。
