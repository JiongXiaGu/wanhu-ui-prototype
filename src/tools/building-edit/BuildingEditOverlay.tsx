import { Building2 } from '../../ui/icons/runtime-icons.generated';
import type { AdjustmentMode } from '../../app/ui-state';
import { LeftContextPanel, LeftContextSection } from '../../ui/LeftContextPanel';
import { BuildingMassingParameters, BuildingRoofParameters } from '../building-common/BuildingParameterSections';
import type { MotionPhase } from '../../ui/motion';

interface Props { buildingName?: string; adjustmentMode: AdjustmentMode; motionPhase?: MotionPhase; onClose: () => void; onDirty: () => void; }

export function BuildingEditOverlay({ buildingName, adjustmentMode, motionPhase = 'steady', onClose, onDirty }: Props) {
  return <LeftContextPanel
    as="section"
    ariaLabel="建筑编辑参数"
    icon={Building2}
    title="编辑建筑"
    subtitle={buildingName ?? '已选建筑'}
    closeLabel="退出建筑编辑"
    className={'building-edit-prototype motion-left-surface is-' + motionPhase}
    bodyClassName="building-edit-prototype__body"
    onClose={onClose}
    dataAttributes={{ 'data-building-edit-mode': adjustmentMode }}
  >
    {adjustmentMode === 'roof' ? <BuildingRoofParameters onDirty={onDirty} /> : adjustmentMode === 'facade' ? <LeftContextSection title="立面调整"><p className="building-edit-placeholder">立面参数将在后续建筑外观阶段接入。</p></LeftContextSection> : <BuildingMassingParameters onDirty={onDirty} />}
  </LeftContextPanel>;
}
