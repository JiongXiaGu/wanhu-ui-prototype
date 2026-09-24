# Phase 2 Batch 12：HUD 前景别名收敛

## 接手与边界

接手 Runtime 为 `2d68ccd55317d93ac1c76a494a3e60804a97433f`。只读盘点提交 `80c1cfa2633ad45cf63a4875f03db0a1f820daf4` 的应用源码相同；盘点 Workflow 只读取仓库、不回写代码，随本批删除。遵循当前 main 直接提交，不建立临时 PR 或 Vercel 部署。

本批整理前景所有权，不换肤、不改布局或交互。HUD 表面、昼夜透明度、Management Topic、Source Badge、用户自选颜色和其它别名家族不在本批范围。

## 盘点结果与处理理由

精确名称扫描得到 10 个别名、19 处出现，分布在 4 个 Runtime CSS：Theme 10 处定义、Gameplay HUD Layout 5 处定义、Top Shell 3 处消费、Resource Shortcut 1 处消费。没有对应的 TypeScript Runtime 消费；其中 7 个名字已经没有消费者。

退役名称：

```text
--hud-text / --hud-text-secondary / --hud-icon / --hud-accent / --hud-accent-text
--wanhu-hud-paper / --wanhu-hud-text / --wanhu-hud-muted / --wanhu-hud-faint / --wanhu-hud-gold
```

不能只看 Theme 别名表：`.gameplay-screen` 的子级定义会覆盖从 `.game-canvas` 继承的同名值，即使 Theme 的文件加载更晚。与此同时，4 处旧 `color` 声明又被 Surface 的最终规则覆盖。Resource Shortcut CSS 虽在 Surface 后加载，其数值选择器的 specificity 仍低于 Surface 规则。

因此只删除 15 处无用定义和 4 处被覆盖的颜色声明，不把 `--hud-icon` 机械换成通用 Icon，也不把 Accent Text 改为 Brass Text。`src/ui/wanhu-surface-system.css` 与 `src/main.tsx` 均保持字节不变。

实际前景继续由原有 Surface 规则持有：指标数值为 Paper Primary；速度默认色为局部灰 `#7f8583`；Hover 为 Icon Hover；Selected 为 Brass High。Focus 仍由已有共享按钮轮廓表达，与 Selected 共存。精确值以 Theme / Surface 与页面 computed style 为权威，本记录不建立另一份正式调色表。

`--hud-accent-bg`、`--hud-surface-*`、`--hud-border-*`、`--hud-shadow-*`、HUD Filter 与 Geometry 均保留，不按前缀批量清理。Tonal / Identity / Character 兼容链继续由后续独立批次处理。

## 防回退与页面检查

`audit:visual` 增加 10 个完整名称护栏，输出实际命中名与次数。原 61 项 CLI 回归增加到 73 项：逐个验证旧名的定义和引用被拦截，保留背景 / Filter / Geometry，验证完整标识符边界。Study 与非 CSS 仍不在此 Runtime CSS 扫描范围；护栏不是完整 CSS 求值器。

新增 `scripts/capture-hud-foreground-review.mjs` 接入现有 UI Review，使用真实 Gameplay 页面和环境控制切换昼夜，不直接修改 `data-time-of-day`。覆盖 1920×1080 / 3840×2160，检查指标数值、速度默认 / Hover / Selected / Selected + Focus、快捷入口 Focus、两层旧别名消失、400×38 Top Tray 和原昼夜 Surface 密度。等待字体与 Motion settle 后采样；页面异常和断言失败写入报告并让任务失败。

截图和报告进入 `hud-foreground-review` Artifact；保留原有全页面 UI Review，不以该局部契约检查替代其它页面。

## 验证记录

本地已执行：73 项审计回归全部通过；`audit:visual` 扫描 64 个 Runtime CSS、旧共享色债务 0；`audit:scale`、`audit:unity` 通过；新截图脚本通过 `node --check`。迁移审计仍报告既有 Grid / 伪元素 / Filter 等债务，不代表 Unity 已落地。

本地缺少 `sharp`，未完成依赖它的工具检查与完整构建；以对应 GitHub Actions 为准。完整 Build、UI Review、截图下载和实际审图待本提交验证后记录，不预先声称通过。

Web 通过不等于 Unity 6.6 Player、字体资产、设备性能或最终美术验收。未做前后截图逐像素比较。
