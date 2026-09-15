import type { ReactNode } from 'react';

export function SegmentedControl({ items, active, onChange }: { items: string[]; active: string; onChange?: (value: string) => void }) {
  return (
    <div className="segment">
      {items.map((item) => (
        <button key={item} type="button" className={item === active ? 'is-active' : ''} onClick={() => onChange?.(item)}>
          {item}
        </button>
      ))}
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function RuntimeParameterRow({ label, value, min, max, step, format, disabled = false, onChange }: RuntimeParameterRowProps) {
  const span = Math.max(max - min, 0.0001);
  const progress = clamp(((value - min) / span) * 100, 0, 100);

  function commit(next: number) {
    const decimals = step < 1 ? 4 : 0;
    onChange(Number(clamp(next, min, max).toFixed(decimals)));
  }

  return (
    <div className={`parameter-row runtime-parameter-row ${disabled ? 'is-disabled' : ''}`}>
      <span>{label}</span>
      <button type="button" disabled={disabled} onClick={() => commit(value - step)} aria-label={`${label}减小`}>−</button>
      <div className="runtime-slider-shell">
        <div className="runtime-slider-track" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
        <span className="runtime-slider-thumb" style={{ left: `${progress}%` }} aria-hidden="true" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => commit(Number(event.currentTarget.value))}
        />
      </div>
      <button type="button" disabled={disabled} onClick={() => commit(value + step)} aria-label={`${label}增大`}>＋</button>
      <output>{format ? format(value) : value}</output>
    </div>
  );
}

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
