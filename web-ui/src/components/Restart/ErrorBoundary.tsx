// Error Boundary avec redémarrage automatique
// Auteur: Consciousness Engine Team

import React, { Component, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Error as ErrorIcon,
  RestartAlt as RestartIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';
import { AppStateManager } from '../../services/AppStateManager';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRecovering: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  autoRecover?: boolean;
  recoveryDelay?: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private stateManager: AppStateManager;
  private recoveryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRecovering: false,
    };

    this.stateManager = AppStateManager.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Générer un ID unique pour cette erreur
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary a capturé une erreur:', error, errorInfo);
    
    // Sauvegarder les détails de l'erreur
    this.setState({ errorInfo });
    
    // Incrémenter le compteur global d'erreurs
    (window as any).__appErrorCount = ((window as any).__appErrorCount || 0) + 1;
    (window as any).__lastAppError = error;
    
    // Notifier le parent
    this.props.onError?.(error, errorInfo);
    
    // Sauvegarder l'état avant une éventuelle récupération
    this.stateManager.saveState({
      currentRoute: window.location.hash,
      userSession: {
        isAuthenticated: !!localStorage.getItem('token'),
        user: this.parseJsonSafely(localStorage.getItem('user')),
        token: localStorage.getItem('token') || undefined,
      },
      uiState: {
        lastError: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        }
      },
      timestamp: Date.now(),
    });

    // Déclencher la récupération automatique si activée
    if (this.props.autoRecover && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRecovery();
    }
  }

  private parseJsonSafely(jsonString: string | null): any {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }

  private scheduleRecovery = () => {
    const delay = this.props.recoveryDelay || 5000;
    
    this.setState({ isRecovering: true });
    
    console.log(`🔄 Récupération automatique programmée dans ${delay}ms (tentative ${this.state.retryCount + 1})`);
    
    this.recoveryTimeout = setTimeout(() => {
      this.handleRecovery();
    }, delay);
  };

  private handleRecovery = () => {
    console.log('🔄 Tentative de récupération automatique...');
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
    }));
  };

  private handleManualRestart = () => {
    // Sauvegarder l'état
    this.stateManager.saveState();
    
    // Recharger la page
    window.location.reload();
  };

  private handleSoftRestart = () => {
    // Réinitialiser l'état de l'Error Boundary
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isRecovering: false,
    });
  };

  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Interface d'erreur personnalisée
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId, retryCount, isRecovering } = this.state;
      const maxRetries = this.props.maxRetries || 3;

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" color="error" gutterBottom>
                    Erreur de l'Application
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {errorId}
                  </Typography>
                </Box>
              </Box>

              {isRecovering && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Récupération automatique en cours... (Tentative {retryCount + 1}/{maxRetries})
                  </Typography>
                </Alert>
              )}

              {retryCount >= maxRetries && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Nombre maximum de tentatives de récupération atteint. Un redémarrage manuel est nécessaire.
                  </Typography>
                </Alert>
              )}

              <Typography variant="body1" sx={{ mb: 2 }}>
                Une erreur inattendue s'est produite. L'application peut être instable.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={<BugIcon />}
                  label={`Tentatives: ${retryCount}/${maxRetries}`}
                  color={retryCount >= maxRetries ? 'error' : 'warning'}
                  size="small"
                />
                <Chip
                  label={error?.name || 'Erreur inconnue'}
                  color="error"
                  size="small"
                />
              </Box>

              <Accordion sx={{ mb: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Détails de l'erreur</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    <strong>Message:</strong> {error?.message}
                  </Typography>
                  
                  {error?.stack && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                      <strong>Stack Trace:</strong>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8em' }}>
                        {error.stack}
                      </pre>
                    </Typography>
                  )}

                  {errorInfo?.componentStack && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      <strong>Component Stack:</strong>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8em' }}>
                        {errorInfo.componentStack}
                      </pre>
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={this.handleSoftRestart}
                  disabled={isRecovering}
                >
                  Réessayer
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<RestartIcon />}
                  onClick={this.handleManualRestart}
                  disabled={isRecovering}
                >
                  Redémarrer l'Application
                </Button>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                L'état de votre session a été sauvegardé et sera restauré après le redémarrage.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
