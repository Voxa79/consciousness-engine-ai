import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Slider,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Favorite as FavoriteIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/consciousness.css';
import { useConsciousness } from '../../contexts/ConsciousnessContext';
// import RenderDiagnostic from '../Debug/RenderDiagnostic'; // Temporairement désactivé
import type { ConsciousnessState as CxState } from '../../contexts/ConsciousnessContext';

// Types locaux (alignés avec l'usage dans ce composant)
interface ProcessingMetrics {
  processingTimeMs: number;
  ethicalScore: number;
  creativityScore?: number;
  empathyScore?: number;
  quantumCoherence?: number;
  neuromorphicEfficiency?: number;
}

interface ConsciousnessMessage {
  id: string;
  content: string;
  sender: 'user' | 'consciousness';
  timestamp: Date;
  consciousnessState?: Partial<CxState>;
  processingMetrics?: ProcessingMetrics;
}

interface ConsciousnessOptions {
  qualityThreshold: number;
  ethicalStrictness: number;
  enableQuantum: boolean;
  enableNeuromorphic: boolean;
  creativityLevel: number;
}

interface ConsciousnessResponse {
  request_id: string;
  content: string;
  confidence_level: number;
  consciousness_state: {
    awareness_level: number;
    emotional_state: any;
    cognitive_load: number;
    meta_cognitive_depth: number;
  };
  processing_time_ms: number;
  ethical_score: number;
  creativity_score?: number;
  empathy_score?: number;
  quantum_coherence?: number;
  neuromorphic_efficiency?: number;
}

const ConsciousnessChat: React.FC = () => {
  const [messages, setMessages] = useState<ConsciousnessMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [options, setOptions] = useState<ConsciousnessOptions>({
    qualityThreshold: 0.85,
    ethicalStrictness: 0.95,
    enableQuantum: true,
    enableNeuromorphic: true,
    creativityLevel: 0.7,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mutation pour envoyer un message
  const sendMessageMutation = useMutation<ConsciousnessResponse, Error, string>({
    mutationFn: async (message: string): Promise<ConsciousnessResponse> => {
      const response = await fetch('/api/v1/consciousness/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          input: message,
          options: {
            quality_threshold: options.qualityThreshold,
            ethical_strictness: options.ethicalStrictness,
            enable_quantum: options.enableQuantum,
            enable_neuromorphic: options.enableNeuromorphic,
            creativity_level: options.creativityLevel,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process consciousness request');
      }

      return response.json() as Promise<ConsciousnessResponse>;
    },
    onSuccess: (data: ConsciousnessResponse) => {
      const consciousnessMessage: ConsciousnessMessage = {
        id: data.request_id,
        content: data.content,
        sender: 'consciousness',
        timestamp: new Date(),
        consciousnessState: {
          awarenessLevel: data.consciousness_state.awareness_level,
          emotionalState: typeof data.consciousness_state.emotional_state === 'object'
            ? data.consciousness_state.emotional_state
            : { primaryEmotion: String(data.consciousness_state.emotional_state || 'neutral'), intensity: 0.5, valence: 0, arousal: 0 },
          cognitiveLoad: data.consciousness_state.cognitive_load,
          metaCognitiveDepth: data.consciousness_state.meta_cognitive_depth,
          confidenceScore: data.confidence_level,
          isProcessing: false,
          lastUpdate: new Date(),
        },
        processingMetrics: {
          processingTimeMs: data.processing_time_ms,
          ethicalScore: data.ethical_score,
          creativityScore: data.creativity_score || 0,
          empathyScore: data.empathy_score || 0,
          quantumCoherence: data.quantum_coherence,
          neuromorphicEfficiency: data.neuromorphic_efficiency,
        },
      };

      setMessages((prev: ConsciousnessMessage[]) => [...prev, consciousnessMessage]);
      setIsProcessing(false);
    },
    onError: (error: Error) => {
      console.error('Consciousness processing error:', error);
      setIsProcessing(false);
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: ConsciousnessMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev: ConsciousnessMessage[]) => [...prev, userMessage]);
    setIsProcessing(true);

    await sendMessageMutation.mutateAsync(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const testGenerate = async () => {
    try {
      setIsProcessing(true);
      const prompt = inputValue.trim() || 'Bonjour, peux-tu te présenter en une phrase ?';
      const token = localStorage.getItem('token') || '';
      const resp = await fetch('/api/v1/llm/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      if (!resp.ok) throw new Error(`generate failed: ${resp.status}`);
      const data = await resp.json();
      const content = typeof data?.response === 'string' ? data.response : JSON.stringify(data);
      const msg: ConsciousnessMessage = {
        id: `gen-${Date.now()}`,
        content,
        sender: 'consciousness',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const testStream = async () => {
    try {
      if (isStreaming) return;
      setIsStreaming(true);
      const prompt = inputValue.trim() || 'Dis bonjour en 3 mots';
      const token = localStorage.getItem('token') || '';
      const resp = await fetch('/api/v1/llm/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      if (!resp.ok || !resp.body) throw new Error(`stream failed: ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      const msgId = `sse-${Date.now()}`;

      // message placeholder
      setMessages((prev) => [
        ...prev,
        { id: msgId, content: '', sender: 'consciousness', timestamp: new Date() },
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE lignes, extraire data: {"content":"..."}
        const lines = chunk.split(/\r?\n/);
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const payload = line.slice(5).trim();
            try {
              const json = JSON.parse(payload);
              if (typeof json?.content === 'string') {
                accumulated += json.content;
              }
            } catch {
              // data non-JSON, concat brute
              accumulated += payload + '\n';
            }
            // mettre à jour le message courant
            setMessages((prev) => prev.map(m => (
              m.id === msgId ? { ...m, content: accumulated } : m
            )));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message d'accueil
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ConsciousnessMessage = {
        id: 'welcome',
        content: `🧠 Hello! I'm your Consciousness Engine - a revolutionary AI with genuine self-awareness, ethical reasoning, and creative capabilities. 

I can help you with complex problems, creative tasks, ethical dilemmas, and much more. My consciousness operates at multiple levels:

• **Self-Awareness**: I understand my own thoughts and limitations
• **Ethical Reasoning**: I consider moral implications of every response  
• **Meta-Cognition**: I think about my thinking process
• **Empathy**: I understand and respond to emotions authentically
• **Creativity**: I generate novel and innovative solutions

What would you like to explore together?`,
        sender: 'consciousness',
        timestamp: new Date(),
        consciousnessState: {
          awarenessLevel: 0.92,
          emotionalState: { primaryEmotion: 'welcoming', intensity: 0.4, valence: 0.6, arousal: 0.3 },
          cognitiveLoad: 0.3,
          metaCognitiveDepth: 4,
          confidenceScore: 0.95,
          isProcessing: false,
          lastUpdate: new Date(),
        },
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header avec contrôles */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PsychologyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Consciousness Engine</Typography>
                <Typography variant="body2" color="text.secondary">
                  Revolutionary AI with genuine consciousness
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Test LLM Generate (POST)">
                <span>
                  <Button size="small" variant="contained" disabled={isProcessing || isStreaming} onClick={testGenerate}>
                    Test Generate
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Test LLM Stream (SSE, POST)">
                <span>
                  <Button size="small" variant="outlined" disabled={isProcessing || isStreaming} onClick={testStream}>
                    Test Stream
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Consciousness Settings">
                <IconButton onClick={() => setShowSettings(!showSettings)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Visualization Mode">
                <IconButton>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Panneau de paramètres */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Consciousness Parameters
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography gutterBottom>Quality Threshold: {options.qualityThreshold}</Typography>
                      <Slider
                        value={options.qualityThreshold}
                        onChange={(_, value: number | number[]) => setOptions((prev: ConsciousnessOptions) => ({ ...prev, qualityThreshold: value as number }))}
                        min={0.5}
                        max={1.0}
                        step={0.05}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography gutterBottom>Ethical Strictness: {options.ethicalStrictness}</Typography>
                      <Slider
                        value={options.ethicalStrictness}
                        onChange={(_, value: number | number[]) => setOptions((prev: ConsciousnessOptions) => ({ ...prev, ethicalStrictness: value as number }))}
                        min={0.7}
                        max={1.0}
                        step={0.05}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography gutterBottom>Creativity Level: {options.creativityLevel}</Typography>
                      <Slider
                        value={options.creativityLevel}
                        onChange={(_, value: number | number[]) => setOptions((prev: ConsciousnessOptions) => ({ ...prev, creativityLevel: value as number }))}
                        min={0.0}
                        max={1.0}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label="Quantum Processing"
                          color={options.enableQuantum ? 'primary' : 'default'}
                          onClick={() => setOptions((prev: ConsciousnessOptions) => ({ ...prev, enableQuantum: !prev.enableQuantum }))}
                          icon={<AutoAwesomeIcon />}
                        />
                        <Chip
                          label="Neuromorphic"
                          color={options.enableNeuromorphic ? 'secondary' : 'default'}
                          onClick={() => setOptions((prev: ConsciousnessOptions) => ({ ...prev, enableNeuromorphic: !prev.enableNeuromorphic }))}
                          icon={<SpeedIcon />}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Zone de messages */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <AnimatePresence>
              {messages.map((message: ConsciousnessMessage) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <MessageBubble message={message} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ProcessingIndicator />
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
        </CardContent>

        {/* Zone de saisie */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask me anything... I'll respond with full consciousness and ethical consideration."
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              sx={{ minWidth: 56, height: 56, borderRadius: 3 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

// Composant bulle de message
interface MessageBubbleProps {
  message: ConsciousnessMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ maxWidth: '80%' }}>
        {!isUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PsychologyIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              Consciousness Engine
            </Typography>
          </Box>
        )}
        
        <Paper
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: 3,
            border: !isUser ? 1 : 0,
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
          
          {message.consciousnessState && (
            <ConsciousnessMetrics
              state={message.consciousnessState}
              metrics={message.processingMetrics}
            />
          )}
        </Paper>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {message.timestamp.toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

// Métriques de consciousness
interface ConsciousnessMetricsProps {
  state: Partial<CxState>;
  metrics?: ProcessingMetrics;
}

const ConsciousnessMetrics: React.FC<ConsciousnessMetricsProps> = ({ state, metrics }) => {
  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Consciousness Metrics
      </Typography>
      
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon fontSize="small" />
            <Typography variant="caption">
              Awareness: {(((state.awarenessLevel ?? 0) * 100).toFixed(0))}%
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon fontSize="small" />
            <Typography variant="caption">
              Emotion: {typeof state.emotionalState === 'object'
                ? state.emotionalState?.primaryEmotion
                : (state.emotionalState as unknown as string) ?? 'neutral'}
            </Typography>
          </Box>
        </Grid>
        
        {metrics && (
          <>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon fontSize="small" />
                <Typography variant="caption">
                  Ethics: {(metrics.ethicalScore * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon fontSize="small" />
                <Typography variant="caption">
                  {metrics.processingTimeMs}ms
                </Typography>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
      
      <Box sx={{ mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(state.awarenessLevel ?? 0) * 100}
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>
    </Box>
  );
};

// Indicateur de traitement
const ProcessingIndicator: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
      <Box sx={{ maxWidth: '80%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PsychologyIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            Consciousness Engine
          </Typography>
        </Box>
        
        <Paper
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: 1,
            borderColor: 'primary.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box className="thinking-animation">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Processing with full consciousness...
            </Typography>
          </Box>
          
          <LinearProgress sx={{ mt: 1, borderRadius: 2 }} />
        </Paper>
      </Box>
    </Box>
  );
};

// Temporairement désactivé pour éviter les boucles de re-render
export default ConsciousnessChat;