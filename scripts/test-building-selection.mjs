import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const src = await readFile('src/app/ui-state.ts', 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(src, { mode: 'strip' })).toString('base64'));
const r = mod.gameplayUiReducer;
let checks = 0;

const selected = r(mod.initialGameplayUiState, { type: 'SELECT_BUILDING', entityId: 'building-riverside-inn' });
assert.deepEqual(selected.selection, { kind: 'building', entityId: 'building-riverside-inn' });
assert.equal(selected.buildingSchemeOpen, false); checks++;

let scheme = r(selected, { type: 'TOGGLE_SELECTED_BUILDING_SCHEME' });
assert.equal(scheme.buildingSchemeOpen, true); checks++;
scheme = r(scheme, { type: 'TOGGLE_SELECTED_BUILDING_SCHEME' });
assert.equal(scheme.buildingSchemeOpen, false); checks++;
scheme = r(selected, { type: 'OPEN_SELECTED_BUILDING_SCHEME' });
assert.equal(scheme.buildingSchemeOpen, true);
scheme = r(scheme, { type: 'CLOSE_SELECTED_BUILDING_SCHEME' });
assert.equal(scheme.buildingSchemeOpen, false); checks++;

const fresh = r(mod.initialGameplayUiState, { type: 'ENTER_BUILDING_PLACEMENT' });
assert.equal(fresh.tool, 'building-placement');
assert.equal(fresh.buildingPlacementIntent, 'new'); checks++;

let moved = r(r(selected, { type: 'OPEN_SELECTED_BUILDING_SCHEME' }), { type: 'ENTER_SELECTED_BUILDING_MOVE' });
assert.equal(moved.tool, 'building-placement');
assert.equal(moved.buildingPlacementIntent, 'move');
assert.equal(moved.buildingSchemeOpen, false);
assert.equal(moved.toolOrigin.kind, 'selection'); checks++;
moved = r(moved, { type: 'EXIT_TOOL' });
assert.deepEqual(moved.selection, selected.selection);
assert.equal(moved.buildingPlacementIntent, 'new'); checks++;

const cleared = r(r(selected, { type: 'OPEN_SELECTED_BUILDING_SCHEME' }), { type: 'CLEAR_SELECTION' });
assert.equal(cleared.selection, null);
assert.equal(cleared.buildingSchemeOpen, false); checks++;

assert.equal(r(selected, { type: 'SET_CONTEXT_PANEL', panel: 'camera' }).selection, null); checks++;
assert.equal(r(selected, { type: 'SET_MANAGEMENT', management: 'city' }).selection, null); checks++;
assert.deepEqual(r(selected, { type: 'SET_PAUSED', paused: true }).selection, selected.selection); checks++;

console.log('Building selection / scheme / placement checks: PASS (' + checks + ' checks).');
