import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError('');
    setLoading(true);

    try {
      await api.login(password);
      onSuccess();
    } catch (err: any) {
      setError('Invalid master password. Please verify your DASHBOARD_PASSWORD in .env');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-canvas-surface border border-canvas-border rounded-lg shadow-2xl p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              SaintDash Node Guard
            </h2>
            <p className="text-xs text-slate-400">
              Private Homelab Proxmox Access
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Enter your dashboard master password to access Proxmox telemetry and control nodes.
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Master Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full bg-canvas-subtle border border-canvas-border rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Unlock Dashboard'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-canvas-border text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" />
            Zero-Trust Local Tunnel
          </span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
