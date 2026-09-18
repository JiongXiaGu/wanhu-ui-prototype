import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function SegmentedControl({ items, active, onChange }: { items: string[]; active: string; onChange?: (value: string) => void }) {
  return (
    <div className="segment ui-segmented">
      {items.map((item) => (
        <button key={item} type="button" className={item === active ? 'is-active' : ''} onClick={() => onChange?.(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

interface SliderControlProps {
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  className?: string;
  onChange: (value: number) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function decimalsForStep(step: number) {
  const text = `${step}`;
  return text.includes('.') ? text.split('.')[1].length : 0;
}

export function SliderControl({ ariaLabel, value, min, max, step, disabled = false, className = '', onChange }: SliderControlProps) {
  const span = Math.max(max - min, 0.0001);
  const progress = clamp(((value - min) / span) * 100, 0, 100);
  const decimals = Math.min(4, decimalsForStep(step));

  function commit(next: number) {
    const clamped = clamp(next, min, max);
    const stepped = min + Math.round((clamped - min) / step) * step;
    onChange(Number(clamp(stepped, min, max).toFixed(decimals)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    const scale = event.shiftKey ? 10 : 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      commit(value - step * scale);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      commit(value + step * scale);
    } else if (event.key === 'Home') {
      event.preventDefault();
      commit(min);
    } else if (event.key === 'End') {
      event.preventDefault();
      commit(max);
    }
  }

  return (
    <div className={`ui-slider ${disabled ? 'is-disabled' : ''} ${className}`.trim()}>
      <div className="ui-slider__track" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
      <span className="ui-slider__thumb" style={{ left: `${progress}%` }} aria-hidden="true" />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        onChange={(event) => commit(Number(event.currentTarget.value))}
      />
    </div>
  );
}

interface RuntimeParameterRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function RuntimeParameterRow({ label, value, min, max, step, format, disabled = false, onChange }: RuntimeParameterRowProps) {
  const decimals = Math.min(4, decimalsForStep(step));

  function commit(next: number) {
    onChange(Number(clamp(next, min, max).toFixed(decimals)));
  }

  return (
    <div className={`parameter-row runtime-parameter-row ui-parameter-row ${disabled ? 'is-disabled' : ''}`}>
      <span>{label}</span>
      <button className="ui-stepper-button" type="button" disabled={disabled} onClick={() => commit(value - step)} aria-label={`${label}减小`}>−</button>
      <SliderControl ariaLabel={label} value={value} min={min} max={max} step={step} disabled={disabled} onChange={commit} />
      <button className="ui-stepper-button" type="button" disabled={disabled} onClick={() => commit(value + step)} aria-label={`${label}增大`}>＋</button>
      <output className="ui-value-field">{format ? format(value) : value}</output>
    </div>
  );
}

interface SelectControlProps {
  ariaLabel: string;
  value: string;
  options: string[];
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
}

export function SelectControl({ ariaLabel, value, options, disabled = false, className = '', onChange }: SelectControlProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(Math.max(0, options.indexOf(value)));
  const [opensUp, setOpensUp] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [open]);

  function openMenu() {
    if (disabled || options.length === 0) return;
    const rect = rootRef.current?.getBoundingClientRect();
    const menuHeight = Math.min(options.length, 8) * 34 + 8;
    setOpensUp(Boolean(rect && window.innerHeight - rect.bottom < menuHeight + 18));
    setHighlighted(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || options.length === 0) return;
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((current) => (current + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => (current - 1 + options.length) % options.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(options[highlighted]);
    }
  }

  return (
    <div ref={rootRef} className={`ui-select ${open ? 'is-open' : ''} ${opensUp ? 'opens-up' : ''} ${className}`.trim()}>
      <button
        type="button"
        className="ui-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => open ? setOpen(false) : openMenu()}
        onKeyDown={handleKeyDown}
      >
        <span>{value}</span><ChevronDown size={14} />
      </button>
      {open && (
        <div className="ui-select__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={option === value}
              key={option}
              className={`${option === value ? 'is-selected' : ''} ${index === highlighted ? 'is-highlighted' : ''}`}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => choose(option)}
            >
              <span>{option}</span>{option === value && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToggleSwitch({ label, value, disabled = false, className = '', onChange }: {
  label: string;
  value: boolean;
  disabled?: boolean;
  className?: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`ui-toggle ${value ? 'is-on' : ''} ${className}`.trim()}
      aria-label={`${label}：${value ? '开启' : '关闭'}`}
      aria-pressed={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
    >
      <i />
    </button>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput({ className = '', ...props }, ref) {
  return <input {...props} ref={ref} className={`ui-text-input ${className}`.trim()} />;
});

// Legacy static row kept for existing prototype surfaces that have not migrated yet.
export function ParameterRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="parameter-row">
      <span>{label}</span>
      <button type="button">−</button>
      <div className="track"><i style={{ width: `${pct}%` }} /></div>
      <button type="button">＋</button>
      <output>{value}</output>
    </div>
  );
}

export function ResourceValue({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <span>{icon}<small>{label}</small><b>{value}</b></span>;
}
