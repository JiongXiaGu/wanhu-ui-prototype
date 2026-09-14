import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './workspace.css';
import './tool-overlay.css';
import './menu-refine.css';
import './backgrounds.css';
import './gameplay-refine.css';
import './operation-hints.css';
import './tools/building-placement/building-placement.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
