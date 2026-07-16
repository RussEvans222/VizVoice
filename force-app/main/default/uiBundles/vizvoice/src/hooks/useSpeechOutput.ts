import { useCallback, useRef } from 'react';
import { VISUAL_METAPHORS } from '@/lib/constants';
import { EARCON_END_HZ } from './useSpeechInput';

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
    // safe to ignore
  }
}

function checkForVisualMetaphors(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of VISUAL_METAPHORS) {
    if (lower.includes(phrase)) {
      console.warn(`[VizVoice] Visual metaphor detected in agent response: "${phrase}"`);
    }
  }
}

export interface UseSpeechOutputReturn {
  speak: (text: string) => Promise<void>;
  cancel: () => void;
  supported: boolean;
}

// Voices load asynchronously in Chrome — getVoices() is empty on first call and
// populates later via the `voiceschanged` event. Resolve once they're available
// so the first utterance uses the good voice instead of the robotic default.
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    // Fallback: some browsers never fire the event — resolve after a short wait.
    window.setTimeout(done, 1000);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Neural') || v.name.includes('Premium') || v.localService === false),
    ) ??
    voices.find((v) => v.lang.startsWith('en-US')) ??
    voices[0]
  );
}

export function useSpeechOutput(): UseSpeechOutputReturn {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Guards against overlapping speak() calls stacking utterances (each cancel()
  // + speak() can make an in-flight utterance appear to "restart").
  const speakingRef = useRef(false);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const cancel = useCallback(() => {
    speakingRef.current = false;
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!supported) return;
      checkForVisualMetaphors(text);

      // Cancel anything currently queued/speaking before starting the new one,
      // and mark ourselves as the active speaker so a stale onend can't resolve
      // out from under us.
      window.speechSynthesis.cancel();
      speakingRef.current = true;

      const voices = await getVoicesAsync();
      // A newer speak() may have superseded us while voices were loading.
      if (!speakingRef.current) return;

      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        const preferred = pickVoice(voices);
        if (preferred) utterance.voice = preferred;

        const finish = () => {
          if (utteranceRef.current === utterance) {
            utteranceRef.current = null;
            speakingRef.current = false;
          }
          resolve();
        };

        utterance.onend = () => {
          playEarcon(EARCON_END_HZ, 120);
          finish();
        };
        utterance.onerror = finish;

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    },
    [supported],
  );

  return { speak, cancel, supported };
}
