# 2026-09-19 UI Motion System 第一轮统一

本轮把 Context Utility 已验证的“淡出 + 向锚点收起 + Rebind + 淡入”推广成正式 Motion System。

## Foundation

新增：

- `src/ui/motion.ts`；
- `src/ui/ui-motion-system.css`；
- `Documentation/UI Motion System设计规范.md`。

统一：

- Fast / Control / Surface / Space = 100 / 120 / 160 / 200ms；
- Bottom / Left / Top / Center 四类空间方向；
- `entering / steady / exiting / hidden` Presence；
- Exit / Enter 阶段禁用旧 UI 输入；
- Reduced Motion 支持。

## 已迁移

- Main Dock；
- Design Workspace；
- Top Control Tray；
- Camera / Environment Context；
- Building / Road Placement Context；
- Placement Action Bar；
- Context Utility；
- Management Open / Close；
- Management Body Rebind；
- Pause Open / Close；
- Pause Menu ↔ Save / Settings；
- Dialog Open / Close；
- Toast Duration Token。

## Tool Handoff

Workspace → Tool 时业务状态立即切换，但旧 Workspace / Dock / Tray 保留约 100ms Exit；随后 Tool Context / Action Bar 使用 Surface Enter。

退出 Tool 时反向执行。

## Unity

正式实现保持相同职责：

`Business State → UITransitionController → Presence Class → USS opacity / translate`。

不建立大型 Timeline 动画系统。
