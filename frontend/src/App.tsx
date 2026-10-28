import React, { useEffect, useState, useCallback } from 'react';
import { api } from './services/api';
import type {
  ClusterSummary,
  DatabaseMetrics,
  DiscordBot,
  ProxmoxNode,
  RrdTelemetryPoint,
  StoragePool,
  WorkloadItem,
} from './types';
import { Header } from './components/Header';
import { BattleStationBar } from './components/BattleStationBar';
import { OverviewMetrics } from './components/OverviewMetrics';
import { WorkloadTable } from './components/WorkloadTable';
import { TelemetryCharts } from './components/TelemetryCharts';
import { DatabaseSection } from './components/DatabaseSection';
import { StorageSection } from './components/StorageSection';
import { DiscordBotSection } from './components/DiscordBotSection';
import { LoginModal } from './components/LoginModal';
import { SettingsModal } from './components/SettingsModal';
import { sfx } from './utils/audio';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(api.hasToken());
  const [summary, setSummary] = useState<ClusterSummary | null>(null);
  const [nodes, setNodes] = useState<ProxmoxNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('all');
  const [workloads, setWorkloads] = useState<WorkloadItem[]>([]);
  const [rrdData, setRrdData] = useState<RrdTelemetryPoint[]>([]);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [storage, setStorage] = useState<StoragePool[]>([]);
  const [bots, setBots] = useState<DiscordBot[]>([]);
  const [timeframe, setTimeframe] = useState<string>('hour');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'workloads' | 'bots' | 'database' | 'storage'>('workloads');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  // Sync audio toggle with sfx helper
  const handleToggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    sfx.enabled = nextState;
    if (nextState) {
      sfx.playBeep();
    }
  };

  // Listen for 401 events
  useEffect(() => {
    const handleUnauthorized = () => setIsAuthenticated(false);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Fetch all dashboard telemetry
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      const [
        summaryRes,
        nodesRes,
        vmsRes,
        lxcRes,
        dockerRes,
        rrdRes,
        dbRes,
        storageRes,
        botsRes,
      ] = await Promise.allSettled([
        api.getSummary(),
        api.getNodes(),
        api.getVms(selectedNode === 'all' ? undefined : selectedNode),
        api.getLxc(selectedNode === 'all' ? undefined : selectedNode),
        api.getDockerContainers(),
        api.getRrd(selectedNode === 'all' ? 'pve' : selectedNode, timeframe),
        api.getDatabaseMetrics(),
        api.getStorage(selectedNode === 'all' ? 'pve' : selectedNode),
        api.getBots(),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (nodesRes.status === 'fulfilled') setNodes(nodesRes.value);
      if (rrdRes.status === 'fulfilled') setRrdData(rrdRes.value);
      if (dbRes.status === 'fulfilled') setDbMetrics(dbRes.value);
      if (storageRes.status === 'fulfilled') setStorage(storageRes.value);
      if (botsRes.status === 'fulfilled') setBots(botsRes.value);

      // Consolidate workloads
      const allWorkloads: WorkloadItem[] = [];
      if (vmsRes.status === 'fulfilled') allWorkloads.push(...vmsRes.value);
      if (lxcRes.status === 'fulfilled') allWorkloads.push(...lxcRes.value);
      if (dockerRes.status === 'fulfilled') allWorkloads.push(...dockerRes.value);
      setWorkloads(allWorkloads);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, selectedNode, timeframe]);

  // Initial load and auto-refresh interval (every 30 seconds)
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadDashboardData]);

  const handleLock = () => {
    api.clearToken();
    setIsAuthenticated(false);
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Dynamic Background Image with Vignette Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/wallpaper.jpg')`,
        }}
      />
      {/* Dark Tactical Vignette Overlay for Crisp Readability */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#05070d]/85 via-[#080b15]/90 to-[#030408]/96 backdrop-blur-[1.5px]" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Login Modal guard */}
        {!isAuthenticated && (
          <LoginModal onSuccess={() => setIsAuthenticated(true)} />
        )}

        {/* Main Top Header */}
        <Header
          nodes={nodes}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onRefresh={loadDashboardData}
          isRefreshing={isRefreshing}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLock={handleLock}
          isLiveProxmox={summary?.is_live_proxmox ?? false}
        />

        {/* Main Dashboard Canvas */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 flex flex-col gap-4">
          {/* BattleStation RPG Stat Bar */}
          <BattleStationBar
            summary={summary}
            audioEnabled={audioEnabled}
            onToggleAudio={handleToggleAudio}
            botsCount={bots.length}
            onlineBotsCount={bots.filter((b) => b.status === 'online').length}
          />

          {/* Top Section: Overview with Gauges */}
          <OverviewMetrics summary={summary} selectedNode={selectedNode} />

          {/* View Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  sfx.playClick();
                  setActiveTab('workloads');
                }}
                className={`px-3 py-1 rounded text-xs font-bold tracking-wide uppercase font-mono transition-colors ${
                  activeTab === 'workloads'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Workloads ({workloads.length})
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  setActiveTab('bots');
                }}
                className={`px-3 py-1 rounded text-xs font-bold tracking-wide uppercase font-mono transition-colors ${
                  activeTab === 'bots'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Discord Bots ({bots.length})
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  setActiveTab('database');
                }}
                className={`px-3 py-1 rounded text-xs font-bold tracking-wide uppercase font-mono transition-colors ${
                  activeTab === 'database'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Database Matrix
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  setActiveTab('storage');
                }}
                className={`px-3 py-1 rounded text-xs font-bold tracking-wide uppercase font-mono transition-colors ${
                  activeTab === 'storage'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Storage Arrays ({storage.length})
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>SCAN INTERVAL: 30s</span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-bold">NODE TELEMETRY SECURE</span>
            </div>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'workloads' && (
            <WorkloadTable workloads={workloads} selectedNode={selectedNode} />
          )}

          {activeTab === 'bots' && (
            <DiscordBotSection bots={bots} onRefresh={loadDashboardData} />
          )}

          {activeTab === 'database' && (
            <DatabaseSection metrics={dbMetrics} />
          )}

          {activeTab === 'storage' && (
            <StorageSection storage={storage} />
          )}

          {/* Mid Section: Real-Time Telemetry Charts */}
          <TelemetryCharts
            data={rrdData}
            onTimeframeChange={setTimeframe}
            currentTimeframe={timeframe}
          />
        </main>

        {/* Settings & Configuration Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          isLiveProxmox={summary?.is_live_proxmox ?? false}
        />
      </div>
    </div>
  );
};

export default App;
