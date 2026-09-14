export type Screen = 'menu' | 'newGame' | 'load' | 'settings' | 'gameplay';
export type Flyout = 'none' | 'camera' | 'weather';
export type Workspace = 'none' | 'building';
export type Tool = 'none' | 'building-placement';
export type TerrainMode = 'balanced-earthwork' | 'fill-only' | 'manual-elevation';
export type AdjustmentMode = 'position' | 'massing' | 'roof' | 'facade';
export type GameplaySpace = 'gameplay' | 'workspace' | 'tool' | 'pause';
export type Speed = 1 | 2 | 4;

export interface GameplayUiState {
  workspace: Workspace;
  tool: Tool;
  flyout: Flyout;
  paused: boolean;
  speed: Speed;
  activeCategory: string;
  terrainMode: TerrainMode;
  adjustmentMode: AdjustmentMode;
  gridSnap: boolean;
  gridVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const initialGameplayUiState: GameplayUiState = {
  workspace: 'none',
  tool: 'none',
  flyout: 'none',
  paused: false,
  speed: 1,
  activeCategory: '全部',
  terrainMode: 'balanced-earthwork',
  adjustmentMode: 'position',
  gridSnap: true,
  gridVisible: true,
  canUndo: false,
  canRedo: false,
};

export type GameplayUiAction =
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'CLOSE_WORKSPACE' }
  | { type: 'ENTER_BUILDING_PLACEMENT' }
  | { type: 'EXIT_TOOL' }
  | { type: 'SET_FLYOUT'; flyout: Flyout }
  | { type: 'SET_PAUSED'; paused: boolean }
  | { type: 'SET_SPEED'; speed: Speed }
  | { type: 'SET_TERRAIN_MODE'; mode: TerrainMode }
  | { type: 'SET_ADJUSTMENT_MODE'; mode: AdjustmentMode }
  | { type: 'TOGGLE_GRID_SNAP' }
  | { type: 'TOGGLE_GRID_VISIBLE' }
  | { type: 'MARK_HISTORY_DIRTY' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export function gameplayUiReducer(state: GameplayUiState, action: GameplayUiAction): GameplayUiState {
  switch (action.type) {
    case 'SET_CATEGORY': {
      const building = action.category === '建筑';
      return {
        ...state,
        activeCategory: action.category,
        workspace: building ? (state.workspace === 'building' ? 'none' : 'building') : 'none',
        flyout: 'none',
      };
    }
    case 'CLOSE_WORKSPACE':
      return { ...state, workspace: 'none' };
    case 'ENTER_BUILDING_PLACEMENT':
      return {
        ...state,
        workspace: 'none',
        tool: 'building-placement',
        flyout: 'none',
        terrainMode: 'balanced-earthwork',
        adjustmentMode: 'position',
        canUndo: false,
        canRedo: false,
      };
    case 'EXIT_TOOL':
      return {
        ...state,
        tool: 'none',
        workspace: 'building',
        activeCategory: '建筑',
        flyout: 'none',
        canUndo: false,
        canRedo: false,
      };
    case 'SET_FLYOUT':
      return { ...state, flyout: action.flyout };
    case 'SET_PAUSED':
      return { ...state, paused: action.paused, flyout: action.paused ? 'none' : state.flyout };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_TERRAIN_MODE':
      return { ...state, terrainMode: action.mode, canUndo: true, canRedo: false };
    case 'SET_ADJUSTMENT_MODE':
      return { ...state, adjustmentMode: action.mode, canUndo: true, canRedo: false };
    case 'TOGGLE_GRID_SNAP':
      return { ...state, gridSnap: !state.gridSnap, canUndo: true, canRedo: false };
    case 'TOGGLE_GRID_VISIBLE':
      return { ...state, gridVisible: !state.gridVisible, canUndo: true, canRedo: false };
    case 'MARK_HISTORY_DIRTY':
      return { ...state, canUndo: true, canRedo: false };
    case 'UNDO':
      return state.canUndo ? { ...state, canUndo: false, canRedo: true } : state;
    case 'REDO':
      return state.canRedo ? { ...state, canUndo: true, canRedo: false } : state;
    default:
      return state;
  }
}

export function selectGameplaySpace(state: GameplayUiState): GameplaySpace {
  if (state.paused) return 'pause';
  if (state.tool !== 'none') return 'tool';
  if (state.workspace !== 'none') return 'workspace';
  return 'gameplay';
}
