import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechInputState = 'idle' | 'listening' | 'processing';

export interface UseSpeechInputReturn {
  state: SpeechInputState;
  start: () => Promise<string>;
  stop: () => void;
  supported: boolean;
}

function playEarcon(frequency: number, durationMs: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext may be blocked before user gesture; safe to ignore
  }
}

export const EARCON_START_HZ = 440;
export const EARCON_END_HZ = 880;

export function useSpeechInput(): UseSpeechInputReturn {
  const [state, setState] = useState<SpeechInputState>('idle');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const resolveRef = useRef<((text: string) => void) | null>(null);
  const rejectRef = useRef<((err: Error) => void) | null>(null);

  const supported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition != null || window.webkitSpeechRecognition != null);

  const stop = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setState('idle');
  }, []);

  const start = useCallback((): Promise<string> => {
    if (!supported) return Promise.reject(new Error('SpeechRecognition not supported'));

    return new Promise<string>((resolve, reject) => {
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!SR) {
        reject(new Error('SpeechRecognition not available'));
        return;
      }

      const recognition = new SR();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      resolveRef.current = resolve;
      rejectRef.current = reject;

      recognition.onstart = () => {
        console.log('[useSpeechInput] Recognition started - microphone active');
        setState('listening');
        playEarcon(EARCON_START_HZ, 120);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('[useSpeechInput] Recognition result:', event.results[0]?.[0]?.transcript);
        setState('processing');
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        resolveRef.current?.(transcript);
        resolveRef.current = null;
        rejectRef.current = null;
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('[useSpeechInput] Recognition error:', event.error, event);
        setState('idle');
        const errorMessage = event.error === 'not-allowed'
          ? 'Microphone access denied. Please allow microphone permission in browser settings.'
          : event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : `Speech recognition error: ${event.error}`;
        rejectRef.current?.(new Error(errorMessage));
        rejectRef.current = null;
        resolveRef.current = null;
      };

      recognition.onend = () => {
        console.log('[useSpeechInput] Recognition ended');
        setState('idle');
        // If no result fired (e.g. silence), resolve with empty string
        if (resolveRef.current) {
          resolveRef.current('');
          resolveRef.current = null;
          rejectRef.current = null;
        }
      };

      try {
        console.log('[useSpeechInput] Starting recognition...');
        recognition.start();
      } catch (err) {
        console.error('[useSpeechInput] Failed to start recognition:', err);
        reject(err instanceof Error ? err : new Error('Failed to start speech recognition'));
      }
    });
  }, [supported]);

  useEffect(() => () => stop(), [stop]);

  return { state, start, stop, supported };
}
