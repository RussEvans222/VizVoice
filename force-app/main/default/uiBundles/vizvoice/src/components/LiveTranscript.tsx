import { useEffect, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
}

interface LiveTranscriptProps {
  messages: Message[];
  className?: string;
}

export function LiveTranscript({ messages, className = '' }: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="VizVoice conversation transcript"
      aria-relevant="additions"
      className={`overflow-y-auto space-y-3 text-sm ${className}`}
    >
      {messages.length === 0 && (
        <p className="text-slate-400 italic text-xs">Say something to begin. Press Alt+V to activate your microphone.</p>
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-snug ${
              m.role === 'user'
                ? 'bg-[#0176D3] text-white'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <span className="sr-only">{m.role === 'user' ? 'You said: ' : 'VizVoice: '}</span>
            {m.text}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
