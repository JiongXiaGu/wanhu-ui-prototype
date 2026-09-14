# 2026-09-15 UI Toolkit 落地规范

## 背景

在完成 Building Workspace、Settings、Archive、BuildingPlacement、Camera / Weather 等 Web Prototype 后，对整套界面进行了 Web → Unity UI Toolkit 可行性审查。

审查确认：

- 当前 UI 的信息架构、空间模型和大部分交互可以保留；
- 真正的迁移差异主要来自 Web CSS 实现方式，而不是设计本身；
- CSS Grid、Gradient、Shadow、Filter、Pseudo Element、Keyframe、Backdrop Blur 等不应被误认为 Unity 必须 1:1 复刻的技术方案；
- 当前 Web Prototype 不需要因为纯技术差异进行大规模返工。

## 本次确认的长期决策

### 最终目标

正式游戏 UI 以 **Unity UI Toolkit** 为最终实现平台。

Web Prototype 继续只承担：

- 美术参考；
- 构图参考；
- 信息架构验证；
- 交互验证；
- 动效节奏验证；
- Visual Review。

### Blur

用户确认倾向使用 **URP 全屏 Blur Pass**。

因此：

- Web 可以继续用 `backdrop-filter` 表达目标效果；
- Unity 中 Blur 作为统一场景级渲染能力；
- 不为每个 UI Panel 单独实现一套模糊链路；
- Pause / Settings / Archive 等需要背景压制的空间共享 Blur 能力；
- 普通 Gameplay 小面板优先使用透明 Surface + Tone。

### Web 是否需要返工

当前结论：不需要。

以后仅在以下情况回头修改 Web：

- 结构本身不适合 UI Toolkit；
- 交互不适合鼠标 / 键盘 / 手柄；
- 性能代价不可接受；
- Unity 正式实现暴露出新的信息架构问题；
- 用户改变设计方向。

纯实现差异，例如 CSS Gradient 最终改为 Sprite，不属于返工理由。

## 新增长期文档

新增：

- `Documentation/UI Toolkit落地规范.md`

并同步更新：

- `README.md`
- `Documentation/项目概览.md`
- `Documentation/工作交接.md`

后续新 AI / 新开发者必须在设计新页面前阅读 `UI Toolkit落地规范.md`。

## 后续要求

每个新的重要 UI 设计，在确认美术方案时都需要同时回答：

1. Unity 中对应的 VisualElement 层级是什么；
2. 哪部分由 USS 表达；
3. 哪部分由 C# 状态和事件控制；
4. 是否需要 Sprite / Texture / RenderTexture；
5. 是否依赖 URP 全屏效果；
6. 是否需要 Pool / ListView；
7. 鼠标、键盘和手柄如何操作。

目标不是限制美术设计，而是避免产生无法解释的 Unity 落地债务。
