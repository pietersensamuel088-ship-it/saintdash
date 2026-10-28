import React from 'react';
import type { ClusterSummary } from '../types';
import { RadialGauge } from './RadialGauge';

interface OverviewMetricsProps {
  summary: ClusterSummary | null;
  selectedNode: string;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  summary,
  selectedNode,
}) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-canvas-surface rounded-lg border border-canvas-border" />
        ))}
      </div>
    );
  }

  const { cpu, ram, workloads, uptime } = summary;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
          Overview &middot; {selectedNode === 'all' ? 'Cluster Total' : selectedNode}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CPU Usage Card */}
        <div className="bg-canvas-surface rounded-md border border-canvas-border p-4 flex flex-col justify-between">
          <RadialGauge label="CPU Usage" value={cpu.usage_pct} size={180} />
          
          <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-canvas-border/80">
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                CPU Used
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {cpu.cores_used.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                CPU Total
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {cpu.cores_total} <span className="text-xs text-slate-400 font-sans font-normal">cores</span>
              </div>
            </div>
          </div>
        </div>

        {/* RAM Usage Card */}
        <div className="bg-canvas-surface rounded-md border border-canvas-border p-4 flex flex-col justify-between">
          <RadialGauge label="RAM Usage" value={ram.usage_pct} size={180} />

          <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-canvas-border/80">
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                RAM Used
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {ram.used_gib.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">GiB</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                RAM Total
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {ram.total_gib.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">GiB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pods & Containers On Node */}
        <div className="bg-canvas-surface rounded-md border border-canvas-border p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">
              Workloads &amp; Containers
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-6xl font-bold tracking-tight text-blue-400 font-mono">
                {workloads.total_count}
              </span>
              <span className="ml-2 text-xs text-slate-400 font-medium">total instances</span>
            </div>
          </div>

          <div className="pt-3 border-t border-canvas-border/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Status Active</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
              {workloads.running_count} running
            </span>
          </div>
        </div>

        {/* Uptime Card */}
        <div className="bg-canvas-surface rounded-md border border-canvas-border p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">
              Server Uptime
            </div>
            <div className="mt-5">
              <div className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                {uptime.formatted}
              </div>
              <div className="text-xs text-slate-400 mt-1">24/7 Node Operational</div>
            </div>
          </div>

          <div className="pt-3 border-t border-canvas-border/80 flex items-center justify-between text-xs text-slate-400">
            <span>Cluster Health</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium font-mono">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
