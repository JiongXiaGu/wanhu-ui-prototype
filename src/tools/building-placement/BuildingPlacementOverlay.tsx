import { useState } from 'react';
import { X } from 'lucide-react';
import type { AdjustmentMode, TerrainMode } from '../../app/ui-state';

interface BuildingPlacementOverlayProps {
  terrainMode: TerrainMode;
  adjustmentMode: AdjustmentMode;
  onClose: () => void;
  onDirty: () => void;
}

function ParameterControl({ label, initial, pct, step, suffix = '', onDirty }: { label: string; initial: number; pct: number; step: number; suffix?: string; onDirty: () => void }) {
  const [value, setValue] = useState(initial);
  const [fill, setFill] = useState(pct);

  function adjust(delta: number) {
    setValue((current) => current + delta);
    setFill((current) => Math.max(4, Math.min(96, current + Math.sign(delta) * 4)));
    onDirty();
  }

  const decimals = Math.abs(step) < 0.1 ? 2 : Math.abs(step) < 1 ? 1 : 0;
  return (
    <div className="bp-parameter-row">
      <span>{label}</span>
      <button type="button" onClick={() => adjust(-step)}>−</button>
      <div className="bp-track"><i style={{ width: `${fill}%` }} /></div>
      <button type="button" onClick={() => adjust(step)}>＋</button>
      <output>{value.toFixed(decimals)}{suffix}</output>
    </div>
  );
}

function SegmentRow({ label, items, defaultValue, onDirty }: { label: string; items: string[]; defaultValue: string; onDirty: () => void }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className="bp-segment-row">
      <span>{label}</span>
      <div className="bp-segment">
        {items.map((item) => (
          <button type="button" key={item} className={active === item ? 'is-active' : ''} onClick={() => { setActive(item); onDirty(); }}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function TerrainSummary({ mode, onDirty }: { mode: TerrainMode; onDirty: () => void }) {
  if (mode === 'fill-only') {
    return (
      <section className="bp-terrain-summary" title="只允许填高地形，不进行挖方。">
        <div className="bp-terrain-summary__top"><b>只填不挖</b></div>
        <div className="bp-terrain-metrics"><span>标高 <b>12.68 m</b></span><span>填高 <b>0.64 m</b></span></div>
      </section>
    );
  }

  if (mode === 'manual-elevation') {
    return (
      <section className="bp-terrain-summary" title="手动调整建筑相对自动地形计算结果的标高。">
        <div className="bp-terrain-summary__top"><b>手动标高</b></div>
        <ParameterControl label="相对标高" initial={0} pct={50} step={0.1} suffix=" m" onDirty={onDirty} />
      </section>
    );
  }

  return (
    <section className="bp-terrain-summary" title="自动平衡建筑基底范围内的挖方与填方。">
      <div className="bp-terrain-summary__top"><b>平衡挖填</b></div>
      <div className="bp-terrain-metrics"><span>标高 <b>12.40 m</b></span><span>挖深 <b>0.42 m</b></span><span>填高 <b>0.38 m</b></span></div>
    </section>
  );
}

function ModeParameters({ mode, onDirty }: { mode: AdjustmentMode; onDirty: () => void }) {
  if (mode === 'massing') {
    return (
      <section className="bp-mode-content">
        <div className="bp-mode-heading"><b>楼身调整</b></div>
        <ParameterControl label="楼层数量" initial={3} pct={42} step={1} onDirty={onDirty} />
        <ParameterControl label="单层高度" initial={4.2} pct={48} step={0.1} onDirty={onDirty} />
        <SegmentRow label="柱网布局" items={['疏朗', '均衡', '紧凑']} defaultValue="均衡" onDirty={onDirty} />
        <ParameterControl label="楼层收分" initial={0.12} pct={34} step={0.01} onDirty={onDirty} />
      </section>
    );
  }

  if (mode === 'roof') {
    return (
      <section className="bp-mode-content">
        <div className="bp-mode-heading"><b>屋顶调整</b></div>
        <SegmentRow label="屋顶区段" items={['重檐上', '重檐下', '层檐']} defaultValue="重檐上" onDirty={onDirty} />
        <ParameterControl label="出檐尺度" initial={1.4} pct={36} step={0.1} onDirty={onDirty} />
        <ParameterControl label="翼角起冲" initial={0.45} pct={45} step={0.05} onDirty={onDirty} />
      </section>
    );
  }

  return (
    <section className="bp-mode-content">
      <div className="bp-mode-heading"><b>位置调整</b></div>
      <SegmentRow label="放置方式" items={['自由', '道路吸附', '网格']} defaultValue="自由" onDirty={onDirty} />
      <ParameterControl label="旋转角度" initial={0} pct={4} step={15} suffix="°" onDirty={onDirty} />
      <ParameterControl label="吸附距离" initial={4} pct={44} step={0.5} suffix=" m" onDirty={onDirty} />
    </section>
  );
}

export function BuildingPlacementOverlay({ terrainMode, adjustmentMode, onClose, onDirty }: BuildingPlacementOverlayProps) {
  return (
    <section className="tool-overlay building-placement-prototype" data-terrain={terrainMode} data-adjustment={adjustmentMode}>
      <header>
        <div><b>建筑放置</b><span>八角楼阁式木塔</span></div>
        <button className="icon-button" onClick={onClose} aria-label="退出建筑放置"><X /></button>
      </header>
      <div className="tool-body">
        <div className="bp-context-panel">
          <TerrainSummary key={terrainMode} mode={terrainMode} onDirty={onDirty} />
          <ModeParameters key={adjustmentMode} mode={adjustmentMode} onDirty={onDirty} />
        </div>
      </div>
    </section>
  );
}
