# UI 图标资产管线

> 目的：冻结 Web Prototype 与 Unity UI Toolkit 共用的正式 UI Icon 资产边界。
>
> 核心原则：**SVG 是 Source Master；PNG 是 Web 与 Unity 共用的 Runtime Asset。**

---

## 1. 当前事实

当前 Web Prototype 的功能图标主要来自 `lucide-react`：

```tsx
import { Palette, Lightbulb, X } from 'lucide-react';
```

浏览器最终渲染为 inline SVG，但仓库当前没有把这些图标保存成正式 `.svg` / `.png` 资产。

迁移前不能继续让业务组件依赖：

```text
Lucide React Component
→ SVG DOM
```

正式目标：

```text
SVG Source Master
        ↓
64×64 PNG Runtime Asset
        ↓
UiIconId / Manifest
      ↙          ↘
Web Prototype    Unity UI Toolkit
PNG Mask         Sprite + Tint
```

---

## 2. 正式资产规则

普通单色 UI Icon 固定：

```text
Canvas       64 × 64
Format       PNG RGBA
Background   Transparent
Icon Color   #FFFFFF
Source       SVG
Runtime      PNG
```

规则：

- 普通 Icon 只维护一张 64×64 PNG，不按 12 / 16 / 20 / 24 / 32 px 复制多份；
- 实际显示尺寸由 UI Component 决定；
- PNG 不烘焙 Normal / Hover / Selected / Disabled 颜色；
- PNG 不包含背景板、Glow、Shadow；
- 状态颜色由 Web `currentColor` / Unity Tint 表达；
- 复杂插画、建筑缩略图、RenderTexture、材质 Preview 不进入 UiIcon 管线；
- 真正需要 48～64 logical px 以上的大型图形应归 Illustration / Preview Asset，不扩张普通 UiIcon 规格。

---

## 3. Stroke 基线

当前 Web 对 Lucide SVG 存在多种 `stroke-width`：

```text
约 1.55 / 1.6 / 1.7 / 1.78 / 1.8 / 默认 2.0
```

PNG 生成后无法再由 CSS 动态修改 stroke。

迁移阶段先以：

```text
Standard UiIcon Stroke = 1.7
```

作为 Pilot 基线。

只有完成 ColorTool / LeftContext / Workspace / Dialog 四类代表场景的 GitHub UI Review 后，才把 1.7 冻结成全量生产规范。

禁止在没有视觉审查的情况下直接把全部 Lucide 图标统一 Rasterize。

---

## 4. 目录规划

Source 与 Runtime 分离：

```text
AssetsSource/
└ UI/
   └ Icons/
      └ svg/
         ├ palette.svg
         ├ lightbulb.svg
         ├ arrow-left.svg
         └ ...

public/
└ assets/
   └ ui/
      └ icons/
         ├ palette.png
         ├ lightbulb.png
         ├ arrow-left.png
         └ ...

src/
└ ui/
   └ icons/
      ├ UiIcon.tsx
      ├ ui-icon.css
      ├ icon-types.ts
      └ icon-manifest.generated.ts

scripts/
└ icons/
   ├ collect-icons.mjs
   ├ export-source-svg.mjs
   └ build-icon-png.mjs
```

约束：

- `AssetsSource/UI/Icons/svg/` 不进入 Web Runtime；
- `public/assets/ui/icons/` 是 Web 与 Unity 共用的正式 Runtime 文件集合；
- Unity 迁移时直接复制 Runtime PNG，不重新从 React / DOM 提取图标；
- Source SVG 必须提交 Git，避免未来依赖包升级导致同名图标外形漂移。

---

## 5. UiIconId

共享 UI 不再长期暴露 `LucideIcon`。

目标：

```ts
type UiIconId =
  | 'palette'
  | 'lightbulb'
  | 'layers-3'
  | 'arrow-left'
  | 'close';
```

业务配置只持有：

```ts
icon: UiIconId
```

禁止最终结构：

```ts
icon: LucideIcon
```

原因：

- Web 与 Unity 共享语义 ID；
- 图标美术资源可替换而不改变业务代码；
- Unity 不依赖 Lucide 命名或 React Component；
- Manifest 可以直接生成 Unity Icon Library。

---

## 6. Web Runtime

Web 正式 Runtime 读取 PNG。

单色 Icon 推荐使用 Alpha Mask：

```text
64×64 white PNG
→ mask-image
→ background: currentColor
```

这样保留现有状态语言：

```text
Normal
Hover
Selected
Disabled
Warning
Danger
```

而不生成多份不同颜色 PNG。

Web 不推荐通过 CSS `filter` 给 `<img>` 做状态染色。

目标组件：

```tsx
<UiIcon icon="palette" size={20} />
```

组件尺寸负责 Layout；PNG 只负责 Alpha Shape。

---

## 7. Unity Runtime

Unity 直接复用同一批：

```text
public/assets/ui/icons/*.png
```

建议 Import：

```text
Texture Type          Sprite (2D and UI)
Alpha Is Transparency On
Mip Maps              Off
Compression           以小图标清晰度为优先
```

正式项目再统一进入 UI Icon Sprite Atlas。

状态颜色使用：

```text
Image Tint / USS Tint
```

不为 Hover / Active / Disabled 复制 Sprite。

---

## 8. 不属于 UiIcon 的内容

以下继续使用真实 Element / CSS / USS / Sprite 语义，不转换成 PNG Icon：

- Selected Line；
- Pager Dot / Pager Bar；
- Divider；
- Toggle Track / Thumb；
- Slider Track / Thumb；
- Surface Edge；
- Color Preview；
- 建筑 / 道路 / 桥梁真实缩略图；
- 场景截图；
- RenderTexture；
- Noise Texture；
- 大型 Illustration。

不要因为“PNG 化”把结构性 UI Element 烘焙成图片。

---

## 9. 制作阶段

### Phase I — Icon Contract

完成：

1. 统计实际 Lucide 图形 Icon；
2. 建立 `UiIconId`；
3. 建立 Manifest；
4. 修正 Audit 中类型 import 被误计为图标的问题；
5. 写入正式目录 / 命名 / 资产规格。

本阶段不改变现有 UI。

### Phase II — Asset Generator

完成：

1. 从当前实际使用 Icon 导出 SVG Source；
2. 固定 Source SVG；
3. SVG → 64×64 RGBA PNG；
4. 生成 Manifest；
5. 校验尺寸、透明通道、缺失资产、重复命名。

本阶段不改变现有 UI。

### Phase III — PNG Pilot

只迁代表性场景：

1. ColorToolDock：20px / Hover / Active；
2. LeftContextPanel：Heading / Back / Close；
3. Workspace：Header 18px / Rail 16px / Selected；
4. Select / Dialog Chevron：12～14px / Rotate。

检查：

- 12～14px 是否发糊；
- 16～20px 线宽是否稳定；
- Hover / Selected Tint；
- Chevron Rotate；
- 1920×1080 构图是否变化；
- 白天 / 夜景可读性。

Pilot 通过后才能冻结 Stroke 与全量迁移。

### Phase IV — Shared Contract

把 Shared Component API：

```text
LucideIcon
```

迁为：

```text
UiIconId
```

优先：

- LeftContextPanel；
- PlacementContextPanel；
- Bottom Command / PlacementActionBar；
- ContextUtilityToolbar；
- GameplayHUD；
- Workspace Definition。

### Phase V — Runtime Migration

分批把业务 JSX 的 Lucide Component 替换为 `UiIcon`。

每一批都运行：

```bash
npm run audit:unity
npm run build
```

重要视觉批次必须走 GitHub UI Review。

### Phase VI — CSS Cleanup

清理：

```css
button svg
.workspace-title > svg
... svg { stroke-width: ... }
```

改为共享 `.ui-icon` Contract。

同时删除已经失效的历史 SVG Selector。

### Phase VII — Freeze

全部 Runtime 完成 PNG 化后：

- `src/` 禁止新的 `lucide-react` Runtime import；
- Lucide 只允许存在于 Source Export Tool；
- Runtime 缺少 PNG / Manifest Entry 时 CI Fail；
- Web UI Review 只审查正式 PNG Runtime 结果。

### Phase VIII — Unity Handoff

输出：

- Runtime PNG；
- Manifest；
- UiIconId 对照；
- Unity Import 规则；
- Sprite Atlas 建议；
- Web → Unity Icon 迁移清单。

---

## 10. CI / Audit

迁移期间分两阶段：

### 过渡期

允许 Runtime 继续存在 Lucide，但 Audit 必须：

- 正确统计真实图形 Icon；
- 不把 `type LucideIcon` 算为图形资产；
- 输出仍有多少 Runtime 文件直接依赖 `lucide-react`。

### Freeze 后

升级为 Error：

- Runtime 新增 `lucide-react`；
- Manifest 缺项；
- PNG 缺失；
- PNG 非 64×64；
- PNG 没有 Alpha；
- 业务层直接引用资产路径而绕过 `UiIconId`。

---

## 11. 当前阶段结论

当前仓库还处于 **Phase I 前 / Lucide Runtime** 状态。

当前决定已经冻结：

- SVG = Source Master；
- PNG = Web + Unity Runtime；
- 普通 Icon = 64×64 RGBA；
- 白色透明底；
- 状态颜色运行时 Tint；
- `UiIconId` 是 Shared / Business Contract；
- 先 Pilot，再全量替换；
- 不为迁移一次性重写 100+ 图标。

下一步应先完成 Phase I + Phase II，再进入 PNG Pilot。
