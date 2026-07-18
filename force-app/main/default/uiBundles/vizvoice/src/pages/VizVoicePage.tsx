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
    <div className="flex h-full w-full bg-slate-50">
      <main className="flex-[7] min-w-0 relative bg-slate-100 border-r border-slate-200 shadow-lg">
        <TableauEmbed onLoad={handleDashboardLoad} className="absolute inset-0" />
      </main>
      <aside
        className="flex-[3] min-w-0 flex flex-col bg-white shadow-2xl"
        aria-label="VizVoice voice assistant"
      >
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
