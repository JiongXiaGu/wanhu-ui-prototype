# UI 原型复核流程

适用于 `wanhu-ui-prototype` 的重要 UI 修改。

## 核心规则

重要 UI 修改 **必须经过 GitHub Actions UI Review 后才能交付**。

Action 成功不等于视觉验收完成。Agent 还必须：

1. 下载 UI Review Artifact；
2. 实际打开本轮关键截图；
3. 检查构图、尺寸、层级、留白、遮挡、文字密度、状态反馈与世界背景干扰；
4. 截图发现问题时继续修改；
5. 重新运行 Build + UI Review；
6. 最终回复中提供几张关键截图给用户。

禁止只说“Workflow 成功”而没有实际审图。

## 默认流程

1. 阅读当前任务相关文档和代码；
2. 修改代码；
3. 同步正式 Documentation；
4. 执行 `npm run audit:unity`；
5. 提交 `main`；
6. GitHub Actions Build 必须成功；
7. GitHub Actions UI Review 必须成功；
8. 获取 `ui-review` Artifact；
9. 实际查看本轮关键截图；
10. 若存在明显视觉问题，继续修改并重新执行 4–9；
11. 视觉与逻辑均通过后才向用户交付。

## GitHub Actions UI Review

正式工作流：

```text
.github/workflows/ui-review.yml
        ↓
Vite 1920×1080 Review Server
        ↓
scripts/capture-ui-review.mjs
        ↓
Playwright Assertions
        ↓
review-screenshots/*.png
        ↓
ui-review Artifact
        ↓
Agent 实际审图
```

### Review Scenario 原则

`scripts/capture-ui-review.mjs` 不是固定不变的“万能截图脚本”。

每次重要 UI 任务必须确认它覆盖当前修改涉及的关键状态；如果没有，就在同一轮补充 Scenario / Interaction。

例如地形编辑至少覆盖：

- Raise 默认态；
- Flatten 参数态；
- Slope 参数态；
- Terrain Utility Toggle 状态；
- 完成后恢复 Gameplay。

### 自动断言与人工审图的职责

Playwright 自动断言负责：

- 元素是否存在；
- 尺寸是否超出合同；
- 是否出现不应该存在的控件；
- Tool / Context / Return State 是否正确；
- 关键 Toggle / Mode 是否能切换。

人工审图负责：

- 整体是否好看；
- 是否过高 / 过宽 / 空白过多；
- 视觉重量是否合理；
- 世界信息是否被遮挡；
- 文字是否过多；
- 状态是否一眼可读；
- 是否符合 Smoked Graphite / Paper / Brass 体系。

两者缺一不可。

## Build / Migration Audit

Build 与 Visual Review 是两条独立门槛：

```text
npm run audit:unity
        ↓
GitHub Actions Build

GitHub Actions UI Review
        ↓
截图 Artifact
        ↓
人工审图
```

UI Review 不替代 TypeScript Build，Build 也不替代视觉复核。

## Git 与部署职责边界

- 普通 UI 修改直接提交 `main`；
- 不要求建立临时分支；
- Vercel 不属于日常验证与交付；
- 不创建 deploy-only / 空提交；
- 用户明确要求部署或排查部署时，才处理 Vercel。

## 交付标准

完成一轮重要 UI 工作至少满足：

- 代码和 Documentation 一致；
- Unity Migration Audit 通过；
- Build 成功；
- UI Review 成功；
- Agent 已实际查看关键截图；
- 截图中没有明显构图 / 尺寸 / 遮挡 / 状态问题；
- 最终回复附带本轮关键截图；
- 没有为了 Web Prototype 方便引入无法合理迁移到 UI Toolkit 的核心结构。
