import React, { useState } from 'react';
import type { WorkloadItem } from '../types';
import { Search, Layers } from 'lucide-react';

interface WorkloadTableProps {
  workloads: WorkloadItem[];
  selectedNode: string;
}

export const WorkloadTable: React.FC<WorkloadTableProps> = ({ workloads, selectedNode }) => {
  const [filterType, setFilterType] = useState<'all' | 'qemu' | 'lxc' | 'docker'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = workloads.filter((item) => {
    if (selectedNode !== 'all' && item.node !== selectedNode) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = String(item.id).toLowerCase().includes(q);
      const matchIp = item.ip ? item.ip.toLowerCase().includes(q) : false;
      const matchImage = item.image ? item.image.toLowerCase().includes(q) : false;
      return matchName || matchId || matchIp || matchImage;
    }
    return true;
  });

  return (
    <div className="bg-canvas-surface rounded-md border border-canvas-border flex flex-col h-full">
      {/* Table Header & Controls */}
      <div className="p-3 border-b border-canvas-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-200">
            Workload Instances &amp; Pods
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-canvas-border text-slate-300">
            {filtered.length} of {workloads.length}
          </span>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Type Filters */}
          <div className="inline-flex rounded-md p-0.5 bg-canvas-subtle border border-canvas-border text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('docker')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'docker'
                  ? 'bg-cyan-600/30 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Docker
            </button>
            <button
              onClick={() => setFilterType('lxc')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'lxc'
                  ? 'bg-amber-600/30 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LXC
            </button>
            <button
              onClick={() => setFilterType('qemu')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'qemu'
                  ? 'bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VMs
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search pods/IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas-subtle border border-canvas-border rounded text-xs pl-8 pr-2.5 py-1 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1 max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-canvas-border text-[11px] uppercase tracking-wider text-slate-400 bg-canvas-subtle/70 sticky top-0 z-10 backdrop-blur-sm">
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Instance / Name</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Node</th>
              <th className="py-2.5 px-3">CPU</th>
              <th className="py-2.5 px-3">Memory</th>
              <th className="py-2.5 px-3">Network / IP</th>
              <th className="py-2.5 px-3">Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-border/50 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                  No workload instances match the filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isRunning = item.status === 'running';
                
                // Format CPU
                let cpuDisplay = '—';
                if (isRunning) {
                  const cpuVal = item.cpu_pct !== undefined ? item.cpu_pct : (item.cpu ? item.cpu * 100 : 0);
                  cpuDisplay = `${cpuVal.toFixed(1)}%`;
                }

                // Format Memory
                let memDisplay = '—';
                if (isRunning) {
                  if (item.mem_bytes) {
                    memDisplay = `${(item.mem_bytes / (1024 * 1024)).toFixed(0)} MB`;
                  } else if (item.mem) {
                    memDisplay = `${(item.mem / (1024 * 1024)).toFixed(0)} MB`;
                  }
                }

                // Type Badge styling
                let typeBadgeClass = 'bg-slate-700/50 text-slate-300';
                if (item.type === 'docker') typeBadgeClass = 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/40';
                if (item.type === 'lxc') typeBadgeClass = 'bg-amber-950/70 text-amber-300 border border-amber-800/40';
                if (item.type === 'qemu') typeBadgeClass = 'bg-purple-950/70 text-purple-300 border border-purple-800/40';

                return (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="hover:bg-canvas-hover transition-colors group"
                  >
                    {/* Status */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-sans">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRunning ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-600'
                          }`}
                        />
                        <span className={`text-[11px] ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>

                    {/* Name & ID */}
                    <td className="py-2 px-3 font-sans font-medium text-slate-100 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </span>
                        {item.image && (
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[220px]">
                            {item.image}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`text-[10px] font-sans uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${typeBadgeClass}`}>
                        {item.type === 'qemu' ? 'VM (QEMU)' : item.type.toUpperCase()}
                      </span>
                    </td>

                    {/* Node */}
                    <td className="py-2 px-3 text-slate-400 text-xs whitespace-nowrap">
                      {item.node}
                    </td>

                    {/* CPU */}
                    <td className="py-2 px-3 text-slate-200 whitespace-nowrap">
                      {cpuDisplay}
                    </td>

                    {/* Memory */}
                    <td className="py-2 px-3 text-slate-200 whitespace-nowrap">
                      {memDisplay}
                    </td>

                    {/* IP / Port */}
                    <td className="py-2 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {item.ip || item.ports || '—'}
                    </td>

                    {/* Uptime */}
                    <td className="py-2 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {typeof item.uptime === 'number'
                        ? `${(item.uptime / 3600).toFixed(1)}h`
                        : item.uptime || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
