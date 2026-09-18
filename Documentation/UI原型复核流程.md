# UI 原型验证流程

适用于 `wanhu-ui-prototype` 的重要 UI 修改。

当前默认验证链路不再使用 GitHub Actions Visual Review，也不再自动生成、压缩、上传或下载 Playwright 截图 Artifact。

## 默认流程

1. 先阅读当前任务相关正式文档和代码；
2. 完成代码修改；
3. 同步更新对应 Documentation；
4. 执行 Build；
5. 检查受影响的状态、交互、样式所有权与 Unity UI Toolkit 映射约束；
6. Build 或逻辑检查失败时先修复；
7. 完成后直接提交到 `main`。

Build 是当前 GitHub Actions 的默认自动验证。

## Visual / Playwright

`.github/workflows/visual-review.yml` 已移除。

仓库中现有 `scripts/capture-*.mjs` 可以继续作为手动调试工具存在，但：

- 不属于每轮任务的必做步骤；
- 不由 GitHub Actions 自动执行；
- 不要求上传 Artifact；
- 不要求在聊天中提供截图；
- 不因为这些脚本的历史断言阻塞正常 Build 与交付。

如果未来重新启用视觉自动化，应重新设计独立工作流，而不是默认恢复旧 Visual Review 链路。

## Git 与部署职责边界

- 后续修改默认直接提交到 `main`；
- 不需要为普通 UI 修改建立临时复核分支；
- Vercel 不属于日常验证与交付流程；
- 不创建 deploy-only / 空提交来触发部署；
- 只有用户明确要求部署或排查部署时，才处理 Vercel。

## 交付标准

完成一轮任务时至少应满足：

- 代码与正式文档一致；
- Build 成功；
- 没有保留已知的半成品或明显逻辑错误；
- 没有为了 Web 原型方便而引入无法合理迁移到 Unity UI Toolkit 的核心结构。
