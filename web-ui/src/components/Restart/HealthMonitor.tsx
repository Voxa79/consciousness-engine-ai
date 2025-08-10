// Composant de monitoring de santé de l'application
// Auteur: Consciousness Engine Team

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  LinearProgress,
  Grid,
  Alert,
} from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { HealthCheckResult, ServiceStatus } from '../../types/restart';

interface HealthMonitorProps {
  onHealthChange?: (health: HealthCheckResult) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const HealthMonitor: React.FC<HealthMonitorProps> = ({
  onHealthChange,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [health, setHealth] = useState<HealthCheckResult>({
    overall: 'unknown',
    services: [],
    frontend: {
      status: 'healthy',
      renderCount: 0,
      errorCount: 0,
    },
    timestamp: new Date(),
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  /**
   * Vérifie la santé d'un service
   */
  const checkServiceHealth = useCallback(async (
    name: string,
    url: string,
    timeout: number = 5000
  ): Promise<ServiceStatus> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeoutId);

      return {
        name,
        status: response.ok ? 'running' : 'error',
        lastCheck: new Date(),
        url,
      };
    } catch (error) {
      return {
        name,
        status: 'error',
        lastCheck: new Date(),
        url,
      };
    }
  }, []);

  /**
   * Vérifie la santé du frontend
   */
  const checkFrontendHealth = useCallback(() => {
    const renderDiagnostics = document.querySelectorAll('[data-render-count]');
    let totalRenders = 0;
    let maxRenders = 0;

    renderDiagnostics.forEach((element) => {
      const count = parseInt(element.getAttribute('data-render-count') || '0');
      totalRenders += count;
      maxRenders = Math.max(maxRenders, count);
    });

    // Vérifier les erreurs JavaScript récentes
    const errorCount = (window as any).__appErrorCount || 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (maxRenders > 20 || errorCount > 5) {
      status = 'unhealthy';
    } else if (maxRenders > 10 || errorCount > 2) {
      status = 'degraded';
    }

    return {
      status,
      renderCount: totalRenders,
      errorCount,
      lastError: (window as any).__lastAppError || undefined,
    };
  }, []);

  /**
   * Effectue une vérification complète de santé
   */
  const performHealthCheck = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const services: ServiceStatus[] = [];
      
      // Services à vérifier
      const servicesToCheck = [
        { name: 'API Gateway', url: '/api/v1/health' },
        { name: 'Consciousness Engine', url: '/api/v1/consciousness/health' },
        { name: 'Agent Orchestrator', url: '/api/v1/agents/health' },
      ];

      // Vérifier chaque service
      const serviceChecks = servicesToCheck.map(service =>
        checkServiceHealth(service.name, service.url)
      );

      const serviceResults = await Promise.allSettled(serviceChecks);
      
      serviceResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          services.push(result.value);
        } else {
          services.push({
            name: servicesToCheck[index].name,
            status: 'error',
            lastCheck: new Date(),
            url: servicesToCheck[index].url,
          });
        }
      });

      // Vérifier le frontend
      const frontend = checkFrontendHealth();

      // Déterminer l'état global
      const serviceStatuses = services.map(s => s.status);
      const hasErrorServices = serviceStatuses.includes('error');
      const hasStoppedServices = serviceStatuses.includes('stopped');
      
      let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (frontend.status === 'unhealthy' || hasErrorServices) {
        overall = 'unhealthy';
      } else if (frontend.status === 'degraded' || hasStoppedServices) {
        overall = 'degraded';
      }

      const healthResult: HealthCheckResult = {
        overall,
        services,
        frontend,
        timestamp: new Date(),
      };

      setHealth(healthResult);
      setLastCheck(new Date());
      onHealthChange?.(healthResult);

      console.log('🏥 Vérification de santé terminée:', healthResult);

    } catch (error) {
      console.error('❌ Erreur lors de la vérification de santé:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkServiceHealth, checkFrontendHealth, onHealthChange]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(performHealthCheck, refreshInterval);
    
    // Vérification initiale
    performHealthCheck();

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, performHealthCheck]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return <CheckIcon color="success" />;
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'error':
      case 'unhealthy':
        return <ErrorIcon color="error" />;
      case 'stopped':
        return <CircleIcon color="disabled" />;
      default:
        return <CircleIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'error':
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HealthIcon />
            <Typography variant="h6">État de Santé</Typography>
            <Chip
              label={health.overall}
              color={getStatusColor(health.overall) as any}
              size="small"
            />
          </Box>
          
          <Tooltip title="Actualiser">
            <IconButton
              onClick={performHealthCheck}
              disabled={isChecking}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {isChecking && <LinearProgress sx={{ mb: 2 }} />}

        {health.overall === 'unhealthy' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Problèmes critiques détectés. Un redémarrage peut être nécessaire.
          </Alert>
        )}

        {health.overall === 'degraded' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Performances dégradées détectées.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Services Backend
            </Typography>
            <List dense>
              {health.services.map((service) => (
                <ListItem key={service.name} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getStatusIcon(service.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={service.name}
                    secondary={`Dernière vérification: ${service.lastCheck.toLocaleTimeString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Frontend
            </Typography>
            <List dense>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {getStatusIcon(health.frontend.status)}
                </ListItemIcon>
                <ListItemText
                  primary="Interface Utilisateur"
                  secondary={`${health.frontend.renderCount} renders, ${health.frontend.errorCount} erreurs`}
                />
              </ListItem>
            </List>

            {health.frontend.lastError && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="caption">
                  Dernière erreur: {health.frontend.lastError.message}
                </Typography>
              </Alert>
            )}
          </Grid>
        </Grid>

        {lastCheck && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Dernière vérification: {lastCheck.toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthMonitor;
