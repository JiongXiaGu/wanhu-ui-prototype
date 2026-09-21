import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const src = await readFile('src/app/ui-state.ts', 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(src, { mode: 'strip' })).toString('base64'));
const r = mod.gameplayUiReducer;
let checks = 0;

const selected = r(mod.initialGameplayUiState, { type: 'SELECT_BUILDING', entityId: 'building-riverside-inn' });
assert.deepEqual(selected.selection, { kind: 'building', entityId: 'building-riverside-inn' }); checks++;

const fresh = r(mod.initialGameplayUiState, { type: 'ENTER_BUILDING_PLACEMENT' });
assert.equal(fresh.tool, 'building-placement');
assert.equal(fresh.buildingPlacementIntent, 'new'); checks++;

let moved = r(selected, { type: 'ENTER_SELECTED_BUILDING_MOVE' });
assert.equal(moved.tool, 'building-placement');
assert.equal(moved.buildingPlacementIntent, 'move');
assert.equal(moved.toolOrigin.kind, 'selection'); checks++;
moved = r(moved, { type: 'EXIT_TOOL' });
assert.deepEqual(moved.selection, selected.selection);
assert.equal(moved.buildingPlacementIntent, 'new'); checks++;

let color = r(selected, { type: 'ENTER_COLOR_TOOL' });
assert.equal(color.toolOrigin.kind, 'selection');
color = r(color, { type: 'EXIT_TOOL' });
assert.deepEqual(color.selection, selected.selection); checks++;

assert.equal(r(selected, { type: 'SET_CONTEXT_PANEL', panel: 'camera' }).selection, null); checks++;
assert.equal(r(selected, { type: 'SET_MANAGEMENT', management: 'city' }).selection, null); checks++;
assert.deepEqual(r(selected, { type: 'SET_PAUSED', paused: true }).selection, selected.selection); checks++;
assert.equal(r(selected, { type: 'CLEAR_SELECTION' }).selection, null); checks++;

console.log('Building selection / placement checks: PASS (' + checks + ' checks).');
