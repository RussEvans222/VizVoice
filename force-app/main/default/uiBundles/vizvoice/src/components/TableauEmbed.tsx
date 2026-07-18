import { useEffect, useRef, useState, useId } from 'react';
import {
  initializeAnalyticsSdk,
  AnalyticsDashboard,
  Status,
  type AnalyticsSdkConfig,
} from '@salesforce/analytics-embedding-sdk';
import { createDataSDK } from '@salesforce/platform-sdk';
import { log } from '@/lib/logger';

interface Dashboard {
  name: string;   // API name, e.g. "New_Dashboard"
  label: string;  // Human label, e.g. "TransitData"
  id: string;     // e.g. "0TrgK0000005ce9SAA"
  workspaceIdOrApiName?: string;
}

// Shape of GET /tableau/visualizations/{id} — only the fields we render.
interface VisualizationSpec {
  id?: string;
  label?: string;
  name?: string;
  dataSource?: { label?: string; name?: string };
  fields?: Record<string, { label?: string; role?: string; function?: string }>;
}

interface TableauEmbedProps {
  onLoad?: (analyticsTabId: string, dashboardLabel: string) => void;
  className?: string;
}

declare const SFDC_ENV: { orgUrl?: string } | undefined;

/**
 * Keep the org host canonical for embedding/auth flows.
 *
 * Rewriting to lightning.force.com can create cross-origin session drift in
 * some Hyperforce surfaces where auth endpoints (csrf/ssot) run on
 * *.my.salesforce.com. We preserve SFDC_ENV.orgUrl and only normalize trailing slash.
 */
function toCanonicalOrgUrl(orgUrl: string): string {
  return orgUrl.replace(/\/+$/, '');
}

/**
 * Top-level (new-tab) viewer URL — used only as the accessible fallback when
 * the embedding SDK can't render inline (e.g. auth redirect / CSP). A top-level
 * navigation carries the user's Lightning session and is exempt from framing
 * restrictions. The Tableau Next viewer route is
 * `{lightning host}/tableau/dashboard/{apiName}/view` — keyed on the dashboard
 * API name, NOT its id.
 */
function buildViewerUrl(orgUrl: string, dash: Dashboard): string {
  const base = toCanonicalOrgUrl(orgUrl);
  return `${base}/tableau/dashboard/${encodeURIComponent(dash.name)}/view`;
}

// Initialize the Analytics SDK at most once per app lifetime.
//
// Per Salesforce docs (https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-access-token.md),
// the SDK requires a FRONTDOOR URL as the authCredential — not just the orgUrl.
// We fetch a short-lived frontdoor URL from Apex via /services/oauth2/singleaccess,
// then pass it to the SDK for authentication.
let sdkInitPromise: Promise<boolean> | null = null;
async function initEmbeddingSdk(orgUrl: string, frontdoorUrl: string): Promise<boolean> {
  if (!sdkInitPromise) {
    sdkInitPromise = (async () => {
      const config: AnalyticsSdkConfig = { orgUrl, authCredential: frontdoorUrl };
      log.info('[TableauEmbed] initializeAnalyticsSdk with frontdoor URL');
      const res = await initializeAnalyticsSdk(config);
      const ok = res.status === Status.SUCCESS;
      if (!ok) log.error('[TableauEmbed] SDK init not successful:', res.status, res.message);
      return ok;
    })().catch((e) => {
      log.error('[TableauEmbed] SDK init threw:', e);
      return false;
    });
  }
  return sdkInitPromise;
}

async function fetchFrontdoorUrl(): Promise<string> {
  try {
    const sdk = await createDataSDK();
    if (!sdk.fetch) {
      throw new Error('Data SDK fetch unavailable');
    }
    // Call Apex REST endpoint to generate frontdoor URL via /services/oauth2/singleaccess
    const res = await sdk.fetch('/services/apexrest/vizvoice/frontdoor', {
      method: 'GET',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Frontdoor URL fetch failed (${res.status}): ${text}`);
    }
    const data = await res.json();
    const frontdoorUrl = (data as { frontdoorUrl: string }).frontdoorUrl;
    log.info('[TableauEmbed] Got frontdoor URL');
    return frontdoorUrl;
  } catch (e: any) {
    log.error('[TableauEmbed] fetchFrontdoorUrl error:', e);
    throw e;
  }
}

export function TableauEmbed({ onLoad, className = '' }: TableauEmbedProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selected, setSelected] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  // embedFailed → the SDK couldn't render inline; show the new-tab fallback.
  const [embedFailed, setEmbedFailed] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);
  // Tableau Next REST API fallback data — fetched only once the embed fails.
  const [vizSpec, setVizSpec] = useState<VisualizationSpec | null>(null);
  const [vizSpecError, setVizSpecError] = useState<string | null>(null);
  const selectId = useId();
  const hostRef = useRef<HTMLDivElement>(null);

  const orgUrl = typeof SFDC_ENV !== 'undefined' ? (SFDC_ENV?.orgUrl ?? '') : '';

  // Fetch dashboard list via Apex (Tableau REST API requires OAuth, not UI Bundle session)
  // Pattern from internal docs: server-side fetch via Named Credential → UI Bundle via Data SDK
  useEffect(() => {
    async function fetchDashboards() {
      try {
        const sdk = await createDataSDK();
        if (!sdk.fetch) {
          throw new Error('Data SDK fetch unavailable on this surface');
        }

        // Call the Apex REST endpoint that proxies to Tableau API via Named Credential
        const res = await sdk.fetch('/services/apexrest/vizvoice/dashboards');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Dashboard list failed (${res.status}): ${text}`);
        }

        const body = (await res.json()) as { dashboards: Dashboard[] };
        setDashboards(body.dashboards ?? []);
        if (body.dashboards?.length > 0) setSelected(body.dashboards[0]);
      } catch (e: any) {
        log.error('[TableauEmbed] fetchDashboards error:', e);
        setListError(e.message || 'Could not load dashboards.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboards();
  }, []);

  // Notify parent of the selection so the dashboard name flows to the agent as
  // context. This is independent of whether the embed renders — the voice loop
  // must never depend on the visual embed.
  useEffect(() => {
    if (!selected) return;
    log.info('[TableauEmbed] selected dashboard =', selected.name);
    onLoad?.(selected.name, selected.label);
  }, [selected, onLoad]);

  // Render the real Tableau Next dashboard via the Analytics Embedding SDK.
  useEffect(() => {
    if (!selected || !orgUrl || !hostRef.current) return;

    let cancelled = false;
    const host = hostRef.current;
    setEmbedFailed(false);
    setEmbedReady(false);
    setVizSpec(null);
    setVizSpecError(null);
    // Clear any prior render (dashboard switch).
    host.replaceChildren();

    async function embed() {
      try {
        const canonicalOrgUrl = toCanonicalOrgUrl(orgUrl);
        const frontdoorUrl = await fetchFrontdoorUrl();
        if (cancelled) return;

        const ok = await initEmbeddingSdk(canonicalOrgUrl, frontdoorUrl);
        if (cancelled) return;
        if (!ok) {
          setEmbedFailed(true);
          return;
        }

        const dashboard = new AnalyticsDashboard({
          parentIdOrElement: host,
          idOrApiName: selected!.name,
          orgUrl: canonicalOrgUrl,
          width: '100%',
          height: '100%',
        });
        // render() resolves on success and rejects on failure; the ERROR event
        // is a belt-and-suspenders catch for async render errors.
        dashboard.addEventListener('Error', () => {
          if (!cancelled) setEmbedFailed(true);
        });
        await dashboard.render();
        if (!cancelled) setEmbedReady(true);
      } catch (e) {
        log.error('[TableauEmbed] embed failed:', e);
        if (!cancelled) setEmbedFailed(true);
      }
    }
    embed();

    return () => {
      cancelled = true;
      host.replaceChildren();
    };
  }, [selected, orgUrl]);

  // When the live embed can't render, try the Tableau Next REST API as a
  // backup: fetch the visualization's structured spec via the same Named
  // Credential and render its fields directly instead of only a link out.
  //
  // Dashboards and visualizations are separate Tableau Next resources with
  // distinct names/ids — a dashboard's API name (e.g. "New_Dashboard") is
  // never a valid visualization id. There is no dashboard->visualization
  // lookup endpoint exposed here, so we list all visualizations in the org
  // and use the one belonging to the same workspace as the selected
  // dashboard (falling back to the first one) as a representative preview.
  useEffect(() => {
    if (!embedFailed || !selected) return;
    let cancelled = false;

    async function fetchVizSpec() {
      try {
        const sdk = await createDataSDK();
        if (!sdk.fetch) throw new Error('Data SDK fetch unavailable');

        const listRes = await sdk.fetch('/services/apexrest/vizvoice/visualizations');
        if (!listRes.ok) {
          const text = await listRes.text();
          throw new Error(`Visualization list failed (${listRes.status}): ${text}`);
        }
        const listBody = (await listRes.json()) as {
          visualizations: Array<VisualizationSpec & { workspace?: { name?: string } }>;
        };
        const candidates = listBody.visualizations ?? [];
        const match =
          candidates.find((v) => v.workspace?.name === selected!.workspaceIdOrApiName) ??
          candidates[0];
        if (!match?.name) {
          throw new Error('No visualizations available for this workspace.');
        }

        const res = await sdk.fetch(
          `/services/apexrest/vizvoice/visualization?id=${encodeURIComponent(match.name)}`
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Visualization fetch failed (${res.status}): ${text}`);
        }
        const spec = (await res.json()) as VisualizationSpec;
        if (!cancelled) setVizSpec(spec);
      } catch (e: any) {
        log.error('[TableauEmbed] fetchVizSpec error:', e);
        if (!cancelled) setVizSpecError(e.message || 'Could not load visualization data.');
      }
    }
    fetchVizSpec();

    return () => {
      cancelled = true;
    };
  }, [embedFailed, selected]);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const dash = dashboards.find((d) => d.name === e.target.value);
    if (dash) setSelected(dash);
  }

  const viewerUrl = selected && orgUrl ? buildViewerUrl(orgUrl, selected) : '';

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Dashboard picker — fully keyboard + screen-reader accessible */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50">
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700 whitespace-nowrap"
        >
          Dashboard:
        </label>
        {loading ? (
          <span role="status" className="text-sm text-slate-500" aria-live="polite">
            Loading dashboards…
          </span>
        ) : dashboards.length === 0 ? (
          <span role="alert" className="text-sm text-red-600" aria-live="assertive">
            {listError ?? 'No dashboards available.'}
          </span>
        ) : (
          <select
            id={selectId}
            value={selected?.name ?? ''}
            onChange={handleSelect}
            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select a Tableau dashboard to view and ask questions about"
          >
            {dashboards.map((d) => (
              <option key={d.name} value={d.name}>
                {d.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Dashboard viewer. The Analytics Embedding SDK renders the live Tableau
          Next dashboard into hostRef. If the SDK can't render inline (auth
          redirect / CSP), embedFailed flips to the accessible new-tab fallback.
          Either way the voice experience is fully functional. */}
      <div className="flex-1 relative bg-slate-100">
        {/* SDK render target — always mounted so the ref is available. */}
        <div
          ref={hostRef}
          className={`absolute inset-0 ${embedFailed ? 'hidden' : ''}`}
          aria-label={selected ? `${selected.label} dashboard` : 'Dashboard'}
        />

        {!embedFailed && !embedReady && selected && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <span className="text-sm text-slate-500">Loading {selected.label}…</span>
          </div>
        )}

        {embedFailed && (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            {vizSpec ? (
              <div className="flex-1 overflow-auto p-4" role="region" aria-label="Visualization details">
                <p className="text-xs text-slate-400 mb-2">
                  Live embed unavailable — showing data via the Tableau Next REST API.
                </p>
                <h3 className="text-sm font-semibold text-slate-700">
                  {vizSpec.label ?? selected?.label}
                </h3>
                {vizSpec.dataSource?.label && (
                  <p className="text-xs text-slate-500 mb-2">Source: {vizSpec.dataSource.label}</p>
                )}
                {vizSpec.fields && (
                  <ul className="text-sm text-slate-700 space-y-1">
                    {Object.values(vizSpec.fields).map((f, i) => (
                      <li key={i}>
                        {f.label ?? 'Field'}
                        {f.role ? ` — ${f.role}` : ''}
                        {f.function ? ` (${f.function})` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div
                className="flex-1 flex items-center justify-center p-4"
                role="status"
                aria-live="polite"
              >
                <span className="text-sm text-slate-500">
                  {vizSpecError
                    ? `Dashboard preview unavailable. ${vizSpecError}`
                    : `Loading ${selected?.label ?? 'dashboard'} data…`}
                </span>
              </div>
            )}
            {viewerUrl && (
              <div className="shrink-0 flex items-center justify-end gap-2 px-4 py-1.5 border-t border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-400">Live dashboard:</span>
                <a
                  href={viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#0176D3] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0176D3] rounded"
                  aria-label={`Open ${selected?.label ?? 'dashboard'} in a new tab`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Open in Tableau
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
