# 万户天工 UI Prototype

《万户天工》的 UI 美术、构图、信息架构和交互验证原型。最终运行时为 **Unity 6.6 + URP + UI Toolkit**；本仓库是 React / TypeScript / Vite 原型，不是 Unity 游戏客户端。

## 接手与视觉入口

先读 `AGENTS.md` 和 `Documentation/工作交接.md`。给 Unity UI Toolkit 制作 AI 的视觉入口是 [UI Toolkit 视觉总规范](<Documentation/UI Toolkit视觉总规范.md>)；准确色值与叠层配方见 [烟墨熟铜视觉材质规范](<Documentation/Wanhu 烟墨熟铜视觉材质规范.md>)，其他领域见 [文档索引](<Documentation/README.md>)。

不要把 `src/styles.css` 第一段旧变量、早期参考色或 Study 截图当成最终配色。必须核对 `src/main.tsx` 的加载顺序、`src/ui/wanhu-theme-tokens.css`、`wanhu-surface-system.css` 和目标 Consumer；仍有局部前景与字号例外，不能声称全仓库完全 Token 化。

## 当前基线

- 固定 1920×1080 逻辑画布，浏览器整体等比缩放。
- 低饱和烟墨工作表面、暖纸浅字、熟铜状态；轻 HUD 与重面板保留不同材质配方，不回到墨绿皮肤或仿古卷轴。
- 保留 Gameplay / Management / Workspace / Tool / Pause / Archive / Settings 的空间和输入契约。
- 共享字号：元信息 11px、操作与正文 12px、阅读 13px、分组 14px、标题档位 16 / 18px；实际组件例外见视觉总规范。
- 普通图标采用 committed 64×64 PNG，SVG 只作 Source Master；Runtime 不生成 Lucide SVG。
- Unity 6.6 原生 backdrop-filter / drop-shadow 属于优先验证方向；共享自定义 URP Blur 是性能或效果不满足时的回退。

原生能力与实际项目验收是两回事，版本和边界见 `Documentation/Unity 6.6视觉能力与回退规范.md`。

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

`npm run check` 执行图标校验、迁移审查与构建；字号扫描需单独运行 `audit:scale`。

## 体验入口

确定性页面示例：

```text
?review=gameplay
?review=workspace-building
?review=color-tool-surface
?review=weather
?review=load
?review=settings
?review=pause
```

完整 Scenario 以 `src/app/scenarios.ts` 为准。城市与库存从 Gameplay 顶部入口打开。

## 工作方式与验收

默认直接提交 main，不要求临时分支或部署 Vercel。历史部署配置不是日常验收依赖。

局部 Control / Surface 可先做源码级组件 Review，但不能替代真实 React 页面、正式 PNG 图标、世界背景与交互测试。重要视觉修改需通过 GitHub Actions Build / UI Review，并实际打开关键完整截图；最终交付直接展示关键截图。纯文档变更不为了绿色状态重复跑 UI Review。

基础矩阵在 `scripts/capture-ui-review.mjs`；阅读、状态、昼夜与 4K 扩展在 `scripts/capture-typography-decision-review.mjs`。源码检查、构建成功、Artifact 下载、实际审图与 Unity Player 测试应分别说明。

Web 字体仍使用已有 Noto 加载方式。离线打包、Unity Font Asset / fallback、目标设备字体与性能属于迁移验证，不应宣称已完成。

Theme 定义语义值，Surface 定义完整材质，Controls 定义内部结构与状态，Feature 定义业务布局。该职责关系不是 CSS 的字面导入顺序。不要追加一个最后加载的美化文件修补所有页面。
