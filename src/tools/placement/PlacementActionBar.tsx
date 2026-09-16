import type { LucideIcon } from 'lucide-react';
import { Check, X } from 'lucide-react';

export interface PlacementModeItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface PlacementModeGroup {
  id: string;
  label: string;
  items: PlacementModeItem[];
}

export interface PlacementQuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: () => void;
}

interface PlacementActionBarProps {
  ariaLabel: string;
  modeGroups: PlacementModeGroup[];
  quickActions?: PlacementQuickAction[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PlacementActionBar({
  ariaLabel,
  modeGroups,
  quickActions = [],
  confirmLabel = '完成',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: PlacementActionBarProps) {
  return (
    <div className="placement-action-bar bottom-command-surface bottom-command-surface--md" aria-label={ariaLabel}>
      {modeGroups.map((group, groupIndex) => (
        <div className="placement-action-bar__section" key={group.id}>
          {groupIndex > 0 && <i className="placement-action-bar__divider" aria-hidden="true" />}
          <div className="placement-action-bar__mode-group" role="group" aria-label={group.label}>
            {group.items.map(({ id, label, icon: Icon, active, disabled, onClick }) => (
              <button
                key={id}
                type="button"
                className={`placement-action-bar__button placement-action-bar__button--mode ${active ? 'is-active' : ''}`}
                aria-label={label}
                aria-pressed={active}
                data-tooltip={label}
                disabled={disabled}
                onClick={onClick}
              >
                <Icon aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {quickActions.length > 0 && (
        <div className="placement-action-bar__section">
          <i className="placement-action-bar__divider" aria-hidden="true" />
          <div className="placement-action-bar__quick-group" role="group" aria-label="快速操作">
            {quickActions.map(({ id, label, icon: Icon, disabled, onClick }) => (
              <button
                key={id}
                type="button"
                className="placement-action-bar__button placement-action-bar__button--quick"
                aria-label={label}
                data-tooltip={label}
                disabled={disabled}
                onClick={onClick}
              >
                <Icon aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="placement-action-bar__section placement-action-bar__section--commit">
        <i className="placement-action-bar__divider" aria-hidden="true" />
        <div className="placement-action-bar__commit-group" role="group" aria-label="放置任务">
          <button
            type="button"
            className="placement-action-bar__button placement-action-bar__button--confirm"
            aria-label={confirmLabel}
            data-tooltip={confirmLabel}
            onClick={onConfirm}
          >
            <Check aria-hidden="true" />
          </button>
          <button
            type="button"
            className="placement-action-bar__button placement-action-bar__button--cancel"
            aria-label={cancelLabel}
            data-tooltip={cancelLabel}
            onClick={onCancel}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
