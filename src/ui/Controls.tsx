import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Plus } from './icons/runtime-icons.generated';
import { useDialogSystem } from './dialog/DialogSystem';
import { UiIcon } from './icons/UiIcon';

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

export type ControlDensity = 'standard' | 'compact';

interface NumericSliderFieldProps {
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  disabled?: boolean;
  density?: ControlDensity;
  className?: string;
  onChange: (value: number) => void;
}

export function NumericSliderField({
  ariaLabel,
  value,
  min,
  max,
  step,
  format,
  disabled = false,
  density = 'compact',
  className = '',
  onChange,
}: NumericSliderFieldProps) {
  const dialogs = useDialogSystem();
  const decimals = Math.min(4, decimalsForStep(step));

  function commit(next: number) {
    const clamped = clamp(next, min, max);
    const stepped = min + Math.round((clamped - min) / step) * step;
    onChange(Number(clamp(stepped, min, max).toFixed(decimals)));
  }

  return (
    <div className={`ui-numeric-slider-field is-${density} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}>
      <button className="ui-stepper-button" type="button" disabled={disabled} onClick={() => commit(value - step)} aria-label={`${ariaLabel}减小`}>−</button>
      <SliderControl ariaLabel={ariaLabel} value={value} min={min} max={max} step={step} disabled={disabled} onChange={commit} />
      <button className="ui-stepper-button" type="button" disabled={disabled} onClick={() => commit(value + step)} aria-label={`${ariaLabel}增大`}>＋</button>
      <button className="ui-value-button" type="button" disabled={disabled} aria-label={`精确输入${ariaLabel}，当前 ${format ? format(value) : value}`} onClick={() => dialogs.number({ title: `输入${ariaLabel}`, label: ariaLabel, initialValue: value, min, max, step, decimals, formatValue: format, confirmText: '确认', onConfirm: commit })}>{format ? format(value) : value}</button>
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
  density?: ControlDensity;
  onChange: (value: number) => void;
}

export function RuntimeParameterRow({ label, value, min, max, step, format, disabled = false, density = 'compact', onChange }: RuntimeParameterRowProps) {
  return (
    <div className={`parameter-row runtime-parameter-row ui-parameter-row ${disabled ? 'is-disabled' : ''}`}>
      <span>{label}</span>
      <NumericSliderField ariaLabel={label} value={value} min={min} max={max} step={step} format={format} disabled={disabled} density={density} onChange={onChange} />
    </div>
  );
}

interface SelectControlProps {
  ariaLabel: string;
  value: string;
  options: string[];
  disabled?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onChange: (value: string) => void;
}

export function SelectControl({ ariaLabel, value, options, disabled = false, className = '', onOpenChange, onChange }: SelectControlProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(Math.max(0, options.indexOf(value)));
  const [opensUp, setOpensUp] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [open, onOpenChange]);

  function openMenu() {
    if (disabled || options.length === 0) return;
    const rect = rootRef.current?.getBoundingClientRect();
    const menuHeight = Math.min(options.length, 8) * 34 + 8;
    setOpensUp(Boolean(rect && window.innerHeight - rect.bottom < menuHeight + 18));
    setHighlighted(Math.max(0, options.indexOf(value)));
    setOpen(true);
    onOpenChange?.(true);
  }

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    onOpenChange?.(false);
  }

  // 下拉框自身消费 Esc，不能让同一次按键继续关闭 Settings / Tool。
  // 在根节点捕获，保证焦点在 Trigger 或某个 Option 上时行为相同。
  function handleDismiss(event: KeyboardEvent<HTMLDivElement>) {
    if (!open || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    onOpenChange?.(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || options.length === 0) return;
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (event.key === 'ArrowDown') {
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
    <div ref={rootRef} className={`ui-select ${open ? 'is-open' : ''} ${opensUp ? 'opens-up' : ''} ${className}`.trim()} onKeyDownCapture={handleDismiss}>
      <button
        ref={triggerRef}
        type="button"
        className="ui-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (open) {
            setOpen(false);
            onOpenChange?.(false);
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span>{value}</span><UiIcon icon="chevron-down" size={14} className="ui-select__chevron-icon" />
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
              <span>{option}</span>{option === value && <UiIcon icon="check" size={14} className="ui-select__check-icon" />}
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

export function InputBindingField({ ariaLabel, value, disabled = false, className = '', onClick }: { ariaLabel: string; value: string; disabled?: boolean; className?: string; onClick: () => void }) {
  return <button type="button" className={`ui-binding-field ${!value ? 'is-empty' : ''} ${className}`.trim()} aria-label={ariaLabel} disabled={disabled} onClick={onClick}>{value ? <kbd>{value}</kbd> : <span className="ui-binding-field__empty"><Plus size={14} />添加</span>}</button>;
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput({ className = '', ...props }, ref) {
  return <input {...props} ref={ref} className={`ui-text-input ${className}`.trim()} />;
});

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
