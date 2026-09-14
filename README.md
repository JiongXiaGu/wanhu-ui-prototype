# 万户天工 UI Prototype

交互式 UI 美术与流程原型，用于在 Unity UI Toolkit 正式实现前验证《万户天工》的界面视觉、空间关系、交互层级和完整玩家流程。

> **最终运行时 UI：Unity UI Toolkit。**
>
> 本仓库的 React / TypeScript / CSS 页面只负责美术、构图、信息架构和交互验证，不是最终 Web 产品，也不要求 Web CSS 与 Unity USS 逐行对应。

- GitHub：`JiongXiaGu/wanhu-ui-prototype`
- Vercel：`https://wanhu-ui-prototype.vercel.app/`
- 固定逻辑画布：`1920 × 1080`
- Web Prototype：React + TypeScript + Vite + GitHub Actions + Playwright
- 最终目标：Unity UI Toolkit + UXML / USS / C# Runtime UI
- 场景级模糊：计划使用统一 URP Fullscreen Blur Pass

## 当前范围

- 主菜单
- 新建城市
- Archive / 载入游戏
- 全屏 Settings
- Gameplay HUD
- Gameplay Quick Controls
- Utility Toolbar / Main Dock
- Building Selection Workspace
- Building Placement ToolOverlay / Tool Dock
- GameplayOperationHints
- Camera / Weather Right Edge Flyout
- Pause Layer
- Pause Save / Pause Settings

## 设计基线

- 黛墨 / 深青灰 Surface；
- 暖金用于 Selected / Focus；
- 浅纸文字；
- 世界画面优先；
- 弱边界、低圆角；
- 常驻 UI 信息保持精简；
- 信息做减法，视觉层级通过 Tone、材质、真实游戏内容、排版和轻动效补足；
- 不使用繁复仿古装饰；
- 新增重要 UI 必须能说明其 Unity UI Toolkit 落地方式。

## Web 与 Unity 的边界

Web Prototype 可以使用浏览器能力快速表达目标视觉，例如 Grid、Gradient、Shadow、Filter、Backdrop Blur、Pseudo Element 和 Keyframe。

这些写法**不是最终技术方案**。正式 Unity 中应根据需要翻译为：

- UXML / USS；
- C# 状态与事件；
- VisualElement；
- Sprite / 9-slice；
- Texture / RenderTexture；
- Painter2D / Mesh；
- URP 全屏效果。

当前网页不因为纯实现差异而大规模返工。只有结构、交互、性能或信息架构本身不适合 Unity 时，才修改设计。

完整规则见：`Documentation/UI Toolkit落地规范.md`。

## 文档与交接

长期设计、决策、开发记录和当前工作上下文统一放在 `Documentation/`。

新对话或新开发者接手时，建议按顺序阅读：

1. `Documentation/工作交接.md`
2. `Documentation/项目概览.md`
3. `Documentation/UI Toolkit落地规范.md`
4. `Documentation/UI设计原则.md`
5. `Documentation/UI空间与状态架构.md`
6. 当前任务对应的代码和决策记录

重要目录：

```text
Documentation/
├─ 项目概览.md
├─ UI Toolkit落地规范.md
├─ UI设计原则.md
├─ UI空间与状态架构.md
├─ 组件设计规范.md
├─ 工作交接.md
├─ 决策记录/
├─ 开发记录/
└─ 代码审查/
```

代码是具体实现的权威来源；正式文档记录稳定设计目标、职责边界、关键不变量和决策原因；`开发记录/` 记录阶段修改及原因；`工作交接.md` 维护当前上下文。

## 开发

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## Visual Review

重要 UI 修改后应同时检查 Build 和 Visual Review。

Review Scenario 由 `src/app/scenarios.ts` 提供，可通过 `?review=<scenario>` 直接进入确定性状态。GitHub Actions 使用 Playwright Chromium 自动截图并上传 `visual-review` Artifact。

不要只检查目标页面；修改全局 Surface、Typography、Button 或布局时应重新检查全部主要状态。

Visual Review 验证 Web Prototype 的视觉和交互稳定性；正式实现前还需检查 UI Toolkit 可落地性。

## 部署

仓库包含 `vercel.json`。`main` 分支提交后由 Vercel 自动部署。
