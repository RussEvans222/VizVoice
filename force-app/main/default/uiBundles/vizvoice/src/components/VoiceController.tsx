import { Mic, MicOff, Loader2 } from 'lucide-react';
import { SpeechInputState } from '@/hooks/useSpeechInput';

interface VoiceControllerProps {
  state: SpeechInputState;
  agentReady: boolean;
  onActivate: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

// macOS has no Alt key — the shortcut is Option (⌥). Detect the platform so the
// on-screen hint matches the user's actual keyboard.
const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const SHORTCUT_HINT = IS_MAC ? '⌥ Option + V' : 'Alt + V';

const LABEL: Record<SpeechInputState, string> = {
  idle: `Activate microphone (${SHORTCUT_HINT})`,
  listening: 'Listening… click to stop',
  processing: 'Processing…',
};

const STATUS_TEXT: Record<SpeechInputState, string> = {
  idle: 'Ready',
  listening: 'Listening',
  processing: 'Processing',
};

export function VoiceController({
  state,
  agentReady,
  onActivate,
  buttonRef,
}: VoiceControllerProps) {
  const disabled = !agentReady || state === 'processing';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        ref={buttonRef}
        onClick={onActivate}
        disabled={disabled}
        aria-label={LABEL[state]}
        aria-pressed={isListening}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0176D3]
          ${isListening ? 'bg-red-500 animate-pulse shadow-lg shadow-red-200' : 'bg-[#0176D3] hover:bg-[#0265B3] shadow-lg shadow-blue-100'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        ) : isListening ? (
          <MicOff className="w-7 h-7 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </button>

      <p className="text-xs text-slate-500" aria-live="polite">
        {!agentReady ? 'Connecting to agent…' : STATUS_TEXT[state]}
      </p>

      <p className="text-xs text-slate-400">{SHORTCUT_HINT} to toggle</p>
    </div>
  );
}
