import { useState } from 'react';
import { Route } from 'lucide-react';
import type { RoadDrawMode } from '../../app/ui-state';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';
import type { MotionPhase } from '../../ui/motion';

interface RoadPlacementOverlayProps {
  drawMode: RoadDrawMode;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

function RoadParameterControl({ label, initial, min, max, step, suffix, onDirty }: { label: string; initial: number; min: number; max: number; step: number; suffix: string; onDirty: () => void }) {
  const [value, setValue] = useState(initial);
  const decimals = Math.abs(step) < 1 ? 1 : 0;

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

const MODE_COPY: Record<RoadDrawMode, { title: string; detail: string }> = {
  'smart-curve': { title: '智能曲线', detail: '自动平滑转折并辅助连接既有道路，适合连续街巷与自然转向。' },
  curve: { title: '曲线', detail: '手动控制道路曲线形态，适合河岸、园路与精确弯道。' },
  straight: { title: '直线', detail: '保持道路轴线笔直，适合城市中轴、坊巷与规则路网。' },
};

export function RoadPlacementOverlay({ drawMode, motionPhase = 'steady', onClose, onDirty }: RoadPlacementOverlayProps) {
  const modeCopy = MODE_COPY[drawMode];

  return (
    <PlacementContextPanel
      ariaLabel="道路铺设参数"
      icon={Route}
      title="道路铺设"
      subtitle="土路"
      closeLabel="退出道路铺设"
      className={`road-placement-prototype motion-left-surface is-${motionPhase}`}
      bodyClassName="road-placement-prototype__body"
      onClose={onClose}
      dataAttributes={{ 'data-road-mode': drawMode }}
    >
      <div key={drawMode} className="road-placement-context road-placement-context--motion">
        <LeftContextSection title={modeCopy.title} className="road-placement-summary">
          <p>{modeCopy.detail}</p>
          <div className="road-placement-summary__metrics">
            <span>预估长度 <b>28 m</b></span>
            <span>坡度 <b>3.2%</b></span>
            <span>节点 <b>3</b></span>
          </div>
        </LeftContextSection>

        <LeftContextSection title="道路参数" className="road-placement-parameters">
          <RoadParameterControl label="道路宽度" initial={6} min={2} max={20} step={1} suffix=" m" onDirty={onDirty} />
          <RoadParameterControl label="相对标高" initial={0} min={-5} max={5} step={0.1} suffix=" m" onDirty={onDirty} />
          {drawMode !== 'straight' && <RoadParameterControl label="曲线平滑" initial={60} min={0} max={100} step={5} suffix="%" onDirty={onDirty} />}
        </LeftContextSection>
      </div>
    </PlacementContextPanel>
  );
}
