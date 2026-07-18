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

    return new Promise<string>(async (resolve, reject) => {
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!SR) {
        reject(new Error('SpeechRecognition not available'));
        return;
      }

      const recognition = new SR();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false; // Stop after first result

      recognitionRef.current = recognition;
      resolveRef.current = resolve;
      rejectRef.current = reject;

      let hasStarted = false;

      recognition.onstart = () => {
        console.log('[useSpeechInput] Recognition started - microphone active');
        hasStarted = true;
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
        console.error('[useSpeechInput] Recognition error:', event.error, 'Full event:', event);
        console.error('[useSpeechInput] Error details:', {
          error: event.error,
          message: event.message,
          hasStarted,
          timeStamp: event.timeStamp
        });
        setState('idle');
        const errorMessage = event.error === 'not-allowed'
          ? 'Microphone access denied. Please allow microphone permission in browser settings.'
          : event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : event.error === 'audio-capture'
          ? 'Cannot access microphone. Another application may be using it, or the device is not available.'
          : event.error === 'aborted'
          ? 'Recognition was aborted (likely due to timeout waiting for microphone)'
          : `Speech recognition error: ${event.error}`;
        rejectRef.current?.(new Error(errorMessage));
        rejectRef.current = null;
        resolveRef.current = null;
      };

      recognition.onend = () => {
        console.log('[useSpeechInput] Recognition ended', { hasStarted, hadResult: !resolveRef.current });
        setState('idle');

        // If ended without ever starting, that's an error
        if (!hasStarted) {
          console.error('[useSpeechInput] Recognition ended without ever starting! Microphone may be blocked or in use.');
          if (rejectRef.current) {
            rejectRef.current(new Error(
              'Microphone did not activate. Please check: (1) Another app may be using the microphone, (2) Browser permissions, (3) System microphone access'
            ));
            rejectRef.current = null;
            resolveRef.current = null;
          }
          return;
        }

        // If no result fired (e.g. silence), resolve with empty string
        if (resolveRef.current) {
          resolveRef.current('');
          resolveRef.current = null;
          rejectRef.current = null;
        }
      };

      try {
        console.log('[useSpeechInput] Starting recognition...');
        console.log('[useSpeechInput] Browser:', navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other');
        console.log('[useSpeechInput] Running in iframe?', window.self !== window.top);
        console.log('[useSpeechInput] Location:', window.location.href);

        // CRITICAL: Check if we're in an iframe without microphone permission
        if (window.self !== window.top) {
          console.warn('[useSpeechInput] Running in iframe - checking microphone feature policy...');
          // Try to test microphone access directly
          try {
            const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('[useSpeechInput] Direct microphone access test PASSED');
            testStream.getTracks().forEach(track => track.stop());
          } catch (testErr) {
            console.error('[useSpeechInput] Direct microphone access test FAILED:', testErr);
            reject(new Error(
              'Microphone blocked in iframe. This UI Bundle needs to be loaded with microphone permissions. ' +
              'Contact your Salesforce admin to enable microphone access for embedded apps.'
            ));
            return;
          }
        }

        // CRITICAL FIX: Resume AudioContext before starting recognition (Chrome requires this)
        try {
          const audioCtx = new AudioContext();
          if (audioCtx.state === 'suspended') {
            console.log('[useSpeechInput] AudioContext is suspended, resuming...');
            await audioCtx.resume();
            console.log('[useSpeechInput] AudioContext resumed:', audioCtx.state);
          } else {
            console.log('[useSpeechInput] AudioContext state:', audioCtx.state);
          }
          audioCtx.close(); // Clean up
        } catch (audioErr) {
          console.warn('[useSpeechInput] Could not check/resume AudioContext:', audioErr);
        }

        // Small delay to ensure browser is ready after AudioContext resume
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('[useSpeechInput] Calling recognition.start()...');
        recognition.start();
        console.log('[useSpeechInput] recognition.start() returned successfully (but onstart may not have fired yet)');

        // Fallback timeout: if onstart doesn't fire within 2 seconds, something's wrong
        setTimeout(() => {
          if (!hasStarted && recognitionRef.current === recognition) {
            console.error('[useSpeechInput] TIMEOUT: onstart never fired after 2s');
            console.error('[useSpeechInput] This usually means: (1) Microphone hardware is in use by another app, (2) Browser audio context is suspended, (3) System microphone is disabled');
            recognition.abort();
          }
        }, 2000);
      } catch (err) {
        console.error('[useSpeechInput] EXCEPTION calling recognition.start():', err);
        reject(err instanceof Error ? err : new Error('Failed to start speech recognition'));
      }
    });
  }, [supported]);

  useEffect(() => () => stop(), [stop]);

  return { state, start, stop, supported };
}
