# AGENTS.md

本文件是所有 AI / Agent 接手 `wanhu-ui-prototype` 时的强制入口。详细设计规则以 `Documentation/` 为准。

## 开始工作前

依次阅读：

1. `Documentation/工作交接.md`
2. `Documentation/项目概览.md`
3. `Documentation/UI设计原则.md`
4. `Documentation/Wanhu 烟墨熟铜视觉材质规范.md`
5. `Documentation/UI空间与状态架构.md`
6. `Documentation/UI Toolkit落地规范.md`
7. `Documentation/UI Motion System设计规范.md`
8. `Documentation/Unity UI Toolkit迁移准备清单.md`
9. 当前任务相关规范、开发记录与代码

不要只根据截图或当前对话直接改代码；先确认已有状态边界、样式所有权和 Unity 映射。

## 当前工作方式

- Web Prototype 继续用于验证视觉、构图、信息架构和交互；
- 最终运行时 UI 为 Unity UI Toolkit，不把 React / CSS 实现本身当产品架构；
- 默认直接修改并提交 `main`；
- 不需要建立临时分支；
- 不需要部署 / 推送 Vercel；
- GitHub Actions 保留 Build；
- Visual Review 自动化已经退出默认工作流；
- Playwright capture 脚本只作为手动调试工具，不是每轮强制步骤。

## 完成门槛

重要修改至少：

1. 先阅读相关文档和代码；
2. 修改代码；
3. 同步正式 Documentation；
4. 执行 `npm run audit:unity`；
5. GitHub Actions Build 必须成功；
6. 检查状态所有权、输入、Motion、Surface 和 Unity UI Toolkit 映射；
7. 有已知问题时继续修复，不交付半成品。

## Unity Migration Guard

Web 可以继续高效使用 React / TypeScript，但不得新增会绑死 Web 的核心结构。

强制规则：

- Runtime CSS 禁止 `:has()`；
- 不新增新的 `backdrop-filter` 所有者；需要 Blur 时进入共享 Surface / Scene Blur 契约；
- Transition 必须声明属性并消费共享 Motion Token，不写 `transition:.16s ease`；
- 大型 Surface 不动画 Width / Height；
- Business State 不等待动画；
- UI 结构不能依赖 DOM 查询结果来推断业务状态；
- 新复杂 Grid 必须能够明确拆成 UXML/Flex 行列；优先直接使用 Flex-friendly DOM；
- 有语义的状态线、Pager Marker、Overlay 等优先使用真实元素，不新增结构性 `::before / ::after`；
- Lucide 只作为 Web Source Icon Library；Unity 不依赖 `lucide-react` Runtime。

`npm run audit:unity` 会阻止新的高风险模式，并输出仍待迁移的 Grid / Pseudo / Blur / Browser API 债务。

## 文档与代码

- 代码是当前具体实现的权威来源；
- 正式文档记录稳定设计、职责边界、迁移映射与禁止项；
- 架构或视觉决策变化时同步更新 `Documentation/工作交接.md`；
- 阶段性重要修改记录到 `Documentation/开发记录/`；
- 不创建额外 `_AI` 文档层。
