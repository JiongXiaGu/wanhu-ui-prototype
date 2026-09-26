import { useMemo, useRef, useState, type WheelEvent } from 'react';
import { Bookmark, Building2, Grid2X2, House, Landmark, MoreHorizontal, Pencil, Plus, ScrollText, Trash2, X } from '../ui/icons/runtime-icons.generated';
import type { BlueprintDockCategory } from '../app/ui-state';
import type { MotionPhase } from '../ui/motion';
import { useHoverOverlay, type HoverCardDefinition } from '../ui/hover/HoverOverlay';
import {
  BLUEPRINT_CATEGORY_LABELS,
  BLUEPRINT_SIZE_LABELS,
  BLUEPRINT_SOURCE_LABELS,
  type BlueprintSize,
  type BlueprintSource,
  type BlueprintWorkspaceItem,
} from './blueprint-workspace-model';

const PAGE_SIZE = 4;
const PAGER_WINDOW = 5;
const WHEEL_THRESHOLD = 72;
const WHEEL_LOCK_MS = 220;

const SIZE_ITEMS: ReadonlyArray<{ id: BlueprintSize; label: string; icon: typeof Grid2X2 }> = [
  { id: 'all', label: '全部', icon: Grid2X2 },
  { id: 'small', label: '小型', icon: House },
  { id: 'medium', label: '中型', icon: Building2 },
  { id: 'large', label: '大型', icon: Landmark },
];

const SOURCE_ITEMS: ReadonlyArray<{ id: BlueprintSource; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'system', label: '系统内置' },
  { id: 'workshop', label: '创意工坊' },
  { id: 'mine', label: '我的蓝图' },
];

interface WheelPagingState {
  accumulated: number;
  lockedUntil: number;
}

interface BlueprintWorkspaceProps {
  category: BlueprintDockCategory;
  items: readonly BlueprintWorkspaceItem[];
  motionPhase?: MotionPhase;
  onClose: () => void;
  onCreate: (category: BlueprintDockCategory) => void;
  onEdit: (item: BlueprintWorkspaceItem) => void;
  onDelete: (item: BlueprintWorkspaceItem) => void;
  onSelectItem?: (item: BlueprintWorkspaceItem) => void;
}

function pagerWindow(pageCount: number, currentPage: number) {
  if (pageCount <= PAGER_WINDOW) return Array.from({ length: pageCount }, (_, index) => index);
  const half = Math.floor(PAGER_WINDOW / 2);
  const start = Math.min(Math.max(currentPage - half, 0), pageCount - PAGER_WINDOW);
  return Array.from({ length: PAGER_WINDOW }, (_, index) => start + index);
}

function sourceBadge(item: BlueprintWorkspaceItem) {
  return BLUEPRINT_SOURCE_LABELS[item.source];
}

function hoverCardFor(item: BlueprintWorkspaceItem): HoverCardDefinition {
  return {
    kind: 'card',
    id: 'blueprint-' + item.id,
    title: item.name,
    subtitle: BLUEPRINT_CATEGORY_LABELS[item.category] + ' · ' + BLUEPRINT_SOURCE_LABELS[item.source],
    facts: [
      { label: '占地', value: item.footprint },
      { label: '构件', value: item.objectCount + ' 个' },
      { label: '预计造价', value: item.estimatedCost, accent: true },
      { label: '规模', value: BLUEPRINT_SIZE_LABELS[item.size] },
    ],
    description: item.description,
  };
}

export function BlueprintWorkspace({
  category,
  items,
  motionPhase = 'steady',
  onClose,
  onCreate,
  onEdit,
  onDelete,
  onSelectItem,
}: BlueprintWorkspaceProps) {
  const hover = useHoverOverlay();
  const [size, setSize] = useState<BlueprintSize>('all');
  const [source, setSource] = useState<BlueprintSource>('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set([
    'bp-residential-jiangnan-courtyard',
    'bp-residential-riverside-home',
    'bp-commercial-street-row',
  ]));
  const [page, setPage] = useState(0);
  const [menuItemId, setMenuItemId] = useState('');
  const wheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });

  const visibleItems = useMemo(() => items.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category;
    const sizeMatch = size === 'all' || item.size === size;
    const sourceMatch = source === 'all' || item.source === source;
    const favoriteMatch = !favoriteOnly || favoriteIds.has(item.id);
    return categoryMatch && sizeMatch && sourceMatch && favoriteMatch;
  }), [category, favoriteIds, favoriteOnly, items, size, source]);

  const pageCount = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visibleItems.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const pagerPages = pagerWindow(pageCount, safePage);

  function resetPage() {
    hover.clear();
    setPage(0);
  }

  function selectSize(next: BlueprintSize) {
    setSize(next);
    resetPage();
  }

  function setFavoriteFilter(next: boolean) {
    setFavoriteOnly(next);
    resetPage();
  }

  function toggleFavorite(itemId: string) {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    setMenuItemId('');
    hover.clear();
  }

  function selectSource(next: BlueprintSource) {
    setSource(next);
    resetPage();
  }

  function runWheelPaging(event: WheelEvent<HTMLElement>) {
    if (pageCount <= 1) return;
    const now = performance.now();
    const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(dominantDelta) < 1) return;

    event.preventDefault();
    if (now < wheel.current.lockedUntil) return;

    wheel.current.accumulated += dominantDelta;
    if (Math.abs(wheel.current.accumulated) < WHEEL_THRESHOLD) return;

    const direction = wheel.current.accumulated > 0 ? 1 : -1;
    wheel.current.accumulated = 0;
    wheel.current.lockedUntil = now + WHEEL_LOCK_MS;
    hover.clear();
    setPage((current) => Math.min(pageCount - 1, Math.max(0, current + direction)));
  }

  return (
    <section
      className={'workspace workspace--catalog workspace--blueprint motion-bottom-surface is-' + motionPhase}
      data-blueprint-category={category}
      data-blueprint-size={size}
      data-blueprint-source={source}
      data-blueprint-favorite={favoriteOnly ? 'true' : 'false'}
      aria-label={BLUEPRINT_CATEGORY_LABELS[category]}
      aria-busy={motionPhase !== 'steady'}
    >
      <header className="workspace-header">
        <div className="workspace-title">
          <ScrollText size={18} aria-hidden="true" />
          <b>{BLUEPRINT_CATEGORY_LABELS[category]}</b>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={() => {
            hover.clear();
            onClose();
          }}
          aria-label="关闭蓝图目录"
        >
          <X />
        </button>
      </header>

      <div className="workspace-body">
        <nav className="workspace-primary-rail blueprint-workspace__rail" aria-label="蓝图规模">
          <div className="workspace-primary-rail__content has-favorite-shortcut">
            <button
              type="button"
              className={'workspace-primary-rail__favorite ' + (favoriteOnly ? 'is-active' : '')}
              aria-label={favoriteOnly ? '关闭收藏筛选' : '仅显示收藏蓝图'}
              aria-pressed={favoriteOnly}
              onClick={() => setFavoriteFilter(!favoriteOnly)}
            >
              <Bookmark size={16} aria-hidden="true" />
              <span>收藏</span>
            </button>
            <i className="workspace-primary-rail__favorite-divider" aria-hidden="true" />
            <span className="workspace-rail-pager-marker" aria-hidden="true" />
            <div className="workspace-primary-rail__page">
              {SIZE_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={size === id ? 'is-active' : ''}
                  aria-pressed={size === id}
                  onClick={() => selectSize(id)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="workspace-catalog blueprint-workspace__catalog">
          <nav className="workspace-context-filter blueprint-workspace__source-filter" aria-label="蓝图来源">
            <div className="workspace-context-filter__scroll">
              {SOURCE_ITEMS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={source === id ? 'is-active' : ''}
                  aria-pressed={source === id}
                  onClick={() => selectSource(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="blueprint-workspace__actions">
              <button
                type="button"
                className="blueprint-workspace__action is-primary"
                aria-label={'新建' + BLUEPRINT_CATEGORY_LABELS[category]}
                onClick={() => {
                  hover.clear();
                  setMenuItemId('');
                  onCreate(category);
                }}
              >
                <Plus size={14} aria-hidden="true" />
                <span>新建蓝图</span>
              </button>
            </div>
          </nav>

          <div className="workspace-content-stage blueprint-workspace__stage" onWheel={runWheelPaging}>
            {pageItems.length > 0 ? (
              <div className="workspace-content-rows blueprint-workspace__rows" key={category + '-' + size + '-' + source + '-' + safePage}>
                <div className="workspace-content-row blueprint-workspace__row">
                  {pageItems.map((item) => {
                    const badge = sourceBadge(item);
                    const hoverDefinition = hoverCardFor(item);
                    const editable = item.source === 'mine';
                    const favorite = favoriteIds.has(item.id);
                    const menuOpen = menuItemId === item.id;
                    return (
                      <article
                        key={item.id}
                        className={'workspace-item-card-shell blueprint-workspace__card-shell ' + (editable ? 'is-editable ' : '') + (menuOpen ? 'is-menu-open' : '')}
                        onPointerLeave={() => menuOpen && setMenuItemId('')}
                      >
                        <button
                          type="button"
                          className="workspace-item-card blueprint-workspace__card"
                          aria-label={'使用蓝图 ' + item.name + '，占地 ' + item.footprint}
                          data-blueprint-id={item.id}
                          {...hover.bind(hoverDefinition)}
                          onClick={() => {
                            hover.clear();
                            setMenuItemId('');
                            onSelectItem?.(item);
                          }}
                        >
                          <i className="workspace-item-card__state-line" aria-hidden="true" />
                          <span
                            className="blueprint-workspace__preview"
                            aria-hidden="true"
                            style={{
                              backgroundImage: 'url(' + item.previewAsset + ')',
                              backgroundPosition: item.previewPosition,
                              backgroundSize: item.previewSize,
                            }}
                          />
                          <span className={'workspace-item-card__source is-media ' + (item.source === 'workshop' ? 'is-workshop' : item.source === 'mine' ? 'is-user' : 'is-system')}>{badge}</span>
                          <span className="blueprint-workspace__caption">
                            <b className="workspace-item-card__title-row">
                              <span className="workspace-item-card__title-text">{item.name}</span>
                              {favorite && <span className="workspace-item-card__favorite-star" aria-label="已收藏">★</span>}
                            </b>
                          </span>
                        </button>

                        <button
                          type="button"
                          className="workspace-item-menu-trigger is-media blueprint-workspace__menu-trigger"
                          aria-label={'蓝图操作 ' + item.name}
                          aria-expanded={menuOpen}
                          onClick={() => {
                            hover.clear();
                            setMenuItemId(menuOpen ? '' : item.id);
                          }}
                        >
                          <MoreHorizontal size={16} aria-hidden="true" />
                        </button>
                        {menuOpen && (
                          <div className="workspace-item-menu is-media blueprint-workspace__card-menu" role="menu" aria-label={item.name + ' 蓝图操作'}>
                            <button type="button" role="menuitem" className="is-favorite" onClick={() => toggleFavorite(item.id)}>
                              <Bookmark size={14} aria-hidden="true" /><span>{favorite ? '取消收藏' : '收藏'}</span>
                            </button>
                            {editable && (
                              <>
                                <button type="button" role="menuitem" onClick={() => { setMenuItemId(''); onEdit(item); }}>
                                  <Pencil size={14} aria-hidden="true" /><span>编辑</span>
                                </button>
                                <button type="button" role="menuitem" className="is-danger" onClick={() => { setMenuItemId(''); onDelete(item); }}>
                                  <Trash2 size={14} aria-hidden="true" /><span>删除</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="workspace-empty blueprint-workspace__empty">
                <ScrollText aria-hidden="true" />
                <b>{favoriteOnly ? '还没有符合条件的收藏蓝图' : '没有符合条件的蓝图'}</b>
                <span>{favoriteOnly ? '通过 Card 右上角菜单收藏蓝图，或切换顶部来源筛选。' : '切换规模或来源继续浏览。'}</span>
              </div>
            )}
          </div>

          {pageCount > 1 ? (
            <nav className="workspace-content-pager" aria-label="蓝图分页">
              {pagerPages.map((itemPage) => (
                <button
                  key={itemPage}
                  type="button"
                  className={safePage === itemPage ? 'is-active' : ''}
                  aria-label={'蓝图第 ' + (itemPage + 1) + ' 页'}
                  onClick={() => {
                    hover.clear();
                    setPage(itemPage);
                  }}
                >
                  <span />
                </button>
              ))}
            </nav>
          ) : (
            <span className="workspace-content-pager-marker" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}
