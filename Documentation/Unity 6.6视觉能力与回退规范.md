# Unity 6.6 视觉能力与回退规范

《万户天工》的目标 Unity 版本已由项目方确认升级到 6.6。Web 仓库仍用于美术、比例、信息架构和交互验证，不是 Unity 工程。这里记录迁移决策，不表示原生实现或 Player 性能已经通过验收。

## 能力基线

Unity 官方《New in Unity 6.6》明确将 USS `backdrop-filter` 与 `filter: drop-shadow(...)` 列为 6.6 新能力。当前官网将该版本历史页放在 6000.7 手册目录，不能据此把项目目标改成 6.7。

参考来源（2026-09-21 核对）：

- 6.6 新能力历史页：https://docs.unity.com/en-us/engine/6000.7/manual/whats-new/unity66
- 当前 Backdrop Filter 约束说明：https://docs.unity.com/en-us/engine/6000.7/manual/uitoolkits/uielements/uie-uss/uss-filter/backdrop-filter

后一个链接是当前手册的 API 说明，不是已经在本项目 6000.6 Player 上验证的测试报告。具体补丁版行为仍以项目安装版本实测为准。

| 视觉需求 | 迁移方向 | 不应继续沿用的结论 |
| --- | --- | --- |
| 面板背后世界模糊 | 优先验证 URP 屏幕空间面板原生 backdrop-filter | 所有 Blur 都必须自行编写 URP Pass |
| UI 叠 UI 模糊 | 原生能力可处理后方已绘制 UI；由 Surface 层决定是否使用 | UI Toolkit 一概不能模糊 UI |
| 外部柔阴影 | 优先验证 filter 的 drop-shadow | 每个阴影都必须预制 9-slice |
| 内高光、Inset / Spread、复杂材质 | 保留细边、纹理、9-slice 或自定义绘制映射 | CSS box-shadow 可以逐字复制为 drop-shadow |

原生 Drop Shadow 跟随元素及其子层级的渲染形状，不等于 CSS box-shadow 的矩形模型。作为面板投影时，建议由独立的材质背景节点承担，避免不透明度不足的文字或图标也产生不需要的投影；最终以实际层级渲染为准。

## 原生 Backdrop 的边界

官方当前文档说明：URP 是支持的渲染管线；屏幕空间面板可使用，世界空间相机面板不支持。屏幕覆盖 Runtime Panel 可捕获相机输出与后方已绘制 UI。自身背景、边框和内容绘制在滤镜结果之上。

滤镜链按声明顺序处理。多个类分别设置 backdrop-filter 时，优先级更高的整条声明覆盖前者，不自动合并。不能把 Blur 和饱和度分别交给两个样式所有者后期待它们组合。

当前文档不支持 backdrop-filter 的 USS Transition。本项目继续禁止动态插值 Blur Radius，入场与退场仍使用 Opacity / Translate。

## Surface 决策

仍使用 Ambient / Context / Work / Blocking / Elevated 五类职责，均属于中性烟墨材质家族。

- 可读性由 Tint 与前景层级保证，Blur 只负责弱化世界细节。
- 新增 Blur 只能经共享 Surface 契约批准，不在每个按钮、列表行和缩略图上单独创建滤镜。
- Context / Workspace 保留适度背景感；阅读 Body 比 Header 更稳。
- Dialog 与 Pause Panel 当前保持不额外模糊自身后方 UI，是既有美术和成本选择，不是引擎不支持。
- 保留当前无颗粒 Dialog / Pause Panel，不因引擎新增能力重新添加磨砂装饰。
- 半透明放在材质背景，不能用父节点整体 opacity 让文字与控件一起变淡。

## 回退与成本

默认先在 Unity 6.6 + 实际 URP Renderer / PanelSettings 上验证原生效果。只有原生效果不满足性能或构图需求时，才考虑共享的世界 Blur Texture / URP Pass；旧的共享 Blur 方案从强制前置依赖调整为可选回退。

不预设原生滤镜一定更省。比较 GPU 时间、滤镜覆盖面积、重叠层数、批次变化、动画和目标设备。低画质至少提供稳定中性 Tint + 边缘 / 简化阴影的无 Blur 路径，不能让降级后的文字依赖背景颜色。

Unity 验证应包含：昼夜世界、UI-over-UI、半透明与圆角边缘、1920×1080 / 2560×1440 / 3840×2160、键鼠与手柄焦点、禁用状态，以及 UI Toolkit Profiler / Frame Debugger 检查。

## USS 所有权

Theme / Typography 定义语义值；Surface 持有完整滤镜与背景配方；Controls 持有内部结构和 Hover / Selected / Focus；Feature 只负责内容布局和必要业务差异。不得新增一个末尾美化样式文件来覆盖全部组件。

Web CSS 不与 USS 逐字等价。Grid、伪元素、CSS Mask、复杂渐变和浏览器字体特性仍需映射到 UXML / Flex、真实 VisualElement、Sprite Tint 或字体资产；原生滤镜不能消除这些迁移任务。

旧交接、开发记录中基于早期 Unity 的限制，涉及 Blur / Shadow 时以本文件及更新后的《UI Toolkit落地规范》为准；其余空间、工具、输入与业务状态约定不变。
