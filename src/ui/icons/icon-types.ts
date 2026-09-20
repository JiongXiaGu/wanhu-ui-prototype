import type {
  ForwardRefExoticComponent,
  HTMLAttributes,
  RefAttributes,
} from 'react';
import type { UiIconId } from './icon-manifest.generated';

export interface UiRuntimeIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}

export type UiIconComponent = ForwardRefExoticComponent<
  UiRuntimeIconProps & RefAttributes<HTMLSpanElement>
>;

export type UiIconSource = UiIconId | UiIconComponent;
