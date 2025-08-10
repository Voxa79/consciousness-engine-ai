import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import {
  AccountTree as AccountTreeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const GovernanceDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        ⚖️ Governance Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountTreeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Governance Policies</Typography>
              </Box>
              <Typography color="text.secondary">
                All policies are active and compliant
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Compliance Status</Typography>
              </Box>
              <Chip label="Fully Compliant" color="success" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GovernanceDashboard;