# 2026-09-18 Global Space Visual System Consolidation

将 Settings / Load / Save 从“共享部分 Token、各页面继续叠加私有皮肤”收束为真正的 `.wanhu-global-space`。

## 修改

- 三个 Root 增加统一语义 Class；
- Settings 删除私有 Backdrop Layer，由 Global Root 直接拥有 Blur + Material；
- Settings 内部 `settings-command-surface` 退回纯 Geometry；
- Load / Save 删除独立 Root Material Recipe；
- Header / Footer / Title Typography 由 Global Space System 统一；
- Footer 的旧绿黑 `ui-footer-surface-*` Token 中性化；
- Save Current Game 的绿灰 Meta / Rule 改为 Paper / Global Rule；
- Archive 可见旧绿灰值继续折回 Global / Control Token；
- 新增 computed-style 自动比较，确保同昼夜 Settings / Load / Save 材质完全一致。
