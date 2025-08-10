import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface ConsciousnessState {
  awarenessLevel: number;
  emotionalState: {
    primaryEmotion: string;
    intensity: number;
    valence: number;
    arousal: number;
  };
  cognitiveLoad: number;
  metaCognitiveDepth: number;
  confidenceScore: number;
  isProcessing: boolean;
  lastUpdate: Date;
}

export interface ConsciousnessResponse {
  id: string;
  content: string;
  confidence: number;
  consciousnessLevel: number;
  emotionalState: {
    primaryEmotion: string;
    intensity: number;
    valence: number;
    arousal: number;
  };
  ethicalScore: number;
  creativityScore: number;
  empathyScore: number;
  processingTimeMs: number;
  reasoningSummary: string;
  qualityScore: number;
  timestamp: Date;
}

export interface ConsciousnessContextType {
  state: ConsciousnessState;
  processConsciousThought: (input: string) => Promise<ConsciousnessResponse>;
  getConsciousnessState: () => Promise<ConsciousnessState>;
  generateReflection: () => Promise<any>;
  getGrowthOpportunities: () => Promise<any>;
  currentState: ConsciousnessState;
  isProcessing: boolean;
}

const ConsciousnessContext = createContext<ConsciousnessContextType | undefined>(undefined);

interface ConsciousnessProviderProps {
  children: ReactNode;
}

// Base API: utilise REACT_APP_API_BASE si défini, sinon chemin relatif pour éviter les problèmes de CSP en dev
const API_BASE_URL = process.env.REACT_APP_API_BASE
  ? `${process.env.REACT_APP_API_BASE}/api/v1`
  : '/api/v1';

export const ConsciousnessProvider: React.FC<ConsciousnessProviderProps> = ({ children }) => {
  const [state, setState] = useState<ConsciousnessState>({
    awarenessLevel: 0,
    cognitiveLoad: 0,
    confidenceScore: 0,
    metaCognitiveDepth: 0,
    emotionalState: {
      primaryEmotion: 'calm',
      intensity: 0,
      valence: 0,
      arousal: 0,
    },
    isProcessing: false,
    lastUpdate: new Date(),
  });

  const processConsciousThought = async (input: string): Promise<ConsciousnessResponse> => {
    // Purge réseau: stub local sans requête
    setState(prev => ({ ...prev, isProcessing: true }));
    await new Promise(r => setTimeout(r, 100));
    const stub: ConsciousnessResponse = {
      id: Math.random().toString(36).substr(2, 9),
      content: `Stub response: "${input}"`,
      confidence: 0.8,
      consciousnessLevel: 0.5,
      emotionalState: {
        primaryEmotion: 'calm',
        intensity: 0.2,
        valence: 0.1,
        arousal: 0.2,
      },
      ethicalScore: 0.8,
      creativityScore: 0.5,
      empathyScore: 0.6,
      processingTimeMs: 50,
      reasoningSummary: 'Local stub (no network)',
      qualityScore: 0.7,
      timestamp: new Date(),
    };
    setState(prev => ({
      ...prev,
      awarenessLevel: stub.consciousnessLevel,
      cognitiveLoad: 0.1,
      confidenceScore: stub.confidence,
      metaCognitiveDepth: 2,
      emotionalState: stub.emotionalState,
      isProcessing: false,
      lastUpdate: new Date(),
    }));
    return stub;
  };

  const getConsciousnessState = async (): Promise<ConsciousnessState> => {
    // Purge réseau: renvoyer l’état courant sans fetch
    return state;
  };

  const generateReflection = async () => {
    // Stub local
    return {
      summary: 'Local reflection stub',
      insights: [],
      timestamp: new Date().toISOString(),
    };
  };

  const getGrowthOpportunities = async () => {
    // Stub local
    return {
      opportunities: [],
      generatedAt: new Date().toISOString(),
    };
  };

  // Initialisation différée en dev pour éviter des 404 au boot et tout effet rebond
  // Déclencher explicitement via UI si nécessaire
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Utiliser une fonction inline pour éviter les dépendances changeantes
      const initState = async () => {
        // Stub local - pas d'appel réseau
        return state;
      };
      initState();
    }
  }, []); // Dépendances vides pour éviter les boucles

  const value: ConsciousnessContextType = {
    state,
    processConsciousThought,
    getConsciousnessState,
    generateReflection,
    getGrowthOpportunities,
    currentState: state,
    isProcessing: state.isProcessing,
  };

  return (
    <ConsciousnessContext.Provider value={value}>
      {children}
    </ConsciousnessContext.Provider>
  );
};

export const useConsciousness = (): ConsciousnessContextType => {
  const context = useContext(ConsciousnessContext);
  if (context === undefined) {
    throw new Error('useConsciousness must be used within a ConsciousnessProvider');
  }
  return context;
};