/**
 * ChartRenderer - Renders visualizations from Agentforce semantic data analysis
 *
 * Parses visualizationMetadata JSON and renders appropriate chart type.
 * Falls back to raw data table if chart type is unsupported.
 */

import { useMemo } from 'react';
import { log } from '@/lib/logger';

interface ChartRendererProps {
  visualizationMetadata?: string;
  className?: string;
}

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'table' | 'unknown';
  title?: string;
  data: Array<Record<string, unknown>>;
  xField?: string;
  yField?: string;
  colorField?: string;
}

function parseVisualizationMetadata(metadata: string): ChartData | null {
  try {
    const parsed = JSON.parse(metadata);
    log.info('[ChartRenderer] Parsed visualization metadata:', parsed);

    // Extract chart type and data
    // Format varies by agent response - adjust based on actual structure
    const type = parsed.type || parsed.chartType || 'table';
    const data = parsed.data || parsed.rows || [];
    const title = parsed.title || parsed.chartTitle;
    const xField = parsed.xField || parsed.xAxis || parsed.category;
    const yField = parsed.yField || parsed.yAxis || parsed.value;
    const colorField = parsed.colorField || parsed.series;

    return {
      type,
      title,
      data,
      xField,
      yField,
      colorField,
    };
  } catch (err) {
    log.error('[ChartRenderer] Failed to parse visualization metadata:', err);
    return null;
  }
}

function SimpleBarChart({ data, xField, yField, title }: ChartData) {
  if (!data || data.length === 0) return null;
  if (!xField || !yField) return null;

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => Number(d[yField]) || 0));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      )}
      <div className="space-y-2">
        {data.map((item, idx) => {
          const label = String(item[xField] || '');
          const value = Number(item[yField]) || 0;
          const widthPercent = (value / maxValue) * 100;

          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-24 text-xs text-gray-600 truncate" title={label}>
                {label}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                <div
                  className="bg-[#4E79A7] h-full rounded-full transition-all duration-300"
                  style={{ width: `${widthPercent}%` }}
                  aria-label={`${label}: ${value}`}
                />
              </div>
              <div className="w-12 text-xs text-gray-800 font-medium text-right">
                {value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SimpleDataTable({ data, title }: ChartData) {
  if (!data || data.length === 0) return null;

  // Get all unique keys from data
  const keys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {keys.map(key => (
                <th
                  key={key}
                  className="px-3 py-2 text-left font-semibold text-gray-700"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                {keys.map(key => (
                  <td key={key} className="px-3 py-2 text-gray-700">
                    {String(row[key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChartRenderer({ visualizationMetadata, className = '' }: ChartRendererProps) {
  const chartData = useMemo(() => {
    if (!visualizationMetadata?.trim()) return null;
    return parseVisualizationMetadata(visualizationMetadata);
  }, [visualizationMetadata]);

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}
      role="img"
      aria-label={chartData.title || 'Data visualization'}
    >
      {chartData.type === 'bar' || chartData.type === 'unknown' ? (
        <SimpleBarChart {...chartData} />
      ) : (
        <SimpleDataTable {...chartData} />
      )}
    </div>
  );
}

export default ChartRenderer;
