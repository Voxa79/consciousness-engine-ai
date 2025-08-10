import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import {
  Hub as HubIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const AgentOrchestrator: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🎭 Agent Orchestrator
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Create new orchestration')}
        >
          New Orchestration
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HubIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Active Orchestrations</Typography>
              </Box>
              <Typography color="text.secondary">
                No active orchestrations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Chip label="Ready" color="primary" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentOrchestrator;