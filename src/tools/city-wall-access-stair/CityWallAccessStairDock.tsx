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

export function CityWallAccessStairDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const quickActions: PlacementQuickAction[] = [
    {
      id: 'rotate-access-stair-left',
      label: '登城梯左转',
      icon: RotateCcw,
      onClick: () => dispatch({ type: 'ROTATE_CITY_WALL_ACCESS_STAIR', direction: 'left' }),
    },
    {
      id: 'rotate-access-stair-right',
      label: '登城梯右转',
      icon: RotateCw,
      onClick: () => dispatch({ type: 'ROTATE_CITY_WALL_ACCESS_STAIR', direction: 'right' }),
    },
    {
      id: 'flip-access-stair-direction',
      label: '交换上下端',
      icon: ArrowUpDown,
      onClick: () => dispatch({ type: 'FLIP_CITY_WALL_ACCESS_STAIR_DIRECTION' }),
    },
  ];

  return (
    <div
      className={'tool-bottom-cluster city-wall-access-stair-toolbar-cluster motion-bottom-surface is-' + motionPhase}
      aria-label="登城梯放置主控栏"
      aria-busy={motionPhase !== 'steady'}
    >
      <PlacementActionBar
        ariaLabel="登城梯放置操作栏"
        modeGroups={[]}
        quickActions={quickActions}
        confirmLabel="完成登城梯放置"
        cancelLabel="取消登城梯放置"
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
