import { useEffect, useMemo, useState, type DragEvent as ReactDragEvent } from 'react';
import {
  Bookmark,
  ClipboardPaste,
  Copy,
  Grid3X3,
  Hammer,
  House,
  Layers,
  MoreHorizontal,
  Mountain,
  Palette,
  Paintbrush,
  Pencil,
  Save,
  Shapes,
  Shirt,
  Square,
  Trash2,
  Trees,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useDialogSystem } from '../../../../ui/dialog/DialogSystem';
import type { MotionPhase } from '../../../../ui/motion';

export type MaterialFamily =
  | 'wood'
  | 'stone'
  | 'metal'
  | 'masonry'
  | 'plaster-earth'
  | 'fabric'
  | 'glass'
  | 'lacquer'
  | 'other';

export type MaterialSchemeWorkspaceCategory = 'all' | MaterialFamily;
export type MaterialSchemeWorkspaceSource = 'all' | 'builtin' | 'workshop' | 'mine';
export type MaterialSchemePresetSource = Exclude<MaterialSchemeWorkspaceSource, 'all'>;

export const MATERIAL_FAMILY_LABELS: Record<MaterialFamily, string> = {
  wood: '木材',
  stone: '石材',
  metal: '金属',
  masonry: '砖瓦',
  'plaster-earth': '灰泥 / 土',
  fabric: '布料',
  glass: '玻璃',
  lacquer: '漆饰',
  other: '其他',
};

export interface MaterialSchemeWorkspacePreset {
  id: string;
  family: MaterialFamily;
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
  currentFamily: MaterialFamily;
  saveInitialName: string;
  onClose: () => void;
  onApply: (id: string) => void;
  onSaveCurrent: (name: string, family: MaterialFamily) => string;
  onPasteCurrent: () => void;
  onUpdateMetadata: (id: string, patch: { name?: string; family?: MaterialFamily }) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 8;
const CATEGORY_PAGE_SIZE = 7;
const MATERIAL_FAMILIES = Object.keys(MATERIAL_FAMILY_LABELS) as MaterialFamily[];

const MATERIAL_CATEGORIES: readonly {
  id: MaterialSchemeWorkspaceCategory;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'all', label: '全部', icon: Grid3X3 },
  { id: 'wood', label: '木材', icon: Trees },
  { id: 'stone', label: '石材', icon: Mountain },
  { id: 'metal', label: '金属', icon: Hammer },
  { id: 'masonry', label: '砖瓦', icon: House },
  { id: 'plaster-earth', label: '灰泥 / 土', icon: Layers },
  { id: 'fabric', label: '布料', icon: Shirt },
  { id: 'glass', label: '玻璃', icon: Square },
  { id: 'lacquer', label: '漆饰', icon: Paintbrush },
  { id: 'other', label: '其他', icon: Shapes },
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

function pageItems<T>(items: readonly T[], page: number, pageSize = PAGE_SIZE) {
  return items.slice(page * pageSize, (page + 1) * pageSize);
}

function materialFinishLabel(smoothness: number) {
  if (smoothness < 0.2) return '粗糙';
  if (smoothness < 0.32) return '哑光';
  if (smoothness < 0.5) return '偏哑光';
  return '光滑';
}

function familyFromLabel(label: string) {
  return MATERIAL_FAMILIES.find((family) => MATERIAL_FAMILY_LABELS[family] === label) ?? null;
}

function familyRailPage(family: MaterialFamily) {
  const index = MATERIAL_CATEGORIES.findIndex((entry) => entry.id === family);
  return Math.max(0, Math.floor(index / CATEGORY_PAGE_SIZE));
}

function SchemeCard({
  preset,
  menuOpen,
  dragging,
  highlighted,
  onApply,
  onMenuToggle,
  onEdit,
  onCopy,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  preset: MaterialSchemeWorkspacePreset;
  menuOpen: boolean;
  dragging: boolean;
  highlighted: boolean;
  onApply: (id: string) => void;
  onMenuToggle: (id: string) => void;
  onEdit: (preset: MaterialSchemeWorkspacePreset) => void;
  onCopy: (preset: MaterialSchemeWorkspacePreset) => void;
  onDelete: (preset: MaterialSchemeWorkspacePreset) => void;
  onDragStart: (preset: MaterialSchemeWorkspacePreset, event: ReactDragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
}) {
  const finishLabel = materialFinishLabel(preset.smoothness);
  const sourceLabel = SOURCE_LABELS[preset.source];
  const familyLabel = MATERIAL_FAMILY_LABELS[preset.family];
  const editable = preset.source === 'mine';

  return (
    <article
      className={[
        'material-scheme-workspace__card',
        preset.selected ? 'is-selected' : '',
        editable ? 'is-editable' : '',
        menuOpen ? 'is-menu-open' : '',
        dragging ? 'is-dragging' : '',
        highlighted ? 'is-revealed' : '',
      ].filter(Boolean).join(' ')}
      onPointerLeave={() => menuOpen && onMenuToggle('')}
    >
      <button
        type="button"
        className="workspace-item-card material-scheme-workspace__card-apply"
        aria-label={'应用材质方案 ' + familyLabel + ' · ' + preset.name}
        aria-pressed={preset.selected}
        draggable={editable}
        onDragStart={(event) => onDragStart(preset, event)}
        onDragEnd={onDragEnd}
        onClick={() => onApply(preset.id)}
      >
        <i className="workspace-item-card__state-line" aria-hidden="true" />
        <div className="workspace-item-card__copy material-scheme-workspace__card-copy">
          <div className="material-scheme-workspace__card-head">
            <b className="workspace-item-card__title">{preset.name}</b>
            <span className={'material-scheme-workspace__source is-' + preset.source}>{sourceLabel}</span>
          </div>
          <span className="workspace-item-card__meta material-scheme-workspace__card-meta">
            <i
              className="material-scheme-workspace__color-line"
              style={{ backgroundColor: preset.colors[0] }}
              aria-hidden="true"
            />
            <span className="material-scheme-workspace__card-detail">{familyLabel} · {finishLabel}</span>
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
            <div
              className="material-scheme-workspace__card-menu"
              role="menu"
              aria-label={preset.name + ' 方案操作'}
            >
              <button type="button" role="menuitem" onClick={() => onEdit(preset)}>
                <Pencil aria-hidden="true" /><span>编辑</span>
              </button>
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
  currentFamily,
  saveInitialName,
  onClose,
  onApply,
  onSaveCurrent,
  onPasteCurrent,
  onUpdateMetadata,
  onCopy,
  onDelete,
}: Props) {
  const dialogs = useDialogSystem();
  const [category, setCategory] = useState<MaterialSchemeWorkspaceCategory>('all');
  const [categoryPage, setCategoryPage] = useState(0);
  const [source, setSource] = useState<MaterialSchemeWorkspaceSource>('all');
  const [page, setPage] = useState(0);
  const [menuPresetId, setMenuPresetId] = useState('');
  const [draggingPresetId, setDraggingPresetId] = useState('');
  const [dragTargetFamily, setDragTargetFamily] = useState<MaterialFamily | null>(null);
  const [highlightPresetId, setHighlightPresetId] = useState('');
  const [highlightVersion, setHighlightVersion] = useState(0);

  useEffect(() => {
    if (!highlightPresetId) return;
    const timer = window.setTimeout(() => setHighlightPresetId(''), 650);
    return () => window.clearTimeout(timer);
  }, [highlightPresetId, highlightVersion]);

  const allPresets = useMemo(
    () => [...systemPresets, ...workshopPresets, ...customPresets],
    [customPresets, systemPresets, workshopPresets],
  );

  const activeItems = useMemo(
    () => allPresets.filter((preset) => {
      const matchesCategory = category === 'all' || preset.family === category;
      const matchesSource = source === 'all' || preset.source === source;
      return matchesCategory && matchesSource;
    }),
    [allPresets, category, source],
  );

  const categoryPageCount = Math.max(1, Math.ceil(MATERIAL_CATEGORIES.length / CATEGORY_PAGE_SIZE));
  const visibleCategories = pageItems(MATERIAL_CATEGORIES, categoryPage, CATEGORY_PAGE_SIZE);
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

  function revealMovedPreset(presetId: string, nextFamily: MaterialFamily) {
    const moved = allPresets.map((preset) => preset.id === presetId ? { ...preset, family: nextFamily } : preset);
    const targetItems = moved.filter((preset) => {
      const matchesSource = source === 'all' || preset.source === source;
      return matchesSource && preset.family === nextFamily;
    });
    const targetIndex = Math.max(0, targetItems.findIndex((preset) => preset.id === presetId));

    setCategoryPage(familyRailPage(nextFamily));
    setCategory(nextFamily);
    setPage(Math.floor(targetIndex / PAGE_SIZE));
    setHighlightPresetId(presetId);
    setHighlightVersion((current) => current + 1);
  }

  function openSaveDialog() {
    const defaultFamily = category === 'all' ? currentFamily : category;

    dialogs.choiceInput({
      title: '保存配色',
      label: '方案名称',
      initialValue: saveInitialName,
      choiceLabel: '材质分类',
      choices: MATERIAL_FAMILIES.map((family) => MATERIAL_FAMILY_LABELS[family]),
      initialChoice: MATERIAL_FAMILY_LABELS[defaultFamily],
      choiceLayout: 'grid',
      maxLength: 40,
      helperText: '保存到“我的方案”，名称和分类之后仍可编辑。',
      validate: (value) => validateName(value),
      confirmText: '保存',
      onConfirm: (name, choice) => {
        const family = familyFromLabel(choice);
        if (!family) return;
        const existingInFamily = customPresets.filter((preset) => preset.family === family).length;
        const newId = onSaveCurrent(name, family);

        setSource('mine');
        setCategoryPage(familyRailPage(family));
        setCategory(family);
        setPage(Math.floor(existingInFamily / PAGE_SIZE));
        setHighlightPresetId(newId);
        setHighlightVersion((current) => current + 1);
      },
    });
  }

  function editPreset(preset: MaterialSchemeWorkspacePreset) {
    setMenuPresetId('');
    dialogs.choiceInput({
      title: '编辑方案',
      label: '方案名称',
      initialValue: preset.name,
      choiceLabel: '材质分类',
      choices: MATERIAL_FAMILIES.map((family) => MATERIAL_FAMILY_LABELS[family]),
      initialChoice: MATERIAL_FAMILY_LABELS[preset.family],
      choiceLayout: 'grid',
      maxLength: 40,
      helperText: '这里仅编辑方案名称与分类；材质参数继续在左侧调整。',
      validate: (value) => validateName(value, preset.id),
      confirmText: '保存修改',
      onConfirm: (name, choice) => {
        const family = familyFromLabel(choice);
        if (!family) return;
        onUpdateMetadata(preset.id, { name, family });

        if (family !== preset.family) {
          revealMovedPreset(preset.id, family);
        } else {
          setHighlightPresetId(preset.id);
          setHighlightVersion((current) => current + 1);
        }
      },
    });
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
      onConfirm: () => onDelete(preset.id),
    });
  }

  function beginDrag(preset: MaterialSchemeWorkspacePreset, event: ReactDragEvent<HTMLButtonElement>) {
    if (preset.source !== 'mine') {
      event.preventDefault();
      return;
    }
    setMenuPresetId('');
    setDraggingPresetId(preset.id);
    setDragTargetFamily(null);
    event.dataTransfer.effectAllowed = 'move';
  }

  function endDrag() {
    setDraggingPresetId('');
    setDragTargetFamily(null);
  }

  function allowCategoryDrop(event: ReactDragEvent<HTMLButtonElement>, target: MaterialSchemeWorkspaceCategory) {
    if (!draggingPreset || target === 'all') return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragTargetFamily(target);
  }

  function dropOnCategory(event: ReactDragEvent<HTMLButtonElement>, target: MaterialSchemeWorkspaceCategory) {
    if (!draggingPreset || target === 'all') return;
    event.preventDefault();
    const presetId = draggingPreset.id;
    onUpdateMetadata(presetId, { family: target });
    revealMovedPreset(presetId, target);
    endDrag();
  }

  const emptyTitle = source === 'mine'
    ? '还没有保存的我的方案'
    : source === 'workshop'
      ? '没有符合条件的创意工坊方案'
      : '没有符合条件的材质方案';

  const emptyDetail = source === 'mine'
    ? '使用右上“保存配色”把左侧当前参数加入这里。'
    : '切换左侧材质分类或顶部来源筛选继续浏览。';

  return (
    <section
      className={'workspace workspace--catalog workspace--material-scheme material-scheme-workspace motion-bottom-surface is-' + motionPhase + (draggingPreset ? ' is-dragging-preset' : '')}
      aria-label="材质方案工作区"
      aria-busy={motionPhase !== 'steady'}
      data-material-scheme-source={source}
      data-material-scheme-category={category}
      data-material-category-page={categoryPage + 1}
      data-material-dragging={draggingPreset ? 'true' : 'false'}
      data-material-highlight-preset={highlightPresetId || undefined}
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
            {categoryPageCount > 1 ? (
              <div className="workspace-rail-pager" aria-label="材质分类组">
                <i className="workspace-rail-pager__track" aria-hidden="true" />
                {Array.from({ length: categoryPageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={categoryPage === index ? 'is-active' : ''}
                    aria-label={'切换到第 ' + (index + 1) + ' 组材质分类'}
                    onClick={() => {
                      setCategoryPage(index);
                      setDragTargetFamily(null);
                    }}
                  >
                    <span />
                  </button>
                ))}
              </div>
            ) : (
              <span className="workspace-rail-pager-marker" aria-hidden="true" />
            )}

            <div className="workspace-primary-rail__page material-scheme-workspace__rail-list" key={categoryPage}>
              {visibleCategories.map(({ id, label, icon: Icon }) => {
                const dropTarget = dragTargetFamily === id;
                const dropDisabled = Boolean(draggingPreset) && id === 'all';
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
                    onDragLeave={() => dropTarget && setDragTargetFamily(null)}
                    onDrop={(event) => dropOnCategory(event, id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    {draggingPreset && id !== 'all' && <small>移动到这里</small>}
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
                        highlighted={highlightPresetId === preset.id}
                        onApply={onApply}
                        onMenuToggle={setMenuPresetId}
                        onEdit={editPreset}
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
