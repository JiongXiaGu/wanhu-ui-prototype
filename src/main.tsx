import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DialogProvider } from './ui/dialog/DialogSystem';
import './styles.css';
import './workspace.css';
import './tool-overlay.css';
import './menu-refine.css';
import './backgrounds.css';
import './gameplay-refine.css';
import './operation-hints.css';
import './archive/archive-panel.css';
import './archive/archive-info-refine.css';
import './archive/save-game-space.css';
import './gameplay/right-edge-flyout.css';
import './gameplay/pause-layer.css';
import './settings/settings-panel.css';
import './settings/settings-bindings.css';
import './settings/settings-safe-confirmation.css';
import './fullscreen-actions.css';
import './tools/building-placement/building-placement.css';
import './ui/dialog/dialog.css';
import './fixed-canvas-guards.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DialogProvider>
      <App />
    </DialogProvider>
  </React.StrictMode>,
);
