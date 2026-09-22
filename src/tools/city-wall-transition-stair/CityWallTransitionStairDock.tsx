import type { MotionPhase } from '../../ui/motion';
import { PlacementActionBar } from '../placement/PlacementActionBar';
interface Props { motionPhase?: MotionPhase; onComplete: () => void; onCancel: () => void; }
export function CityWallTransitionStairDock({ motionPhase = 'steady', onComplete, onCancel }: Props) {
  return <div className={'tool-bottom-cluster city-wall-transition-stair-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="高差楼梯放置主控栏" aria-busy={motionPhase !== 'steady'}>
    <PlacementActionBar ariaLabel="高差楼梯放置操作栏" modeGroups={[]} confirmLabel="完成高差楼梯放置" confirmShortLabel="完成放置" cancelLabel="取消高差楼梯放置" cancelShortLabel="取消" onConfirm={onComplete} onCancel={onCancel} />
  </div>;
}
