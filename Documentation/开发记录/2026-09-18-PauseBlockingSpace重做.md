# 2026-09-18 Pause Blocking Space 重做

本轮删除历史绿黑横向渐隐 Pause Strip，把 Pause 迁入正式 Smoked Graphite Blocking System。

## 结构

- Pause Command Surface：432px / 18px；
- Header 改为标题 + 城市/年份 Meta 两行；
- 命令改成 3+1：继续 / 保存 / 设置 + 返回主菜单；
- 删除底部 Esc 返回游戏提示；
- Save / Settings 继续作为 Secondary Global Space，不和 Pause Card 同时出现。

## Interaction

- 打开 Pause 自动 Focus “继续游戏”；
- ↑ / ↓ 循环；
- Home / End 跳首尾；
- Esc：Pause Menu 恢复游戏，Secondary View 返回 Pause Menu；
- 返回主菜单仍使用共享确认 Dialog。

## Style Ownership

- Theme Tokens：Pause Dim / Scene Filter / Blocking Material Token；
- Surface System：Pause Command Surface 唯一材质 Owner；
- pause-layer.css：Geometry / Typography / Motion。

Review 增加白天 / 夜晚 Pause、Focus Navigation、3+1 Hierarchy、No Footer Hint 与 Shared Material 检查。
