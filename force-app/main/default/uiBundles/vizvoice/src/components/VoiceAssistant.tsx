/**
 * VoiceAssistant - Voice-first UI for VizVoice
 *
 * Uses real Web Speech API for STT/TTS and connects to Agentforce via the
 * generateAiAgentResponse invocable action.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useSpeechInput } from '@/hooks/useSpeechInput';
import { useSpeechOutput } from '@/hooks/useSpeechOutput';
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

const WELCOME_MESSAGE =
  "Hello! I'm VizVoice, your voice assistant for exploring dashboard analytics. " +
  'Press Alt+V or tap the microphone to speak. Ask me questions about transit data, cancellations, and line performance.';

export function VoiceAssistant({
  agentLabel = 'VizVoice',
  analyticsTabId,
  targetEntityState,
  runtimeModeLabel,
}: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      text: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSpokenWelcome = useRef(false);

  const { sendMessage: sendToAgent, ready: agentReady, error: agentError } = useAgentSession();
  const { state: speechState, start: startListening, stop: stopListening, supported: sttSupported } = useSpeechInput();
  const { speak, cancel: cancelSpeech, supported: ttsSupported } = useSpeechOutput();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Speak welcome message on mount (only once)
  useEffect(() => {
    if (!hasSpokenWelcome.current && ttsSupported) {
      hasSpokenWelcome.current = true;
      speak(WELCOME_MESSAGE);
    }
  }, [speak, ttsSupported]);

  // Show agent error if any
  useEffect(() => {
    if (agentError) {
      setError(agentError);
    }
  }, [agentError]);

  const handleVoiceInteraction = useCallback(async () => {
    if (speechState === 'listening') {
      stopListening();
      return;
    }

    if (isProcessing) return;

    setError(null);
    cancelSpeech();

    try {
      log.info('Starting speech recognition...');
      const transcript = await startListening();

      if (!transcript.trim()) {
        log.info('No speech detected');
        return;
      }

      log.info('User said:', transcript);

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: transcript,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsProcessing(true);

      // Send to Agentforce
      const response = await sendToAgent(transcript, {
        analyticsTabId,
        targetEntityState,
      });

      log.info('Agent response:', response.answer);

      // Add agent response
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: response.answer || 'I could not understand that. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);

      // Speak the response
      if (response.answer && ttsSupported) {
        await speak(response.answer);
      }
    } catch (err) {
      log.error('Voice interaction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      // Add error message to chat
      const errorChatMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'agent',
        text: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [
    speechState,
    isProcessing,
    startListening,
    stopListening,
    sendToAgent,
    speak,
    cancelSpeech,
    analyticsTabId,
    targetEntityState,
    ttsSupported,
  ]);

  // Keyboard shortcut: Alt+V to toggle listening
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

  const getStatusText = () => {
    if (!sttSupported) return 'Speech recognition not supported';
    if (!agentReady) return 'Connecting to agent...';
    if (speechState === 'listening') return 'Listening...';
    if (speechState === 'processing' || isProcessing) return 'Processing...';
    return 'Press Alt+V or tap mic to speak';
  };

  const isListening = speechState === 'listening';
  const isDisabled = !sttSupported || !agentReady || isProcessing;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h1 className="text-white font-semibold">{agentLabel}</h1>
        </div>
        <div className="flex items-center gap-2">
          {runtimeModeLabel && (
            <span className="text-white/90 text-xs bg-white/20 px-2 py-1 rounded">
              {runtimeModeLabel}
            </span>
          )}
          {!sttSupported && (
            <span className="text-white/70 text-xs bg-red-500/30 px-2 py-1 rounded">
              STT unsupported
            </span>
          )}
          {!ttsSupported && (
            <span className="text-white/70 text-xs bg-yellow-500/30 px-2 py-1 rounded">
              TTS unsupported
            </span>
          )}
          <span className="text-white/70 text-xs">Voice Assistant</span>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Screen reader instructions banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <p className="text-sm text-blue-900">
          <strong>Accessibility:</strong> Press Alt+V to activate voice assistant.
          Ask questions about dashboard data and receive spoken answers.
          Optimized for screen readers—responses use clear, descriptive language without visual references.
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
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <time
                className={`text-xs mt-1 block ${
                  message.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
                dateTime={message.timestamp.toISOString()}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice control */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleVoiceInteraction}
            disabled={isDisabled}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : isDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
            aria-pressed={isListening}
          >
            {isListening ? (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2} />
              </svg>
            ) : isProcessing ? (
              <svg
                className="w-8 h-8 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
          <p className="text-sm text-slate-600" aria-live="polite">
            {getStatusText()}
          </p>
          <p className="text-xs text-slate-400">Keyboard: Alt+V</p>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
