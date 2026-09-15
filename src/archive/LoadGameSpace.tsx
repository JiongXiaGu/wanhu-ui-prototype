import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, FolderOpen, Pencil, Trash2, X } from 'lucide-react';

type SaveKind = 'auto' | 'quick' | 'manual';
type SaveFilter = 'all' | SaveKind;
type Compatibility = 'current' | 'outdated' | 'incompatible';

type SaveEntry = {
  id: string;
  name: string;
  kind: SaveKind;
  gameDate: string;
  savedAt: string;
  image: string;
  version: string;
  compatibility: Compatibility;
  order: number;
};

type GameGroup = {
  id: string;
  city: string;
  playTime: string;
  lastSavedAt: string;
  latestVersion: string;
  image: string;
  saves: SaveEntry[];
};

interface LoadGameSpaceProps {
  context: 'menu';
  onBack: () => void;
  onLoad?: () => void;
}

const CURRENT_VERSION = '0.8.4';
const cityNames = ['昭平城', '临川府', '南陵', '云津府', '江州', '湾陵', '上阳府', '澄江郡', '洛川', '平宁府', '归安县', '青溪县'];
const assetPool = ['/assets/wanhu-gameplay-city.png', '/assets/wanhu-gameplay-lake.png', '/assets/wanhu-main-menu.png'];

const saveKindMeta: Record<SaveKind, { label: string; prefix: string }> = {
  auto: { label: '自动存档', prefix: '自动存档' },
  quick: { label: '快速存档', prefix: '快速存档' },
  manual: { label: '手动存档', prefix: '手动存档' },
};

const filterItems: { key: SaveFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'auto', label: '自动存档' },
  { key: 'manual', label: '手动存档' },
  { key: 'quick', label: '快速存档' },
];

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

function gameDateFor(groupIndex: number, saveIndex: number) {
  const year = Math.max(1, 12 - Math.min(groupIndex, 8) - Math.floor(saveIndex / 18));
  const month = Math.max(1, 8 - Math.floor((saveIndex % 18) / 3));
  const day = Math.max(1, 17 - (saveIndex % 3) * 4);
  return `第${year}年 ${month}月${day}日`;
}

function realSavedAtFor(groupIndex: number, saveIndex: number) {
  const base = Date.UTC(2026, 8, 15, 16, 58);
  const offsetMinutes = groupIndex * 24 * 60 + saveIndex * 17;
  const date = new Date(base - offsetMinutes * 60_000);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function buildSaves(groupIndex: number, count: number): SaveEntry[] {
  return Array.from({ length: count }, (_, index) => {
    const kind = kindFor(index);
    const serial = String(serialFor(index)).padStart(3, '0');
    const version = versionFor(groupIndex, index);
    return {
      id: `g${groupIndex}-s${index}`,
      name: `${saveKindMeta[kind].prefix}.${serial}`,
      kind,
      gameDate: gameDateFor(groupIndex, index),
      savedAt: realSavedAtFor(groupIndex, index),
      image: assetPool[(groupIndex + index) % assetPool.length],
      version,
      compatibility: compatibilityForVersion(version),
      order: count - index,
    };
  });
}

function buildGroups(): GameGroup[] {
  return cityNames.map((city, index) => {
    const saves = buildSaves(index, index === 0 ? 32 : 18 + (index % 5) * 3);
    return {
      id: `group-${index}`,
      city,
      playTime: `${Math.max(5, 46 - index * 3)}h ${String((18 + index * 7) % 60).padStart(2, '0')}m`,
      lastSavedAt: saves[0].savedAt,
      latestVersion: saves[0].version,
      image: assetPool[index % assetPool.length],
      saves,
    };
  });
}

const initialGameGroups = buildGroups();

export function LoadGameSpace({ context, onBack, onLoad }: LoadGameSpaceProps) {
  const [groups, setGroups] = useState<GameGroup[]>(() => structuredClone(initialGameGroups));
  const [groupId, setGroupId] = useState(groups[0].id);
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const [filter, setFilter] = useState<SaveFilter>('all');
  const [hideOutdated, setHideOutdated] = useState(false);
  const [saveId, setSaveId] = useState(group.saves[0]?.id ?? '');
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState(group.city);
  const [editingSaveId, setEditingSaveId] = useState<string | null>(null);
  const [saveNameDraft, setSaveNameDraft] = useState('');
  const [pendingDeleteSaveId, setPendingDeleteSaveId] = useState<string | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);

  const visibleSaves = useMemo(() => [...group.saves]
    .sort((a, b) => b.order - a.order)
    .filter((save) => filter === 'all' || save.kind === filter)
    .filter((save) => !hideOutdated || save.compatibility === 'current'), [group.saves, filter, hideOutdated]);

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
    if (next) updateGroup((item) => ({
      ...item,
      saves: item.saves.map((save) => save.id === saveIdToRename ? { ...save, name: next } : save),
    }));
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

  return (
    <section className={`archive-space archive-space--load archive-space--${context}`} aria-label="读取游戏">
      <header className="global-space-header archive-space__header">
        <div className="global-space-heading"><h1>读取游戏</h1></div>
      </header>

      <div className="archive-space__layout archive-space__layout--browser">
        <aside className="archive-groups">
          <div className="archive-column-heading"><b>游戏组</b><span>{groups.length} 组</span></div>
          <div className="archive-group-list">
            {groups.map((item) => (
              <button key={item.id} type="button" className={`archive-group-card ${item.id === group.id ? 'is-selected' : ''}`} onClick={() => selectGroup(item.id)} title={`游玩时间 ${item.playTime} · 最后保存 ${item.lastSavedAt} · 最新版本 v${item.latestVersion}`}>
                <span className="archive-group-card__image" style={{ backgroundImage: `url(${item.image})` }} />
                <span className="archive-group-card__body">
                  <span className="archive-group-card__title">
                    {item.id === group.id && editingGroup ? (
                      <input autoFocus value={groupNameDraft} aria-label="重命名存档组" onClick={(event) => event.stopPropagation()} onChange={(event) => setGroupNameDraft(event.target.value)} onBlur={commitGroupRename} onKeyDown={(event) => handleRenameKey(event, commitGroupRename, () => setEditingGroup(false))} />
                    ) : <b>{item.city}</b>}
                  </span>
                  <span className="archive-group-card__meta"><small>{item.playTime}</small><i /><small>最后保存 {item.lastSavedAt}</small></span>
                  <span className="archive-group-card__latest-version">最新版本 v{item.latestVersion}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="archive-saves">
          <header className="archive-saves-toolbar">
            <nav className="archive-save-type-tabs" aria-label="存档类型筛选">
              {filterItems.map((item) => <button key={item.key} type="button" className={filter === item.key ? 'is-active' : ''} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label}</button>)}
            </nav>
            <button type="button" className={`archive-hide-outdated ${hideOutdated ? 'is-on' : ''}`} role="switch" aria-checked={hideOutdated} onClick={() => setHideOutdated((current) => !current)}>
              <span>隐藏过时存档</span><i><em /></i>
            </button>
          </header>

          <div className="archive-save-list">
            {visibleSaves.map((save) => {
              const selected = selectedSave?.id === save.id;
              const editing = editingSaveId === save.id;
              const confirmingDelete = pendingDeleteSaveId === save.id;
              const incompatible = save.compatibility === 'incompatible';
              return (
                <article key={save.id} data-save-kind={save.kind} data-compatibility={save.compatibility} className={`archive-save-card ${selected ? 'is-selected' : ''} is-${save.kind} is-${save.compatibility}`} onMouseEnter={() => setSaveId(save.id)} onDoubleClick={() => !incompatible && onLoad?.()}>
                  <button type="button" className="archive-save-card__select" aria-label={`选择存档 ${save.name}`} onClick={() => setSaveId(save.id)}>
                    <span className="archive-save-card__image" style={{ backgroundImage: `url(${save.image})` }} />
                    <span className="archive-save-card__copy">
                      <span className="archive-save-card__title-row">
                        {editing ? (
                          <input autoFocus value={saveNameDraft} aria-label="重命名存档" onClick={(event) => event.stopPropagation()} onChange={(event) => setSaveNameDraft(event.target.value)} onBlur={() => commitSaveRename(save.id)} onKeyDown={(event) => handleRenameKey(event, () => commitSaveRename(save.id), () => setEditingSaveId(null))} />
                        ) : <b>{save.name}</b>}
                      </span>
                      <span className="archive-save-card__time-row"><small>游戏时间</small><span>{save.gameDate}</span></span>
                      <span className="archive-save-card__time-row"><small>保存时间</small><span>{save.savedAt}</span></span>
                    </span>
                  </button>

                  <div className="archive-save-card__status" aria-label={`${saveKindMeta[save.kind].label} · 版本 ${save.version}`}>
                    {save.compatibility === 'outdated' && <em className="is-outdated">过时</em>}
                    {save.compatibility === 'incompatible' && <em className="is-incompatible">不兼容</em>}
                    <span className={`archive-save-card__type is-${save.kind}`}>{saveKindMeta[save.kind].label}</span>
                    <span className="archive-save-card__version">v{save.version}</span>
                  </div>

                  <div className="archive-save-card__actions" aria-label="存档操作">
                    <button type="button" title="重命名存档" aria-label={`重命名 ${save.name}`} onClick={() => startSaveRename(save)}><Pencil size={15} /></button>
                    <button type="button" className="is-primary" disabled={incompatible} title={incompatible ? '当前版本无法读取此存档' : '读取存档'} aria-label={`读取 ${save.name}`} onClick={() => !incompatible && onLoad?.()}><FolderOpen size={16} /></button>
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
            {visibleSaves.length === 0 && <div className="archive-save-empty-state">当前筛选下没有可显示的存档。</div>}
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
