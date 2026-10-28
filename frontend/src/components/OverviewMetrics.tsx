import React from 'react';
import type { ClusterSummary } from '../types';
import { RadialGauge } from './RadialGauge';
import { Cpu, MemoryStick, Layers, Clock } from 'lucide-react';

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
          <div key={i} className="h-44 bg-[#0b0f1a]/80 rounded-lg border border-slate-800" />
        ))}
      </div>
    );
  }

  const { cpu, ram, workloads, uptime } = summary;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          TELEMETRY GAUGES &bull; {selectedNode === 'all' ? 'FULL CLUSTER' : selectedNode.toUpperCase()}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CPU Usage Card */}
        <div className="relative bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 p-4 flex flex-col justify-between shadow-xl transition-all group overflow-hidden">
          {/* Cyber Corner Decals */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60" />

          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> CPU USAGE
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
              {cpu.cores_total} CORES
            </span>
          </div>

          <RadialGauge label="" value={cpu.usage_pct} size={180} />
          
          <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-slate-800/80">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                CPU Used
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {cpu.cores_used.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                CPU Total
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {cpu.cores_total} <span className="text-xs text-slate-400 font-sans font-normal">threads</span>
              </div>
            </div>
          </div>
        </div>

        {/* RAM Usage Card */}
        <div className="relative bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 p-4 flex flex-col justify-between shadow-xl transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-amber-400/60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400/60" />

          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <MemoryStick className="w-3.5 h-3.5 text-amber-400" /> RAM CAPACITY
            </span>
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
              {ram.total_gib.toFixed(1)} GIB
            </span>
          </div>

          <RadialGauge label="" value={ram.usage_pct} size={180} />

          <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-slate-800/80">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                RAM Used
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {ram.used_gib.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">GiB</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
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
        <div className="relative bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 p-4 flex flex-col justify-between shadow-xl transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-blue-400/60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400/60" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> ACTIVE WORKLOADS
              </span>
              <span className="text-[10px] font-mono text-blue-300 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/40">
                POD SQUADRON
              </span>
            </div>

            <div className="mt-4 flex items-baseline">
              <span className="text-6xl font-black tracking-tight text-cyan-400 font-mono shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {workloads.total_count}
              </span>
              <span className="ml-2 text-xs text-slate-400 font-mono font-medium">instances</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">COMBAT READY:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
              {workloads.running_count} RUNNING
            </span>
          </div>
        </div>

        {/* Uptime Card */}
        <div className="relative bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 p-4 flex flex-col justify-between shadow-xl transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-emerald-400/60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400/60" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> MISSION RUNTIME
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                24/7 LAPTOP
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {uptime.formatted}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">Continuous Node Uptime</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>HEALTH STATUS:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-emerald-400 font-bold">OPTIMAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
