import {
  forwardRef,
  type CSSProperties,
} from 'react';
import { UI_ICON_ASSETS, type UiIconId } from './icon-manifest.generated';
import type { UiIconComponent, UiIconSource, UiRuntimeIconProps } from './icon-types';

export type { UiIconId } from './icon-manifest.generated';
export type { UiIconComponent, UiIconSource, UiRuntimeIconProps } from './icon-types';

type UiIconStyle = CSSProperties & {
  '--ui-icon-image': string;
  '--ui-icon-size': string;
};

function cssSize(value: number | string) {
  return typeof value === 'number' ? value + 'px' : value;
}

interface UiIconProps extends UiRuntimeIconProps {
  icon: UiIconId;
}

export const UiIcon = forwardRef<HTMLSpanElement, UiIconProps>(function UiIcon({
  icon,
  size = 16,
  width,
  height,
  color,
  strokeWidth: _strokeWidth,
  absoluteStrokeWidth: _absoluteStrokeWidth,
  className = '',
  style,
  ...props
}, ref) {
  const resolvedSize = cssSize(size);
  const mergedStyle: UiIconStyle = {
    '--ui-icon-image': 'url("' + UI_ICON_ASSETS[icon] + '")',
    '--ui-icon-size': resolvedSize,
    width: width === undefined ? undefined : cssSize(width),
    height: height === undefined ? undefined : cssSize(height),
    color,
    ...style,
  };

  return (
    <span
      {...props}
      ref={ref}
      className={('ui-icon ' + className).trim()}
      style={mergedStyle}
      data-ui-icon={icon}
    />
  );
});

export function createUiIconComponent(icon: UiIconId): UiIconComponent {
  const Component = forwardRef<HTMLSpanElement, UiRuntimeIconProps>(function GeneratedUiIcon(props, ref) {
    return <UiIcon {...props} ref={ref} icon={icon} />;
  });
  Component.displayName = 'UiIcon(' + icon + ')';
  return Component;
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
    return <UiIcon icon={icon} size={size} className={className} aria-hidden="true" />;
  }

  const Component = icon;
  return <Component size={size} className={className} aria-hidden="true" />;
}
