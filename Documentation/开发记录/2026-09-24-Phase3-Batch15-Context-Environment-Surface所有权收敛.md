# Phase 3 Batch 15：Context / Environment Surface 所有权收敛

## 接手与范围

接手 main 为 `d358ce66b582f9d6275e94ccfa088f0ed4bc8aed`。本批只处理 Context / Environment Surface 的材质与内容所有权，不重做左侧 Context Panel 布局、参数控件、Weather 预设、时间/季节轨道或内容配色，也不提前进入 Phase 4 Control 状态治理。

## 盘点结果

`src/main.tsx` 的相关加载顺序为：

1. `gameplay-context-panel.css`：共享几何、参数区与 Footer；
2. `wanhu-theme-tokens.css`：Context Recipe；
3. `weather-mist-glass.css`：Weather Feature 内容变量和内容皮肤；
4. `weather-visual-controls.css` / `weather-art-pass.css`：Weather 内容控件与语义轨道；
5. `wanhu-surface-system.css`：最终共享 Surface Owner。

盘点发现 `wanhu-surface-system.css` 对 `.gameplay-context-panel--weather` 再定义 12 个变量。由于它加载更晚，这一块会覆盖 Weather Feature 本地定义。

其中 5 个材质桥接变量在 Runtime CSS 中没有消费者：

```text
--weather-mist-surface
--weather-mist-card
--weather-mist-card-hover
--weather-edge
--weather-rule
```

其余 7 个属于 Feature 内容层：

```text
--weather-paper
--weather-text
--weather-muted
--weather-faint
--weather-gold
--weather-gold-focus
--weather-gold-soft
```

`weather-paper / text / muted / gold / gold-focus` 有真实内容消费者；`faint / gold-soft` 当前即使消费较少，也仍属于 Weather 内容语义，不应为了 Surface 收敛被搬进共享材质层。

唯一存在数值差异的是 `--weather-faint`：Weather 文件原本写 `#7e8381`，后加载 Surface 最终覆盖为 `#858984`。因此删除覆盖时必须把 Feature 本地值同步到 `#858984`，否则即便当前消费者少，也会悄悄改变该语义的 computed value。

## 处理

Runtime 提交：`315613beba2f0239b193ef12a863147fd97b2d57`。

- 删除 Surface System 中完整的 Weather 专属变量覆盖区块，共 12 个定义；
- `weather-mist-glass.css` 明确为 Weather 内容 Owner，并把 `weather-faint` 固定为 `#858984`；
- Context Root / Header / Body / Footer 仍由 Surface System 直接消费 `--wanhu-surface-context-bg / highlight / shade / header / body / footer / edge / rule / shadow / filter`；
- Material Noise、Backdrop Filter 与 Day/Night Override 没有改值；
- 参数控件、Segmented、Weather Preset、Time / Season Track 的视觉声明均未借机整理。

## 防回退

新增两层 Guard。

第一层退役 5 个 Context / Environment 材质桥接名：任何 Runtime CSS 再定义或引用都会失败，并报告完整变量名和次数。

第二层保护 Weather Feature 内容所有权：当 `src/ui/wanhu-surface-system.css` 再次定义或引用以下 7 个内容变量时失败，而 `weather-mist-glass.css` 中继续允许：

```text
--weather-paper / --weather-text / --weather-muted / --weather-faint
--weather-gold / --weather-gold-focus / --weather-gold-soft
```

测试覆盖完整变量名边界，避免把带前后缀的其它自定义属性误判为旧 Bridge。

## 验证记录

Build #1541，Run `36009252490` 全部通过：

- 117 tests / 117 pass / 0 fail；
- Runtime CSS scanned: 64；
- Legacy palette debt files: 0；
- Retired Context / Environment Surface aliases guarded: 5；
- Weather content variables protected from Surface ownership: 7；
- Visual governance ratchet: PASS；
- Building Selection / Scheme / Placement：11 checks PASS；
- World Utility / Demolition：8 checks PASS；
- `tsc -b && vite build` 通过。

UI Review #484，Run `36009252514` 全部通过。下载并实际查看：

- `operation-hints-review` Artifact `10812007162`；
- `operation-hints-weather.png`；
- `tool-usability-report.json`：97 checks、`errors: []`。

实际截图中 Environment Context Root、Header / Body / Footer 分层、Noise / Blur、Weather Preset Selected、参数 Slider、时间/季节轨道和右下 Operation Hints 均未发现本批引入的视觉变化。

本批没有做逐像素 Diff，也不把 Web Playwright Review 解释为 Unity 6.6 Player、URP Blur 性能或最终设备效果验证。

## 下一批

继续 Phase 3，优先盘点 Blocking / Global Space Surface。重点核对 Pause 与 Settings / Load / Save / New Game 的 Root、Backdrop、Header、Footer、Edge、Shadow、Filter 是否仍存在重复 Owner 或被后加载覆盖的历史配方。Warning / Danger 与基础 Control 状态继续保持现状，留到对应阶段处理。
