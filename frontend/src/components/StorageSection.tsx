import React from 'react';
import type { StoragePool } from '../types';
import { HardDrive } from 'lucide-react';

interface StorageSectionProps {
  storage: StoragePool[];
}

export const StorageSection: React.FC<StorageSectionProps> = ({ storage }) => {
  return (
    <div className="bg-canvas-surface rounded-md border border-canvas-border p-3 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs uppercase font-semibold tracking-wider text-slate-300">
          Proxmox Storage Pools &amp; Volumes
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {storage.map((pool) => {
          const usedGb = (pool.used / (1024 ** 3)).toFixed(1);
          const totalGb = (pool.total / (1024 ** 3)).toFixed(1);
          const pct = Math.min(100, Math.round((pool.used / Math.max(pool.total, 1)) * 100));

          return (
            <div
              key={pool.storage}
              className="p-3 bg-canvas-subtle rounded border border-canvas-border flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-slate-100">
                    {pool.storage}
                  </span>
                  <span className="text-[10px] font-sans px-1.5 py-0.5 ml-2 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
                    {pool.type}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-300">
                  {pct}% used
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-canvas-surface rounded-full h-2 my-2 overflow-hidden border border-canvas-border">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{usedGb} GiB / {totalGb} GiB</span>
                <span className="text-slate-500 font-sans text-[10px]">Content: {pool.content}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
