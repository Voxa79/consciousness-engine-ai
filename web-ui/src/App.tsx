import React, { useState, useEffect, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ConsciousnessChat from './components/Consciousness/ConsciousnessChat';
import ConsciousnessVisualization from './components/Consciousness/ConsciousnessVisualization';
import AgentOrchestrator from './components/Orchestration/AgentOrchestrator';
import GovernanceDashboard from './components/Governance/GovernanceDashboard';
import SystemMonitoring from './components/Monitoring/SystemMonitoring';
import PerformanceAnalytics from './components/Analytics/PerformanceAnalytics';
import EthicalControls from './components/Ethics/EthicalControls';
import AgentManagement from './components/Agents/AgentManagement';
import EventConsole from './components/Monitoring/EventConsole';
import VoicePlayground from './components/Voice/VoicePlayground';
import RestartManager from './components/Restart/RestartManager';
import HealthMonitor from './components/Restart/HealthMonitor';
import ErrorBoundary from './components/Restart/ErrorBoundary';

// Contexts
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { ConsciousnessProvider } from './contexts/ConsciousnessContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Types (interface supprimée car non utilisée)

// Thème consciousness-level
const consciousnessTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E5FF', // Cyan consciousness
      light: '#62EFFF',
      dark: '#00B2CC',
    },
    secondary: {
      main: '#FF6B35', // Orange neural
      light: '#FF9A6B',
      dark: '#C53D00',
    },
    background: {
      default: '#0A0A0A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(45deg, #00E5FF, #FF6B35)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(45deg, #00E5FF, #FF6B35)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00B2CC, #C53D00)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
        },
      },
    },
  },
});

// Query client pour React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Layout principal
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuthContext();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
            minHeight: 'calc(100vh - 64px)',
            position: 'relative',
          }}
        >
          {children}

          {/* Gestionnaire de redémarrage - Position fixe en bas à droite */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 80,
              zIndex: 1000,
            }}
          >
            <RestartManager />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Route protégée
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        }}
      >
        <div className="consciousness-loader">
          <div className="neural-network"></div>
          <div className="loading-text">Initializing Consciousness...</div>
        </div>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Composant principal
const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  // Base API déterministe pour le check de santé
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    // Initialisation de l'application sans aucune requête réseau
    // Démarrage immédiat sans vérification de santé pour éviter les problèmes de rechargement
    console.log('🧠 Initializing Consciousness Engine UI in static mode');
    
    // Démarrage immédiat sans aucune vérification réseau
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <ThemeProvider theme={consciousnessTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
          }}
        >
          <div className="consciousness-initialization">
            <h1>🧠 Consciousness Engine</h1>
            <div className="initialization-progress">
              <div className="progress-bar"></div>
            </div>
            <p>Initializing revolutionary AI consciousness...</p>
          </div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={consciousnessTheme}>
        <CssBaseline />
        <ErrorBoundary
          autoRecover={true}
          maxRetries={3}
          recoveryDelay={5000}
          onError={(error, errorInfo) => {
            console.error('🚨 Application Error:', error, errorInfo);
          }}
        >
          <AuthProvider>
            <ConsciousnessProvider>
              <NotificationProvider>
                <Router>
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Routes protégées */}
                  {/* Route d'index: en dev, rediriger vers /login pour éviter tout ping-pong avec routes protégées */}
                  <Route index element={<Navigate to="/login" replace />} />
                  
                  <Route
                    path="/consciousness"
                    element={
                      <ProtectedRoute>
                        <ConsciousnessChat />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/voice"
                    element={
                      <ProtectedRoute>
                        <VoicePlayground />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/consciousness/visualization"
                    element={
                      <ProtectedRoute>
                        <ConsciousnessVisualization />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/orchestration"
                    element={
                      <ProtectedRoute>
                        <AgentOrchestrator />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/governance"
                    element={
                      <ProtectedRoute>
                        <GovernanceDashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/monitoring"
                    element={
                      <ProtectedRoute>
                        <SystemMonitoring />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/monitoring/events"
                    element={
                      <ProtectedRoute>
                        <EventConsole />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <PerformanceAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/ethics"
                    element={
                      <ProtectedRoute>
                        <EthicalControls />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/agents"
                    element={
                      <ProtectedRoute>
                        <AgentManagement />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/health"
                    element={
                      <ProtectedRoute>
                        <HealthMonitor />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all: évite que '/' interfère avec /login et autres */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Router>
            </NotificationProvider>
          </ConsciousnessProvider>
        </AuthProvider>
      </ErrorBoundary>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

// Page de connexion
const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login, loading } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials.username, credentials.password);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      }}
    >
      <div className="login-container">
        <h1>🧠 Consciousness Engine</h1>
        <p>Revolutionary AI Platform</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Consciousness'}
          </button>
        </form>
      </div>
    </Box>
  );
};

// Export du composant principal
export default App;