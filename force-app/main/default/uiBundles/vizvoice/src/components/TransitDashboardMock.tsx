import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
} from 'recharts';

// Transit performance data matching Transit_Performance__dlm semantic model fields:
// Line__c, Line_Type__c, Month__c, Year__c, On_Time_Pct__c, Avg_Delay_Minutes__c,
// Ridership__c, Cancelled_Trips__c, Delay_Cause__c, Satisfaction_Score__c, Incidents__c

const cancellationsHeatmap = [
  { line: 'Blue Line',  Apr: 10, May: 8,  Jun: 6,  Jul: 8,  Aug: 7,  Sep: 5  },
  { line: 'Green Line', Apr: 16, May: 20, Jun: 18, Jul: 14, Aug: 12, Sep: 10 },
  { line: 'Red Line',   Apr: 24, May: 28, Jun: 22, Jul: 26, Aug: 30, Sep: 18 },
  { line: 'Route 1',   Apr: 12, May: 15, Jun: 14, Jul: 11, Aug: 9,  Sep: 8  },
  { line: 'Route 2',   Apr: 8,  May: 10, Jun: 7,  Jul: 6,  Aug: 5,  Sep: 4  },
  { line: 'Route 12',  Apr: 14, May: 18, Jun: 16, Jul: 19, Aug: 17, Sep: 13 },
];

const delayCauseData = [
  { cause: 'Weather',          cancellations: 89 },
  { cause: 'Track Maint.',     cancellations: 62 },
  { cause: 'Signal Failure',   cancellations: 41 },
  { cause: 'Mechanical Issue', cancellations: 28 },
  { cause: 'Other',            cancellations: 15 },
];

const satisfactionData = [
  { line: 'Route 12',  satisfaction: 88, ridership: 112000 },
  { line: 'Blue Line', satisfaction: 85, ridership: 341000 },
  { line: 'Route 1',   satisfaction: 80, ridership: 95000  },
  { line: 'Green Line',satisfaction: 78, ridership: 179000 },
  { line: 'Route 2',   satisfaction: 72, ridership: 68000  },
  { line: 'Red Line',  satisfaction: 65, ridership: 425000 },
];

const ridershipTrend = [
  { month: 'Apr', ridership: 1180000 },
  { month: 'May', ridership: 1240000 },
  { month: 'Jun', ridership: 1310000 },
  { month: 'Jul', ridership: 1290000 },
  { month: 'Aug', ridership: 1350000 },
  { month: 'Sep', ridership: 1420000 },
  { month: 'Oct', ridership: 1380000 },
  { month: 'Nov', ridership: 1300000 },
  { month: 'Dec', ridership: 1260000 },
];

const onTimePctData = [
  { line: 'Route 2',   pct: 94.2 },
  { line: 'Blue Line', pct: 91.8 },
  { line: 'Route 12',  pct: 88.5 },
  { line: 'Route 1',   pct: 85.1 },
  { line: 'Green Line',pct: 79.3 },
  { line: 'Red Line',  pct: 71.6 },
];

const avgDelayTrend = [
  { month: 'Jul', 'Blue Line': 3.2, 'Green Line': 6.8, 'Red Line': 11.4, 'Route 1': 4.1, 'Route 2': 2.9, 'Route 12': 5.3 },
  { month: 'Aug', 'Blue Line': 3.5, 'Green Line': 7.1, 'Red Line': 12.8, 'Route 1': 4.4, 'Route 2': 3.1, 'Route 12': 5.8 },
  { month: 'Sep', 'Blue Line': 2.9, 'Green Line': 6.4, 'Red Line': 10.9, 'Route 1': 3.8, 'Route 2': 2.6, 'Route 12': 5.1 },
  { month: 'Oct', 'Blue Line': 4.1, 'Green Line': 8.2, 'Red Line': 14.3, 'Route 1': 5.2, 'Route 2': 3.4, 'Route 12': 6.4 },
  { month: 'Nov', 'Blue Line': 4.8, 'Green Line': 9.1, 'Red Line': 15.7, 'Route 1': 5.9, 'Route 2': 3.9, 'Route 12': 7.2 },
  { month: 'Dec', 'Blue Line': 5.2, 'Green Line': 9.8, 'Red Line': 16.1, 'Route 1': 6.3, 'Route 2': 4.2, 'Route 12': 7.8 },
];

const incidentsData = [
  { line: 'Red Line',   incidents: 14 },
  { line: 'Green Line', incidents: 9  },
  { line: 'Route 12',  incidents: 7  },
  { line: 'Route 1',   incidents: 5  },
  { line: 'Blue Line', incidents: 4  },
  { line: 'Route 2',   incidents: 2  },
];

const lineTypeData = [
  { type: 'Subway',     ridership: 766000, onTimePct: 80.6, incidents: 18, avgDelay: 9.1 },
  { type: 'Bus',        ridership: 163000, onTimePct: 89.6, incidents: 7,  avgDelay: 3.5 },
  { type: 'Light Rail', ridership: 291000, onTimePct: 86.8, incidents: 9,  avgDelay: 6.4 },
];

const LINE_COLORS: Record<string, string> = {
  'Blue Line':  '#2196F3',
  'Green Line': '#4CAF50',
  'Red Line':   '#F44336',
  'Route 1':    '#9C27B0',
  'Route 2':    '#FF9800',
  'Route 12':   '#00BCD4',
};

const CAUSE_COLORS = ['#5B8DEF', '#6EC6CA', '#A8D5A2', '#F6C26E', '#E88080'];
const TYPE_COLORS  = ['#3B82F6', '#F59E0B', '#10B981'];

function onTimeColor(pct: number): string {
  if (pct >= 90) return '#22c55e';
  if (pct >= 80) return '#f59e0b';
  return '#ef4444';
}

function onTimeLabel(pct: number): string {
  if (pct >= 90) return 'good';
  if (pct >= 80) return 'fair';
  return 'poor';
}

function HeatCell({ value, max }: { value: number; max: number }) {
  const intensity = Math.round((value / max) * 200);
  const r = 40 + intensity;
  const g = 40 + Math.round(intensity * 0.3);
  const b = 220 - intensity;
  return (
    <span
      className="inline-flex items-center justify-center rounded text-xs font-semibold w-9 h-7"
      style={{ backgroundColor: `rgb(${r},${g},${b})`, color: value > 20 ? '#fff' : '#1e293b' }}
      aria-hidden="true"
    >
      {value}
    </span>
  );
}

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
const DELAY_LINES = ['Blue Line', 'Green Line', 'Red Line', 'Route 1', 'Route 2', 'Route 12'] as const;
const MAX_CANCELLATIONS = Math.max(...cancellationsHeatmap.flatMap((r) => MONTHS.map((m) => r[m as keyof typeof r] as number)));

const KPI = {
  totalRidership: ridershipTrend[ridershipTrend.length - 1].ridership,
  avgOnTime: (onTimePctData.reduce((s, d) => s + d.pct, 0) / onTimePctData.length).toFixed(1),
  totalIncidents: incidentsData.reduce((s, d) => s + d.incidents, 0),
  avgSatisfaction: (satisfactionData.reduce((s, d) => s + d.satisfaction, 0) / satisfactionData.length).toFixed(0),
};

export function TransitDashboardMock({ label = 'TransitData' }: { label?: string }) {
  return (
    <div
      className="h-full overflow-y-auto bg-white p-4 space-y-6"
      role="region"
      aria-labelledby="dashboard-title"
    >
      <h2 id="dashboard-title" className="text-base font-semibold text-slate-800">{label}</h2>

      {/* Screen-reader summary — invisible visually, read first by screen readers */}
      <p className="sr-only">
        Transit performance dashboard. December ridership: {(KPI.totalRidership / 1000000).toFixed(2)} million riders.
        Average on-time rate across all lines: {KPI.avgOnTime} percent ({onTimeLabel(Number(KPI.avgOnTime))}).
        Year-to-date safety incidents: {KPI.totalIncidents}.
        Average rider satisfaction: {KPI.avgSatisfaction} out of 100.
        The worst performing line is the Red Line with 71.6 percent on-time rate and 14 incidents.
        Use Tab to navigate between sections.
      </p>

      {/* KPI Summary Row */}
      <section aria-labelledby="kpi-heading">
        <h3 id="kpi-heading" className="sr-only">Key Performance Indicators</h3>
        <dl className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs text-slate-500 uppercase tracking-wide">Monthly Riders</dt>
            <dd className="text-xl font-bold text-slate-800 mt-1">{(KPI.totalRidership / 1000000).toFixed(2)}M</dd>
            <dd className="text-xs text-green-600 mt-0.5">Dec 2025</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs text-slate-500 uppercase tracking-wide">Avg On-Time %</dt>
            <dd className="text-xl font-bold mt-1" style={{ color: onTimeColor(Number(KPI.avgOnTime)) }}>
              {KPI.avgOnTime}%
              <span className="sr-only"> ({onTimeLabel(Number(KPI.avgOnTime))})</span>
            </dd>
            <dd className="text-xs text-slate-400 mt-0.5" aria-hidden="true">All lines</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs text-slate-500 uppercase tracking-wide">Total Incidents</dt>
            <dd className="text-xl font-bold text-orange-600 mt-1">{KPI.totalIncidents}</dd>
            <dd className="text-xs text-slate-400 mt-0.5">YTD</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs text-slate-500 uppercase tracking-wide">Avg Satisfaction</dt>
            <dd className="text-xl font-bold text-blue-600 mt-1">{KPI.avgSatisfaction}<span aria-hidden="true">/100</span><span className="sr-only"> out of 100</span></dd>
            <dd className="text-xs text-slate-400 mt-0.5" aria-hidden="true">All lines</dd>
          </div>
        </dl>
      </section>

      {/* Row 1: On-Time % + Incidents */}
      <div className="grid grid-cols-2 gap-4">

        <section aria-labelledby="ontime-heading">
          <h3 id="ontime-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            On-Time % by Line
          </h3>
          {/* Accessible data table — primary for screen readers */}
          <table className="sr-only" aria-labelledby="ontime-heading">
            <caption className="sr-only">On-time percentage for each transit line. 90% or above is good, 80 to 90 is fair, below 80 is poor.</caption>
            <thead>
              <tr><th scope="col">Line</th><th scope="col">On-Time %</th><th scope="col">Rating</th></tr>
            </thead>
            <tbody>
              {onTimePctData.map((d) => (
                <tr key={d.line}>
                  <td>{d.line}</td>
                  <td>{d.pct}%</td>
                  <td>{onTimeLabel(d.pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Visual chart — hidden from screen readers */}
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={onTimePctData} layout="vertical" margin={{ left: 8, right: 36 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 10 }} unit="%" />
                <YAxis dataKey="line" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'On-Time']} />
                <ReferenceLine x={90} stroke="#22c55e" strokeDasharray="4 2" label={{ value: '90%', fontSize: 9, fill: '#22c55e', position: 'top' }} />
                <ReferenceLine x={80} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '80%', fontSize: 9, fill: '#f59e0b', position: 'top' }} />
                <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                  {onTimePctData.map((d, i) => (
                    <Cell key={i} fill={onTimeColor(d.pct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-1 text-xs text-slate-500">
              <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />≥90% good</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />80–90% fair</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />&lt;80% poor</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="incidents-heading">
          <h3 id="incidents-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Safety Incidents by Line
          </h3>
          <table className="sr-only" aria-labelledby="incidents-heading">
            <caption className="sr-only">Number of safety incidents reported per transit line, sorted from highest to lowest.</caption>
            <thead>
              <tr><th scope="col">Line</th><th scope="col">Incidents</th></tr>
            </thead>
            <tbody>
              {incidentsData.map((d) => (
                <tr key={d.line}><td>{d.line}</td><td>{d.incidents}</td></tr>
              ))}
            </tbody>
          </table>
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={incidentsData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="line" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip formatter={(v) => [`${v}`, 'Incidents']} />
                <Bar dataKey="incidents" radius={[0, 3, 3, 0]}>
                  {incidentsData.map((d, i) => (
                    <Cell key={i} fill={LINE_COLORS[d.line] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 2: Cancellations heatmap + Delay cause */}
      <div className="grid grid-cols-2 gap-4">

        <section aria-labelledby="cancellations-heading">
          <h3 id="cancellations-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Cancelled Trips by Line &amp; Month
          </h3>
          {/* This table is both the visual AND the accessible version */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse" aria-labelledby="cancellations-heading">
              <caption className="sr-only">Number of cancelled trips per transit line for each month from April to September. Higher numbers indicate more cancellations.</caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left py-1 pr-3 text-slate-500 font-normal">Line</th>
                  {MONTHS.map((m) => (
                    <th scope="col" key={m} className="text-center py-1 px-1 text-slate-500 font-normal w-9">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cancellationsHeatmap.map((row) => (
                  <tr key={row.line}>
                    <th scope="row" className="pr-3 py-1 text-slate-700 whitespace-nowrap font-normal text-left">{row.line}</th>
                    {MONTHS.map((m) => (
                      <td key={m} className="py-1 px-0.5 text-center">
                        <HeatCell value={row[m as keyof typeof row] as number} max={MAX_CANCELLATIONS} />
                        {/* Screen-reader cell value — the HeatCell span is aria-hidden */}
                        <span className="sr-only">{row[m as keyof typeof row]} cancellations</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="delaycause-heading">
          <h3 id="delaycause-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Primary Delay Cause
          </h3>
          <table className="sr-only" aria-labelledby="delaycause-heading">
            <caption className="sr-only">Number of cancelled trips attributed to each delay cause, sorted from most to least common.</caption>
            <thead>
              <tr><th scope="col">Cause</th><th scope="col">Cancelled Trips</th></tr>
            </thead>
            <tbody>
              {delayCauseData.map((d) => (
                <tr key={d.cause}><td>{d.cause}</td><td>{d.cancellations}</td></tr>
              ))}
            </tbody>
          </table>
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={delayCauseData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="cause" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(v) => [`${v} trips`, 'Cancelled']} />
                <Bar dataKey="cancellations" radius={[0, 3, 3, 0]}>
                  {delayCauseData.map((_, i) => (
                    <Cell key={i} fill={CAUSE_COLORS[i % CAUSE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 3: Avg delay trend */}
      <section aria-labelledby="avgdelay-heading">
        <h3 id="avgdelay-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Avg Delay Minutes — Monthly Trend by Line
        </h3>
        <table className="sr-only" aria-labelledby="avgdelay-heading">
          <caption className="sr-only">Average delay in minutes per transit line, for each month from July to December. Values are increasing over time on all lines, with the Red Line having the longest delays.</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              {DELAY_LINES.map((l) => <th scope="col" key={l}>{l} (min)</th>)}
            </tr>
          </thead>
          <tbody>
            {avgDelayTrend.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                {DELAY_LINES.map((l) => <td key={l}>{row[l]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={avgDelayTrend} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="m" domain={[0, 18]} />
              <Tooltip formatter={(v: number) => [`${v} min`, 'Avg Delay']} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {Object.keys(LINE_COLORS).map((line) => (
                <Line key={line} type="monotone" dataKey={line} stroke={LINE_COLORS[line]} dot={false} strokeWidth={1.5} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Row 4: Satisfaction scatter + Ridership trend */}
      <div className="grid grid-cols-2 gap-4">

        <section aria-labelledby="satisfaction-heading">
          <h3 id="satisfaction-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Satisfaction vs Ridership by Line
          </h3>
          <table className="sr-only" aria-labelledby="satisfaction-heading">
            <caption className="sr-only">Rider satisfaction score and monthly ridership per line. Lines with high ridership tend to have lower satisfaction scores.</caption>
            <thead>
              <tr><th scope="col">Line</th><th scope="col">Satisfaction (out of 100)</th><th scope="col">Monthly Riders</th></tr>
            </thead>
            <tbody>
              {satisfactionData.map((d) => (
                <tr key={d.line}>
                  <td>{d.line}</td>
                  <td>{d.satisfaction}</td>
                  <td>{d.ridership.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={170}>
              <ScatterChart margin={{ left: 8, right: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ridership" type="number" name="Ridership"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }}
                  label={{ value: 'Ridership', position: 'insideBottom', offset: -4, fontSize: 10 }} />
                <YAxis dataKey="satisfaction" type="number" name="Satisfaction" domain={[60, 95]}
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Satisfaction', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    return (
                      <div className="bg-white border border-slate-200 rounded p-2 text-xs shadow">
                        <p className="font-semibold">{payload[0]?.payload?.line}</p>
                        <p>Satisfaction: {payload[0]?.payload?.satisfaction}</p>
                        <p>Ridership: {(payload[0]?.payload?.ridership / 1000).toFixed(0)}k</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={satisfactionData.map((d, i) => ({ ...d, _idx: i }))} fill="#5B8DEF">
                  {satisfactionData.map((_d, i) => (
                    <Cell key={i} fill={LINE_COLORS[satisfactionData[i].line] ?? '#5B8DEF'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {satisfactionData.map((d) => (
                <span key={d.line} className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: LINE_COLORS[d.line] ?? '#999' }} aria-hidden="true" />
                  {d.line}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="ridership-heading">
          <h3 id="ridership-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Monthly Ridership
          </h3>
          <table className="sr-only" aria-labelledby="ridership-heading">
            <caption className="sr-only">Total monthly ridership across all lines, from April to December. Ridership is generally increasing over the year.</caption>
            <thead>
              <tr><th scope="col">Month</th><th scope="col">Total Riders</th></tr>
            </thead>
            <tbody>
              {ridershipTrend.map((d) => (
                <tr key={d.month}><td>{d.month}</td><td>{d.ridership.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={ridershipTrend} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${(v / 1000).toFixed(0)}k`, 'Riders']} />
                <Bar dataKey="ridership" fill="#5B8DEF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 5: Line Type comparison */}
      <section aria-labelledby="linetype-heading">
        <h3 id="linetype-heading" className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Performance by Line Type (Subway / Bus / Light Rail)
        </h3>
        {/* Accessible table version */}
        <table className="sr-only" aria-labelledby="linetype-heading">
          <caption className="sr-only">Performance metrics grouped by transit line type: subway, bus, and light rail.</caption>
          <thead>
            <tr>
              <th scope="col">Line Type</th>
              <th scope="col">Monthly Riders</th>
              <th scope="col">On-Time %</th>
              <th scope="col">Avg Delay (min)</th>
              <th scope="col">Incidents</th>
            </tr>
          </thead>
          <tbody>
            {lineTypeData.map((d) => (
              <tr key={d.type}>
                <th scope="row">{d.type}</th>
                <td>{d.ridership.toLocaleString()}</td>
                <td>{d.onTimePct}% ({onTimeLabel(d.onTimePct)})</td>
                <td>{d.avgDelay}</td>
                <td>{d.incidents}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Visual cards */}
        <div className="grid grid-cols-3 gap-3" aria-hidden="true">
          {lineTypeData.map((d, i) => (
            <div key={d.type} className="rounded-lg border border-slate-200 p-3 space-y-2">
              <p className="text-sm font-semibold" style={{ color: TYPE_COLORS[i] }}>{d.type}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-slate-500">Ridership</span>
                <span className="font-medium text-slate-800 text-right">{(d.ridership / 1000).toFixed(0)}k/mo</span>
                <span className="text-slate-500">On-Time</span>
                <span className="font-medium text-right" style={{ color: onTimeColor(d.onTimePct) }}>{d.onTimePct}%</span>
                <span className="text-slate-500">Avg Delay</span>
                <span className="font-medium text-slate-800 text-right">{d.avgDelay} min</span>
                <span className="text-slate-500">Incidents</span>
                <span className="font-medium text-orange-600 text-right">{d.incidents}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
