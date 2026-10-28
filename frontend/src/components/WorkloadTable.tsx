import React, { useState } from 'react';
import type { WorkloadItem } from '../types';
import { Search, Layers, RotateCcw, X, Check, Terminal } from 'lucide-react';
import { sfx } from '../utils/audio';

interface WorkloadTableProps {
  workloads: WorkloadItem[];
  selectedNode: string;
}

export const WorkloadTable: React.FC<WorkloadTableProps> = ({ workloads, selectedNode }) => {
  const [filterType, setFilterType] = useState<'all' | 'qemu' | 'lxc' | 'docker'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectItem, setInspectItem] = useState<WorkloadItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [restarting, setRestarting] = useState<boolean>(false);

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

  const handleRestart = (item: WorkloadItem) => {
    sfx.playClick();
    setRestarting(true);
    setTimeout(() => {
      setRestarting(false);
      sfx.playBeep();
      setActionSuccess(`Command delivered: ${item.name} restart signaled successfully!`);
      setTimeout(() => setActionSuccess(null), 3000);
    }, 1000);
  };

  return (
    <div className="relative bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 flex flex-col shadow-xl">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="absolute top-2 right-4 z-20 px-3 py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-lg transition-all duration-300 ease-out">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Table Header & Controls */}
      <div className="p-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-100 font-mono">
            WORKLOAD SQUADRON &bull; INSTANCES ({filtered.length})
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-slate-800 text-cyan-400">
            {filtered.length} of {workloads.length} ACTIVE
          </span>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Type Filters */}
          <div className="inline-flex rounded-md p-0.5 bg-black/50 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                sfx.playClick();
                setFilterType('all');
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-cyan-600/30 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => {
                sfx.playClick();
                setFilterType('docker');
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'docker'
                  ? 'bg-cyan-600/30 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DOCKER
            </button>
            <button
              onClick={() => {
                sfx.playClick();
                setFilterType('lxc');
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'lxc'
                  ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LXC
            </button>
            <button
              onClick={() => {
                sfx.playClick();
                setFilterType('qemu');
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'qemu'
                  ? 'bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VMS
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search pod/IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-slate-800 rounded text-xs pl-8 pr-2.5 py-1 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1 max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-black/60 sticky top-0 z-10 backdrop-blur-sm font-mono">
              <th className="py-2.5 px-3">Combat Status</th>
              <th className="py-2.5 px-3">Instance / Callout</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Node</th>
              <th className="py-2.5 px-3">CPU</th>
              <th className="py-2.5 px-3">Memory</th>
              <th className="py-2.5 px-3">Network / IP</th>
              <th className="py-2.5 px-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
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
                let typeBadgeClass = 'bg-slate-800 text-slate-300';
                if (item.type === 'docker') typeBadgeClass = 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/40';
                if (item.type === 'lxc') typeBadgeClass = 'bg-amber-950/70 text-amber-300 border border-amber-800/40';
                if (item.type === 'qemu') typeBadgeClass = 'bg-blue-950/70 text-blue-300 border border-blue-800/40';

                return (
                  <tr
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      sfx.playClick();
                      setInspectItem(item);
                    }}
                    className="hover:bg-cyan-950/20 cursor-pointer transition-colors group"
                  >
                    {/* Status */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-sans">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRunning ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
                          }`}
                        />
                        <span className={`text-[11px] font-mono uppercase font-bold ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>

                    {/* Name & ID */}
                    <td className="py-2 px-3 font-sans font-medium text-slate-100 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="group-hover:text-cyan-300 transition-colors font-semibold">
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
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${typeBadgeClass}`}>
                        {item.type === 'qemu' ? 'VM (QEMU)' : item.type.toUpperCase()}
                      </span>
                    </td>

                    {/* Node */}
                    <td className="py-2 px-3 text-slate-400 text-xs whitespace-nowrap">
                      {item.node}
                    </td>

                    {/* CPU */}
                    <td className="py-2 px-3 text-slate-200 whitespace-nowrap font-bold">
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

                    {/* Actions */}
                    <td className="py-2 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRestart(item)}
                        disabled={restarting}
                        title="Quick restart container"
                        className="px-2 py-1 rounded bg-black/60 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 font-mono"
                      >
                        <RotateCcw className={`w-3 h-3 ${restarting ? 'animate-spin text-cyan-400' : ''}`} />
                        <span>RESTART</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Interactive Detail Inspector Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0c101d] border border-cyan-500/40 rounded-lg p-5 shadow-2xl flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-100 text-sm">{inspectItem.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 uppercase font-bold">
                  {inspectItem.type}
                </span>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-2 text-slate-300">
              <div className="grid grid-cols-2 gap-2 p-2 rounded bg-black/40 border border-slate-800">
                <div><span className="text-slate-500">Node:</span> {inspectItem.node}</div>
                <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400 uppercase font-bold">{inspectItem.status}</span></div>
                <div><span className="text-slate-500">Network / IP:</span> {inspectItem.ip || inspectItem.ports || 'Internal'}</div>
                <div><span className="text-slate-500">Uptime:</span> {String(inspectItem.uptime ?? 'Active')}</div>
              </div>

              {inspectItem.image && (
                <div className="p-2 rounded bg-black/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">IMAGE TARGET:</span>
                  <span className="text-cyan-300 break-all">{inspectItem.image}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  handleRestart(inspectItem);
                  setInspectItem(null);
                }}
                className="px-3 py-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                RELOAD INSTANCE
              </button>

              <button
                onClick={() => setInspectItem(null)}
                className="px-3 py-1.5 rounded bg-black/60 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
