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
  | 'city-wall-construction'
  | 'city-wall-gate-free'
  | 'city-wall-gate-connected'
  | 'city-wall-access-stair'
  | 'city-wall-transition-stair'
  | 'workspace-tree'
  | 'tree-brush'
  | 'tree-single'
  | 'building-position'
  | 'building-massing'
  | 'building-roof'
  | 'building-height'
  | 'road-smart'
  | 'road-curve'
  | 'road-straight'
  | 'terrain-edit'
  | 'terrain-flatten'
  | 'terrain-slope'
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

function designWorkspace(gameplay: GameplayUiState, dockCategory: 'road' | 'bridge' | 'building' | 'city-wall' | 'tree'): ReviewBootstrap {
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
    case 'city-wall-construction':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'city-wall-construction', toolOrigin: { kind: 'design-workspace', category: 'city-wall' }, dockMode: 'design', dockCategory: 'city-wall', cityWallModuleId: 'citywall-gentle-wall', cityWallModuleName: '标准墙段', cityWallSystemId: 'gentle-wall', cityWallSystemName: '小倾斜角', cityWallConstructionMode: 'range', cityWallFacingSide: 'right', cityWallTopLine: true, cityWallNodes: true } };
    case 'city-wall-gate-free':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'city-wall-gate', toolOrigin: { kind: 'design-workspace', category: 'city-wall' }, dockMode: 'design', dockCategory: 'city-wall', cityWallModuleId: 'citywall-gentle-gate', cityWallModuleName: '拱券门洞', cityWallSystemId: 'gentle-wall', cityWallSystemName: '小倾斜角', cityWallGatePlacementMode: 'free', cityWallGateRotation: 0, cityWallGateFacingFlipped: false, cityWallGateConnections: true, cityWallGateClearance: true } };
    case 'city-wall-gate-connected':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'city-wall-gate', toolOrigin: { kind: 'design-workspace', category: 'city-wall' }, dockMode: 'design', dockCategory: 'city-wall', cityWallModuleId: 'citywall-gentle-gate', cityWallModuleName: '拱券门洞', cityWallSystemId: 'gentle-wall', cityWallSystemName: '小倾斜角', cityWallGatePlacementMode: 'wall-connected', cityWallGateRotation: 0, cityWallGateFacingFlipped: false, cityWallGateConnections: true, cityWallGateClearance: true } };
    case 'city-wall-access-stair':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'city-wall-access-stair', toolOrigin: { kind: 'design-workspace', category: 'city-wall' }, dockMode: 'design', dockCategory: 'city-wall', cityWallModuleId: 'citywall-gentle-ground-stair', cityWallModuleName: '直登城梯', cityWallSystemId: 'gentle-wall', cityWallSystemName: '小倾斜角', cityWallAccessStairRotation: 0, cityWallAccessStairReversed: false, cityWallAccessStairClearance: true } };
    case 'city-wall-transition-stair':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'city-wall-transition-stair', toolOrigin: { kind: 'design-workspace', category: 'city-wall' }, dockMode: 'design', dockCategory: 'city-wall', cityWallModuleId: 'citywall-gentle-transition-stair', cityWallModuleName: '马道高差梯', cityWallSystemId: 'gentle-wall', cityWallSystemName: '小倾斜角', cityWallTransitionStairRotation: 0, cityWallTransitionStairReversed: false, cityWallTransitionStairClearance: true } };
    case 'workspace-tree':
      return designWorkspace(gameplay, 'tree');
    case 'tree-brush':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'tree-placement', toolOrigin: { kind: 'design-workspace', category: 'tree' }, dockMode: 'design', dockCategory: 'tree', treeSpeciesId: 'tree-pine', treeSpeciesName: '油松', treePlacementMode: 'brush', treeVariant: 0 } };
    case 'tree-single':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'tree-placement', toolOrigin: { kind: 'design-workspace', category: 'tree' }, dockMode: 'design', dockCategory: 'tree', treeSpeciesId: 'tree-willow', treeSpeciesName: '垂柳', treePlacementMode: 'single', treeVariant: 3 } };
    case 'building-position':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', toolOrigin: { kind: 'design-workspace', category: 'building' }, dockMode: 'design', dockCategory: 'building' } };
    case 'building-massing':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', toolOrigin: { kind: 'design-workspace', category: 'building' }, dockMode: 'design', dockCategory: 'building', adjustmentMode: 'massing' } };
    case 'building-roof':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', toolOrigin: { kind: 'design-workspace', category: 'building' }, dockMode: 'design', dockCategory: 'building', adjustmentMode: 'roof' } };
    case 'building-height':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'building-placement', toolOrigin: { kind: 'design-workspace', category: 'building' }, dockMode: 'design', dockCategory: 'building', buildingTerrainMode: 'manual-elevation' } };
    case 'road-smart':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'road-placement', toolOrigin: { kind: 'design-workspace', category: 'road' }, dockMode: 'design', dockCategory: 'road', roadDrawMode: 'smart-curve' } };
    case 'road-curve':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'road-placement', toolOrigin: { kind: 'design-workspace', category: 'road' }, dockMode: 'design', dockCategory: 'road', roadDrawMode: 'curve' } };
    case 'road-straight':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'road-placement', toolOrigin: { kind: 'design-workspace', category: 'road' }, dockMode: 'design', dockCategory: 'road', roadDrawMode: 'straight' } };
    case 'terrain-edit':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'terrain-edit', toolOrigin: { kind: 'gameplay' }, terrainEditMode: 'raise' } };
    case 'terrain-flatten':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'terrain-edit', toolOrigin: { kind: 'gameplay' }, terrainEditMode: 'flatten' } };
    case 'terrain-slope':
      return { screen: 'gameplay', gameplay: { ...gameplay, tool: 'terrain-edit', toolOrigin: { kind: 'gameplay' }, terrainEditMode: 'slope' } };
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
