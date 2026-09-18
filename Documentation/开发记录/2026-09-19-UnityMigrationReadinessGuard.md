# 2026-09-19 Unity Migration Readiness Guard

本轮在继续完善 Web Demo 前建立 UI Toolkit 迁移护栏。

## 代码清理

- Design Workspace 固定 4×2 Asset Grid 改为 2 个显式 Flex Row × 4 Card；
- Rail / Content 单页 Marker 从 CSS `:has + pseudo` 改为真实 Element；
- Operation Hints 删除祖先 `:has(.pause-layer)`，Pause 显隐继续由 Gameplay State 控制；
- 删除最后一个隐式 `transition:.16s ease`，改用 Motion Token。

## 自动审查

新增：

- `scripts/audit-unity-migration.mjs`
- `npm run audit:unity`
- `npm run check`

GitHub Build 在正式 Build 前执行 Migration Audit。

## 文档

新增：

- `Documentation/Unity UI Toolkit迁移准备清单.md`
- `Documentation/代码审查/2026-09-19-UI Toolkit迁移准备审查.md`

并更新 AGENTS / 项目概览 / 工作交接 / UI Toolkit 落地规范。

## 原则

Web Prototype 继续快速试错，但新功能必须说明 UXML / USS / C# / Asset / URP 映射。迁移护栏只阻止会绑定 Web 的高风险实现，不要求为了 Unity 提前重写整个 Demo。
