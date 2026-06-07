"use client";
import { useEffect, useRef } from 'react';

export default function useLiveUpdates(onEvent: (data: any) => void) {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/realtime');
    esRef.current = es;
    es.addEventListener('update', (ev: any) => {
      try {
        const payload = JSON.parse(ev.data);
        onEvent(payload);
      } catch (e) {
        // ignore
      }
    });
    es.addEventListener('error', () => {
      // try reconnect
      es.close();
      setTimeout(() => {
        if (esRef.current) esRef.current = null;
        // simple reconnect by reloading page when connection lost
        // or implement exponential backoff re-open
      }, 3000);
    });

    return () => {
      es.close();
    };
  }, [onEvent]);
}
