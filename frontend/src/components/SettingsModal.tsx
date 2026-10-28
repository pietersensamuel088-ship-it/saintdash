import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Key, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveProxmox: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isLiveProxmox,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; version?: string } | null>(null);

  if (!isOpen) return null;

  const handleTestProxmox = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testProxmoxConnection();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-canvas-surface border border-canvas-border rounded-lg shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              Proxmox &amp; Node Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-canvas-subtle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Indicator */}
        <div className="my-4 p-3 rounded bg-canvas-subtle border border-canvas-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isLiveProxmox ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400'
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-slate-100">
                {isLiveProxmox ? 'Live Proxmox API Active' : 'Simulation / Mock Telemetry Active'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isLiveProxmox
                  ? 'Metrics are streaming directly from your 24/7 Proxmox host'
                  : 'Ready for your Proxmox credentials in .env. Realistic sample metrics currently active.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleTestProxmox}
            disabled={testing}
            className="px-3 py-1.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-medium border border-blue-500/40 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {testResult && (
          <div
            className={`mb-4 p-3 rounded border text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">{testResult.message}</div>
              {testResult.version && (
                <div className="text-[11px] font-mono mt-0.5">PVE Version: {testResult.version}</div>
              )}
            </div>
          </div>
        )}

        {/* Step-by-Step Setup Guide */}
        <div className="flex flex-col gap-3 text-xs text-slate-300">
          <h3 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            How to Connect Your Proxmox Host
          </h3>

          <div className="p-3 bg-canvas-subtle rounded border border-canvas-border space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 flex items-center justify-center font-mono text-[10px]">
                1
              </span>
              Create an API Token in Proxmox VE
            </div>
            <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
              Open your Proxmox web interface (<code className="font-mono text-cyan-300">https://your-laptop-ip:8006</code>) &rarr; Go to{' '}
              <strong>Datacenter &rarr; Permissions &rarr; API Tokens &rarr; Add</strong>.<br />
              Select User (e.g. <code className="font-mono text-slate-200">root@pam</code>), set Token ID to{' '}
              <code className="font-mono text-slate-200">saintdash</code>, and uncheck "Privilege Separation".
            </p>

            <div className="font-semibold text-slate-200 flex items-center gap-2 pt-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 flex items-center justify-center font-mono text-[10px]">
                2
              </span>
              Configure `.env` File
            </div>
            <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
              Copy <code className="font-mono text-slate-200">.env.example</code> to{' '}
              <code className="font-mono text-slate-200">.env</code> in this project and fill in:
            </p>
            <pre className="ml-7 p-2 bg-black/60 rounded border border-canvas-border font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`PROXMOX_HOST=https://192.168.1.xxx:8006
PROXMOX_USER=root@pam
PROXMOX_TOKEN_NAME=saintdash
PROXMOX_TOKEN_VALUE=your-token-uuid-secret-here
PROXMOX_VERIFY_SSL=false`}
            </pre>

            <div className="font-semibold text-slate-200 flex items-center gap-2 pt-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 flex items-center justify-center font-mono text-[10px]">
                3
              </span>
              Deploy on Proxmox Docker Node
            </div>
            <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
              When ready to run permanently on your Proxmox laptop, push this repository to GitHub, clone it onto your Proxmox server or Docker container, and run:
            </p>
            <pre className="ml-7 p-2 bg-black/60 rounded border border-canvas-border font-mono text-[11px] text-emerald-300">
docker compose up -d
            </pre>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-canvas-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-canvas-subtle hover:bg-canvas-hover border border-canvas-border text-xs font-medium text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
