import { useCallback, useRef, useState } from 'react';
import { createDataSDK } from '@salesforce/platform-sdk';
import { TARGET_ENTITY_TYPE, TARGET_ENTITY_ID } from '@/lib/constants';
import { log } from '@/lib/logger';

export interface SendMessageOptions {
  analyticsTabId?: string;
  targetEntityState?: string;
}

export interface AgentResponse {
  answer: string;
  visualizationMetadata?: string;
}

export interface UseAgentSessionReturn {
  ready: boolean;
  error: string | null;
  sendMessage: (utterance: string, opts?: SendMessageOptions) => Promise<AgentResponse>;
}


// A UI Bundle on *.salesforce.app has NO org session cookie — a raw relative
// fetch 401s. The Data SDK (@salesforce/platform-sdk) is the supported bridge:
// its `fetch` resolves the org base URL and injects auth + CSRF automatically.
// We memoize the SDK's fetch so we initialize the SDK once per app lifetime.
let sdkFetchPromise: Promise<typeof fetch> | null = null;

export async function getPlatformFetch(): Promise<typeof fetch> {
  if (!sdkFetchPromise) {
    sdkFetchPromise = (async () => {
      const sdk = await createDataSDK();
      if (!sdk.fetch) {
        throw new Error('Data SDK fetch is unavailable on this surface.');
      }
      log.info('getPlatformFetch: using Data SDK authenticated fetch');
      return sdk.fetch.bind(sdk);
    })();
  }
  return sdkFetchPromise;
}

function buildContextPreamble(variables: Record<string, string>): string {
  if (!variables || Object.keys(variables).length === 0) return '';
  const parts: string[] = [];
  if (variables.targetEntityId) parts.push(`Dashboard: ${variables.targetEntityId}`);
  if (variables.analyticsTabId) parts.push(`Tab: ${variables.analyticsTabId}`);
  if (variables.targetEntityState) parts.push(`Current filters: ${variables.targetEntityState}`);
  return parts.length > 0 ? `[Context — ${parts.join('; ')}]` : '';
}

export function useAgentSession(): UseAgentSessionReturn {
  // The in-org agent bridge is stateless from the client's side: there is no
  // pre-flight "create session" call. The server mints a sessionId on the first
  // turn and echoes it back; we reuse it on every subsequent turn for continuity.
  const sessionIdRef = useRef<string | null>(null);
  // Auth is the ambient *.salesforce.app session cookie, so we are ready at once.
  const [ready] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (utterance: string, opts: SendMessageOptions = {}): Promise<AgentResponse> => {
      const sfFetch = await getPlatformFetch();

      const variables: Record<string, string> = {};
      if (TARGET_ENTITY_ID) variables.targetEntityId = TARGET_ENTITY_ID;
      if (TARGET_ENTITY_TYPE) variables.targetEntityType = TARGET_ENTITY_TYPE;
      if (opts.analyticsTabId) variables.analyticsTabId = opts.analyticsTabId;
      if (opts.targetEntityState) variables.targetEntityState = opts.targetEntityState;

      const sessionId = sessionIdRef.current;
      log.info('sendMessage:', utterance, '| sessionId =', sessionId, '| variables =', variables);

      // Call the generateAiAgentResponse invocable action directly via the Actions API.
      // UI Bundles CAN call invocable actions via the Data SDK authenticated fetch.
      const contextPreamble = buildContextPreamble(variables);
      const userMessage = contextPreamble
        ? `[Context — ${Object.entries(variables).map(([k,v]) => `${k}: ${v}`).join('; ')}]\n\n${utterance}`
        : utterance;
      const brevityDirective =
        '[Answer for a voice assistant: lead with the single most important number, ' +
        'keep it to at most 2 short sentences, no lists or markdown, and never use ' +
        'visual phrases like "as you can see" or "the chart shows".]';
      const fullMessage = `${brevityDirective}\n\n${userMessage}`;

      const input: Record<string, unknown> = { userMessage: fullMessage };
      if (sessionId) input.sessionId = sessionId;

      const res = await sfFetch('/services/data/v64.0/actions/custom/generateAiAgentResponse/VizVoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: [input]
        }),
      });

      log.info('sendMessage: response status =', res.status);

      if (!res.ok) {
        const text = await res.text();
        log.error('sendMessage: failed body =', text);
        setError(`Agent message failed (${res.status})`);
        throw new Error(`Agent message failed (${res.status}): ${text}`);
      }

      const rawBody = await res.json();
      log.debug('sendMessage: raw response =', rawBody);

      // Parse the invocable action response:
      // [{ outputValues: { sessionId: "...", agentResponse: "{\"type\":\"Text\",\"value\":\"...\"}" } }]
      if (!Array.isArray(rawBody) || rawBody.length === 0) {
        throw new Error('Invalid agent response format');
      }

      const outputValues = rawBody[0].outputValues || {};
      const newSessionId = outputValues.sessionId;
      if (newSessionId) sessionIdRef.current = newSessionId;

      // agentResponse is a nested JSON string — unwrap it
      let answer = '';
      const agentResponse = outputValues.agentResponse;
      if (agentResponse) {
        try {
          const parsed = JSON.parse(agentResponse);
          answer = parsed.value || parsed.message || agentResponse;
        } catch {
          answer = String(agentResponse);
        }
      }

      log.info('sendMessage: answer =', answer.slice(0, 120));
      return { answer };
    },
    [],
  );

  return { ready, error, sendMessage };
}
