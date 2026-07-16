import { useCallback, useState } from 'react';
import { AgentforceConversationClient } from '@/components/AgentforceConversationClient';
import { TableauEmbed } from '@/components/TableauEmbed';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { AGENT_ID, ENABLE_ACC_FALLBACK } from '@/lib/constants';
import { log } from '@/lib/logger';

export default function VizVoicePage() {
  const [analyticsTabId, setAnalyticsTabId] = useState<string | undefined>();

  const handleDashboardLoad = useCallback((tabId: string, label: string) => {
    setAnalyticsTabId(tabId);
    log.info('Dashboard loaded:', { tabId, label });
  }, []);

  return (
    <div className="flex h-full w-full bg-white">
      <main className="flex-[7] min-w-0 relative bg-slate-100">
        <TableauEmbed onLoad={handleDashboardLoad} className="absolute inset-0" />
      </main>
      <aside
        className="flex-[3] min-w-0 flex flex-col border-l border-slate-200 bg-white"
        aria-label="VizVoice voice assistant"
      >
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              ENABLE_ACC_FALLBACK
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            Mode: {ENABLE_ACC_FALLBACK ? 'ACC Fallback' : 'Invocable Action'}
          </span>
        </div>
        {ENABLE_ACC_FALLBACK ? (
          <div className="h-full w-full">
            <AgentforceConversationClient
              agentId={AGENT_ID}
              agentLabel="VizVoice"
              inline
              width="100%"
              height="100%"
            />
          </div>
        ) : (
          <VoiceAssistant
            agentLabel="VizVoice"
            analyticsTabId={analyticsTabId}
            runtimeModeLabel="Invocable Action"
          />
        )}
      </aside>
    </div>
  );
}
