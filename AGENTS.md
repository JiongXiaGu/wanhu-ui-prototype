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
9. `Documentation/UI图标资产管线.md`
10. `Documentation/UI Typography与Icon尺寸规范.md`
11. 当前任务相关规范、开发记录与代码

不要只根据截图或当前对话直接改代码；先确认已有状态边界、样式所有权和 Unity 映射。

## 当前工作方式

- Web Prototype 继续用于验证视觉、构图、信息架构和交互；
- 最终运行时 UI 为 Unity UI Toolkit，不把 React / CSS 实现本身当产品架构；
- 默认直接修改并提交 `main`；
- 不需要建立临时分支；
- 不需要部署 / 推送 Vercel；
- GitHub Actions 保留 Build 与 UI Review，作为完整页面／交互和阶段交付的正式回归；
- 局部 Control / Surface 的高频视觉微调可以先做“源码级组件 Review”：读取当前 TSX/CSS，用等价 DOM + 当前 CSS Token/Selector 渲染 Off/On/Hover/Disabled 等状态并截图实际检查；这种中间短循环不要求每次等待 Actions；
- 源码级组件 Review 只适合 Slider、Toggle、Button、ColorParameterField、单个 Surface 材质等局部视觉，不得用来冒充完整 React 页面、正式 PNG Icon、世界背景、Workspace/HUD 布局或真实交互已经通过；
- 重要 UI 修改准备交付时仍必须由 GitHub Actions UI Review 生成固定 1920×1080 截图 Artifact；Agent 下载 Artifact、实际打开关键截图并完成视觉复核后才能交付；
- 只有当正式重要 UI 任务的现有截图矩阵未覆盖受影响状态时，才在同轮更新 `scripts/capture-ui-review.mjs` / Scenario；纯局部中间视觉试验不为了截图数量机械扩张正式矩阵；
- Vercel 不属于日常复核链路。

## 完成门槛

重要修改的**正式交付**至少：

1. 先阅读相关文档和代码；
2. 修改代码；局部 Control / Surface 可在此阶段反复做源码级组件截图 Review，尽早发现视觉问题；
3. 同步正式 Documentation；
4. 执行 `npm run audit:unity`；
5. GitHub Actions Build 必须成功；
6. GitHub Actions UI Review 必须成功并上传截图 Artifact；
7. Agent 下载 Artifact，并实际打开本轮关键完整页面截图检查：构图、层级、留白、尺寸、遮挡、状态、正式图标、日夜/世界背景干扰；
8. 如果完整页面截图发现问题，继续修改；局部问题可先源码级快速复查，完成后重新跑 Build + UI Review；
9. 最终交付时给用户提供本轮关键正式截图，不允许只报告“Action 成功”；
10. 检查状态所有权、输入、Motion、Surface 和 Unity UI Toolkit 映射，不交付半成品。

纯文档修改不需要为了制造绿色状态而重跑 UI Review。

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
- UI Icon 正式规则见 `Documentation/UI图标资产管线.md`：SVG 只作为 Source Master，64×64 PNG 是 Web / Unity 共用 Runtime Asset；
- UI Icon Runtime 已完成 PNG 化：`src/` 禁止直接依赖 `lucide-react`，也禁止重新引入 `LucideIcon`；Lucide 仅允许存在于 `scripts/icons/` Source Generator；
- 新图标先加入 Source List，执行 `npm run icons:build`，并通过 `npm run icons:check`；重要图标变化必须走 UI Review；
- Typography / Icon Size 正式规则见 `Documentation/UI Typography与Icon尺寸规范.md`：1080p 可读文字下限为 9.5px，常规交互文字优先 10–11px；普通 Icon 使用 14/16/18/20/24px 语义档位。

`npm run audit:unity` 会阻止新的高风险模式，并输出仍待迁移的 Grid / Pseudo / Blur / Browser API 债务。

## 文档与代码

- 代码是当前具体实现的权威来源；
- 正式文档记录稳定设计、职责边界、迁移映射与禁止项；
- 架构或视觉决策变化时同步更新 `Documentation/工作交接.md`；
- 阶段性重要修改记录到 `Documentation/开发记录/`；
- 不创建额外 `_AI` 文档层。
