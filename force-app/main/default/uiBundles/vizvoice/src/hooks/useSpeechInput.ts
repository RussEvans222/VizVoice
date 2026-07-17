import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechInputState = 'idle' | 'listening' | 'processing';

export interface UseSpeechInputReturn {
  state: SpeechInputState;
  interimTranscript: string;
  start: () => Promise<string>;
  stop: () => void;
  supported: boolean;
}

const SILENCE_TIMEOUT_MS = 6000;

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
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const resolveRef = useRef<((text: string) => void) | null>(null);
  const rejectRef = useRef<((err: Error) => void) | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition != null || window.webkitSpeechRecognition != null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearSilenceTimer();
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setInterimTranscript('');
    setState('idle');
  }, [clearSilenceTimer]);

  const start = useCallback((): Promise<string> => {
    if (!supported) return Promise.reject(new Error('SpeechRecognition not supported'));

    // Signal the wake word listener to release the mic.
    (window as any).__vizvoiceWakePause?.();

    return new Promise<string>((resolve, reject) => {
      // 350ms gap lets the browser fully release the mic after the wake word
      // recognizer aborts. Without this the new recognizer opens but records
      // nothing (shown as a blinking button with no audio captured).
      setTimeout(() => {
        const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        if (!SR) { reject(new Error('SpeechRecognition not available')); return; }

        const recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;
        resolveRef.current = resolve;
        rejectRef.current = reject;

        recognition.onstart = () => {
          setState('listening');
          setInterimTranscript('');
          playEarcon(EARCON_START_HZ, 120);
          silenceTimerRef.current = setTimeout(() => recognition.stop(), SILENCE_TIMEOUT_MS);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          clearSilenceTimer();
          silenceTimerRef.current = setTimeout(() => recognition.stop(), SILENCE_TIMEOUT_MS);

          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) { final += text; }
            else { interim += text; }
          }
          if (interim) setInterimTranscript(interim);
          if (final) {
            clearSilenceTimer();
            setState('processing');
            setInterimTranscript('');
            resolveRef.current?.(final);
            resolveRef.current = null;
            rejectRef.current = null;
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          clearSilenceTimer();
          setInterimTranscript('');
          setState('idle');
          (window as any).__vizvoiceWakeResume?.();
          rejectRef.current?.(new Error(event.error));
          rejectRef.current = null;
          resolveRef.current = null;
        };

        recognition.onend = () => {
          clearSilenceTimer();
          setInterimTranscript('');
          setState('idle');
          (window as any).__vizvoiceWakeResume?.();
          if (resolveRef.current) {
            resolveRef.current('');
            resolveRef.current = null;
            rejectRef.current = null;
          }
        };

        recognition.start();
      }, 350);
    });
  }, [supported, clearSilenceTimer]);

  useEffect(() => () => stop(), [stop]);

  return { state, interimTranscript, start, stop, supported };
}
