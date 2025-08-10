// Composant de gestion du redémarrage
// Auteur: Consciousness Engine Team

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  RestartAlt as RestartIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { RestartType, RestartOptions, RestartEvent } from '../../types/restart';
import { useAppRecovery } from '../../hooks/useAppRecovery';
import { useNotifications } from '../../contexts/NotificationContext';
import { AppStateManager } from '../../services/AppStateManager';

interface RestartManagerProps {
  onRestart?: (event: RestartEvent) => void;
}

const RestartManager: React.FC<RestartManagerProps> = ({ onRestart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartType, setRestartType] = useState<RestartType>('soft');
  const [saveState, setSaveState] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [restartHistory, setRestartHistory] = useState<RestartEvent[]>([]);

  const { addNotification } = useNotifications();
  const stateManager = AppStateManager.getInstance();
  
  const { 
    isRecovering, 
    lastRecovery, 
    errorCount, 
    triggerRecovery 
  } = useAppRecovery({
    onRestart: (event) => {
      setRestartHistory(prev => [event, ...prev].slice(0, 10));
      onRestart?.(event);
    }
  });

  /**
   * Effectue le redémarrage selon le type sélectionné
   */
  const performRestart = useCallback(async (options: RestartOptions) => {
    setIsRestarting(true);
    
    try {
      const startTime = Date.now();
      
      addNotification({
        type: 'info',
        title: 'Redémarrage en cours',
        message: `Redémarrage ${options.type} en cours...`,
        duration: 3000,
      });

      // Sauvegarder l'état si demandé
      if (options.saveState) {
        stateManager.saveState();
      }

      // Attendre le délai si spécifié
      if (options.delay && options.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }

      switch (options.type) {
        case 'soft':
          await performSoftRestart();
          break;
        case 'hard':
          await performHardRestart();
          break;
        case 'services':
          await performServicesRestart();
          break;
        case 'full':
          await performFullRestart();
          break;
      }

      const duration = Date.now() - startTime;
      const event: RestartEvent = {
        id: `restart_${Date.now()}`,
        reason: {
          type: 'manual',
          message: options.reason || `Redémarrage ${options.type} manuel`,
          timestamp: new Date(),
          severity: 'medium',
        },
        stateSaved: !!options.saveState,
        stateRestored: false,
        duration,
        success: true,
        retryCount: 0,
      };

      setRestartHistory(prev => [event, ...prev].slice(0, 10));
      onRestart?.(event);

      addNotification({
        type: 'success',
        title: 'Redémarrage réussi',
        message: `Redémarrage ${options.type} terminé avec succès`,
        duration: 3000,
      });

    } catch (error) {
      console.error('❌ Erreur lors du redémarrage:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de redémarrage',
        message: `Échec du redémarrage: ${error}`,
        autoHide: false,
      });
    } finally {
      setIsRestarting(false);
      setIsOpen(false);
    }
  }, [addNotification, stateManager, onRestart]);

  /**
   * Redémarrage soft - Réinitialise l'état de l'application
   */
  const performSoftRestart = async (): Promise<void> => {
    // Nettoyer les états des composants
    const components = ['ConsciousnessChat', 'EventConsole', 'AgentManagement'];
    components.forEach(comp => {
      stateManager.saveComponentState(comp, null);
    });

    // Déclencher un re-render global
    window.dispatchEvent(new CustomEvent('app-soft-restart'));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  /**
   * Redémarrage hard - Recharge la page
   */
  const performHardRestart = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload();
  };

  /**
   * Redémarrage des services - Appelle l'API de redémarrage
   */
  const performServicesRestart = async (): Promise<void> => {
    try {
      const response = await fetch('/api/v1/system/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: ['consciousness-engine', 'api-gateway'] }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.warn('⚠️ Impossible de redémarrer les services via API:', error);
      // Fallback: déclencher via script PowerShell si disponible
      throw new Error('Redémarrage des services non disponible');
    }
  };

  /**
   * Redémarrage complet - Services + Interface
   */
  const performFullRestart = async (): Promise<void> => {
    await performServicesRestart();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await performHardRestart();
  };

  const handleRestartClick = () => {
    const options: RestartOptions = {
      type: restartType,
      saveState,
      reason: `Redémarrage ${restartType} manuel depuis l'interface`,
    };
    performRestart(options);
  };

  const getRestartTypeDescription = (type: RestartType): string => {
    switch (type) {
      case 'soft': return 'Réinitialise l\'interface sans recharger la page';
      case 'hard': return 'Recharge complètement la page';
      case 'services': return 'Redémarre les services backend';
      case 'full': return 'Redémarre tout le système';
      default: return '';
    }
  };

  const getEventIcon = (event: RestartEvent) => {
    if (event.success) {
      return <CheckIcon color="success" />;
    } else {
      return <ErrorIcon color="error" />;
    }
  };

  return (
    <>
      {/* Bouton principal */}
      <Tooltip title="Gestionnaire de redémarrage">
        <IconButton
          onClick={() => setIsOpen(true)}
          color={errorCount > 0 ? 'error' : 'default'}
          sx={{ position: 'relative' }}
        >
          <RestartIcon />
          {errorCount > 0 && (
            <Chip
              label={errorCount}
              size="small"
              color="error"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                minWidth: 20,
                height: 20,
              }}
            />
          )}
        </IconButton>
      </Tooltip>

      {/* Dialog principal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestartIcon />
            Gestionnaire de Redémarrage
            {isRecovering && <Chip label="Récupération en cours" color="warning" size="small" />}
          </Box>
        </DialogTitle>

        <DialogContent>
          {isRestarting && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Redémarrage en cours...
              </Typography>
            </Box>
          )}

          {errorCount > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errorCount} erreur(s) détectée(s). Un redémarrage peut résoudre les problèmes.
            </Alert>
          )}

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Type de redémarrage
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(['soft', 'hard', 'services', 'full'] as RestartType[]).map((type) => (
                  <Box
                    key={type}
                    sx={{
                      p: 1,
                      border: 1,
                      borderColor: restartType === type ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: restartType === type ? 'primary.light' : 'transparent',
                    }}
                    onClick={() => setRestartType(type)}
                  >
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getRestartTypeDescription(type)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={saveState}
                    onChange={(e) => setSaveState(e.target.checked)}
                  />
                }
                label="Sauvegarder l'état avant redémarrage"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>

          {lastRecovery && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dernière récupération
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getEventIcon(lastRecovery)}
                  <Typography variant="body2">
                    {lastRecovery.reason.message} - {lastRecovery.duration}ms
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowHistory(true)} startIcon={<HistoryIcon />}>
            Historique
          </Button>
          <Button onClick={() => triggerRecovery('Récupération manuelle')}>
            Récupération Auto
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleRestartClick}
            variant="contained"
            disabled={isRestarting || isRecovering}
            startIcon={<RestartIcon />}
          >
            Redémarrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog historique */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Historique des redémarrages</DialogTitle>
        <DialogContent>
          {restartHistory.length === 0 ? (
            <Typography color="text.secondary">Aucun redémarrage récent</Typography>
          ) : (
            <List>
              {restartHistory.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>{getEventIcon(event)}</ListItemIcon>
                  <ListItemText
                    primary={event.reason.message}
                    secondary={`${new Date(event.reason.timestamp).toLocaleString()} - ${event.duration}ms`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RestartManager;
