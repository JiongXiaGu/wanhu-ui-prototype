import type { Dispatch } from 'react';
import { ArrowLeftRight, Minus, Route, Sparkles } from 'lucide-react';
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
    id: 'city-wall-draw-mode',
    label: '城墙绘制模式',
    items: [
      {
        id: 'smart-polyline',
        label: '智能折线',
        icon: Sparkles,
        active: state.cityWallDrawMode === 'smart-polyline',
        onClick: () => dispatch({ type: 'SET_CITY_WALL_DRAW_MODE', mode: 'smart-polyline' }),
      },
      {
        id: 'straight',
        label: '直线',
        icon: Minus,
        active: state.cityWallDrawMode === 'straight',
        onClick: () => dispatch({ type: 'SET_CITY_WALL_DRAW_MODE', mode: 'straight' }),
      },
      {
        id: 'curve',
        label: '曲线',
        icon: Route,
        active: state.cityWallDrawMode === 'curve',
        onClick: () => dispatch({ type: 'SET_CITY_WALL_DRAW_MODE', mode: 'curve' }),
      },
    ],
  }];

  const quickActions: PlacementQuickAction[] = [{
    id: 'flip-city-wall-outside',
    label: '反转城外方向',
    icon: ArrowLeftRight,
    onClick: () => dispatch({ type: 'FLIP_CITY_WALL_OUTSIDE' }),
  }];

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
