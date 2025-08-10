import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useEventSource } from '../../hooks/useEventSource';

const resolveApiBase = () => {
  const envBase = (process.env.REACT_APP_API_BASE || '').trim();
  if (envBase) return envBase.replace(/\/$/, '');
  return window.location.origin;
};

const EventConsole: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<string | undefined>(undefined);
  const apiBase = useMemo(() => resolveApiBase(), []);

  const { connected, messages } = useEventSource('/events', { topic: currentTopic });

  const metrics = useMemo(() => {
    if (!messages.length) {
      return {
        total: 0,
        tokens: 0,
        startedAt: undefined as Date | undefined,
        endedAt: undefined as Date | undefined,
        durationSec: 0,
        tokensPerSec: 0,
        lastType: undefined as string | undefined,
        spark: [] as number[]
      };
    }

    const parseTs = (s?: string) => (s ? new Date(s) : undefined);
    const all = [...messages].reverse(); // oldest → newest
    const startEvt = all.find(m => (m.type === 'start'));
    const endEvt = all.find(m => (m.type === 'complete' || m.type === 'end'));
    const startedAt = parseTs(startEvt?.timestamp) || (all[0]?.timestamp ? new Date(all[0].timestamp!) : undefined);
    const endedAt = parseTs(endEvt?.timestamp);
    const now = new Date();
    const endTime = endedAt || now;
    const durationMs = startedAt ? Math.max(0, endTime.getTime() - startedAt.getTime()) : 0;
    const durationSec = durationMs / 1000;

    const tokenEvents = all.filter(m => m.type === 'token');
    const tokens = tokenEvents.length;
    const tokensPerSec = durationSec > 0 ? +(tokens / durationSec).toFixed(2) : 0;
    const lastType = all[all.length - 1]?.type;

    // Simple sparkline: bucket last 20 seconds token counts per second
    const SPAN_SEC = 20;
    const buckets = new Array(SPAN_SEC).fill(0);
    if (startedAt) {
      tokenEvents.forEach(te => {
        const ts = te.timestamp ? new Date(te.timestamp).getTime() : undefined;
        if (!ts) return;
        const secFromEnd = Math.floor((endTime.getTime() - ts) / 1000);
        const idx = SPAN_SEC - 1 - secFromEnd; // newer on the right
        if (idx >= 0 && idx < SPAN_SEC) buckets[idx] += 1;
      });
    }

    return { total: messages.length, tokens, startedAt, endedAt, durationSec: +durationSec.toFixed(2), tokensPerSec, lastType, spark: buckets };
  }, [messages]);

  const pingHealth = useCallback(async () => {
    await fetch(`${apiBase}/health`);
  }, [apiBase]);

  const startMockStream = useCallback(async () => {
    const res = await fetch(`${apiBase}/api/v1/mock/stream`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data?.topic) {
        setTopic(data.topic);
        setCurrentTopic(data.topic);
      }
    }
  }, [apiBase]);

  const applyFilter = useCallback(() => {
    setCurrentTopic(topic.trim() || undefined);
  }, [topic]);

  const clearFilter = useCallback(() => {
    setTopic('');
    setCurrentTopic(undefined);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        🛰️ Event Console (SSE)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Actions</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button variant="contained" startIcon={<HealthAndSafetyIcon />} onClick={pingHealth}>
                  Ping Health
                </Button>
                <Button variant="outlined" startIcon={<PlayArrowIcon />} onClick={startMockStream}>
                  Start Mock Stream
                </Button>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Filtrer par topic
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  placeholder="ex: system ou execution:{id}"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  InputProps={{ startAdornment: <FilterAltIcon fontSize="small" /> as any }}
                />
                <Button onClick={applyFilter} variant="outlined">Appliquer</Button>
                <Button onClick={clearFilter}>Effacer</Button>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Chip label={connected ? 'SSE connecté' : 'SSE déconnecté'} color={connected ? 'success' : 'error'} size="small" />
                {currentTopic && (
                  <Chip label={`topic: ${currentTopic}`} size="small" />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Métriques temps réel</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Durée</Typography>
                    <Typography variant="h6">{metrics.durationSec}s</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Tokens</Typography>
                    <Typography variant="h6">{metrics.tokens}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Tokens/s</Typography>
                    <Typography variant="h6">{metrics.tokensPerSec}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Total events</Typography>
                    <Typography variant="h6">{metrics.total}</Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Débit (20s)</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 40, mt: 0.5 }}>
                    {metrics.spark.map((v, i) => (
                      <Box key={i} sx={{ width: 6, height: Math.min(36, 4 + v * 4), bgcolor: v > 0 ? 'primary.main' : 'divider', borderRadius: 0.5 }} />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Événements</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ maxHeight: 520, overflow: 'auto' }}>
                  {messages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Aucun événement. Lancez un Mock Stream ou ping Health.
                    </Typography>
                  ) : (
                    <List dense>
                      {messages.slice(0, 200).map((m, idx) => (
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
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventConsole;
