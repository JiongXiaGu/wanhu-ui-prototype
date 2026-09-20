import type { Dispatch } from 'react';
import { Layers3, Lightbulb, Palette } from 'lucide-react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { PlacementActionBar, type PlacementModeGroup } from '../placement/PlacementActionBar';

interface Props {
  state: GameplayUiState;
  motionPhase?: MotionPhase;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
  onCancel: () => void;
}

export function MaterialPaletteDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const modeGroups: PlacementModeGroup[] = [{
    id: 'material-palette-mode',
    label: '配色工具模式',
    items: [
      {
        id: 'surface',
        label: '表面模式',
        icon: Layers3,
        active: state.materialPaletteMode === 'surface',
        onClick: () => dispatch({ type: 'SET_MATERIAL_PALETTE_MODE', mode: 'surface' }),
      },
      {
        id: 'lighting',
        label: '灯光模式',
        icon: Lightbulb,
        active: state.materialPaletteMode === 'lighting',
        onClick: () => dispatch({ type: 'SET_MATERIAL_PALETTE_MODE', mode: 'lighting' }),
      },
      {
        id: 'scheme',
        label: '方案模式',
        icon: Palette,
        active: state.materialPaletteMode === 'scheme',
        onClick: () => dispatch({ type: 'SET_MATERIAL_PALETTE_MODE', mode: 'scheme' }),
      },
    ],
  }];

  return (
    <div
      className={'tool-bottom-cluster material-palette-toolbar-cluster motion-bottom-surface is-' + motionPhase}
      aria-label="配色工具主控栏"
      aria-busy={motionPhase !== 'steady'}
    >
      <PlacementActionBar
        ariaLabel="配色工具操作栏"
        modeGroups={modeGroups}
        confirmLabel="完成配色"
        cancelLabel="取消配色"
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
