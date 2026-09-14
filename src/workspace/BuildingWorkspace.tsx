import { useMemo, useRef, useState, type WheelEvent } from 'react';
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

const CATEGORY_PAGE_SIZE = 5;
const CONTENT_PAGE_SIZE = 6;
const CONTENT_PAGER_WINDOW = 5;
const WHEEL_THRESHOLD = 72;
const WHEEL_LOCK_MS = 220;

const contextFilters = ['全部', '庑殿', '歇山', '悬山', '硬山', '攒尖', '卷棚', '其他'] as const;
const directContextFilters = new Set<string>(contextFilters.slice(1, -1));

const primaryCategories = [
  { key: '全部', label: '全部建筑', icon: Grid2X2 },
  { key: '塔', label: '塔', icon: Landmark },
  { key: '殿', label: '殿', icon: Building2 },
  { key: '楼阁', label: '楼阁', icon: PanelsTopLeft },
  { key: '屋舍', label: '屋舍', icon: House },
  { key: '门', label: '门', icon: DoorOpen },
  { key: '廊榭', label: '廊榭', icon: Waves },
  { key: '亭', label: '亭', icon: House },
  { key: '牌坊', label: '牌坊', icon: PanelsTopLeft },
  { key: '特殊', label: '特殊', icon: Sparkles },
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

interface WheelPagingState {
  accumulated: number;
  lockedUntil: number;
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
  const [filter, setFilter] = useState<(typeof contextFilters)[number]>('全部');
  const [categoryPage, setCategoryPage] = useState(0);
  const [contentPage, setContentPage] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoryWheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });
  const contentWheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });

  const categoryPageCount = Math.ceil(primaryCategories.length / CATEGORY_PAGE_SIZE);
  const visibleCategories = primaryCategories.slice(categoryPage * CATEGORY_PAGE_SIZE, (categoryPage + 1) * CATEGORY_PAGE_SIZE);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

  const visibleCards = useMemo(
    () => buildingCards.filter((item) => {
      const matchesCategory = primary === '全部' || item.form === primary;
      const matchesFilter = filter === '全部'
        || item.filter === filter
        || (filter === '其他' && !directContextFilters.has(item.filter));
      const matchesSearch = !normalizedQuery || `${item.name} ${item.meta} ${item.detail}`.toLocaleLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesFilter && matchesSearch;
    }),
    [primary, filter, normalizedQuery],
  );

  const contentPageCount = Math.max(1, Math.ceil(visibleCards.length / CONTENT_PAGE_SIZE));
  const pageCards = visibleCards.slice(contentPage * CONTENT_PAGE_SIZE, (contentPage + 1) * CONTENT_PAGE_SIZE);
  const pagerPages = getPagerWindow(contentPageCount, contentPage);

  function runWheelPaging(
    event: WheelEvent<HTMLElement>,
    pageCount: number,
    wheelState: { current: WheelPagingState },
    setPage: (updater: (page: number) => number) => void,
  ) {
    if (pageCount <= 1) return;

    const now = performance.now();
    const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(dominantDelta) < 1) return;

    event.preventDefault();
    if (now < wheelState.current.lockedUntil) return;

    wheelState.current.accumulated += dominantDelta;
    if (Math.abs(wheelState.current.accumulated) < WHEEL_THRESHOLD) return;

    const direction = wheelState.current.accumulated > 0 ? 1 : -1;
    wheelState.current.accumulated = 0;
    wheelState.current.lockedUntil = now + WHEEL_LOCK_MS;
    setPage((page) => Math.min(pageCount - 1, Math.max(0, page + direction)));
  }

  function selectPrimary(next: PrimaryCategory) {
    setPrimary(next);
    setContentPage(0);
  }

  function selectFilter(next: (typeof contextFilters)[number]) {
    setFilter(next);
    setContentPage(0);
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
        <nav
          className="workspace-primary-rail"
          aria-label="建筑形制"
          onWheel={(event) => runWheelPaging(event, categoryPageCount, categoryWheel, setCategoryPage)}
        >
          <div className="workspace-primary-rail__content">
            {categoryPageCount > 1 && (
              <div className="workspace-rail-pager" aria-label="建筑分类组">
                {Array.from({ length: categoryPageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={categoryPage === index ? 'is-active' : ''}
                    aria-label={`切换到第 ${index + 1} 组建筑分类`}
                    onClick={() => setCategoryPage(index)}
                  >
                    <span />
                  </button>
                ))}
              </div>
            )}

            <div className="workspace-primary-rail__page" key={categoryPage}>
              {visibleCategories.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={primary === key ? 'is-active' : ''}
                  onClick={() => selectPrimary(key)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="workspace-catalog">
          <nav className="workspace-context-filter" aria-label="当前建筑筛选">
            <div className="workspace-context-filter__scroll">
              {contextFilters.map((item) => (
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

          <div
            className="workspace-content-stage"
            onWheel={(event) => runWheelPaging(event, contentPageCount, contentWheel, setContentPage)}
          >
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
