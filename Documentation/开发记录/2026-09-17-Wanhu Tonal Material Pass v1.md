# Wanhu Tonal Material Pass v1

本轮在 Character Pass v2 基础上调整 Gameplay 主材质与明度层级，目标是解决此前 UI 与低饱和世界画面共同落在中灰区间、整体发灰发蒙的问题。

## 当前基线

- Gameplay 主 Surface 从灰绿 / 玉青倾向收敛为冷黛黑、Graphite 与烟墨色；
- 常驻 HUD 仍保持较轻透明度，不因为深色方向变成黑色不透明浮板；
- Context / Workspace / Tool 等工作空间可以更实、更暗，以形成真正的任务层级；
- 主阅读层使用暖纸白，普通 Label / Icon 使用 Secondary / Tertiary 灰阶，不再靠多色分类建立重点；
- Selected / Focus / On / Primary 的暖色从偏亮 Old Gold 收敛为熟铜 / 暗黄铜；
- 普通资源、天气类型、Workspace 分类不做多色编码；
- 朱砂只预留给未来 Warning / Danger / Urgent，不作为普通装饰色；
- Blur 继续服务于环境融合，但不主动大幅降低世界饱和度；世界自身的绿植、木色、土色和水色应能穿过轻量 HUD；
- `glass-noise-soft.png` 微纹理继续保留，深色不等于纯色塑料板。

## Environment

Environment 从“灰卡片套灰卡片”改为更连续的深色工作 Surface：

- 内部分组主要依赖间距、标题和低对比分隔线；
- Weather Preset 默认保持中性，只有当前预设使用熟铜状态；
- Slider 保持纸白 / 中性灰主体，Focus 才出现熟铜 Halo；
- 白天与夜晚使用同一套色彩语义，不建立独立 Night Theme。

## Workspace

- Header 保持相对轻的 Context 层；
- Body 使用更稳定的深黛黑 Work 层；
- Asset Card 默认接近无底色，由缩略图和文字承担内容识别；
- 正式 Workspace 外壳继续服从 Edge & Elevation v1：Borderless，以 Surface 密度和 Shadow 分离世界；
- Header / Filter 内部分隔继续保留；
- Active 仍由明度、Surface 和熟铜状态共同表达，不恢复多色分类。

## Persistent HUD

审查后确认不能简单把 Frostpunk 的深色感理解为提高不透明度。正式常驻角色继续遵守原有透明度区间：

- Top HUD：约 `.50`；
- Secondary HUD：约 `.41`；
- Main Dock：约 `.58`；
- World Utility：约 `.41`；
- Operation Hint：约 `.45`；
- System Menu：约 `.40`。

差异主要来自更冷、更深的 Surface Hue 和更明确的 Paper 明度层级，而不是用不透明黑板覆盖世界。

## Review 结论

Build 与完整 Visual Review 通过，并人工检查：

- 普通 Gameplay 白天；
- Environment 白天；
- Bridge Workspace 白天；
- 普通 Gameplay 夜晚；
- Environment 夜晚。

当前结果相比此前灰绿玻璃更能把 UI 从世界中切出，同时没有牺牲常驻 HUD 的世界优先原则。夜景下纸白与熟铜没有发光化，Environment / Workspace 也没有退化成纯黑不透明面板。

## 不要回退

- 不恢复资源 / 天气 / Workspace 分类的一物一色多色编码；
- 不用提高常驻 HUD Alpha 来制造“高级深色”；
- 不恢复大量白色半透明内卡；
- 不把熟铜重新推回明亮游戏金；
- 不删除正式 Workspace / Dock / Utility 的 Borderless Edge & Elevation 规则；
- 不用高 Blur + 明显降饱和重新制造灰雾感。
