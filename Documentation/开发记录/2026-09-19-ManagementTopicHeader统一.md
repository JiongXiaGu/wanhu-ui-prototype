# 2026-09-19 Management Topic Header 与配色统一

本轮处理 Management 多页面“标题栏全部黑色、专题缺乏识别、部分数据色仍沿用旧配色”的问题。

## 修改

- Management 新增 `overview / civic / economy / resource / governance / defense` 六类 Topic；
- Management Registry 成为页面 → Topic 的唯一映射来源；
- Header 改为低饱和 Topic Tint + 顶部 2px Accent Line + Bare Icon Accent；
- Body 继续保持统一 Smoked Graphite，不做整页换 Theme；
- Management Root Material 从旧 Context Surface Token 中拆出，改用 Management 专属 Graphite Token；
- Root 不再叠加旧 Noise Texture / Context Blur，减少黑灰磨砂旧感；
- KPI Delta、Overview Chart、Finance 主数据、Inventory 数据条开始消费 Topic Accent；
- Finance 旧青绿色 Expense 改为 Neutral Paper Gray；
- Inventory Resource 使用 Muted Olive 数据 Accent；
- Focus / Selected / Primary 等交互状态仍然服从共享 Control 语义，不被 Topic Accent 替代。

## Topic

- 城市概况：Warm Stone；
- 户籍民生：Muted Clay；
- 财政 / 商贸：Aged Brass Economy；
- 库存：Muted Olive；
- 政策 / 治理：Muted Slate；
- 军务：Muted Cinnabar。

## 验证

- GitHub Actions Visual Review 已退出默认流程；
- 本轮验证为 Build + Topic 映射 / CSS 所有权检查。
