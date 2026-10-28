import React, { useEffect, useState, useCallback } from 'react';
import { api } from './services/api';
import type {
  ClusterSummary,
  DatabaseMetrics,
  ProxmoxNode,
  RrdTelemetryPoint,
  StoragePool,
  WorkloadItem,
} from './types';
import { Header } from './components/Header';
import { OverviewMetrics } from './components/OverviewMetrics';
import { WorkloadTable } from './components/WorkloadTable';
import { TelemetryCharts } from './components/TelemetryCharts';
import { DatabaseSection } from './components/DatabaseSection';
import { StorageSection } from './components/StorageSection';
import { LoginModal } from './components/LoginModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(api.hasToken());
  const [summary, setSummary] = useState<ClusterSummary | null>(null);
  const [nodes, setNodes] = useState<ProxmoxNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('all');
  const [workloads, setWorkloads] = useState<WorkloadItem[]>([]);
  const [rrdData, setRrdData] = useState<RrdTelemetryPoint[]>([]);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [storage, setStorage] = useState<StoragePool[]>([]);
  const [timeframe, setTimeframe] = useState<string>('hour');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'workloads' | 'database' | 'storage'>('workloads');

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
      ] = await Promise.allSettled([
        api.getSummary(),
        api.getNodes(),
        api.getVms(selectedNode === 'all' ? undefined : selectedNode),
        api.getLxc(selectedNode === 'all' ? undefined : selectedNode),
        api.getDockerContainers(),
        api.getRrd(selectedNode === 'all' ? 'pve' : selectedNode, timeframe),
        api.getDatabaseMetrics(),
        api.getStorage(selectedNode === 'all' ? 'pve' : selectedNode),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (nodesRes.status === 'fulfilled') setNodes(nodesRes.value);
      if (rrdRes.status === 'fulfilled') setRrdData(rrdRes.value);
      if (dbRes.status === 'fulfilled') setDbMetrics(dbRes.value);
      if (storageRes.status === 'fulfilled') setStorage(storageRes.value);

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
    <div className="min-h-screen bg-canvas text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
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
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 flex flex-col gap-5">
        {/* Top Section: Overview with Gauges */}
        <OverviewMetrics summary={summary} selectedNode={selectedNode} />

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-canvas-border pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('workloads')}
              className={`px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase transition-colors ${
                activeTab === 'workloads'
                  ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Workloads &amp; Pods ({workloads.length})
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase transition-colors ${
                activeTab === 'database'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Database &amp; Node Cluster
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase transition-colors ${
                activeTab === 'storage'
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Storage Volumes ({storage.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>Auto-poll: 30s</span>
            <span>&middot;</span>
            <span className="text-emerald-400">Node Link Active</span>
          </div>
        </div>

        {/* Active Tab Panel */}
        {activeTab === 'workloads' && (
          <WorkloadTable workloads={workloads} selectedNode={selectedNode} />
        )}

        {activeTab === 'database' && (
          <DatabaseSection metrics={dbMetrics} />
        )}

        {activeTab === 'storage' && (
          <StorageSection storage={storage} />
        )}

        {/* Mid Section: Real-Time Telemetry Charts (always visible like Grafana dashboard) */}
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
  );
};

export default App;
