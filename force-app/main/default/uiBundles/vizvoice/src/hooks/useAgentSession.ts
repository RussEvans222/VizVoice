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
  answerArtifacts?: string;
}

export interface UseAgentSessionReturn {
  ready: boolean;
  error: string | null;
  sendMessage: (utterance: string, opts?: SendMessageOptions) => Promise<AgentResponse>;
}

function getConfigurationError(): string | null {
  if (!AGENT_API_NAME?.trim()) {
    return 'Missing AGENT_API_NAME configuration. Set a valid Agent API Name in constants.ts.';
  }
  return null;
}

function getInvocableActionEndpoint(): string {
  // Use Apex REST proxy instead of direct action call
  // UI Bundles can't call org APIs directly — they need an authenticated proxy
  return `/services/apexrest/vizvoice/session`;
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

      // Call the Apex REST proxy endpoint — it handles Named Credential auth
      // and forwards to the agent via generateAiAgentResponse action.
      // Apex proxy expects: { message: { role, content }, variables, sessionId }
      const payload: Record<string, unknown> = {
        message: {
          role: 'User',
          content: utterance
        },
        variables
      };
      if (sessionId) payload.sessionId = sessionId;

      const endpoint = getInvocableActionEndpoint();
      let res = await sfFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
            body: JSON.stringify(payload),
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

      // Parse Apex proxy response:
      // { sessionId: "...", message: { role: "Agent", content: "..." } }
      if (!rawBody || typeof rawBody !== 'object') {
        const message = 'Invalid agent response format from proxy.';
        setError(message);
        throw new Error(message);
      }

      const newSessionId = (rawBody as Record<string, unknown>).sessionId;
      if (newSessionId && typeof newSessionId === 'string') {
        sessionIdRef.current = newSessionId;
      }

      const message = (rawBody as Record<string, unknown>).message;
      let answer = '';
      let visualizationMetadata: string | undefined;
      let answerArtifacts: string | undefined;

      if (message && typeof message === 'object') {
        const content = (message as Record<string, unknown>).content;
        if (content) answer = String(content);

        // Extract visualization metadata (if present)
        const vizMetadata = (message as Record<string, unknown>).visualizationMetadata;
        if (vizMetadata && typeof vizMetadata === 'string') {
          visualizationMetadata = vizMetadata;
          log.info('sendMessage: visualizationMetadata found, length =', vizMetadata.length);
        }

        // Extract answer artifacts (if present)
        const artifacts = (message as Record<string, unknown>).answerArtifacts;
        if (artifacts && typeof artifacts === 'string') {
          answerArtifacts = artifacts;
          log.info('sendMessage: answerArtifacts found, length =', artifacts.length);
        }
      }

      if (!answer.trim()) {
        const errorMessage = 'Agent returned an empty response.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      log.info('sendMessage: answer =', answer.slice(0, 120));
      return { answer, visualizationMetadata, answerArtifacts };
    },
    [],
  );

  return { ready, error, sendMessage };
}
