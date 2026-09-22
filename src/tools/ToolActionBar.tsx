import { Check, LogOut, X } from '../ui/icons/runtime-icons.generated';
import { UiIconGlyph } from '../ui/icons/UiIcon';
import type { UiIconSource } from '../ui/icons/icon-types';

export interface ToolModeItem {
  id: string;
  label: string;
  /** 短名称仅用于可见标签，完整名称仍用于辅助技术和提示。 */
  shortLabel?: string;
  icon: UiIconSource;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}
export interface ToolModeGroup {
  id: string;
  label: string;
  /** 默认不变；只为确有辨识需求的模式组展开文字。 */
  presentation?: 'icon-only' | 'icon-label';
  items: ToolModeItem[];
}
export interface ToolQuickAction {
  id: string;
  label: string;
  shortLabel?: string;
  icon: UiIconSource;
  active?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}
interface ToolActionBarProps {
  ariaLabel: string;
  className?: string;
  modeGroups: ToolModeGroup[];
  quickActions?: ToolQuickAction[];
  quickActionPresentation?: 'icon-only' | 'icon-label';
  completeLabel?: string;
  completeShortLabel?: string;
  /** exit 仅结束即时编辑工具，不表示提交或回退一批修改。 */
  completeKind?: 'commit' | 'exit';
  completeIcon?: UiIconSource;
  cancelLabel?: string;
  cancelShortLabel?: string;
  commitGroupLabel?: string;
  showCancel?: boolean;
  onComplete: () => void;
  onCancel?: () => void;
}
export function ToolActionBar({
  ariaLabel,
  className = '',
  modeGroups,
  quickActions = [],
  quickActionPresentation = 'icon-only',
  completeLabel = '完成',
  completeShortLabel,
  completeKind = 'commit',
  completeIcon,
  cancelLabel = '取消',
  cancelShortLabel,
  commitGroupLabel = '工具任务',
  showCancel = false,
  onComplete,
  onCancel,
}: ToolActionBarProps) {
  const CompleteIcon = completeKind === 'exit' ? LogOut : Check;
  return (
    <div className={`tool-action-bar secondary-action-bar placement-action-bar bottom-command-surface bottom-command-surface--md ${className}`.trim()} aria-label={ariaLabel}>
      {modeGroups.map((group, groupIndex) => (
        <div className="placement-action-bar__section" key={group.id}>
          {groupIndex > 0 && <i className="placement-action-bar__divider" aria-hidden="true" />}
          <div className={`placement-action-bar__mode-group ${group.presentation === 'icon-label' ? 'is-labeled' : ''}`} role="group" aria-label={group.label}>
            {group.items.map(({ id, label, shortLabel, icon, active, disabled, onClick }) => (
              <button
                key={id}
                type="button"
                className={`placement-action-bar__button placement-action-bar__button--mode ${group.presentation === 'icon-label' ? 'placement-action-bar__button--labeled' : ''} ${active ? 'is-active' : ''}`}
                aria-label={label}
                aria-pressed={active}
                data-mode-id={id}
                data-tooltip={label}
                disabled={disabled}
                onClick={onClick}
              >
                <i className="placement-action-bar__state-line" aria-hidden="true" />
                <UiIconGlyph icon={icon} size={24} />
                {group.presentation === 'icon-label' && <span className="placement-action-bar__label" aria-hidden="true">{shortLabel ?? label}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
      {quickActions.length > 0 && (
        <div className="placement-action-bar__section">
          <i className="placement-action-bar__divider" aria-hidden="true" />
          <div className={`placement-action-bar__quick-group ${quickActionPresentation === 'icon-label' ? 'is-labeled' : ''}`} role="group" aria-label="快速操作">
            {quickActions.map(({ id, label, shortLabel, icon, active, pressed, disabled, onClick }) => (
              <button
                key={id}
                type="button"
                className={`placement-action-bar__button placement-action-bar__button--quick ${quickActionPresentation === 'icon-label' ? 'placement-action-bar__button--labeled' : ''} ${active ? 'is-active' : ''}`}
                aria-label={label}
                aria-pressed={pressed}
                data-tooltip={label}
                disabled={disabled}
                onClick={onClick}
              >
                <i className="placement-action-bar__state-line" aria-hidden="true" />
                <UiIconGlyph icon={icon} size={24} />
                {quickActionPresentation === 'icon-label' && <span className="placement-action-bar__label" aria-hidden="true">{shortLabel ?? label}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="placement-action-bar__section placement-action-bar__section--commit">
        {(modeGroups.length > 0 || quickActions.length > 0) && <i className="placement-action-bar__divider" aria-hidden="true" />}
        <div className="placement-action-bar__commit-group" role="group" aria-label={commitGroupLabel}>
          <button
            type="button"
            className={`placement-action-bar__button placement-action-bar__button--${completeKind === 'exit' ? 'exit' : 'confirm'} ${completeShortLabel ? 'placement-action-bar__button--labeled' : ''}`}
            aria-label={completeLabel}
            data-action-kind={completeKind}
            data-tooltip={completeKind === 'exit' ? `${completeLabel}（结束工具）` : completeLabel}
            onClick={onComplete}
          >
            {completeKind === 'commit' && <i className="placement-action-bar__state-line" aria-hidden="true" />}
            {completeIcon ? <UiIconGlyph icon={completeIcon} size={24} /> : <CompleteIcon size={24} aria-hidden="true" />}
            {completeShortLabel && <span className="placement-action-bar__label" aria-hidden="true">{completeShortLabel}</span>}
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              className={`placement-action-bar__button placement-action-bar__button--cancel ${cancelShortLabel ? 'placement-action-bar__button--labeled' : ''}`}
              aria-label={cancelLabel}
              data-tooltip={cancelLabel}
              onClick={onCancel}
            >
              <X size={24} aria-hidden="true" />
              {cancelShortLabel && <span className="placement-action-bar__label" aria-hidden="true">{cancelShortLabel}</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
