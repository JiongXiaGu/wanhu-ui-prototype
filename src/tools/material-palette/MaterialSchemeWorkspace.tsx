import { useMemo, useState, type DragEvent as ReactDragEvent } from 'react';
import {
  Bookmark,
  ClipboardPaste,
  Copy,
  Grid3X3,
  House,
  MoreHorizontal,
  Palette,
  Pencil,
  Save,
  Trash2,
  Trees,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useDialogSystem } from '../../ui/dialog/DialogSystem';
import type { MotionPhase } from '../../ui/motion';

export type MaterialSchemeWorkspaceCategory = '全部' | '木头' | '瓦片' | '墙面';
export type MaterialSchemeCategory = Exclude<MaterialSchemeWorkspaceCategory, '全部'>;
export type MaterialSchemeWorkspaceSource = 'all' | 'builtin' | 'workshop' | 'mine';
export type MaterialSchemePresetSource = Exclude<MaterialSchemeWorkspaceSource, 'all'>;

export interface MaterialSchemeWorkspacePreset {
  id: string;
  type: MaterialSchemeCategory;
  name: string;
  source: MaterialSchemePresetSource;
  selected: boolean;
  colors: readonly [string, string, string, string];
  workflow: '金属' | '高光';
  smoothness: number;
  textureTiling: number;
}

interface Props {
  motionPhase?: MotionPhase;
  systemPresets: readonly MaterialSchemeWorkspacePreset[];
  workshopPresets: readonly MaterialSchemeWorkspacePreset[];
  customPresets: readonly MaterialSchemeWorkspacePreset[];
  canPasteCurrent: boolean;
  currentCategory: MaterialSchemeCategory;
  saveInitialName: string;
  onClose: () => void;
  onApply: (id: string) => void;
  onSaveCurrent: (name: string, category: MaterialSchemeCategory) => void;
  onPasteCurrent: () => void;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, category: MaterialSchemeCategory) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 8;
const MATERIAL_CATEGORIES: readonly MaterialSchemeCategory[] = ['木头', '瓦片', '墙面'];

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

const SOURCE_FILTERS: readonly {
  id: MaterialSchemeWorkspaceSource;
  label: string;
}[] = [
  { id: 'all', label: '全部' },
  { id: 'builtin', label: '系统内置' },
  { id: 'workshop', label: '创意工坊' },
  { id: 'mine', label: '我的方案' },
];

const SOURCE_LABELS: Record<MaterialSchemePresetSource, string> = {
  builtin: '系统内置',
  workshop: '创意工坊',
  mine: '我的方案',
};

function pageItems<T>(items: readonly T[], page: number) {
  return items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
}

function materialFinishLabel(smoothness: number) {
  if (smoothness < 0.2) return '粗糙';
  if (smoothness < 0.32) return '哑光';
  if (smoothness < 0.5) return '偏哑光';
  return '光滑';
}

function SchemeCard({
  preset,
  menuOpen,
  dragging,
  onApply,
  onMenuToggle,
  onRename,
  onMove,
  onCopy,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  preset: MaterialSchemeWorkspacePreset;
  menuOpen: boolean;
  dragging: boolean;
  onApply: (id: string) => void;
  onMenuToggle: (id: string) => void;
  onRename: (preset: MaterialSchemeWorkspacePreset) => void;
  onMove: (preset: MaterialSchemeWorkspacePreset, category: MaterialSchemeCategory) => void;
  onCopy: (preset: MaterialSchemeWorkspacePreset) => void;
  onDelete: (preset: MaterialSchemeWorkspacePreset) => void;
  onDragStart: (preset: MaterialSchemeWorkspacePreset, event: ReactDragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
}) {
  const finishLabel = materialFinishLabel(preset.smoothness);
  const sourceLabel = SOURCE_LABELS[preset.source];
  const editable = preset.source === 'mine';

  return (
    <article
      className={[
        'material-scheme-workspace__card',
        preset.selected ? 'is-selected' : '',
        editable ? 'is-editable' : '',
        menuOpen ? 'is-menu-open' : '',
        dragging ? 'is-dragging' : '',
      ].filter(Boolean).join(' ')}
      onPointerLeave={() => menuOpen && onMenuToggle('')}
    >
      <button
        type="button"
        className="workspace-item-card material-scheme-workspace__card-apply"
        aria-label={'应用材质方案 ' + preset.type + ' · ' + preset.name}
        aria-pressed={preset.selected}
        draggable={editable}
        onDragStart={(event) => onDragStart(preset, event)}
        onDragEnd={onDragEnd}
        onClick={() => onApply(preset.id)}
      >
        <i className="workspace-item-card__state-line" aria-hidden="true" />
        <div className="workspace-item-card__copy material-scheme-workspace__card-copy">
          <b className="workspace-item-card__title">{preset.name}</b>
          <span className="workspace-item-card__meta material-scheme-workspace__card-meta">
            <span className={'material-scheme-workspace__source is-' + preset.source}>{sourceLabel}</span>
            <i
              className="material-scheme-workspace__color-line"
              style={{ backgroundColor: preset.colors[0] }}
              aria-hidden="true"
            />
            <span className="material-scheme-workspace__card-detail">{preset.type} · {finishLabel}</span>
          </span>
        </div>
      </button>

      {editable && (
        <>
          <button
            type="button"
            className="material-scheme-workspace__menu-trigger"
            aria-label={'管理我的方案 ' + preset.name}
            aria-expanded={menuOpen}
            onClick={() => onMenuToggle(menuOpen ? '' : preset.id)}
          >
            <MoreHorizontal aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="material-scheme-workspace__card-menu" role="menu" aria-label={preset.name + ' 方案操作'}>
              <button type="button" role="menuitem" onClick={() => onRename(preset)}>
                <Pencil aria-hidden="true" /><span>重命名</span>
              </button>
              <div className="material-scheme-workspace__card-menu-section">
                <span>移动到</span>
                <div>
                  {MATERIAL_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={preset.type === category ? 'is-current' : ''}
                      disabled={preset.type === category}
                      onClick={() => onMove(preset, category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" role="menuitem" onClick={() => onCopy(preset)}>
                <Copy aria-hidden="true" /><span>复制参数</span>
              </button>
              <button type="button" role="menuitem" className="is-danger" onClick={() => onDelete(preset)}>
                <Trash2 aria-hidden="true" /><span>删除</span>
              </button>
            </div>
          )}
        </>
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
  workshopPresets,
  customPresets,
  canPasteCurrent,
  currentCategory,
  saveInitialName,
  onClose,
  onApply,
  onSaveCurrent,
  onPasteCurrent,
  onRename,
  onMove,
  onCopy,
  onDelete,
}: Props) {
  const dialogs = useDialogSystem();
  const [category, setCategory] = useState<MaterialSchemeWorkspaceCategory>('全部');
  const [source, setSource] = useState<MaterialSchemeWorkspaceSource>('all');
  const [page, setPage] = useState(0);
  const [menuPresetId, setMenuPresetId] = useState('');
  const [draggingPresetId, setDraggingPresetId] = useState('');
  const [dragTargetCategory, setDragTargetCategory] = useState<MaterialSchemeCategory | null>(null);

  const allPresets = useMemo(
    () => [...systemPresets, ...workshopPresets, ...customPresets],
    [customPresets, systemPresets, workshopPresets],
  );

  const activeItems = useMemo(
    () => allPresets.filter((preset) => {
      const matchesCategory = category === '全部' || preset.type === category;
      const matchesSource = source === 'all' || preset.source === source;
      return matchesCategory && matchesSource;
    }),
    [allPresets, category, source],
  );

  const pageCount = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleItems = pageItems(activeItems, safePage);
  const rows = [visibleItems.slice(0, 4), visibleItems.slice(4, 8)].filter((row) => row.length > 0);
  const draggingPreset = customPresets.find((preset) => preset.id === draggingPresetId) ?? null;

  function validateName(value: string, excludeId?: string) {
    const normalized = value.trim().toLocaleLowerCase();
    if (customPresets.some((preset) => preset.id !== excludeId && preset.name.trim().toLocaleLowerCase() === normalized)) {
      return '“我的方案”中已存在同名配色。';
    }
    return undefined;
  }

  function selectCategory(next: MaterialSchemeWorkspaceCategory) {
    setCategory(next);
    setPage(0);
    setMenuPresetId('');
  }

  function selectSource(next: MaterialSchemeWorkspaceSource) {
    setSource(next);
    setPage(0);
    setMenuPresetId('');
  }

  function openSaveDialog() {
    dialogs.choiceInput({
      title: '保存配色',
      label: '方案名称',
      initialValue: saveInitialName,
      choiceLabel: '分类',
      choices: [...MATERIAL_CATEGORIES],
      initialChoice: currentCategory,
      maxLength: 40,
      helperText: '保存到“我的方案”，之后可重命名或移动分类。',
      validate: (value) => validateName(value),
      confirmText: '保存',
      onConfirm: (name, choice) => {
        onSaveCurrent(name, choice as MaterialSchemeCategory);
        setCategory('全部');
        setSource('mine');
        setPage(0);
        dialogs.toast('已保存到“我的方案”', 'success');
      },
    });
  }

  function renamePreset(preset: MaterialSchemeWorkspacePreset) {
    setMenuPresetId('');
    dialogs.input({
      title: '重命名方案',
      label: '方案名称',
      initialValue: preset.name,
      maxLength: 40,
      helperText: '名称只影响“我的方案”中的显示，不修改材质参数。',
      validate: (value) => validateName(value, preset.id),
      confirmText: '确定',
      onConfirm: (name) => {
        onRename(preset.id, name);
        dialogs.toast('方案已重命名', 'success');
      },
    });
  }

  function movePreset(preset: MaterialSchemeWorkspacePreset, nextCategory: MaterialSchemeCategory) {
    setMenuPresetId('');
    if (preset.type === nextCategory) return;
    const previousCategory = preset.type;
    onMove(preset.id, nextCategory);
    dialogs.toast(
      '已将“' + preset.name + '”移动到“' + nextCategory + '”',
      'success',
      3200,
      '撤销',
      () => onMove(preset.id, previousCategory),
    );
  }

  function copyPreset(preset: MaterialSchemeWorkspacePreset) {
    setMenuPresetId('');
    onCopy(preset.id);
    dialogs.toast('已复制“' + preset.name + '”的参数', 'success');
  }

  function deletePreset(preset: MaterialSchemeWorkspacePreset) {
    setMenuPresetId('');
    dialogs.confirm({
      title: '删除这个配色方案？',
      message: '将从“我的方案”中删除“' + preset.name + '”。',
      confirmText: '删除',
      tone: 'danger',
      onConfirm: () => {
        onDelete(preset.id);
        dialogs.toast('已删除“' + preset.name + '”', 'neutral');
      },
    });
  }

  function beginDrag(preset: MaterialSchemeWorkspacePreset, event: ReactDragEvent<HTMLButtonElement>) {
    if (preset.source !== 'mine') {
      event.preventDefault();
      return;
    }
    setMenuPresetId('');
    setDraggingPresetId(preset.id);
    setDragTargetCategory(null);
    event.dataTransfer.effectAllowed = 'move';
  }

  function endDrag() {
    setDraggingPresetId('');
    setDragTargetCategory(null);
  }

  function allowCategoryDrop(event: ReactDragEvent<HTMLButtonElement>, target: MaterialSchemeWorkspaceCategory) {
    if (!draggingPreset || target === '全部') return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragTargetCategory(target);
  }

  function dropOnCategory(event: ReactDragEvent<HTMLButtonElement>, target: MaterialSchemeWorkspaceCategory) {
    if (!draggingPreset || target === '全部') return;
    event.preventDefault();
    movePreset(draggingPreset, target);
    endDrag();
  }

  const emptyTitle = source === 'mine'
    ? '还没有保存的我的方案'
    : source === 'workshop'
      ? '没有符合条件的创意工坊方案'
      : '没有符合条件的材质方案';

  const emptyDetail = source === 'mine'
    ? '使用右上“保存配色”把左侧当前参数加入这里。'
    : '切换左侧材质类型或顶部来源筛选继续浏览。';

  return (
    <section
      className={'workspace workspace--design workspace--material-scheme material-scheme-workspace motion-bottom-surface is-' + motionPhase + (draggingPreset ? ' is-dragging-preset' : '')}
      aria-label="材质方案工作区"
      aria-busy={motionPhase !== 'steady'}
      data-material-scheme-source={source}
      data-material-scheme-category={category}
      data-material-dragging={draggingPreset ? 'true' : 'false'}
    >
      <header className="workspace-header material-scheme-workspace__header">
        <div className="workspace-title">
          <Palette aria-hidden="true" />
          <b>材质方案</b>
        </div>

        <button className="icon-button" type="button" onClick={onClose} aria-label="关闭材质方案工作区">
          <X />
        </button>
      </header>

      <div className="workspace-body material-scheme-workspace__body">
        <aside className="workspace-primary-rail material-scheme-workspace__rail" aria-label="材质方案分类">
          <div className="workspace-primary-rail__content">
            <span className="workspace-rail-pager-marker" aria-hidden="true" />
            <div className="workspace-primary-rail__page material-scheme-workspace__rail-list">
              {SYSTEM_CATEGORIES.map(({ id, label, icon: Icon }) => {
                const dropTarget = dragTargetCategory === id;
                const dropDisabled = Boolean(draggingPreset) && id === '全部';
                return (
                  <button
                    key={id}
                    type="button"
                    className={[
                      category === id ? 'is-active' : '',
                      dropTarget ? 'is-drop-target' : '',
                      dropDisabled ? 'is-drop-disabled' : '',
                    ].filter(Boolean).join(' ')}
                    aria-pressed={category === id}
                    aria-disabled={dropDisabled || undefined}
                    onClick={() => selectCategory(id)}
                    onDragEnter={(event) => allowCategoryDrop(event, id)}
                    onDragOver={(event) => allowCategoryDrop(event, id)}
                    onDragLeave={() => dropTarget && setDragTargetCategory(null)}
                    onDrop={(event) => dropOnCategory(event, id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    {draggingPreset && id !== '全部' && <small>移动到这里</small>}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="workspace-catalog material-scheme-workspace__catalog">
          <nav className="workspace-context-filter material-scheme-workspace__source-filter" aria-label="材质方案来源筛选">
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

            <div className="material-scheme-workspace__actions">
              <button
                type="button"
                className="material-scheme-workspace__action is-primary"
                onClick={openSaveDialog}
                aria-label="保存配色"
              >
                <Save aria-hidden="true" />
                <span>保存配色</span>
              </button>
              <button
                type="button"
                className="material-scheme-workspace__action"
                disabled={!canPasteCurrent}
                onClick={onPasteCurrent}
                aria-label="粘贴配色"
              >
                <ClipboardPaste aria-hidden="true" />
                <span>粘贴配色</span>
              </button>
            </div>
          </nav>

          <div className="workspace-content-stage material-scheme-workspace__stage">
            {visibleItems.length > 0 ? (
              <div className="workspace-content-rows material-scheme-workspace__rows">
                {rows.map((row, rowIndex) => (
                  <div className="workspace-content-row material-scheme-workspace__row" key={rowIndex}>
                    {row.map((preset) => (
                      <SchemeCard
                        key={preset.id}
                        preset={preset}
                        menuOpen={menuPresetId === preset.id}
                        dragging={draggingPresetId === preset.id}
                        onApply={onApply}
                        onMenuToggle={setMenuPresetId}
                        onRename={renamePreset}
                        onMove={movePreset}
                        onCopy={copyPreset}
                        onDelete={deletePreset}
                        onDragStart={beginDrag}
                        onDragEnd={endDrag}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="workspace-empty material-scheme-workspace__empty">
                <Bookmark aria-hidden="true" />
                <b>{emptyTitle}</b>
                <span>{emptyDetail}</span>
              </div>
            )}
          </div>

          <Pager page={safePage} pageCount={pageCount} onChange={setPage} />
        </div>
      </div>
    </section>
  );
}
