import type { Dispatch } from 'react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { SchemeModeOverlay } from './modes/scheme/SchemeModeOverlay';
import { LightingModeOverlay } from './modes/lighting/LightingModeOverlay';
import { ColorToolDock } from './ColorToolDock';
import { SurfaceModeOverlay } from './modes/surface/SurfaceModeOverlay';

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
 * Shared panels, controls and catalog contracts stay data-agnostic; Mode
 * controllers bind business identifiers and draft data at the feature boundary.
 */
export function ColorTool({
  state,
  dispatch,
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  return (
    <>
      {state.colorToolMode === 'surface' && (
        <SurfaceModeOverlay
          key="surface"
          motionPhase={motionPhase}
          onClose={onClose}
          onDirty={onDirty}
        />
      )}

      {state.colorToolMode === 'lighting' && (
        <LightingModeOverlay
          key="lighting"
          motionPhase={motionPhase}
          onClose={onClose}
          onDirty={onDirty}
        />
      )}

      {state.colorToolMode === 'scheme' && (
        <SchemeModeOverlay
          key="scheme"
          motionPhase={motionPhase}
          onClose={onClose}
          onDirty={onDirty}
        />
      )}

      <ColorToolDock
        state={state}
        motionPhase={motionPhase}
        dispatch={dispatch}
        onComplete={onClose}
        onCancel={onClose}
      />
    </>
  );
}
