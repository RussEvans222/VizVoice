import { useCallback, useRef, useState } from 'react';
import { createDataSDK } from '@salesforce/platform-sdk';
import {
  AGENT_API_NAME,
  TARGET_ENTITY_TYPE,
  TARGET_ENTITY_ID,
} from '@/lib/constants';
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

interface ActionInvokeResult {
  isSuccess?: boolean;
  errors?: Array<{ message?: string; code?: string }>;
  outputValues?: {
    sessionId?: string;
    agentResponse?: string;
  };
}

function getConfigurationError(): string | null {
  if (!AGENT_API_NAME?.trim()) {
    return 'Missing AGENT_API_NAME configuration. Set a valid Agent API Name in constants.ts.';
  }
  return null;
}

function getInvocableActionEndpoint(): string {
  return `/services/data/v64.0/actions/custom/generateAiAgentResponse/${encodeURIComponent(
    AGENT_API_NAME,
  )}`;
}


// A UI Bundle on *.salesforce.app has NO org session cookie — a raw relative
// fetch 401s. The Data SDK (@salesforce/platform-sdk) is the supported bridge:
// its `fetch` resolves the org base URL and injects auth + CSRF automatically.
// We memoize the SDK's fetch so we initialize the SDK once per app lifetime.
let sdkFetchPromise: Promise<typeof fetch> | null = null;

async function createPlatformFetch(): Promise<typeof fetch> {
  const sdk = await createDataSDK();
  if (!sdk.fetch) {
    throw new Error('Data SDK fetch is unavailable on this surface.');
  }
  log.info('getPlatformFetch: using Data SDK authenticated fetch');
  return sdk.fetch.bind(sdk);
}

export async function getPlatformFetch(forceRefresh = false): Promise<typeof fetch> {
  if (!sdkFetchPromise || forceRefresh) {
    sdkFetchPromise = createPlatformFetch();
  }
  return sdkFetchPromise;
}

function isInvalidSessionResponse(bodyText: string): boolean {
  return (
    bodyText.includes('INVALID_SESSION_ID') ||
    bodyText.toLowerCase().includes('session expired or invalid')
  );
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
  const configurationError = getConfigurationError();
  // Auth is the ambient *.salesforce.app session cookie, so we are ready at once.
  const [ready] = useState(!configurationError);
  const [error, setError] = useState<string | null>(configurationError);

  const sendMessage = useCallback(
    async (utterance: string, opts: SendMessageOptions = {}): Promise<AgentResponse> => {
      const configError = getConfigurationError();
      if (configError) {
        setError(configError);
        throw new Error(configError);
      }

      let sfFetch = await getPlatformFetch();

      const variables: Record<string, string> = {};
      if (TARGET_ENTITY_ID) variables.targetEntityId = TARGET_ENTITY_ID;
      if (TARGET_ENTITY_TYPE) variables.targetEntityType = TARGET_ENTITY_TYPE;
      if (opts.analyticsTabId) variables.analyticsTabId = opts.analyticsTabId;
      if (opts.targetEntityState) variables.targetEntityState = opts.targetEntityState;

      const sessionId = sessionIdRef.current;
      log.info('sendMessage:', utterance, '| sessionId =', sessionId, '| variables =', variables);

      // Call the generateAiAgentResponse invocable action directly via the Actions API.
      // UI Bundles CAN call invocable actions via the Data SDK authenticated fetch.
      const userMessage = buildContextPreamble(variables)
        ? `[Context — ${Object.entries(variables).map(([k,v]) => `${k}: ${v}`).join('; ')}]\n\n${utterance}`
        : utterance;
      const brevityDirective =
        '[Answer for a voice assistant: lead with the single most important number, ' +
        'keep it to at most 2 short sentences, no lists or markdown, and never use ' +
        'visual phrases like "as you can see" or "the chart shows".]';
      const fullMessage = `${brevityDirective}\n\n${userMessage}`;

      const input: Record<string, unknown> = { userMessage: fullMessage };
      if (sessionId) input.sessionId = sessionId;

      const endpoint = getInvocableActionEndpoint();
      let res = await sfFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: [input]
        }),
      });

      log.info('sendMessage: response status =', res.status);

      if (!res.ok) {
        let text = await res.text();
        if (res.status === 401 && isInvalidSessionResponse(text)) {
          log.warn('sendMessage: INVALID_SESSION_ID detected, refreshing session and retrying once.');
          sfFetch = await getPlatformFetch(true);
          res = await sfFetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inputs: [input]
            }),
          });
          if (!res.ok) {
            text = await res.text();
            const message =
              'Your Salesforce session expired. Reload the page and sign in again, then retry.';
            setError(message);
            throw new Error(`${message} Response: ${text}`);
          }
          log.info('sendMessage: retry response status =', res.status);
        } else {
          log.error('sendMessage: failed body =', text);
          const message =
            `Agent request failed (${res.status}). ` +
            `Verify AGENT_API_NAME "${AGENT_API_NAME}" and action availability in org.`;
          setError(message);
          throw new Error(`${message} Response: ${text}`);
        }
      }

      const rawBody = await res.json();
      log.debug('sendMessage: raw response =', rawBody);

      // Parse the invocable action response:
      // [{ outputValues: { sessionId: "...", agentResponse: "{\"type\":\"Text\",\"value\":\"...\"}" } }]
      if (!Array.isArray(rawBody) || rawBody.length === 0) {
        const message = 'Invalid agent response format from generateAiAgentResponse.';
        setError(message);
        throw new Error(message);
      }

      const firstResult = rawBody[0] as ActionInvokeResult;
      if (firstResult.isSuccess === false) {
        const errorText =
          firstResult.errors?.map((e) => e.message || e.code).filter(Boolean).join('; ') ||
          'Unknown agent invocation error';
        const message = `Agent invocation failed: ${errorText}`;
        setError(message);
        throw new Error(message);
      }

      const outputValues = firstResult.outputValues || {};
      const newSessionId = outputValues.sessionId;
      if (newSessionId) sessionIdRef.current = newSessionId;

      // agentResponse is a nested JSON string — unwrap it
      let answer = '';
      const agentResponse = outputValues.agentResponse;
      if (agentResponse) {
        try {
          const parsed = JSON.parse(agentResponse);
          answer = parsed.value || parsed.message || parsed.error || agentResponse;
        } catch {
          answer = String(agentResponse);
        }
      }

      if (!answer.trim()) {
        const message = 'Agent returned an empty response.';
        setError(message);
        throw new Error(message);
      }

      log.info('sendMessage: answer =', answer.slice(0, 120));
      return { answer };
    },
    [],
  );

  return { ready, error, sendMessage };
}
