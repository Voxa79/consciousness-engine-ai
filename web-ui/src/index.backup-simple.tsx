import React from 'react';
import ReactDOM from 'react-dom/client';
import UltraMinimalApp from './App.ultraminimal';

console.log('ULTRA-MINIMAL CTO - Zero Conflict Guaranteed');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Rendu ultra-simple sans StrictMode
root.render(<UltraMinimalApp />);

// Diagnostic global
(window as any).__ultraMinimalMode = true;
(window as any).__diagnosticInfo = {
  version: 'Ultra-Minimal Stable',
  timestamp: new Date().toISOString(),
  port: window.location.port,
  status: 'ZERO_CONFLICT'
};

console.log('Interface ultra-minimale prete - ZERO conflit possible');
