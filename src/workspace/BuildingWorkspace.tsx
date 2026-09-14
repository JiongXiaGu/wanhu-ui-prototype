import { useMemo, useState } from 'react';
import {
  Building2,
  DoorOpen,
  Grid2X2,
  House,
  Landmark,
  PanelsTopLeft,
  Search,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';

const CATEGORY_PAGE_SIZE = 4;
const CONTENT_PAGE_SIZE = 6;
const CONTENT_PAGER_WINDOW = 5;

const primaryCategories = [
  { key: '全部', icon: Grid2X2, filters: ['全部', '庑殿', '歇山', '悬山', '硬山', '攒尖', '卷棚', '其他'] },
  { key: '塔', icon: Landmark, filters: ['全部', '攒尖', '楼阁式', '密檐', '覆钵', '其他'] },
  { key: '殿', icon: Building2, filters: ['全部', '庑殿', '歇山', '悬山', '硬山', '卷棚'] },
  { key: '楼阁', icon: PanelsTopLeft, filters: ['全部', '重檐', '歇山', '庑殿', '攒尖', '其他'] },
  { key: '屋舍', icon: House, filters: ['全部', '悬山', '硬山', '卷棚', '歇山'] },
  { key: '门', icon: DoorOpen, filters: ['全部', '门楼', '歇山', '硬山', '悬山', '牌楼'] },
  { key: '廊榭', icon: Waves, filters: ['全部', '卷棚', '歇山', '悬山', '平顶'] },
  { key: '亭', icon: House, filters: ['全部', '攒尖', '歇山', '卷棚', '其他'] },
  { key: '牌坊', icon: PanelsTopLeft, filters: ['全部', '冲天式', '楼式', '门式', '其他'] },
  { key: '特殊', icon: Sparkles, filters: ['全部', '工程', '水工', '城防', '祭祀', '其他'] },
] as const;

type PrimaryCategory = (typeof primaryCategories)[number]['key'];

const buildingCards = [
  { name: '八角楼阁式木塔', form: '塔', filter: '楼阁式', meta: '楼阁式 · 七层', detail: '城市地标 / 寺观', tone: 'tower' },
  { name: '密檐砖塔', form: '塔', filter: '密檐', meta: '密檐 · 九层', detail: '寺观 / 地标', tone: 'pagoda' },
  { name: '五层攒尖木塔', form: '塔', filter: '攒尖', meta: '攒尖 · 五层', detail: '寺观 / 地标', tone: 'special' },
  { name: '重檐庑殿大殿', form: '殿', filter: '庑殿', meta: '庑殿 · 重檐', detail: '礼制 / 公共建筑', tone: 'hall' },
  { name: '单檐歇山正殿', form: '殿', filter: '歇山', meta: '歇山 · 五开间', detail: '礼制建筑', tone: 'pavilion' },
  { name: '悬山配殿', form: '殿', filter: '悬山', meta: '悬山 · 三开间', detail: '附属建筑', tone: 'house' },
  { name: '重檐楼阁', form: '楼阁', filter: '重檐', meta: '重檐 · 双层', detail: '公共建筑', tone: 'pavilion' },
  { name: '临街望楼', form: '楼阁', filter: '歇山', meta: '歇山 · 双层', detail: '城市建筑', tone: 'gate' },
  { name: '三开间民居', form: '屋舍', filter: '硬山', meta: '硬山 · 三开间', detail: '住宅', tone: 'house' },
  { name: '五开间厅堂', form: '屋舍', filter: '悬山', meta: '悬山 · 五开间', detail: '住宅 / 会客', tone: 'tower' },
  { name: '卷棚厢房', form: '屋舍', filter: '卷棚', meta: '卷棚 · 三开间', detail: '附属房屋', tone: 'waterside' },
  { name: '城门楼阁', form: '门', filter: '门楼', meta: '门楼 · 城防', detail: '城门建筑', tone: 'gate' },
  { name: '歇山院门', form: '门', filter: '歇山', meta: '歇山 · 院门', detail: '院落入口', tone: 'hall' },
  { name: '临水榭台', form: '廊榭', filter: '卷棚', meta: '卷棚 · 水岸', detail: '园林建筑', tone: 'waterside' },
  { name: '曲折游廊', form: '廊榭', filter: '悬山', meta: '悬山 · 连廊', detail: '园林建筑', tone: 'pagoda' },
  { name: '四角攒尖亭', form: '亭', filter: '攒尖', meta: '攒尖 · 四角', detail: '园林建筑', tone: 'special' },
  { name: '六角水亭', form: '亭', filter: '攒尖', meta: '攒尖 · 六角', detail: '水岸建筑', tone: 'waterside' },
  { name: '三间四柱牌坊', form: '牌坊', filter: '楼式', meta: '楼式 · 三间', detail: '街道节点', tone: 'gate' },
  { name: '冲天式石牌坊', form: '牌坊', filter: '冲天式', meta: '冲天式 · 石构', detail: '礼制 / 地标', tone: 'pagoda' },
  { name: '观象台', form: '特殊', filter: '工程', meta: '工程 · 高台', detail: '特殊工程', tone: 'special' },
] as const;

interface BuildingWorkspaceProps {
  onClose: () => void;
  onSelectBuilding: () => void;
}

function getPagerWindow(pageCount: number, currentPage: number) {
  if (pageCount <= CONTENT_PAGER_WINDOW) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const half = Math.floor(CONTENT_PAGER_WINDOW / 2);
  const start = Math.min(Math.max(currentPage - half, 0), pageCount - CONTENT_PAGER_WINDOW);
  return Array.from({ length: CONTENT_PAGER_WINDOW }, (_, index) => start + index);
}

export function BuildingWorkspace({ onClose, onSelectBuilding }: BuildingWorkspaceProps) {
  const [primary, setPrimary] = useState<PrimaryCategory>('全部');
  const [filter, setFilter] = useState('全部');
  const [categoryPage, setCategoryPage] = useState(0);
  const [contentPage, setContentPage] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allCategory = primaryCategories[0];
  const pageableCategories = primaryCategories.slice(1);
  const categoryPageCount = Math.ceil(pageableCategories.length / CATEGORY_PAGE_SIZE);
  const visibleCategories = pageableCategories.slice(categoryPage * CATEGORY_PAGE_SIZE, (categoryPage + 1) * CATEGORY_PAGE_SIZE);
  const activeCategory = primaryCategories.find((item) => item.key === primary) ?? allCategory;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

  const visibleCards = useMemo(
    () => buildingCards.filter((item) => {
      const matchesCategory = primary === '全部' || item.form === primary;
      const matchesFilter = filter === '全部' || item.filter === filter;
      const matchesSearch = !normalizedQuery || `${item.name} ${item.meta} ${item.detail}`.toLocaleLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesFilter && matchesSearch;
    }),
    [primary, filter, normalizedQuery],
  );

  const contentPageCount = Math.max(1, Math.ceil(visibleCards.length / CONTENT_PAGE_SIZE));
  const pageCards = visibleCards.slice(contentPage * CONTENT_PAGE_SIZE, (contentPage + 1) * CONTENT_PAGE_SIZE);
  const pagerPages = getPagerWindow(contentPageCount, contentPage);

  function selectPrimary(next: PrimaryCategory) {
    setPrimary(next);
    setFilter('全部');
    setContentPage(0);
  }

  function selectFilter(next: string) {
    setFilter(next);
    setContentPage(0);
  }

  function selectCategoryPage(nextPage: number) {
    setCategoryPage(nextPage);
    const firstCategory = pageableCategories[nextPage * CATEGORY_PAGE_SIZE];
    if (firstCategory) selectPrimary(firstCategory.key);
  }

  function updateSearch(next: string) {
    setSearchQuery(next);
    setContentPage(0);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
    setContentPage(0);
  }

  return (
    <section className="workspace workspace--building">
      <header className="workspace-header">
        <div className="workspace-title">
          <Building2 size={18} aria-hidden="true" />
          <b>建筑</b>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="关闭建筑目录"><X /></button>
      </header>

      <div className="workspace-body">
        <nav className="workspace-primary-rail" aria-label="建筑形制">
          <button
            type="button"
            className={`workspace-primary-rail__all ${primary === allCategory.key ? 'is-active' : ''}`}
            onClick={() => selectPrimary(allCategory.key)}
          >
            <allCategory.icon size={16} />
            <span>全部建筑</span>
          </button>
          <div className="workspace-primary-rail__divider" />

          <div className="workspace-primary-rail__content">
            {categoryPageCount > 1 && (
              <div className="workspace-rail-pager" aria-label="建筑分类组">
                {Array.from({ length: categoryPageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={categoryPage === index ? 'is-active' : ''}
                    aria-label={`切换到第 ${index + 1} 组建筑分类`}
                    onClick={() => selectCategoryPage(index)}
                  >
                    <span />
                  </button>
                ))}
              </div>
            )}

            <div className="workspace-primary-rail__page" key={categoryPage}>
              {visibleCategories.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={primary === key ? 'is-active' : ''}
                  onClick={() => selectPrimary(key)}
                >
                  <Icon size={16} />
                  <span>{key}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="workspace-catalog">
          <nav className="workspace-context-filter" aria-label="当前建筑筛选">
            <div className="workspace-context-filter__scroll">
              {activeCategory.filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'is-active' : ''}
                  onClick={() => selectFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={`workspace-search ${searchOpen ? 'is-open' : ''}`}>
              {!searchOpen ? (
                <button
                  type="button"
                  className="workspace-search__trigger"
                  onClick={() => setSearchOpen(true)}
                  aria-label="搜索建筑"
                >
                  <Search size={14} />
                  <span>搜索</span>
                </button>
              ) : (
                <div className="workspace-search__field">
                  <Search size={14} aria-hidden="true" />
                  <input
                    autoFocus
                    value={searchQuery}
                    placeholder="搜索建筑…"
                    aria-label="搜索建筑"
                    onChange={(event) => updateSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') closeSearch();
                    }}
                  />
                  <button type="button" onClick={closeSearch} aria-label="关闭搜索"><X size={12} /></button>
                </div>
              )}
            </div>
          </nav>

          <div className="workspace-content-stage">
            <div className="workspace-content-grid" key={`${primary}-${filter}-${searchQuery}-${contentPage}`}>
              {pageCards.map(({ name, meta, detail, tone }) => (
                <button
                  type="button"
                  className="building-card"
                  key={name}
                  title={`${meta} · ${detail}`}
                  onClick={onSelectBuilding}
                >
                  <div className={`card-thumb card-thumb--${tone}`} aria-hidden="true" />
                  <div className="building-card__copy">
                    <b>{name}</b>
                    <span>{meta}</span>
                  </div>
                </button>
              ))}

              {pageCards.length === 0 && (
                <div className="workspace-empty">没有符合条件的建筑</div>
              )}
            </div>
          </div>

          {contentPageCount > 1 && (
            <nav className="workspace-content-pager" aria-label="建筑内容分页">
              {pagerPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={contentPage === page ? 'is-active' : ''}
                  aria-label={`切换到第 ${page + 1} 组建筑`}
                  onClick={() => setContentPage(page)}
                >
                  <span />
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
