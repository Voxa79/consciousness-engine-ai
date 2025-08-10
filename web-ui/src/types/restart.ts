// Types pour le système de redémarrage
// Auteur: Consciousness Engine Team

export interface RestartConfig {
  autoRestart: boolean;
  maxRetries: number;
  retryDelay: number; // en millisecondes
  healthCheckInterval: number; // en millisecondes
  saveStateOnRestart: boolean;
  notifyUser: boolean;
}

export interface AppState {
  currentRoute: string;
  userSession: {
    isAuthenticated: boolean;
    user?: any;
    token?: string;
  };
  uiState: {
    sidebarOpen?: boolean;
    theme?: string;
    notifications?: any[];
    lastError?: {
      message: string;
      stack?: string;
      timestamp: string;
    };
  };
  timestamp: number;
}

export interface RestartReason {
  type: 'manual' | 'auto' | 'error' | 'health_check' | 'service_failure';
  message: string;
  error?: Error;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RestartEvent {
  id: string;
  reason: RestartReason;
  stateSaved: boolean;
  stateRestored: boolean;
  duration: number; // en millisecondes
  success: boolean;
  retryCount: number;
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  lastCheck: Date;
  url?: string;
  port?: number;
  pid?: number;
}

export interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  services: ServiceStatus[];
  frontend: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    renderCount: number;
    errorCount: number;
    lastError?: Error;
  };
  timestamp: Date;
}

export interface RestartManagerState {
  isRestarting: boolean;
  lastRestart?: RestartEvent;
  restartHistory: RestartEvent[];
  config: RestartConfig;
  healthStatus: HealthCheckResult;
}

export type RestartType = 
  | 'soft'      // Redémarrage de l'interface uniquement
  | 'hard'      // Redémarrage complet avec rechargement de page
  | 'services'  // Redémarrage des services backend
  | 'full';     // Redémarrage complet de tout le système

export interface RestartOptions {
  type: RestartType;
  saveState?: boolean;
  reason?: string;
  force?: boolean;
  delay?: number;
}

// Configuration par défaut
export const DEFAULT_RESTART_CONFIG: RestartConfig = {
  autoRestart: true,
  maxRetries: 3,
  retryDelay: 5000,
  healthCheckInterval: 30000,
  saveStateOnRestart: true,
  notifyUser: true,
};

// Clés de stockage local
export const STORAGE_KEYS = {
  APP_STATE: 'consciousness_app_state',
  RESTART_CONFIG: 'consciousness_restart_config',
  RESTART_HISTORY: 'consciousness_restart_history',
} as const;
