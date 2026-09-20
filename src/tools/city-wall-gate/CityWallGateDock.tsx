import type { Dispatch } from 'react';
import { ArrowLeftRight, Link2, MousePointer2, RotateCcw, RotateCw } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { PlacementActionBar, type PlacementModeGroup, type PlacementQuickAction } from '../placement/PlacementActionBar';

interface Props {
  state: GameplayUiState;
  motionPhase?: MotionPhase;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
  onCancel: () => void;
}

export function CityWallGateDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const modeGroups: PlacementModeGroup[] = [{
    id: 'city-wall-gate-placement-mode',
    label: '城墙门洞放置模式',
    items: [
      {
        id: 'free',
        label: '自由放置',
        icon: MousePointer2,
        active: state.cityWallGatePlacementMode === 'free',
        onClick: () => dispatch({ type: 'SET_CITY_WALL_GATE_MODE', mode: 'free' }),
      },
      {
        id: 'wall-connected',
        label: '城墙连接',
        icon: Link2,
        active: state.cityWallGatePlacementMode === 'wall-connected',
        onClick: () => dispatch({ type: 'SET_CITY_WALL_GATE_MODE', mode: 'wall-connected' }),
      },
    ],
  }];

  const quickActions: PlacementQuickAction[] = state.cityWallGatePlacementMode === 'free'
    ? [
        {
          id: 'rotate-gate-left',
          label: '城门左转',
          icon: RotateCcw,
          onClick: () => dispatch({ type: 'ROTATE_CITY_WALL_GATE', direction: 'left' }),
        },
        {
          id: 'rotate-gate-right',
          label: '城门右转',
          icon: RotateCw,
          onClick: () => dispatch({ type: 'ROTATE_CITY_WALL_GATE', direction: 'right' }),
        },
        {
          id: 'flip-gate-facing',
          label: '交换正反面',
          icon: ArrowLeftRight,
          onClick: () => dispatch({ type: 'FLIP_CITY_WALL_GATE_FACING' }),
        },
      ]
    : [
        {
          id: 'flip-gate-facing',
          label: '交换正反面',
          icon: ArrowLeftRight,
          onClick: () => dispatch({ type: 'FLIP_CITY_WALL_GATE_FACING' }),
        },
      ];

  return (
    <div className={'tool-bottom-cluster city-wall-gate-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="城墙门洞放置主控栏" aria-busy={motionPhase !== 'steady'}>
      <PlacementActionBar
        ariaLabel="城墙门洞放置操作栏"
        modeGroups={modeGroups}
        quickActions={quickActions}
        confirmLabel="完成城墙门洞放置"
        cancelLabel="取消城墙门洞放置"
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
