import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Monitor as MonitoringIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useEventSource } from '../../hooks/useEventSource';

const SystemMonitoring: React.FC = () => {
  const { connected, messages } = useEventSource('/events');
  const [evalPayload, setEvalPayload] = useState<string>(
    JSON.stringify(
      {
        quality: {
          agentType: 'assistant',
          changeId: 'webui-quality',
          scores: {
            selfAwareness: 0.8,
            ethical: 0.9,
            meta_cognitive_depth: 0.75,
            empathy: 0.8,
          },
        },
      },
      null,
      2
    )
  );
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evalResponse, setEvalResponse] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('tinyllama');
  const [availableModels, setAvailableModels] = useState<string[]>([
    'tinyllama',
    'qwen2.5:3b-instruct',
    'llama3.2:3b-instruct',
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/v1/llm/models');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const models = Array.isArray(data?.models)
          ? data.models.map((m: any) => (typeof m === 'string' ? m : (m?.name || m?.model))).filter(Boolean)
          : [];
        if (!cancelled && models.length) {
          setAvailableModels(models);
          // Ajuste selectedModel si absent
          if (!models.includes(selectedModel)) setSelectedModel(models[0]);
        }
      } catch (_e) {
        // Fallback silencieux sur la liste statique
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        📊 System Monitoring
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">CPU Usage</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={45}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                45% - Normal
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MemoryIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Memory Usage</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={62}
                color="secondary"
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                62% - Normal
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonitoringIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Flux Temps Réel</Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Chip label={connected ? 'SSE connecté' : 'SSE déconnecté'} color={connected ? 'success' : 'error'} size="small" />
                <Typography variant="body2" color="text.secondary">
                  {messages.length} événements récents
                </Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                {messages.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Aucun événement pour le moment. Ouvrez /health pour déclencher un event.</Typography>
                ) : (
                  <List dense>
                    {messages.slice(0, 50).map((m, idx) => (
                      <ListItem key={idx} alignItems="flex-start" sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {m.timestamp || ''} {m.topic ? `[${m.topic}]` : ''} {m.type || ''}
                            </Typography>
                          }
                          secondary={
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {m.json ? JSON.stringify(m.json, null, 2) : m.raw}
                            </pre>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Evaluate (Gateway) */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Évaluation unifiée via Gateway (/api/v1/evaluate)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Modifiez le payload JSON puis cliquez sur « Évaluer ». La requête est envoyée au Gateway qui proxifie vers le MVP Server et Ollama.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Payload JSON"
                    value={evalPayload}
                    onChange={(e) => setEvalPayload(e.target.value)}
                    fullWidth
                    multiline
                    minRows={12}
                    maxRows={24}
                    InputProps={{ sx: { fontFamily: 'monospace' } }}
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        setEvalError(null);
                        setEvalResponse(null);
                        setEvalLoading(true);
                        try {
                          const body = JSON.parse(evalPayload);
                          // Injecte le modèle sélectionné si non déjà fourni par l'utilisateur
                          const hasTopLevelModel = typeof body === 'object' && body && 'model' in body;
                          const hasNestedModel = typeof body?.llm === 'object' && body.llm && 'model' in body.llm;
                          if (!hasTopLevelModel && !hasNestedModel && selectedModel) {
                            body.model = selectedModel;
                          }
                          const res = await fetch('/api/v1/evaluate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                          });
                          const text = await res.text();
                          if (!res.ok) {
                            setEvalError(`HTTP ${res.status}: ${text}`);
                          } else {
                            try {
                              const json = JSON.parse(text);
                              setEvalResponse(JSON.stringify(json, null, 2));
                            } catch {
                              setEvalResponse(text);
                            }
                          }
                        } catch (e: any) {
                          setEvalError(e?.message || 'Erreur inattendue');
                        } finally {
                          setEvalLoading(false);
                        }
                      }}
                      disabled={evalLoading}
                    >
                      {evalLoading ? 'Évaluation en cours…' : 'Évaluer'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEvalError(null);
                        setEvalResponse(null);
                        setEvalPayload(
                          JSON.stringify(
                            {
                              quality: {
                                agentType: 'assistant',
                                changeId: 'webui-quality',
                                scores: {
                                  selfAwareness: 0.8,
                                  ethical: 0.9,
                                  meta_cognitive_depth: 0.75,
                                  empathy: 0.8,
                                },
                              },
                            },
                            null,
                            2
                          )
                        );
                        setSelectedModel('tinyllama');
                      }}
                      disabled={evalLoading}
                    >
                      Réinitialiser
                    </Button>
                  </Box>
                  <FormControl sx={{ mt: 2, minWidth: 240 }} size="small">
                    <InputLabel id="model-select-label">Modèle Ollama</InputLabel>
                    <Select
                      labelId="model-select-label"
                      id="model-select"
                      value={selectedModel}
                      label="Modèle Ollama"
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      {availableModels.map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {evalError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {evalError}
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Réponse
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid rgba(0, 229, 255, 0.2)',
                      background: 'rgba(26,26,26,0.6)',
                      minHeight: 280,
                      maxHeight: 480,
                      overflow: 'auto',
                    }}
                  >
                    {!evalResponse ? (
                      <Typography variant="body2" color="text.secondary">
                        Aucune réponse pour l’instant.
                      </Typography>
                    ) : (
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {evalResponse}
                      </pre>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemMonitoring;