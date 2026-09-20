import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DialogProvider } from './ui/dialog/DialogSystem';
import './styles.css';
import './workspace.css';
import './workspace/workspace-catalog.css';
import './menu-refine.css';
import './backgrounds.css';
import './gameplay/bottom-command-system.css';
import './gameplay-refine.css';
import './workspace/design-workspace.css';
import './ui/asset-inspector/asset-inspector.css';
import './operation-hints.css';
import './archive/archive-panel.css';
import './archive/save-game-space.css';
import './gameplay/gameplay-context-panel.css';
import './gameplay/gameplay-corner-hud.css';
import './gameplay/pause-layer.css';
import './settings/settings-panel.css';
import './settings/settings-bindings.css';
import './fullscreen-actions.css';
import './tools/placement/placement-action-bar.css';
import './tools/placement/placement-context-panel.css';
import './tools/building-placement/building-placement.css';
import './tools/road-placement/road-placement.css';
import './tools/terrain-edit/terrain-edit.css';
import './tools/tree-placement/tree-placement.css';
import './tools/city-wall-construction/city-wall-construction.css';
import './tools/city-wall-gate/city-wall-gate.css';
import './tools/city-wall-access-stair/city-wall-access-stair.css';
import './tools/city-wall-transition-stair/city-wall-transition-stair.css';
import './tools/material-palette/modes/surface/surface-mode.css';
import './tools/material-palette/modes/surface/material-scheme-workspace.css';
import './tools/material-palette/modes/lighting/lighting-mode.css';
import './tools/material-palette/modes/scheme/scheme-mode.css';
import './tools/material-palette/modes/scheme/building-scheme-workspace.css';
import './gameplay/city-management.css';
import './gameplay/inventory-management.css';
import './gameplay/gameplay-top-shell.css';
import './gameplay/operation-hints-refined.css';
import './gameplay/context-utility-toolbar.css';
import './gameplay/gameplay-hud-layout.css';

/* Canonical theme contract. Component CSS owns geometry/local hierarchy; material
   recipes are applied later by wanhu-surface-system.css. */
import './ui/wanhu-theme-tokens.css';
import './ui/ui-visual-system.css';
import './ui/ui-control-system.css';
import './ui/ui-motion-system.css';
import './workspace/workspace-world-first-glass.css';
import './gameplay/weather-mist-glass.css';
import './gameplay/management-panel-skin.css';
import './gameplay/weather-visual-controls.css';
import './gameplay/weather-art-pass.css';
import './ui/wanhu-edge-elevation.css';
import './ui/wanhu-character.css';
import './tools/placement/placement-parameter-controls.css';
import './ui/dialog/dialog.css';

/* Formal material owner for Workspace, Context Panels and persistent Gameplay HUD. */
import './ui/wanhu-surface-system.css';
import './ui/wanhu-icon-led-header.css';
import './ui/wanhu-top-resource-shortcuts.css';
import './fixed-canvas-guards.css';

async function loadReviewOnlyStyles() {
  const study = new URLSearchParams(window.location.search).get('study');
  if (study === 'glass') await import('./review/styles/glass-study.css');
  if (study === 'edge') await import('./review/styles/edge-elevation-study.css');
}

async function bootstrap() {
  await loadReviewOnlyStyles();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <DialogProvider>
        <App />
      </DialogProvider>
    </React.StrictMode>,
  );
}

void bootstrap();
