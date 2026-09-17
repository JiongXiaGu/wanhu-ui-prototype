import type { LucideIcon } from 'lucide-react';
import { RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface LeftContextPanelProps {
  as?: 'aside' | 'section';
  ariaLabel: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
  closeLabel?: string;
  legacyGameplayClass?: boolean;
  onClose: () => void;
  dataAttributes?: Record<string, string | undefined>;
  children: ReactNode;
}

export function LeftContextPanel({
  as = 'aside',
  ariaLabel,
  icon: HeadingIcon,
  title,
  subtitle,
  className = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  closeLabel = '关闭面板',
  legacyGameplayClass = true,
  onClose,
  dataAttributes = {},
  children,
}: LeftContextPanelProps) {
  const rootClassName = `${legacyGameplayClass ? 'gameplay-context-panel ' : ''}left-context-panel ${footer ? 'has-footer' : ''} ${className}`.trim();
  const content = (
    <>
      <header className="left-context-panel__header">
        <div className="gameplay-context-panel__heading left-context-panel__heading">
          <span className="gameplay-context-panel__heading-icon left-context-panel__heading-icon"><HeadingIcon /></span>
          <div className="gameplay-context-panel__heading-copy left-context-panel__heading-copy">
            <b className="gameplay-context-panel__title left-context-panel__title">{title}</b>
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label={closeLabel}><X /></button>
      </header>

      <div className={`gameplay-context-panel__body left-context-panel__body ${bodyClassName}`.trim()}>
        {children}
      </div>

      {footer && (
        <footer className={`gameplay-context-panel__footer left-context-panel__footer ${footerClassName}`.trim()}>
          {footer}
        </footer>
      )}
    </>
  );

  if (as === 'section') {
    return <section className={rootClassName} aria-label={ariaLabel} {...dataAttributes}>{content}</section>;
  }

  return <aside className={rootClassName} aria-label={ariaLabel} {...dataAttributes}>{content}</aside>;
}

export function LeftContextSection({
  title,
  className = '',
  ariaLabel,
  tooltip,
  action,
  children,
}: {
  title: string;
  className?: string;
  ariaLabel?: string;
  tooltip?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={`gameplay-context-panel__section left-context-panel__section ${className}`.trim()}
      aria-label={ariaLabel}
      title={tooltip}
    >
      <div className={`gameplay-context-panel__section-title left-context-panel__section-title ${action ? 'is-action' : ''}`}>
        <b>{title}</b>
        {action}
      </div>
      {children}
    </section>
  );
}

export function LeftContextModeFooter({
  actionLabel,
  actionAriaLabel,
  actionTitle,
  actionDisabled = false,
  actionClassName = '',
  onAction,
  modeClassName = '',
  children,
}: {
  actionLabel?: string;
  actionAriaLabel?: string;
  actionTitle?: string;
  actionDisabled?: boolean;
  actionClassName?: string;
  onAction?: () => void;
  modeClassName?: string;
  children: ReactNode;
}) {
  return (
    <>
      {actionLabel ? (
        <button
          type="button"
          className={`context-panel-reset-button ${actionClassName}`.trim()}
          disabled={actionDisabled}
          aria-label={actionAriaLabel ?? actionLabel}
          title={actionTitle}
          onClick={onAction}
        >
          <RotateCcw />
          <span>{actionLabel}</span>
        </button>
      ) : <span />}
      <div className={`context-panel-mode-switch ${modeClassName}`.trim()}>{children}</div>
    </>
  );
}
