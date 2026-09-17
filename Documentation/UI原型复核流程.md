# UI 原型复核流程

适用于 `wanhu-ui-prototype` 的重要 UI 修改。

代码写完或 Build 通过不代表任务已经完成。每次重要界面修改后，固定执行：

1. 完成代码修改并运行 Build；
2. 生成或获取 1920×1080 Visual Review 截图；
3. 至少检查本次目标界面的主要状态，必要时同时检查相关页面；
4. 开发者 / AI 必须实际查看截图，检查构图、层级、可读性、留白、控件位置和状态反馈；
5. 如果截图暴露问题，先继续调整，再重新截图复核；
6. 经过截图复核后再向用户交付，并附上最终 Review 截图。

Vercel 线上页面是否已经更新不作为截图复核的前置条件；GitHub Actions Visual Review Artifact 可以直接作为审图来源。

对于有明显状态差异的界面，应分别保留关键状态截图。例如 New Game 至少覆盖常规地图选择与随机地图参数状态。

## Git 与部署职责边界

本项目把“原型开发与复核”和“线上 Production 发布”分开处理：

- Agent 默认工作到 Git / GitHub Actions / Review 为止；代码、测试、Review Scenario 和文档确认后合入 `main`，并完成 Build、Visual Review 与人工审图；
- 重要 UI 修改优先在 `tmp-*` 临时复核分支完成；Build 与 Visual Review 均允许这些分支触发，审图通过后再快进或合入 `main`；
- 临时分支与 `main` 的 Visual Review 使用各自独立的 concurrency group，避免审图分支与正式分支互相取消；
- `main` 已包含确认后的修改后，本轮 UI 工程任务即可结束，不需要等待 Vercel 部署完成；
- Vercel Production 的 Deploy / Promote / Redeploy 默认由用户手动操作；除非用户明确要求排查 Vercel，否则 Agent 不主动调用 Vercel、不查询部署状态或日志、不等待部署，也不尝试推进 Production；
- 不允许创建空提交、`deploy-only` 提交、无内容重试提交，或为了刷新 Vercel 页面而污染 Git 历史；
- 如果 Git push 自动触发 Vercel Preview / Production，把它视为平台集成的副作用，不把其结果作为 UI 复核流程的一部分；
- Vercel 构建次数与频率有限，远端构建属于项目资源。迭代期间优先使用 GitHub Actions Visual Review Artifact，不要求每次微调都产生新的 Vercel Preview；
- 同一轮调整尽量把代码、测试、Review Scenario 与文档合并后再形成一次完整提交 / PR；避免为 1–2 px 微调、单独说明或截图说明反复推送；
- 不在项目文档中写死具体每日构建次数，实际额度以当前 Vercel 账号与平台规则为准。

只有用户明确提出“部署、Promote、Redeploy、查看 Vercel 日志或排查 Vercel 构建失败”时，Vercel 才属于当前任务范围。

## Review 图片输出

Playwright 仍以 1920×1080 PNG 完成自动截图与视觉断言，确保测试过程不受有损压缩影响。所有截图脚本完成后统一执行预览压缩：

- 最大宽度：`1600px`；
- 格式：WebP；
- Quality：`80`；
- 原始 PNG 只作为 CI 中间文件，压缩成功后删除；
- GitHub Actions Artifact 只上传压缩后的 WebP；
- 聊天交付默认只提供压缩 WebP 链接，不重复提供原始 PNG。

压缩属于复核输出优化，不改变 1920×1080 逻辑画布、场景构图或自动测试基准。若后续发现小字号在压缩预览中无法可靠审查，应优先提高 WebP Quality 或输出宽度，而不是降低 UI 文字标准。
