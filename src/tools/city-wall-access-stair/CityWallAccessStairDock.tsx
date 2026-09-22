import type { MotionPhase } from '../../ui/motion';
import { PlacementActionBar } from '../placement/PlacementActionBar';
interface Props { motionPhase?: MotionPhase; onComplete: () => void; onCancel: () => void; }
export function CityWallAccessStairDock({ motionPhase = 'steady', onComplete, onCancel }: Props) {
  return <div className={'tool-bottom-cluster city-wall-access-stair-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="登城梯放置主控栏" aria-busy={motionPhase !== 'steady'}>
    <PlacementActionBar ariaLabel="登城梯放置操作栏" modeGroups={[]} confirmLabel="完成登城梯放置" confirmShortLabel="完成放置" cancelLabel="取消登城梯放置" cancelShortLabel="取消" onConfirm={onComplete} onCancel={onCancel} />
  </div>;
}
