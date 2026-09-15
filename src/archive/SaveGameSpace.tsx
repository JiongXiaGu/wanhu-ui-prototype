import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

interface SaveGameSpaceProps {
  context: 'pause';
  onBack: () => void;
}

type ManualSave = {
  id: string;
  name: string;
  gameDate: string;
  savedAt: string;
  image: string;
  version: string;
  order: number;
};

const CURRENT_VERSION = '0.8.4';
const INITIAL_GROUP_NAME = '昭平城';
const CURRENT_PLAY_TIME = '46h 18m';
const CURRENT_GAME_DATE = '第12年 8月17日';
const CURRENT_SAVED_AT = '2026-09-15 17:33';
const assetPool = ['/assets/wanhu-gameplay-city.png', '/assets/wanhu-gameplay-lake.png', '/assets/wanhu-main-menu.png'];

function buildManualSaves(): ManualSave[] {
  return Array.from({ length: 26 }, (_, index) => {
    const serial = String(25 - index >= 1 ? 25 - index : 100 + index).padStart(3, '0');
    const minuteOffset = index * 41;
    const base = Date.UTC(2026, 8, 15, 16, 58);
    const date = new Date(base - minuteOffset * 60_000);
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const year = Math.max(8, 12 - Math.floor(index / 9));
    const month = Math.max(1, 8 - Math.floor((index % 9) / 3));
    const day = Math.max(1, 17 - (index % 3) * 4);
    const version = index < 8 ? CURRENT_VERSION : index < 18 ? '0.8.3' : '0.8.2';
    return {
      id: `manual-${index}`,
      name: index === 0 ? '城南水渠完成' : `手动存档.${serial}`,
      gameDate: `第${year}年 ${month}月${day}日`,
      savedAt: `${yyyy}-${mm}-${dd} ${hh}:${min}`,
      image: assetPool[index % assetPool.length],
      version,
      order: 1000 - index,
    };
  });
}

const initialManualSaves = buildManualSaves();

export function SaveGameSpace({ context, onBack }: SaveGameSpaceProps) {
  const [groupName, setGroupName] = useState(INITIAL_GROUP_NAME);
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState(INITIAL_GROUP_NAME);
  const [saves, setSaves] = useState<ManualSave[]>(() => structuredClone(initialManualSaves));
  const [selectedId, setSelectedId] = useState(saves[0]?.id ?? '');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [newNameDraft, setNewNameDraft] = useState('');
  const [pendingOverwriteId, setPendingOverwriteId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const orderedSaves = useMemo(() => [...saves].sort((a, b) => b.order - a.order), [saves]);
  const nextSerial = useMemo(() => String(saves.length + 26).padStart(3, '0'), [saves.length]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (editingGroupName || editingId || creating || pendingOverwriteId || pendingDeleteId) {
        event.preventDefault();
        event.stopPropagation();
        setEditingGroupName(false);
        setEditingId(null);
        setCreating(false);
        setPendingOverwriteId(null);
        setPendingDeleteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [editingGroupName, editingId, creating, pendingOverwriteId, pendingDeleteId]);

  function closeTransientActions() {
    setEditingId(null);
    setCreating(false);
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

  function startCreate() {
    setNewNameDraft(`手动存档.${nextSerial}`);
    setCreating(true);
    setEditingGroupName(false);
    setPendingOverwriteId(null);
    setPendingDeleteId(null);
    setEditingId(null);
  }

  function commitCreate() {
    const name = newNameDraft.trim() || `手动存档.${nextSerial}`;
    const next: ManualSave = {
      id: `manual-new-${Date.now()}`,
      name,
      gameDate: CURRENT_GAME_DATE,
      savedAt: CURRENT_SAVED_AT,
      image: '/assets/wanhu-gameplay-city.png',
      version: CURRENT_VERSION,
      order: Math.max(...saves.map((save) => save.order), 0) + 1,
    };
    setSaves((current) => [next, ...current]);
    setSelectedId(next.id);
    setCreating(false);
  }

  function startRename(save: ManualSave) {
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
      order: nextOrder,
    } : save));
    setSelectedId(saveId);
    setPendingOverwriteId(null);
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
              <input
                autoFocus
                className="save-current-game__name-input"
                value={groupNameDraft}
                aria-label="更改存档组名称"
                onChange={(event) => setGroupNameDraft(event.target.value)}
                onBlur={commitGroupRename}
                onKeyDown={(event) => handleRenameKey(event, commitGroupRename, () => setEditingGroupName(false))}
              />
            ) : <h2>{groupName}</h2>}
            <p>当前版本 v{CURRENT_VERSION}<i />已游玩 {CURRENT_PLAY_TIME}</p>
          </div>
          <span>当前游戏</span>
        </section>

        <section className="save-create-zone" aria-label="新建存档">
          {!creating ? (
            <button type="button" className="save-create-entry" onClick={startCreate}>
              <Plus size={19} />
              <span><b>新建存档</b><small>创建一个新的手动存档</small></span>
            </button>
          ) : (
            <div className="save-create-editor">
              <div className="save-create-editor__copy">
                <b>新建存档</b>
                <input
                  autoFocus
                  value={newNameDraft}
                  aria-label="新建存档名称"
                  onChange={(event) => setNewNameDraft(event.target.value)}
                  onKeyDown={(event) => handleRenameKey(event, commitCreate, () => setCreating(false))}
                />
              </div>
              <div className="save-create-editor__actions">
                <button type="button" className="is-ghost" onClick={() => setCreating(false)}>取消</button>
                <button type="button" className="is-primary" onClick={commitCreate}><Save size={14} />保存</button>
              </div>
            </div>
          )}
        </section>

        <section className="save-manual-section">
          <header className="save-manual-section__header">
            <b>已有手动存档</b>
            <span>{saves.length} 个</span>
          </header>

          <div className="save-manual-list">
            {orderedSaves.map((save) => {
              const selected = selectedId === save.id;
              const editing = editingId === save.id;
              const confirmingOverwrite = pendingOverwriteId === save.id;
              const confirmingDelete = pendingDeleteId === save.id;
              const outdated = save.version !== CURRENT_VERSION;

              return (
                <article
                  key={save.id}
                  className={`save-manual-card ${selected ? 'is-selected' : ''}`}
                  data-version={save.version}
                  onMouseEnter={() => setSelectedId(save.id)}
                >
                  <button type="button" className="save-manual-card__select" onClick={() => setSelectedId(save.id)} aria-label={`选择存档 ${save.name}`}>
                    <span className="save-manual-card__image" style={{ backgroundImage: `url(${save.image})` }} />
                    <span className="save-manual-card__copy">
                      <span className="save-manual-card__title">
                        {editing ? (
                          <input
                            autoFocus
                            value={nameDraft}
                            aria-label="重命名手动存档"
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => setNameDraft(event.target.value)}
                            onBlur={() => commitRename(save.id)}
                            onKeyDown={(event) => handleRenameKey(event, () => commitRename(save.id), () => setEditingId(null))}
                          />
                        ) : <b>{save.name}</b>}
                      </span>
                      <span className="save-manual-card__time"><small>游戏时间</small><span>{save.gameDate}</span></span>
                      <span className="save-manual-card__time"><small>保存时间</small><span>{save.savedAt}</span></span>
                    </span>
                  </button>

                  <div className="save-manual-card__status">
                    {outdated && <em>旧存档</em>}
                    <span>v{save.version}</span>
                  </div>

                  <div className="save-manual-card__actions" aria-label="手动存档操作">
                    <button type="button" title="重命名存档" aria-label={`重命名 ${save.name}`} onClick={() => startRename(save)}><Pencil size={15} /></button>
                    <button type="button" className="is-primary" title="覆盖此存档" aria-label={`覆盖 ${save.name}`} onClick={() => { setSelectedId(save.id); setPendingOverwriteId(save.id); setPendingDeleteId(null); }}><Save size={16} /></button>
                    <button type="button" className="is-danger" title="删除存档" aria-label={`删除 ${save.name}`} onClick={() => { setSelectedId(save.id); setPendingDeleteId(save.id); setPendingOverwriteId(null); }}><Trash2 size={15} /></button>
                  </div>

                  {confirmingOverwrite && (
                    <div className="save-manual-card__confirm save-manual-card__confirm--overwrite">
                      <span>覆盖“{save.name}”？当前游戏状态将替换这个存档。</span>
                      <button type="button" aria-label="取消覆盖" onClick={() => setPendingOverwriteId(null)}><X size={13} /></button>
                      <button type="button" className="is-primary" aria-label="确认覆盖存档" onClick={() => overwriteSave(save.id)}><Save size={13} /></button>
                    </div>
                  )}

                  {confirmingDelete && (
                    <div className="save-manual-card__confirm save-manual-card__confirm--delete">
                      <span>删除“{save.name}”？</span>
                      <button type="button" aria-label="取消删除" onClick={() => setPendingDeleteId(null)}><X size={13} /></button>
                      <button type="button" className="is-danger" aria-label="确认删除存档" onClick={() => deleteSave(save.id)}><Trash2 size={13} /></button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="global-space-footer save-game-space__footer" aria-label="页面操作">
        <div className="save-game-space__footer-left">
          <button type="button" className="global-space-secondary save-group-rename" onClick={startGroupRename}><Pencil size={14} />更改存档组名称</button>
        </div>
        <button type="button" className="global-space-secondary save-game-space__back" onClick={onBack}><ChevronLeft size={14} />返回</button>
      </footer>
    </section>
  );
}
