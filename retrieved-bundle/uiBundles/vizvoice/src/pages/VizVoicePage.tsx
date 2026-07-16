import { useCallback } from 'react';
import { TableauEmbed } from '@/components/TableauEmbed';
import { AgentforceConversationClient } from '@/components/AgentforceConversationClient';

export default function VizVoicePage() {
  const handleDashboardLoad = useCallback((_tabId: string, _label: string) => {
    // Dashboard context could be passed to agent here if needed
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
        <AgentforceConversationClient
          agentId="0XxgK000001rUH7SAM"
          inline={true}
          width="100%"
          height="100%"
          agentLabel="VizVoice"
        />
      </aside>
    </div>
  );
}
