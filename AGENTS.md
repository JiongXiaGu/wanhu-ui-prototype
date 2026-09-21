# AGENTS.md

这是所有 AI / Agent 接手 wanhu-ui-prototype 的入口。先理解现有项目，再修改；代码是具体实现权威，Documentation 记录设计与契约。

## 开始工作前

核对远端最新 main，不用聊天记忆覆盖当前代码。依次阅读：

1. `Documentation/工作交接.md`
2. `Documentation/项目概览.md`
3. `Documentation/UI设计原则.md`
4. `Documentation/Wanhu 烟墨熟铜视觉材质规范.md`
5. `Documentation/UI空间与状态架构.md`
6. `Documentation/UI Toolkit落地规范.md`
7. `Documentation/Unity 6.6视觉能力与回退规范.md`
8. `Documentation/UI Motion System设计规范.md`
9. `Documentation/Unity UI Toolkit迁移准备清单.md`
10. `Documentation/UI图标资产管线.md`、`Documentation/UI Typography与Icon尺寸规范.md`
11. 当前任务涉及的组件规范和代码。

目标运行时已确定为 Unity 6.6 + URP UI Toolkit。涉及原生 Blur / Shadow 的版本能力，以《Unity 6.6视觉能力与回退规范》为准；不得用历史文档中的“不能模糊 UI”限制新设计，也不得把支持某能力写成已经完成 Unity 实测。

## 开发与交付

- Web 用于美术、构图、信息架构与交互验证，不把 React / CSS 当最终产品架构。
- 默认直接提交 main，不建临时分支，不强制推送或部署 Vercel。
- 局部 Button / Toggle / Slider / ColorParameterField / Surface 可以做源码级组件 Review，提高中间迭代速度。
- 组件截图不能冒充真实 React 页面、正式 PNG 图标、世界背景、Workspace / HUD 布局或真实交互已验收。
- 重要 UI 修改正式交付必须由 GitHub Actions Build 与 UI Review 验证；下载截图 Artifact，实际打开关键完整页面检查后再交付。
- 先执行 icons:check、audit:scale、audit:unity、build。当前 Build 工作流包含这些步骤；环境不能本地运行时，应明确以对应 Actions 日志为依据。
- 全局 Typography / Surface / Controls 修改需检查 Settings / Archive / Management / Workspace / Tool / Dialog、昼夜和缩放；不要只看一个目标页面。
- 现有矩阵未覆盖受影响状态时，同轮扩展截图脚本；不为单个局部试验机械增加大量截图。
- 截图或构建发现问题，继续修复、重跑并复查，不能只报 Action Success。
- 交付说明实际 main SHA、对应 Build / UI Review、实际审图范围和关键截图。Web Review 不等于 Unity Player 验收。
- 文档与代码同轮同步；纯文档变更不需要为了绿色状态重跑 UI Review。

## 迁移护栏

- Runtime CSS 禁止 :has()；不通过 DOM 查询推断业务状态。
- 不新增私有 backdrop-filter 所有者；新需求归共享 Surface / 6.6 原生效果与回退契约。
- Transition 必须写明确属性并消费共享 Motion Token。大型 Surface 不动画 Width / Height，不插值 Blur Radius；Business State 不等待动画。
- 新布局必须能说明 UXML / Flex 行列映射；有结构语义的状态线、Pager Marker、Overlay 优先真实元素。
- 图标 SVG 只为 Source Master；64×64 PNG 是 Web / Unity 共用 Runtime Asset。src 禁止依赖 lucide-react 或 LucideIcon。
- 新图标加入 Source List 后执行 icons:build / icons:check；重要视觉变化仍需正式 UI Review。
- 1080p 共享文字：Metadata / Caption 11px，Label / Body 12px，Reading 13px，Subheading 14px，Panel / Workspace Title 16 / 18px。图标仍为 14 / 16 / 18 / 20 / 24px。
- Feature 不重写共享控件基础字号与状态。禁止用更小文字、transform scale 或额外空白列掩盖布局问题。
- Hover 中性提亮，Selected / On 熟铜，Focus 独立轮廓；选中与焦点必须可以并存。
- 不新增末尾美化覆盖文件；在 Theme、Surface、Control 或对应组件的现有所有者中修改。

正式文档记录稳定职责、边界、生命周期、不变量与 Unity 映射，不重复实现。阶段性记录放在 Documentation/开发记录，不创建额外 _AI 文档层。
