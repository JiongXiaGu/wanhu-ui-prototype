import type { KeyboardEvent, ReactNode } from 'react';

export type SaveKind = 'auto' | 'manual' | 'quick';
export type SaveCompatibility = 'current' | 'outdated' | 'incompatible';

export type SaveEntryCardData = {
  id: string;
  name: string;
  kind: SaveKind;
  gameDate: string;
  savedAt: string;
  image: string;
  version: string;
  compatibility: SaveCompatibility;
};

const kindLabels: Record<SaveKind, string> = {
  auto: '自动存档',
  manual: '手动存档',
  quick: '快速存档',
};

type Props = {
  save: SaveEntryCardData;
  selected: boolean;
  editing?: boolean;
  nameDraft?: string;
  onNameDraftChange?: (value: string) => void;
  onCommitRename?: () => void;
  onCancelRename?: () => void;
  onSelect: () => void;
  onHover?: () => void;
  onDoubleClick?: () => void;
  actions: ReactNode;
  confirmation?: ReactNode;
};

export function SaveEntryCard({
  save,
  selected,
  editing = false,
  nameDraft = '',
  onNameDraftChange,
  onCommitRename,
  onCancelRename,
  onSelect,
  onHover,
  onDoubleClick,
  actions,
  confirmation,
}: Props) {
  function handleRenameKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onCommitRename?.();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancelRename?.();
    }
  }

  return (
    <article
      data-save-kind={save.kind}
      data-compatibility={save.compatibility}
      className={`archive-save-card ${selected ? 'is-selected' : ''} is-${save.kind} is-${save.compatibility}`}
      onMouseEnter={onHover}
      onDoubleClick={onDoubleClick}
    >
      <button type="button" className="archive-save-card__select" aria-label={`选择存档 ${save.name}`} onClick={onSelect}>
        <span className="archive-save-card__image" style={{ backgroundImage: `url(${save.image})` }} />
        <span className="archive-save-card__copy">
          <span className="archive-save-card__title-row">
            {editing ? (
              <input
                autoFocus
                value={nameDraft}
                aria-label="重命名存档"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => onNameDraftChange?.(event.target.value)}
                onBlur={onCommitRename}
                onKeyDown={handleRenameKey}
              />
            ) : <b>{save.name}</b>}
          </span>
          <span className="archive-save-card__time-row"><small>游戏时间</small><span>{save.gameDate}</span></span>
          <span className="archive-save-card__time-row"><small>保存时间</small><span>{save.savedAt}</span></span>
        </span>
      </button>

      <div className="archive-save-card__status" aria-label={`${kindLabels[save.kind]} · 版本 ${save.version}`}>
        {save.compatibility === 'outdated' && <em className="is-outdated">过时</em>}
        {save.compatibility === 'incompatible' && <em className="is-incompatible">不兼容</em>}
        <span className={`archive-save-card__type is-${save.kind}`}>{kindLabels[save.kind]}</span>
        <span className="archive-save-card__version">v{save.version}</span>
      </div>

      <div className="archive-save-card__actions" aria-label="存档操作">{actions}</div>
      {confirmation}
    </article>
  );
}
