# UI 原型复核流程

适用于 `wanhu-ui-prototype` 的 UI 修改。

## 核心规则

本项目采用两级视觉复核：

1. **源码级组件 Review**：用于局部 Control / Surface 的高频中间迭代，提高速度，不要求每次等待 GitHub Actions。
2. **GitHub Actions UI Review**：用于完整页面、真实交互和正式交付，仍是重要 UI 修改的正式门槛。

两类 Review 解决的问题不同，不能互相冒充。

## 源码级组件 Review

### 适用范围

适合这些局部视觉修改：

- Toggle；
- Slider / NumericSliderField；
- Button / Value Button；
- Select 的单个视觉状态；
- ColorParameterField；
- 单个 Dialog / Surface 的局部材质；
- Border、Radius、Opacity、Shadow、Typography、Spacing 等局部 Token；
- 不依赖完整页面状态的单一控件 Default / Hover / Focus / On / Off / Disabled 对照。

推荐流程：

1. 读取当前 main 和相关组件 TSX / CSS / Token。
2. 用等价 DOM 结构消费**当前源码里的真实 Selector / Token / 尺寸**，不要凭印象重新设计一份。
3. 在可用 Chromium / HTML 渲染环境中输出关键状态截图。
4. 实际查看截图，判断尺寸、材质、层级、边框、状态差异和可读性。
5. 发现问题后继续修改，再次快速截图。
6. 候选稳定后再进入完整页面 Review。

这种方式已经实测可用于当前共享 Toggle 的 Off / On / Disabled 状态。

### 不能证明的内容

源码级组件截图不是完整 Web Prototype 实机页面，不得用它声称以下内容已通过：

- 完整 React/Vite 页面；
- Review Scenario 的状态所有权；
- Workspace / HUD / Tool 页面整体布局；
- 正式 PNG Icon 资产是否正确加载；
- Gameplay 日间 / 夜间背景干扰；
- Glass Noise / 背景图片等二进制资产的最终合成；
- Overlay / Dialog / Workspace 之间的真实遮挡；
- Pointer / Keyboard / Focus 的完整页面交互；
- 多页面共享组件是否真正保持一致；
- Playwright 自动断言。

仓库当前包含大量正式 PNG Icon 与 Gameplay / Menu 背景资源；若执行环境无法完整取得这些二进制资源或无法运行本地 React/Vite 页面，就必须明确将截图标记为“源码级组件 Review”，不能称为正式页面截图。

## 什么时候必须 GitHub Actions UI Review

以下情况仍必须走完整 UI Review：

- 新增或重做完整页面、Workspace、HUD、Tool、Global Space；
- 修改布局、屏幕锚点、安全区、Panel 尺寸或页面级留白；
- 修改全局 Surface / Typography / Icon / Motion；
- 修改共享 Control 且可能影响多个真实页面；
- 修改正式 PNG Icon 或图标资产管线；
- 修改状态机、交互、Dialog、Overlay、Pager、筛选、拖拽、输入流程；
- 需要检查日间 / 夜间 / 世界背景干扰；
- 修改 `scripts/capture-ui-review.mjs`、Scenario、断言或 Workflow；
- 重要 UI 任务准备正式交付；
- 阶段收尾或用户明确要求完整验收。

纯文档修改不需要为了制造绿色状态而额外重跑 UI Review。

## 重要 UI 的正式交付流程

1. 阅读当前任务相关文档和代码。
2. 修改代码；局部 Control / Surface 可在这一步反复做源码级组件 Review。
3. 同步正式 Documentation。
4. 执行 `npm run audit:unity`；涉及图标时同时执行 `npm run icons:check`，需要时执行 `npm run audit:scale`。
5. 提交 `main`。
6. GitHub Actions Build 必须成功。
7. GitHub Actions UI Review 必须成功。
8. 获取 `ui-review` Artifact。
9. 实际查看本轮关键完整页面截图。
10. 若存在明显视觉问题，继续修改；可先用源码级组件 Review 快速定位局部问题，随后重新执行正式 Build + UI Review。
11. 视觉、逻辑和 Unity 迁移边界均通过后才作为重要 UI 完成交付。

Action 成功不等于视觉验收完成。禁止只说“Workflow 成功”而没有实际审图。

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

重要 UI 任务在正式交付前必须确认它覆盖当前修改涉及的关键状态；如果没有，就在同一轮补充 Scenario / Interaction。不要为了每次局部 CSS 中间试验机械增加正式截图矩阵。

例如地形编辑的正式页面 Review 至少覆盖：

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
- 关键 Toggle / Mode 是否能切换；
- 多个真实页面是否共同消费共享组件。

人工审图负责：

- 整体是否好看；
- 是否过高 / 过宽 / 空白过多；
- 视觉重量是否合理；
- 世界信息是否被遮挡；
- 文字是否过多；
- 状态是否一眼可读；
- 正式图标与背景是否协调；
- 是否符合 Smoked Graphite / Paper / Brass 体系。

源码级组件 Review 只提前处理其中的“局部视觉”部分，不替代这两项正式职责。

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

UI Review 不替代 TypeScript Build，Build 也不替代视觉复核。源码级组件 Review 同样不替代 Build 或 UI Review。

## Git 与部署职责边界

- 普通 UI 修改直接提交 `main`；
- 不要求建立临时分支；
- Vercel 不属于日常验证与交付；
- 不创建 deploy-only / 空提交；
- 用户明确要求部署或排查部署时，才处理 Vercel；
- 局部组件中间 Review 不需要为了生成 Artifact 额外制造提交。

## 交付标准

重要 UI 工作正式完成至少满足：

- 代码和 Documentation 一致；
- Unity Migration Audit 通过；
- Build 成功；
- UI Review 成功；
- Agent 已实际查看关键完整页面截图；
- 截图中没有明显构图 / 尺寸 / 遮挡 / 状态 / 正式资源问题；
- 最终回复附带本轮关键正式截图；
- 如使用过源码级组件 Review，明确它只是中间证据，不冒充正式页面截图；
- 没有为了 Web Prototype 方便引入无法合理迁移到 UI Toolkit 的核心结构。
