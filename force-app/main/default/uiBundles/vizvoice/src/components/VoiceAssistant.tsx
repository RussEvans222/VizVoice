/**
 * VoiceAssistant - Voice-first UI for VizVoice
 *
 * Hands-free by default: the assistant listens continuously in the background
 * for the wake phrase "Hey VizVoice" — no button press required. Once activated
 * it records the user's question, sends it to Agentforce, and speaks the answer.
 * A text input is available as a fallback for any environment where the mic is
 * unavailable or the user prefers typing.
 */

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
  "Say \"Hey VizVoice\" at any time to ask a question — no button needed. " +
  "You can also type below. Ask me about cancellations, delays, ridership, satisfaction, or incidents on any line.";

const SILENCE_RESPONSE = "I didn't catch that. Please say \"Hey VizVoice\" and then your question.";

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
  const textInputRef = useRef<HTMLInputElement>(null);

  const { sendMessage: sendToAgent, ready: agentReady, error: agentError } = useAgentSession();
  const { state: speechState, interimTranscript, start: startListening, stop: stopListening, supported: sttSupported } = useSpeechInput();
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

  // Core: send a message (utterance or typed text) to the agent and speak reply
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
      // Persist sessionId across page reloads so conversations survive refresh
      const storedSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
      log.info('Sending to agent, sessionId =', storedSessionId ?? 'new');

      const response = await sendToAgent(utterance, { analyticsTabId, targetEntityState });

      // Persist the new sessionId returned by the agent
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
        await speak(response.answer);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      const errorChatMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'agent',
        text: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
      if (ttsSupported) speak(`Sorry, I encountered an error. ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, cancelSpeech, sendToAgent, analyticsTabId, targetEntityState, speak, ttsSupported]);

  // Voice interaction — called by wake word OR Alt+V button
  const handleVoiceInteraction = useCallback(async () => {
    if (speechState === 'listening') { stopListening(); return; }
    if (isProcessing) return;

    setError(null);
    cancelSpeech();

    try {
      log.info('Starting speech recognition...');
      const transcript = await startListening();

      if (!transcript.trim()) {
        // Silence — tell the user audibly
        const silMsg: Message = {
          id: `silence-${Date.now()}`,
          role: 'agent',
          text: SILENCE_RESPONSE,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, silMsg]);
        if (ttsSupported) speak(SILENCE_RESPONSE);
        return;
      }

      await handleQuery(transcript);
    } catch (err) {
      log.error('Voice interaction error:', err);
    }
  }, [speechState, isProcessing, startListening, stopListening, cancelSpeech, handleQuery, speak, ttsSupported]);

  // Wake word — fires when "Hey VizVoice" is detected
  const handleWake = useCallback(() => {
    log.info('Wake word detected');
    // Brief earcon-like spoken cue then immediately start recording
    if (ttsSupported) {
      const utterance = new SpeechSynthesisUtterance('Listening');
      utterance.volume = 0.6;
      utterance.onend = () => handleVoiceInteraction();
      window.speechSynthesis.speak(utterance);
    } else {
      handleVoiceInteraction();
    }
  }, [ttsSupported, handleVoiceInteraction]);

  const { state: wakeState, activate: activateWake, deactivate: deactivateWake, supported: wakeSupported } = useWakeWord(handleWake);

  // Start the wake word listener automatically on mount
  useEffect(() => {
    if (wakeSupported) activateWake();
    return () => deactivateWake();
  }, [wakeSupported, activateWake, deactivateWake]);

  // Alt+V keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handleVoiceInteraction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleVoiceInteraction]);

  // Text input submit
  const handleTextSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text) return;
    setTextInput('');
    await handleQuery(text);
  }, [textInput, handleQuery]);

  const getStatusText = () => {
    if (!sttSupported) return 'Voice not supported in this browser — use the text box below';
    if (!agentReady) return 'Connecting to agent…';
    if (speechState === 'listening') return 'Listening… speak your question';
    if (speechState === 'processing' || isProcessing) return 'Processing…';
    if (wakeState === 'listening') return 'Say "Hey VizVoice" to ask a question';
    return 'Say "Hey VizVoice" or press Alt+V';
  };

  const isListening = speechState === 'listening';
  const isDisabled = !sttSupported || !agentReady || isProcessing;

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
          {/* Wake word status indicator */}
          {wakeSupported && (
            <span
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                wakeState === 'listening' ? 'bg-green-500/30 text-green-100' : 'bg-white/10 text-white/60'
              }`}
              aria-live="polite"
              aria-label={wakeState === 'listening' ? 'Wake word active — say Hey VizVoice' : 'Wake word inactive'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${wakeState === 'listening' ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`} aria-hidden="true" />
              {wakeState === 'listening' ? 'Wake word on' : 'Wake word off'}
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

      {/* Accessibility instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <p className="text-sm text-blue-900">
          <strong>Hands-free:</strong> Say <strong>"Hey VizVoice"</strong> at any time — no button needed.
          Keyboard shortcut: <strong>Alt+V</strong>. Or type your question below.
        </p>
      </div>

      {/* Messages */}
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

        {/* Interim transcript — shows what the mic is hearing in real time */}
        {isListening && interimTranscript && (
          <div className="flex justify-end" aria-live="polite" aria-label="Partial transcript">
            <div className="max-w-[85%] rounded-lg px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 italic text-sm">
              {interimTranscript}…
            </div>
          </div>
        )}

        {/* Processing indicator */}
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

      {/* Voice control + text input */}
      <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">

        {/* Mic button + status */}
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

        {/* Text fallback input */}
        <form onSubmit={handleTextSubmit} className="flex gap-2" aria-label="Type a question">
          <input
            ref={textInputRef}
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
