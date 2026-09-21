import { Building2 } from '../../ui/icons/runtime-icons.generated';
import type { BuildingPlacementIntent, BuildingTerrainMode } from '../../app/ui-state';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';
import { BuildingPositionParameters } from '../building-common/BuildingParameterSections';
import type { MotionPhase } from '../../ui/motion';

interface Props {
  terrainMode: BuildingTerrainMode;
  placementIntent?: BuildingPlacementIntent;
  buildingName?: string;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

function TerrainSummary({ mode, onDirty }: { mode: BuildingTerrainMode; onDirty: () => void }) {
  if (mode === 'fill-only') return <LeftContextSection title="只填不挖" className="bp-terrain-summary"><div className="bp-terrain-metrics"><span>标高 <b>12.68 m</b></span><span>填高 <b>0.64 m</b></span></div></LeftContextSection>;
  if (mode === 'manual-elevation') return <LeftContextSection title="手动标高" className="bp-terrain-summary"><RuntimeParameterRow label="相对标高" value={0} min={-5} max={5} step={0.1} format={(value) => value.toFixed(1) + ' m'} onChange={() => onDirty()} /></LeftContextSection>;
  return <LeftContextSection title="平衡挖填" className="bp-terrain-summary"><div className="bp-terrain-metrics"><span>标高 <b>12.40 m</b></span><span>挖深 <b>0.42 m</b></span><span>填高 <b>0.38 m</b></span></div></LeftContextSection>;
}

export function BuildingPlacementOverlay({ terrainMode, placementIntent = 'new', buildingName, motionPhase = 'steady', onClose, onDirty }: Props) {
  const moving = placementIntent === 'move';
  return (
    <PlacementContextPanel
      ariaLabel={moving ? '移动建筑参数' : '建筑放置参数'}
      icon={Building2}
      title={moving ? '移动建筑' : '建筑放置'}
      subtitle={moving ? (buildingName ?? '已选建筑') : (buildingName ?? '八角楼阁式木塔')}
      closeLabel={moving ? '取消移动建筑' : '退出建筑放置'}
      className={'building-placement-prototype motion-left-surface is-' + motionPhase}
      bodyClassName="building-placement-prototype__body"
      onClose={onClose}
      dataAttributes={{ 'data-terrain': terrainMode, 'data-building-placement-intent': placementIntent }}
    >
      <div className="bp-context-panel">
        <TerrainSummary key={terrainMode} mode={terrainMode} onDirty={onDirty} />
        <BuildingPositionParameters onDirty={onDirty} />
      </div>
    </PlacementContextPanel>
  );
}
