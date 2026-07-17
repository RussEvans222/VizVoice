import { useCallback, useEffect, useRef, useState } from 'react';

export type WakeWordState = 'inactive' | 'listening' | 'detected' | 'error';

export interface UseWakeWordReturn {
  state: WakeWordState;
  activate: () => void;   // start background listening
  deactivate: () => void; // stop background listening
  supported: boolean;
}

const WAKE_PHRASES = ['hey vizvoice', 'hey viz voice', 'vizvoice', 'viz voice', 'hey voice'];

function matchesWakeWord(transcript: string): boolean {
  const t = transcript.toLowerCase().trim();
  return WAKE_PHRASES.some((p) => t.includes(p));
}

/**
 * Always-on background listener. Runs a SpeechRecognition loop with
 * continuous=true so the microphone stays open. When the wake phrase
 * "Hey VizVoice" is detected, it fires the onWake callback and pauses
 * itself so the main speech input can take over without two recognizers
 * fighting over the mic.
 *
 * The loop restarts automatically after the browser ends the session
 * (browsers stop continuous recognition after ~60s of silence or ~5min
 * total — we restart immediately on `onend` if still active).
 */
export function useWakeWord(onWake: () => void): UseWakeWordReturn {
  const [state, setState] = useState<WakeWordState>('inactive');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeRef = useRef(false);
  const pausedRef = useRef(false); // paused while main STT is running

  const supported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition != null || window.webkitSpeechRecognition != null);

  const startLoop = useCallback(() => {
    if (!supported || !activeRef.current || pausedRef.current) return;

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      if (activeRef.current && !pausedRef.current) setState('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (matchesWakeWord(transcript)) {
          recognition.abort();
          recognitionRef.current = null;
          setState('detected');
          pausedRef.current = true;
          onWake();
          return;
        }
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      // 'no-speech' and 'aborted' are expected — just restart
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setState('error');
      }
    };

    recognition.onend = () => {
      // Restart unless explicitly deactivated or paused for main STT.
      // 500ms gap lets the browser fully release the mic before we
      // re-open it — prevents the "recording dot stays on, no audio" bug.
      if (activeRef.current && !pausedRef.current) {
        setTimeout(startLoop, 500);
      }
    };

    try {
      recognition.start();
    } catch {
      // Already started — harmless, onend will restart
    }
  }, [supported, onWake]);

  const activate = useCallback(() => {
    if (!supported) return;
    activeRef.current = true;
    pausedRef.current = false;
    setState('listening');
    startLoop();
  }, [supported, startLoop]);

  const deactivate = useCallback(() => {
    activeRef.current = false;
    pausedRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setState('inactive');
  }, []);

  // Expose a way for the parent to pause/resume around main STT turns
  // by toggling pausedRef directly — no re-render needed.
  useEffect(() => {
    // Attach pause/resume helpers to the hook's closure so VoiceAssistant
    // can call them. We expose them via a window property as a simple bridge
    // (avoids prop-drilling through the whole component tree).
    (window as any).__vizvoiceWakePause = () => {
      pausedRef.current = true;
      recognitionRef.current?.abort();
    };
    (window as any).__vizvoiceWakeResume = () => {
      if (activeRef.current) {
        pausedRef.current = false;
        startLoop();
      }
    };
    return () => {
      delete (window as any).__vizvoiceWakePause;
      delete (window as any).__vizvoiceWakeResume;
    };
  }, [startLoop]);

  useEffect(() => () => deactivate(), [deactivate]);

  return { state, activate, deactivate, supported };
}
