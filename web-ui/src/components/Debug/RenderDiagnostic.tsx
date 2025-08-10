import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, Button } from '@mui/material';
import { BugReport as BugIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface RenderInfo {
  timestamp: Date;
  component: string;
  reason: string;
}

interface RenderDiagnosticProps {
  componentName: string;
  dependencies?: any[];
  enabled?: boolean;
}

const RenderDiagnostic: React.FC<RenderDiagnosticProps> = ({ 
  componentName, 
  dependencies = [], 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const [renders, setRenders] = useState<RenderInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const renderCount = useRef(0);
  const lastDeps = useRef<any[]>([]);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;

    let reason = 'Initial render';
    if (renderCount.current > 1) {
      // Analyser les changements de dépendances
      const changedDeps = dependencies.map((dep, index) => {
        const lastDep = lastDeps.current[index];
        if (dep !== lastDep) {
          return `dep[${index}]: ${JSON.stringify(lastDep)} → ${JSON.stringify(dep)}`;
        }
        return null;
      }).filter(Boolean);

      reason = changedDeps.length > 0
        ? `Dependencies changed: ${changedDeps.join(', ')}`
        : 'Unknown reason';
    }

    const renderInfo: RenderInfo = {
      timestamp: new Date(),
      component: componentName,
      reason
    };

    setRenders(prev => [renderInfo, ...prev].slice(0, 20)); // Garder les 20 derniers
    lastDeps.current = [...dependencies];

    // Alerter si trop de renders
    if (renderCount.current > 10) {
      console.warn(`🔄 ${componentName} has rendered ${renderCount.current} times - possible infinite loop!`);
    }
  }, [enabled, componentName, dependencies]); // ✅ DÉPENDANCES AJOUTÉES

  const clearHistory = () => {
    setRenders([]);
    renderCount.current = 0;
  };

  if (!enabled) return null;

  return (
    <>
      {/* Bouton flottant pour afficher/masquer */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
        }}
      >
        <Chip
          icon={<BugIcon />}
          label={`${componentName}: ${renderCount.current}`}
          color={renderCount.current > 5 ? 'error' : renderCount.current > 2 ? 'warning' : 'default'}
          onClick={() => setIsVisible(!isVisible)}
          sx={{ cursor: 'pointer' }}
        />
      </Box>

      {/* Panel de diagnostic */}
      {isVisible && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 400,
            maxHeight: 500,
            zIndex: 9998,
            overflow: 'hidden',
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  🔍 Render Diagnostic
                </Typography>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={clearHistory}
                >
                  Clear
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Component: <strong>{componentName}</strong>
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total renders: <strong>{renderCount.current}</strong>
              </Typography>

              {renderCount.current > 5 && (
                <Chip
                  label="⚠️ High render count detected"
                  color="warning"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}

              <Typography variant="subtitle2" gutterBottom>
                Recent renders:
              </Typography>

              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List dense>
                  {renders.map((render, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {render.timestamp.toLocaleTimeString()}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {render.reason}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
};

export default RenderDiagnostic;
