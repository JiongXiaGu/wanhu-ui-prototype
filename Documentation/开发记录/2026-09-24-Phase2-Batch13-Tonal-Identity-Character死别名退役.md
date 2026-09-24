# Phase 2 Batch 13：Tonal / Identity / Character 死别名退役

## 接手与边界

接手 main 为 `5e766f0a400b5ebfe2e7a57f884b72e613222aea`。本批只收敛 Theme 中的迁移兼容别名，不换肤、不改布局、交互、HUD Surface、Management Topic、Source Badge、Blueprint Preview 内容色或用户自选颜色。

## 盘点结果

按 `src/main.tsx` 的真实 CSS 加载链逐批读取 Runtime CSS，除 `wanhu-theme-tokens.css` 的定义外，没有发现 Tonal / Identity / Character Consumer。随后 Guard 对全部 64 个 Runtime CSS 再做全量扫描，确认这些名字已经没有残留。

退役 23 个名称：

```text
Tonal (10)
--wanhu-tonal-ink-950 / --wanhu-tonal-ink-900 / --wanhu-tonal-ink-800
--wanhu-tonal-paper / --wanhu-tonal-secondary / --wanhu-tonal-tertiary
--wanhu-tonal-brass / --wanhu-tonal-brass-hi / --wanhu-tonal-brass-soft / --wanhu-tonal-cinnabar

Identity (7)
--wanhu-identity-paper / --wanhu-identity-text / --wanhu-identity-secondary
--wanhu-identity-muted / --wanhu-identity-faint
--wanhu-identity-gold / --wanhu-identity-gold-hi

Character (6)
--wanhu-character-gold / --wanhu-character-gold-hi / --wanhu-character-gold-soft
--wanhu-character-joint / --wanhu-character-rule / --wanhu-character-beam
```

这些变量没有 Consumer，所以没有把它们机械替换成另一组 Token。Runtime 改动只是删除 23 个未消费定义，并把原注释改为只描述仍有消费的 HUD 材质兼容变量。

Phase 2 收尾时，Theme 内直接 `var(--...)` 映射只剩四项：`--wanhu-control-focus → --wanhu-color-brass-text` 是明确状态语义；`--hud-accent-bg` 与 `--hud-surface-blocking-top/bottom` 属于 Surface / 材质桥接，进入 Phase 3，而不是为了追求“零别名”在本批强删。

## 防回退

`audit-visual-governance.mjs` 新增 23 个完整名称 Guard，命中时报告实际变量名和次数，并保持完整标识符边界。回归测试从 73 项增至 98 项：

- 23 项逐名验证定义与引用都被拦截；
- 1 项确认正式 Theme Token 与 HUD 材质变量继续允许；
- 1 项验证完整名称边界，不把带前后缀的其它属性误判为退役变量。

第一次测试提交的边界正向用例暴露了 Guard 中 `\\w` 被双重转义的问题，Build #1536 因此失败；修复后使用与既有 HUD Guard 相同的 `\w` 边界表达，不隐藏这次失败。

## 验证记录

最终代码提交为 `a17858817ce1f7e04b6bc0d0144a2ed968d9622a`。

- Build #1537，Run `36002212861`：全部通过；
- 98 项视觉治理回归：98 pass / 0 fail；
- `audit:visual`：Runtime CSS 64，旧共享色债务 0，23 个新退役别名 Guard 全部生效；
- Icon / Scale / Unity Migration Guard、Tool Usability、Building Selection（11 checks）、World Utility（8 checks）和 `tsc -b && vite build` 均通过。

Runtime 删除提交为 `3e7c7c82f4ae629a1210b0eeb2ce2659f0471ea4`。UI Review #482，Run `36001820757` 通过；后续提交只改 Guard / 测试，因此受测 Runtime CSS 与最终代码一致。

已下载 `visual-governance-review` Artifact `10808602127`，实际打开 `readability-main-menu.png`、`readability-new-game.png`、`readability-settings.png`。未发现由删除未消费变量引入的文字、状态、颜色或布局变化。本批没有前后逐像素比较，也没有宣称 Web Review 等于 Unity 6.6 Player 验证。

## 阶段结论

Phase 2 的迁移兼容别名收敛到此完成。剩余 HUD 材质桥接转入 Phase 3；Control 内部的状态配方差异转入 Phase 4。下一阶段先做 Surface Ownership 盘点，再按单一家族收敛，不跨阶段混改。
