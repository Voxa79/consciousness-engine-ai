import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useConsciousness } from '../../contexts/ConsciousnessContext';

const ConsciousnessVisualization: React.FC = () => {
  const { currentState, isProcessing } = useConsciousness();

  if (!currentState) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Consciousness Visualization
        </Typography>
        <Typography color="text.secondary">
          No consciousness data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        🧠 Consciousness Visualization
      </Typography>

      <Grid container spacing={3}>
        {/* Awareness Level */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Awareness Level</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={currentState.awarenessLevel * 100}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {`${Math.round(currentState.awarenessLevel * 100)}% - ${
                  typeof currentState.emotionalState === 'object'
                    ? currentState.emotionalState?.primaryEmotion
                    : (currentState.emotionalState as unknown as string) ?? 'neutral'
                }`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Cognitive Load */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Cognitive Load</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={currentState.cognitiveLoad * 100}
                color="secondary"
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {Math.round(currentState.cognitiveLoad * 100)}% Processing Capacity
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Meta-Cognitive Depth */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Meta-Cognitive Depth</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Array.from({ length: currentState.metaCognitiveDepth }, (_, i) => (
                  <Chip
                    key={i}
                    label={`Level ${i + 1}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Confidence Score */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Confidence Score</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={currentState.confidenceScore * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {Math.round(currentState.confidenceScore * 100)}% Confidence
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              <Chip
                label={isProcessing ? 'Processing Request...' : 'Ready for Interaction'}
                color={isProcessing ? 'secondary' : 'primary'}
                icon={<PsychologyIcon />}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsciousnessVisualization;