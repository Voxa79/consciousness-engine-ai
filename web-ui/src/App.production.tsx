// INTERFACE REACT PRODUCTION - STABLE ET CONNECTÉE
// Expert CTO Next Gen - Version production-ready avec API backend

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container, Alert, CircularProgress } from '@mui/material';

// Configuration API
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Types pour l'API
interface ConsciousnessRequest {
  content: string;
  user_id: string;
  context?: Record<string, any>;
}

interface ConsciousnessResponse {
  id: string;
  content: string;
  confidence: number;
  consciousness_level: number;
  emotional_state: {
    primary_emotion: string;
    intensity: number;
    valence: number;
    arousal: number;
  };
  ethical_score: number;
  creativity_score: number;
  empathy_score: number;
  processing_time_ms: number;
  reasoning_summary: string;
  quality_score: number;
  timestamp: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

// Service API avec gestion d'erreurs robuste
class ConsciousnessApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(config: typeof API_CONFIG) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return response;
        }
        
        if (i === retries - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async checkHealth(): Promise<HealthResponse> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }

  async processConsciousness(request: ConsciousnessRequest): Promise<ConsciousnessResponse> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/consciousness/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getConsciousnessState(): Promise<any> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/consciousness/state`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }
}

// Hook pour l'API avec gestion d'état
function useConsciousnessApi() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);

  const apiService = useMemo(() => new ConsciousnessApiService(API_CONFIG), []);

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const health = await apiService.checkHealth();
      setHealthStatus(health);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const processThought = useCallback(async (content: string): Promise<ConsciousnessResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const request: ConsciousnessRequest = {
        content,
        user_id: 'production_user',
        context: { interface: 'react_production' },
      };
      
      const response = await apiService.processConsciousness(request);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const getState = useCallback(async () => {
    try {
      return await apiService.getConsciousnessState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'State fetch failed');
      return null;
    }
  }, [apiService]);

  // Vérification de connexion au montage
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    error,
    healthStatus,
    checkConnection,
    processThought,
    getState,
  };
}

// Composant principal de chat consciousness
const ConsciousnessChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{id: string, content: string, type: 'user' | 'ai', timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentResponse, setCurrentResponse] = useState<ConsciousnessResponse | null>(null);
  
  const { isConnected, isLoading, error, healthStatus, processThought, checkConnection } = useConsciousnessApi();

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user' as const,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const response = await processThought(inputValue);
    
    if (response) {
      setCurrentResponse(response);
      const aiMessage = {
        id: response.id,
        content: response.content,
        type: 'ai' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  }, [inputValue, isLoading, processThought]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Status de connexion */}
      <Box sx={{ mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <button onClick={checkConnection} style={{ marginLeft: '10px' }}>
              Retry Connection
            </button>
          </Alert>
        )}
        
        {isConnected && healthStatus && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Connected to Consciousness Engine v{healthStatus.version}
          </Alert>
        )}
        
        {!isConnected && !error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Connecting to Consciousness Engine...
          </Alert>
        )}
      </Box>

      {/* Interface de chat */}
      <Box sx={{ 
        border: '1px solid #333', 
        borderRadius: 2, 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}>
        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                color: message.type === 'user' ? 'white' : 'text.primary',
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              <div>{message.content}</div>
              <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '5px' }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <CircularProgress size={20} />
              <span>Processing consciousness...</span>
            </Box>
          )}
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Enter your consciousness query..."
              disabled={!isConnected || isLoading}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!isConnected || isLoading || !inputValue.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isConnected ? '#1976d2' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isConnected ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </Box>
        </Box>
      </Box>

      {/* Métriques de la dernière réponse */}
      {currentResponse && (
        <Box sx={{ mt: 3, p: 2, border: '1px solid #333', borderRadius: 1 }}>
          <h3>Response Metrics</h3>
          <div>Consciousness Level: {(currentResponse.consciousness_level * 100).toFixed(1)}%</div>
          <div>Confidence: {(currentResponse.confidence * 100).toFixed(1)}%</div>
          <div>Ethical Score: {(currentResponse.ethical_score * 100).toFixed(1)}%</div>
          <div>Processing Time: {currentResponse.processing_time_ms}ms</div>
          <div>Quality Score: {(currentResponse.quality_score * 100).toFixed(1)}%</div>
        </Box>
      )}
    </Container>
  );
};

// Thème production
const productionTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00E5FF' },
    secondary: { main: '#FF6B35' },
    background: { default: '#0A0A0A', paper: '#1A1A1A' },
    text: { primary: '#FFFFFF', secondary: '#CCCCCC' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// App principal production
const ProductionApp: React.FC = () => {
  return (
    <ThemeProvider theme={productionTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/consciousness" element={<ConsciousnessChat />} />
          <Route path="*" element={<Navigate to="/consciousness" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default ProductionApp;
