import {
  Bookmark,
  Crown,
  Feather,
  Grid3X3,
  Leaf,
  MoreHorizontal,
  Palette,
  Shapes,
  Shield,
  Sun,
  X,
  type UiIconComponent,
} from '../../../../ui/icons/runtime-icons.generated';
import { useMemo, useState } from 'react';
import { useHoverOverlay, type HoverCardDefinition } from '../../../../ui/hover/HoverOverlay';
import type { MotionPhase } from '../../../../ui/motion';

export type BuildingSchemeStyle =
  | 'elegant'
  | 'restrained'
  | 'vivid'
  | 'ornate'
  | 'natural'
  | 'other';

export type BuildingSchemeSource = 'builtin' | 'workshop' | 'player';
type BuildingSchemeSourceFilter = 'all' | BuildingSchemeSource;
type BuildingSchemeStyleFilter = 'all' | BuildingSchemeStyle;

export interface BuildingColorScheme {
  id: string;
  name: string;
  source: BuildingSchemeSource;
  style: BuildingSchemeStyle;
  colors: readonly [string, string, string];
}

interface Props {
  motionPhase?: MotionPhase;
  schemes: readonly BuildingColorScheme[];
  selectedSchemeId: string;
  onApply: (schemeId: string) => void;
  onClose: () => void;
}

const PAGE_SIZE = 6;
const STYLE_PAGE_SIZE = 5;

const STYLE_LABELS: Record<BuildingSchemeStyle, string> = {
  elegant: '素雅',
  restrained: '沉稳',
  vivid: '明快',
  ornate: '华丽',
  natural: '自然',
  other: '其他',
};

const SOURCE_LABELS: Record<BuildingSchemeSource, string> = {
  builtin: '系统内置',
  workshop: '创意工坊',
  player: '玩家方案',
};

const STYLE_FILTERS: readonly {
  id: BuildingSchemeStyleFilter;
  label: string;
  icon: UiIconComponent;
}[] = [
  { id: 'all', label: '全部', icon: Grid3X3 },
  { id: 'elegant', label: '素雅', icon: Feather },
  { id: 'restrained', label: '沉稳', icon: Shield },
  { id: 'vivid', label: '明快', icon: Sun },
  { id: 'ornate', label: '华丽', icon: Crown },
  { id: 'natural', label: '自然', icon: Leaf },
  { id: 'other', label: '其他', icon: Shapes },
];

const SOURCE_FILTERS: readonly { id: BuildingSchemeSourceFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'builtin', label: '系统内置' },
  { id: 'workshop', label: '创意工坊' },
  { id: 'player', label: '玩家方案' },
];

function Pager({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return <div className="workspace-content-pager building-scheme-workspace__pager"><i className="workspace-content-pager-marker" aria-hidden="true" /></div>;
  }

  return (
    <div className="workspace-content-pager building-scheme-workspace__pager" aria-label="建筑配色方案分页">
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={index}
          type="button"
          className={index === page ? 'is-active' : ''}
          aria-label={'建筑配色方案第 ' + (index + 1) + ' 页'}
          onClick={() => onChange(index)}
        >
          <span />
        </button>
      ))}
    </div>
  );
}

function SchemeCard({
  scheme,
  selected,
  favorite,
  menuOpen,
  onApply,
  onMenuToggle,
  onToggleFavorite,
}: {
  scheme: BuildingColorScheme;
  selected: boolean;
  favorite: boolean;
  menuOpen: boolean;
  onApply: (schemeId: string) => void;
  onMenuToggle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const hover = useHoverOverlay();
  const sourceTone = scheme.source === 'player' ? 'is-user' : scheme.source === 'workshop' ? 'is-workshop' : 'is-system';
  const hoverDefinition: HoverCardDefinition = {
    kind: 'card',
    id: 'building-scheme-' + scheme.id,
    title: scheme.name,
    subtitle: '建筑配色方案 · ' + SOURCE_LABELS[scheme.source],
    facts: [
      { label: '来源', value: SOURCE_LABELS[scheme.source] },
      { label: '风格', value: STYLE_LABELS[scheme.style] },
      { label: '主色', value: scheme.colors[0], accent: true },
      { label: '辅色', value: scheme.colors[1] },
      { label: '点缀', value: scheme.colors[2] },
    ],
    description: '用于快速替换当前建筑的整套配色关系；应用后仍可继续调整做旧程度等建筑外观参数。',
  };
  return (
    <article
      className={'workspace-item-card-shell building-scheme-workspace__card ' + (selected ? 'is-selected ' : '') + (menuOpen ? 'is-menu-open' : '')}
      onPointerLeave={() => menuOpen && onMenuToggle('')}
    >
      <button
        type="button"
        className={'workspace-item-card building-scheme-workspace__card-apply ' + (selected ? 'is-selected' : '')}
        aria-label={'应用建筑配色方案 ' + scheme.name}
        aria-pressed={selected}
        {...hover.bind(hoverDefinition)}
        onClick={() => onApply(scheme.id)}
      >
        <i className="workspace-item-card__state-line" aria-hidden="true" />
        <div className="workspace-item-card__copy building-scheme-workspace__card-copy">
          <div className="building-scheme-workspace__card-head">
            <b className="workspace-item-card__title workspace-item-card__title-row">
              <span className="workspace-item-card__title-text">{scheme.name}</span>
              {favorite && <span className="workspace-item-card__favorite-star" aria-label="已收藏">★</span>}
            </b>
          </div>
          <span className="workspace-item-card__meta building-scheme-workspace__card-meta">
            <i className="building-scheme-workspace__palette-line" aria-hidden="true">
              {scheme.colors.map((color, index) => <i key={index} style={{ backgroundColor: color }} />)}
            </i>
            <span>{STYLE_LABELS[scheme.style]}</span>
            <span className={'workspace-item-card__source is-compact ' + sourceTone}>{SOURCE_LABELS[scheme.source]}</span>
          </span>
        </div>
      </button>
      <button
        type="button"
        className="workspace-item-menu-trigger is-compact building-scheme-workspace__menu-trigger"
        aria-label={'配色方案操作 ' + scheme.name}
        aria-expanded={menuOpen}
        onClick={() => {
          hover.clear();
          onMenuToggle(menuOpen ? '' : scheme.id);
        }}
      >
        <MoreHorizontal aria-hidden="true" />
      </button>
      {menuOpen && (
        <div className="workspace-item-menu is-compact building-scheme-workspace__card-menu" role="menu" aria-label={scheme.name + ' 配色方案操作'}>
          <button type="button" role="menuitem" className="is-favorite" onClick={() => onToggleFavorite(scheme.id)}>
            <Bookmark aria-hidden="true" /><span>{favorite ? '取消收藏' : '收藏'}</span>
          </button>
        </div>
      )}
    </article>
  );
}

export function BuildingSchemeWorkspace({
  motionPhase = 'steady',
  schemes,
  selectedSchemeId,
  onApply,
  onClose,
}: Props) {
  const hover = useHoverOverlay();
  const [style, setStyle] = useState<BuildingSchemeStyleFilter>('all');
  const [stylePage, setStylePage] = useState(0);
  const [source, setSource] = useState<BuildingSchemeSourceFilter>('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set([
    'jiangnan-elegant',
    'workshop-rain',
    'player-amber',
  ]));
  const [menuSchemeId, setMenuSchemeId] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => schemes.filter((scheme) => (
      (style === 'all' || scheme.style === style)
      && (source === 'all' || scheme.source === source)
      && (!favoriteOnly || favoriteIds.has(scheme.id))
    )),
    [favoriteIds, favoriteOnly, schemes, source, style],
  );

  const stylePageCount = Math.max(1, Math.ceil(STYLE_FILTERS.length / STYLE_PAGE_SIZE));
  const visibleStyleFilters = STYLE_FILTERS.slice(stylePage * STYLE_PAGE_SIZE, (stylePage + 1) * STYLE_PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const rows = [visible.slice(0, 3), visible.slice(3, 6)].filter((row) => row.length > 0);

  function selectStyle(next: BuildingSchemeStyleFilter) {
    hover.clear();
    setFavoriteOnly(false);
    setStyle(next);
    setPage(0);
    setMenuSchemeId('');
  }

  function selectFavorites() {
    hover.clear();
    setFavoriteOnly(true);
    setStyle('all');
    setPage(0);
    setMenuSchemeId('');
  }

  function toggleFavorite(schemeId: string) {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(schemeId)) next.delete(schemeId);
      else next.add(schemeId);
      return next;
    });
    setMenuSchemeId('');
    hover.clear();
  }

  function selectSource(next: BuildingSchemeSourceFilter) {
    hover.clear();
    setSource(next);
    setPage(0);
  }

  return (
    <section
      className={'workspace workspace--catalog workspace--building-scheme building-scheme-workspace motion-bottom-surface is-' + motionPhase}
      aria-label="建筑配色方案工作区"
      aria-busy={motionPhase !== 'steady'}
      data-building-scheme-style={style}
      data-building-scheme-style-page={stylePage + 1}
      data-building-scheme-source={source}
      data-building-scheme-favorite={favoriteOnly ? 'true' : 'false'}
    >
      <header className="workspace-header building-scheme-workspace__header">
        <div className="workspace-title">
          <Palette aria-hidden="true" />
          <b>配色方案</b>
        </div>
        <button className="icon-button" type="button" onClick={() => { hover.clear(); onClose(); }} aria-label="关闭建筑配色方案工作区">
          <X />
        </button>
      </header>

      <div className="workspace-body building-scheme-workspace__body">
        <aside className="workspace-primary-rail building-scheme-workspace__rail" aria-label="配色风格筛选">
          <div className="workspace-primary-rail__content has-favorite-shortcut">
            <button
              type="button"
              className={'workspace-primary-rail__favorite ' + (favoriteOnly ? 'is-active' : '')}
              aria-pressed={favoriteOnly}
              onClick={selectFavorites}
            >
              <Bookmark aria-hidden="true" />
              <span>收藏</span>
            </button>
            <i className="workspace-primary-rail__favorite-divider" aria-hidden="true" />
            {stylePageCount > 1 ? (
              <div className="workspace-rail-pager" aria-label="配色风格组">
                <i className="workspace-rail-pager__track" aria-hidden="true" />
                {Array.from({ length: stylePageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={stylePage === index ? 'is-active' : ''}
                    aria-label={'切换到第 ' + (index + 1) + ' 组配色风格'}
                    onClick={() => setStylePage(index)}
                  >
                    <span />
                  </button>
                ))}
              </div>
            ) : (
              !favoriteOnly && <span className="workspace-rail-pager-marker" aria-hidden="true" />
            )}
            <div className="workspace-primary-rail__page building-scheme-workspace__rail-list" key={stylePage}>
              {visibleStyleFilters.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={style === id ? 'is-active' : ''}
                  aria-pressed={style === id}
                  onClick={() => selectStyle(id)}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="workspace-catalog building-scheme-workspace__catalog">
          <nav className="workspace-context-filter building-scheme-workspace__source-filter" aria-label="配色方案来源筛选">
            <div className="workspace-context-filter__scroll">
              {SOURCE_FILTERS.map(({ id, label }) => (
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

          <div className="workspace-content-stage building-scheme-workspace__stage">
            {visible.length > 0 ? (
              <div className="workspace-content-rows building-scheme-workspace__rows">
                {rows.map((row, rowIndex) => (
                  <div className="workspace-content-row building-scheme-workspace__row" key={rowIndex}>
                    {row.map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        selected={scheme.id === selectedSchemeId}
                        favorite={favoriteIds.has(scheme.id)}
                        menuOpen={menuSchemeId === scheme.id}
                        onApply={onApply}
                        onMenuToggle={setMenuSchemeId}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="workspace-empty building-scheme-workspace__empty">
                <Palette aria-hidden="true" />
                <b>{favoriteOnly ? '还没有符合条件的收藏配色' : '没有符合条件的配色方案'}</b>
                <span>{favoriteOnly ? '通过 Card 右侧菜单收藏配色，或切换顶部来源筛选。' : '切换左侧风格或顶部来源继续浏览。'}</span>
              </div>
            )}
          </div>

          <Pager page={safePage} pageCount={pageCount} onChange={setPage} />
        </div>
      </div>
    </section>
  );
}
