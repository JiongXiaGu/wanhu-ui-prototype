import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const source = await readFile('src/app/ui-state.ts', 'utf8');
const compiled = stripTypeScriptTypes(source, { mode: 'strip' });
const { initialGameplayUiState, gameplayUiReducer } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

let checks = 0;
let state = initialGameplayUiState;
assert.equal(state.worldDemolitionMode, false); checks++;

state = gameplayUiReducer(state, { type: 'TOGGLE_WORLD_DEMOLITION_MODE' });
assert.equal(state.worldDemolitionMode, true); checks++;

state = gameplayUiReducer(state, { type: 'TOGGLE_WORLD_DEMOLITION_MODE' });
assert.equal(state.worldDemolitionMode, false); checks++;

state = gameplayUiReducer(state, { type: 'TOGGLE_WORLD_DEMOLITION_MODE' });
state = gameplayUiReducer(state, { type: 'SET_DOCK_CATEGORY', category: 'building' });
assert.equal(state.worldDemolitionMode, false);
assert.equal(state.workspace, 'design'); checks++;

state = gameplayUiReducer(initialGameplayUiState, { type: 'TOGGLE_WORLD_DEMOLITION_MODE' });
state = gameplayUiReducer(state, { type: 'SET_CONTEXT_PANEL', panel: 'camera' });
assert.equal(state.worldDemolitionMode, false); checks++;

state = gameplayUiReducer(initialGameplayUiState, { type: 'TOGGLE_WORLD_DEMOLITION_MODE' });
state = gameplayUiReducer(state, { type: 'SET_PAUSED', paused: true });
assert.equal(state.worldDemolitionMode, false); checks++;

state = gameplayUiReducer(initialGameplayUiState, { type: 'TOGGLE_WORLD_DEMOLITION_MODE' });
state = gameplayUiReducer(state, { type: 'ENTER_TERRAIN_EDIT' });
assert.equal(state.worldDemolitionMode, false);
assert.equal(state.tool, 'terrain-edit'); checks++;

state = gameplayUiReducer(initialGameplayUiState, { type: 'TOGGLE_WORLD_DEMOLITION_MODE' });
state = gameplayUiReducer(state, { type: 'EXIT_WORLD_DEMOLITION_MODE' });
assert.equal(state.worldDemolitionMode, false); checks++;

console.log('World utility / demolition state checks: PASS (' + checks + ' checks).');
