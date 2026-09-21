import { useState } from 'react';
import { RuntimeParameterRow, SegmentedControl } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';

export function BuildingNumericParameter({ label, initial, min, max, step, suffix = '', onDirty }: {
  label: string; initial: number; min: number; max: number; step: number; suffix?: string; onDirty: () => void;
}) {
  const [value, setValue] = useState(initial);
  const decimals = Math.abs(step) < 0.1 ? 2 : Math.abs(step) < 1 ? 1 : 0;
  return (
    <RuntimeParameterRow
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      density="compact"
      format={(next) => next.toFixed(decimals) + suffix}
      onChange={(next) => {
        if (Object.is(next, value)) return;
        setValue(next);
        onDirty();
      }}
    />
  );
}

function SegmentRow({ label, items, defaultValue, onDirty }: {
  label: string; items: string[]; defaultValue: string; onDirty: () => void;
}) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className="bp-segment-row left-context-panel__labeled-control">
      <span>{label}</span>
      <SegmentedControl items={items} active={active} onChange={(item) => {
        if (item === active) return;
        setActive(item);
        onDirty();
      }} />
    </div>
  );
}

export function BuildingPositionParameters({ onDirty }: { onDirty: () => void }) {
  return (
    <LeftContextSection title="位置调整" className="bp-mode-content">
      <SegmentRow label="放置方式" items={['自由', '道路吸附', '网格']} defaultValue="自由" onDirty={onDirty} />
      <BuildingNumericParameter label="旋转角度" initial={0} min={0} max={345} step={15} suffix="°" onDirty={onDirty} />
      <BuildingNumericParameter label="吸附距离" initial={4} min={0} max={10} step={0.5} suffix=" m" onDirty={onDirty} />
    </LeftContextSection>
  );
}
