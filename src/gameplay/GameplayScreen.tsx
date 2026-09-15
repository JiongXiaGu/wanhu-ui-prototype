import { useReducer } from 'react';
import type { GameplayUiState } from '../app/ui-state';
import { gameplayUiReducer, selectGameplaySpace } from '../app/ui-state';
import { BuildingWorkspace } from '../workspace/BuildingWorkspace';
import { BuildingPlacementOverlay } from '../tools/building-placement/BuildingPlacementOverlay';
import { BuildingPlacementDock } from '../tools/building-placement/BuildingPlacementDock';
import { CommandBar, UtilityToolbar } from './CommandBar';
import { GameplayHUD } from './GameplayHUD';
import { GameplayOperationHints } from './GameplayOperationHints';
import { PauseLayer } from './PauseLayer';
import { QuickControls } from './QuickControls';
import { RightEdgeFlyout } from './RightEdgeFlyout';

interface GameplayScreenProps {
  background: string;
  initialState: GameplayUiState;
  onMainMenu: () => void;
}

export function GameplayScreen({ background, initialState, onMainMenu }: GameplayScreenProps) {
  const [state, dispatch] = useReducer(gameplayUiReducer, initialState);
  const space = selectGameplaySpace(state);
  const toolOpen = state.tool === 'building-placement';

  function exitTool() {
    dispatch({ type: 'EXIT_TOOL' });
  }

  return (
    <section className="screen gameplay-screen" style={{ backgroundImage: `url(${background})` }}>
      <div className="game-vignette" />
      <GameplayHUD />
      <QuickControls
        flyout={state.flyout}
        speed={state.speed}
        onFlyoutChange={(flyout) => dispatch({ type: 'SET_FLYOUT', flyout })}
        onSpeedChange={(speed) => dispatch({ type: 'SET_SPEED', speed })}
        onPause={() => dispatch({ type: 'SET_PAUSED', paused: true })}
      />

      {space === 'gameplay' && <UtilityToolbar />}
      {!toolOpen && !state.paused && (
        <CommandBar activeCategory={state.activeCategory} onCategoryChange={(category) => dispatch({ type: 'SET_CATEGORY', category })} />
      )}

      {space === 'workspace' && state.workspace === 'building' && (
        <BuildingWorkspace
          onClose={() => dispatch({ type: 'CLOSE_WORKSPACE' })}
          onSelectBuilding={() => dispatch({ type: 'ENTER_BUILDING_PLACEMENT' })}
        />
      )}

      {toolOpen && !state.paused && (
        <>
          <BuildingPlacementOverlay
            terrainMode={state.terrainMode}
            adjustmentMode={state.adjustmentMode}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <BuildingPlacementDock state={state} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {!state.paused && (
        <GameplayOperationHints toolActive={toolOpen} adjustmentMode={state.adjustmentMode} />
      )}

      {state.flyout !== 'none' && !state.paused && (
        <RightEdgeFlyout flyout={state.flyout} onClose={() => dispatch({ type: 'SET_FLYOUT', flyout: 'none' })} />
      )}

      {state.paused && (
        <PauseLayer
          view={state.pauseView}
          onViewChange={(view) => dispatch({ type: 'SET_PAUSE_VIEW', view })}
          onResume={() => dispatch({ type: 'SET_PAUSED', paused: false })}
          onMainMenu={onMainMenu}
        />
      )}
    </section>
  );
}
