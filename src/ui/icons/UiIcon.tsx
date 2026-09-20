import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { UI_ICON_ASSETS, type UiIconId } from './icon-manifest.generated';

export type { UiIconId } from './icon-manifest.generated';

/**
 * Transitional source type while Runtime moves from Lucide components to PNG.
 * Remove LucideIcon from this union after the PNG migration is complete.
 */
export type UiIconSource = UiIconId | LucideIcon;

interface UiIconProps {
  icon: UiIconId;
  size?: number;
  className?: string;
  title?: string;
}

type UiIconStyle = CSSProperties & {
  '--ui-icon-image': string;
  '--ui-icon-size': string;
};

export function UiIcon({ icon, size = 16, className = '', title }: UiIconProps) {
  const style: UiIconStyle = {
    '--ui-icon-image': `url("${UI_ICON_ASSETS[icon]}")`,
    '--ui-icon-size': `${size}px`,
  };

  return (
    <span
      className={`ui-icon ${className}`.trim()}
      style={style}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      aria-label={title}
      data-ui-icon={icon}
    />
  );
}

export function UiIconGlyph({
  icon,
  size = 16,
  className = '',
}: {
  icon: UiIconSource;
  size?: number;
  className?: string;
}) {
  if (typeof icon === 'string') {
    return <UiIcon icon={icon} size={size} className={className} />;
  }

  const LegacyIcon = icon;
  return <LegacyIcon width={size} height={size} className={className} aria-hidden="true" />;
}
