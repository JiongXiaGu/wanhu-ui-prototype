import { useEffect, useRef, useState } from 'react';
import type { UiIconComponent } from '../ui/icons/runtime-icons.generated';
import {
  ArrowLeftRight, ArrowUpDown, Building2, Copy, DoorOpen, Grid3X3, Layers3, Magnet, Mountain, Move,
  Palette, Redo2, RotateCcw, RotateCw, Route, Ruler, ScanLine, ShieldCheck, Trash2, Undo2,
} from '../ui/icons/runtime-icons.generated';
import type { CityWallConstructionMode, CityWallGatePlacementMode, Tool, TreePlacementMode, WorldSelection } from '../app/ui-state';

export type UtilityContext = 'world' | 'building-selection' | 'building-placement' | 'road-placement' | 'terrain-edit' | 'tree-placement' | 'city-wall-construction' | 'city-wall-gate-free' | 'city-wall-gate-connected' | 'city-wall-access-stair' | 'city-wall-transition-stair' | 'color-tool';
type UtilityKind = 'toggle' | 'action' | 'history';
type UtilityLayout = 'single' | 'world-stacked' | 'placement-stacked';
type UtilityRowRole = 'entry' | 'action' | 'support' | 'single';
export type UtilityItemId =
  | 'selection-focus-building' | 'selection-remove-building' | 'world-bulk-demolish'
  | 'unlock' | 'region' | 'terrain' | 'palette' | 'grid-snap' | 'grid-visible' | 'copy' | 'move' | 'undo' | 'redo'
  | 'building-rotate-left' | 'building-rotate-right' | 'building-mirror' | 'building-align-road' | 'building-calibrate-footprint'
  | 'road-reverse-direction' | 'road-straighten-segment' | 'road-connect-node'
  | 'terrain-contours' | 'terrain-slope-view' | 'terrain-protect-built'
  | 'tree-move-selection' | 'tree-rotate-selection-left' | 'tree-rotate-selection-right' | 'tree-delete-selection' | 'tree-avoid-buildings' | 'tree-avoid-roads'
  | 'city-wall-flip-facing' | 'city-wall-top-line' | 'city-wall-nodes'
  | 'city-wall-gate-rotate-left' | 'city-wall-gate-rotate-right' | 'city-wall-gate-flip-facing' | 'city-wall-gate-connections' | 'city-wall-gate-clearance'
  | 'city-wall-access-stair-rotate-left' | 'city-wall-access-stair-rotate-right' | 'city-wall-access-stair-flip-direction' | 'city-wall-access-stair-clearance'
  | 'city-wall-transition-stair-rotate-left' | 'city-wall-transition-stair-rotate-right' | 'city-wall-transition-stair-flip-direction' | 'city-wall-transition-stair-clearance';
interface UtilityItem { id: UtilityItemId; label: string; icon: UiIconComponent; kind: UtilityKind; danger?: boolean }
interface UtilityRowDefinition { id: string; role: UtilityRowRole; groups: readonly (readonly UtilityItem[])[] }
interface UtilityDefinition { layout: UtilityLayout; rows: readonly UtilityRowDefinition[] }
interface ContextUtilityToolbarProps {
  tool: Tool; selection: WorldSelection; stackWorldTools: boolean; worldDemolitionMode: boolean; gridSnap: boolean; gridVisible: boolean; canUndo: boolean; canRedo: boolean;
  terrainContours: boolean; terrainSlopeView: boolean; terrainProtectBuilt: boolean;
  treePlacementMode: TreePlacementMode; treeSingleSelected: boolean; treeAvoidBuildings: boolean; treeAvoidRoads: boolean;
  cityWallConstructionMode: CityWallConstructionMode; cityWallTopLine: boolean; cityWallNodes: boolean; cityWallGatePlacementMode: CityWallGatePlacementMode;
  cityWallGateConnections: boolean; cityWallGateClearance: boolean; cityWallAccessStairClearance: boolean; cityWallTransitionStairClearance: boolean;
  onToggleGridSnap: () => void; onToggleGridVisible: () => void; onToggleWorldDemolitionMode: () => void; onUndo: () => void; onRedo: () => void;
  onToggleTerrainContours: () => void; onToggleTerrainSlopeView: () => void; onToggleTerrainProtection: () => void;
  onToggleTreeAvoidBuildings: () => void; onToggleTreeAvoidRoads: () => void; onToggleCityWallTopLine: () => void; onToggleCityWallNodes: () => void;
  onToggleCityWallGateConnections: () => void; onToggleCityWallGateClearance: () => void; onToggleCityWallAccessStairClearance: () => void; onToggleCityWallTransitionStairClearance: () => void;
  onToolAction: (id: UtilityItemId) => void;
}
const historyGroup: readonly UtilityItem[] = [
  { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
  { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
];
const gridGroup: readonly UtilityItem[] = [
  { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
  { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
];
const DEFINITIONS: Record<UtilityContext, UtilityDefinition> = {
  world: { layout: 'world-stacked', rows: [
    { id: 'world-entry', role: 'entry', groups: [[
      { id: 'unlock', label: '地图解锁', icon: DoorOpen, kind: 'action' }, { id: 'region', label: '编辑区域', icon: ScanLine, kind: 'action' },
      { id: 'terrain', label: '地形编辑', icon: Mountain, kind: 'action' }, { id: 'palette', label: '配色工具', icon: Palette, kind: 'action' },
    ]]},
    { id: 'world-support', role: 'support', groups: [[
      { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' }, { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
      { id: 'copy', label: '范围复制', icon: Copy, kind: 'action' }, { id: 'move', label: '范围移动', icon: Move, kind: 'action' },
    ], historyGroup, [{ id: 'world-bulk-demolish', label: '批量摧毁建筑', icon: Trash2, kind: 'toggle', danger: true }]]},
  ]},
  'building-selection': { layout: 'single', rows: [{ id: 'building-selection', role: 'single', groups: [
    [{ id: 'selection-focus-building', label: '聚焦所选建筑', icon: ScanLine, kind: 'action' }], historyGroup,
    [{ id: 'selection-remove-building', label: '移除建筑', icon: Trash2, kind: 'action', danger: true }],
  ]}]},
  'building-placement': { layout: 'placement-stacked', rows: [
    { id: 'building-actions', role: 'action', groups: [[
      { id: 'building-rotate-left', label: '逆时针旋转', icon: RotateCcw, kind: 'action' }, { id: 'building-rotate-right', label: '顺时针旋转', icon: RotateCw, kind: 'action' },
      { id: 'building-mirror', label: '镜像建筑', icon: ArrowLeftRight, kind: 'action' },
    ]]},
    { id: 'building-support', role: 'support', groups: [
      gridGroup,
      [
        { id: 'building-align-road', label: '对齐最近道路', icon: Route, kind: 'action' },
        { id: 'building-calibrate-footprint', label: '校准建筑基底', icon: Building2, kind: 'action' },
      ],
      historyGroup,
    ] },
  ]},
  'road-placement': { layout: 'placement-stacked', rows: [
    { id: 'road-actions', role: 'action', groups: [[{ id: 'road-reverse-direction', label: '反转道路方向', icon: ArrowLeftRight, kind: 'action' }], [
      { id: 'road-straighten-segment', label: '拉直当前道路段', icon: Ruler, kind: 'action' }, { id: 'road-connect-node', label: '连接最近道路节点', icon: Route, kind: 'action' },
    ]]},
    { id: 'road-support', role: 'support', groups: [gridGroup, historyGroup] },
  ]},
  'terrain-edit': { layout: 'single', rows: [{ id: 'terrain-edit', role: 'single', groups: [[
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' }, { id: 'terrain-contours', label: '等高线', icon: Layers3, kind: 'toggle' },
    { id: 'terrain-slope-view', label: '坡度视图', icon: Mountain, kind: 'toggle' }, { id: 'terrain-protect-built', label: '保护已建区域', icon: ShieldCheck, kind: 'toggle' },
  ], historyGroup] }]},
  'tree-placement': { layout: 'placement-stacked', rows: [
    { id: 'tree-actions', role: 'action', groups: [[
      { id: 'tree-move-selection', label: '移动选中树木', icon: Move, kind: 'action' }, { id: 'tree-rotate-selection-left', label: '逆时针旋转', icon: RotateCcw, kind: 'action' },
      { id: 'tree-rotate-selection-right', label: '顺时针旋转', icon: RotateCw, kind: 'action' },
    ]]},
    { id: 'tree-support', role: 'support', groups: [[
      { id: 'tree-avoid-buildings', label: '避让建筑', icon: Building2, kind: 'toggle' }, { id: 'tree-avoid-roads', label: '避让道路', icon: Route, kind: 'toggle' },
    ], historyGroup, [{ id: 'tree-delete-selection', label: '删除选中树木', icon: Trash2, kind: 'action', danger: true }]]},
  ]},
  'city-wall-construction': { layout: 'placement-stacked', rows: [
    { id: 'city-wall-actions', role: 'action', groups: [[{ id: 'city-wall-flip-facing', label: '交换正反面', icon: ArrowLeftRight, kind: 'action' }]] },
    { id: 'city-wall-support', role: 'support', groups: [gridGroup, [
      { id: 'city-wall-top-line', label: '墙顶线', icon: Layers3, kind: 'toggle' }, { id: 'city-wall-nodes', label: '节点显示', icon: ScanLine, kind: 'toggle' },
    ], historyGroup] },
  ]},
  'city-wall-gate-free': { layout: 'placement-stacked', rows: [
    { id: 'gate-actions', role: 'action', groups: [[
      { id: 'city-wall-gate-rotate-left', label: '城门左转', icon: RotateCcw, kind: 'action' }, { id: 'city-wall-gate-rotate-right', label: '城门右转', icon: RotateCw, kind: 'action' },
      { id: 'city-wall-gate-flip-facing', label: '交换正反面', icon: ArrowLeftRight, kind: 'action' },
    ]]},
    { id: 'gate-support', role: 'support', groups: [[
      { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' }, { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
      { id: 'city-wall-gate-clearance', label: '门洞净空', icon: Ruler, kind: 'toggle' },
    ], historyGroup] },
  ]},
  'city-wall-gate-connected': { layout: 'placement-stacked', rows: [
    { id: 'gate-connected-actions', role: 'action', groups: [[{ id: 'city-wall-gate-flip-facing', label: '交换正反面', icon: ArrowLeftRight, kind: 'action' }]] },
    { id: 'gate-connected-support', role: 'support', groups: [[
      { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' }, { id: 'city-wall-gate-connections', label: '墙体连接点', icon: ScanLine, kind: 'toggle' },
      { id: 'city-wall-gate-clearance', label: '门洞净空', icon: Ruler, kind: 'toggle' },
    ], historyGroup] },
  ]},
  'city-wall-access-stair': { layout: 'placement-stacked', rows: [
    { id: 'access-actions', role: 'action', groups: [[
      { id: 'city-wall-access-stair-rotate-left', label: '登城梯左转', icon: RotateCcw, kind: 'action' }, { id: 'city-wall-access-stair-rotate-right', label: '登城梯右转', icon: RotateCw, kind: 'action' },
      { id: 'city-wall-access-stair-flip-direction', label: '交换上下端', icon: ArrowUpDown, kind: 'action' },
    ]]},
    { id: 'access-support', role: 'support', groups: [[
      { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' }, { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
      { id: 'city-wall-access-stair-clearance', label: '楼梯净空', icon: Ruler, kind: 'toggle' },
    ], historyGroup] },
  ]},
  'city-wall-transition-stair': { layout: 'placement-stacked', rows: [
    { id: 'transition-actions', role: 'action', groups: [[
      { id: 'city-wall-transition-stair-rotate-left', label: '高差楼梯左转', icon: RotateCcw, kind: 'action' }, { id: 'city-wall-transition-stair-rotate-right', label: '高差楼梯右转', icon: RotateCw, kind: 'action' },
      { id: 'city-wall-transition-stair-flip-direction', label: '交换上下端', icon: ArrowUpDown, kind: 'action' },
    ]]},
    { id: 'transition-support', role: 'support', groups: [[
      { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' }, { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
      { id: 'city-wall-transition-stair-clearance', label: '楼梯净空', icon: Ruler, kind: 'toggle' },
    ], historyGroup] },
  ]},
  'color-tool': { layout: 'single', rows: [{ id: 'color-tool', role: 'single', groups: [historyGroup] }] },
};
function contextForState(tool: Tool, gateMode: CityWallGatePlacementMode, selection: WorldSelection): UtilityContext {
  if (tool === 'building-placement') return 'building-placement';
  if (tool === 'road-placement') return 'road-placement';
  if (tool === 'terrain-edit') return 'terrain-edit';
  if (tool === 'tree-placement') return 'tree-placement';
  if (tool === 'city-wall-construction') return 'city-wall-construction';
  if (tool === 'city-wall-gate') return gateMode === 'wall-connected' ? 'city-wall-gate-connected' : 'city-wall-gate-free';
  if (tool === 'city-wall-access-stair') return 'city-wall-access-stair';
  if (tool === 'city-wall-transition-stair') return 'city-wall-transition-stair';
  if (tool === 'color-tool') return 'color-tool';
  if (selection?.kind === 'building') return 'building-selection';
  return 'world';
}
function ariaLabelForContext(context: UtilityContext) {
  if (context === 'building-selection') return '选中建筑快捷工具';
  if (context === 'building-placement') return '建筑放置辅助工具';
  if (context === 'road-placement') return '道路铺设辅助工具';
  if (context === 'terrain-edit') return '地形编辑辅助工具';
  if (context === 'tree-placement') return '树木放置辅助工具';
  if (context === 'city-wall-construction') return '城墙主体营造辅助工具';
  if (context === 'city-wall-gate-free') return '城墙门洞自由放置辅助工具';
  if (context === 'city-wall-gate-connected') return '城墙门洞连接辅助工具';
  if (context === 'city-wall-access-stair') return '登城梯放置辅助工具';
  if (context === 'city-wall-transition-stair') return '高差楼梯放置辅助工具';
  if (context === 'color-tool') return '配色工具辅助操作';
  return '世界工具';
}
export function ContextUtilityToolbar({
  tool, selection, stackWorldTools, worldDemolitionMode, gridSnap, gridVisible, canUndo, canRedo,
  terrainContours, terrainSlopeView, terrainProtectBuilt, treePlacementMode, treeSingleSelected, treeAvoidBuildings, treeAvoidRoads,
  cityWallConstructionMode, cityWallTopLine, cityWallNodes, cityWallGatePlacementMode, cityWallGateConnections, cityWallGateClearance,
  cityWallAccessStairClearance, cityWallTransitionStairClearance, onToggleGridSnap, onToggleGridVisible, onToggleWorldDemolitionMode,
  onUndo, onRedo, onToggleTerrainContours, onToggleTerrainSlopeView, onToggleTerrainProtection, onToggleTreeAvoidBuildings, onToggleTreeAvoidRoads,
  onToggleCityWallTopLine, onToggleCityWallNodes, onToggleCityWallGateConnections, onToggleCityWallGateClearance,
  onToggleCityWallAccessStairClearance, onToggleCityWallTransitionStairClearance, onToolAction,
}: ContextUtilityToolbarProps) {
  const requestedContext = contextForState(tool, cityWallGatePlacementMode, selection);
  const [displayedContext, setDisplayedContext] = useState<UtilityContext>(requestedContext);
  const [phase, setPhase] = useState<'steady' | 'exiting' | 'entering'>('steady');
  const swapTimer = useRef<number | null>(null);
  const enterTimer = useRef<number | null>(null);
  useEffect(() => {
    if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    if (enterTimer.current !== null) window.clearTimeout(enterTimer.current);
    if (requestedContext === displayedContext) { setPhase('steady'); return; }
    setPhase('exiting');
    swapTimer.current = window.setTimeout(() => {
      setDisplayedContext(requestedContext);
      setPhase('entering');
      enterTimer.current = window.setTimeout(() => setPhase('steady'), 24);
    }, 100);
    return () => {
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
      if (enterTimer.current !== null) window.clearTimeout(enterTimer.current);
    };
  }, [requestedContext]);
  function getState(item: UtilityItem) {
    if (item.id === 'grid-snap') return { active: gridSnap, pressed: gridSnap, onClick: onToggleGridSnap };
    if (item.id === 'grid-visible') return { active: gridVisible, pressed: gridVisible, onClick: onToggleGridVisible };
    if (item.id === 'world-bulk-demolish') return { active: worldDemolitionMode, pressed: worldDemolitionMode, onClick: onToggleWorldDemolitionMode };
    if (item.id === 'undo') return { disabled: !canUndo, onClick: onUndo };
    if (item.id === 'redo') return { disabled: !canRedo, onClick: onRedo };
    if (item.id === 'terrain-contours') return { active: terrainContours, pressed: terrainContours, onClick: onToggleTerrainContours };
    if (item.id === 'terrain-slope-view') return { active: terrainSlopeView, pressed: terrainSlopeView, onClick: onToggleTerrainSlopeView };
    if (item.id === 'terrain-protect-built') return { active: terrainProtectBuilt, pressed: terrainProtectBuilt, onClick: onToggleTerrainProtection };
    if (item.id === 'tree-avoid-buildings') return { active: treeAvoidBuildings, pressed: treeAvoidBuildings, onClick: onToggleTreeAvoidBuildings };
    if (item.id === 'tree-avoid-roads') return { active: treeAvoidRoads, pressed: treeAvoidRoads, onClick: onToggleTreeAvoidRoads };
    if (item.id === 'city-wall-top-line') return { active: cityWallTopLine, pressed: cityWallTopLine, onClick: onToggleCityWallTopLine };
    if (item.id === 'city-wall-nodes') return { active: cityWallNodes, pressed: cityWallNodes, onClick: onToggleCityWallNodes };
    if (item.id === 'city-wall-gate-connections') return { active: cityWallGateConnections, pressed: cityWallGateConnections, onClick: onToggleCityWallGateConnections };
    if (item.id === 'city-wall-gate-clearance') return { active: cityWallGateClearance, pressed: cityWallGateClearance, onClick: onToggleCityWallGateClearance };
    if (item.id === 'city-wall-access-stair-clearance') return { active: cityWallAccessStairClearance, pressed: cityWallAccessStairClearance, onClick: onToggleCityWallAccessStairClearance };
    if (item.id === 'city-wall-transition-stair-clearance') return { active: cityWallTransitionStairClearance, pressed: cityWallTransitionStairClearance, onClick: onToggleCityWallTransitionStairClearance };
    if (item.kind === 'action') return { onClick: () => onToolAction(item.id) };
    return {};
  }
  function itemVisible(item: UtilityItem) {
    if (item.id === 'city-wall-flip-facing') return cityWallConstructionMode === 'fixed-width';
    if (item.id === 'tree-move-selection' || item.id === 'tree-rotate-selection-left' || item.id === 'tree-rotate-selection-right' || item.id === 'tree-delete-selection') {
      return treePlacementMode === 'single' && treeSingleSelected;
    }
    return true;
  }
  const definition = DEFINITIONS[displayedContext];
  const stackedWorld = definition.layout === 'world-stacked' && stackWorldTools;
  const stackedPlacement = definition.layout === 'placement-stacked';
  const rows = definition.layout === 'world-stacked' && !stackWorldTools
    ? [{ id: 'world-flat', role: 'single' as const, groups: definition.rows.flatMap((row) => row.groups) }]
    : definition.rows;
  return (
    <div
      className={`context-utility-toolbar command-utility bottom-command-surface bottom-command-surface--sm is-${phase} ${stackedWorld ? 'is-world-stacked' : ''} ${stackedPlacement ? 'is-placement-stacked' : ''}`}
      data-utility-context={displayedContext}
      data-utility-layout={stackedPlacement ? 'placement-stacked' : stackedWorld ? 'world-stacked' : 'single'}
      aria-label={ariaLabelForContext(displayedContext)}
      aria-busy={phase !== 'steady'}
    >
      {rows.map((row, rowIndex) => {
        const visibleGroups = row.groups.map((group) => group.filter(itemVisible)).filter((group) => group.length > 0);
        const visibleItemCount = visibleGroups.reduce((count, group) => count + group.length, 0);
        return (
          <div
            className="context-utility-toolbar__row"
            data-utility-row={rowIndex + 1}
            data-utility-row-role={row.role}
            data-utility-item-count={visibleItemCount}
            key={row.id}
          >
            {visibleGroups.map((group, groupIndex) => (
              <span className="context-utility-toolbar__group" key={group[0].id}>
                {groupIndex > 0 && <i className="context-utility-toolbar__separator" aria-hidden="true" />}
                {group.map((item) => {
                  const Icon = item.icon;
                  const state = getState(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`context-utility-toolbar__button ${state.active ? 'is-active' : ''} ${item.danger ? 'is-danger' : ''}`}
                      data-utility-kind={item.kind}
                      data-utility-danger={item.danger ? 'true' : undefined}
                      data-tooltip={item.label}
                      aria-label={item.label}
                      aria-pressed={item.kind === 'toggle' ? state.pressed : undefined}
                      disabled={state.disabled || phase !== 'steady'}
                      onClick={state.onClick}
                    ><Icon /></button>
                  );
                })}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
