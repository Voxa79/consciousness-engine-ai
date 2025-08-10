import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

export interface EventMessage {
  raw: string;
  json?: any;
  topic?: string;
  type?: string;
  timestamp?: string;
}

export interface UseEventSourceOptions {
  topic?: string;
  withCredentials?: boolean;
  onMessage?: (msg: EventMessage) => void;
  onError?: (err: Event) => void;
  onOpen?: (e: Event) => void;
}

const resolveApiBase = () => {
  // Permet d'utiliser REACT_APP_API_BASE en dev; fallback sur l'origine courante
  const envBase = (process.env.REACT_APP_API_BASE || '').trim();
  if (envBase) return envBase.replace(/\/$/, '');
  return window.location.origin;
};

export function useEventSource(path: string, opts: UseEventSourceOptions = {}) {
  const { topic, withCredentials, onMessage, onError, onOpen } = opts;
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const url = useMemo(() => {
    const base = resolveApiBase();
    const u = new URL(path, base);
    if (topic) u.searchParams.set('topic', topic);
    return u.toString();
  }, [path, topic]);

  // Mémoriser les callbacks pour éviter les reconnexions constantes
  const stableOnMessage = useCallback((msg: EventMessage) => {
    onMessage?.(msg);
  }, [onMessage]);

  const stableOnError = useCallback((e: Event) => {
    onError?.(e);
  }, [onError]);

  const stableOnOpen = useCallback((e: Event) => {
    onOpen?.(e);
  }, [onOpen]);

  useEffect(() => {
    // Nettoyage si déjà ouvert
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource(url, { withCredentials });
    esRef.current = es;

    const handleOpen = (e: Event) => {
      setConnected(true);
      stableOnOpen(e);
    };
    const handleError = (e: Event) => {
      setConnected(false);
      stableOnError(e);
    };
    const handleMessage = (e: MessageEvent) => {
      const raw = e.data as string;
      let parsed: any | undefined;
      try { parsed = JSON.parse(raw); } catch {}
      const msg: EventMessage = {
        raw,
        json: parsed,
        topic: parsed?.topic,
        type: parsed?.type,
        timestamp: parsed?.timestamp,
      };
      setMessages((prev) => [msg, ...prev].slice(0, 200));
      stableOnMessage(msg);
    };

    es.addEventListener('open', handleOpen as EventListener);
    es.addEventListener('error', handleError as EventListener);
    es.addEventListener('message', handleMessage as EventListener);

    return () => {
      es.removeEventListener('open', handleOpen as EventListener);
      es.removeEventListener('error', handleError as EventListener);
      es.removeEventListener('message', handleMessage as EventListener);
      es.close();
      esRef.current = null;
    };
  }, [url, withCredentials, stableOnMessage, stableOnError, stableOnOpen]);

  return { connected, messages } as const;
}
