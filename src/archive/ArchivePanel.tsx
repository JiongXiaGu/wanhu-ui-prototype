import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  Bookmark,
  Check,
  ChevronLeft,
  Clock3,
  FolderOpen,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  X,
  Zap,
} from 'lucide-react';

export type ArchiveMode = 'load' | 'save';

interface ArchivePanelProps {
  mode: ArchiveMode;
  context: 'menu' | 'pause';
  onBack: () => void;
  onLoad?: () => void;
}

type SaveKind = 'auto' | 'quick' | 'manual';
type SaveFilter = 'all' | SaveKind;
type Compatibility = 'current' | 'outdated' | 'incompatible';

type SaveEntry = {
  id: string;
  name: string;
  kind: SaveKind;
  dateLabel: string;
  meta: string;
  savedAt: string;
  image: string;
  version: string;
  compatibility: Compatibility;
  order: number;
};

type GameGroup = {
  id: string;
  city: string;
  era: string;
  season: string;
  playTime: string;
  lastPlayed: string;
  population: string;
  wealth: string;
  seed: string;
  version: string;
  image: string;
  saves: SaveEntry[];
};

const CURRENT_VERSION = '0.8.4';
const cityNames = ['昭平城', '临川府', '南陵', '云津府', '江州', '湾陵', '上阳府', '澄江郡', '洛川', '平宁府', '归安县', '青溪县'];
const assetPool = ['/assets/wanhu-gameplay-city.png', '/assets/wanhu-gameplay-lake.png', '/assets/wanhu-main-menu.png'];

const saveKindMeta: Record<SaveKind, { label: string; prefix: string; Icon: typeof RefreshCw }> = {
  auto: { label: '自动存档', prefix: '自动存档', Icon: RefreshCw },
  quick: { label: '快速存档', prefix: '快速存档', Icon: Zap },
  manual: { label: '玩家存档', prefix: '玩家存档', Icon: Bookmark },
};

function compatibilityForVersion(version: string): Compatibility {
  if (version === CURRENT_VERSION) return 'current';
  if (version.startsWith('0.8.')) return 'outdated';
  return 'incompatible';
}

function versionFor(groupIndex: number, saveIndex: number) {
  if (groupIndex >= 10) return saveIndex % 4 === 0 ? '0.7.8' : '0.7.6';
  if (groupIndex >= 7) return saveIndex < 4 ? '0.8.3' : saveIndex % 5 === 0 ? '0.7.8' : '0.8.2';
  if (saveIndex < 5) return CURRENT_VERSION;
  if (saveIndex % 11 === 0) return '0.7.8';
  if (saveIndex % 5 === 0) return '0.8.3';
  return CURRENT_VERSION;
}

function kindFor(index: number): SaveKind {
  if (index === 0) return 'auto';
  if (index === 1) return 'quick';
  if (index === 2) return 'manual';
  const cycle: SaveKind[] = ['manual', 'auto', 'manual', 'quick', 'manual', 'auto'];
  return cycle[(index - 3) % cycle.length];
}

function serialFor(index: number) {
  if (index === 0) return 1;
  if (index === 1) return 8;
  if (index === 2) return 25;
  return index + 26;
}

function buildSaves(groupIndex: number, count: number, era: string, season: string): SaveEntry[] {
  return Array.from({ length: count }, (_, index) => {
    const kind = kindFor(index);
    const serial = String(serialFor(index)).padStart(3, '0');
    const version = versionFor(groupIndex, index);
    const minutes = index * 9 + groupIndex * 4;
    const dayOffset = Math.floor(minutes / 360);
    const hour = Math.max(0, 16 - Math.floor((minutes % 360) / 60));
    const minute = Math.max(0, 58 - (minutes % 60));
    const dateLabel = dayOffset === 0 ? '今天' : dayOffset === 1 ? '昨天' : `9 月 ${Math.max(1, 15 - dayOffset)} 日`;
    return {
      id: `g${groupIndex}-s${index}`,
      name: `${saveKindMeta[kind].prefix}.${serial}`,
      kind,
      dateLabel,
      meta: `${era} · ${season}`,
      savedAt: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      image: assetPool[(groupIndex + index) % assetPool.length],
      version,
      compatibility: compatibilityForVersion(version),
      order: count - index,
    };
  });
}

function buildGroups(): GameGroup[] {
  return cityNames.map((city, index) => {
    const era = `第${12 - Math.min(index, 9)}年`;
    const seasons = ['秋 · 晴', '夏 · 多云', '春 · 小雨', '冬 · 阴'];
    const season = seasons[index % seasons.length];
    const saves = buildSaves(index, index === 0 ? 32 : 18 + (index % 5) * 3, era, season);
    return {
      id: `group-${index}`,
      city,
      era,
      season,
      playTime: `${Math.max(5, 46 - index * 3)}h ${String((18 + index * 7) % 60).padStart(2, '0')}m`,
      lastPlayed: index === 0 ? '今天 16:58' : index === 1 ? '今天 13:21' : index === 2 ? '昨天 22:16' : `9 月 ${Math.max(1, 15 - index)} 日`,
      population: (8426 - index * 421).toLocaleString('zh-CN'),
      wealth: (24680 - index * 960).toLocaleString('zh-CN'),
      seed: String(268041 + index * 11731),
      version: saves[0].version,
      image: assetPool[index % assetPool.length],
      saves,
    };
  });
}

const initialGameGroups = buildGroups();
const filterItems: { key: SaveFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'auto', label: '自动存档' },
  { key: 'quick', label: '快速存档' },
  { key: 'manual', label: '玩家存档' },
];

export function ArchivePanel({ mode, context, onBack, onLoad }: ArchivePanelProps) {
  const isLoad = mode === 'load';
  const [groups, setGroups] = useState<GameGroup[]>(() => structuredClone(isLoad ? initialGameGroups : [initialGameGroups[0]]));
  const [groupId, setGroupId] = useState(groups[0].id);
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const [filter, setFilter] = useState<SaveFilter>('all');
  const [hideOutdated, setHideOutdated] = useState(false);
  const [saveId, setSaveId] = useState(group.saves[0]?.id ?? '');
  const [saved, setSaved] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState(group.city);
  const [editingSaveId, setEditingSaveId] = useState<string | null>(null);
  const [saveNameDraft, setSaveNameDraft] = useState('');
  const [pendingDeleteSaveId, setPendingDeleteSaveId] = useState<string | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);

  const visibleSaves = useMemo(() => {
    return [...group.saves]
      .sort((a, b) => b.order - a.order)
      .filter((save) => filter === 'all' || save.kind === filter)
      .filter((save) => !hideOutdated || save.compatibility === 'current');
  }, [group.saves, filter, hideOutdated]);

  const selectedSave = useMemo(() => group.saves.find((save) => save.id === saveId), [group.saves, saveId]);

  useEffect(() => {
    if (visibleSaves.length === 0) {
      setSaveId('');
      return;
    }
    if (!visibleSaves.some((save) => save.id === saveId)) setSaveId(visibleSaves[0].id);
  }, [visibleSaves, saveId]);

  function updateGroup(mutator: (item: GameGroup) => GameGroup) {
    setGroups((current) => current.map((item) => item.id === group.id ? mutator(item) : item));
  }

  function selectGroup(nextId: string) {
    const next = groups.find((item) => item.id === nextId);
    if (!next) return;
    setGroupId(nextId);
    setFilter('all');
    setSaveId([...next.saves].sort((a, b) => b.order - a.order)[0]?.id ?? '');
    setSaved(false);
    setEditingGroup(false);
    setEditingSaveId(null);
    setPendingDeleteSaveId(null);
    setGroupNameDraft(next.city);
  }

  function startGroupRename() {
    setGroupNameDraft(group.city);
    setEditingGroup(true);
  }

  function commitGroupRename() {
    const next = groupNameDraft.trim();
    if (next) updateGroup((item) => ({ ...item, city: next }));
    setEditingGroup(false);
  }

  function startSaveRename(save: SaveEntry) {
    setSaveNameDraft(save.name);
    setEditingSaveId(save.id);
    setSaveId(save.id);
  }

  function commitSaveRename(saveIdToRename: string) {
    const next = saveNameDraft.trim();
    if (next) {
      updateGroup((item) => ({
        ...item,
        saves: item.saves.map((save) => save.id === saveIdToRename ? { ...save, name: next } : save),
      }));
    }
    setEditingSaveId(null);
  }

  function deleteSave(saveIdToDelete: string) {
    const remaining = group.saves.filter((save) => save.id !== saveIdToDelete);
    if (remaining.length === 0) return;
    updateGroup((item) => ({ ...item, saves: remaining }));
    if (saveId === saveIdToDelete) setSaveId([...remaining].sort((a, b) => b.order - a.order)[0]?.id ?? '');
    setPendingDeleteSaveId(null);
  }

  function deleteCurrentGroup() {
    if (groups.length <= 1) return;
    const index = groups.findIndex((item) => item.id === group.id);
    const remaining = groups.filter((item) => item.id !== group.id);
    const next = remaining[Math.max(0, Math.min(index, remaining.length - 1))];
    setGroups(remaining);
    setGroupId(next.id);
    setFilter('all');
    setSaveId([...next.saves].sort((a, b) => b.order - a.order)[0]?.id ?? '');
    setConfirmDeleteGroup(false);
    setEditingGroup(false);
    setGroupNameDraft(next.city);
  }

  function handleRenameKey(event: KeyboardEvent<HTMLInputElement>, commit: () => void, cancel: () => void) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  }

  function activateSave(save: SaveEntry) {
    if (isLoad) {
      if (save.compatibility === 'incompatible') return;
      onLoad?.();
      return;
    }
    if (save.kind !== 'auto') setSaved(true);
  }

  function createManualSave() {
    const manualCount = group.saves.filter((save) => save.kind === 'manual').length;
    const serial = String(manualCount + 100).padStart(3, '0');
    const next: SaveEntry = {
      id: `${group.id}-new-${Date.now()}`,
      name: `玩家存档.${serial}`,
      kind: 'manual',
      dateLabel: '现在',
      meta: `${group.era} · ${group.season}`,
      savedAt: '当前',
      image: group.image,
      version: CURRENT_VERSION,
      compatibility: 'current',
      order: Math.max(...group.saves.map((save) => save.order), 0) + 1,
    };
    updateGroup((item) => ({ ...item, saves: [next, ...item.saves] }));
    setFilter('all');
    setSaveId(next.id);
    setSaved(true);
  }

  return (
    <section className={`archive-space archive-space--${mode} archive-space--${context}`} aria-label={isLoad ? '读取游戏' : '保存游戏'}>
      <header className="global-space-header archive-space__header">
        <div className="global-space-heading"><h1>{isLoad ? '读取游戏' : '保存游戏'}</h1></div>
      </header>

      <div className="archive-space__layout archive-space__layout--browser">
        <aside className="archive-groups">
          <div className="archive-column-heading"><b>{isLoad ? '游戏组' : '当前游戏'}</b><span>{groups.length} 组</span></div>
          <div className="archive-group-list">
            {groups.map((item) => {
              const oldCount = item.saves.filter((save) => save.compatibility !== 'current').length;
              const incompatibleCount = item.saves.filter((save) => save.compatibility === 'incompatible').length;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`archive-group-card ${item.id === group.id ? 'is-selected' : ''}`}
                  onClick={() => selectGroup(item.id)}
                  title={`游戏时间 ${item.playTime} · 最近 ${item.lastPlayed}`}
                >
                  <span className="archive-group-card__image" style={{ backgroundImage: `url(${item.image})` }} />
                  <span className="archive-group-card__body">
                    <span className="archive-group-card__title">
                      {item.id === group.id && editingGroup ? (
                        <input
                          autoFocus
                          value={groupNameDraft}
                          aria-label="重命名存档组"
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => setGroupNameDraft(event.target.value)}
                          onBlur={commitGroupRename}
                          onKeyDown={(event) => handleRenameKey(event, commitGroupRename, () => setEditingGroup(false))}
                        />
                      ) : <b>{item.city}</b>}
                      <small>{item.saves.length} 个存档</small>
                    </span>
                    <span>{item.era} · {item.season}</span>
                    <span className="archive-group-card__version-row">
                      <small>v{item.version}</small>
                      {oldCount > 0 && <em className={incompatibleCount > 0 ? 'is-incompatible' : ''}>{incompatibleCount > 0 ? '含不兼容存档' : '含旧版存档'}</em>}
                    </span>
                    <small><Clock3 size={11} />{item.playTime}<i />{item.lastPlayed}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="archive-saves">
          <header className="archive-saves-toolbar">
            <nav className="archive-save-type-tabs" aria-label="存档类型筛选">
              {filterItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={filter === item.key ? 'is-active' : ''}
                  aria-pressed={filter === item.key}
                  onClick={() => setFilter(item.key)}
                >{item.label}</button>
              ))}
            </nav>
            <button
              type="button"
              className={`archive-hide-outdated ${hideOutdated ? 'is-on' : ''}`}
              role="switch"
              aria-checked={hideOutdated}
              onClick={() => setHideOutdated((current) => !current)}
            >
              <span>隐藏过时存档</span><i><em /></i>
            </button>
          </header>

          <div className="archive-save-list">
            {visibleSaves.map((save) => {
              const selected = selectedSave?.id === save.id;
              const editing = editingSaveId === save.id;
              const confirmingDelete = pendingDeleteSaveId === save.id;
              const { Icon, label } = saveKindMeta[save.kind];
              const incompatible = save.compatibility === 'incompatible';
              return (
                <article
                  key={save.id}
                  data-save-kind={save.kind}
                  data-compatibility={save.compatibility}
                  className={`archive-save-card ${selected ? 'is-selected' : ''} is-${save.kind} is-${save.compatibility}`}
                  onMouseEnter={() => setSaveId(save.id)}
                  onDoubleClick={() => activateSave(save)}
                >
                  <button
                    type="button"
                    className="archive-save-card__select"
                    aria-label={`选择存档 ${save.name}`}
                    onClick={() => setSaveId(save.id)}
                  >
                    <span className="archive-save-card__image" style={{ backgroundImage: `url(${save.image})` }} />
                    <span className="archive-save-card__copy">
                      <span className="archive-save-card__title-row">
                        {editing ? (
                          <input
                            autoFocus
                            value={saveNameDraft}
                            aria-label="重命名存档"
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => setSaveNameDraft(event.target.value)}
                            onBlur={() => commitSaveRename(save.id)}
                            onKeyDown={(event) => handleRenameKey(event, () => commitSaveRename(save.id), () => setEditingSaveId(null))}
                          />
                        ) : <b>{save.name}</b>}
                      </span>
                      <span>{save.meta}</span>
                      <small>{save.dateLabel} · {save.savedAt}</small>
                    </span>
                  </button>

                  <div className="archive-save-card__status" title={`${label} · 版本 ${save.version}`}>
                    <span className={`archive-save-card__kind is-${save.kind}`}><Icon size={14} /></span>
                    <span className="archive-save-card__version">v{save.version}</span>
                    {save.compatibility === 'outdated' && <em className="is-outdated">旧版</em>}
                    {save.compatibility === 'incompatible' && <em className="is-incompatible">不兼容</em>}
                  </div>

                  <div className="archive-save-card__actions" aria-label="存档操作">
                    <button type="button" title="重命名存档" aria-label={`重命名 ${save.name}`} onClick={() => startSaveRename(save)}><Pencil size={15} /></button>
                    <button
                      type="button"
                      className="is-primary"
                      disabled={isLoad && incompatible}
                      title={incompatible ? '当前版本无法读取此存档' : isLoad ? '读取存档' : '保存到此存档'}
                      aria-label={`${isLoad ? '读取' : '保存'} ${save.name}`}
                      onClick={() => activateSave(save)}
                    >{isLoad ? <FolderOpen size={16} /> : <Save size={16} />}</button>
                    <button type="button" className="is-danger" title="删除存档" aria-label={`删除 ${save.name}`} onClick={() => setPendingDeleteSaveId(save.id)}><Trash2 size={15} /></button>
                  </div>

                  {confirmingDelete && (
                    <div className="archive-save-card__confirm">
                      <span>删除这个存档？</span>
                      <button type="button" aria-label="取消删除" onClick={() => setPendingDeleteSaveId(null)}><X size={13} /></button>
                      <button type="button" className="is-danger" aria-label="确认删除存档" onClick={() => deleteSave(save.id)}><Trash2 size={13} /></button>
                    </div>
                  )}
                </article>
              );
            })}

            {!isLoad && (filter === 'all' || filter === 'manual') && (
              <button type="button" className="archive-create-save" onClick={createManualSave}>
                <Save size={16} /><span><b>创建玩家存档</b><small>保存当前城市进度</small></span>
              </button>
            )}

            {visibleSaves.length === 0 && (
              <div className="archive-save-empty-state">当前筛选下没有可显示的存档。</div>
            )}
          </div>
        </main>
      </div>

      <footer className="global-space-footer archive-space__footer" aria-label="页面操作">
        <div className="archive-space__footer-left">
          <button type="button" className="archive-footer-action" onClick={startGroupRename}><Pencil size={14} />重命名存档组</button>
          <button type="button" className="archive-footer-action archive-footer-action--danger" disabled={groups.length <= 1} onClick={() => setConfirmDeleteGroup(true)}><Trash2 size={14} />删除存档组</button>
        </div>
        <div className="archive-space__footer-right">
          <button type="button" className="global-space-secondary archive-footer-back" onClick={onBack}><ChevronLeft size={14} />返回</button>
        </div>
      </footer>

      {confirmDeleteGroup && (
        <div className="archive-confirm-layer" role="dialog" aria-modal="true" aria-label="删除存档组">
          <section className="archive-confirm-dialog">
            <h2>删除“{group.city}”存档组？</h2>
            <p>这将删除该游戏组中的全部 {group.saves.length} 个存档。</p>
            <footer>
              <button type="button" onClick={() => setConfirmDeleteGroup(false)}>取消</button>
              <button type="button" className="is-danger" onClick={deleteCurrentGroup}><Trash2 size={14} />删除存档组</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
