import { useCallback, useRef, useState } from 'react';

export type WakeWordState = 'inactive' | 'listening' | 'detected' | 'error';

export interface UseWakeWordReturn {
  state: WakeWordState;
  activate: () => void;
  deactivate: () => void;
  pause: () => void;   // call before main STT starts
  resume: () => void;  // call after main STT ends
  supported: boolean;
}

const WAKE_PHRASES = [
  'hey vizvoice', 'hey viz voice', 'vizvoice', 'viz voice',
  'a vizvoice', 'hey his voice', 'hey this voice', // common mishears
];

function matchesWakeWord(transcript: string): boolean {
  const t = transcript.toLowerCase().trim();
  return WAKE_PHRASES.some((p) => t.includes(p));
}

/**
 * Wake word listener using a simple non-continuous restart loop.
 *
 * continuous=true is unreliable in Chrome — it stops after ~60s of silence
 * and can hold the mic in a way that blocks a second recognizer. Instead we
 * use short non-continuous sessions that restart immediately on end.
 *
 * IMPORTANT: activate() MUST be called from a user gesture (click handler).
 * Chrome blocks microphone access on auto-start without user interaction.
 */
export function useWakeWord(onWake: () => void): UseWakeWordReturn {
  const [state, setState] = useState<WakeWordState>('inactive');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const onWakeRef = useRef(onWake);
  onWakeRef.current = onWake; // always latest, no stale closure

  const supported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition != null || window.webkitSpeechRecognition != null);

  const startSession = useCallback(() => {
    if (!supported || !activeRef.current || pausedRef.current) return;

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    // Clean up any lingering instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false; // short sessions — more reliable than continuous
    recognition.interimResults = true;
    recognition.maxAlternatives = 3; // more alternatives = better wake word matching
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Check all alternatives for better wake word recall
        for (let j = 0; j < event.results[i].length; j++) {
          if (matchesWakeWord(event.results[i][j].transcript)) {
            pausedRef.current = true;
            recognitionRef.current = null;
            setState('detected');
            try { recognition.abort(); } catch { /* already ended */ }
            onWakeRef.current();
            return;
          }
        }
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      // 'no-speech': normal — user was quiet, restart
      // 'aborted': we triggered it, restart
      // 'not-allowed': real problem — stop
      if (e.error === 'not-allowed') {
        setState('error');
        activeRef.current = false;
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Restart loop immediately unless deactivated or handing off to main STT
      if (activeRef.current && !pausedRef.current) {
        setState('listening');
        // 100ms gap between sessions so Chrome doesn't rate-limit
        setTimeout(startSession, 100);
      }
    };

    try {
      recognition.start();
      setState('listening');
    } catch (e) {
      // InvalidStateError: already started — onend will restart
      console.warn('[WakeWord] start error:', e);
    }
  }, [supported]);

  const activate = useCallback(() => {
    if (!supported) return;
    activeRef.current = true;
    pausedRef.current = false;
    startSession();
  }, [supported, startSession]);

  const deactivate = useCallback(() => {
    activeRef.current = false;
    pausedRef.current = false;
    try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    recognitionRef.current = null;
    setState('inactive');
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    recognitionRef.current = null;
  }, []);

  const resume = useCallback(() => {
    if (!activeRef.current) return;
    pausedRef.current = false;
    setTimeout(startSession, 400); // give main STT mic time to fully release
  }, [startSession]);

  return { state, activate, deactivate, pause, resume, supported };
}
