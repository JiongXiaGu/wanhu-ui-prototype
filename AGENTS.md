# AGENTS.md

本文件是所有 AI / Agent 接手 `wanhu-ui-prototype` 时的强制入口。详细设计规则仍以 `Documentation/` 为准；这里仅保留不能遗漏的工作门槛与阅读顺序。

## 开始工作前

先阅读：

1. `Documentation/工作交接.md`
2. `Documentation/项目概览.md`
3. `Documentation/UI设计原则.md`
4. `Documentation/UI空间与状态架构.md`
5. `Documentation/UI原型复核流程.md`
6. 当前任务相关的决策记录、组件规范与代码

不要只根据当前对话直接改代码；先确认现有空间职责、状态边界和已确定决策。

## 重要 UI 修改的完成门槛

代码写完、Build 通过、Vercel 部署成功都不等于任务完成。每次重要 UI 修改必须：

1. 完成修改并确认 Build 通过；
2. 获取或生成 `1920 × 1080` Visual Review 截图；
3. 覆盖本次修改涉及的关键状态；新增状态时同步补充 Review Scenario 或专用截图脚本；
4. Agent 必须实际打开并查看截图，检查构图、层级、可读性、留白、控件位置、遮挡和状态反馈；
5. 截图发现问题时先修复，再重新截图复核；
6. 完成实际审图后才能向用户宣称完成，并在交付时提供最终 Review 截图或对应 Artifact。

不得把“截图任务成功运行”当成“已经审图”；必须实际查看图片内容。

## 实现与文档

- Web Prototype 用于验证视觉、构图、信息架构与交互；最终运行时为 Unity UI Toolkit。
- 代码是具体实现的权威来源；正式文档记录稳定设计事实、职责边界、关键不变量和决策原因。
- 视觉或架构决策变化时更新对应正式文档和 `Documentation/工作交接.md`。
- 阶段性重要修改按现有规则记录到 `Documentation/开发记录/`；不要记录无意义的 1–2 px 微调。
- 不创建额外 `_AI` 文档层。
