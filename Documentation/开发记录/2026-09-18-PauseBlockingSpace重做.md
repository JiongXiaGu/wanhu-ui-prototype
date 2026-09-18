# 2026-09-18 Pause Blocking Space 重做

本轮把历史 Pause Strip 重构为正式 Smoked Graphite Blocking Space，并按当前 UI 系统职责重新划分代码所有权。

## 结构

- 中央 Pause Command Surface：`432px` / `18px`；
- Header：`暂停` + 城市/年份 Meta，两行左对齐；
- 命令层级：继续 / 保存 / 设置 + Divider + 返回主菜单；
- 删除底部 Esc 提示与四条命令的说明性 title Tooltip；
- Save / Settings 作为 Pause Secondary View，不与 Command Surface 同时存在。

## Interaction

- 打开 Pause 自动 Focus “继续游戏”；
- ↑ / ↓ 循环，Home / End 跳首尾；
- Hover 中性，Focus 才使用少量熟铜；
- Esc：Menu 恢复游戏，Save / Settings 返回 Menu；
- 返回主菜单继续使用共享 Confirm Dialog。

## Style Ownership

- `wanhu-theme-tokens.css`：Pause Scene / Material Token；
- `wanhu-surface-system.css`：Pause Blocking Material + Command State Tone；
- `pause-layer.css`：Geometry / Spacing / Typography / Motion；
- `PauseLayer.tsx`：Structure / Focus / Keyboard / Behavior。

## Review

新增独立 Playwright Pause Review，固定输出：

- `pause-day`
- `pause-night`
- `pause-save`
- `pause-settings`
- `pause-return-main-menu-dialog`

并自动断言旧 Footer / 旧横向渐隐 / 永久 Primary 不得回归。
