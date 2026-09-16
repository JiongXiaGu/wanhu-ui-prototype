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

## Vercel 构建额度

Vercel Preview / Production 构建额度有限，连续的小提交可能触发 `build-rate-limit`。复核流程必须兼顾视觉质量与部署额度：

- 一轮相关 UI 调整应尽量合并代码、测试、Review Scenario 和文档后再推送一次；
- 1–2 px 微调、仅文档变更、局部说明修正默认不单独触发 Vercel 部署；
- 迭代期间优先使用 GitHub Actions Visual Review Artifact 完成截图复核，不要求每次都生成新的 Vercel Preview；
- 最终发布时再让 `main` 产生明确的新提交并触发一次 Production；不要依赖把已经作为 Preview 构建过的同一 SHA 快进到 `main`；
- 若已触发 `build-rate-limit`，停止继续推送“重试提交”。已有 Ready Preview 时优先直接 Promote 到 Production；否则等待额度窗口恢复；
- 不在文档中写死某个每日构建次数，实际限制以当前 Vercel 项目配额和平台返回状态为准。

## Review 图片输出

Playwright 仍以 1920×1080 PNG 完成自动截图与视觉断言，确保测试过程不受有损压缩影响。所有截图脚本完成后统一执行预览压缩：

- 最大宽度：`1600px`；
- 格式：WebP；
- Quality：`80`；
- 原始 PNG 只作为 CI 中间文件，压缩成功后删除；
- GitHub Actions Artifact 只上传压缩后的 WebP；
- 聊天交付默认只提供压缩 WebP 链接，不重复提供原始 PNG。

压缩属于复核输出优化，不改变 1920×1080 逻辑画布、场景构图或自动测试基准。若后续发现小字号在压缩预览中无法可靠审查，应优先提高 WebP Quality 或输出宽度，而不是降低 UI 文字标准。
