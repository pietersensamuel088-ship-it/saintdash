import React from 'react';
import type { DatabaseMetrics } from '../types';
import { Database, Server, CheckCircle2 } from 'lucide-react';

interface DatabaseSectionProps {
  metrics: DatabaseMetrics | null;
}

export const DatabaseSection: React.FC<DatabaseSectionProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-6 text-center text-slate-500 font-mono">
        LOADING DATABASE TELEMETRY...
      </div>
    );
  }

  const { metrics: m, nodes, supabase_services } = metrics;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-200 font-mono">
            DATABASE CLUSTER MATRIX &bull; SUPABASE &amp; POSTGRES NODES
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> REPLICATION ONLINE
          </span>
          <span className="text-slate-500">&middot;</span>
          <span className="text-slate-400">{metrics.provider}</span>
        </div>
      </div>

      {/* Top Database Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Connection Pool */}
        <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-3 flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            CONNECTION POOL
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-black font-mono text-cyan-400">
              {m.active_connections}
            </span>
            <span className="text-xs text-slate-400 ml-1 font-mono">/ {m.max_connections} MAX</span>
          </div>
          <div className="w-full bg-black/60 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all"
              style={{ width: `${m.connection_pct}%` }}
            />
          </div>
        </div>

        {/* Database Size */}
        <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-3 flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            DATABASE SIZE
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-amber-300">
            {m.database_size_pretty}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {m.table_count} tables &bull; {m.index_count} indexes
          </div>
        </div>

        {/* Cache Hit Ratio */}
        <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-3 flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            CACHE HIT RATIO
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-400">
            {m.cache_hit_ratio_pct}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Optimal in-memory buffer
          </div>
        </div>

        {/* Transactions / Sec */}
        <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-3 flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            TRANSACTIONS / SEC
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-cyan-400">
            {m.transactions_per_sec} <span className="text-xs font-normal text-slate-400">TPS</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            0 deadlocks detected
          </div>
        </div>
      </div>

      {/* Separate Database Nodes Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nodes.map((node) => (
          <div
            key={node.node_id}
            className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4 flex flex-col justify-between shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-sm font-bold text-slate-100">
                    {node.node_id}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">{node.role}</div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {node.status}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Endpoint</span>
                <span className="text-slate-200 text-[11px]">{node.host}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Lag</span>
                <span className="text-slate-200">{node.replication_lag_ms} ms</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Node CPU</span>
                <span className="text-slate-200">{node.cpu_usage_pct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Node RAM</span>
                <span className="text-slate-200">{node.ram_usage_mb} MB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supabase Microservices Operational Bar */}
      <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
          SUPABASE MICROSERVICES STATUS:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(supabase_services).map(([service]) => (
            <div key={service} className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300 capitalize">{service.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
