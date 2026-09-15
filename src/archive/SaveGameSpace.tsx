import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, Pencil, Save, Trash2, X, Zap } from 'lucide-react';
import { SaveEntryCard, type SaveCompatibility, type SaveEntryCardData, type SaveKind } from './SaveEntryCard';

interface SaveGameSpaceProps {
  context: 'pause';
  onBack: () => void;
}

type SaveFilter = 'all' | SaveKind;
type SaveEntry = SaveEntryCardData & { order: number };

const CURRENT_VERSION = '0.8.4';
const INITIAL_GROUP_NAME = '昭平城';
const CURRENT_PLAY_TIME = '46h 18m';
const CURRENT_GAME_DATE = '第12年 8月17日';
const CURRENT_SAVED_AT = '2026-09-15 18:43';
const QUICK_SAVE_LIMIT = 10;
const assetPool = ['/assets/wanhu-gameplay-city.png', '/assets/wanhu-gameplay-lake.png', '/assets/wanhu-main-menu.png'];

const filterItems: { key: SaveFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'auto', label: '自动存档' },
  { key: 'manual', label: '手动存档' },
  { key: 'quick', label: '快速存档' },
];

function compatibilityForVersion(version: string): SaveCompatibility {
  if (version === CURRENT_VERSION) return 'current';
  if (version.startsWith('0.8.')) return 'outdated';
  return 'incompatible';
}

function kindFor(index: number): SaveKind {
  const cycle: SaveKind[] = ['manual', 'auto', 'manual', 'quick', 'manual', 'auto'];
  return cycle[index % cycle.length];
}

function prefixFor(kind: SaveKind) {
  if (kind === 'auto') return '自动存档';
  if (kind === 'quick') return '快速存档';
  return '手动存档';
}

function buildSaves(): SaveEntry[] {
  return Array.from({ length: 30 }, (_, index) => {
    const kind = kindFor(index);
    const version = index < 10 ? CURRENT_VERSION : index < 22 ? '0.8.3' : '0.7.8';
    const date = new Date(Date.UTC(2026, 8, 15, 18, 31) - index * 31 * 60_000);
    const savedAt = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    const year = Math.max(8, 12 - Math.floor(index / 10));
    const month = Math.max(1, 8 - Math.floor((index % 10) / 3));
    const day = Math.max(1, 17 - (index % 3) * 4);
    const serialBase = kind === 'quick' ? 8 : kind === 'auto' ? 1 : 25;
    const serial = String(serialBase + Math.floor(index / 3)).padStart(3, '0');
    return {
      id: `${kind}-${index}`,
      name: index === 0 ? '城南水渠完成' : `${prefixFor(kind)}.${serial}`,
      kind,
      gameDate: `第${year}年 ${month}月${day}日`,
      savedAt,
      image: assetPool[index % assetPool.length],
      version,
      compatibility: compatibilityForVersion(version),
      order: 2000 - index,
    };
  });
}

const initialSaves = buildSaves();

function nextSerial(saves: SaveEntry[], kind: SaveKind) {
  const prefix = `${prefixFor(kind)}.`;
  const max = saves
    .filter((save) => save.kind === kind && save.name.startsWith(prefix))
    .reduce((current, save) => Math.max(current, Number(save.name.slice(prefix.length)) || 0), 0);
  return String(max + 1).padStart(3, '0');
}

export function SaveGameSpace({ context, onBack }: SaveGameSpaceProps) {
  const [groupName, setGroupName] = useState(INITIAL_GROUP_NAME);
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState(INITIAL_GROUP_NAME);
  const [saves, setSaves] = useState<SaveEntry[]>(() => structuredClone(initialSaves));
  const [filter, setFilter] = useState<SaveFilter>('all');
  const [hideOutdated, setHideOutdated] = useState(false);
  const [selectedId, setSelectedId] = useState(saves[0]?.id ?? '');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newNameDraft, setNewNameDraft] = useState('');
  const [pendingOverwriteId, setPendingOverwriteId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const visibleSaves = useMemo(() => [...saves]
    .sort((a, b) => b.order - a.order)
    .filter((save) => filter === 'all' || save.kind === filter)
    .filter((save) => !hideOutdated || save.compatibility === 'current'), [saves, filter, hideOutdated]);

  useEffect(() => {
    if (visibleSaves.length === 0) {
      setSelectedId('');
      return;
    }
    if (!visibleSaves.some((save) => save.id === selectedId)) setSelectedId(visibleSaves[0].id);
  }, [visibleSaves, selectedId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (editingGroupName || editingId || saveDialogOpen || pendingOverwriteId || pendingDeleteId) {
        event.preventDefault();
        event.stopPropagation();
        setEditingGroupName(false);
        setEditingId(null);
        setSaveDialogOpen(false);
        setPendingOverwriteId(null);
        setPendingDeleteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [editingGroupName, editingId, saveDialogOpen, pendingOverwriteId, pendingDeleteId]);

  function closeTransientActions() {
    setEditingId(null);
    setSaveDialogOpen(false);
    setPendingOverwriteId(null);
    setPendingDeleteId(null);
  }

  function startGroupRename() {
    setGroupNameDraft(groupName);
    setEditingGroupName(true);
    closeTransientActions();
  }

  function commitGroupRename() {
    const next = groupNameDraft.trim();
    if (next) setGroupName(next);
    setEditingGroupName(false);
  }

  function openSaveDialog() {
    setNewNameDraft(`手动存档.${nextSerial(saves, 'manual')}`);
    setSaveDialogOpen(true);
    setEditingGroupName(false);
    setEditingId(null);
    setPendingOverwriteId(null);
    setPendingDeleteId(null);
  }

  function createEntry(kind: 'manual' | 'quick', name: string): SaveEntry {
    return {
      id: `${kind}-new-${Date.now()}`,
      name,
      kind,
      gameDate: CURRENT_GAME_DATE,
      savedAt: CURRENT_SAVED_AT,
      image: '/assets/wanhu-gameplay-city.png',
      version: CURRENT_VERSION,
      compatibility: 'current',
      order: Math.max(...saves.map((save) => save.order), 0) + 1,
    };
  }

  function commitManualSave() {
    const name = newNameDraft.trim() || `手动存档.${nextSerial(saves, 'manual')}`;
    const next = createEntry('manual', name);
    setSaves((current) => [next, ...current]);
    setSelectedId(next.id);
    setFilter('all');
    setSaveDialogOpen(false);
    setToast(`已保存 ${next.name}`);
  }

  function quickSave() {
    const name = `快速存档.${nextSerial(saves, 'quick')}`;
    const next = createEntry('quick', name);
    setSaves((current) => {
      const quick = current.filter((save) => save.kind === 'quick').sort((a, b) => b.order - a.order);
      const removeId = quick.length >= QUICK_SAVE_LIMIT ? quick[quick.length - 1]?.id : null;
      const remaining = removeId ? current.filter((save) => save.id !== removeId) : current;
      return [next, ...remaining];
    });
    setSelectedId(next.id);
    setFilter('all');
    setToast(`已创建 ${name}`);
  }

  function startRename(save: SaveEntry) {
    if (save.kind !== 'manual') return;
    setSelectedId(save.id);
    setNameDraft(save.name);
    setEditingId(save.id);
    setEditingGroupName(false);
    setPendingOverwriteId(null);
    setPendingDeleteId(null);
  }

  function commitRename(saveId: string) {
    const name = nameDraft.trim();
    if (name) setSaves((current) => current.map((save) => save.id === saveId ? { ...save, name } : save));
    setEditingId(null);
  }

  function overwriteSave(saveId: string) {
    const nextOrder = Math.max(...saves.map((save) => save.order), 0) + 1;
    setSaves((current) => current.map((save) => save.id === saveId ? {
      ...save,
      gameDate: CURRENT_GAME_DATE,
      savedAt: CURRENT_SAVED_AT,
      image: '/assets/wanhu-gameplay-city.png',
      version: CURRENT_VERSION,
      compatibility: 'current',
      order: nextOrder,
    } : save));
    setSelectedId(saveId);
    setPendingOverwriteId(null);
    const target = saves.find((save) => save.id === saveId);
    setToast(`已覆盖 ${target?.name ?? '手动存档'}`);
  }

  function deleteSave(saveId: string) {
    const remaining = saves.filter((save) => save.id !== saveId);
    setSaves(remaining);
    if (selectedId === saveId) setSelectedId([...remaining].sort((a, b) => b.order - a.order)[0]?.id ?? '');
    setPendingDeleteId(null);
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
    <section className={`save-game-space save-game-space--${context}`} aria-label="保存游戏">
      <header className="global-space-header save-game-space__header">
        <div className="global-space-heading"><h1>保存游戏</h1></div>
      </header>

      <main className="save-game-space__body">
        <section className="save-current-game" aria-label="当前游戏">
          <div>
            {editingGroupName ? (
              <input autoFocus className="save-current-game__name-input" value={groupNameDraft} aria-label="更改存档组名称" onChange={(event) => setGroupNameDraft(event.target.value)} onBlur={commitGroupRename} onKeyDown={(event) => handleRenameKey(event, commitGroupRename, () => setEditingGroupName(false))} />
            ) : <h2>{groupName}</h2>}
            <p>当前版本 v{CURRENT_VERSION}<i />已游玩 {CURRENT_PLAY_TIME}</p>
          </div>
          <span>当前游戏</span>
        </section>

        <header className="archive-saves-toolbar save-game-space__toolbar">
          <nav className="archive-save-type-tabs" aria-label="存档类型筛选">
            {filterItems.map((item) => <button key={item.key} type="button" className={filter === item.key ? 'is-active' : ''} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label}</button>)}
          </nav>
          <button type="button" className={`archive-hide-outdated ${hideOutdated ? 'is-on' : ''}`} role="switch" aria-checked={hideOutdated} onClick={() => setHideOutdated((current) => !current)}>
            <span>隐藏过时存档</span><i><em /></i>
          </button>
        </header>

        <div className="archive-save-list save-game-space__list">
          {visibleSaves.map((save) => {
            const selected = selectedId === save.id;
            const editing = editingId === save.id;
            const confirmingOverwrite = pendingOverwriteId === save.id;
            const confirmingDelete = pendingDeleteId === save.id;
            const manual = save.kind === 'manual';

            return (
              <SaveEntryCard
                key={save.id}
                save={save}
                selected={selected}
                editing={editing}
                nameDraft={nameDraft}
                onNameDraftChange={setNameDraft}
                onCommitRename={() => commitRename(save.id)}
                onCancelRename={() => setEditingId(null)}
                onSelect={() => setSelectedId(save.id)}
                onHover={() => setSelectedId(save.id)}
                actions={(
                  <>
                    {manual && <button type="button" title="重命名存档" aria-label={`重命名 ${save.name}`} onClick={() => startRename(save)}><Pencil size={15} /></button>}
                    {manual && <button type="button" className="is-primary" title="覆盖此存档" aria-label={`覆盖 ${save.name}`} onClick={() => { setSelectedId(save.id); setPendingOverwriteId(save.id); setPendingDeleteId(null); }}><Save size={16} /></button>}
                    <button type="button" className="is-danger" title="删除存档" aria-label={`删除 ${save.name}`} onClick={() => { setSelectedId(save.id); setPendingDeleteId(save.id); setPendingOverwriteId(null); }}><Trash2 size={15} /></button>
                  </>
                )}
                confirmation={confirmingOverwrite ? (
                  <div className="archive-save-card__confirm save-entry-confirm--overwrite">
                    <span>覆盖“{save.name}”？当前游戏状态将替换这个存档。</span>
                    <button type="button" aria-label="取消覆盖" onClick={() => setPendingOverwriteId(null)}><X size={13} /></button>
                    <button type="button" className="is-primary" aria-label="确认覆盖存档" onClick={() => overwriteSave(save.id)}><Save size={13} /></button>
                  </div>
                ) : confirmingDelete ? (
                  <div className="archive-save-card__confirm">
                    <span>删除“{save.name}”？</span>
                    <button type="button" aria-label="取消删除" onClick={() => setPendingDeleteId(null)}><X size={13} /></button>
                    <button type="button" className="is-danger" aria-label="确认删除存档" onClick={() => deleteSave(save.id)}><Trash2 size={13} /></button>
                  </div>
                ) : undefined}
              />
            );
          })}
          {visibleSaves.length === 0 && <div className="archive-save-empty-state">当前筛选下没有可显示的存档。</div>}
        </div>
      </main>

      <footer className="global-space-footer save-game-space__footer" aria-label="页面操作">
        <div className="save-game-space__footer-left">
          <button type="button" className="global-space-secondary save-group-rename" onClick={startGroupRename}><Pencil size={14} />更改存档组名称</button>
        </div>
        <div className="save-game-space__footer-center">
          <button type="button" className="global-space-secondary save-quick-action" onClick={quickSave}><Zap size={14} />快速保存</button>
          <button type="button" className="global-space-primary save-manual-action" onClick={openSaveDialog}><Save size={14} />保存存档</button>
        </div>
        <button type="button" className="global-space-secondary save-game-space__back" onClick={onBack}><ChevronLeft size={14} />返回</button>
      </footer>

      {saveDialogOpen && (
        <div className="save-name-layer" role="dialog" aria-modal="true" aria-label="保存存档">
          <section className="save-name-dialog">
            <header><h2>保存存档</h2></header>
            <label><span>存档名称</span><input autoFocus value={newNameDraft} aria-label="存档名称" onChange={(event) => setNewNameDraft(event.target.value)} onKeyDown={(event) => handleRenameKey(event, commitManualSave, () => setSaveDialogOpen(false))} /></label>
            <footer>
              <button type="button" className="global-space-secondary" onClick={() => setSaveDialogOpen(false)}>取消</button>
              <button type="button" className="global-space-primary" onClick={commitManualSave}><Save size={14} />保存</button>
            </footer>
          </section>
        </div>
      )}

      {toast && <div className="save-toast" role="status">{toast}</div>}
    </section>
  );
}
