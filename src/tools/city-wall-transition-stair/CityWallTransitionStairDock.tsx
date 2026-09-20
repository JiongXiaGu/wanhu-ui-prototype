import type { Dispatch } from 'react';
import { ArrowUpDown, RotateCcw, RotateCw } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { PlacementActionBar, type PlacementQuickAction } from '../placement/PlacementActionBar';

interface Props {
  state: GameplayUiState;
  motionPhase?: MotionPhase;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
  onCancel: () => void;
}

export function CityWallTransitionStairDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const quickActions: PlacementQuickAction[] = [
    {
      id: 'rotate-transition-stair-left',
      label: '高差楼梯左转',
      icon: RotateCcw,
      onClick: () => dispatch({ type: 'ROTATE_CITY_WALL_TRANSITION_STAIR', direction: 'left' }),
    },
    {
      id: 'rotate-transition-stair-right',
      label: '高差楼梯右转',
      icon: RotateCw,
      onClick: () => dispatch({ type: 'ROTATE_CITY_WALL_TRANSITION_STAIR', direction: 'right' }),
    },
    {
      id: 'flip-transition-stair-direction',
      label: '交换上下端',
      icon: ArrowUpDown,
      onClick: () => dispatch({ type: 'FLIP_CITY_WALL_TRANSITION_STAIR_DIRECTION' }),
    },
  ];

  return (
    <div
      className={'tool-bottom-cluster city-wall-transition-stair-toolbar-cluster motion-bottom-surface is-' + motionPhase}
      aria-label="高差楼梯放置主控栏"
      aria-busy={motionPhase !== 'steady'}
    >
      <PlacementActionBar
        ariaLabel="高差楼梯放置操作栏"
        modeGroups={[]}
        quickActions={quickActions}
        confirmLabel="完成高差楼梯放置"
        cancelLabel="取消高差楼梯放置"
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
