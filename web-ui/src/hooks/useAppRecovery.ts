// Hook pour la récupération automatique de l'application
// Auteur: Consciousness Engine Team

import { useEffect, useCallback, useRef, useState } from 'react';
import { RestartConfig, RestartEvent, RestartReason, DEFAULT_RESTART_CONFIG } from '../types/restart';
import { AppStateManager } from '../services/AppStateManager';
import { useNotifications } from '../contexts/NotificationContext';

interface UseAppRecoveryOptions {
  config?: Partial<RestartConfig>;
  onRestart?: (event: RestartEvent) => void;
  onError?: (error: Error) => void;
}

export const useAppRecovery = (options: UseAppRecoveryOptions = {}) => {
  const { config: userConfig = {}, onRestart, onError } = options;
  const config = { ...DEFAULT_RESTART_CONFIG, ...userConfig };
  
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastRecovery, setLastRecovery] = useState<RestartEvent | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  
  const stateManager = AppStateManager.getInstance();
  const { addNotification } = useNotifications();
  
  const retryCountRef = useRef(0);
  const lastErrorRef = useRef<Error | null>(null);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Effectue une récupération automatique
   */
  const performRecovery = useCallback(async (reason: RestartReason): Promise<boolean> => {
    if (isRecovering) {
      console.log('🔄 Récupération déjà en cours, ignorée');
      return false;
    }

    if (retryCountRef.current >= config.maxRetries) {
      console.error('❌ Nombre maximum de tentatives de récupération atteint');
      if (config.notifyUser) {
        addNotification({
          type: 'error',
          title: 'Récupération échouée',
          message: 'Impossible de récupérer l\'application automatiquement. Veuillez recharger la page.',
          autoHide: false,
        });
      }
      return false;
    }

    setIsRecovering(true);
    retryCountRef.current++;
    
    const startTime = Date.now();
    const eventId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`🔄 Début de la récupération (tentative ${retryCountRef.current}/${config.maxRetries})`);
      
      if (config.notifyUser) {
        addNotification({
          type: 'info',
          title: 'Récupération en cours',
          message: 'L\'application tente de se récupérer automatiquement...',
          duration: 3000,
        });
      }

      // Sauvegarder l'état si configuré
      let stateSaved = false;
      if (config.saveStateOnRestart) {
        stateSaved = stateManager.saveState();
      }

      // Attendre le délai configuré
      if (config.retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      }

      // Nettoyer les ressources
      await cleanupResources();

      // Simuler une récupération (dans un vrai cas, cela pourrait inclure la reconnexion aux services)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const duration = Date.now() - startTime;
      const recoveryEvent: RestartEvent = {
        id: eventId,
        reason,
        stateSaved,
        stateRestored: false, // Sera mis à jour lors de la restauration
        duration,
        success: true,
        retryCount: retryCountRef.current,
      };

      setLastRecovery(recoveryEvent);
      onRestart?.(recoveryEvent);

      // Réinitialiser le compteur d'erreurs en cas de succès
      retryCountRef.current = 0;
      setErrorCount(0);

      if (config.notifyUser) {
        addNotification({
          type: 'success',
          title: 'Récupération réussie',
          message: 'L\'application a été récupérée avec succès.',
          duration: 3000,
        });
      }

      console.log('✅ Récupération réussie', recoveryEvent);
      return true;

    } catch (error) {
      const duration = Date.now() - startTime;
      const recoveryEvent: RestartEvent = {
        id: eventId,
        reason,
        stateSaved: false,
        stateRestored: false,
        duration,
        success: false,
        retryCount: retryCountRef.current,
      };

      setLastRecovery(recoveryEvent);
      onError?.(error as Error);
      
      console.error('❌ Échec de la récupération:', error);
      
      // Programmer une nouvelle tentative si possible
      if (retryCountRef.current < config.maxRetries) {
        recoveryTimeoutRef.current = setTimeout(() => {
          performRecovery(reason);
        }, config.retryDelay);
      }

      return false;
    } finally {
      setIsRecovering(false);
    }
  }, [config, isRecovering, addNotification, onRestart, onError, stateManager]);

  /**
   * Nettoie les ressources de l'application
   */
  const cleanupResources = useCallback(async (): Promise<void> => {
    try {
      // Fermer les connexions EventSource
      const eventSources = document.querySelectorAll('*');
      eventSources.forEach((element: any) => {
        if (element.eventSource && typeof element.eventSource.close === 'function') {
          element.eventSource.close();
        }
      });

      // Nettoyer les timers et intervalles (approche sécurisée)
      // Note: Cette approche est limitée mais évite les erreurs de type
      for (let i = 1; i < 1000; i++) {
        clearTimeout(i);
        clearInterval(i);
      }

      // Nettoyer les anciens états
      stateManager.cleanupOldStates();

      console.log('🧹 Ressources nettoyées');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des ressources:', error);
    }
  }, [stateManager]);

  /**
   * Gestionnaire d'erreurs global
   */
  const handleError = useCallback((error: Error, errorInfo?: any) => {
    console.error('🚨 Erreur détectée:', error, errorInfo);
    
    lastErrorRef.current = error;
    setErrorCount(prev => prev + 1);

    if (config.autoRestart) {
      const reason: RestartReason = {
        type: 'error',
        message: error.message || 'Erreur inconnue',
        error,
        timestamp: new Date(),
        severity: 'high',
      };

      performRecovery(reason);
    }
  }, [config.autoRestart, performRecovery]);

  /**
   * Déclenche une récupération manuelle
   */
  const triggerRecovery = useCallback((reason?: string) => {
    const recoveryReason: RestartReason = {
      type: 'manual',
      message: reason || 'Récupération manuelle déclenchée',
      timestamp: new Date(),
      severity: 'medium',
    };

    performRecovery(recoveryReason);
  }, [performRecovery]);

  // Configurer les gestionnaires d'erreurs globaux
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason));
    };

    const handleGlobalError = (event: ErrorEvent) => {
      handleError(new Error(event.message));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, [handleError]);

  // Restaurer l'état au montage si disponible
  useEffect(() => {
    if (stateManager.hasSavedState()) {
      const restoredState = stateManager.restoreState();
      if (restoredState) {
        console.log('🔄 État restauré au démarrage');
        // Naviguer vers la route sauvegardée si nécessaire
        if (restoredState.currentRoute && restoredState.currentRoute !== window.location.hash) {
          window.location.hash = restoredState.currentRoute;
        }
      }
    }
  }, [stateManager]);

  return {
    isRecovering,
    lastRecovery,
    errorCount,
    triggerRecovery,
    handleError,
    cleanupResources,
  };
};
