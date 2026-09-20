import { useState, type CSSProperties } from 'react';
import { Route } from '../../ui/icons/runtime-icons.generated';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

interface Props {
  moduleName: string;
  systemName: string;
  rotation: number;
  reversed: boolean;
  showClearance: boolean;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

export function CityWallAccessStairOverlay({
  moduleName,
  systemName,
  rotation,
  reversed,
  showClearance,
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [width, setWidth] = useState(6);
  const [height, setHeight] = useState(10);
  const [length, setLength] = useState(18);

  const previewStyle = {
    '--stair-width': Math.round(84 + width * 6) + 'px',
    '--stair-rise': Math.round(58 + height * 5) + 'px',
    '--stair-run': Math.round(120 + length * 5) + 'px',
  } as CSSProperties;

  function updateNumeric(current: number, next: number, setter: (value: number) => void) {
    if (Object.is(current, next)) return;
    setter(next);
    onDirty();
  }

  return (
    <>
      <PlacementContextPanel
        ariaLabel="登城梯放置参数"
        icon={Route}
        title={moduleName}
        subtitle={systemName + ' · 登城梯'}
        closeLabel="退出登城梯放置"
        className={'city-wall-access-stair-prototype motion-left-surface is-' + motionPhase}
        bodyClassName="city-wall-access-stair-prototype__body"
        onClose={onClose}
        dataAttributes={{
          'data-stair-rotation': String(rotation),
          'data-stair-reversed': reversed ? 'true' : 'false',
        }}
      >
        <div className="city-wall-access-stair-context">
          <LeftContextSection title="楼梯尺寸" className="city-wall-access-stair-parameters">
            <RuntimeParameterRow
              label="楼梯宽度"
              value={width}
              min={2}
              max={12}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(width, value, setWidth)}
            />
            <RuntimeParameterRow
              label="楼梯高度"
              value={height}
              min={2}
              max={20}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(height, value, setHeight)}
            />
            <RuntimeParameterRow
              label="楼梯长度"
              value={length}
              min={4}
              max={36}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(length, value, setLength)}
            />
          </LeftContextSection>
        </div>
      </PlacementContextPanel>

      <div
        className={
          'city-wall-access-stair-preview rotation-' + rotation + (reversed ? ' is-reversed' : '')
        }
        style={previewStyle}
        aria-hidden="true"
      >
        <span className="city-wall-access-stair-preview__footprint" />
        <span className="city-wall-access-stair-preview__body">
          {Array.from({ length: 8 }, (_, index) => (
            <i
              key={index}
              className="city-wall-access-stair-preview__step"
              style={{ left: (index * 12.5) + '%', bottom: (index * 12.5) + '%' }}
            />
          ))}
          <i className="city-wall-access-stair-preview__side" />
        </span>
        <span className="city-wall-access-stair-preview__low">LOW</span>
        <span className="city-wall-access-stair-preview__high">HIGH</span>
        {showClearance && <span className="city-wall-access-stair-preview__clearance">楼梯净空</span>}
        <span className="city-wall-access-stair-preview__width-label">宽 {width.toFixed(1)} m</span>
        <span className="city-wall-access-stair-preview__height-label">高 {height.toFixed(1)} m</span>
        <span className="city-wall-access-stair-preview__length-label">长 {length.toFixed(1)} m</span>
      </div>
    </>
  );
}
