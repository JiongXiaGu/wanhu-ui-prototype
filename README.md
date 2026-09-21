# 万户天工 UI Prototype

《万户天工》的 UI 美术、构图、信息架构和交互验证原型。最终运行时为 **Unity 6.6 + URP + UI Toolkit**，本仓库仍是 React / TypeScript / Vite 原型，不是 Unity 游戏客户端。

## 当前基线

- 固定 1920×1080 逻辑画布，浏览器整体等比缩放。
- 烟墨 Graphite 面板、暖纸文字、熟铜状态；不回到墨绿皮肤或仿古卷轴。
- 保留现有 Gameplay / Management / Workspace / Tool / Pause / Archive / Settings 空间和输入契约。
- 共享正文与操作字号 12px，阅读内容 13px，分组 14px，面板标题 16px，Workspace 标题 18px；元信息与紧凑标签 11px。
- 普通图标采用 committed 64×64 PNG，SVG 只作 Source Master；运行时不生成 Lucide SVG。
- 原生 backdrop-filter 与 drop-shadow 已属于 Unity 6.6 可验证的迁移方向；共享自定义 URP Blur 从强制前提调整为性能或效果不满足时的回退。

6.6 能力、渲染条件和测试边界见 `Documentation/Unity 6.6视觉能力与回退规范.md`。原生引擎支持某效果，不表示本 Web 仓库已完成 Unity Player 验收。

## 开发

```bash
npm install
npm run dev
```

检查与构建：

```bash
npm run icons:check
npm run audit:scale
npm run audit:unity
npm run build
```

也可运行 `npm run check` 执行图标校验、迁移审查与构建；字号扫描需单独运行 `audit:scale`。

## 体验入口

通过 URL 查询参数进入确定性页面，例如：

```text
?review=gameplay
?review=workspace-building
?review=color-tool-surface
?review=weather
?review=load
?review=settings
?review=pause
```

完整 Scenario 以 `src/app/scenarios.ts` 为准。城市和库存可以从 Gameplay 顶部入口打开。

## 工作方式

默认直接提交 main，不要求创建临时分支，也不要求部署 Vercel。仓库中保留的历史部署配置不是日常验收依赖。

局部 Control / Surface 可以先做源码级组件 Review；组件图不能替代真实页面、正式 PNG 图标、世界背景与交互测试。

重要视觉修改需通过 GitHub Actions Build 和 UI Review。下载 `ui-review` Artifact 并实际查看完整页面截图，不能仅以 Action Success 交付。基础工具回归由 `scripts/capture-ui-review.mjs` 提供；阅读、控件状态、昼夜和 4K 回归由 `scripts/capture-typography-decision-review.mjs` 提供，并输出 `readability-report.json`。

目前 Web 字体仍通过已有 Noto 字体加载方式使用；字体离线打包、Unity Font Asset、fallback 和目标设备性能属于后续 Unity 迁移验证，不应宣称已完成。

## 文档与样式职责

从 `AGENTS.md` 和 `Documentation/工作交接.md` 开始。主要规范：

- `Documentation/UI设计原则.md`
- `Documentation/Wanhu 烟墨熟铜视觉材质规范.md`
- `Documentation/UI Typography与Icon尺寸规范.md`
- `Documentation/UI空间与状态架构.md`
- `Documentation/UI Toolkit落地规范.md`
- `Documentation/Unity 6.6视觉能力与回退规范.md`
- `Documentation/UI Motion System设计规范.md`
- `Documentation/UI图标资产管线.md`

Theme 定义语义，Surface 定义材质，Controls 定义内部结构与交互状态，Feature 定义业务内容布局。不要新增一个最后加载的美化覆盖文件来修正所有页面。

代码是具体实现权威；文档记录意图、边界、职责与不变量。历史快照不作为当前版本的能力基线。
