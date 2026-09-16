import type { GameplayUiState, Screen } from './ui-state';
import { initialGameplayUiState } from './ui-state';

export type ReviewScenario =
  | 'menu'
  | 'new-game'
  | 'load'
  | 'settings'
  | 'loading'
  | 'gameplay'
  | 'management-finance'
  | 'management-policy'
  | 'map-land-value'
  | 'workspace-road'
  | 'workspace-bridge'
  | 'workspace-building'
  | 'workspace-city-wall'
  | 'building-position'
  | 'building-massing'
  | 'building-roof'
  | 'building-height'
  | 'road-smart'
  | 'road-curve'
  | 'road-straight'
  | 'camera'
  | 'weather'
  | 'pause'
  | 'pause-save'
  | 'pause-settings';

export interface ReviewBootstrap {
  screen: Screen;
  gameplay: GameplayUiState;
  loadingProgress?: number;
}

function designWorkspace(gameplay: GameplayUiState, dockCategory: 'road' | 'bridge' | 'building' | 'city-wall'): ReviewBootstrap {
  return {
    screen: 'gameplay',
    gameplay: { ...gameplay, workspace: 'design', dockMode: 'design', dockCategory },
  };
}

export function resolveReviewBootstrap(search: string): ReviewBootstrap {
  const review = new URLSearchParams(search).get('review') as ReviewScenario | null;
  const gameplay = { ...initialGameplayUiState };

  switch (review) {
    case 'new-game':
      return { screen: 'newGame', gameplay };
    case 'load':
      return { screen: 'load', gameplay };
    case 'settings':
      return { screen: 'settings', gameplay };
    case 'loading':
      return { screen: 'loading', gameplay, loadingProgress: 62 };
    case 'gameplay':
      return { screen: 'gameplay', gameplay };
    case 'management-finance':
      return { screen: 'gameplay', gameplay: { ...gameplay, management: 'finance' } };
    case 'management-policy':
      return { screen: 'gameplay', gameplay: { ...gameplay, management: 'policy' } };
    case 'map-land-value':
      return { screen: 'gameplay', gameplay: { ...gameplay, mapView: 'land-value' } };
    case 'workspace-road':
      return designWorkspace(gameplay, 'road');
    case 'workspace-bridge':
      return designWorkspace(gameplay, 'bridge');
    case 'workspace-building':
      return designWorkspace(gameplay, 'building');
    case 'workspace-city-wall':
      return designWorkspace(gameplay, 'city-wall');
    case 'building-position':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', dockMode: 'design', dockCategory: 'building' } };
    case 'building-massing':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', dockMode: 'design', dockCategory: 'building', adjustmentMode: 'massing' } };
    case 'building-roof':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', dockMode: 'design', dockCategory: 'building', adjustmentMode: 'roof' } };
    case 'building-height':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', dockMode: 'design', dockCategory: 'building', terrainMode: 'manual-elevation' } };
    case 'road-smart':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'road-placement', dockMode: 'design', dockCategory: 'road', roadDrawMode: 'smart-curve' } };
    case 'road-curve':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'road-placement', dockMode: 'design', dockCategory: 'road', roadDrawMode: 'curve' } };
    case 'road-straight':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'road-placement', dockMode: 'design', dockCategory: 'road', roadDrawMode: 'straight' } };
    case 'camera':
      return { screen: 'gameplay', gameplay: { ...gameplay, contextPanel: 'camera' } };
    case 'weather':
      return { screen: 'gameplay', gameplay: { ...gameplay, contextPanel: 'weather' } };
    case 'pause':
      return { screen: 'gameplay', gameplay: { ...gameplay, paused: true, pauseView: 'menu' } };
    case 'pause-save':
      return { screen: 'gameplay', gameplay: { ...gameplay, paused: true, pauseView: 'save' } };
    case 'pause-settings':
      return { screen: 'gameplay', gameplay: { ...gameplay, paused: true, pauseView: 'settings' } };
    case 'menu':
    default:
      return { screen: 'menu', gameplay };
  }
}
