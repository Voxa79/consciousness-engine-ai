// POINT D'ENTRÉE D'URGENCE - ULTRA STABLE
// Expert CTO Next Gen - Mode Emergency
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import EmergencyApp from './App.emergency';

console.log('🚨 EMERGENCY MODE ACTIVATED - CTO Diagnostic Mode');
console.log('📊 React Version:', React.version);
console.log('🔧 Environment:', process.env.NODE_ENV);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Mode d'urgence - Pas de StrictMode pour éviter les doubles renders
root.render(<EmergencyApp />);

// Diagnostic global
(window as any).__emergencyMode = true;
(window as any).__diagnosticInfo = {
  reactVersion: React.version,
  nodeEnv: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
};

console.log('✅ Emergency Mode Ready - Interface accessible');
