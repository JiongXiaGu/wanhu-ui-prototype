import { useMemo, useRef, useState, type WheelEvent } from 'react';
import { Building2, Grid2X2, House, Landmark, ScrollText, X } from '../ui/icons/runtime-icons.generated';
import type { BlueprintDockCategory } from '../app/ui-state';
import type { MotionPhase } from '../ui/motion';
import { useHoverOverlay, type HoverCardDefinition } from '../ui/hover/HoverOverlay';
import {
  BLUEPRINT_CATEGORY_LABELS,
  BLUEPRINT_SIZE_LABELS,
  BLUEPRINT_SOURCE_LABELS,
  BLUEPRINT_WORKSPACE_ITEMS,
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
  motionPhase?: MotionPhase;
  onClose: () => void;
  onSelectItem?: (item: BlueprintWorkspaceItem) => void;
}

function pagerWindow(pageCount: number, currentPage: number) {
  if (pageCount <= PAGER_WINDOW) return Array.from({ length: pageCount }, (_, index) => index);
  const half = Math.floor(PAGER_WINDOW / 2);
  const start = Math.min(Math.max(currentPage - half, 0), pageCount - PAGER_WINDOW);
  return Array.from({ length: PAGER_WINDOW }, (_, index) => start + index);
}

function sourceBadge(item: BlueprintWorkspaceItem) {
  if (item.source === 'workshop') return '创意工坊';
  if (item.source === 'mine') return '我的蓝图';
  return null;
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
  motionPhase = 'steady',
  onClose,
  onSelectItem,
}: BlueprintWorkspaceProps) {
  const hover = useHoverOverlay();
  const [size, setSize] = useState<BlueprintSize>('all');
  const [source, setSource] = useState<BlueprintSource>('all');
  const [page, setPage] = useState(0);
  const wheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });

  const visibleItems = useMemo(() => BLUEPRINT_WORKSPACE_ITEMS.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category;
    const sizeMatch = size === 'all' || item.size === size;
    const sourceMatch = source === 'all' || item.source === source;
    return categoryMatch && sizeMatch && sourceMatch;
  }), [category, size, source]);

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
          <div className="workspace-primary-rail__content">
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
          </nav>

          <div className="workspace-content-stage blueprint-workspace__stage" onWheel={runWheelPaging}>
            {pageItems.length > 0 ? (
              <div className="workspace-content-rows blueprint-workspace__rows" key={category + '-' + size + '-' + source + '-' + safePage}>
                <div className="workspace-content-row blueprint-workspace__row">
                  {pageItems.map((item) => {
                    const badge = sourceBadge(item);
                    const hoverDefinition = hoverCardFor(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="workspace-item-card blueprint-workspace__card"
                        aria-label={'使用蓝图 ' + item.name + '，占地 ' + item.footprint}
                        data-blueprint-id={item.id}
                        {...hover.bind(hoverDefinition)}
                        onClick={() => {
                          hover.clear();
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
                        <span className="blueprint-workspace__shade" aria-hidden="true" />
                        {badge && <span className={'blueprint-workspace__source is-' + item.source}>{badge}</span>}
                        <span className="blueprint-workspace__caption">
                          <b>{item.name}</b>
                          <span>{item.footprint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="workspace-empty blueprint-workspace__empty">
                <ScrollText aria-hidden="true" />
                <b>没有符合条件的蓝图</b>
                <span>切换规模或来源继续浏览。</span>
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
