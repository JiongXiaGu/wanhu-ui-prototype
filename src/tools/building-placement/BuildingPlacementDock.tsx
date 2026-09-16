import type { Dispatch } from 'react';
import {
  ArrowLeftRight,
  ArrowUp,
  Home,
  Layers3,
  Mountain,
  Move,
  RotateCcw,
  RotateCw,
  Ruler,
  Square,
} from 'lucide-react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import { PlacementActionBar, type PlacementModeGroup, type PlacementQuickAction } from '../placement/PlacementActionBar';

interface DockProps {
  state: GameplayUiState;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
  onCancel: () => void;
}

export function BuildingPlacementDock({ state, dispatch, onComplete, onCancel }: DockProps) {
  const modeGroups: PlacementModeGroup[] = [
    {
      id: 'terrain',
      label: '地形处理方式',
      items: [
        {
          id: 'balanced-earthwork',
          label: '平衡挖填',
          icon: Mountain,
          active: state.terrainMode === 'balanced-earthwork',
          onClick: () => dispatch({ type: 'SET_TERRAIN_MODE', mode: 'balanced-earthwork' }),
        },
        {
          id: 'fill-only',
          label: '只填不挖',
          icon: ArrowUp,
          active: state.terrainMode === 'fill-only',
          onClick: () => dispatch({ type: 'SET_TERRAIN_MODE', mode: 'fill-only' }),
        },
        {
          id: 'manual-elevation',
          label: '手动标高',
          icon: Ruler,
          active: state.terrainMode === 'manual-elevation',
          onClick: () => dispatch({ type: 'SET_TERRAIN_MODE', mode: 'manual-elevation' }),
        },
      ],
    },
    {
      id: 'adjustment',
      label: '建筑调整对象',
      items: [
        {
          id: 'position',
          label: '位置调整',
          icon: Move,
          active: state.adjustmentMode === 'position',
          onClick: () => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'position' }),
        },
        {
          id: 'massing',
          label: '楼身调整',
          icon: Layers3,
          active: state.adjustmentMode === 'massing',
          onClick: () => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'massing' }),
        },
        {
          id: 'roof',
          label: '屋顶调整',
          icon: Home,
          active: state.adjustmentMode === 'roof',
          onClick: () => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'roof' }),
        },
        {
          id: 'facade',
          label: '立面调整尚未开放',
          icon: Square,
          active: false,
          disabled: true,
          onClick: () => undefined,
        },
      ],
    },
  ];

  const quickActions: PlacementQuickAction[] = [
    {
      id: 'rotate-left',
      label: '逆时针旋转',
      icon: RotateCcw,
      onClick: () => dispatch({ type: 'MARK_HISTORY_DIRTY' }),
    },
    {
      id: 'rotate-right',
      label: '顺时针旋转',
      icon: RotateCw,
      onClick: () => dispatch({ type: 'MARK_HISTORY_DIRTY' }),
    },
    {
      id: 'mirror',
      label: '镜像建筑',
      icon: ArrowLeftRight,
      onClick: () => dispatch({ type: 'MARK_HISTORY_DIRTY' }),
    },
  ];

  return (
    <div className="tool-bottom-cluster building-placement-toolbar-cluster" aria-label="建筑放置主控栏">
      <PlacementActionBar
        ariaLabel="建筑放置操作栏"
        modeGroups={modeGroups}
        quickActions={quickActions}
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
