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
