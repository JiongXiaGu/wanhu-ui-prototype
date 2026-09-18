import { useState } from 'react';
import { Building2 } from 'lucide-react';
import type { AdjustmentMode, BuildingTerrainMode } from '../../app/ui-state';
import { RuntimeParameterRow, SegmentedControl } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';
import type { MotionPhase } from '../../ui/motion';

interface BuildingPlacementOverlayProps {
  terrainMode: BuildingTerrainMode;
  motionPhase?: MotionPhase;
  adjustmentMode: AdjustmentMode;
  onClose: () => void;
  onDirty: () => void;
}

function ParameterControl({ label, initial, min, max, step, suffix = '', onDirty }: { label: string; initial: number; min: number; max: number; step: number; suffix?: string; onDirty: () => void }) {
  const [value, setValue] = useState(initial);
  const decimals = Math.abs(step) < 0.1 ? 2 : Math.abs(step) < 1 ? 1 : 0;

  return (
    <RuntimeParameterRow
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      format={(next) => `${next.toFixed(decimals)}${suffix}`}
      onChange={(next) => {
        if (Object.is(next, value)) return;
        setValue(next);
        onDirty();
      }}
    />
  );
}

function SegmentRow({ label, items, defaultValue, onDirty }: { label: string; items: string[]; defaultValue: string; onDirty: () => void }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className="bp-segment-row left-context-panel__labeled-control">
      <span>{label}</span>
      <SegmentedControl
        items={items}
        active={active}
        onChange={(item) => {
          if (item === active) return;
          setActive(item);
          onDirty();
        }}
      />
    </div>
  );
}

function TerrainSummary({ mode, onDirty }: { mode: BuildingTerrainMode; onDirty: () => void }) {
  if (mode === 'fill-only') {
    return (
      <LeftContextSection title="只填不挖" className="bp-terrain-summary" tooltip="只允许填高地形，不进行挖方。">
        <div className="bp-terrain-metrics"><span>标高 <b>12.68 m</b></span><span>填高 <b>0.64 m</b></span></div>
      </LeftContextSection>
    );
  }

  if (mode === 'manual-elevation') {
    return (
      <LeftContextSection title="手动标高" className="bp-terrain-summary" tooltip="手动调整建筑相对自动地形计算结果的标高。">
        <ParameterControl label="相对标高" initial={0} min={-5} max={5} step={0.1} suffix=" m" onDirty={onDirty} />
      </LeftContextSection>
    );
  }

  return (
    <LeftContextSection title="平衡挖填" className="bp-terrain-summary" tooltip="自动平衡建筑基底范围内的挖方与填方。">
      <div className="bp-terrain-metrics"><span>标高 <b>12.40 m</b></span><span>挖深 <b>0.42 m</b></span><span>填高 <b>0.38 m</b></span></div>
    </LeftContextSection>
  );
}

function ModeParameters({ mode, onDirty }: { mode: AdjustmentMode; onDirty: () => void }) {
  if (mode === 'massing') {
    return (
      <LeftContextSection title="楼身调整" className="bp-mode-content">
        <ParameterControl label="楼层数量" initial={3} min={1} max={12} step={1} onDirty={onDirty} />
        <ParameterControl label="单层高度" initial={4.2} min={2.4} max={8} step={0.1} suffix=" m" onDirty={onDirty} />
        <SegmentRow label="柱网布局" items={['疏朗', '均衡', '紧凑']} defaultValue="均衡" onDirty={onDirty} />
        <ParameterControl label="楼层收分" initial={0.12} min={0} max={0.4} step={0.01} onDirty={onDirty} />
      </LeftContextSection>
    );
  }

  if (mode === 'roof') {
    return (
      <LeftContextSection title="屋顶调整" className="bp-mode-content">
        <SegmentRow label="屋顶区段" items={['重檐上', '重檐下', '层檐']} defaultValue="重檐上" onDirty={onDirty} />
        <ParameterControl label="出檐尺度" initial={1.4} min={0} max={4} step={0.1} suffix=" m" onDirty={onDirty} />
        <ParameterControl label="翼角起冲" initial={0.45} min={0} max={1} step={0.05} onDirty={onDirty} />
      </LeftContextSection>
    );
  }

  return (
    <LeftContextSection title="位置调整" className="bp-mode-content">
      <SegmentRow label="放置方式" items={['自由', '道路吸附', '网格']} defaultValue="自由" onDirty={onDirty} />
      <ParameterControl label="旋转角度" initial={0} min={0} max={345} step={15} suffix="°" onDirty={onDirty} />
      <ParameterControl label="吸附距离" initial={4} min={0} max={10} step={0.5} suffix=" m" onDirty={onDirty} />
    </LeftContextSection>
  );
}

export function BuildingPlacementOverlay({ terrainMode, motionPhase = 'steady', adjustmentMode, onClose, onDirty }: BuildingPlacementOverlayProps) {
  return (
    <PlacementContextPanel
      ariaLabel="建筑放置参数"
      icon={Building2}
      title="建筑放置"
      subtitle="八角楼阁式木塔"
      closeLabel="退出建筑放置"
      className={`building-placement-prototype motion-left-surface is-${motionPhase}`}
      bodyClassName="building-placement-prototype__body"
      onClose={onClose}
      dataAttributes={{ 'data-terrain': terrainMode, 'data-adjustment': adjustmentMode }}
    >
      <div className="bp-context-panel">
        <TerrainSummary key={terrainMode} mode={terrainMode} onDirty={onDirty} />
        <ModeParameters key={adjustmentMode} mode={adjustmentMode} onDirty={onDirty} />
      </div>
    </PlacementContextPanel>
  );
}
