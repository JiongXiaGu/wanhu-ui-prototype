import { ChevronRight } from 'lucide-react';

export interface ColorParameterFieldProps {
  label: string;
  color: string;
  hdr?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  onClick: () => void;
}

/**
 * Shared parameter-page entry into the Color Editor.
 *
 * The control occupies the same second column as NumericSliderField so color,
 * intensity and range rows share one horizontal rhythm. HDR is an optional
 * in-bar status, not a separate control.
 */
export function ColorParameterField({
  label,
  color,
  hdr = false,
  disabled = false,
  ariaLabel,
  className = '',
  onClick,
}: ColorParameterFieldProps) {
  return (
    <div
      className={`ui-parameter-row ui-color-parameter-field ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
      data-color-parameter-hdr={hdr ? 'true' : 'false'}
    >
      <span>{label}</span>
      <button
        type="button"
        className="ui-color-parameter-field__control"
        disabled={disabled}
        aria-label={ariaLabel ?? `调整${label}`}
        onClick={onClick}
      >
        <span className="ui-color-parameter-field__preview" aria-hidden="true">
          <i
            className="ui-color-parameter-field__fill"
            style={{ backgroundColor: color }}
          />
        </span>
        <span className="ui-color-parameter-field__meta">
          {hdr && <small className="ui-color-parameter-field__hdr">HDR</small>}
          <ChevronRight aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
