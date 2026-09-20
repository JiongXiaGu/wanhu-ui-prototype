import { useMemo, useState } from 'react';
import { Bookmark, Grid3X3, House, Palette, Save, Trash2, Trees, X, type LucideIcon } from 'lucide-react';
import type { MotionPhase } from '../../ui/motion';

export type MaterialSchemeWorkspacePage = 'system' | 'mine';
export type MaterialSchemeWorkspaceCategory = '全部' | '木头' | '瓦片' | '墙面';

export interface MaterialSchemeWorkspacePreset {
  id: string;
  type: '木头' | '瓦片' | '墙面' | '自定义';
  name: string;
  source: 'builtin' | 'custom';
  selected: boolean;
  colors: readonly [string, string, string, string];
  workflow: '金属' | '高光';
  smoothness: number;
  textureTiling: number;
}

interface Props {
  motionPhase?: MotionPhase;
  systemPresets: readonly MaterialSchemeWorkspacePreset[];
  customPresets: readonly MaterialSchemeWorkspacePreset[];
  onClose: () => void;
  onApply: (id: string) => void;
  onSaveCurrent: () => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 6;

const SYSTEM_CATEGORIES: readonly {
  id: MaterialSchemeWorkspaceCategory;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: '全部', label: '全部', icon: Grid3X3 },
  { id: '木头', label: '木头', icon: Trees },
  { id: '瓦片', label: '瓦片', icon: House },
  { id: '墙面', label: '墙面', icon: House },
];

function pageItems<T>(items: readonly T[], page: number) {
  return items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
}

function materialFinishLabel(smoothness: number) {
  if (smoothness < 0.2) return '粗糙';
  if (smoothness < 0.32) return '哑光';
  if (smoothness < 0.5) return '偏哑光';
  return '光滑';
}

function materialPreviewClass(type: MaterialSchemeWorkspacePreset['type']) {
  if (type === '木头') return 'is-wood';
  if (type === '瓦片') return 'is-tile';
  if (type === '墙面') return 'is-wall';
  return 'is-custom';
}

function SchemeCard({
  preset,
  onApply,
  onDelete,
}: {
  preset: MaterialSchemeWorkspacePreset;
  onApply: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const finishLabel = materialFinishLabel(preset.smoothness);
  const previewLightOpacity = 0.09 + preset.smoothness * 0.2;

  return (
    <article
      className={[
        'material-scheme-workspace__card',
        preset.selected ? 'is-selected' : '',
        preset.source === 'custom' ? 'has-delete' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="material-scheme-workspace__card-apply"
        aria-label={'应用材质方案 ' + preset.type + ' · ' + preset.name}
        onClick={() => onApply(preset.id)}
      >
        <span
          className={'material-scheme-workspace__card-preview ' + materialPreviewClass(preset.type)}
          style={{ backgroundColor: preset.colors[0] }}
          aria-hidden="true"
        >
          <i className="material-scheme-workspace__card-preview-texture" />
          <i className="material-scheme-workspace__card-preview-light" style={{ opacity: previewLightOpacity }} />
        </span>
        <span className="material-scheme-workspace__card-copy">
          <span className="material-scheme-workspace__card-meta">{preset.type}</span>
          <b>{preset.name}</b>
          <span className="material-scheme-workspace__card-detail">{finishLabel}</span>
        </span>
      </button>
      {preset.source === 'custom' && (
        <button
          type="button"
          className="material-scheme-workspace__card-delete"
          aria-label={'删除自定义方案 ' + preset.name}
          onClick={() => onDelete(preset.id)}
        >
          <Trash2 aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

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
    return <div className="workspace-content-pager material-scheme-workspace__pager"><i className="workspace-content-pager-marker" aria-hidden="true" /></div>;
  }

  return (
    <div className="workspace-content-pager material-scheme-workspace__pager" aria-label="材质方案分页">
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={index}
          type="button"
          className={index === page ? 'is-active' : ''}
          aria-label={'材质方案第 ' + (index + 1) + ' 页'}
          onClick={() => onChange(index)}
        >
          <span />
        </button>
      ))}
    </div>
  );
}

export function MaterialSchemeWorkspace({
  motionPhase = 'steady',
  systemPresets,
  customPresets,
  onClose,
  onApply,
  onSaveCurrent,
  onDelete,
}: Props) {
  const [workspacePage, setWorkspacePage] = useState<MaterialSchemeWorkspacePage>('system');
  const [category, setCategory] = useState<MaterialSchemeWorkspaceCategory>('全部');
  const [systemPage, setSystemPage] = useState(0);
  const [minePage, setMinePage] = useState(0);

  const filteredSystem = useMemo(
    () => category === '全部' ? systemPresets : systemPresets.filter((preset) => preset.type === category),
    [category, systemPresets],
  );

  const activeItems = workspacePage === 'system' ? filteredSystem : customPresets;
  const activePage = workspacePage === 'system' ? systemPage : minePage;
  const pageCount = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const safePage = Math.min(activePage, pageCount - 1);
  const visibleItems = pageItems(activeItems, safePage);
  const rows = [visibleItems.slice(0, 3), visibleItems.slice(3, 6)].filter((row) => row.length > 0);

  function selectWorkspacePage(next: MaterialSchemeWorkspacePage) {
    setWorkspacePage(next);
    if (next === 'system') setSystemPage(0);
    else setMinePage(0);
  }

  function selectCategory(next: MaterialSchemeWorkspaceCategory) {
    setCategory(next);
    setSystemPage(0);
  }

  function setActivePage(next: number) {
    if (workspacePage === 'system') setSystemPage(next);
    else setMinePage(next);
  }

  function saveCurrent() {
    onSaveCurrent();
    setWorkspacePage('mine');
    setMinePage(0);
  }

  return (
    <section
      className={'workspace workspace--design workspace--material-scheme material-scheme-workspace motion-bottom-surface is-' + motionPhase}
      aria-label="材质方案工作区"
      aria-busy={motionPhase !== 'steady'}
      data-material-scheme-workspace-page={workspacePage}
    >
      <header className="workspace-header material-scheme-workspace__header">
        <div className="workspace-title">
          <Palette aria-hidden="true" />
          <b>材质方案</b>
        </div>

        <nav className="material-scheme-workspace__page-tabs" aria-label="材质方案页面">
          <button
            type="button"
            className={workspacePage === 'system' ? 'is-active' : ''}
            aria-pressed={workspacePage === 'system'}
            onClick={() => selectWorkspacePage('system')}
          >
            <span>系统方案</span>
            <i className="material-scheme-workspace__tab-indicator" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={workspacePage === 'mine' ? 'is-active' : ''}
            aria-pressed={workspacePage === 'mine'}
            onClick={() => selectWorkspacePage('mine')}
          >
            <span>我的方案</span>
            <i className="material-scheme-workspace__tab-indicator" aria-hidden="true" />
          </button>
        </nav>

        <button className="icon-button" type="button" onClick={onClose} aria-label="关闭材质方案工作区">
          <X />
        </button>
      </header>

      <div className="workspace-body material-scheme-workspace__body">
        <aside className="workspace-primary-rail material-scheme-workspace__rail" aria-label="材质方案分类">
          {workspacePage === 'system' ? (
            <div className="material-scheme-workspace__rail-list">
              {SYSTEM_CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={category === id ? 'is-active' : ''}
                  onClick={() => selectCategory(id)}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="material-scheme-workspace__rail-list">
              <button type="button" className="is-active">
                <Bookmark aria-hidden="true" />
                <span>已保存</span>
              </button>
              <button type="button" className="material-scheme-workspace__save" onClick={saveCurrent}>
                <Save aria-hidden="true" />
                <span>保存当前</span>
              </button>
            </div>
          )}
        </aside>

        <div className="workspace-catalog material-scheme-workspace__catalog">
          <div className="material-scheme-workspace__summary">
            <span>{workspacePage === 'system' ? category : '我的方案'}</span>
            <b>{activeItems.length} 个方案</b>
          </div>

          <div className="workspace-content-stage material-scheme-workspace__stage">
            {visibleItems.length > 0 ? (
              <div className="workspace-content-rows material-scheme-workspace__rows">
                {rows.map((row, rowIndex) => (
                  <div className="workspace-content-row material-scheme-workspace__row" key={rowIndex}>
                    {row.map((preset) => (
                      <SchemeCard key={preset.id} preset={preset} onApply={onApply} onDelete={onDelete} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="workspace-empty material-scheme-workspace__empty">
                <Bookmark aria-hidden="true" />
                <b>还没有保存的自定义方案</b>
                <span>使用左侧“保存当前”把现在的材质参数加入这里。</span>
              </div>
            )}
          </div>

          <Pager page={safePage} pageCount={pageCount} onChange={setActivePage} />
        </div>
      </div>
    </section>
  );
}
