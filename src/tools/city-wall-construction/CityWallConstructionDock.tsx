import type { Dispatch } from 'react';
import { ArrowLeftRight, BoxSelect, CornerDownRight } from '../../ui/icons/runtime-icons.generated';
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

export function CityWallConstructionDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const modeGroups: PlacementModeGroup[] = [{
    id: 'city-wall-construction-mode',
    label: '城墙营造模式',
    items: [
      {
        id: 'range',
        label: '范围模式',
        icon: BoxSelect,
        active: state.cityWallConstructionMode === 'range',
        onClick: () => dispatch({ type: 'SET_CITY_WALL_CONSTRUCTION_MODE', mode: 'range' }),
      },
      {
        id: 'fixed-width',
        label: '定宽延伸',
        icon: CornerDownRight,
        active: state.cityWallConstructionMode === 'fixed-width',
        onClick: () => dispatch({ type: 'SET_CITY_WALL_CONSTRUCTION_MODE', mode: 'fixed-width' }),
      },
    ],
  }];

  const quickActions: PlacementQuickAction[] = state.cityWallConstructionMode === 'fixed-width'
    ? [{
        id: 'flip-city-wall-facing',
        label: '交换正反面',
        icon: ArrowLeftRight,
        onClick: () => dispatch({ type: 'FLIP_CITY_WALL_FACING' }),
      }]
    : [];

  return (
    <div className={'tool-bottom-cluster city-wall-construction-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="城墙主体营造主控栏" aria-busy={motionPhase !== 'steady'}>
      <PlacementActionBar
        ariaLabel="城墙主体营造操作栏"
        modeGroups={modeGroups}
        quickActions={quickActions}
        confirmLabel="完成城墙营造"
        cancelLabel="取消城墙营造"
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
