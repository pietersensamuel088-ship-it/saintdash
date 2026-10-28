import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { RrdTelemetryPoint } from '../types';
import { Activity, Clock } from 'lucide-react';

interface TelemetryChartsProps {
  data: RrdTelemetryPoint[];
  onTimeframeChange: (tf: string) => void;
  currentTimeframe: string;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  data,
  onTimeframeChange,
  currentTimeframe,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Chart Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Resources &middot; Live Real-Time Telemetry
          </h2>
        </div>

        {/* Resolution / Timeframe selector (like in the screenshot) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" /> resolution 30s
          </span>
          <div className="inline-flex rounded bg-canvas-surface border border-canvas-border p-0.5 text-xs font-mono">
            {['hour', 'day', 'week'].map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-0.5 rounded uppercase tracking-wider text-[10px] transition-colors ${
                  currentTimeframe === tf
                    ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Two Side-by-Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Chart: CPU Usage % */}
        <div className="bg-canvas-surface rounded-md border border-canvas-border p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
              CPU Usage (%)
            </span>
            <span className="text-[11px] font-mono text-emerald-400">100% Scale</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2130" vertical={false} />
                <XAxis
                  dataKey="formatted_time"
                  stroke="#475569"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#475569"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0e17',
                    borderColor: '#1e2230',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ padding: '1px 0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                  iconType="plainline"
                  iconSize={14}
                />
                {/* Lines matching the screenshot's color key */}
                <Line
                  type="monotone"
                  dataKey="idle"
                  name="Idle"
                  stroke="#22c55e"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="system"
                  name="System"
                  stroke="#a855f7"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="user"
                  name="User"
                  stroke="#06b6d4"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="iowait"
                  name="IOWait"
                  stroke="#f43f5e"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Memory Usage (GiB) */}
        <div className="bg-canvas-surface rounded-md border border-canvas-border p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
              Memory Usage (GiB)
            </span>
            <span className="text-[11px] font-mono text-amber-400">16 GiB Scale</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2130" vertical={false} />
                <XAxis
                  dataKey="formatted_time"
                  stroke="#475569"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 16]}
                  stroke="#475569"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => `${v} GiB`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0e17',
                    borderColor: '#1e2230',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ padding: '1px 0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                  iconType="plainline"
                  iconSize={14}
                />
                {/* Lines matching the screenshot's memory chart */}
                <Line
                  type="monotone"
                  dataKey="mem_total_gib"
                  name="RAM Total"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="mem_used_gib"
                  name="RAM Used"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="mem_cache_gib"
                  name="RAM Cache"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="mem_free_gib"
                  name="RAM Free"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="mem_buffer_gib"
                  name="RAM Buffer"
                  stroke="#f97316"
                  strokeWidth={1.2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
