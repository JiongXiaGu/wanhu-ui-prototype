import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DialogProvider } from './ui/dialog/DialogSystem';
import './styles.css';
import './workspace.css';
import './tool-overlay.css';
import './menu-refine.css';
import './backgrounds.css';
import './gameplay/bottom-command-system.css';
import './gameplay-refine.css';
import './workspace/design-workspace.css';
import './ui/asset-inspector/asset-inspector.css';
import './operation-hints.css';
import './archive/archive-panel.css';
import './archive/archive-info-refine.css';
import './archive/save-game-space.css';
import './gameplay/gameplay-context-panel.css';
import './gameplay/gameplay-corner-hud.css';
import './gameplay/pause-layer.css';
import './settings/settings-panel.css';
import './settings/settings-bindings.css';
import './settings/settings-safe-confirmation.css';
import './fullscreen-actions.css';
import './tools/placement/placement-action-bar.css';
import './tools/building-placement/building-placement.css';
import './tools/road-placement/road-placement.css';
import './gameplay/city-management.css';
import './gameplay/gameplay-top-shell.css';
import './gameplay/operation-hints-refined.css';
import './gameplay/world-utility-toolbar.css';
import './gameplay/gameplay-hud-layout.css';
import './ui/ui-visual-system.css';
import './ui/ui-control-system.css';
import './workspace/workspace-world-first-glass.css';
import './gameplay/weather-mist-glass.css';
import './gameplay/weather-visual-controls.css';
import './gameplay/weather-art-pass.css';
import './ui/wanhu-mist-glass.css';
import './ui/wanhu-hud-glass.css';
import './ui/wanhu-contrast-identity.css';
import './ui/wanhu-edge-elevation.css';
import './ui/wanhu-edge-elevation-study.css';
import './ui/wanhu-character.css';
import './tools/placement/placement-parameter-controls.css';
import './ui/dialog/dialog.css';
import './ui/wanhu-tonal-material.css';
import './ui/wanhu-tonal-texture.css';
import './ui/wanhu-tonal-hud-roles.css';
import './ui/wanhu-workspace-integration.css';
import './fixed-canvas-guards.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DialogProvider>
      <App />
    </DialogProvider>
  </React.StrictMode>,
);
