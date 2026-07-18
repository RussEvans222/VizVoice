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
              styleTokens={{
                // Header - VizVoice Blue (solid color - gradients not supported)
                headerBlockBackground: '#4E79A7',
                headerBlockTextColor: '#ffffff',
                headerBlockIconColor: '#ffffff',
                headerBlockBorderBottomColor: '#76B7B2',
                headerBlockBorderBottomWidth: '3px',
                headerBlockBorderBottomStyle: 'solid',

                // Messages - Blue for user, White for agent
                messageBlockOutboundBackgroundColor: '#4E79A7',
                messageBlockOutboundTextColor: '#ffffff',
                messageBlockInboundBackgroundColor: '#f3f4f6',
                messageBlockInboundTextColor: '#1f2937',
                messageBlockBorderRadius: '12px',

                // Container
                containerBackground: '#ffffff',
                headerBackground: '#4E79A7',

                // Welcome block
                welcomeBlockTextColor: '#4E79A7',

                // FAB (floating action button) - if visible
                fabBackground: '#4E79A7',
                fabForegroundColor: '#ffffff',
              }}
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
