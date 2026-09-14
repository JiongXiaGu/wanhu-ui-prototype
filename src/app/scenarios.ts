import type { GameplayUiState, Screen } from './ui-state';
import { initialGameplayUiState } from './ui-state';

export type ReviewScenario =
  | 'menu'
  | 'new-game'
  | 'load'
  | 'settings'
  | 'gameplay'
  | 'workspace-building'
  | 'building-position'
  | 'building-massing'
  | 'building-roof'
  | 'building-height'
  | 'camera'
  | 'weather'
  | 'pause'
  | 'pause-save'
  | 'pause-settings'
  | 'building-camera';

export interface ReviewBootstrap {
  screen: Screen;
  gameplay: GameplayUiState;
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
    case 'gameplay':
      return { screen: 'gameplay', gameplay };
    case 'workspace-building':
      return { screen: 'gameplay', gameplay: { ...gameplay, workspace: 'building', activeCategory: '建筑' } };
    case 'building-position':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', activeCategory: '建筑' } };
    case 'building-massing':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', activeCategory: '建筑', adjustmentMode: 'massing' } };
    case 'building-roof':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', activeCategory: '建筑', adjustmentMode: 'roof' } };
    case 'building-height':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', activeCategory: '建筑', terrainMode: 'manual-elevation' } };
    case 'camera':
      return { screen: 'gameplay', gameplay: { ...gameplay, flyout: 'camera' } };
    case 'weather':
      return { screen: 'gameplay', gameplay: { ...gameplay, flyout: 'weather' } };
    case 'pause':
      return { screen: 'gameplay', gameplay: { ...gameplay, paused: true, pauseView: 'menu' } };
    case 'pause-save':
      return { screen: 'gameplay', gameplay: { ...gameplay, paused: true, pauseView: 'save' } };
    case 'pause-settings':
      return { screen: 'gameplay', gameplay: { ...gameplay, paused: true, pauseView: 'settings' } };
    case 'building-camera':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', activeCategory: '建筑', flyout: 'camera' } };
    case 'menu':
    default:
      return { screen: 'menu', gameplay };
  }
}
