# AGENTS.md

本文件是所有 AI / Agent 接手 `wanhu-ui-prototype` 时的强制入口。详细设计规则仍以 `Documentation/` 为准；这里仅保留不能遗漏的工作门槛与阅读顺序。

## 开始工作前

先阅读：

1. `Documentation/工作交接.md`
2. `Documentation/项目概览.md`
3. `Documentation/UI设计原则.md`
4. `Documentation/Wanhu 烟墨熟铜视觉材质规范.md`
5. `Documentation/UI空间与状态架构.md`
6. `Documentation/UI原型复核流程.md`
7. 当前任务相关的决策记录、组件规范与代码

不要只根据当前对话直接改代码；先确认现有空间职责、状态边界和已确定决策。

## 重要 UI 修改的完成门槛

代码写完或 Build 通过都不等于任务完成。Vercel 是否已经部署不属于 Agent 默认完成门槛。每次重要 UI 修改必须：

1. 完成修改并确认 Build 通过；
2. 获取或生成 `1920 × 1080` Visual Review 截图；
3. 覆盖本次修改涉及的关键状态；新增状态时同步补充 Review Scenario 或专用截图脚本；
4. Agent 必须实际打开并查看截图，检查构图、层级、可读性、留白、控件位置、遮挡和状态反馈；
5. 截图发现问题时先修复，再重新截图复核；
6. 完成实际审图后才能向用户宣称完成，并在交付时提供最终 Review 截图或对应 Artifact。

不得把“截图任务成功运行”当成“已经审图”；必须实际查看图片内容。

## Git、Review 与 Vercel 职责边界

本项目默认工作边界是：**Agent 负责 Git / GitHub Actions / Review，用户负责 Vercel Production 发布。**

- Agent 默认负责代码与文档修改、Git 分支与提交、GitHub Actions Build / Visual Review、下载 Review Artifact、实际审图以及把确认后的修改合入 `main`；
- 修改已经进入 `main` 且 GitHub Build / Visual Review 与人工审图完成后，本轮工程操作即可结束；不需要等待 Vercel，也不要把 Vercel 在线页面是否更新作为交付前置条件；
- Vercel Production 的 Deploy / Promote / Redeploy 由用户手动处理；除非用户明确要求排查 Vercel 问题，否则 Agent 不主动调用 Vercel 工具、不查询部署状态或日志、不等待部署完成，也不尝试替用户推进 Production；
- 不创建空提交、`deploy-only` 提交、无内容重试提交或其它仅为了触发 Vercel 的 Git 历史；
- 如果 Vercel Git Integration 因 Git push 自动产生 Preview / Production 构建，把它视为平台副作用，不追踪、不重试，也不为它调整本轮 Git 结果；
- Vercel Preview / Production 构建次数和频率是有限资源。开发与审图优先使用 GitHub Actions Visual Review Artifact，避免把每次微调都变成一次远端部署；
- 同一轮 UI 工作尽量在一个临时分支内完成代码、测试、Review Scenario 与文档，形成一次完整提交或一次 PR 后再合入 `main`；不要为 1–2 px 微调、单独说明或截图说明反复推送；
- 项目内不写死 Vercel 的具体每日构建次数，实际额度以当前账号与平台规则为准。

只有用户明确要求“部署 / Promote / 排查 Vercel 构建失败”时，Vercel 才进入 Agent 的任务范围。

## 实现与文档

- Web Prototype 用于验证视觉、构图、信息架构与交互；最终运行时为 Unity UI Toolkit。
- 代码是具体实现的权威来源；正式文档记录稳定设计事实、职责边界、关键不变量和决策原因。
- 视觉或架构决策变化时更新对应正式文档和 `Documentation/工作交接.md`。
- 阶段性重要修改按现有规则记录到 `Documentation/开发记录/`；不要记录无意义的 1–2 px 微调。
- 不创建额外 `_AI` 文档层。
