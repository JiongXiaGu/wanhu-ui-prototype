import { Check, X } from '../ui/icons/runtime-icons.generated';
import { UiIconGlyph } from '../ui/icons/UiIcon';
import type { UiIconSource } from '../ui/icons/icon-types';

export interface ToolModeItem {
  id: string;
  label: string;
  icon: UiIconSource;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface ToolModeGroup {
  id: string;
  label: string;
  items: ToolModeItem[];
}

export interface ToolQuickAction {
  id: string;
  label: string;
  icon: UiIconSource;
  disabled?: boolean;
  onClick: () => void;
}

interface ToolActionBarProps {
  ariaLabel: string;
  modeGroups: ToolModeGroup[];
  quickActions?: ToolQuickAction[];
  completeLabel?: string;
  cancelLabel?: string;
  commitGroupLabel?: string;
  showCancel?: boolean;
  onComplete: () => void;
  onCancel?: () => void;
}

export function ToolActionBar({
  ariaLabel,
  modeGroups,
  quickActions = [],
  completeLabel = '完成',
  cancelLabel = '取消',
  commitGroupLabel = '工具任务',
  showCancel = false,
  onComplete,
  onCancel,
}: ToolActionBarProps) {
  return (
    <div className="tool-action-bar placement-action-bar bottom-command-surface bottom-command-surface--md" aria-label={ariaLabel}>
      {modeGroups.map((group, groupIndex) => (
        <div className="placement-action-bar__section" key={group.id}>
          {groupIndex > 0 && <i className="placement-action-bar__divider" aria-hidden="true" />}
          <div className="placement-action-bar__mode-group" role="group" aria-label={group.label}>
            {group.items.map(({ id, label, icon, active, disabled, onClick }) => (
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
                <UiIconGlyph icon={icon} size={20} />
              </button>
            ))}
          </div>
        </div>
      ))}

      {quickActions.length > 0 && (
        <div className="placement-action-bar__section">
          <i className="placement-action-bar__divider" aria-hidden="true" />
          <div className="placement-action-bar__quick-group" role="group" aria-label="快速操作">
            {quickActions.map(({ id, label, icon, disabled, onClick }) => (
              <button
                key={id}
                type="button"
                className="placement-action-bar__button placement-action-bar__button--quick"
                aria-label={label}
                data-tooltip={label}
                disabled={disabled}
                onClick={onClick}
              >
                <UiIconGlyph icon={icon} size={20} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="placement-action-bar__section placement-action-bar__section--commit">
        <i className="placement-action-bar__divider" aria-hidden="true" />
        <div className="placement-action-bar__commit-group" role="group" aria-label={commitGroupLabel}>
          <button
            type="button"
            className="placement-action-bar__button placement-action-bar__button--confirm"
            aria-label={completeLabel}
            data-tooltip={completeLabel}
            onClick={onComplete}
          >
            <Check aria-hidden="true" />
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              className="placement-action-bar__button placement-action-bar__button--cancel"
              aria-label={cancelLabel}
              data-tooltip={cancelLabel}
              onClick={onCancel}
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
