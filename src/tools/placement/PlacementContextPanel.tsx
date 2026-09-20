import type { ReactNode } from 'react';
import { LeftContextPanel } from '../../ui/LeftContextPanel';
import type { UiIconSource } from '../../ui/icons/icon-types';

export interface PlacementContextPanelProps {
  ariaLabel: string;
  icon: UiIconSource;
  title: string;
  subtitle?: string;
  closeLabel: string;
  backLabel?: string;
  onBack?: () => void;
  footer?: ReactNode;
  footerClassName?: string;
  className?: string;
  bodyClassName?: string;
  onClose: () => void;
  dataAttributes?: Record<string, string | undefined>;
  children: ReactNode;
}

/**
 * Placement-family entry point into the shared Left Context System.
 *
 * Building / Road / Wall / Bridge tools should provide only their business
 * content here. Shell geometry, header, material and scroll behavior remain
 * owned by the shared Left Context System.
 */
export function PlacementContextPanel({
  ariaLabel,
  icon,
  title,
  subtitle,
  closeLabel,
  backLabel,
  onBack,
  footer,
  footerClassName = '',
  className = '',
  bodyClassName = '',
  onClose,
  dataAttributes,
  children,
}: PlacementContextPanelProps) {
  return (
    <LeftContextPanel
      as="section"
      ariaLabel={ariaLabel}
      icon={icon}
      title={title}
      subtitle={subtitle}
      closeLabel={closeLabel}
      backLabel={backLabel}
      onBack={onBack}
      footer={footer}
      footerClassName={footerClassName}
      className={`placement-context-panel ${className}`.trim()}
      bodyClassName={`placement-context-panel__body ${bodyClassName}`.trim()}
      onClose={onClose}
      dataAttributes={dataAttributes}
    >
      {children}
    </LeftContextPanel>
  );
}
