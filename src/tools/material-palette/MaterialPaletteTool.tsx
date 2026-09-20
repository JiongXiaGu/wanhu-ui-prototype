import type { Dispatch } from 'react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { BuildingSchemeModeOverlay } from '../building-scheme/BuildingSchemeModeOverlay';
import { LightAdjustmentOverlay } from '../light-adjustment/LightAdjustmentOverlay';
import { MaterialPaletteDock } from './MaterialPaletteDock';
import { MaterialPaletteOverlay } from './MaterialPaletteOverlay';

interface Props {
  state: GameplayUiState;
  dispatch: Dispatch<GameplayUiAction>;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

/**
 * Web prototype shell for the single color-editing Tool.
 *
 * Unity target:
 * ColorToolController
 * ├ SurfaceModeController
 * ├ LightingModeController
 * ├ SchemeModeController
 * └ ColorToolDock
 *
 * GameplayScreen owns only Tool presence. This shell owns which internal mode
 * is mounted and guarantees the same bottom dock persists across mode changes.
 */
export function MaterialPaletteTool({
  state,
  dispatch,
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  return (
    <>
      {state.materialPaletteMode === 'surface' && (
        <MaterialPaletteOverlay
          key="surface"
          motionPhase={motionPhase}
          onClose={onClose}
          onDirty={onDirty}
        />
      )}

      {state.materialPaletteMode === 'lighting' && (
        <LightAdjustmentOverlay
          key="lighting"
          motionPhase={motionPhase}
          onClose={onClose}
          onDirty={onDirty}
        />
      )}

      {state.materialPaletteMode === 'scheme' && (
        <BuildingSchemeModeOverlay
          key="scheme"
          motionPhase={motionPhase}
          onClose={onClose}
          onDirty={onDirty}
        />
      )}

      <MaterialPaletteDock
        state={state}
        motionPhase={motionPhase}
        dispatch={dispatch}
        onComplete={onClose}
        onCancel={onClose}
      />
    </>
  );
}
