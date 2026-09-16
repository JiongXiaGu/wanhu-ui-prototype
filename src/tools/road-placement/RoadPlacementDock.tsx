import type { Dispatch } from 'react';
import { ArrowLeftRight, Minus, Route, Sparkles } from 'lucide-react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import { PlacementActionBar, type PlacementModeGroup, type PlacementQuickAction } from '../placement/PlacementActionBar';

interface Props {
  state: GameplayUiState;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
  onCancel: () => void;
}

export function RoadPlacementDock({ state, dispatch, onComplete, onCancel }: Props) {
  const modeGroups: PlacementModeGroup[] = [
    {
      id: 'road-draw-mode',
      label: '道路绘制模式',
      items: [
        {
          id: 'smart-curve',
          label: '智能曲线',
          icon: Sparkles,
          active: state.roadDrawMode === 'smart-curve',
          onClick: () => dispatch({ type: 'SET_ROAD_DRAW_MODE', mode: 'smart-curve' }),
        },
        {
          id: 'curve',
          label: '曲线',
          icon: Route,
          active: state.roadDrawMode === 'curve',
          onClick: () => dispatch({ type: 'SET_ROAD_DRAW_MODE', mode: 'curve' }),
        },
        {
          id: 'straight',
          label: '直线',
          icon: Minus,
          active: state.roadDrawMode === 'straight',
          onClick: () => dispatch({ type: 'SET_ROAD_DRAW_MODE', mode: 'straight' }),
        },
      ],
    },
  ];

  const quickActions: PlacementQuickAction[] = [
    {
      id: 'reverse-direction',
      label: '反转道路方向',
      icon: ArrowLeftRight,
      onClick: () => dispatch({ type: 'MARK_HISTORY_DIRTY' }),
    },
  ];

  return (
    <div className="tool-bottom-cluster road-placement-toolbar-cluster" aria-label="道路铺设主控栏">
      <PlacementActionBar
        ariaLabel="道路铺设操作栏"
        modeGroups={modeGroups}
        quickActions={quickActions}
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
