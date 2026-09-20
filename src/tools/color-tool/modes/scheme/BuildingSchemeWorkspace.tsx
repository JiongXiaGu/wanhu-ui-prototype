import {
  Crown,
  Feather,
  Grid3X3,
  Leaf,
  Palette,
  Shapes,
  Shield,
  Sun,
  X,
  type UiIconComponent,
} from '../../../../ui/icons/runtime-icons.generated';
import { useMemo, useState } from 'react';
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

const PAGE_SIZE = 8;

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
  onApply,
}: {
  scheme: BuildingColorScheme;
  selected: boolean;
  onApply: (schemeId: string) => void;
}) {
  return (
    <article className={'building-scheme-workspace__card ' + (selected ? 'is-selected' : '')}>
      <button
        type="button"
        className="workspace-item-card building-scheme-workspace__card-apply"
        aria-label={'应用建筑配色方案 ' + scheme.name}
        aria-pressed={selected}
        onClick={() => onApply(scheme.id)}
      >
        <i className="workspace-item-card__state-line" aria-hidden="true" />
        <div className="workspace-item-card__copy building-scheme-workspace__card-copy">
          <div className="building-scheme-workspace__card-head">
            <b className="workspace-item-card__title">{scheme.name}</b>
            <span className={'building-scheme-workspace__source is-' + scheme.source}>{SOURCE_LABELS[scheme.source]}</span>
          </div>
          <span className="workspace-item-card__meta building-scheme-workspace__card-meta">
            <i className="building-scheme-workspace__palette-line" aria-hidden="true">
              {scheme.colors.map((color, index) => <i key={index} style={{ backgroundColor: color }} />)}
            </i>
            <span>{STYLE_LABELS[scheme.style]}</span>
          </span>
        </div>
      </button>
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
  const [style, setStyle] = useState<BuildingSchemeStyleFilter>('all');
  const [source, setSource] = useState<BuildingSchemeSourceFilter>('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => schemes.filter((scheme) => (
      (style === 'all' || scheme.style === style)
      && (source === 'all' || scheme.source === source)
    )),
    [schemes, source, style],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const rows = [visible.slice(0, 4), visible.slice(4, 8)].filter((row) => row.length > 0);

  function selectStyle(next: BuildingSchemeStyleFilter) {
    setStyle(next);
    setPage(0);
  }

  function selectSource(next: BuildingSchemeSourceFilter) {
    setSource(next);
    setPage(0);
  }

  return (
    <section
      className={'workspace workspace--catalog workspace--building-scheme building-scheme-workspace motion-bottom-surface is-' + motionPhase}
      aria-label="建筑配色方案工作区"
      aria-busy={motionPhase !== 'steady'}
      data-building-scheme-style={style}
      data-building-scheme-source={source}
    >
      <header className="workspace-header building-scheme-workspace__header">
        <div className="workspace-title">
          <Palette aria-hidden="true" />
          <b>配色方案</b>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="关闭建筑配色方案工作区">
          <X />
        </button>
      </header>

      <div className="workspace-body building-scheme-workspace__body">
        <aside className="workspace-primary-rail building-scheme-workspace__rail" aria-label="配色风格筛选">
          <div className="workspace-primary-rail__content">
            <span className="workspace-rail-pager-marker" aria-hidden="true" />
            <div className="workspace-primary-rail__page building-scheme-workspace__rail-list">
              {STYLE_FILTERS.map(({ id, label, icon: Icon }) => (
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
                        onApply={onApply}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="workspace-empty building-scheme-workspace__empty">
                <Palette aria-hidden="true" />
                <b>没有符合条件的配色方案</b>
                <span>切换左侧风格或顶部来源继续浏览。</span>
              </div>
            )}
          </div>

          <Pager page={safePage} pageCount={pageCount} onChange={setPage} />
        </div>
      </div>
    </section>
  );
}
