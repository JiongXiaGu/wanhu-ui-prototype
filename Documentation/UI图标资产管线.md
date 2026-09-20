# UI 图标资产管线

> Web Prototype 与 Unity UI Toolkit 共用的正式 UI Icon 资产规范。
>
> **SVG 是 Source Master；64×64 PNG 是 Web 与 Unity 共用的 Runtime Asset。**

## 1. 当前状态

图标资产管线已经完成 Web Runtime 落地。

当前仓库固定拥有：

- 104 个 Source SVG：`AssetsSource/UI/Icons/svg/`；
- 104 个 Runtime PNG：`public/assets/ui/icons/`；
- `public/assets/ui/icons/icon-manifest.json`；
- `src/ui/icons/icon-manifest.generated.ts`；
- `src/ui/icons/runtime-icons.generated.tsx`；
- `src/ui/icons/UiIcon.tsx`；
- `src/ui/icons/icon-types.ts`；
- `src/ui/icons/ui-icon.css`；
- Lucide 第三方许可：`AssetsSource/UI/Icons/LUCIDE_LICENSE.txt`。

Source Generator 固定使用：

```text
lucide-react 1.47.0
sharp        0.35.4
```

`src/` Runtime 已禁止直接 import `lucide-react`，也禁止重新出现历史 `LucideIcon` 类型名。

Lucide 只允许存在于 `scripts/icons/` 的 Source Generator。

## 2. 正式资产链

```text
Lucide / 自研 SVG
        ↓
固定 SVG Source Master
        ↓
64×64 white RGBA PNG
        ↓
UiIconId + Manifest
      ↙             ↘
Web Runtime          Unity Runtime
PNG Alpha Mask       Sprite + Tint
```

Unity 不需要再次从 SVG 转换 PNG。

`public/assets/ui/icons/*.png` 就是未来 Unity 直接复制使用的正式 Icon Runtime 资产。

## 3. PNG 规格

普通单色 UI Icon 固定：

```text
Canvas       64 × 64
Format       PNG RGBA
Background   Transparent
Icon Color   #FFFFFF
Stroke       1.7
Runtime      Web + Unity 共用同一文件
```

规则：

- 不为 12 / 16 / 20 / 24 / 32px 分别生成多份文件；
- 显示尺寸属于 Component Geometry；
- Normal / Hover / Selected / Disabled / Warning / Danger 不烘焙进图片；
- PNG 不包含背景板、Glow、Shadow；
- Web 使用 `currentColor`；
- Unity 使用 Sprite / Image Tint；
- 48～64 logical px 以上的大型图形应归 Illustration / Preview Asset，不扩张普通 UiIcon。

## 4. Stroke 决策

历史 Web SVG 曾使用约：

```text
1.55 / 1.6 / 1.7 / 1.78 / 1.8 / 默认 2.0
```

PNG Pilot 已完成：

- ColorToolDock：20px；
- LeftContextPanel：17～19px；
- Material Workspace Header / Rail：15～18px；
- Select / Dialog Chevron：12～14px。

GitHub UI Review 与人工截图审查均通过，因此：

> **Standard UiIcon Stroke = 1.7 已冻结。**

以后不要按页面重新生成不同 stroke 的同一图标。

## 5. 目录

```text
AssetsSource/
└ UI/
   └ Icons/
      ├ LUCIDE_LICENSE.txt
      └ svg/
         └ *.svg

public/
└ assets/
   └ ui/
      └ icons/
         ├ *.png
         └ icon-manifest.json

src/
└ ui/
   └ icons/
      ├ UiIcon.tsx
      ├ icon-types.ts
      ├ ui-icon.css
      ├ icon-manifest.generated.ts
      └ runtime-icons.generated.tsx

scripts/
└ icons/
   ├ icon-source-list.mjs
   ├ build-icon-assets.mjs
   ├ check-icon-assets.mjs
   └ migrate-runtime-icons.mjs
```

`runtime-icons.generated.tsx` 是 Web 兼容 Adapter：保留已有 JSX 的命名组件写法，但这些组件内部已经渲染 PNG Mask，不是 Lucide / SVG Runtime。

## 6. UiIconId 与 Web Adapter

Canonical Asset Contract 是 `UiIconId`：

```ts
icon: UiIconId
```

新 Shared / Business API 优先直接使用 `UiIconId`。

为了避免一次性机械重写所有 JSX，现有页面允许通过：

```text
runtime-icons.generated.tsx
→ createUiIconComponent(...)
→ UiIcon
→ PNG Mask
```

继续使用命名组件形式。

这只是 Web 兼容层，不改变资产所有权。Unity 迁移不复制这个 React Adapter。

## 7. Web Runtime

Web 的 `UiIcon`：

```text
64×64 white PNG
→ CSS mask-image
→ background-color: currentColor
```

因此：

- 同一 PNG 可复用所有状态色；
- 不需要 CSS filter 染色；
- Hover / Selected / Disabled 继续由组件的 `color` 状态控制；
- Runtime 不产生 Lucide inline SVG。

## 8. Unity Runtime

Unity 直接复制：

```text
public/assets/ui/icons/*.png
```

建议 Import：

```text
Texture Type          Sprite (2D and UI)
Alpha Is Transparency On
Mip Maps              Off
Compression           优先保证小尺寸清晰度
```

再统一进入 UI Icon Sprite Atlas。

Unity 业务层建议：

```text
UiIconId / IconId
→ IconLibrary
→ Sprite
→ Image Tint
```

不要让 Unity C# 依赖 Lucide 名称。

## 9. 不属于 UiIcon 的内容

以下保持真实 UI Element / Texture / RenderTexture：

- Selected Line；
- Pager Dot / Pager Bar；
- Divider；
- Toggle Track / Thumb；
- Slider Track / Thumb；
- Surface Edge；
- Color Preview；
- 建筑 / 道路 / 桥梁缩略图；
- 场景截图；
- RenderTexture；
- Noise Texture；
- 大型 Illustration。

不能因为“PNG 化”把结构性 UI Element 烘焙成图片。

## 10. 生成与检查

重新生成：

```bash
npm run icons:build
```

资产检查：

```bash
npm run icons:check
```

`icons:check` 必须验证：

- Source List / Manifest 数量一致；
- 104 个 SVG / PNG 均存在；
- PNG 全部 64×64；
- PNG 有 Alpha；
- Stroke / Source Package 元数据正确；
- Generated TS Manifest 存在；
- PNG Runtime Component Adapter 存在；
- 第三方 License 存在。

GitHub Build 顺序：

```text
icons:check
→ audit:unity
→ TypeScript / Vite Build
```

## 11. CI Freeze

当前已经进入 Freeze：

- `src/` 出现 `lucide-react` → Audit Failure；
- `src/` 出现历史 `LucideIcon` → Audit Failure；
- PNG / SVG / Manifest 缺失或尺寸不符 → Build Failure；
- 新图标必须先进入 Source List，再重新生成资产；
- 重要图标视觉变化必须走 GitHub UI Review。

## 12. 当前迁移结论

已完成：

- Phase I — Icon Contract；
- Phase II — Asset Generator；
- Phase III — PNG Pilot；
- Phase IV — Shared Contract 基础切换；
- Phase V — Runtime PNG Migration；
- Phase VII — CI Freeze。

Phase VI 的历史 `svg` CSS selector 继续按“确认无命中再删除”的原则清理，不为了代码漂亮冒险破坏非 Icon SVG / Review 结构。

下一阶段已经可以进入 Unity Handoff：

1. 复制 PNG；
2. 设置 Sprite Import；
3. 建立 IconId → Sprite Library；
4. 建 UI Icon Sprite Atlas；
5. 用 Unity Tint 复现 Web 状态色。
