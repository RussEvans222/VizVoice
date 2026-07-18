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
import { useMicrophonePermission } from '@/hooks/useMicrophonePermission';
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
  continuousMode?: boolean; // Auto-listen after agent response
}

const WELCOME_MESSAGE =
  "Hello! I'm VizVoice, your voice assistant for exploring dashboard analytics. " +
  'Press Alt+V or tap the microphone to speak. Ask me questions about transit data, cancellations, and line performance.';

export function VoiceAssistant({
  agentLabel = 'VizVoice',
  analyticsTabId,
  targetEntityState,
  runtimeModeLabel,
  continuousMode = true, // Default to continuous voice mode
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
  const [isContinuousActive, setIsContinuousActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSpokenWelcome = useRef(false);
  const continuousModeTimeoutRef = useRef<number | null>(null);

  const { sendMessage: sendToAgent, ready: agentReady, error: agentError } = useAgentSession();
  const { state: speechState, start: startListening, stop: stopListening, supported: sttSupported } = useSpeechInput();
  const { speak, cancel: cancelSpeech, supported: ttsSupported } = useSpeechOutput();
  const { state: micPermission, request: requestMicPermission } = useMicrophonePermission();

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

  const handleVoiceInteraction = useCallback(async (fromContinuousMode = false) => {
    // If user manually stops, exit continuous mode
    if (speechState === 'listening') {
      stopListening();
      setIsContinuousActive(false);
      if (continuousModeTimeoutRef.current) {
        clearTimeout(continuousModeTimeoutRef.current);
        continuousModeTimeoutRef.current = null;
      }
      return;
    }

    if (isProcessing) return;

    setError(null);
    cancelSpeech();

    try {
      // Request microphone permission if not granted
      if (micPermission !== 'granted') {
        log.info('Requesting microphone permission...');
        try {
          await requestMicPermission();
        } catch (permErr) {
          log.error('Microphone permission denied:', permErr);
          throw new Error(
            'Microphone access denied. Please allow microphone permission in your browser settings and try again.'
          );
        }
      }

      log.info('Starting speech recognition...');
      const transcript = await startListening();

      if (!transcript.trim()) {
        log.info('No speech detected');

        // In continuous mode, if no speech detected, stop continuous loop
        if (fromContinuousMode) {
          setIsContinuousActive(false);
        }
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

      // In continuous mode, automatically start listening again after agent speaks
      if (continuousMode && !fromContinuousMode) {
        setIsContinuousActive(true);
        // Wait a moment after TTS finishes, then start listening again
        continuousModeTimeoutRef.current = window.setTimeout(() => {
          log.info('Continuous mode: auto-listening for follow-up...');
          handleVoiceInteraction(true);
        }, 500); // Small delay after TTS finishes
      } else if (fromContinuousMode && continuousMode) {
        // Continue the loop
        continuousModeTimeoutRef.current = window.setTimeout(() => {
          log.info('Continuous mode: waiting for next input...');
          handleVoiceInteraction(true);
        }, 500);
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

      // Stop continuous mode on error
      setIsContinuousActive(false);
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
    continuousMode,
    micPermission,
    requestMicPermission,
  ]);

  // Cleanup continuous mode timeout on unmount
  useEffect(() => {
    return () => {
      if (continuousModeTimeoutRef.current) {
        clearTimeout(continuousModeTimeoutRef.current);
      }
    };
  }, []);

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
    if (speechState === 'listening') return isContinuousActive ? 'Listening (continuous mode)...' : 'Listening...';
    if (speechState === 'processing' || isProcessing) return 'Processing...';
    if (isContinuousActive) return 'Continuous mode active - speak anytime';
    return continuousMode ? 'Press Alt+V to start conversation' : 'Press Alt+V or tap mic to speak';
  };

  const isListening = speechState === 'listening';
  const isDisabled = !sttSupported || !agentReady || isProcessing;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="relative px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                <svg
                  className="w-6 h-6 text-white"
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
              {agentReady && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white"
                     aria-label="Agent ready" />
              )}
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">{agentLabel}</h1>
              <p className="text-indigo-100 text-xs">Voice Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {continuousMode && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5 ${
                isContinuousActive
                  ? 'bg-emerald-500/90 text-white border-emerald-400 animate-pulse'
                  : 'bg-white/15 backdrop-blur-sm text-white border-white/20'
              }`}>
                {isContinuousActive && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
                {isContinuousActive ? 'Continuous' : 'Continuous Mode'}
              </span>
            )}
            {runtimeModeLabel && (
              <span className="text-xs bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-medium border border-white/20">
                {runtimeModeLabel}
              </span>
            )}
            {!sttSupported && (
              <span className="text-xs bg-red-500/80 text-white px-2.5 py-1 rounded-full">
                STT unavailable
              </span>
            )}
            {!ttsSupported && (
              <span className="text-xs bg-yellow-500/80 text-white px-2.5 py-1 rounded-full">
                TTS unavailable
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700 font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Microphone permission prompt */}
      {micPermission === 'denied' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-800 font-medium">
              Microphone access denied. Please enable microphone permissions in your browser settings to use voice features.
            </span>
          </div>
        </div>
      )}

      {/* Accessibility banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100 px-6 py-3 shadow-sm">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-indigo-900 leading-relaxed">
            <p>
              <strong className="font-semibold">Accessibility:</strong> Press <kbd className="px-1.5 py-0.5 bg-white/60 rounded text-xs font-mono border border-indigo-200">Alt+V</kbd> to activate voice assistant.
              Ask questions about dashboard data and receive spoken answers. Optimized for screen readers with clear, descriptive language.
            </p>
            {micPermission === 'prompt' && (
              <p className="mt-2 text-xs text-indigo-700">
                ℹ️ First click will request microphone permission.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
        role="log"
        aria-label="Conversation history"
        aria-live="assertive"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <time
                className={`text-xs mt-1.5 block ${
                  message.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
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
      <div className="border-t border-slate-200 bg-white px-6 py-6 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          {/* Microphone button */}
          <div className="relative">
            <button
              onClick={() => handleVoiceInteraction()}
              disabled={isDisabled}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg ${
                isListening
                  ? 'bg-gradient-to-br from-red-500 to-red-600 focus:ring-red-300 animate-pulse shadow-red-500/50'
                  : isDisabled
                  ? 'bg-slate-300 cursor-not-allowed shadow-slate-300/50'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-300 shadow-indigo-500/50 hover:scale-105'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
              aria-pressed={isListening}
            >
              {/* Listening pulse rings */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
                </>
              )}

              {isListening ? (
                <svg
                  className="w-10 h-10 text-white relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2.5} />
                </svg>
              ) : isProcessing ? (
                <svg
                  className="w-10 h-10 text-white animate-spin"
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
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Status text */}
          <div className="text-center">
            <p className="text-base font-medium text-slate-700" aria-live="polite">
              {getStatusText()}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono border border-slate-300">Alt+V</kbd>
              to activate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
