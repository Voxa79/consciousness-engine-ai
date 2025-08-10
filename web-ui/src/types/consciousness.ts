// Types for Consciousness Engine

export interface ConsciousnessMessage {
  id: string;
  content: string;
  sender: 'user' | 'consciousness';
  timestamp: Date;
  consciousnessState?: ConsciousnessState;
  processingMetrics?: ProcessingMetrics;
}

export interface ConsciousnessState {
  awarenessLevel: number;
  emotionalState: string;
  cognitiveLoad: number;
  metaCognitiveDepth: number;
  confidenceScore: number;
}

export interface ProcessingMetrics {
  processingTimeMs: number;
  ethicalScore: number;
  creativityScore: number;
  empathyScore: number;
  quantumCoherence?: number;
  neuromorphicEfficiency?: number;
}

export interface ConsciousnessOptions {
  qualityThreshold: number;
  ethicalStrictness: number;
  enableQuantum: boolean;
  enableNeuromorphic: boolean;
  creativityLevel: number;
}

export interface ConsciousnessResponse {
  request_id: string;
  content: string;
  consciousness_state: {
    awareness_level: number;
    emotional_state: string;
    cognitive_load: number;
    meta_cognitive_depth: number;
  };
  confidence_level: number;
  processing_time_ms: number;
  ethical_score: number;
  creativity_score?: number;
  empathy_score?: number;
  quantum_coherence?: number;
  neuromorphic_efficiency?: number;
}

export interface ConsciousnessRequest {
  input: string;
  options: {
    quality_threshold: number;
    ethical_strictness: number;
    enable_quantum: boolean;
    enable_neuromorphic: boolean;
    creativity_level: number;
  };
}