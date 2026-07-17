import { useState, useCallback, useEffect, useRef } from 'react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useSpeechInput } from '@/hooks/useSpeechInput';
import { useSpeechOutput } from '@/hooks/useSpeechOutput';
import { useWakeWord } from '@/hooks/useWakeWord';
import { log } from '@/lib/logger';

interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface VoiceAssistantProps {
  agentLabel?: string;
  analyticsTabId?: string;
  targetEntityState?: string;
  runtimeModeLabel?: string;
}

const SESSION_STORAGE_KEY = 'vizvoice_session_id';

const WELCOME_MESSAGE =
  "Hello! I'm VizVoice, your voice assistant for transit data. " +
  "Just say Hey VizVoice followed by your question at any time. " +
  "You can also type your question below.";

const MIC_BLOCKED_MESSAGE =
  "Microphone access is needed for hands-free use. " +
  "Please allow microphone access in your browser, then reload the page.";

const SILENCE_RESPONSE =
  "I didn't catch anything. Please say \"Hey VizVoice\" followed by your question.";

export function VoiceAssistant({
  agentLabel = 'VizVoice',
  analyticsTabId,
  targetEntityState,
  runtimeModeLabel,
}: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'agent', text: WELCOME_MESSAGE, timestamp: new Date() },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSpokenWelcome = useRef(false);

  // Ref so handleWake always calls the latest handleVoiceInteraction — avoids
  // stale closure: useWakeWord captures handleWake once at registration, but
  // voiceInteractionRef always points to the current version.
  const voiceInteractionRef = useRef<() => void>(() => {});

  const { sendMessage: sendToAgent, ready: agentReady, error: agentError } = useAgentSession();
  const {
    state: speechState,
    interimTranscript,
    start: startListening,
    stop: stopListening,
    supported: sttSupported,
  } = useSpeechInput();
  const { speak, cancel: cancelSpeech, supported: ttsSupported } = useSpeechOutput();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!hasSpokenWelcome.current && ttsSupported) {
      hasSpokenWelcome.current = true;
      speak(WELCOME_MESSAGE);
    }
  }, [speak, ttsSupported]);

  useEffect(() => {
    if (agentError) setError(agentError);
  }, [agentError]);

  // Core: send a query to the agent and speak its reply
  const handleQuery = useCallback(async (utterance: string) => {
    if (!utterance.trim() || isProcessing) return;
    setError(null);
    cancelSpeech();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: utterance,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const storedSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
      log.info('Sending to agent, sessionId =', storedSessionId ?? 'new');

      const response = await sendToAgent(utterance, { analyticsTabId, targetEntityState });

      if ((response as any).sessionId) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, (response as any).sessionId);
      }

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: response.answer || 'I could not understand that. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);

      if (response.answer && ttsSupported) {
        // Wait for TTS to finish before resuming wake word listener — avoids
        // the assistant hearing its own spoken reply as a "Hey VizVoice"
        await speak(response.answer);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      const errMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'agent',
        text: `Sorry, I encountered an error: ${msg}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
      if (ttsSupported) await speak(`Sorry, I encountered an error. ${msg}`);
    } finally {
      setIsProcessing(false);
      // Resume wake word listening after TTS + processing are both done
      resumeWakeRef.current?.();
    }
  }, [isProcessing, cancelSpeech, sendToAgent, analyticsTabId, targetEntityState, speak, ttsSupported]);

  // Called when wake word fires OR mic button is pressed
  const handleVoiceInteraction = useCallback(async () => {
    if (speechState === 'listening') { stopListening(); return; }
    if (isProcessing) return;

    setError(null);
    cancelSpeech();

    try {
      log.info('Starting speech recognition…');
      const transcript = await startListening();

      if (!transcript.trim()) {
        const silMsg: Message = {
          id: `silence-${Date.now()}`,
          role: 'agent',
          text: SILENCE_RESPONSE,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, silMsg]);
        if (ttsSupported) {
          await speak(SILENCE_RESPONSE);
        }
        // Resume wake word after silence message
        resumeWakeRef.current?.();
        return;
      }

      await handleQuery(transcript);
      // handleQuery calls resumeWakeRef itself when done
    } catch (err) {
      log.error('Voice interaction error:', err);
      resumeWakeRef.current?.();
    }
  }, [speechState, isProcessing, startListening, stopListening, cancelSpeech, handleQuery, speak, ttsSupported]);

  // Keep voiceInteractionRef in sync with latest version
  useEffect(() => {
    voiceInteractionRef.current = handleVoiceInteraction;
  }, [handleVoiceInteraction]);

  // Stable handleWake — reads the latest handler via ref at call time
  const handleWake = useCallback(() => {
    log.info('Wake word detected — starting voice interaction');
    // pause() already called inside useWakeWord before firing onWake;
    // main STT has the 350ms delay inside useSpeechInput to finish mic release
    voiceInteractionRef.current();
  }, []);

  const {
    state: wakeState,
    activate: activateWake,
    deactivate: deactivateWake,
    pause: pauseWake,
    resume: resumeWake,
    supported: wakeSupported,
  } = useWakeWord(handleWake);

  // Stable ref so handleQuery/handleVoiceInteraction can call resumeWake
  // without capturing a stale version of it
  const resumeWakeRef = useRef<(() => void) | null>(null);
  resumeWakeRef.current = resumeWake;

  // Pause wake word as soon as main STT starts so two recognizers never fight
  useEffect(() => {
    if (speechState === 'listening') {
      pauseWake();
    }
  }, [speechState, pauseWake]);

  // Chrome requires a user gesture before SpeechRecognition.start() works.
  // We catch the very first interaction on the page — any keydown, click, or
  // touch — and use that event to activate the wake word listener.
  // A blind user pressing Tab to navigate counts; they never need to find
  // a specific button. The listener removes itself after the first fire.
  useEffect(() => {
    if (!wakeSupported) return;

    const activate = () => {
      activateWake();
      window.removeEventListener('keydown', activate, true);
      window.removeEventListener('click',   activate, true);
      window.removeEventListener('touchstart', activate, true);
    };

    window.addEventListener('keydown',    activate, { capture: true, once: true });
    window.addEventListener('click',      activate, { capture: true, once: true });
    window.addEventListener('touchstart', activate, { capture: true, once: true });

    return () => {
      window.removeEventListener('keydown', activate, true);
      window.removeEventListener('click',   activate, true);
      window.removeEventListener('touchstart', activate, true);
      deactivateWake();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeSupported]);

  // Speak the mic-blocked message aloud — blind user hears what to do
  useEffect(() => {
    if (wakeState === 'error' && ttsSupported) {
      speak(MIC_BLOCKED_MESSAGE);
    }
  }, [wakeState, ttsSupported, speak]);

  // Alt+V keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handleVoiceInteraction();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleVoiceInteraction]);

  // Text input submit
  const handleTextSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text) return;
    setTextInput('');
    await handleQuery(text);
  }, [textInput, handleQuery]);

  const isHandsFreeOn = wakeState === 'listening' || wakeState === 'detected';
  const isListening = speechState === 'listening';
  const isDisabled = !sttSupported || !agentReady || isProcessing;

  const getStatusText = () => {
    if (!sttSupported) return 'Voice not supported — use the text box below';
    if (!agentReady) return 'Connecting to agent…';
    if (isListening) return 'Listening… speak your question now';
    if (speechState === 'processing' || isProcessing) return 'Processing…';
    if (isHandsFreeOn) return 'Say "Hey VizVoice" to ask a question';
    return 'Press the mic button or Alt+V to ask a question';
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" aria-hidden="true">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-white font-semibold">{agentLabel}</h1>
        </div>
        <div className="flex items-center gap-2">
          {runtimeModeLabel && (
            <span className="text-white/90 text-xs bg-white/20 px-2 py-1 rounded">{runtimeModeLabel}</span>
          )}
          {/* Wake word status badge */}
          {wakeSupported && (
            <span
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                isHandsFreeOn ? 'bg-green-500/30 text-green-100' : 'bg-white/10 text-white/60'
              }`}
              aria-live="polite"
              aria-label={isHandsFreeOn ? 'Hands-free active — say Hey VizVoice' : 'Hands-free off'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isHandsFreeOn ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`}
                aria-hidden="true"
              />
              {isHandsFreeOn ? 'Hands-free on' : 'Hands-free off'}
            </span>
          )}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm flex items-start justify-between" role="alert">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700 text-lg leading-none" aria-label="Dismiss error">×</button>
        </div>
      )}

      {wakeState === 'error' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-800 text-sm" role="alert">
          Microphone access was denied. Please allow mic access in your browser settings, then reload the page.
        </div>
      )}
      {isHandsFreeOn && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-800 flex items-center justify-between">
          <span>Hands-free active — say <strong>"Hey VizVoice"</strong> to ask a question. Keyboard: <strong>Alt+V</strong>.</span>
          <button
            onClick={deactivateWake}
            className="text-xs text-green-700 underline hover:text-green-900 focus:outline-none"
            aria-label="Turn off hands-free mode"
          >
            Turn off
          </button>
        </div>
      )}

      {/* Conversation log */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Conversation history"
        aria-live="assertive"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-2 ${
              message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <time
                className={`text-xs mt-1 block ${message.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}
                dateTime={message.timestamp.toISOString()}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          </div>
        ))}

        {/* Real-time partial transcript */}
        {isListening && interimTranscript && (
          <div className="flex justify-end" aria-live="polite" aria-label="Partial transcript">
            <div className="max-w-[85%] rounded-lg px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 italic text-sm">
              {interimTranscript}…
            </div>
          </div>
        )}

        {/* Processing dots */}
        {isProcessing && (
          <div className="flex justify-start" role="status" aria-label="Agent is thinking">
            <div className="bg-slate-100 rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true" />
              <span className="sr-only">Agent is thinking</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">

        {/* Mic button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleVoiceInteraction}
            disabled={isDisabled}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : isDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label={isListening ? 'Stop listening (Alt+V)' : 'Start listening (Alt+V)'}
            aria-pressed={isListening}
          >
            {isListening ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2} />
              </svg>
            ) : isProcessing ? (
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <p className="text-xs text-slate-500 text-center" aria-live="polite">{getStatusText()}</p>
        </div>

        {/* Text fallback */}
        <form onSubmit={handleTextSubmit} className="flex gap-2" aria-label="Type a question">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type a question…"
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Type your question to VizVoice"
          />
          <button
            type="submit"
            disabled={isProcessing || !textInput.trim()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send question"
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
}

export default VoiceAssistant;
