import { useMemo, useRef, useState, type WheelEvent } from 'react';
import { Search, X } from 'lucide-react';
import type { DesignWorkspaceDefinition, DesignWorkspaceItem } from './design-workspace-model';

const CATEGORY_PAGE_SIZE = 6;
const CONTENT_PAGE_SIZE = 8;
const CONTENT_PAGER_WINDOW = 5;
const WHEEL_THRESHOLD = 72;
const WHEEL_LOCK_MS = 220;

interface DesignWorkspaceProps {
  definition: DesignWorkspaceDefinition;
  onClose: () => void;
  onSelectItem?: (item: DesignWorkspaceItem) => void;
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

export function DesignWorkspace({ definition, onClose, onSelectItem }: DesignWorkspaceProps) {
  const defaultPrimary = definition.primaryCategories[0]?.key ?? 'all';
  const defaultFilter = definition.contextFilters[0]?.key ?? 'all';
  const [primary, setPrimary] = useState(defaultPrimary);
  const [filter, setFilter] = useState(defaultFilter);
  const [categoryPage, setCategoryPage] = useState(0);
  const [contentPage, setContentPage] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const categoryWheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });
  const contentWheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });

  const categoryPageCount = Math.max(1, Math.ceil(definition.primaryCategories.length / CATEGORY_PAGE_SIZE));
  const visibleCategories = definition.primaryCategories.slice(
    categoryPage * CATEGORY_PAGE_SIZE,
    (categoryPage + 1) * CATEGORY_PAGE_SIZE,
  );
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

  const visibleItems = useMemo(
    () => definition.items.filter((item) => {
      const matchesCategory = primary === defaultPrimary || item.primary === primary;
      const matchesFilter = filter === defaultFilter || item.filters.includes(filter);
      const matchesSearch = !normalizedQuery
        || `${item.name} ${item.meta} ${item.detail}`.toLocaleLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesFilter && matchesSearch;
    }),
    [defaultFilter, defaultPrimary, definition.items, filter, normalizedQuery, primary],
  );

  const contentPageCount = Math.max(1, Math.ceil(visibleItems.length / CONTENT_PAGE_SIZE));
  const safeContentPage = Math.min(contentPage, contentPageCount - 1);
  const pageItems = visibleItems.slice(safeContentPage * CONTENT_PAGE_SIZE, (safeContentPage + 1) * CONTENT_PAGE_SIZE);
  const pagerPages = getPagerWindow(contentPageCount, safeContentPage);
  const HeaderIcon = definition.icon;
  const buildingCompatibilityClass = definition.id === 'building' ? 'workspace--building' : '';

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

  function resetItemSelection() {
    setSelectedItemId(null);
    setContentPage(0);
  }

  function selectPrimary(next: string) {
    setPrimary(next);
    resetItemSelection();
  }

  function selectFilter(next: string) {
    setFilter(next);
    resetItemSelection();
  }

  function updateSearch(next: string) {
    setSearchQuery(next);
    resetItemSelection();
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
    resetItemSelection();
  }

  function selectItem(item: DesignWorkspaceItem) {
    setSelectedItemId(item.id);
    onSelectItem?.(item);
  }

  return (
    <section className={`workspace workspace--design ${buildingCompatibilityClass}`} data-design-category={definition.id}>
      <header className="workspace-header">
        <div className="workspace-title">
          <HeaderIcon size={18} aria-hidden="true" />
          <b>{definition.title}</b>
        </div>
        <button className="icon-button" onClick={onClose} aria-label={`关闭${definition.title}目录`}><X /></button>
      </header>

      <div className="workspace-body">
        <nav
          className="workspace-primary-rail design-workspace__rail"
          aria-label={definition.railLabel}
          onWheel={(event) => runWheelPaging(event, categoryPageCount, categoryWheel, setCategoryPage)}
        >
          <div className="workspace-primary-rail__content">
            {categoryPageCount > 1 && (
              <div className="workspace-rail-pager" aria-label={`${definition.title}分类组`}>
                {Array.from({ length: categoryPageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={categoryPage === index ? 'is-active' : ''}
                    aria-label={`切换到第 ${index + 1} 组${definition.title}分类`}
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
                  aria-pressed={primary === key}
                  title={label.length > 6 ? label : undefined}
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
          <nav className="workspace-context-filter" aria-label={`${definition.title}筛选`}>
            <div className="workspace-context-filter__scroll">
              {definition.contextFilters.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={filter === key ? 'is-active' : ''}
                  aria-pressed={filter === key}
                  onClick={() => selectFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className={`workspace-search ${searchOpen ? 'is-open' : ''}`}>
              {!searchOpen ? (
                <button
                  type="button"
                  className="workspace-search__trigger"
                  onClick={() => setSearchOpen(true)}
                  aria-label={definition.searchLabel}
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
                    placeholder={`${definition.searchLabel}…`}
                    aria-label={definition.searchLabel}
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
            <div className="workspace-content-grid" key={`${definition.id}-${primary}-${filter}-${searchQuery}-${safeContentPage}`}>
              {pageItems.map((item) => {
                const selected = selectedItemId === item.id;
                const buildingCompatibilityCardClass = definition.id === 'building' ? 'building-card' : '';
                return (
                  <button
                    type="button"
                    className={`design-item-card ${buildingCompatibilityCardClass} ${selected ? 'is-selected' : ''}`}
                    key={item.id}
                    title={`${item.meta} · ${item.detail}`}
                    aria-pressed={selected}
                    onClick={() => selectItem(item)}
                  >
                    <div className={`card-thumb card-thumb--${item.tone}`} aria-hidden="true" />
                    <div className={`design-item-card__copy ${definition.id === 'building' ? 'building-card__copy' : ''}`}>
                      <b>{item.name}</b>
                      <span>{item.meta}</span>
                    </div>
                  </button>
                );
              })}

              {pageItems.length === 0 && (
                <div className="workspace-empty">{definition.emptyLabel}</div>
              )}
            </div>
          </div>

          {contentPageCount > 1 && (
            <nav className="workspace-content-pager" aria-label={`${definition.title}内容分页`}>
              {pagerPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={safeContentPage === page ? 'is-active' : ''}
                  aria-label={`切换到第 ${page + 1} 组${definition.title}`}
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
