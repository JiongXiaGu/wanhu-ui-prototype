# Gameplay Management Space

## 本轮目标

把财政、户籍、政策、商贸、治理、军务等复杂城市系统从 `Right Edge Flyout` 中移出，建立独立的 Gameplay `Management Space`；同时明确 Normal Gameplay、Workspace、Tool 对左侧与底部 UI 槽位的所有权，避免城市管理入口和建筑工作流互相竞争。

## 结构调整

Gameplay 内部现在明确区分：

- `Gameplay`：Global HUD + Quick Controls + City Management Rail + Information Views + Utility Toolbar + Main Dock；
- `Management`：Global HUD + 中央大型 Management Surface；
- `Workspace`：Global HUD + Quick Controls + Workspace + Main Dock；
- `Tool`：Global HUD + Quick Controls + ToolOverlay + Tool Bottom Dock + OperationHints；
- `Pause`：Pause Layer。

空间优先级：

`Pause > Tool > Workspace > Management > Gameplay`

`management` 已作为独立状态进入 `src/app/ui-state.ts`，不再借用 `flyout` 表达。

## Management Space

城市管理入口目前统一进入同一个中央管理空间，并在内部通过 Tab 切换：

`概况 / 户籍 / 财政 / 政策 / 商贸 / 治理 / 军务`

Management Space：

- 阻挡世界交互；
- 保留世界作为压暗、轻模糊背景；
- Global HUD 保留并弱化；
- 隐藏 City Management Rail、Quick Controls、Utility Toolbar、Main Dock、OperationHints 与 Right Edge Flyout；
- Esc 或关闭按钮回到 Normal Gameplay。

财政页当前作为较完整的复杂面板样例，包含关键指标、近六月收支、收入构成、税赋调整与财政判断。其它管理页先使用同一空间骨架，后续按实际游戏系统继续深化。

## Right Edge Flyout

Right Edge Flyout 恢复为轻量场景上下文工具，目前只承载：

- Camera；
- Weather。

需要多级 Tab、较宽统计、趋势图、较多管理参数的系统不再塞进右侧 Flyout。

## Workspace / Tool 槽位规则

- Building Workspace 中隐藏 City Management Rail，保留 Main Dock；
- Building Placement Tool 中隐藏 City Management Rail、Main Dock、Utility Toolbar 与 Information Views；
- Tool 使用自己的左侧 ToolOverlay、底部 Tool Dock 和右下 OperationHints。

这使建筑放置与城市管理不再争抢左侧区域。

## Visual Review

本轮 Build 与 Visual Review 均通过，并实际检查了以下 1920×1080 截图：

- Normal Gameplay + Management Rail；
- Finance Management Space；
- Policy Management Space；
- Information Views；
- Land Value View；
- Building Workspace；
- Building Placement Tool；
- Camera Right Edge Flyout。

审图结论：

- 中央管理面板与顶部 Global HUD 有清晰间距，没有裁切或重叠；
- Management Space 的体量足以承载财政类复杂信息，同时背景城市仍可感知；
- Finance 页面信息密度成立，没有重新退化成 410px 右侧窄面板；
- Policy 页面留白较多但不需要用无意义 Card 或说明文字填满，符合当前“信息做减法”的原则；
- Workspace 与 Tool 状态均未出现 City Management Rail；
- Building Placement 只保留自身 ToolOverlay / Tool Dock / OperationHints，左侧和底部职责清晰；
- Camera 仍保持轻量 Right Edge Flyout 语义；
- Information Views 仍以观察世界为主，没有升级成管理面板。

地图热力表现目前仍是原型性渐变，后续应逐步向街区、建筑、道路和覆盖范围数据贴合。
