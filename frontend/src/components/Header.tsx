import React from 'react';
import {
  Server,
  RefreshCw,
  Settings,
  Lock,
} from 'lucide-react';
import type { ProxmoxNode } from '../types';

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
    <header className="border-b border-canvas-border bg-canvas-surface/90 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold font-mono text-sm shadow-md">
            SD
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
              <span className="hover:text-slate-200 cursor-pointer">SaintDash</span>
              <span>/</span>
              <span className="hover:text-slate-200 cursor-pointer">Proxmox VE</span>
              <span>/</span>
              <span className="text-slate-200 font-semibold">Nodes</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-slate-100 tracking-wide font-mono">
                TELEMETRY NODE MONITOR
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  isLiveProxmox
                    ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400'
                    : 'bg-amber-950/60 border-amber-800/40 text-amber-400'
                }`}
              >
                {isLiveProxmox ? 'LIVE API' : 'SIMULATION'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar (matching screenshot datasource / resolution / node bar) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Datasource Tag */}
          <div className="hidden sm:flex items-center rounded bg-canvas-subtle border border-canvas-border text-xs px-2.5 py-1">
            <span className="text-slate-400 mr-1.5">datasource:</span>
            <span className="font-mono text-cyan-300 font-semibold">Proxmox VE</span>
          </div>

          {/* Node Selector */}
          <div className="flex items-center rounded bg-canvas-subtle border border-canvas-border text-xs px-2.5 py-1">
            <Server className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <span className="text-slate-400 mr-1.5">node:</span>
            <select
              value={selectedNode}
              onChange={(e) => onSelectNode(e.target.value)}
              className="bg-transparent text-slate-200 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-canvas-surface text-slate-200">
                All Nodes
              </option>
              {nodes.map((n) => (
                <option key={n.node} value={n.node} className="bg-canvas-surface text-slate-200">
                  {n.node}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh metrics now"
            className="p-1.5 rounded bg-canvas-subtle hover:bg-canvas-hover border border-canvas-border text-slate-300 hover:text-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Proxmox & Node Settings"
            className="p-1.5 rounded bg-canvas-subtle hover:bg-canvas-hover border border-canvas-border text-slate-300 hover:text-slate-100 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Lock / Logout */}
          <button
            onClick={onLock}
            title="Lock session"
            className="p-1.5 rounded bg-canvas-subtle hover:bg-canvas-hover border border-canvas-border text-slate-300 hover:text-rose-400 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
