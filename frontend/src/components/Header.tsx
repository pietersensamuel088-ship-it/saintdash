import React from 'react';
import {
  Server,
  RefreshCw,
  Settings,
  Lock,
  Crosshair,
} from 'lucide-react';
import type { ProxmoxNode } from '../types';
import { sfx } from '../utils/audio';

interface HeaderProps {
  nodes: ProxmoxNode[];
  selectedNode: string;
  onSelectNode: (node: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  onLock: () => void;
  isLiveProxmox: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  nodes,
  selectedNode,
  onSelectNode,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  onLock,
  isLiveProxmox,
}) => {
  return (
    <header className="border-b border-cyan-500/20 bg-[#070a13]/85 sticky top-0 z-30 backdrop-blur-md shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-[#090d18] rounded-[6px] flex items-center justify-center font-black font-mono text-sm text-cyan-400 group-hover:text-emerald-400 transition-colors">
                SD
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#070a13] animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold hover:text-cyan-300">SaintDash</span>
              <span className="text-slate-600">::</span>
              <span className="text-slate-300 font-semibold">Proxmox BattleStation</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-slate-300 tracking-wider font-mono flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-400" /> COMMAND DECK OS v1.0
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  isLiveProxmox
                    ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                    : 'bg-amber-950/60 border-amber-800/40 text-amber-400'
                }`}
              >
                {isLiveProxmox ? 'ONLINE &bull; LIVE PVE' : 'SIMULATION MODE'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Datasource Tag */}
          <div className="hidden sm:flex items-center rounded bg-black/40 border border-slate-800 text-xs px-2.5 py-1 font-mono">
            <span className="text-slate-500 mr-1.5">SOURCE:</span>
            <span className="text-cyan-400 font-bold">PVE CLUSTER</span>
          </div>

          {/* Node Selector */}
          <div className="flex items-center rounded bg-black/40 border border-slate-800 text-xs px-2.5 py-1 font-mono">
            <Server className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            <span className="text-slate-500 mr-1.5">NODE:</span>
            <select
              value={selectedNode}
              onChange={(e) => {
                sfx.playClick();
                onSelectNode(e.target.value);
              }}
              className="bg-transparent text-slate-100 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0b0f1a] text-slate-200">
                All Nodes (Cluster)
              </option>
              {nodes.map((n) => (
                <option key={n.node} value={n.node} className="bg-[#0b0f1a] text-slate-200">
                  {n.node}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              sfx.playRadarScan();
              onRefresh();
            }}
            disabled={isRefreshing}
            title="Scan &amp; Refresh Telemetry"
            className="p-1.5 rounded bg-black/40 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sfx.playClick();
              onOpenSettings();
            }}
            title="Proxmox &amp; Node Settings"
            className="p-1.5 rounded bg-black/40 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Lock / Logout */}
          <button
            onClick={() => {
              sfx.playClick();
              onLock();
            }}
            title="Lock Command Deck"
            className="p-1.5 rounded bg-black/40 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
