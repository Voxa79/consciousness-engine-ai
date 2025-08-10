import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductionApp from './App.production';

console.log('PRODUCTION UI - Consciousness Engine Interface');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

try {
  root.render(<ProductionApp />);
  console.log('Interface production initialisee avec succes');
} catch (error) {
  console.error('Erreur lors de l initialisation:', error);
  
  root.render(
    <div style={{
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1>Consciousness Engine</h1>
      <p>Interface en cours de chargement...</p>
      <p style={{color: '#FF6B35'}}>Erreur: {error?.toString()}</p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#00E5FF',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Recharger
      </button>
    </div>
  );
}

(window as any).__productionMode = true;
(window as any).__apiUrl = 'http://localhost:3000/api/v1';
