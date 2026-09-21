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

export function BuildingMassingParameters({ onDirty }: { onDirty: () => void }) {
  return (
    <LeftContextSection title="楼身调整" className="bp-mode-content">
      <BuildingNumericParameter label="楼层数量" initial={3} min={1} max={12} step={1} onDirty={onDirty} />
      <BuildingNumericParameter label="单层高度" initial={4.2} min={2.4} max={8} step={0.1} suffix=" m" onDirty={onDirty} />
      <SegmentRow label="柱网布局" items={['疏朗', '均衡', '紧凑']} defaultValue="均衡" onDirty={onDirty} />
      <BuildingNumericParameter label="楼层收分" initial={0.12} min={0} max={0.4} step={0.01} onDirty={onDirty} />
    </LeftContextSection>
  );
}

export function BuildingRoofParameters({ onDirty }: { onDirty: () => void }) {
  return (
    <LeftContextSection title="屋顶调整" className="bp-mode-content">
      <SegmentRow label="屋顶区段" items={['重檐上', '重檐下', '层檐']} defaultValue="重檐上" onDirty={onDirty} />
      <BuildingNumericParameter label="出檐尺度" initial={1.4} min={0} max={4} step={0.1} suffix=" m" onDirty={onDirty} />
      <BuildingNumericParameter label="翼角起冲" initial={0.45} min={0} max={1} step={0.05} onDirty={onDirty} />
    </LeftContextSection>
  );
}
