import { useEffect, useRef, useState } from 'react';
import { initializeAnalyticsSdk, AnalyticsDashboard, Status } from '@salesforce/analytics-embedding-sdk';
import { createDataSDK } from '@salesforce/platform-sdk';

// This mirrors the vizvoice bundle's TableauEmbed.tsx exactly: the Analytics
// Embedding SDK needs a frontdoor URL (not a bare OAuth token) as its
// authCredential. We get that from the ALREADY-DEPLOYED VizVoiceAgentProxy
// Apex REST endpoint (/services/apexrest/vizvoice/frontdoor), which calls
// /services/oauth2/singleaccess via the org's Named Credential. This UI
// Bundle runs on a *.salesforce.app origin with no org session cookie, so
// the call goes through @salesforce/platform-sdk's createDataSDK().fetch,
// which is the supported bridge that injects auth + CSRF automatically.
const ORG_URL = 'https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com';
const DASHBOARD_API_NAME = 'New_Dashboard';

// Persist the log across any redirects/reloads so nothing is lost.
const LOG_KEY = 'embed_test_log';

type LogEntry = { t: string; msg: string };

function loadLog(): LogEntry[] {
  try {
    return JSON.parse(sessionStorage.getItem(LOG_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function appendLog(msg: string) {
  const entries = loadLog();
  entries.push({ t: new Date().toISOString().slice(11, 23), msg });
  sessionStorage.setItem(LOG_KEY, JSON.stringify(entries));
  return entries;
}

async function fetchFrontdoorUrl(log: (m: string) => void): Promise<string> {
  log('createDataSDK()...');
  const sdk = await createDataSDK();
  if (!sdk.fetch) {
    throw new Error('Data SDK fetch is unavailable on this surface.');
  }
  log('sdk.fetch GET /services/apexrest/vizvoice/frontdoor');

  let res: Response;
  try {
    res = await sdk.fetch('/services/apexrest/vizvoice/frontdoor', { method: 'GET' });
  } catch (e: any) {
    log(`  sdk.fetch() THREW: ${e?.name}: ${e?.message}`);
    throw new Error(`sdk.fetch() threw: ${e?.name}: ${e?.message}`);
  }

  log(`  response status: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const text = await res.text();
    log(`  response body: ${text}`);
    throw new Error(`Frontdoor URL fetch failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { frontdoorUrl?: string; error?: string };
  if (!data.frontdoorUrl) {
    log(`  response had no frontdoorUrl: ${JSON.stringify(data)}`);
    throw new Error(data.error ?? 'No frontdoorUrl in response');
  }
  log('  got frontdoorUrl.');
  return data.frontdoorUrl;
}

export default function EmbedTestPage() {
  const [status, setStatus] = useState('Not logged in');
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>(loadLog());
  const hostRef = useRef<HTMLDivElement>(null);

  function pushLog(msg: string) {
    setLog(appendLog(msg));
  }

  function clearLog() {
    sessionStorage.removeItem(LOG_KEY);
    setLog([]);
  }

  function copyLog() {
    const text = log.map((l) => `[${l.t}] ${l.msg}`).join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  async function runEmbed() {
    setError(null);
    try {
      setStatus('Fetching frontdoor URL via Apex proxy...');
      const frontdoorUrl = await fetchFrontdoorUrl(pushLog);
      setStatus('Got frontdoor URL. Initializing Analytics SDK...');
      pushLog('Calling initializeAnalyticsSdk...');

      const res = await initializeAnalyticsSdk({ orgUrl: ORG_URL, authCredential: frontdoorUrl });
      pushLog(`initializeAnalyticsSdk result: ${res.status} ${res.message ?? ''}`);
      if (res.status !== Status.SUCCESS) {
        throw new Error(`SDK init failed: ${res.status} ${res.message ?? ''}`);
      }
      setStatus('SDK initialized. Rendering dashboard...');

      const dashboard = new AnalyticsDashboard({
        parentIdOrElement: hostRef.current!,
        idOrApiName: DASHBOARD_API_NAME,
        orgUrl: ORG_URL,
        width: '100%',
        height: '100%',
      });
      dashboard.addEventListener('Error', (e: unknown) => {
        pushLog(`Dashboard Error event: ${JSON.stringify(e)}`);
        setError(`Dashboard render error: ${JSON.stringify(e)}`);
      });
      pushLog('Calling dashboard.render()...');
      await dashboard.render();
      pushLog('dashboard.render() resolved successfully.');
      setStatus('Rendered!');
    } catch (e: any) {
      pushLog(`CAUGHT ERROR: ${e.message ?? String(e)}`);
      setError(e.message ?? String(e));
      setStatus('Failed');
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', width: '100%' }}>
      <h1>Tableau Next Embed — Bare Test</h1>
      <p>Status: {status}</p>
      {error && <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</pre>}
      <button onClick={runEmbed}>Load Dashboard</button>
      <div ref={hostRef} style={{ width: '100%', height: '600px', border: '1px solid #ccc', marginTop: 16 }} />

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Debug Log</h2>
          <button onClick={copyLog}>Copy log</button>
          <button onClick={clearLog}>Clear log</button>
        </div>
        <pre
          style={{
            background: '#111',
            color: '#0f0',
            padding: 12,
            maxHeight: 400,
            overflow: 'auto',
            fontSize: 12,
            whiteSpace: 'pre-wrap',
          }}
        >
          {log.length === 0
            ? '(empty — click "Load Dashboard" to start)'
            : log.map((l) => `[${l.t}] ${l.msg}`).join('\n')}
        </pre>
      </div>
    </div>
  );
}
