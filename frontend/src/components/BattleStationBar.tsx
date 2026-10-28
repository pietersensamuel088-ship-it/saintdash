import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Gauge,
  Trophy,
} from 'lucide-react';
import type { ClusterSummary } from '../types';
import { sfx } from '../utils/audio';

interface BattleStationBarProps {
  summary: ClusterSummary | null;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const BattleStationBar: React.FC<BattleStationBarProps> = ({
  summary,
  audioEnabled,
  onToggleAudio,
}) => {
  const [pingMs, setPingMs] = useState<number>(0.8);
  const [pinging, setPinging] = useState<boolean>(false);

  const hours = summary?.uptime?.hours ?? 9.5;
  
  // Calculate RPG Level & Rank from uptime
  let rankName = 'CADET // LEVEL 1';
  let progressPct = 30;
  if (hours >= 24 && hours < 72) {
    rankName = 'VANGUARD // LEVEL 2';
    progressPct = Math.min(100, Math.round(((hours - 24) / 48) * 100));
  } else if (hours >= 72 && hours < 168) {
    rankName = 'SENTINEL // LEVEL 3';
    progressPct = Math.min(100, Math.round(((hours - 72) / 96) * 100));
  } else if (hours >= 168) {
    rankName = '24/7 DREADNOUGHT // LEVEL 4';
    progressPct = 100;
  } else {
    progressPct = Math.min(100, Math.round((hours / 24) * 100));
  }

  const handleTestPing = async () => {
    sfx.playClick();
    setPinging(true);
    const start = performance.now();
    try {
      await fetch('/api/auth/verify', { credentials: 'omit' }).catch(() => {});
      const elapsed = Math.round(performance.now() - start);
      setPingMs(Math.max(1, elapsed));
      sfx.playBeep();
    } catch {
      setPingMs(1.2);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="bg-[#0b0f1a]/80 backdrop-blur-md border border-cyan-500/20 rounded-lg p-3 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-200">
      {/* Operator & Rank XP */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-[13px] tracking-wide font-sans">
              SAM // COMMANDER
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold uppercase">
              {rankName}
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400">UPTIME XP</span>
            <div className="w-28 sm:w-36 bg-black/60 rounded-full h-1.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-cyan-400">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Stats Row (HP / Energy / Thermals / Ping) */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center w-full md:w-auto text-[11px]">
        {/* HP Bar (RAM) */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-0.5">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldAlert className="w-3 h-3" /> HP (RAM)
            </span>
            <span>{summary ? `${summary.ram.used_gib} / ${summary.ram.total_gib} GB` : '10.4 / 15.4 GB'}</span>
          </div>
          <div className="w-24 sm:w-28 bg-black/60 rounded h-2 overflow-hidden border border-emerald-900/60">
            <div
              className="bg-emerald-400 h-full rounded transition-all duration-300"
              style={{ width: `${summary ? summary.ram.usage_pct : 68}%` }}
            />
          </div>
        </div>

        {/* Stamina / Energy Bar (CPU) */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-0.5">
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Zap className="w-3 h-3" /> ENERGY (CPU)
            </span>
            <span>{summary ? `${summary.cpu.usage_pct}%` : '4.2%'}</span>
          </div>
          <div className="w-24 sm:w-28 bg-black/60 rounded h-2 overflow-hidden border border-cyan-900/60">
            <div
              className="bg-cyan-400 h-full rounded transition-all duration-300"
              style={{ width: `${summary ? summary.cpu.usage_pct : 5}%` }}
            />
          </div>
        </div>

        {/* Thermals */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-slate-800">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <div className="flex flex-col text-[10px]">
            <span className="text-slate-400">CORE THERMAL</span>
            <span className="font-bold text-amber-300 font-mono">46.5°C // 1850 RPM</span>
          </div>
        </div>

        {/* Live Ping Button */}
        <button
          onClick={handleTestPing}
          disabled={pinging}
          title="Click to ping Proxmox server"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 transition-colors text-[10px] text-slate-300"
        >
          <Gauge className={`w-3.5 h-3.5 ${pinging ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
          <span className="text-slate-400">PING:</span>
          <span className="font-bold text-emerald-400 font-mono">{pingMs}ms</span>
        </button>
      </div>

      {/* Audio SFX Toggle */}
      <button
        onClick={onToggleAudio}
        title={audioEnabled ? 'Mute HUD Audio' : 'Enable HUD Audio'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-colors text-[11px] ${
          audioEnabled
            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
            : 'bg-black/40 border-slate-800 text-slate-500 hover:text-slate-300'
        }`}
      >
        {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{audioEnabled ? 'HUD SFX: ON' : 'HUD SFX: OFF'}</span>
      </button>
    </div>
  );
};
