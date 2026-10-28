import React from 'react';
import type { StoragePool } from '../types';
import { HardDrive } from 'lucide-react';

interface StorageSectionProps {
  storage: StoragePool[];
}

export const StorageSection: React.FC<StorageSectionProps> = ({ storage }) => {
  return (
    <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4 flex flex-col shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-100 font-mono">
          STORAGE ARRAYS &bull; ZFS &amp; LVM DISK POOLS
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
              className="p-3 bg-black/50 rounded-lg border border-slate-800 flex flex-col justify-between hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-slate-100">
                    {pool.storage}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 ml-2 rounded bg-cyan-950/60 text-cyan-300 uppercase font-bold border border-cyan-800/40">
                    {pool.type}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {pct}% UTILIZED
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/60 rounded-full h-2 my-2.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{usedGb} GiB / {totalGb} GiB</span>
                <span className="text-slate-500 font-mono text-[10px]">CONTENT: {pool.content}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
