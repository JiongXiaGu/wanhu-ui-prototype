# UI 图标资产管线

**SVG 是 Source Master；64×64 白色透明 PNG 是 Web 与 Unity UI Toolkit 共用的 Runtime Asset。** 不按页面重新生成不同大小、线宽和状态色的同一个图标。

## 来源与当前资产

当前共 109 个图标：104 个既有 Lucide 来源、5 个《万户天工》自定义地形符号。数量以 Source List / Manifest 为准，不能把增加图标误解为解除现有规范。

- 通用来源：lucide-react 1.47.0；第三方许可保存在 `AssetsSource/UI/Icons/LUCIDE_LICENSE.txt`。
- 自定义来源：`scripts/icons/custom-icon-sources.mjs`，定义 TerrainRaise / TerrainLower / TerrainFlatten / TerrainSmooth / TerrainSlope。
- 自定义条目在 Manifest 中以 `origin: wanhu-authored` 标识，不归于 Lucide 来源；Manifest 的 sourcePackage 字段继续描述既有通用来源。
- Source Generator 使用 sharp 0.35.4，普通 Icon 标准线宽 1.7。

`src/` 禁止直接依赖 lucide-react，也禁止历史 LucideIcon 类型。Lucide 只作为 Source Generator 的输入。

## 同一条资产链

```text
Lucide / 自定义作者层几何
        ↓
Source List + build-icon-assets.mjs
        ↓
固定 SVG Source Master
        ↓
64×64 white RGBA PNG
        ↓
UiIconId / Manifest
      ↙             ↘
Web PNG Alpha Mask   Unity Sprite + Tint
```

新增自定义图标不建立第二套 Runtime，不直接嵌入 SVG，也不通过 CSS filter 给图片染色。Unity 直接复制 committed PNG，不需要重新从 SVG 栅格化。

## 资产规格

Canvas 64×64，PNG RGBA，白色图形，透明背景，标准 Stroke 1.7。Normal / Hover / Selected / Disabled / Warning / Danger 不烘焙进图像；PNG 不包含底板、Glow 或 Shadow。

显示尺寸由组件语义档位决定：14 / 16 / 18 / 20 / 24px。视觉图形与点击区域分离，不能因为图标小就一起缩小 Hit Area。较大的 Illustration / Preview 不扩张 UiIcon 职责。

地形五个符号统一地表视角：抬高 / 降低使用相同地表与相反箭头；整平强调水平标高；平滑强调曲线；坡面以高低端点和连接斜面表达。模式短名称负责补足符号含义，不能完全依赖图形猜测。

## 文件职责

| 位置 | 职责 |
| --- | --- |
| `scripts/icons/icon-source-list.mjs` | 唯一来源名单 |
| `scripts/icons/custom-icon-sources.mjs` | 自定义图标作者层几何 |
| `scripts/icons/build-icon-assets.mjs` | SVG / PNG / Manifest / Adapter 生成 |
| `AssetsSource/UI/Icons/svg/` | 提交的 SVG Source Master |
| `public/assets/ui/icons/` | 提交的正式 PNG 与 icon-manifest.json |
| `src/ui/icons/icon-manifest.generated.ts` | UiIconId 到 Runtime 路径映射 |
| `src/ui/icons/runtime-icons.generated.tsx` | 现有 JSX 的命名组件兼容层 |
| `src/ui/icons/UiIcon.tsx` | 唯一 PNG Mask 消费组件 |
| `src/ui/icons/icon-types.ts` | 图标接口，不引入第三方 Runtime |

命名组件只属于 Web Adapter；Unity 业务数据应持有 IconId，通过 Library 映射 Sprite，不依赖 React 或 Lucide 名称。

## Unity 导入

PNG 直接复制到 Unity，以 Sprite (2D and UI) 导入、启用 Alpha Is Transparency、关闭 Mip Maps，压缩设置优先保证小尺寸清晰度。统一进入图标 Sprite Atlas，状态通过 Image / USS Tint 表达。

源字体或图标能在浏览器显示，并不表示 Unity Player 已完成清晰度和性能验收；需在实际 UI 缩放、DPI 与目标设备中检查。

## 不属于 UiIcon 的内容

Selected Line、Pager、Divider、Toggle Track / Thumb、Slider、Surface Edge 保持真实 UI 元素；Color Preview、场景截图、建筑缩略图、Noise、RenderTexture 属于相应视觉资产，不烘焙成普通图标。

材质方案和建筑配色方案的文字目录是明确保留设计，不因为本图标管线新增能力而替换成缩略图目录。库存 / 管理资源插画也未纳入本轮任务。

## 生成与检查

```bash
npm run icons:build
npm run icons:check
node scripts/test-tool-usability.mjs
```

生成前先校验全部 Source 名称，非法来源不得在清空输出目录之后才报错。生成结果和 Runtime 代码同轮提交，CI 不靠运行时临时生成弥补缺失资源。

icons:check 校验名单与 Manifest 数量、每项 SVG / PNG 路径、64×64 与 Alpha、包版本和线宽、Generated TS 与 Adapter、第三方许可。自定义检查额外验证作者层 SVG、origin 和实际 PNG 解码，保证不是空白或损坏图像。

新增图标必须进入 Source List 和相同生成器；重要视觉变化须由 GitHub Actions UI Review 生成完整页面截图并实际审图。图标管线成功不能代替页面布局、交互或 Unity Player 验收。
