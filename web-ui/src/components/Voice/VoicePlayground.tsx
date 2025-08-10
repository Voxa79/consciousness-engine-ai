import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SendIcon from '@mui/icons-material/Send';

const WS_URL = (process.env as any)?.REACT_APP_ULTRAVOX_WS_URL || 'ws://localhost:8788/realtime';

const VoicePlayground: React.FC = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [model, setModel] = useState('tinyllama');
  const [prompt, setPrompt] = useState('Bonjour, test voix → LLM !');
  const [tokens, setTokens] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const connect = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;
    setConnecting(true);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => { setConnected(true); setConnecting(false); setError(''); };
    ws.onclose = () => { setConnected(false); };
    ws.onerror = (e) => { setError('Erreur WebSocket'); };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'llm_token' && msg.token) {
          setTokens((t) => t + msg.token);
        } else if (msg.type === 'llm_message' && msg.message) {
          setMessages((arr) => [...arr, String(msg.message)]);
        } else if (msg.type === 'error') {
          setError(String(msg.error || 'Erreur'));
        }
      } catch {
        // ignore
      }
    };
  };

  const disconnect = () => {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    setConnected(false);
  };

  const sendPrompt = () => {
    setTokens('');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) connect();
    const payload = { type: 'text', text: prompt, model };
    wsRef.current?.send(JSON.stringify(payload));
  };

  useEffect(() => {
    return () => { try { wsRef.current?.close(); } catch {} };
  }, []);

  return (
    <Box>
      <Typography variant="h2" gutterBottom>Voice Playground</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        PoC temps réel (WS). Envoi de prompt texte → tokens en direct depuis la Gateway → Ollama.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<MicIcon />} onClick={connect} disabled={connected || connecting}>
                    Connecter
                  </Button>
                  <Button variant="outlined" color="secondary" startIcon={<StopCircleIcon />} onClick={disconnect} disabled={!connected}>
                    Déconnecter
                  </Button>
                </Stack>
                <TextField label="Modèle" value={model} onChange={(e) => setModel(e.target.value)} helperText="Modèle Ollama (ex: tinyllama, qwen2.5:3b-instruct)" />
                <TextField label="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} multiline minRows={3} />
                <Button variant="contained" endIcon={<SendIcon />} onClick={sendPrompt} disabled={connecting}>
                  Envoyer au LLM
                </Button>
                {error && <Typography color="error">{error}</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tokens</Typography>
              <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, minHeight: 160, whiteSpace: 'pre-wrap' }}>{tokens}</Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Messages</Typography>
              <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, minHeight: 120 }}>
                {messages.map((m, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 1 }}>{m}</Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VoicePlayground;
