// Gestionnaire d'état de l'application pour les redémarrages
// Auteur: Consciousness Engine Team

import { AppState, STORAGE_KEYS } from '../types/restart';

export class AppStateManager {
  private static instance: AppStateManager;

  private constructor() {}

  public static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  /**
   * Sauvegarde l'état actuel de l'application
   */
  public saveState(additionalData?: Partial<AppState>): boolean {
    try {
      const currentState: AppState = {
        currentRoute: window.location.hash || '/',
        userSession: {
          isAuthenticated: !!localStorage.getItem('token'),
          user: this.parseJsonSafely(localStorage.getItem('user')),
          token: localStorage.getItem('token') || undefined,
        },
        uiState: {
          sidebarOpen: this.parseJsonSafely(localStorage.getItem('sidebar_open')),
          theme: localStorage.getItem('theme') || 'dark',
          notifications: this.parseJsonSafely(localStorage.getItem('notifications')) || [],
        },
        timestamp: Date.now(),
        ...additionalData,
      };

      localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(currentState));
      console.log('🔄 État de l\'application sauvegardé', currentState);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'état:', error);
      return false;
    }
  }

  /**
   * Restaure l'état de l'application
   */
  public restoreState(): AppState | null {
    try {
      const savedState = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (!savedState) {
        console.log('ℹ️ Aucun état sauvegardé trouvé');
        return null;
      }

      const state: AppState = JSON.parse(savedState);
      
      // Vérifier que l'état n'est pas trop ancien (24h max)
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      if (Date.now() - state.timestamp > maxAge) {
        console.log('⚠️ État sauvegardé trop ancien, ignoré');
        this.clearSavedState();
        return null;
      }

      // Restaurer les données dans localStorage si nécessaire
      if (state.userSession.token) {
        localStorage.setItem('token', state.userSession.token);
      }
      if (state.userSession.user) {
        localStorage.setItem('user', JSON.stringify(state.userSession.user));
      }
      if (state.uiState.theme) {
        localStorage.setItem('theme', state.uiState.theme);
      }

      console.log('✅ État de l\'application restauré', state);
      return state;
    } catch (error) {
      console.error('❌ Erreur lors de la restauration de l\'état:', error);
      this.clearSavedState();
      return null;
    }
  }

  /**
   * Efface l'état sauvegardé
   */
  public clearSavedState(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.APP_STATE);
      console.log('🗑️ État sauvegardé effacé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'effacement de l\'état:', error);
    }
  }

  /**
   * Vérifie si un état sauvegardé existe
   */
  public hasSavedState(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.APP_STATE);
  }

  /**
   * Obtient des informations sur l'état sauvegardé
   */
  public getSavedStateInfo(): { exists: boolean; timestamp?: number; age?: number } {
    try {
      const savedState = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (!savedState) {
        return { exists: false };
      }

      const state: AppState = JSON.parse(savedState);
      const age = Date.now() - state.timestamp;

      return {
        exists: true,
        timestamp: state.timestamp,
        age,
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Sauvegarde des données spécifiques à un composant
   */
  public saveComponentState(componentName: string, data: any): boolean {
    try {
      const key = `${STORAGE_KEYS.APP_STATE}_${componentName}`;
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de l'état du composant ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Restaure des données spécifiques à un composant
   */
  public restoreComponentState<T>(componentName: string, maxAge: number = 3600000): T | null {
    try {
      const key = `${STORAGE_KEYS.APP_STATE}_${componentName}`;
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data as T;
    } catch (error) {
      console.error(`❌ Erreur lors de la restauration de l'état du composant ${componentName}:`, error);
      return null;
    }
  }

  /**
   * Parse JSON de manière sécurisée
   */
  private parseJsonSafely(jsonString: string | null): any {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }

  /**
   * Nettoie les anciens états sauvegardés
   */
  public cleanupOldStates(): void {
    try {
      const keys = Object.keys(localStorage);
      const stateKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.APP_STATE));
      
      stateKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            // Supprimer les états de plus de 7 jours
            if (parsed.timestamp && Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
              localStorage.removeItem(key);
              console.log(`🗑️ État ancien supprimé: ${key}`);
            }
          }
        } catch {
          // Supprimer les données corrompues
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des anciens états:', error);
    }
  }
}
