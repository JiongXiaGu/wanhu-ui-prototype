import { useState, type CSSProperties } from 'react';
import { DoorOpen } from 'lucide-react';
import type { CityWallGatePlacementMode } from '../../app/ui-state';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

interface Props {
  moduleName: string;
  systemName: string;
  placementMode: CityWallGatePlacementMode;
  rotation: number;
  facingFlipped: boolean;
  showConnections: boolean;
  showClearance: boolean;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

function FactRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <span><em>{label}</em><b className={accent ? 'is-accent' : ''}>{value}</b></span>;
}

export function CityWallGateOverlay({
  moduleName,
  systemName,
  placementMode,
  rotation,
  facingFlipped,
  showConnections,
  showClearance,
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [openingWidth, setOpeningWidth] = useState(6);
  const [openingHeight, setOpeningHeight] = useState(5.5);
  const [buildingDepth, setBuildingDepth] = useState(10);
  const connected = placementMode === 'wall-connected';

  const previewStyle = {
    '--gate-opening-width': Math.round(54 + openingWidth * 5) + 'px',
    '--gate-opening-height': Math.round(52 + openingHeight * 6) + 'px',
    '--gate-depth': Math.round(28 + buildingDepth * 2.6) + 'px',
  } as CSSProperties;

  function updateNumeric(current: number, next: number, setter: (value: number) => void) {
    if (Object.is(current, next)) return;
    setter(next);
    onDirty();
  }

  const frontLabel = facingFlipped ? 'Back 朝外' : 'Front 朝外';
  const backLabel = facingFlipped ? 'Front 朝内' : 'Back 朝内';

  return (
    <>
      <PlacementContextPanel
        ariaLabel="城墙门洞放置参数"
        icon={DoorOpen}
        title={moduleName}
        subtitle={systemName + ' · 城墙门洞'}
        closeLabel="退出城墙门洞放置"
        className={'city-wall-gate-prototype motion-left-surface is-' + motionPhase}
        bodyClassName="city-wall-gate-prototype__body"
        onClose={onClose}
        dataAttributes={{
          'data-gate-placement-mode': placementMode,
          'data-gate-facing-flipped': facingFlipped ? 'true' : 'false',
          'data-gate-rotation': String(rotation),
        }}
      >
        <div className="city-wall-gate-context">
          <LeftContextSection title="门洞尺寸" className="city-wall-gate-parameters">
            <RuntimeParameterRow
              label="洞口净宽"
              value={openingWidth}
              min={3}
              max={14}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(openingWidth, value, setOpeningWidth)}
            />
            <RuntimeParameterRow
              label="洞口净高"
              value={openingHeight}
              min={3}
              max={12}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(openingHeight, value, setOpeningHeight)}
            />
            <RuntimeParameterRow
              label="建筑纵深"
              value={buildingDepth}
              min={4}
              max={24}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => updateNumeric(buildingDepth, value, setBuildingDepth)}
            />
          </LeftContextSection>

          {connected ? (
            <LeftContextSection title="当前连接" className="city-wall-gate-facts">
              <div>
                <FactRow label="城墙体系" value={systemName} />
                <FactRow label="墙体厚度" value="6.0 m" />
                <FactRow label="墙高" value="12.0 m" />
                <FactRow label="城门纵深" value={buildingDepth.toFixed(1) + ' m'} accent />
                <FactRow label="正面" value={facingFlipped ? '反向城外侧' : '继承城外侧'} />
              </div>
              <p>城门纵深保持玩家设置，不会被当前墙体厚度覆盖；系统只负责吸附、对齐与左右墙段连接。</p>
            </LeftContextSection>
          ) : (
            <LeftContextSection title="放置状态" className="city-wall-gate-facts">
              <div>
                <FactRow label="模式" value="自由放置" />
                <FactRow label="旋转" value={rotation + '°'} />
                <FactRow label="正面" value={frontLabel} />
                <FactRow label="背面" value={backLabel} />
              </div>
              <p>城门是独立建筑构件，可在没有任何城墙时直接放置；之后再让城墙连接到它的两侧。</p>
            </LeftContextSection>
          )}
        </div>
      </PlacementContextPanel>

      {connected ? (
        <div className={'city-wall-gate-connected-preview ' + (facingFlipped ? 'is-facing-flipped' : '')} style={previewStyle} aria-hidden="true">
          <span className="city-wall-gate-connected-preview__wall" />
          <span className="city-wall-gate-connected-preview__wall-edge city-wall-gate-connected-preview__wall-edge--front" />
          <span className="city-wall-gate-connected-preview__wall-edge city-wall-gate-connected-preview__wall-edge--back" />
          <span className="city-wall-gate-connected-preview__volume">
            <i className="city-wall-gate-connected-preview__roof" />
            <i className="city-wall-gate-connected-preview__side" />
            <i className="city-wall-gate-connected-preview__front-face">
              <b className="city-wall-gate-connected-preview__opening" />
            </i>
          </span>
          {showConnections && <>
            <i className="city-wall-gate-connected-preview__connection city-wall-gate-connected-preview__connection--left" />
            <i className="city-wall-gate-connected-preview__connection city-wall-gate-connected-preview__connection--right" />
          </>}
          {showClearance && <span className="city-wall-gate-connected-preview__clearance">洞口净空</span>}
          <span className="city-wall-gate-connected-preview__front-label">{facingFlipped ? 'BACK / 城内' : 'FRONT / 城外'} ↑</span>
          <span className="city-wall-gate-connected-preview__back-label">↓ {facingFlipped ? 'FRONT / 城外' : 'BACK / 城内'}</span>
          <span className="city-wall-gate-connected-preview__depth-label">建筑纵深 {buildingDepth.toFixed(1)} m · 墙厚 6.0 m</span>
        </div>
      ) : (
        <div className={'city-wall-gate-free-preview rotation-' + rotation + ' ' + (facingFlipped ? 'is-facing-flipped' : '')} style={previewStyle} aria-hidden="true">
          <span className="city-wall-gate-free-preview__footprint" />
          <span className="city-wall-gate-free-preview__volume">
            <i className="city-wall-gate-free-preview__roof" />
            <i className="city-wall-gate-free-preview__side" />
            <i className="city-wall-gate-free-preview__front-face">
              <b className="city-wall-gate-free-preview__opening" />
            </i>
          </span>
          {showClearance && <span className="city-wall-gate-free-preview__clearance">通行净空</span>}
          <span className="city-wall-gate-free-preview__front-label">{facingFlipped ? 'BACK' : 'FRONT'} ↑</span>
          <span className="city-wall-gate-free-preview__back-label">↓ {facingFlipped ? 'FRONT' : 'BACK'}</span>
          <span className="city-wall-gate-free-preview__depth-label">纵深 {buildingDepth.toFixed(1)} m</span>
        </div>
      )}
    </>
  );
}
