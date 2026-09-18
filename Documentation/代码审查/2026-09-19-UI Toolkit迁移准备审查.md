# 2026-09-19 UI Toolkit 迁移准备审查

## 结论

当前 Web Prototype 不需要推翻。迁移风险已经从“设计不适合 UI Toolkit”转变为“部分 Web 表达需要替换实现”。

当前判断：

- 状态 / 信息架构：高可迁移；
- Motion Grammar：高可迁移；
- Shared Control / Surface：高可迁移；
- 固定容量 Workspace：高可迁移；
- Archive / 长列表：需要 ListView 化；
- Grid / pseudo-element / gradient / filter：属于实现迁移债务；
- Blur：必须继续集中到共享 Scene Blur；
- Icon：需要建立 Source → Unity Asset Pipeline。

## 本轮代码审查发现

### P0：已处理

1. Runtime CSS 存在 `:has()`：
   - Design Workspace 单页 Marker；
   - Operation Hints Pause 判断。
   已全部移除。

2. Design Workspace 资产池仍依赖 4×2 CSS Grid：
   已改成显式 `workspace-content-row`，每页两个 Row、每行四个 Card。

3. Pager Marker 使用 `:has + ::before/::after` 生成：
   已改成真实 React Element，对应未来 UXML VisualElement。

4. 存在隐式 `transition:.16s ease`：
   已改为明确属性 + Motion Token。

### P1：继续追踪

- 旧 CSS 中仍有多处 Grid；
- 多处纯视觉 pseudo-element；
- 少量组件层 backdrop-filter 尚未收束到最终 Unity Scene Blur 服务；
- Image filter / Gradient / box-shadow 仍是 Web 表达；
- Browser API 仍存在于 Web Adapter / Prototype Interaction；
- Lucide React Icon 尚未导出 Unity Asset。

这些不阻塞继续做 Web UI，但不得继续无约束扩散。

## 迁移原则更新

不再要求“Web CSS 必须长得像 USS”。

正确目标：

> Web 允许高效表达，但 Structure / State / Motion / Asset Ownership 必须可以直接解释为 Unity 实现。

因此：

- 简单 Grid 可以暂存，但要有 Flex/UXML 映射；
- Gradient 可以暂存，但要明确 Sprite/Tint/Painter2D 方案；
- React State 可以暂存，但不能依赖 DOM 反推业务；
- Web Browser API 只能做 Adapter；
- 核心交互必须来自显式 State。

## CI

新增 `scripts/audit-unity-migration.mjs`。

硬失败：

- Runtime CSS `:has()`；
- 未命名属性的 Transition shorthand；
- 新增未批准的 `backdrop-filter` Owner。

报告但不失败：

- CSS Grid；
- pseudo-element；
- filter；
- Browser API；
- 当前 Lucide Icon Manifest。

这套 Audit 的目标是建立“迁移债务只能下降或经过明确决策增长”的工作方式。
