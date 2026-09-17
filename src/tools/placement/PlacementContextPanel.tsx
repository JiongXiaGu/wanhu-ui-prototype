import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { LeftContextPanel } from '../../ui/LeftContextPanel';

export interface PlacementContextPanelProps {
  ariaLabel: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  closeLabel: string;
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
      legacyGameplayClass={false}
      className={`gameplay-left-context-surface tool-overlay placement-context-panel ${className}`.trim()}
      bodyClassName={`tool-body placement-context-panel__body ${bodyClassName}`.trim()}
      onClose={onClose}
      dataAttributes={dataAttributes}
    >
      {children}
    </LeftContextPanel>
  );
}
