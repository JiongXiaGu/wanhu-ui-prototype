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

export function CityWallTransitionStairOverlay({
  moduleName,
  systemName,
  rotation,
  reversed,
  showClearance,
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [width, setWidth] = useState(4);
  const [heightDelta, setHeightDelta] = useState(4);
  const [length, setLength] = useState(10);

  const previewStyle = {
    '--transition-stair-width': Math.round(78 + width * 7) + 'px',
    '--transition-stair-rise': Math.round(46 + heightDelta * 8) + 'px',
    '--transition-stair-run': Math.round(112 + length * 7) + 'px',
  } as CSSProperties;

  function updateNumeric(current: number, next: number, setter: (value: number) => void) {
    if (Object.is(current, next)) return;
    setter(next);
    onDirty();
  }

  return (
    <>
      <PlacementContextPanel
        ariaLabel="高差楼梯放置参数"
        icon={Route}
        title={moduleName}
        subtitle={systemName + ' · 高差楼梯'}
        closeLabel="退出高差楼梯放置"
        className={'city-wall-transition-stair-prototype motion-left-surface is-' + motionPhase}
        bodyClassName="city-wall-transition-stair-prototype__body"
        onClose={onClose}
        dataAttributes={{
          'data-transition-stair-rotation': String(rotation),
          'data-transition-stair-reversed': reversed ? 'true' : 'false',
        }}
      >
        <div className="city-wall-transition-stair-context">
          <LeftContextSection title="楼梯尺寸" className="city-wall-transition-stair-parameters">
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
              label="楼梯高差"
              value={heightDelta}
              min={1}
              max={12}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(heightDelta, value, setHeightDelta)}
            />
            <RuntimeParameterRow
              label="楼梯长度"
              value={length}
              min={3}
              max={24}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(length, value, setLength)}
            />
          </LeftContextSection>
        </div>
      </PlacementContextPanel>

      <div
        className={
          'city-wall-transition-stair-preview rotation-' + rotation + (reversed ? ' is-reversed' : '')
        }
        style={previewStyle}
        aria-hidden="true"
      >
        <span className="city-wall-transition-stair-preview__platform city-wall-transition-stair-preview__platform--low" />
        <span className="city-wall-transition-stair-preview__platform city-wall-transition-stair-preview__platform--high" />
        <span className="city-wall-transition-stair-preview__body">
          {Array.from({ length: 7 }, (_, index) => (
            <i
              key={index}
              className="city-wall-transition-stair-preview__step"
              style={{ left: (index * 14.2857) + '%', bottom: (index * 14.2857) + '%' }}
            />
          ))}
          <i className="city-wall-transition-stair-preview__side" />
        </span>
        <span className="city-wall-transition-stair-preview__low">LOW</span>
        <span className="city-wall-transition-stair-preview__high">HIGH</span>
        {showClearance && <span className="city-wall-transition-stair-preview__clearance">楼梯净空</span>}
        <span className="city-wall-transition-stair-preview__width-label">宽 {width.toFixed(1)} m</span>
        <span className="city-wall-transition-stair-preview__height-label">高差 {heightDelta.toFixed(1)} m</span>
        <span className="city-wall-transition-stair-preview__length-label">长 {length.toFixed(1)} m</span>
      </div>
    </>
  );
}
