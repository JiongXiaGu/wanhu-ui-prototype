import { useMemo, useRef, useState, type WheelEvent } from 'react';
import { X } from 'lucide-react';
import {
  AssetInspectorPopover,
  useAssetInspector,
} from '../ui/asset-inspector/AssetInspector';
import type { DesignWorkspaceDefinition, DesignWorkspaceItem } from './design-workspace-model';
import type { MotionPhase } from '../ui/motion';

const CATEGORY_PAGE_SIZE = 7;
const CONTENT_PAGE_SIZE = 8;
const CONTENT_PAGER_WINDOW = 5;
const WHEEL_THRESHOLD = 72;
const WHEEL_LOCK_MS = 220;
const ALL_PRIMARY_LABEL = '所有';

interface DesignWorkspaceProps {
  definition: DesignWorkspaceDefinition;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onSelectItem?: (item: DesignWorkspaceItem) => void;
}

interface WheelPagingState {
  accumulated: number;
  lockedUntil: number;
}

interface InspectorFact {
  label: string;
  value: string;
  accent?: boolean;
}

const COST_BY_PRIMARY: Record<string, Record<string, string>> = {
  road: {
    earth: '6 钱 / 格',
    gravel: '10 钱 / 格',
    stone: '22 钱 / 格',
    brick: '18 钱 / 格',
    official: '36 钱 / 格',
  },
  bridge: {
    wood: '480 钱',
    stone: '920 钱',
    arch: '1,450 钱',
    covered: '1,200 钱',
    floating: '760 钱',
  },
  building: {
    tower: '4,800 钱',
    hall: '3,600 钱',
    pavilion: '2,400 钱',
    house: '980 钱',
    gate: '1,350 钱',
    gallery: '1,080 钱',
    gazebo: '760 钱',
    archway: '1,120 钱',
    special: '5,200 钱',
  },
  platform: {
    single: '620 钱',
    multi: '1,680 钱',
    xumi: '2,200 钱',
    terrace: '1,240 钱',
    stair: '560 钱',
  },
  wall: {
    earth: '36 钱 / 段',
    brick: '68 钱 / 段',
    white: '72 钱 / 段',
    garden: '96 钱 / 段',
    gate: '240 钱',
  },
  decoration: {
    lamp: '120 钱',
    flag: '80 钱',
    stone: '260 钱',
    water: '420 钱',
    street: '90 钱',
  },
  tree: {
    canopy: '48 钱',
    fruit: '62 钱',
    bamboo: '36 钱',
    flower: '58 钱',
    water: '32 钱',
  },
};

function getPagerWindow(pageCount: number, currentPage: number) {
  if (pageCount <= CONTENT_PAGER_WINDOW) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const half = Math.floor(CONTENT_PAGER_WINDOW / 2);
  const start = Math.min(Math.max(currentPage - half, 0), pageCount - CONTENT_PAGER_WINDOW);
  return Array.from({ length: CONTENT_PAGER_WINDOW }, (_, index) => start + index);
}

function getSizeLabel(definition: DesignWorkspaceDefinition, item: DesignWorkspaceItem) {
  switch (definition.id) {
    case 'road': {
      const width = item.filters.find((key) => /^w\d$/.test(key));
      return width ? `${width.slice(1)} 格宽` : '按路径铺设';
    }
    case 'bridge': {
      if (item.filters.includes('large')) return '4 × 16 格';
      if (item.filters.includes('medium')) return '3 × 10 格';
      return '2 × 6 格';
    }
    case 'building': {
      const sizes: Record<string, string> = {
        tower: '5 × 5 格',
        hall: '7 × 11 格',
        pavilion: '5 × 7 格',
        house: '3 × 5 格',
        gate: '3 × 5 格',
        gallery: '2 × 6 格',
        gazebo: '3 × 3 格',
        archway: '2 × 5 格',
        special: '5 × 5 格',
      };
      return sizes[item.primary] ?? '按构件尺寸';
    }
    case 'platform': {
      const sizes: Record<string, string> = {
        single: '6 × 10 格',
        multi: '9 × 15 格',
        xumi: '7 × 11 格',
        terrace: '8 × 12 格',
        stair: '3 × 6 格',
      };
      return sizes[item.primary] ?? '按轮廓调整';
    }
    case 'city-wall': {
      const category = item.filters[0];
      if (category === 'wall') return '6 m / Cell';
      if (category === 'gate-opening') return '嵌入墙段';
      if (category === 'ground-access-stair') return '依附墙侧';
      if (category === 'walkway-transition-stair') return '连接马道';
      return '城墙构件';
    }
    case 'wall':
      return item.primary === 'gate' ? '2 × 2 格' : '4 m / 段';
    case 'decoration':
      return item.primary === 'water' ? '2 × 2 格' : '1 × 1 格';
    case 'tree':
      return item.primary === 'canopy' ? '树冠约 2 格' : '树冠约 1 格';
    default:
      return '按资产尺寸';
  }
}

function getDefinitionLabel(items: readonly { key: string; label: string }[], key: string, fallback: string) {
  return items.find((entry) => entry.key === key)?.label ?? fallback;
}

function getCityWallModuleType(item: DesignWorkspaceItem) {
  const category = item.filters[0];
  if (category === 'wall') return { label: '城墙', operation: '路径绘制' };
  if (category === 'gate-opening') return { label: '城墙门洞', operation: '嵌入墙段' };
  if (category === 'ground-access-stair') return { label: '登城梯', operation: '依附墙侧' };
  if (category === 'walkway-transition-stair') return { label: '高差楼梯', operation: '连接马道' };
  return { label: '城墙构件', operation: '模块放置' };
}

function getInspectorFacts(definition: DesignWorkspaceDefinition, item: DesignWorkspaceItem): InspectorFact[] {
  if (definition.id === 'city-wall') {
    const system = getDefinitionLabel(definition.primaryCategories, item.primary, '城墙体系');
    const module = getCityWallModuleType(item);
    return [
      { label: '所属体系', value: system },
      { label: '构件类型', value: module.label },
      { label: '营造方式', value: module.operation },
    ];
  }

  const cost = COST_BY_PRIMARY[definition.id]?.[item.primary] ?? '—';
  return [
    { label: '尺寸', value: getSizeLabel(definition, item) },
    { label: '造价', value: cost, accent: true },
    { label: '规格', value: item.meta },
  ];
}

function getInspectorDescription(definition: DesignWorkspaceDefinition, item: DesignWorkspaceItem) {
  const usage = item.detail.replace(/\s*\/\s*/g, '、');
  switch (definition.id) {
    case 'road':
      return `适用于${usage}的道路样式，正式建造时按实际铺设长度结算。`;
    case 'bridge':
      return `适用于${usage}的桥梁构型，实际跨径与桥头位置由放置环境决定。`;
    case 'building':
      return `适用于${usage}。进入放置工具后可继续调整位置、体量、屋顶与高度。`;
    case 'platform':
      return `适用于${usage}的台基构型，进入工具后可继续调整轮廓、高度与层级。`;
    case 'city-wall': {
      const system = getDefinitionLabel(definition.primaryCategories, item.primary, '当前城墙');
      const category = item.filters[0];
      if (category === 'wall') return `${system}体系的主体墙段。后续进入路径绘制工具；墙高、城外正面与随地形 / 整体找平属于 Tool 参数。`;
      if (category === 'gate-opening') return `${system}体系的城墙门洞。水门等特殊门洞仍归入这一类；后续通过嵌入式工具调整城门纵深与门洞净空。`;
      if (category === 'ground-access-stair') return `${system}体系的登城梯，用于从地面连接墙顶马道；楼梯宽度、高度与坡度在后续 Tool 中调整。`;
      if (category === 'walkway-transition-stair') return `${system}体系的高差楼梯，用于连接不同标高的墙顶马道；宽度、高差与坡度在后续 Tool 中调整。`;
      return `${system}体系的城墙构件。`;
    }
    case 'wall':
      return `适用于${usage}的围合构件，可用于院落边界、园林分隔与街巷界面。`;
    case 'decoration':
      return `适用于${usage}的场景装饰，用于强化街景、园林或礼制空间的识别。`;
    case 'tree':
      return `适用于${usage}的植物资产，正式数据将继续补充季相、生长环境与景观效果。`;
    default:
      return usage;
  }
}

export function DesignWorkspace({ definition, motionPhase = 'steady', onClose, onSelectItem }: DesignWorkspaceProps) {
  const defaultPrimary = definition.primaryCategories[0]?.key ?? 'all';
  const defaultFilter = definition.contextFilters[0]?.key ?? 'all';
  const [primary, setPrimary] = useState(defaultPrimary);
  const [filter, setFilter] = useState(defaultFilter);
  const [categoryPage, setCategoryPage] = useState(0);
  const [contentPage, setContentPage] = useState(0);
  const categoryWheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });
  const contentWheel = useRef<WheelPagingState>({ accumulated: 0, lockedUntil: 0 });
  const inspector = useAssetInspector<DesignWorkspaceItem>({ openDelay: 280, closeDelay: 90 });

  const categoryPageCount = Math.max(1, Math.ceil(definition.primaryCategories.length / CATEGORY_PAGE_SIZE));
  const visibleCategories = definition.primaryCategories.slice(
    categoryPage * CATEGORY_PAGE_SIZE,
    (categoryPage + 1) * CATEGORY_PAGE_SIZE,
  );

  const visibleItems = useMemo(
    () => definition.items.filter((item) => {
      const matchesCategory = primary === defaultPrimary || item.primary === primary;
      const matchesFilter = filter === defaultFilter || item.filters.includes(filter);
      return matchesCategory && matchesFilter;
    }),
    [defaultFilter, defaultPrimary, definition.items, filter, primary],
  );

  const contentPageCount = Math.max(1, Math.ceil(visibleItems.length / CONTENT_PAGE_SIZE));
  const safeContentPage = Math.min(contentPage, contentPageCount - 1);
  const pageItems = visibleItems.slice(safeContentPage * CONTENT_PAGE_SIZE, (safeContentPage + 1) * CONTENT_PAGE_SIZE);
  const pagerPages = getPagerWindow(contentPageCount, safeContentPage);
  const contentRows = [pageItems.slice(0, 4), pageItems.slice(4, 8)].filter((row) => row.length > 0);
  const HeaderIcon = definition.icon;
  const buildingCompatibilityClass = definition.id === 'building' ? 'workspace--building' : '';
  const inspectorFacts = inspector.item ? getInspectorFacts(definition, inspector.item) : [];

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
    inspector.clear();
    setPage((page) => Math.min(pageCount - 1, Math.max(0, page + direction)));
  }

  function resetContentPosition() {
    inspector.clear();
    setContentPage(0);
  }

  function selectPrimary(next: string) {
    setPrimary(next);
    resetContentPosition();
  }

  function selectFilter(next: string) {
    setFilter(next);
    resetContentPosition();
  }

  function selectItem(item: DesignWorkspaceItem) {
    inspector.clear();
    onSelectItem?.(item);
  }

  return (
    <>
      <section className={`workspace workspace--design ${buildingCompatibilityClass} motion-bottom-surface is-${motionPhase}`} data-design-category={definition.id} aria-busy={motionPhase !== 'steady'}>
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
              {categoryPageCount > 1 ? (
                <div className="workspace-rail-pager" aria-label={`${definition.title}分类组`}>
                  <i className="workspace-rail-pager__track" aria-hidden="true" />
                  {Array.from({ length: categoryPageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={categoryPage === index ? 'is-active' : ''}
                      aria-label={`切换到第 ${index + 1} 组${definition.title}分类`}
                      onClick={() => {
                        inspector.clear();
                        setCategoryPage(index);
                      }}
                    >
                      <span />
                    </button>
                  ))}
                </div>
              ) : (
                <span className="workspace-rail-pager-marker" aria-hidden="true" />
              )}

              <div className="workspace-primary-rail__page" key={categoryPage}>
                {visibleCategories.map(({ key, label, icon: Icon }) => {
                  const displayLabel = key === defaultPrimary ? ALL_PRIMARY_LABEL : label;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={primary === key ? 'is-active' : ''}
                      aria-pressed={primary === key}
                      title={displayLabel.length > 6 ? displayLabel : undefined}
                      onClick={() => selectPrimary(key)}
                    >
                      <Icon size={16} />
                      <span>{displayLabel}</span>
                    </button>
                  );
                })}
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

            </nav>

            <div
              className="workspace-content-stage"
              onWheel={(event) => runWheelPaging(event, contentPageCount, contentWheel, setContentPage)}
            >
              <div className="workspace-content-rows" key={`${definition.id}-${primary}-${filter}-${safeContentPage}`}>
                {pageItems.length === 0 ? (
                  <div className="workspace-empty">{definition.emptyLabel}</div>
                ) : contentRows.map((row, rowIndex) => (
                  <div className="workspace-content-row" key={`row-${rowIndex}`}>
                    {row.map((item) => {
                      const buildingCompatibilityCardClass = definition.id === 'building' ? 'building-card' : '';
                      const inspectorOpenForItem = inspector.item?.id === item.id;
                      return (
                        <button
                          type="button"
                          className={`workspace-item-card design-item-card ${buildingCompatibilityCardClass}`.trim()}
                          key={item.id}
                          data-item-id={item.id}
                          aria-describedby={inspectorOpenForItem ? 'design-asset-inspector' : undefined}
                          onPointerEnter={(event) => {
                            if (event.pointerType === 'touch') return;
                            inspector.showPointer(item, event.currentTarget);
                          }}
                          onPointerLeave={(event) => inspector.hidePointer(event.currentTarget)}
                          onFocus={(event) => inspector.showFocus(item, event.currentTarget)}
                          onBlur={(event) => inspector.hideFocus(event.currentTarget)}
                          onClick={() => selectItem(item)}
                        >
                          <i className="workspace-item-card__state-line" aria-hidden="true" />
                          <div className={`workspace-item-card__preview card-thumb card-thumb--${item.tone}`} aria-hidden="true" />
                          <div className={`workspace-item-card__copy design-item-card__copy ${definition.id === 'building' ? 'building-card__copy' : ''}`}>
                            <b className="workspace-item-card__title">{item.name}</b>
                            <span className="workspace-item-card__meta">{item.meta}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {contentPageCount > 1 ? (
              <nav className="workspace-content-pager" aria-label={`${definition.title}内容分页`}>
                {pagerPages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={safeContentPage === page ? 'is-active' : ''}
                    aria-label={`切换到第 ${page + 1} 组${definition.title}`}
                    onClick={() => {
                      inspector.clear();
                      setContentPage(page);
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

      <AssetInspectorPopover
        id="design-asset-inspector"
        open={inspector.item !== null}
        anchor={inspector.anchor}
        ariaLabel={inspector.item ? `${inspector.item.name}详细信息` : undefined}
        className="design-asset-inspector"
      >
        {inspector.item && (
          <>
            <div className="asset-inspector__header">
              <h3 className="asset-inspector__title">{inspector.item.name}</h3>
              <div className="asset-inspector__meta">{definition.title} · {inspector.item.meta}</div>
            </div>
            <div className="asset-inspector__divider" />
            <dl className="asset-inspector__facts">
              {inspectorFacts.map((fact) => (
                <div key={fact.label} className="asset-inspector__fact-row">
                  <dt>{fact.label}</dt>
                  <dd className={fact.accent ? 'is-accent' : ''}>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="asset-inspector__divider" />
            <p className="asset-inspector__description">{getInspectorDescription(definition, inspector.item)}</p>
          </>
        )}
      </AssetInspectorPopover>
    </>
  );
}
